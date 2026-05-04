/**
 * Late risk card — count of at-risk jobs, dollar value, link to the late-jobs
 * filter. Compact single-row variant.
 */
import { useNavigate } from 'react-router';

import { Card } from '@/components/ui/card';
import { AnimatedCount } from '@/components/shared/motion/AnimatedCount';
import type { ScheduleSnapshotKpis } from '@/types/entities';

interface LateRiskCardProps {
  kpis: ScheduleSnapshotKpis;
}

function formatAud(value: number): string {
  return `$${value.toLocaleString('en-AU')}`;
}

export function LateRiskCard({ kpis }: LateRiskCardProps) {
  const navigate = useNavigate();
  const { lateRisk } = kpis;
  const noRisk = lateRisk.jobsAtRisk === 0;

  return (
    <Card variant="flat" className="flex h-[176px] flex-col p-5">
      <header className="flex h-5 items-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--neutral-500)]">
          Late risk
        </p>
      </header>
      <div className="flex flex-1 items-end">
        <p className="flex items-baseline gap-1.5 text-3xl font-light leading-none tabular-nums tracking-tight text-[var(--neutral-900)]">
          <AnimatedCount value={lateRisk.jobsAtRisk} />
          <span className="text-xs leading-none text-[var(--neutral-500)]">
            {lateRisk.jobsAtRisk === 1 ? 'job' : 'jobs'}
          </span>
        </p>
      </div>
      <div className="mt-3 flex h-[52px] flex-col justify-end gap-1.5">
        <div className="flex text-[11px] font-medium tabular-nums text-[var(--neutral-700)]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: noRisk ? 'var(--mw-success)' : 'var(--mw-warning)',
              }}
            />
            {noRisk ? 'On track' : `At risk ${formatAud(lateRisk.valueAtRiskAud)}`}
          </span>
        </div>
        {noRisk ? (
          <p className="text-[11px] tabular-nums text-[var(--neutral-500)]">
            All jobs on schedule.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/plan/jobs?filter=late')}
            className="self-start text-[11px] tabular-nums text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:underline"
          >
            Open late jobs →
          </button>
        )}
      </div>
    </Card>
  );
}
