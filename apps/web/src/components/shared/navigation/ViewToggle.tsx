import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface ViewOption {
  key: string;
  label: string;
  icon?: LucideIcon;
}

export interface ViewToggleProps {
  options: ViewOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Icon + label segmented control — same token rules as `TextSegmentedControl` / Sell CRM (yellow active, bordered pill).
 */
export function ViewToggle({
  options,
  value,
  onChange,
  className,
}: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View"
      className={cn(
        "inline-flex w-fit rounded-full border border-[var(--border)] bg-[var(--neutral-100)] p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              "inline-flex h-12 min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-[var(--duration-short2)] ease-[var(--ease-standard)]",
              active
                ? "bg-[var(--mw-yellow-400)] text-primary-foreground"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] hover:text-[var(--neutral-800)]",
            )}
          >
            {Icon ? <Icon className="w-4 h-4 shrink-0" aria-hidden /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
