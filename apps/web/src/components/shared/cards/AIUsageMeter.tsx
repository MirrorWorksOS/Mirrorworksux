import { Sparkles } from 'lucide-react';
import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import {
  CURRENT_SUBSCRIPTION,
  TIERS,
  getAICreditsRemaining,
  getUsagePercentage,
  getUsageStatus,
  type UsageStatus,
} from '@/lib/subscription';

/**
 * AIUsageMeter — at-a-glance AI actions / month meter sourced from
 * `CURRENT_SUBSCRIPTION` + tier quota. Uses a Recharts radial bar with a
 * green/amber/red status colour:
 *   - < 70%  green
 *   - 70–90% amber
 *   - ≥ 90%  red
 * Enterprise (null quota) renders an "Unlimited" pill instead of a meter.
 *
 * Designed for both light surfaces (Control → Billing) and the dark-slate
 * Admin → Tenants header by toggling `variant`.
 */
export interface AIUsageMeterProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const COLOR_GREEN = '#10b981'; // emerald-500
const COLOR_AMBER = '#f59e0b'; // amber-500
const COLOR_RED = '#ef4444'; // red-500

function statusColor(pct: number): string {
  if (pct >= 90) return COLOR_RED;
  if (pct >= 70) return COLOR_AMBER;
  return COLOR_GREEN;
}

function formatActions(n: number): string {
  return n.toLocaleString('en-US');
}

const STATUS_LABEL: Record<UsageStatus, string> = {
  normal: 'Healthy',
  warning: 'Approaching limit',
  critical: 'Near limit',
  exceeded: 'Quota exceeded',
};

export function AIUsageMeter({ variant = 'light', className }: AIUsageMeterProps) {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const quota = TIERS[tier].aiCreditsPerMonth;
  const remaining = getAICreditsRemaining();
  const pct = quota === null ? 0 : getUsagePercentage(remaining.includedUsed, quota);
  const status = getUsageStatus(pct);
  const color = statusColor(pct);

  const isDark = variant === 'dark';
  const surfaceClass = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : '';
  const labelClass = isDark ? 'text-slate-400' : 'text-muted-foreground';
  const valueClass = isDark ? 'text-slate-100' : 'text-foreground';
  const subClass = isDark ? 'text-slate-500' : 'text-muted-foreground';

  const tierSubLabel =
    quota === null
      ? `${tier} plan — Unlimited`
      : `${tier} plan — ${formatActions(quota)}/month`;

  if (quota === null) {
    return (
      <Card className={cn('p-5', surfaceClass, className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className={cn('text-sm', labelClass)}>AI actions this month</p>
            <p className={cn('text-3xl font-medium tabular-nums', valueClass)}>Unlimited</p>
            <p className={cn('text-xs', subClass)}>{tierSubLabel}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--mw-yellow-100)] dark:bg-[var(--mw-yellow-400)]/15">
            <Sparkles
              className="h-5 w-5 text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]"
              aria-hidden
            />
          </div>
        </div>
      </Card>
    );
  }

  const chartData = [{ name: 'used', value: Math.min(pct, 100), fill: color }];

  return (
    <Card className={cn('p-5', surfaceClass, className)}>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn('text-sm', labelClass)}>AI actions this month</p>
          <p className={cn('text-2xl font-medium tabular-nums', valueClass)}>
            {formatActions(remaining.includedUsed)}{' '}
            <span className={cn('text-base font-normal', subClass)}>
              / {formatActions(quota)}
            </span>
          </p>
          <p className={cn('text-xs', subClass)}>{tierSubLabel}</p>
          <p
            className="text-xs font-medium tabular-nums"
            style={{ color }}
            aria-label={`Usage status: ${STATUS_LABEL[status]}`}
          >
            {pct}% · {STATUS_LABEL[status]}
          </p>
        </div>
        <div className="relative h-24 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <RadialBar
                background={{ fill: isDark ? '#1e293b' : 'rgba(0,0,0,0.06)' }}
                dataKey="value"
                cornerRadius={6}
                isAnimationActive={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color }}
            >
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
