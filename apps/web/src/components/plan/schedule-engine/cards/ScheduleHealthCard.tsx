/**
 * Schedule health 0–100 score, reason, mini radial ring, and "View N issues"
 * link. Light card variant — matches the rest of the row.
 */
import { Card } from '@/components/ui/card';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { ScheduleSnapshot } from '@/types/entities';

interface ScheduleHealthCardProps {
  snapshot: ScheduleSnapshot;
}

const RADIUS = 16;
const STROKE = 3;
const CIRCUM = 2 * Math.PI * RADIUS;

export function ScheduleHealthCard({ snapshot }: ScheduleHealthCardProps) {
  const { kpis, issues } = snapshot;
  const setIssuesSheetOpen = useScheduleEngineStore((s) => s.setIssuesSheetOpen);
  const score = Math.max(0, Math.min(100, kpis.healthScore));
  const dashOffset = CIRCUM * (1 - score / 100);
  const issueCount = issues.length;

  // Score colour band: high = success, mid = warning, low = error.
  const ringColour =
    score >= 80
      ? 'var(--mw-success)'
      : score >= 60
        ? 'var(--mw-warning)'
        : 'var(--mw-error)';
  const statusLabel = score >= 80 ? 'Healthy' : score >= 60 ? 'At risk' : 'Critical';

  const svgSize = RADIUS * 2 + STROKE;

  return (
    <Card variant="flat" className="flex h-[176px] flex-col p-5">
      <header className="flex h-5 items-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--neutral-500)]">
          Schedule health
        </p>
      </header>
      <div className="flex flex-1 items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <p className="text-3xl font-light leading-none tabular-nums tracking-tight text-[var(--neutral-900)]">
            {score}
          </p>
          <span className="text-xs tabular-nums leading-none text-[var(--neutral-500)]">/ 100</span>
        </div>
        <svg width={svgSize} height={svgSize} aria-hidden className="block shrink-0">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={RADIUS}
            stroke="var(--neutral-200)"
            strokeWidth={STROKE}
            fill="none"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={RADIUS}
            stroke={ringColour}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUM}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
            style={{ transition: 'stroke-dashoffset 0.6s var(--ease-emphasized)' }}
          />
        </svg>
      </div>
      <div className="mt-3 flex h-[52px] flex-col justify-end gap-1.5">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-medium tabular-nums text-[var(--neutral-700)]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: ringColour }}
            />
            {statusLabel}
          </span>
          {issueCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--mw-warning)' }}
              />
              Issues {issueCount}
            </span>
          )}
        </div>
        {issueCount > 0 ? (
          <button
            type="button"
            onClick={() => setIssuesSheetOpen(true)}
            className="self-start text-[11px] tabular-nums text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:underline"
          >
            View {issueCount} {issueCount === 1 ? 'issue' : 'issues'} →
          </button>
        ) : (
          <p className="truncate text-[11px] tabular-nums text-[var(--neutral-500)]">
            {kpis.healthReason}
          </p>
        )}
      </div>
    </Card>
  );
}
