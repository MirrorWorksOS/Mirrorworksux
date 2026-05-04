/**
 * Average utilisation across all work centres. Compact single-row variant —
 * eyebrow, hero %, inline trend chip, thin sparkline footer.
 */
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { AnimatedCount } from '@/components/shared/motion/AnimatedCount';
import type { ScheduleSnapshotKpis } from '@/types/entities';

interface AvgUtilisationCardProps {
  kpis: ScheduleSnapshotKpis;
}

export function AvgUtilisationCard({ kpis }: AvgUtilisationCardProps) {
  const { avgUtilisationPercent, avgUtilisationDelta, utilisationHistory } = kpis;
  const data = utilisationHistory.map((p) => ({ percent: p.percent }));
  const TrendIcon = avgUtilisationDelta >= 0 ? ArrowUp : ArrowDown;

  return (
    <Card variant="flat" className="flex h-[176px] flex-col p-5">
      <header className="flex h-5 items-center justify-between gap-2">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--neutral-500)]">
          Utilisation
        </p>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--neutral-100)] px-1.5 py-px text-[10px] font-medium tabular-nums leading-4 text-[var(--neutral-700)]">
          <TrendIcon className="h-2.5 w-2.5" strokeWidth={2} />
          {Math.abs(avgUtilisationDelta)}%
        </span>
      </header>
      <div className="flex flex-1 items-end">
        <p className="text-3xl font-light leading-none tabular-nums tracking-tight text-[var(--neutral-900)]">
          <AnimatedCount value={avgUtilisationPercent} format={(n) => `${n}%`} />
        </p>
      </div>
      <div className="-mx-1 mt-3 h-[52px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="utilisation-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mw-yellow-400)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--mw-yellow-400)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="percent"
              stroke="var(--mw-yellow-400)"
              strokeWidth={1.75}
              fill="url(#utilisation-fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
