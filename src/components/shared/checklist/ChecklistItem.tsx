import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/components/ui/utils";

export interface ChecklistItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
  className?: string;
}

export function ChecklistItem({
  id,
  label,
  description,
  checked,
  onToggle,
  className,
}: ChecklistItemProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-[56px] cursor-pointer items-start gap-3 border-b border-[var(--neutral-200)] py-3 last:border-b-0 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--neutral-900)]/[0.04]",
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onToggle(id, v === true)}
        className="mt-1 size-5 shrink-0 rounded-[4px] data-[state=checked]:border-[var(--mw-yellow-400)] data-[state=checked]:bg-[var(--mw-yellow-400)] data-[state=checked]:text-[var(--neutral-800)]"
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-medium text-[var(--neutral-900)] transition-[color,text-decoration] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
            checked && "text-muted-foreground line-through",
          )}
        >
          {label}
        </span>
        {description ?
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        : null}
      </span>
    </label>
  );
}
