/**
 * TimerPill — inline Start/Stop control for a job activity. Live elapsed
 * counter updates every second while running. Single-running-timer invariant
 * enforced by the store.
 */

import * as React from 'react';
import { Play, Square } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { useJobActivityStore } from '@/store/jobActivityStore';
import { formatMinutes } from '../plan-activity-shared';
import type { JobActivity } from '@/types/job-activity';

interface TimerPillProps {
  activity: JobActivity;
  /** When true, render only the icon button. Useful in dense tables. */
  compact?: boolean;
  className?: string;
}

export function TimerPill({ activity, compact = false, className }: TimerPillProps) {
  const runningId = useJobActivityStore((s) => s.runningTimerActivityId);
  const startTimer = useJobActivityStore((s) => s.startTimer);
  const stopTimer = useJobActivityStore((s) => s.stopTimer);

  const running = runningId === activity.id;
  const runningEntry = running ? activity.timeEntries.find((e) => !e.stoppedAt) : null;

  // Tick once a second while running so the displayed elapsed updates.
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const liveMinutes = React.useMemo(() => {
    if (!running || !runningEntry) return activity.loggedMinutes;
    const elapsedMs = Date.now() - new Date(runningEntry.startedAt).getTime();
    return activity.loggedMinutes + Math.floor(elapsedMs / 60_000);
  }, [running, runningEntry, activity.loggedMinutes]);

  const elapsedHMS = React.useMemo(() => {
    if (!running || !runningEntry) return null;
    const totalSec = Math.max(
      0,
      Math.floor((Date.now() - new Date(runningEntry.startedAt).getTime()) / 1000),
    );
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [running, runningEntry]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (running) stopTimer();
    else startTimer(activity.id);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
          running
            ? 'bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90'
            : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--mw-yellow-400)] hover:text-[#2C2C2C]',
          className,
        )}
        aria-label={running ? 'Stop timer' : 'Start timer'}
      >
        {running ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        running
          ? 'bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90'
          : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--mw-yellow-400)] hover:text-[#2C2C2C]',
        className,
      )}
      aria-label={running ? 'Stop timer' : 'Start timer'}
    >
      {running ? (
        <>
          <Square className="h-3 w-3" />
          <span className="tabular-nums">{elapsedHMS}</span>
        </>
      ) : (
        <>
          <Play className="h-3 w-3" />
          <span className="tabular-nums">
            {activity.loggedMinutes > 0 ? formatMinutes(liveMinutes) : 'Start'}
          </span>
        </>
      )}
    </button>
  );
}
