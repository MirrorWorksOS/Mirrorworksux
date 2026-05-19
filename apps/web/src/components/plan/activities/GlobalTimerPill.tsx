/**
 * GlobalTimerPill — mounted in the Sidebar footer. Shows a single pill with
 * the running activity's title and live elapsed counter; click navigates to
 * the host job's Activities tab. Stop button stops the timer without leaving
 * the current page.
 */

import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { Square } from 'lucide-react';
import { useJobActivityStore, selectRunningActivity } from '@/store/jobActivityStore';
import { cn } from '@/components/ui/utils';

interface GlobalTimerPillProps {
  /** Compact icon-only mode for collapsed sidebar. */
  iconOnly?: boolean;
  className?: string;
}

export function GlobalTimerPill({ iconOnly = false, className }: GlobalTimerPillProps) {
  const running = useJobActivityStore(selectRunningActivity);
  const stopTimer = useJobActivityStore((s) => s.stopTimer);
  const navigate = useNavigate();

  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  if (!running) return null;

  const startedAtIso = running.timeEntries.find((e) => !e.stoppedAt)?.startedAt;
  if (!startedAtIso) return null;

  const elapsedSec = Math.max(0, Math.floor((Date.now() - new Date(startedAtIso).getTime()) / 1000));
  const h = Math.floor(elapsedSec / 3600);
  const m = Math.floor((elapsedSec % 3600) / 60);
  const s = elapsedSec % 60;
  const elapsedLabel = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/plan/jobs/${running.jobId}?tab=activities`)}
        className={cn(
          'relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mw-error)] text-white',
          className,
        )}
        aria-label={`Timer running on ${running.title} — ${elapsedLabel}`}
        title={`${running.title} · ${elapsedLabel}`}
      >
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
        <Square className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-[var(--mw-error)]/30 bg-[var(--mw-error)]/10 px-2.5 py-1 text-xs',
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mw-error)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--mw-error)]" />
      </span>
      <Link
        to={`/plan/jobs/${running.jobId}?tab=activities`}
        className="min-w-0 max-w-[140px] truncate text-[var(--neutral-800)] hover:text-[var(--mw-error)]"
        title={running.title}
      >
        {running.title}
      </Link>
      <span className="tabular-nums font-medium text-[var(--neutral-700)]">{elapsedLabel}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          stopTimer();
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90"
        aria-label="Stop timer"
      >
        <Square className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
