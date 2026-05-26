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
 *   demo never shows a blank screen).
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

import { GlbViewer, type GlbViewerApi } from './GlbViewer';
import { MirrorViewToolbar } from './MirrorViewToolbar';
import {
  mirrorViewerService,
  type MirrorViewerService,
  type ViewerContext,
} from '@/services/mirrorViewer';
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

  const [mode, setMode] = useState<Mode>('loading');
  const [resolvedSource, setResolvedSource] = useState<MirrorViewerSource | null>(
    source ?? null,
  );
  const [progressLabel, setProgressLabel] = useState<string>('');

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
        setResolvedSource({ glbSrc: DEMO_GLB });
        setMode('glb');
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
  }, [source, activeModel, service, context]);

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

  return (
    <div className={cn('relative h-full w-full', className)}>
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

      {mode === 'empty' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--neutral-50)]">
          <p className="text-xs text-[var(--neutral-500)]">No model attached</p>
        </div>
      )}

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

      {!hideToolbar &&
        mode !== 'loading' &&
        mode !== 'uploading' &&
        mode !== 'translating' &&
        mode !== 'empty' &&
        mode !== 'failed' && (
          <MirrorViewToolbar
            onReset={handleReset}
            onMode={handleMode}
            className={density === 'compact' ? 'bottom-2' : undefined}
          />
        )}
    </div>
  );
}
