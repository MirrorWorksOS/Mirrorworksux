import * as React from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/components/ui/utils";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseHHmm(s: string): { hour12: number; minute: number; pm: boolean } {
  const [h, m] = s.split(":").map((x) => parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return { hour12: 9, minute: 0, pm: false };
  }
  const pm = h >= 12;
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, pm };
}

function toHHmm(hour12: number, minute: number, pm: boolean): string {
  let h24: number;
  if (!pm) {
    h24 = hour12 === 12 ? 0 : hour12;
  } else {
    h24 = hour12 === 12 ? 12 : hour12 + 12;
  }
  return `${pad(h24)}:${pad(minute)}`;
}

const HOURS_12 = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const MINUTES_FIVE = Array.from({ length: 12 }, (_, i) => i * 5);

export interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
  popoverContainer?: HTMLElement | null;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  className,
  popoverContainer,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { hour12: selHour, minute: selMin, pm: selPm } = parseHHmm(value ?? "");

  const apply = (hour12: number, minute: number, pm: boolean) => {
    onChange(toHHmm(hour12, minute, pm));
  };

  const displayDate = React.useMemo(() => {
    const d = new Date();
    const [h, m] = (value ?? "09:00").split(":").map((x) => parseInt(x, 10));
    d.setHours(Number.isFinite(h) ? h : 9, Number.isFinite(m) ? m : 0, 0, 0);
    return d;
  }, [value]);

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
          <Clock className="h-5 w-5 shrink-0 text-[var(--neutral-500)]" />
          <span className={cn(!value && "text-muted-foreground")}>
            {value ? format(displayDate, "h:mm a") : "Select time"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        container={popoverContainer}
        className="w-auto p-4"
        align="start"
      >
        <div className="flex max-h-[min(320px,50vh)] flex-col divide-y overflow-hidden rounded-[var(--shape-md)] border border-[var(--neutral-200)] sm:max-h-[300px] sm:w-auto sm:flex-row sm:divide-x sm:divide-y-0">
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
                  onClick={() => {
                    apply(hour, selMin, selPm);
                  }}
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
                  onClick={() => {
                    apply(selHour, minute, selPm);
                  }}
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
                    onClick={() => {
                      apply(selHour, selMin, pm);
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
