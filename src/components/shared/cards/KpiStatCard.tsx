import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

const iconWellVariants = cva(
  "flex shrink-0 items-center justify-center rounded-[var(--shape-md)]",
  {
    variants: {
      tone: {
        neutral:
          "bg-[var(--neutral-100)] [&_svg]:text-[var(--neutral-700)]",
        brand:
          "bg-[var(--mw-mirage)] [&_svg]:text-[var(--mw-yellow-400)]",
        info: "bg-[var(--mw-blue-100)] [&_svg]:text-[var(--mw-blue)]",
        warning:
          "bg-[var(--mw-amber-50)] [&_svg]:text-[var(--mw-yellow-900)]",
        danger:
          "bg-[var(--mw-error-100)] [&_svg]:text-[var(--mw-error)]",
        success:
          "bg-[color-mix(in_srgb,var(--mw-success)_14%,transparent)] [&_svg]:text-[var(--mw-success)]",
      },
      size: {
        md: "h-10 w-10 p-2 [&_svg]:h-5 [&_svg]:w-5",
        sm: "h-8 w-8 p-1.5 [&_svg]:h-4 [&_svg]:w-4",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

export type KpiTone = NonNullable<VariantProps<typeof iconWellVariants>["tone"]>;

export interface KpiStatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Visual treatment for the icon container */
  tone?: KpiTone;
  /** Standard: label under icon row (Sell/Book/Plan). Compact: dense 6-up strip (Ship). Inline-end: label/value left, icon right (legacy StatCard). */
  layout?: "standard" | "compact" | "inlineEnd";
  /** `plain` = monochrome icon only (compact dashboards). `well` = tokenised background. */
  iconStyle?: "well" | "plain";
  hint?: string;
  trailing?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  /** Override icon well size */
  iconSize?: "md" | "sm";
  /** Merged after tone classes (e.g. legacy StatCard `iconBg`) */
  iconWellClassName?: string;
}

export function KpiStatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  layout = "standard",
  iconStyle = "well",
  hint,
  trailing,
  footer,
  className,
  valueClassName,
  iconSize = "md",
  iconWellClassName,
}: KpiStatCardProps) {
  const valueClasses = cn(
    "text-2xl font-semibold tabular-nums tracking-tight text-[var(--mw-mirage)]",
    valueClassName,
  );

  if (layout === "inlineEnd") {
    return (
      <Card variant="flat" className={cn("p-6", className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className={valueClasses}>{value}</div>
            {footer}
          </div>
          {Icon !== undefined ? (
            <div
              className={cn(
                iconWellVariants({ tone, size: iconSize }),
                iconWellClassName,
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  if (layout === "compact") {
    return (
      <Card
        variant="flat"
        className={cn(
          "border border-[var(--border)] p-6 transition-shadow duration-[var(--duration-short2)] ease-[var(--ease-standard)] hover:shadow-md",
          className,
        )}
      >
        {Icon !== undefined && (
          <div className="mb-4">
            {iconStyle === "plain" ? (
              <Icon
                className="h-4 w-4 text-[var(--neutral-500)]"
                strokeWidth={1.5}
                aria-hidden
              />
            ) : (
              <div
                className={cn(
                  iconWellVariants({ tone, size: iconSize }),
                  iconWellClassName,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            )}
          </div>
        )}
        <div className={valueClasses}>{value}</div>
        <p className="mt-1 text-xs font-medium text-[var(--neutral-500)]">{label}</p>
        {hint !== undefined && hint !== "" ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
        {footer}
      </Card>
    );
  }

  return (
    <Card
      variant="flat"
      className={cn(
        "p-6 transition-shadow duration-[var(--duration-short2)] ease-[var(--ease-standard)] hover:shadow-md",
        className,
      )}
    >
      {(Icon !== undefined || trailing !== undefined) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          {Icon !== undefined ? (
            <div
              className={cn(
                iconWellVariants({ tone, size: iconSize }),
                iconWellClassName,
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          ) : (
            <span />
          )}
          {trailing !== undefined ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {trailing}
            </div>
          ) : null}
        </div>
      )}
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className={valueClasses}>{value}</div>
      {hint !== undefined && hint !== "" ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {footer}
    </Card>
  );
}
