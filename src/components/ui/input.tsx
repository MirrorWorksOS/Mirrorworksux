import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/**
 * Input — Radix Themes-aligned variant system.
 *
 * variant: "surface" (default, subtle fill) | "classic" (solid border) | "soft" (tinted fill) | "ghost" (no chrome)
 * size:    "1" (small, h-8) | "2" (default, h-9) | "3" (large, h-11)
 *
 * Matches the variant vocabulary used by Button / Card / Select / Textarea so
 * form scenes can be composed from a single mental model.
 */
const inputVariants = cva(
  [
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "flex w-full min-w-0 rounded-[var(--shape-md)] px-3 py-1 text-base",
    "transition-[background-color,border-color,box-shadow] duration-[var(--duration-short2)] ease-[var(--ease-standard)]",
    "outline-none",
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        surface:
          "border border-input bg-input-background dark:bg-input/30",
        classic:
          "border border-input bg-card shadow-xs",
        soft:
          "border border-transparent bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)]/40",
        ghost:
          "border border-transparent bg-transparent hover:bg-[var(--neutral-100)]/60 dark:hover:bg-[var(--neutral-200)]/30",
      },
      size: {
        "1": "h-8 text-sm",
        "2": "h-9",
        "3": "h-11 text-base",
      },
    },
    defaultVariants: {
      variant: "surface",
      size: "2",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
