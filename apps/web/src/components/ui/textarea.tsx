import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/**
 * Textarea — Radix Themes-aligned variant system.
 * Shares variant vocabulary with Input so forms feel consistent.
 */
const textareaVariants = cva(
  [
    "resize-none placeholder:text-muted-foreground",
    "flex field-sizing-content min-h-16 w-full rounded-[var(--shape-md)] px-3 py-2 text-base",
    "transition-[background-color,border-color,box-shadow] duration-[var(--duration-short2)] ease-[var(--ease-standard)]",
    "outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
    },
    defaultVariants: {
      variant: "surface",
    },
  },
);

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
