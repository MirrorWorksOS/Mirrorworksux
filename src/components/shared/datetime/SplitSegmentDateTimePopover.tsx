"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

function hour12FromDate(d: Date): number {
  const h = d.getHours();
  const m = h % 12;
  return m === 0 ? 12 : m;
}

function isPm(d: Date): boolean {
  return d.getHours() >= 12;
}

function setTimeOnDate(
  base: Date,
  opts: { hour12: number; minute: number; pm: boolean },
): Date {
  const next = new Date(base);
  let h24: number;
  if (!opts.pm) {
    h24 = opts.hour12 === 12 ? 0 : opts.hour12;
  } else {
    h24 = opts.hour12 === 12 ? 12 : opts.hour12 + 12;
  }
  next.setHours(h24, opts.minute, 0, 0);
  return next;
}

const HOURS_12 = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const MINUTES_FIVE = Array.from({ length: 12 }, (_, i) => i * 5);

export interface SplitSegmentDateTimePopoverProps {
  value: Date;
  onChange: (date: Date) => void;
  /** e.g. "Select date and time for this action" */
  ariaLabel: string;
  className?: string;
}

/**
 * Right segment of a split control: outline trigger + popover with calendar and 12h time columns.
 * Styled to align with {@link Button} `variant="outline"` split tails.
 */
export function SplitSegmentDateTimePopover({
  value,
  onChange,
  ariaLabel,
  className,
}: SplitSegmentDateTimePopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const next = new Date(selected);
    next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(next);
  };

  const selHour = hour12FromDate(value);
  const selMin = value.getMinutes();
  const selPm = isPm(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={ariaLabel}
          className={cn(
            "h-10 min-h-0 shrink-0 rounded-l-none rounded-r-[var(--shape-md)] border-l-0 bg-white px-2.5 font-normal hover:bg-[var(--neutral-50)] sm:h-12 sm:min-h-[48px] sm:px-3",
            className,
          )}
        >
          <CalendarClock className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="flex min-w-0 flex-col items-start gap-0 text-left leading-tight">
            <span className="text-xs tabular-nums text-foreground sm:text-sm">
              {format(value, "MMM d, yyyy")}
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground sm:text-xs">
              {format(value, "h:mm a")}
            </span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0" sideOffset={6}>
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
            classNames={{
              day_selected:
                "bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] hover:text-[#2C2C2C] focus:bg-[var(--mw-yellow-400)] focus:text-[#2C2C2C]",
            }}
          />
          <div className="flex max-h-[min(320px,50vh)] flex-col divide-y border-t border-[var(--neutral-200)] sm:max-h-[300px] sm:w-auto sm:flex-row sm:divide-x sm:divide-y-0 sm:border-l sm:border-t-0">
            <ScrollArea className="h-32 w-full sm:h-[300px] sm:w-[52px]">
              <div className="flex flex-row gap-0.5 p-2 sm:flex-col">
                {HOURS_12.map((hour) => (
                  <Button
                    key={hour}
                    type="button"
                    variant={selHour === hour ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 min-w-9 shrink-0 px-0 tabular-nums sm:h-9 sm:w-full",
                      selHour === hour &&
                        "bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)] hover:text-white",
                    )}
                    onClick={() =>
                      onChange(setTimeOnDate(value, { hour12: hour, minute: selMin, pm: selPm }))
                    }
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="h-32 w-full sm:h-[300px] sm:w-[52px]">
              <div className="flex flex-row gap-0.5 p-2 sm:flex-col">
                {MINUTES_FIVE.map((minute) => (
                  <Button
                    key={minute}
                    type="button"
                    variant={selMin === minute ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 min-w-9 shrink-0 px-0 tabular-nums sm:h-9 sm:w-full",
                      selMin === minute &&
                        "bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)] hover:text-white",
                    )}
                    onClick={() =>
                      onChange(
                        setTimeOnDate(value, { hour12: selHour, minute, pm: selPm }),
                      )
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="h-16 w-full sm:h-[300px] sm:w-[48px]">
              <div className="flex flex-row gap-0.5 p-2 sm:flex-col">
                {(["AM", "PM"] as const).map((label) => {
                  const pm = label === "PM";
                  const active = selPm === pm;
                  return (
                    <Button
                      key={label}
                      type="button"
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 min-w-12 shrink-0 sm:h-9 sm:w-full",
                        active &&
                          "bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)] hover:text-white",
                      )}
                      onClick={() =>
                        onChange(
                          setTimeOnDate(value, {
                            hour12: selHour,
                            minute: selMin,
                            pm,
                          }),
                        )
                      }
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
