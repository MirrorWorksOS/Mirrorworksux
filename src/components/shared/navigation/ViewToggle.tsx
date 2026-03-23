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

export function ViewToggle({
  options,
  value,
  onChange,
  className,
}: ViewToggleProps) {
  return (
    <div
      className={cn(
        "bg-[var(--neutral-100)] rounded-[var(--shape-md)] p-1 inline-flex gap-0.5",
        className,
      )}
      role="tablist"
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
              "px-3 py-1.5 text-sm transition-all inline-flex items-center justify-center gap-1.5 rounded-[var(--shape-sm)]",
              active
                ? "bg-white shadow-sm text-[var(--mw-mirage)] font-medium"
                : "text-[var(--neutral-500)] hover:text-[var(--neutral-700)]",
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
