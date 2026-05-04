/**
 * Bottleneck card — names the most overloaded work centre and its overload %.
 * Compact single-row variant — drops the queue strip in favour of a copy line.
 */
import { CheckCircle2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { ScheduleSnapshotKpis } from '@/types/entities';

interface BottleneckCardProps {
  kpis: ScheduleSnapshotKpis;
}

export function BottleneckCard({ kpis }: BottleneckCardProps) {
  const { bottleneck } = kpis;

  if (!bottleneck) {
    return (
      <Card variant="flat" className="flex h-[176px] flex-col p-5">
        <header className="flex h-5 items-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--neutral-500)]">
            Bottleneck
          </p>
        </header>
        <div className="flex flex-1 items-end gap-2">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--mw-success)]" strokeWidth={1.5} />
          <p className="text-2xl font-light leading-none tracking-tight text-[var(--neutral-900)]">
            No bottleneck
          </p>
        </div>
        <div className="mt-3 flex h-[52px] flex-col justify-end gap-1.5">
          <div className="flex text-[11px] font-medium tabular-nums text-[var(--neutral-700)]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--mw-success)' }}
              />
              Balanced
            </span>
          </div>
          <p className="text-[11px] tabular-nums text-[var(--neutral-500)]">
            All work centres healthy.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="flat" className="flex h-[176px] flex-col p-5">
      <header className="flex h-5 items-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--neutral-500)]">
          Bottleneck
        </p>
      </header>
      <div className="flex flex-1 items-end">
        <p className="truncate text-3xl font-light leading-none tracking-tight text-[var(--neutral-900)]">
          {bottleneck.workCentreName}
        </p>
      </div>
      <div className="mt-3 flex h-[52px] flex-col justify-end gap-1.5">
        <div className="flex text-[11px] font-medium tabular-nums text-[var(--neutral-700)]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--mw-error)' }}
            />
            Overloaded {bottleneck.overloadPercent}%
          </span>
        </div>
        <p className="text-[11px] tabular-nums text-[var(--neutral-500)]">
          {bottleneck.queueDepth} ops · {bottleneck.backlogHours}h backlog
        </p>
      </div>
    </Card>
  );
}
