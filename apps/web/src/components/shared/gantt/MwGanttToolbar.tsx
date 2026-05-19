/**
 * MwGanttToolbar — zoom selector + "Now" jump-to button + slot for caller-
 * supplied filter chips / group selectors.
 */
import { type ReactNode } from 'react';
import { Calendar, CalendarDays, CalendarRange, LocateFixed } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import type { MwGanttZoom } from './types';

interface MwGanttToolbarProps {
  zoom: MwGanttZoom;
  onZoomChange?: (z: MwGanttZoom) => void;
  onJumpToNow?: () => void;
  /** Slot rendered between the title and the zoom selector — for filter chips, group-by, etc. */
  leadingActions?: ReactNode;
  /** Slot rendered after the Now button. */
  trailingActions?: ReactNode;
}

const ZOOM_OPTIONS: Array<{ value: MwGanttZoom; label: string; icon: typeof Calendar }> = [
  { value: 'day', label: 'Day', icon: Calendar },
  { value: 'week', label: 'Week', icon: CalendarDays },
  { value: 'month', label: 'Month', icon: CalendarRange },
];

export function MwGanttToolbar({
  zoom,
  onZoomChange,
  onJumpToNow,
  leadingActions,
  trailingActions,
}: MwGanttToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--neutral-100)] px-4 py-3">
      {leadingActions && <div className="flex flex-wrap items-center gap-2">{leadingActions}</div>}

      <div className="flex-1" />

      {onZoomChange && (
        <div className="inline-flex overflow-hidden rounded-full border border-[var(--border)] bg-card">
          {ZOOM_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = opt.value === zoom;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onZoomChange(opt.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-[var(--mw-yellow-400)] text-[#2C2C2C]'
                    : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] dark:text-neutral-400 dark:hover:bg-neutral-800',
                )}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {onJumpToNow && (
        <button
          type="button"
          onClick={onJumpToNow}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-card px-3 py-1.5 text-xs font-medium text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Now
        </button>
      )}

      {trailingActions && <div className="flex flex-wrap items-center gap-2">{trailingActions}</div>}
    </div>
  );
}
