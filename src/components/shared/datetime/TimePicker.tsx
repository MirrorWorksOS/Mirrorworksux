import * as React from "react";
import { Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

export interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--neutral-500)]" />
      <Input
        type="time"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-12 min-h-[48px] rounded-[var(--shape-md)] border-[var(--neutral-200)] pl-10 font-normal tabular-nums"
      />
    </div>
  );
}
