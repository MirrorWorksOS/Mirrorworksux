import { useMemo, useRef, useState } from 'react';
import { Camera, FileText, Maximize2, Ruler } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MirrorViewer, type MirrorViewerHandle } from '@/components/shared/3d/MirrorViewer';
import { RevDriftBanner } from '@/components/shared/3d/RevDriftBanner';
import { StepViewsControl } from '@/components/shared/3d/StepViewsControl';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { manufacturingOrders } from '@/services/mock/data';
import type { ReferenceView, WorkOrderExecutionSnapshot } from './types';

/** Resolve the product ID for a snapshot's MO number — used by the drift banner. */
function productIdForMo(moNumber: string): string | undefined {
  return manufacturingOrders.find((mo) => mo.moNumber === moNumber)?.productId;
}

type Segment = Exclude<ReferenceView, 'checklist'>;

// NOTE: the segment id stays 'drawing' (internal enum threaded through
// types.ts, snapshot.ts, and the FloorExecutionScreen state machine).
// Only the UI label changes to "MirrorView" per the 2026-05-26 rename.
const SEGMENTS: { id: Segment; label: string; icon: typeof Ruler }[] = [
  { id: 'drawing', label: 'MirrorView', icon: Ruler },
  { id: 'instructions', label: 'Instructions', icon: FileText },
  { id: 'camera', label: 'Camera', icon: Camera },
];

interface ReferencePanelProps {
  snapshot: WorkOrderExecutionSnapshot;
  activeView: Segment;
  onViewChange: (view: Segment) => void;
  /** Kiosk ('route') gets ≥56px touch targets on the viewer toolbar. */
  mode?: 'overlay' | 'route';
}

export function ReferencePanel({
  snapshot,
  activeView,
  onViewChange,
  mode = 'overlay',
}: ReferencePanelProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const reference = snapshot.references[activeView];
  const productId = productIdForMo(snapshot.moNumber);

  // Imperative ref into the inner MirrorViewer — needed by StepViewsControl
  // to restore camera + isolation when the operator picks a saved view.
  const mirrorViewerRef = useRef<MirrorViewerHandle | null>(null);
  // Active model for this work-order surface — drives step-view + drift queries.
  const workOrderContext = useMemo(
    () => ({ ownerType: 'workOrder' as const, ownerId: snapshot.workOrderId }),
    [snapshot.workOrderId],
  );
  const activeModel = useQuery(
    api.mirrorview.getActiveModel,
    import.meta.env.VITE_DATA_SOURCE === 'remote' ? workOrderContext : 'skip',
  );

  return (
    <Card className="rounded-lg border-[var(--neutral-200)] bg-card p-6 shadow-xs">
      {productId && (
        <RevDriftBanner
          pinnedRevisionLabel={snapshot.revision}
          productOwnerId={productId}
          className="mb-4"
        />
      )}
      {activeView === 'drawing' && (
        <StepViewsControl
          modelId={activeModel?._id ?? null}
          viewerRef={mirrorViewerRef}
          // Shop-floor is operator-facing — read-only on capture. Engineers
          // save step views from PlanMirrorViewTab; operators just consume.
          canCapture={false}
          className="mb-3"
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex h-12 items-center gap-1 rounded-full bg-[var(--neutral-100)] p-1">
          {SEGMENTS.map((seg) => {
            const Icon = seg.icon;
            const active = activeView === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => onViewChange(seg.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-card text-[var(--neutral-900)] shadow-xs'
                    : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {seg.label}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-100)] dark:bg-[var(--mw-yellow-400)] dark:text-[#1A2732] dark:hover:bg-[var(--mw-yellow-500)]"
          onClick={() => setFullscreen(true)}
        >
          <Maximize2 className="h-4 w-4" />
          Open full reference
        </Button>
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
          {reference.documentLabel} · {reference.revision}
        </div>
        <h3 className="mt-1 text-lg font-medium text-[var(--neutral-900)]">
          {reference.title}
        </h3>
        <p className="mt-1 text-base text-[var(--neutral-600)]">
          {reference.summary}
        </p>
      </div>

      <ReferenceContent
        view={activeView}
        snapshot={snapshot}
        height="h-[480px]"
        compact={false}
        kiosk={mode === 'route'}
        mirrorViewerRef={mirrorViewerRef}
      />

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{reference.title}</DialogTitle>
          </DialogHeader>
          <ReferenceContent
            view={activeView}
            snapshot={snapshot}
            height="h-[680px]"
            compact={false}
            kiosk={mode === 'route'}
            mirrorViewerRef={mirrorViewerRef}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ReferenceContent({
  view,
  snapshot,
  height,
  kiosk = false,
  mirrorViewerRef,
}: {
  view: Segment;
  snapshot: WorkOrderExecutionSnapshot;
  height: string;
  compact: boolean;
  kiosk?: boolean;
  mirrorViewerRef?: React.Ref<MirrorViewerHandle>;
}) {
  if (view === 'drawing') {
    // Kiosk tablets need gloved-finger targets: scale the floating viewer
    // toolbar buttons (32px by default) up to 56px without touching the
    // shared MirrorViewToolbar used by office surfaces.
    const kioskToolbarOverrides = kiosk
      ? '[&_[role=toolbar]_button]:min-h-14 [&_[role=toolbar]_button]:min-w-14 [&_[role=toolbar]_button_svg]:h-6 [&_[role=toolbar]_button_svg]:w-6'
      : '';
    return (
      <div
        className={`relative mt-5 ${height} overflow-hidden rounded-md border border-[var(--neutral-200)] bg-card ${kioskToolbarOverrides}`}
      >
        <MirrorViewer
          ref={mirrorViewerRef}
          context={{ ownerType: 'workOrder', ownerId: snapshot.workOrderId }}
          source={{ glbSrc: snapshot.modelSrc }}
          density="compact"
          className="absolute inset-0"
        />
      </div>
    );
  }

  if (view === 'instructions') {
    const reference = snapshot.references.instructions;
    const steps = reference.items ?? [];
    return (
      <div
        className={`relative mt-5 ${height} overflow-hidden rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-100)]`}
      >
        <div className="absolute inset-0 overflow-y-auto p-6">
          <div className="mx-auto max-w-[640px] rounded-md bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              <span>{reference.documentLabel}</span>
              <span>{reference.revision} · Page 1 of 1</span>
            </div>
            <h4 className="mt-3 text-lg font-medium text-[var(--neutral-900)]">
              {reference.title}
            </h4>
            <p className="mt-1 text-base text-[var(--neutral-600)]">{reference.summary}</p>
            <ol className="mt-5 space-y-3">
              {steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[12px] font-medium text-[var(--mw-mirage)] tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-base leading-relaxed text-[var(--neutral-800)]">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-[var(--neutral-200)] pt-4 text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Signed off by Engineering · {reference.revision}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // camera
  const reference = snapshot.references.camera;
  return (
    <div
      className={`relative mt-5 ${height} overflow-hidden rounded-md border border-[var(--neutral-200)] bg-[var(--mw-mirage)]`}
    >
      {reference.previewSrc ? (
        <img
          src={reference.previewSrc}
          alt={reference.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[var(--neutral-300)]">
          Camera offline
        </div>
      )}
      <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--mw-mirage)]/85 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--mw-error)] opacity-70" />
          <span className="relative inline-block h-2 w-2 rounded-full bg-[var(--mw-error)]" />
        </span>
        Live · {snapshot.machineName}
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-[var(--mw-mirage)]/85 px-3 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur">
        720p · 30fps
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-md bg-[var(--mw-mirage)]/85 p-3 text-xs text-[var(--neutral-200)] backdrop-blur">
        Use the camera as a secondary aid. Return to the drawing or instructions before any setup-critical step.
      </div>
    </div>
  );
}
