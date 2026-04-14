import { CheckCircle2, Clock3, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkOrderExecutionSnapshot } from './types';

interface CurrentStepCardProps {
  snapshot: WorkOrderExecutionSnapshot;
  onViewRouting: () => void;
}

export function CurrentStepCard({
  snapshot,
  onViewRouting,
}: CurrentStepCardProps) {
  const { currentStep, previousStep, nextStep, stepsSummary } = snapshot;

  return (
    <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Current step
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[var(--neutral-900)] tabular-nums">
                  {currentStep.stepNumber}
                </span>
                <span className="pb-1 text-lg text-[var(--neutral-500)]">
                  of {stepsSummary.total}
                </span>
              </div>
            </div>

            <div className="inline-flex min-h-10 items-center rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-3 py-2 text-sm font-medium text-[var(--neutral-700)]">
              {stepsSummary.completed} completed
            </div>
          </div>

          <div>
            <h2 className="text-[34px] font-bold leading-[1.05] text-[var(--neutral-900)]">
              {currentStep.title}
            </h2>
            <p className="mt-3 max-w-[38ch] text-base text-[var(--neutral-600)]">
              {currentStep.description}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-100)]"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onViewRouting();
          }}
        >
          <Eye className="h-5 w-5" />
          View full routing
        </Button>
      </div>

      {currentStep.caution ? (
        <div className="mt-5 rounded-[var(--shape-md)] border border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] px-4 py-3 text-sm text-[var(--neutral-800)]">
          {currentStep.caution}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {previousStep ? (
          <div className="flex items-center gap-3 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 py-4 text-sm text-[var(--neutral-700)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--mw-success)]" />
            <span className="font-medium">Completed:</span>
            <span>{previousStep.title}</span>
          </div>
        ) : null}

        <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 py-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            <Clock3 className="h-3.5 w-3.5" />
            Do this now
          </div>
          <div className="mt-3 space-y-2">
            {currentStep.checklist.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-[var(--shape-sm)] bg-card px-4 py-3 text-sm text-[var(--neutral-800)]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-xs font-medium text-[var(--neutral-700)]">
                  {index + 1}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {nextStep ? (
          <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 py-4 text-sm text-[var(--neutral-700)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Up next
            </div>
            <div className="mt-2 text-base font-medium text-[var(--neutral-800)]">
              {nextStep.title}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
