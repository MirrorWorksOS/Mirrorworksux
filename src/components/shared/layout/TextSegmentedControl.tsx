import * as React from "react";

import { cn } from "@/components/ui/utils";

export interface TextSegmentOption {
  key: string;
  label: string;
}

export interface TextSegmentedControlProps {
  options: TextSegmentOption[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
  /** `aria-label` for the tablist */
  ariaLabel?: string;
}

/**
 * Label-based segmented control (Carriers / Rates / Manifests, etc.).
 * Matches Sell CRM pattern: bordered pill track, MW yellow active segment.
 */
export function TextSegmentedControl({
  options,
  value,
  onChange,
  className,
  ariaLabel = "Tabs",
}: TextSegmentedControlProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-fit rounded-full border border-[var(--border)] bg-[var(--neutral-100)] p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              "h-12 min-h-[48px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors duration-[var(--duration-short2)] ease-[var(--ease-standard)]",
              active
                ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] hover:text-[var(--neutral-800)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
