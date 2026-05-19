import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkOrderExecutionSnapshot } from './types';

interface OperationHeaderCardProps {
  snapshot: WorkOrderExecutionSnapshot;
  unitsCompleted: number;
  unitsTarget: number;
  cycleEstimateLabel: string;
  cycleActualLabel: string;
  cycleVariancePct: number;
  totalActualMin: number;
  totalEstimateMin: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function OperationHeaderCard({
  snapshot,
  unitsCompleted,
  unitsTarget,
  cycleEstimateLabel,
  cycleActualLabel,
  cycleVariancePct,
  totalActualMin,
  totalEstimateMin,
  onIncrement,
  onDecrement,
}: OperationHeaderCardProps) {
  const overTarget = cycleVariancePct > 0;
  const variancePill = overTarget
    ? 'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]'
    : cycleVariancePct < 0
      ? 'bg-[var(--mw-success)]/12 text-[var(--mw-success)]'
      : 'bg-[var(--neutral-100)] text-[var(--neutral-600)]';

  const totalVariancePct =
    totalEstimateMin > 0
      ? Math.round(((totalActualMin - totalEstimateMin) / totalEstimateMin) * 100)
      : 0;
  const totalTone =
    totalVariancePct > 10
      ? 'text-[var(--mw-error)]'
      : totalVariancePct < -5
        ? 'text-[var(--mw-success)]'
        : 'text-[var(--neutral-700)]';

  return (
    <Card className="rounded-lg border-[var(--neutral-200)] bg-card p-6 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            Step {snapshot.currentStep.stepNumber} of {snapshot.routing.length} · {snapshot.machineName} · {snapshot.revision}
          </div>
          <h2 className="mt-2 text-2xl font-medium leading-tight text-[var(--neutral-900)]">
            {snapshot.currentStep.title}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-[var(--neutral-600)]">
            {snapshot.currentStep.description}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-5 py-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Cycle time
            </div>
            <div className="mt-2 flex items-end gap-3">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">Est</div>
                <div className="text-2xl font-medium tabular-nums text-[var(--neutral-700)]">
                  {cycleEstimateLabel}
                </div>
              </div>
              <div className="h-8 w-px bg-[var(--neutral-200)]" />
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">Actual</div>
                <div className="text-2xl font-medium tabular-nums text-[var(--neutral-900)]">
                  {cycleActualLabel}
                </div>
              </div>
              {cycleVariancePct !== 0 ? (
                <span className={`mb-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${variancePill}`}>
                  {overTarget ? '+' : ''}{cycleVariancePct}%
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-5 py-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Units complete
            </div>
            <div className="mt-2 flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                aria-label="Decrement unit"
                className="h-14 w-14 border-[var(--mw-yellow-400)] bg-card p-0 text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-50)]"
                onClick={onDecrement}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-medium leading-none tabular-nums text-[var(--neutral-900)]">
                  {unitsCompleted}
                </span>
                <span className="pb-1 text-lg tabular-nums text-[var(--neutral-500)]">
                  / {unitsTarget}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                aria-label="Increment unit"
                className="h-14 w-14 border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)] p-0 text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
                onClick={onIncrement}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-[var(--neutral-200)] pt-2 text-[11px] font-medium uppercase tracking-[0.18em]">
              <span className="text-[var(--neutral-500)]">WO total run</span>
              <span className={`tabular-nums ${totalTone}`}>{formatMinutes(totalActualMin)}</span>
              <span className="text-[var(--neutral-400)]">/</span>
              <span className="tabular-nums text-[var(--neutral-600)]">
                {formatMinutes(totalEstimateMin)} est
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} m`;
}
