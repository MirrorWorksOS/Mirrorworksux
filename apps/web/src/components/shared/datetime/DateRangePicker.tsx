import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";

function buildDefaultPresets(reference: Date): { label: string; from: Date; to: Date }[] {
  const end = startOfDay(reference);
  return [
    { label: "Last 7 days", from: subDays(end, 6), to: end },
    { label: "Last 30 days", from: subDays(end, 29), to: end },
    {
      label: "This month",
      from: startOfMonth(end),
      to: endOfMonth(end),
    },
  ];
}

function dayInRange(day: Date, from?: Date, to?: Date): boolean {
  if (!from || !to) return false;
  const d = startOfDay(day);
  const a = startOfDay(from);
  const b = startOfDay(to);
  const lo = isBefore(a, b) ? a : b;
  const hi = isAfter(a, b) ? a : b;
  return !isBefore(d, lo) && !isAfter(d, hi);
}

function dayIsEndpoint(day: Date, from?: Date, to?: Date): boolean {
  if (!from || !to) return false;
  return isSameDay(day, from) || isSameDay(day, to);
}

interface RangeCalendarProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  from?: Date;
  to?: Date;
  onDayClick: (day: Date) => void;
}

function RangeCalendar({ month, onMonthChange, from, to, onDayClick }: RangeCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-center text-sm font-medium tabular-nums text-foreground">
          {format(month, "MMM yyyy")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekLabels.map((d) => (
          <div
            key={d}
            className="flex h-7 w-8 items-center justify-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const inRange = from && to ? dayInRange(day, from, to) : false;
          const endpoint =
            (from && to && dayIsEndpoint(day, from, to)) || Boolean(from && !to && isSameDay(day, from));
          const today = isSameDay(day, new Date());
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-[var(--shape-md)] text-xs transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                !inMonth && "text-muted-foreground opacity-40",
                inMonth && "text-foreground",
                inRange && !endpoint && "bg-[var(--mw-yellow-50)]",
                endpoint && "bg-[var(--mw-yellow-400)] font-medium text-primary-foreground",
                today && !endpoint && "font-medium",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onChange: (range: { from?: Date; to?: Date }) => void;
  presets?: { label: string; from: Date; to: Date }[];
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onChange,
  presets,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [leftMonth, setLeftMonth] = React.useState(() => from ?? new Date());
  const [rightMonth, setRightMonth] = React.useState(() => addMonths(from ?? new Date(), 1));
  const [anchor, setAnchor] = React.useState<Date | null>(null);

  const refDate = React.useMemo(() => new Date(), []);
  const chipPresets = presets ?? buildDefaultPresets(refDate);

  React.useEffect(() => {
    if (from) {
      setLeftMonth(from);
      setRightMonth(addMonths(from, 1));
    }
  }, [from]);

  const label =
    from && to
      ? `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`
      : from
        ? `${format(from, "MMM d, yyyy")} – …`
        : "Select date range";

  const handleDayClick = (day: Date) => {
    if (!anchor) {
      setAnchor(day);
      onChange({ from: day, to: undefined });
      return;
    }
    const start = isBefore(day, anchor) ? day : anchor;
    const end = isAfter(day, anchor) ? day : anchor;
    setAnchor(null);
    onChange({ from: startOfDay(start), to: startOfDay(end) });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 min-h-[48px] w-full justify-start gap-2 border-[var(--neutral-200)] font-normal tabular-nums",
            className,
          )}
        >
          <CalendarRange className="h-5 w-5 shrink-0 text-[var(--neutral-500)]" />
          <span className={cn(!(from && to) && "text-muted-foreground")}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[min(100vw-2rem,720px)] p-4" align="start">
        <div className="flex flex-wrap gap-2 pb-4">
          {chipPresets.map((p) => (
            <Button
              key={p.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-[var(--neutral-200)] text-xs font-normal"
              onClick={() => {
                onChange({ from: p.from, to: p.to });
                setAnchor(null);
                setLeftMonth(p.from);
                setRightMonth(addMonths(p.from, 1));
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <RangeCalendar
            month={leftMonth}
            onMonthChange={setLeftMonth}
            from={from}
            to={to}
            onDayClick={handleDayClick}
          />
          <RangeCalendar
            month={rightMonth}
            onMonthChange={setRightMonth}
            from={from}
            to={to}
            onDayClick={handleDayClick}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
