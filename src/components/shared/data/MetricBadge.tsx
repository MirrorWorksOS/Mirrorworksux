import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/ui/utils";

const metricBadgeVariants = cva(
  "rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5",
  {
    variants: {
      variant: {
        neutral: "bg-[var(--neutral-100)] text-[var(--neutral-600)]",
        success: "bg-[var(--mw-success-light)] text-[var(--mw-success)]",
        warning: "bg-[var(--mw-warning-light)] text-[var(--mw-yellow-800)]",
        error: "bg-[var(--mw-error-light)] text-[var(--mw-error)]",
        info: "bg-[var(--mw-info-light)] text-[var(--mw-info)]",
        accent: "bg-[var(--mw-yellow-50)] text-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface MetricBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string | number;
  label?: string;
  variant?: VariantProps<typeof metricBadgeVariants>["variant"];
  className?: string;
}

export function MetricBadge({
  value,
  label,
  variant = "neutral",
  className,
  ...props
}: MetricBadgeProps) {
  return (
    <span className={cn(metricBadgeVariants({ variant }), className)} {...props}>
      <span className="text-xs font-medium tabular-nums">{value}</span>
      {label ? <span className="text-xs font-medium text-[var(--neutral-500)]">{label}</span> : null}
    </span>
  );
}
