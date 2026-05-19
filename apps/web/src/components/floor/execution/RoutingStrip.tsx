import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ExecutionWorkflowStep, WorkOrderExecutionSnapshot } from './types';

interface RoutingStripProps {
  snapshot: WorkOrderExecutionSnapshot;
  checkedStepItemIds: string[];
  ncrWatchCount?: number;
  onToggleStepItem: (itemId: string) => void;
  onSelectStep: (step: ExecutionWorkflowStep) => void;
}

export function RoutingStrip({
  snapshot,
  checkedStepItemIds,
  ncrWatchCount = 0,
  onToggleStepItem,
  onSelectStep,
}: RoutingStripProps) {
  const [fullOpen, setFullOpen] = useState(false);
  const totalEstimate = snapshot.timeSummary.setupEstMin + snapshot.timeSummary.runEstMin + snapshot.timeSummary.firstOffEstMin;

  return (
    <Card className="rounded-lg border-[var(--neutral-200)] bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-medium text-[var(--neutral-900)]">Routing</h3>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)] tabular-nums">
          {snapshot.routing.length} ops · {(totalEstimate / 60).toFixed(1)} h scheduled
        </span>
      </div>

      {ncrWatchCount > 0 ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--mw-warning,#FACC15)] bg-[var(--mw-warning,#FACC15)]/12 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-800)]">
          <AlertTriangle className="h-3.5 w-3.5" />
          {ncrWatchCount} watch item{ncrWatchCount === 1 ? '' : 's'} from prior shift
        </div>
      ) : null}

      <ol className="mt-4 space-y-2">
        {snapshot.routing.map((step) => (
          <RoutingRow
            key={step.id}
            step={step}
            machineLabel={snapshot.machineName}
            checkedStepItemIds={checkedStepItemIds}
            onToggleStepItem={onToggleStepItem}
            onSelectStep={onSelectStep}
          />
        ))}
      </ol>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3 h-11 w-full justify-center text-sm font-medium text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]"
        onClick={() => setFullOpen(true)}
      >
        View full routing
      </Button>

      <Dialog open={fullOpen} onOpenChange={setFullOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Full routing — {snapshot.woNumber}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {snapshot.routing.map((step) => (
              <div
                key={step.id}
                className="rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[var(--neutral-900)]">
                    Step {step.stepNumber}: {step.title}
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                    {step.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--neutral-600)]">{step.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function RoutingRow({
  step,
  machineLabel,
  checkedStepItemIds,
  onToggleStepItem,
  onSelectStep,
}: {
  step: ExecutionWorkflowStep;
  machineLabel: string;
  checkedStepItemIds: string[];
  onToggleStepItem: (itemId: string) => void;
  onSelectStep: (step: ExecutionWorkflowStep) => void;
}) {
  if (step.status === 'previous') {
    return (
      <li>
        <button
          type="button"
          onClick={() => onSelectStep(step)}
          className="flex w-full items-center gap-3 rounded-md bg-[var(--neutral-100)] px-3 py-2 text-left hover:bg-[var(--neutral-200)]"
        >
          <CheckCircle2 className="h-4 w-4 text-[var(--mw-success)]" />
          <span className="flex-1 truncate text-sm text-[var(--neutral-600)]">
            {step.stepNumber}. {step.title}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            Done
          </span>
        </button>
      </li>
    );
  }

  if (step.status === 'next') {
    return (
      <li>
        <button
          type="button"
          onClick={() => onSelectStep(step)}
          className="flex w-full items-center gap-3 rounded-md bg-card px-3 py-2 text-left hover:bg-[var(--neutral-100)]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--neutral-300)] text-[11px] font-medium text-[var(--neutral-500)] tabular-nums">
            {step.stepNumber}
          </span>
          <span className="flex-1 truncate text-sm text-[var(--neutral-700)]">{step.title}</span>
          <span className="rounded-full border border-[var(--neutral-200)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            {machineLabel}
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="rounded-md border border-[var(--mw-yellow-400)] border-l-4 border-l-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] p-4 text-[var(--mw-mirage)] dark:bg-[var(--neutral-200)] dark:text-[var(--neutral-900)]">
      <button
        type="button"
        onClick={() => onSelectStep(step)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[11px] font-medium text-[var(--mw-mirage)] tabular-nums">
          {step.stepNumber}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {step.title}
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--mw-mirage)]/70 dark:text-[var(--neutral-700)]">
            {machineLabel}
          </div>
        </div>
        <ChevronRight className="h-4 w-4" />
      </button>

      {step.checklist.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {step.checklist.map((item) => {
            const checked =
              item.completed || checkedStepItemIds.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onToggleStepItem(item.id)}
                  className="flex w-full items-center gap-3 rounded-sm bg-white/70 px-2 py-2 text-left text-sm text-[var(--mw-mirage)] hover:bg-white dark:bg-[var(--neutral-200)] dark:text-[#1A2732] dark:hover:bg-[var(--neutral-900)]"
                >
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border ${
                      checked
                        ? 'border-[var(--mw-success)] bg-[var(--mw-success)] text-white'
                        : 'border-[var(--mw-mirage)]/30 bg-white dark:border-[#1A2732]/30'
                    }`}
                  >
                    {checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span
                    className={
                      checked
                        ? 'text-[var(--mw-mirage)]/50 line-through dark:text-[#1A2732]/60'
                        : ''
                    }
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
