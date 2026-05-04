import { Card } from '@/components/ui/card';
import type { TimeSummary } from './types';

interface TimeSummaryGridProps {
  summary: TimeSummary;
  totalActualMin: number;
}

export function TimeSummaryGrid({ summary, totalActualMin }: TimeSummaryGridProps) {
  const rows = [
    { label: 'Setup', est: summary.setupEstMin, actual: summary.setupActualMin },
    { label: 'Run', est: summary.runEstMin, actual: summary.runActualMin },
    { label: 'First-off', est: summary.firstOffEstMin, actual: summary.firstOffActualMin },
  ];

  return (
    <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-5 shadow-xs">
      <h3 className="text-base font-medium text-[var(--neutral-900)]">Time vs estimate</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <Row key={row.label} {...row} />
        ))}
        <div className="flex items-center justify-between border-t border-[var(--neutral-200)] pt-3">
          <span className="text-sm font-medium text-[var(--neutral-700)]">Total to date</span>
          <span className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
            {formatMinutes(totalActualMin)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, est, actual }: { label: string; est: number; actual: number }) {
  const variancePct = est > 0 ? Math.round(((actual - est) / est) * 100) : 0;
  const tone =
    variancePct > 10
      ? 'text-[var(--mw-error)]'
      : variancePct < -5
        ? 'text-[var(--mw-success)]'
        : 'text-[var(--neutral-900)]';

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
      <span className="text-[var(--neutral-700)]">{label}</span>
      <span className="text-[var(--neutral-500)] tabular-nums">est {formatMinutes(est)}</span>
      <span className={`font-medium tabular-nums ${tone}`}>actual {formatMinutes(actual)}</span>
    </div>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} m`;
}
