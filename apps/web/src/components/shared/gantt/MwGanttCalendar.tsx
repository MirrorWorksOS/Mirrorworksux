/**
 * MwGanttCalendar — Month-zoom renderer for MwGantt.
 *
 * Instead of a horizontal timeline (which makes day-spanned items look like
 * tiny dots at month density), this lays out a true 7-column calendar grid
 * with each day cell showing activity chips. Mirrors the visual pattern of
 * `ScheduleCalendar` but is fed by the generic MwGantt item shape.
 */

import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import type { MwGanttItem } from './types';

interface MwGanttCalendarProps {
  items: MwGanttItem[];
  /** Status → colour mapping supplied by caller. Item's `color` wins if set. */
  statusColour?: Record<string, string>;
  /** Initial month focus. Defaults to today's month. */
  initialMonth?: Date;
  /** Bar click handler. */
  onItemClick?: (item: MwGanttItem) => void;
  /** Max chips per cell before showing the "+N more" indicator. */
  maxPerCell?: number;
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MwGanttCalendar({
  items,
  statusColour,
  initialMonth,
  onItemClick,
  maxPerCell = 3,
}: MwGanttCalendarProps) {
  const [month, setMonth] = useState<Date>(initialMonth ?? new Date());

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  /** All days rendered in the grid (full weeks). */
  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  /** items overlapping each day. */
  const itemsByDay = useMemo(() => {
    const map = new Map<string, MwGanttItem[]>();
    days.forEach((d) => map.set(d.toISOString(), []));
    items.forEach((it) => {
      const cursor = new Date(it.start);
      cursor.setHours(0, 0, 0, 0);
      const endCursor = new Date(it.end);
      endCursor.setHours(0, 0, 0, 0);
      while (cursor.getTime() <= endCursor.getTime()) {
        // Bucket if the day cursor is inside the rendered grid.
        const key = days.find((d) => isSameDay(d, cursor))?.toISOString();
        if (key) {
          const list = map.get(key);
          if (list) list.push(it);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [items, days]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--neutral-100)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(new Date())}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {format(month, 'MMMM yyyy')}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--neutral-400)]">
          {items.length} {items.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-[var(--neutral-200)]">
        {WEEKDAY_HEADERS.map((d) => (
          <div
            key={d}
            className="border-r border-[var(--neutral-100)] px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)] last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid flex-1 grid-cols-7">
        {days.map((day) => {
          const cellItems = itemsByDay.get(day.toISOString()) ?? [];
          const isToday = isSameDay(day, today);
          const isOtherMonth = !isSameMonth(day, month);
          const overflow = Math.max(0, cellItems.length - maxPerCell);
          const visibleItems = cellItems.slice(0, maxPerCell);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[112px] border-b border-r border-[var(--neutral-100)] p-1.5 last-of-type:border-r-0',
                isOtherMonth && 'bg-[var(--neutral-50)] dark:bg-neutral-900/20',
                isToday && 'bg-[var(--mw-yellow-400)]/8',
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium tabular-nums',
                    isToday
                      ? 'bg-[var(--mw-yellow-400)] text-[#2C2C2C]'
                      : isOtherMonth
                        ? 'text-[var(--neutral-400)]'
                        : 'text-[var(--neutral-700)] dark:text-neutral-300',
                  )}
                >
                  {day.getDate()}
                </span>
                {cellItems.length > 0 && (
                  <span className="text-[9px] tabular-nums text-[var(--neutral-400)]">
                    {cellItems.length}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const fill =
                    item.color ??
                    (item.status && statusColour ? statusColour[item.status] : undefined) ??
                    'var(--mw-yellow-400)';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick?.(item);
                      }}
                      className="flex w-full items-center gap-1 truncate rounded-sm px-1 py-0.5 text-left text-[10px] transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${fill} 22%, transparent)`,
                        color: 'var(--neutral-900)',
                      }}
                      title={item.label}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: fill }}
                      />
                      <span className="truncate text-foreground">{item.label}</span>
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <p className="px-1 text-[9px] font-medium text-[var(--neutral-500)]">
                    +{overflow} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
