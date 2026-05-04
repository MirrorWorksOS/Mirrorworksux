/**
 * Active jobs count + compact status breakdown. Same fixed height as siblings.
 */
import { Card } from '@/components/ui/card';
import { AnimatedCount } from '@/components/shared/motion/AnimatedCount';
import type { ScheduleSnapshotKpis } from '@/types/entities';

import { STATUS_COLOUR } from '../constants';

interface ActiveJobsCardProps {
  kpis: ScheduleSnapshotKpis;
}

export function ActiveJobsCard({ kpis }: ActiveJobsCardProps) {
  const { activeJobs } = kpis;
  const total =
    activeJobs.running + activeJobs.queued + activeJobs.blocked + activeJobs.late;

  const dots: Array<{ key: string; count: number; colour: string }> = [
    { key: 'Running', count: activeJobs.running, colour: STATUS_COLOUR.running },
    { key: 'Queued', count: activeJobs.queued, colour: STATUS_COLOUR.queued },
    ...(activeJobs.blocked > 0
      ? [{ key: 'Blocked', count: activeJobs.blocked, colour: STATUS_COLOUR.blocked }]
      : []),
    ...(activeJobs.late > 0
      ? [{ key: 'Late', count: activeJobs.late, colour: STATUS_COLOUR.late }]
      : []),
  ];

  return (
    <Card variant="flat" className="flex h-[176px] flex-col p-5">
      <header className="flex h-5 items-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--neutral-500)]">
          Active jobs
        </p>
      </header>
      <div className="flex flex-1 items-end">
        <p className="text-3xl font-light leading-none tabular-nums tracking-tight text-[var(--neutral-900)]">
          <AnimatedCount value={total} />
        </p>
      </div>
      <div className="mt-3 flex h-[52px] flex-col justify-end gap-1.5">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-medium tabular-nums text-[var(--neutral-700)]">
          {dots.map((d) => (
            <span key={d.key} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.colour }} />
              {d.key} {d.count}
            </span>
          ))}
        </div>
        <p className="text-[11px] tabular-nums text-[var(--neutral-500)]">
          {activeJobs.dueToday} due today · {activeJobs.atRisk} at risk
        </p>
      </div>
    </Card>
  );
}
