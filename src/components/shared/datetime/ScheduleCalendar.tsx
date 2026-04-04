import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  color?: string;
}

export interface ScheduleCalendarProps {
  events: CalendarEvent[];
  month: Date;
  onMonthChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
}

function eventsForDay(day: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((ev) => {
    const start = ev.date;
    const end = ev.endDate ?? ev.date;
    const t = day.getTime();
    return t >= startOfDayMs(start) && t <= endOfDayMs(end);
  });
}

function startOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function endOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

/** CSS hatching background for days that have activities */
const HATCH_STYLE: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    var(--hatch-color, rgba(250, 204, 21, 0.08)) 4px,
    var(--hatch-color, rgba(250, 204, 21, 0.08)) 5px
  )`,
};

export function ScheduleCalendar({
  events,
  month,
  onMonthChange,
  onEventClick,
  onDateClick,
  className,
}: ScheduleCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div
      className={cn(
        "rounded-[var(--shape-lg)] border border-[var(--neutral-200)] dark:border-neutral-700 bg-card p-4 shadow-xs",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 min-h-[48px] w-12 shrink-0"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-medium tabular-nums text-foreground">
          {format(month, "MMMM yyyy")}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 min-h-[48px] w-12 shrink-0"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-[var(--shape-md)] border border-[var(--neutral-200)] dark:border-neutral-700 bg-[var(--neutral-200)] dark:bg-neutral-700">
        {weekLabels.map((d) => (
          <div
            key={d}
            className="bg-[var(--neutral-50)] dark:bg-neutral-900 px-1 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const dayEvents = eventsForDay(day, events);
          const today = isSameDay(day, new Date());
          const hasActivities = dayEvents.length > 0;
          const isSelected = false; // Could track selection state here

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[104px] bg-card p-1 relative",
                !inMonth && "bg-[var(--neutral-50)] dark:bg-neutral-900/50 opacity-60",
              )}
              style={hasActivities && inMonth ? {
                ...HATCH_STYLE,
                // Use CSS custom property for dark mode compat
                ['--hatch-color' as string]: 'rgba(250, 204, 21, 0.08)',
              } : undefined}
            >
              <button
                type="button"
                onClick={() => onDateClick?.(day)}
                className={cn(
                  "mb-1 flex h-8 w-8 items-center justify-center rounded-full text-base tabular-nums transition-all duration-200 ease-out font-medium",
                  inMonth && "text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-neutral-800",
                  !inMonth && "text-muted-foreground",
                  today && "ring-2 ring-yellow-400 ring-offset-1 ring-offset-card",
                )}
              >
                {format(day, "d")}
              </button>

              {/* Activity dots indicator */}
              {hasActivities && inMonth && (
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  {dayEvents.slice(0, 4).map((ev, i) => (
                    <div
                      key={ev.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: ev.color ?? 'var(--mw-yellow-400)' }}
                    />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[8px] text-muted-foreground ml-0.5">+{dayEvents.length - 4}</span>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(ev);
                    }}
                    className="max-w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight text-foreground transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: ev.color
                        ? `color-mix(in srgb, ${ev.color} 22%, white)`
                        : "var(--mw-yellow-50)",
                      borderLeft: `3px solid ${ev.color ?? "var(--mw-yellow-400)"}`,
                    }}
                    title={ev.title}
                  >
                    {ev.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="px-1 text-[10px] font-medium text-muted-foreground tabular-nums">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
