import { useState } from 'react';
import { Camera, FileText, Maximize2, Ruler } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExecutionModelViewer } from './ExecutionModelViewer';
import type { ReferenceView, WorkOrderExecutionSnapshot } from './types';

type Segment = Exclude<ReferenceView, 'checklist'>;

const SEGMENTS: { id: Segment; label: string; icon: typeof Ruler }[] = [
  { id: 'drawing', label: 'Drawing', icon: Ruler },
  { id: 'instructions', label: 'Instructions', icon: FileText },
  { id: 'camera', label: 'Camera', icon: Camera },
];

interface ReferencePanelProps {
  snapshot: WorkOrderExecutionSnapshot;
  activeView: Segment;
  onViewChange: (view: Segment) => void;
}

export function ReferencePanel({
  snapshot,
  activeView,
  onViewChange,
}: ReferencePanelProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const reference = snapshot.references[activeView];

  return (
    <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-xs">
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
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
          {reference.documentLabel} · {reference.revision}
        </div>
        <h3 className="mt-1 text-lg font-medium text-[var(--neutral-900)]">
          {reference.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--neutral-600)]">
          {reference.summary}
        </p>
      </div>

      <ReferenceContent
        view={activeView}
        snapshot={snapshot}
        height="h-[480px]"
        compact={false}
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
}: {
  view: Segment;
  snapshot: WorkOrderExecutionSnapshot;
  height: string;
  compact: boolean;
}) {
  if (view === 'drawing') {
    return (
      <div
        className={`relative mt-5 ${height} overflow-hidden rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-card`}
      >
        <ExecutionModelViewer src={snapshot.modelSrc} className="absolute inset-0" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-card/85 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-600)] backdrop-blur">
          Drag to rotate · Auto-spin
        </div>
      </div>
    );
  }

  if (view === 'instructions') {
    const reference = snapshot.references.instructions;
    const steps = reference.items ?? [];
    return (
      <div
        className={`relative mt-5 ${height} overflow-hidden rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)]`}
      >
        <div className="absolute inset-0 overflow-y-auto p-6">
          <div className="mx-auto max-w-[640px] rounded-[var(--shape-md)] bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              <span>{reference.documentLabel}</span>
              <span>{reference.revision} · Page 1 of 1</span>
            </div>
            <h4 className="mt-3 text-lg font-medium text-[var(--neutral-900)]">
              {reference.title}
            </h4>
            <p className="mt-1 text-sm text-[var(--neutral-600)]">{reference.summary}</p>
            <ol className="mt-5 space-y-3">
              {steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[12px] font-medium text-[var(--mw-mirage)] tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-[var(--neutral-800)]">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-[var(--neutral-200)] pt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
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
      className={`relative mt-5 ${height} overflow-hidden rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--mw-mirage)]`}
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
      <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--mw-mirage)]/85 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--mw-error)] opacity-70" />
          <span className="relative inline-block h-2 w-2 rounded-full bg-[var(--mw-error)]" />
        </span>
        Live · {snapshot.machineName}
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-[var(--mw-mirage)]/85 px-3 py-1.5 text-[11px] font-medium tabular-nums text-white backdrop-blur">
        720p · 30fps
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[var(--shape-md)] bg-[var(--mw-mirage)]/85 p-3 text-xs text-[var(--neutral-200)] backdrop-blur">
        Use the camera as a secondary aid. Return to the drawing or instructions before any setup-critical step.
      </div>
    </div>
  );
}
