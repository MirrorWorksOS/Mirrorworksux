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
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Portal mount node — use the sheet/dialog body so the popover stacks above the overlay. */
  popoverContainer?: HTMLElement | null;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  popoverContainer,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() => value ?? new Date());

  React.useEffect(() => {
    if (value) setVisibleMonth(value);
  }, [value]);

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-12 min-h-[48px] w-full justify-start gap-2 border-[var(--neutral-200)] font-normal tabular-nums",
            className,
          )}
        >
          <Calendar className="h-5 w-5 shrink-0 text-[var(--neutral-500)]" />
          <span className={cn(!value && "text-muted-foreground")}>
            {value ? format(value, "MMM d, yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        container={popoverContainer}
        className="w-auto p-4"
        align="start"
      >
        <div className="flex items-center justify-between gap-4 pb-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium tabular-nums text-foreground">
            {format(visibleMonth, "MMMM yyyy")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekLabels.map((d) => (
            <div
              key={d}
              className="flex h-8 w-9 items-center justify-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const selected = value ? isSameDay(day, value) : false;
            const inMonth = isSameMonth(day, visibleMonth);
            const today = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  onChange(day);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-[var(--shape-md)] text-sm transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                  !inMonth && "text-muted-foreground opacity-40",
                  inMonth && "text-foreground hover:bg-[var(--neutral-100)]",
                  selected && "bg-[var(--mw-yellow-400)] font-medium text-primary-foreground hover:bg-[var(--mw-yellow-400)]",
                  today && !selected && "font-medium",
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
