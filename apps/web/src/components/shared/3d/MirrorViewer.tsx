/**
 * MirrorViewer — shared 3D/2D viewer used by every MirrorView surface in the
 * app (sell/buy/plan/make/control product detail, plan job MirrorView,
 * shop-floor reference panel, manufacturing order detail).
 *
 * Behaviour:
 * - Subscribes to `api.mirrorview.getActiveModel` reactively (Convex push). As
 *   an uploaded file moves through uploading → translating → success, the
 *   viewer's UI updates without any client polling.
 * - When the row reaches `success`, mounts the Autodesk APS Viewer v7 against
 *   the URN. APS handles ~80 native CAD/BIM formats.
 * - Falls back to the bundled GLB demo asset when no row exists yet (so the
 *   demo never shows a blank screen) — unless `enableUpload` is set, in which
 *   case the "no model" state is a drop affordance instead of a GLB.
 *
 * When `enableUpload` is set: a STEP/DWG/RVT/etc. dragged onto the viewer is
 * uploaded via the same APS pipeline the ProductDetail dropzone uses. The
 * reactive `getActiveModel` query picks up the new row and drives the UI from
 * uploading → translating → success → APS render — no extra plumbing needed.
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { toast } from 'sonner';

import { GlbViewer, type GlbViewerApi } from './GlbViewer';
import { MirrorViewToolbar } from './MirrorViewToolbar';
import {
  mirrorViewerService,
  type MirrorViewerService,
  type ViewerContext,
} from '@/services/mirrorViewer';
import { uploadCadFile, nextRevisionLabel } from '@/services/mirrorViewerUpload';
import { CadUploadConfirmDialog } from './CadUploadConfirmDialog';
import {
  ensureApsInitialised,
  type ApsViewerInstance,
} from './aps-loader';
import { cn } from '@/components/ui/utils';

const REMOTE_MODE = import.meta.env.VITE_DATA_SOURCE === 'remote';

export interface MirrorViewerSource {
  urn?: string;
  glbSrc?: string;
}

export interface MirrorViewerProps {
  /** Explicit source overrides the active-model query (escape hatch). */
  source?: MirrorViewerSource;
  context: ViewerContext;
  density?: 'full' | 'compact';
  className?: string;
  service?: MirrorViewerService;
  hideToolbar?: boolean;
  /**
   * Accept drag-and-drop CAD uploads scoped to `context`. When set, the
   * "no model" state becomes a drop affordance instead of the demo GLB
   * fallback. Off by default so surfaces that should stay read-only
   * (operator shop-floor) don't accidentally accept uploads.
   */
  enableUpload?: boolean;
}

type Mode = 'loading' | 'uploading' | 'translating' | 'aps' | 'glb' | 'empty' | 'failed';

const DEMO_GLB = '/models/diff.glb';

export function MirrorViewer({
  source,
  context,
  density = 'full',
  className,
  service = mirrorViewerService,
  hideToolbar = false,
  enableUpload = false,
}: MirrorViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apsRef = useRef<ApsViewerInstance | null>(null);
  const glbApiRef = useRef<GlbViewerApi | null>(null);

  // Reactive subscription to the active model for this owner. Skipped when:
  //  - caller passed an explicit source (escape hatch)
  //  - app is in mock mode (no Convex wired)
  const activeModel = useQuery(
    api.mirrorview.getActiveModel,
    !source && REMOTE_MODE
      ? { ownerType: context.ownerType, ownerId: context.ownerId }
      : 'skip',
  );

  // Full upload history for this owner — used to auto-bump the revision label
  // in the upload confirm dialog. Only queried when uploads are enabled.
  const uploadedModels = useQuery(
    api.mirrorview.listModels,
    enableUpload && REMOTE_MODE
      ? { ownerType: context.ownerType, ownerId: context.ownerId }
      : 'skip',
  );

  const [mode, setMode] = useState<Mode>('loading');
  const [resolvedSource, setResolvedSource] = useState<MirrorViewerSource | null>(
    source ?? null,
  );
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  // Pending file from a drop — opens the confirm dialog. Null while idle.
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Resolve the source. Order of precedence:
  //   1. explicit `source` prop
  //   2. live Convex row (`activeModel`)
  //   3. legacy mock service (for non-remote demo runs)
  useEffect(() => {
    if (source) {
      setResolvedSource(source);
      setMode(source.urn ? 'loading' : source.glbSrc ? 'glb' : 'empty');
      return;
    }

    if (REMOTE_MODE) {
      if (activeModel === undefined) return; // query still loading
      if (activeModel === null) {
        // No upload yet for this owner. If the surface accepts uploads, prefer
        // the drop-affordance empty state over a misleading demo-GLB stand-in.
        if (enableUpload) {
          setResolvedSource(null);
          setMode('empty');
        } else {
          setResolvedSource({ glbSrc: DEMO_GLB });
          setMode('glb');
        }
        return;
      }
      switch (activeModel.status) {
        case 'uploading':
          setMode('uploading');
          setProgressLabel(activeModel.fileName);
          return;
        case 'translating':
          setMode('translating');
          setProgressLabel(`${activeModel.fileName} · ${activeModel.progress}%`);
          return;
        case 'failed':
          setProgressLabel(activeModel.error ?? 'Translation failed');
          setMode('failed');
          return;
        case 'success':
          setResolvedSource({ urn: activeModel.urn, glbSrc: DEMO_GLB });
          setMode('loading');
          return;
      }
      return;
    }

    // Mock-mode fallback (no Convex). Service returns a GLB demo asset.
    let cancelled = false;
    void service.resolveSource(context).then((s) => {
      if (cancelled) return;
      setResolvedSource(s);
      setMode(s?.urn ? 'loading' : s?.glbSrc ? 'glb' : 'empty');
    });
    return () => {
      cancelled = true;
    };
  }, [source, activeModel, service, context, enableUpload]);

  // Mount the APS viewer when we have a URN in hand.
  //
  // Depends on `resolvedSource` (and `service`) ONLY — not on `mode`. When
  // Document.load succeeds we flip mode to 'aps', and if `mode` were in this
  // dep array the cleanup would run and call `finish()` on the just-loaded
  // viewer. Mode is just a render-state hint; the viewer lives until the URN
  // changes or the component unmounts.
  useEffect(() => {
    if (!resolvedSource?.urn) return;

    let cancelled = false;
    void (async () => {
      const tokenResult = await service.getToken();
      if (cancelled) return;
      if (!tokenResult.token) {
        setMode(resolvedSource.glbSrc ? 'glb' : 'empty');
        return;
      }
      try {
        const Viewing = await ensureApsInitialised((cb) => {
          void service.getToken().then((r) => {
            if (r.token) cb(r.token, r.expiresIn);
          });
        });
        if (cancelled || !containerRef.current) return;

        const viewer = new Viewing.GuiViewer3D(containerRef.current, {
          theme: 'light-theme',
        });
        viewer.start();
        viewer.setTheme('light-theme');
        apsRef.current = viewer;

        const urnPrefixed = resolvedSource.urn!.startsWith('urn:')
          ? resolvedSource.urn!
          : `urn:${resolvedSource.urn!}`;

        Viewing.Document.load(
          urnPrefixed,
          (doc) => {
            if (cancelled) return;
            const viewable = doc.getRoot().getDefaultGeometry();
            setMode('aps');
            // loadDocumentNode is async — the canvas mounts immediately but
            // the geometry only paints after this promise resolves. STEP files
            // often translate with origins far from world-zero, so the default
            // camera lands on empty space; fit to view once geometry lands.
            void viewer
              .loadDocumentNode(doc, viewable)
              .then(() => {
                if (cancelled) return;
                try {
                  viewer.fitToView();
                } catch {
                  // some 2D viewables don't support fitToView — fall through
                }
              })
              .catch((err) => {
                if (cancelled) return;
                console.warn('[MirrorViewer] loadDocumentNode failed', err);
                setMode(resolvedSource.glbSrc ? 'glb' : 'empty');
              });
          },
          (errorCode, message) => {
            if (cancelled) return;
            console.warn('[MirrorViewer] APS Document.load failed', errorCode, message);
            setMode(resolvedSource.glbSrc ? 'glb' : 'empty');
          },
        );
      } catch {
        if (!cancelled) setMode(resolvedSource.glbSrc ? 'glb' : 'empty');
      }
    })();

    return () => {
      cancelled = true;
      if (apsRef.current) {
        try {
          apsRef.current.finish();
        } catch {
          // ignore disposal errors
        }
        apsRef.current = null;
      }
    };
  }, [resolvedSource, service]);

  const handleReset = () => {
    if (mode === 'aps' && apsRef.current) {
      apsRef.current.navigation.setRequestHomeView(true);
    } else {
      glbApiRef.current?.reset();
    }
  };

  const handleMode = (m: 'pan' | 'orbit') => {
    if (mode === 'aps' && apsRef.current) {
      apsRef.current.setActiveNavigationTool(m);
    } else {
      glbApiRef.current?.setMode(m);
    }
  };

  // Drag-drop upload handlers. Active only when `enableUpload` is set. Calls
  // the same Convex pipeline (startUpload → S3 PUT → finishUpload) that
  // ProductDetail's surrounding dropzone uses; reactive query picks up the
  // new row and drives the UI from uploading → translating → success → APS.
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableUpload) return;
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    if (!enableUpload) return;
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableUpload) return;
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files)[0];
    if (!file) return;
    // Open the confirm dialog instead of uploading immediately — gives the
    // engineer a chance to override the auto-bumped revision label and add
    // a 1-line "what changed" note.
    setPendingFile(file);
  };

  const suggestedRevisionLabel = nextRevisionLabel(
    (uploadedModels ?? []).map((m) => m.revisionLabel),
  );

  const handleConfirmUpload = async (value: {
    revisionLabel: string;
    revisionNotes: string;
  }) => {
    const file = pendingFile;
    setPendingFile(null);
    if (!file) return;
    const toastId = toast.loading(`Uploading ${file.name} as ${value.revisionLabel}…`);
    try {
      await uploadCadFile(
        file,
        context,
        (p) => {
          if (p.phase === 'uploading') {
            toast.loading(
              `Uploading ${file.name} · ${value.revisionLabel} · ${p.percent}%`,
              { id: toastId },
            );
          } else if (p.phase === 'finalizing') {
            toast.loading('Finalising upload…', { id: toastId });
          } else if (p.phase === 'translating') {
            toast.success(
              `Translating ${value.revisionLabel} in Autodesk — viewer will refresh when ready`,
              { id: toastId },
            );
          }
        },
        {
          revisionLabel: value.revisionLabel,
          revisionNotes: value.revisionNotes || undefined,
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: toastId });
    }
  };

  return (
    <div
      className={cn(
        'relative h-full w-full',
        enableUpload &&
          dragOver &&
          'outline-dashed outline-2 outline-offset-[-6px] outline-[var(--mw-yellow-500)]',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* APS mount point — always rendered so the ref exists when init resolves */}
      <div
        ref={containerRef}
        className={cn('absolute inset-0', mode === 'aps' ? 'visible' : 'invisible')}
      />

      {(mode === 'loading' || mode === 'uploading' || mode === 'translating') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--neutral-100)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--neutral-500)]" />
          <span className="text-xs font-medium text-foreground">
            {mode === 'uploading' && 'Uploading to Autodesk…'}
            {mode === 'translating' && 'Translating model…'}
            {mode === 'loading' && 'Loading MirrorView…'}
          </span>
          {progressLabel && (
            <span className="text-[11px] text-[var(--neutral-500)]">
              {progressLabel}
            </span>
          )}
        </div>
      )}

      {mode === 'glb' && resolvedSource?.glbSrc && (
        <GlbViewer
          src={resolvedSource.glbSrc}
          className="absolute inset-0"
          background="#f5f5f5"
          modelColor={0x9aa0a8}
          modelMetalness={0.55}
          modelRoughness={0.5}
          gridColor={[0xd4d4d4, 0xe5e5e5]}
          gridOpacity={0.6}
          onReady={(api) => {
            glbApiRef.current = api;
          }}
        />
      )}

      {mode === 'empty' &&
        (enableUpload ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--neutral-50)]">
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mw-yellow-400)]/15">
                <Upload className="h-8 w-8 text-[var(--mw-mirage)]" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="text-lg font-medium text-foreground sm:text-xl">
                  Drop a CAD file to view it in MirrorView
                </p>
                <p className="max-w-md text-sm text-[var(--neutral-600)]">
                  Supports STEP, DWG, IPT, IAM, SLDPRT, SLDASM, RVT, IGES, STL,
                  GLB, and 70+ other CAD &amp; BIM formats.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--neutral-50)]">
            <p className="text-xs text-[var(--neutral-500)]">No model attached</p>
          </div>
        ))}

      {mode === 'failed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--mw-error)]/5 px-6 text-center">
          <p className="text-xs font-medium text-[var(--mw-error)]">
            Translation failed
          </p>
          {progressLabel && (
            <p className="text-[11px] text-[var(--neutral-500)]">{progressLabel}</p>
          )}
        </div>
      )}

      {/* Our toolbar is only useful for the GLB fallback path. When APS is
          mounted it ships its own complete native toolbar (orbit / pan /
          walk / measure / sections / fit / view-cube) and stacking ours on
          top of it just hides their controls. */}
      {!hideToolbar && mode === 'glb' && (
        <MirrorViewToolbar
          onReset={handleReset}
          onMode={handleMode}
          className={density === 'compact' ? 'bottom-2' : undefined}
        />
      )}

      {enableUpload && (
        <CadUploadConfirmDialog
          file={pendingFile}
          suggestedLabel={suggestedRevisionLabel}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleConfirmUpload}
        />
      )}
    </div>
  );
}
