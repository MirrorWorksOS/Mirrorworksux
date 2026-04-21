/**
 * LiveFloorView — Real-time operator status wall display.
 *
 * Card grid per active operator showing:
 * - Name + avatar initials circle
 * - Current WO + operation name + machine
 * - Estimated vs actual elapsed time (live 1s ticker)
 * - Progress bar: green (<80%), yellow (80–100%), red (>100%)
 * - Status badge (active/paused/break)
 *
 * Touch target: 56px min-height on the card (shop floor requirement).
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { activeOperators, type ActiveOperator } from '@/services';

function getProgressColor(ratio: number): string {
  if (ratio > 1.0) return 'bg-[var(--mw-red,_#ef4444)]';
  if (ratio >= 0.8) return 'bg-[var(--mw-yellow-400)]';
  return 'bg-[var(--chart-scale-high,_#22c55e)]';
}

function StatusBadge({ status }: { status: ActiveOperator['status'] }) {
  if (status === 'active') {
    return (
      <Badge className="border-0 bg-[var(--mw-success-light,_#dcfce7)] text-[var(--mw-success,_#16a34a)] text-xs px-2 py-0.5">
        Active
      </Badge>
    );
  }
  if (status === 'paused') {
    return (
      <Badge className="border-0 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] text-xs px-2 py-0.5">
        Paused
      </Badge>
    );
  }
  return (
    <Badge className="border-0 bg-[var(--neutral-200)] text-[var(--neutral-600)] text-xs px-2 py-0.5">
      Break
    </Badge>
  );
}

function OperatorCard({ op, now }: { op: ActiveOperator; now: number }) {
  const elapsedMinutes = (now - new Date(op.startedAt).getTime()) / 60_000;
  const ratio = elapsedMinutes / op.estimatedMinutes;
  const barPercent = Math.min(ratio * 100, 100);
  const isOverTime = ratio > 1.0;

  return (
    <Card
      variant="flat"
      className="min-h-14 p-5 rounded-lg border-[var(--border)] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--neutral-900)] text-white flex items-center justify-center text-sm font-semibold">
          {op.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight truncate">{op.name}</p>
          <p className="text-xs text-[var(--neutral-500)] truncate">{op.machine}</p>
        </div>
        <StatusBadge status={op.status} />
      </div>

      <div className="mb-4 space-y-1">
        <p className="text-base font-medium text-foreground tabular-nums">{op.woNumber}</p>
        <p className="text-sm text-[var(--neutral-500)]">{op.operationName}</p>
      </div>

      <div className="mb-2">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', getProgressColor(ratio))}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn('text-sm tabular-nums font-medium', isOverTime ? 'text-[var(--mw-red,_#ef4444)]' : 'text-foreground')}>
          {Math.floor(elapsedMinutes)} / {op.estimatedMinutes} min
        </span>
        {isOverTime && (
          <span className="text-xs font-medium text-[var(--mw-red,_#ef4444)] tabular-nums">
            +{Math.floor(elapsedMinutes - op.estimatedMinutes)} min over
          </span>
        )}
      </div>
    </Card>
  );
}

export function LiveFloorView() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const counts = activeOperators.reduce(
    (acc, op) => { acc[op.status] = (acc[op.status] ?? 0) + 1; return acc; },
    {} as Record<ActiveOperator['status'], number>,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className="border-0 bg-[var(--mw-success-light,_#dcfce7)] text-[var(--mw-success,_#16a34a)] px-3 py-1 text-sm">
          {counts.active ?? 0} active
        </Badge>
        {(counts.paused ?? 0) > 0 && (
          <Badge className="border-0 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] px-3 py-1 text-sm">
            {counts.paused} paused
          </Badge>
        )}
        {(counts.break ?? 0) > 0 && (
          <Badge className="border-0 bg-[var(--neutral-200)] text-[var(--neutral-600)] px-3 py-1 text-sm">
            {counts.break} on break
          </Badge>
        )}
        <span className="ml-auto text-xs text-[var(--neutral-400)] tabular-nums">Live — updates every second</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeOperators.map((op) => (
          <OperatorCard key={op.id} op={op} now={now} />
        ))}
      </div>
    </div>
  );
}
