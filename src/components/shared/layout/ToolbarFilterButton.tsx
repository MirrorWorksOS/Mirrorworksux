import * as React from "react";
import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

const LUCIDE_STROKE = 1.5;

export interface ToolbarFilterButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size" | "children"> {
  label?: string;
}

/** Outline pill filter control for module schedule/calendar toolbars (design system §7). */
export function ToolbarFilterButton({
  label = "Filter",
  className,
  ...props
}: ToolbarFilterButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-12 min-h-[48px] gap-2 rounded-full border-[var(--neutral-200)] bg-white px-5 text-sm font-medium text-[var(--mw-mirage)] hover:bg-[var(--neutral-50)]",
        className,
      )}
      {...props}
    >
      <Filter className="h-4 w-4 shrink-0" strokeWidth={LUCIDE_STROKE} aria-hidden />
      {label}
    </Button>
  );
}
