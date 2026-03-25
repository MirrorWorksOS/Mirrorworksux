import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";

const LUCIDE_STROKE = 1.5;

export interface IconViewOption {
  key: string;
  icon: LucideIcon;
  /** Accessible name */
  label: string;
}

export interface IconViewToggleProps {
  options: IconViewOption[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Icon-only segmented control (Sell CRM toolbar pattern).
 * Bordered pill track + MW yellow active segment; min 48px touch targets.
 */
export function IconViewToggle({
  options,
  value,
  onChange,
  className,
}: IconViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View"
      className={cn(
        "inline-flex rounded-full border border-[var(--border)] bg-[var(--neutral-100)] p-1",
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
            title={opt.label}
            aria-label={opt.label}
            onClick={() => onChange(opt.key)}
            className={cn(
              "flex h-12 min-h-[48px] w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--duration-short2)] ease-[var(--ease-standard)]",
              active
                ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] hover:text-[var(--neutral-800)]",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={LUCIDE_STROKE} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
