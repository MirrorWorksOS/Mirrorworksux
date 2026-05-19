import { CheckCircle2, Circle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ExecutionModelViewer } from './ExecutionModelViewer';
import type { ExecutionWorkflowStep, WorkOrderExecutionSnapshot } from './types';

interface RoutingStepDrawerProps {
  open: boolean;
  step: ExecutionWorkflowStep | null;
  snapshot: WorkOrderExecutionSnapshot;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABEL: Record<ExecutionWorkflowStep['status'], string> = {
  previous: 'Done',
  current: 'In progress',
  next: 'Upcoming',
};

const STATUS_PILL: Record<ExecutionWorkflowStep['status'], string> = {
  previous: 'border-[var(--mw-success)] text-[var(--mw-success)]',
  current: 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-mirage)]',
  next: 'border-[var(--neutral-300)] text-[var(--neutral-600)]',
};

export function RoutingStepDrawer({ open, step, snapshot, onOpenChange }: RoutingStepDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-[var(--neutral-200)] bg-card sm:max-w-[560px]"
      >
        {step ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Step {step.stepNumber} of {snapshot.routing.length} · {snapshot.machineName}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${STATUS_PILL[step.status]}`}
                >
                  {STATUS_LABEL[step.status]}
                </span>
              </div>
              <SheetTitle className="mt-2 text-2xl text-[var(--neutral-900)]">
                {step.title}
              </SheetTitle>
              <SheetDescription className="text-[var(--neutral-600)]">
                {step.description}
              </SheetDescription>
            </SheetHeader>

            {step.caution ? (
              <div className="mt-4 rounded-md border border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] px-4 py-3 text-sm text-[var(--mw-mirage)]">
                {step.caution}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-4">
              <Card className="overflow-hidden rounded-md border-[var(--neutral-200)] bg-card p-0">
                <div className="relative h-[280px]">
                  <ExecutionModelViewer src={snapshot.modelSrc} className="absolute inset-0" rotate={step.status === 'current'} />
                </div>
              </Card>

              <Card className="rounded-md border-[var(--neutral-200)] bg-card p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Step checklist
                </div>
                <ul className="mt-3 space-y-2">
                  {step.checklist.map((item) => {
                    const checked = item.completed || step.status === 'previous';
                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 rounded-sm bg-[var(--neutral-100)] px-3 py-2 text-sm text-[var(--neutral-800)]"
                      >
                        {checked ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[var(--mw-success)]" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 flex-none text-[var(--neutral-400)]" />
                        )}
                        <span className={checked ? 'text-[var(--neutral-500)] line-through' : ''}>
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className="rounded-md border-[var(--neutral-200)] bg-card p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Reference at this step
                </div>
                <p className="mt-2 text-sm text-[var(--neutral-700)]">
                  {snapshot.references[step.requiredReference].summary}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  {snapshot.references[step.requiredReference].documentLabel}
                </p>
              </Card>
            </div>

            {step.status === 'next' ? (
              <p className="mt-5 text-sm text-[var(--neutral-500)]">
                This step is upcoming and read-only. Complete the current step to advance.
              </p>
            ) : step.status === 'previous' ? (
              <p className="mt-5 text-sm text-[var(--neutral-500)]">
                This step is complete. Open it for review only.
              </p>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
