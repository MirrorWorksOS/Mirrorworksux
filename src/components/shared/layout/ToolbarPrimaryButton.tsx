import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

const LUCIDE_STROKE = 1.5;

export interface ToolbarPrimaryButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size"> {
  icon?: LucideIcon;
}

/** Primary CTA pill for module toolbars — MW yellow, dark grey label text (design system §7). */
export function ToolbarPrimaryButton({
  icon: Icon,
  children,
  className,
  ...props
}: ToolbarPrimaryButtonProps) {
  return (
    <Button
      type="button"
      className={cn(
        "h-12 min-h-[48px] gap-2 rounded-full bg-[var(--mw-yellow-400)] px-5 text-sm font-medium text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={LUCIDE_STROKE} aria-hidden /> : null}
      {children}
    </Button>
  );
}
