/**
 * JobActivityTimeSummary — KPI card displayed at the top of the per-job
 * Activities tab. Aggregates estimated vs logged time across the job's
 * activities and surfaces variance.
 */

import { useMemo } from 'react';
import { Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { formatMinutes } from '../plan-activity-shared';
import type { JobActivity } from '@/types/job-activity';

interface Props {
  activities: JobActivity[];
}

export function JobActivityTimeSummary({ activities }: Props) {
  const stats = useMemo(() => {
    const estimated = activities.reduce((s, a) => s + (a.estimatedMinutes ?? 0), 0);
    const logged = activities.reduce((s, a) => s + a.loggedMinutes, 0);
    const variance = logged - estimated;
    const variancePct = estimated > 0 ? Math.round((variance / estimated) * 100) : 0;
    const open = activities.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').length;
    const total = activities.length;
    return { estimated, logged, variance, variancePct, open, total };
  }, [activities]);

  if (stats.total === 0) return null;

  const overBudget = stats.variance > 0;
  const onBudget = stats.variance === 0;

  return (
    <Card
      variant="flat"
      className="rounded-[var(--shape-lg)] border-[var(--border)] p-4"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          icon={<Clock className="h-4 w-4 text-[var(--mw-info)]" />}
          label="Estimated"
          value={formatMinutes(stats.estimated)}
        />
        <Stat
          icon={<Clock className="h-4 w-4 text-[var(--mw-yellow-700)]" />}
          label="Logged"
          value={formatMinutes(stats.logged)}
        />
        <Stat
          icon={
            onBudget ? (
              <Clock className="h-4 w-4 text-[var(--mw-success)]" />
            ) : overBudget ? (
              <TrendingUp className="h-4 w-4 text-[var(--mw-error)]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[var(--mw-success)]" />
            )
          }
          label="Variance"
          value={
            <span
              className={cn(
                'tabular-nums',
                overBudget && 'text-[var(--mw-error)]',
                !overBudget && stats.variance !== 0 && 'text-[var(--mw-success)]',
              )}
            >
              {stats.variance >= 0 ? '+' : '−'}
              {formatMinutes(Math.abs(stats.variance))}
              {stats.estimated > 0 && (
                <span className="ml-1 text-xs text-[var(--neutral-500)]">
                  ({stats.variancePct >= 0 ? '+' : ''}
                  {stats.variancePct}%)
                </span>
              )}
            </span>
          }
        />
        <Stat
          icon={<Clock className="h-4 w-4 text-[var(--mw-mirage)]" />}
          label="Open / Total"
          value={
            <span className="tabular-nums">
              {stats.open}
              <span className="text-[var(--neutral-400)]"> / {stats.total}</span>
            </span>
          }
        />
      </div>

      {stats.estimated > 0 && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--neutral-100)]">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              overBudget ? 'bg-[var(--mw-error)]' : 'bg-[var(--mw-yellow-400)]',
            )}
            style={{
              width: `${Math.min(100, Math.round((stats.logged / stats.estimated) * 100))}%`,
            }}
          />
        </div>
      )}
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neutral-100)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
