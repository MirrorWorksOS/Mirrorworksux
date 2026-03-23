import * as React from "react";

import { cn } from "@/components/ui/utils";

import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

function padTimePart(n: number): string {
  return n.toString().padStart(2, "0");
}

function dateToTimeString(d: Date): string {
  return `${padTimePart(d.getHours())}:${padTimePart(d.getMinutes())}`;
}

function applyTimeToDate(base: Date, timeHHmm: string): Date {
  const [h, m] = timeHHmm.split(":").map((x) => parseInt(x, 10));
  const next = new Date(base);
  next.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return next;
}

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({ value, onChange, disabled, className }: DateTimePickerProps) {
  const timeValue = value ? dateToTimeString(value) : "";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4", className)}>
      <div className="min-w-0 flex-1">
        <DatePicker
          value={value}
          disabled={disabled}
          onChange={(d) => {
            if (!d) {
              onChange(undefined);
              return;
            }
            if (value) {
              onChange(applyTimeToDate(d, dateToTimeString(value)));
            } else {
              onChange(applyTimeToDate(d, "09:00"));
            }
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <TimePicker
          value={timeValue}
          disabled={disabled}
          onChange={(t) => {
            if (!value) {
              const base = new Date();
              onChange(applyTimeToDate(base, t));
              return;
            }
            onChange(applyTimeToDate(value, t));
          }}
        />
      </div>
    </div>
  );
}
