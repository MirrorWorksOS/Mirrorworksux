import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import {
  IconWell,
  LUCIDE_STROKE,
  type IconSurface,
} from "@/components/shared/icons/IconWell";

export type { IconSurface };

export interface KpiStatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Icon well: default mirage + white stroke on light dashboard canvas; `key` = yellow thread (use sparingly). */
  iconSurface?: IconSurface;
  /** Standard: label under icon row. Compact: dense 6-up. Inline-end: StatCard-style. */
  layout?: "standard" | "compact" | "inlineEnd";
  /** Compact: icon only (no well), neutral stroke. */
  iconStyle?: "well" | "plain";
  hint?: string;
  trailing?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  iconSize?: "md" | "sm";
  iconWellClassName?: string;
  /** Compact icon well shape */
  iconWellShape?: "squircle" | "round";
}

export function KpiStatCard({
  label,
  value,
  icon: Icon,
  iconSurface = "onLight",
  layout = "standard",
  iconStyle = "well",
  hint,
  trailing,
  footer,
  className,
  valueClassName,
  iconSize = "md",
  iconWellClassName,
  iconWellShape = "round",
}: KpiStatCardProps) {
  const valueClasses = cn(
    "tabular-nums tracking-tight text-[var(--neutral-900)]",
    layout === "compact"
      ? "text-2xl font-light"
      : "text-2xl font-light",
    valueClassName,
  );

  const renderIcon = () => {
    if (Icon === undefined) return null;
    if (iconStyle === "plain") {
      return (
        <Icon
          className="text-[var(--neutral-600)]"
          strokeWidth={LUCIDE_STROKE}
          aria-hidden
        />
      );
    }
    return (
      <IconWell
        icon={Icon}
        surface={iconSurface}
        shape={layout === "compact" ? iconWellShape : "squircle"}
        size={iconSize}
        className={iconWellClassName}
      />
    );
  };

  if (layout === "inlineEnd") {
    return (
      <Card variant="flat" className={cn("p-6", className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--neutral-500)]">{label}</p>
            <div className={valueClasses}>{value}</div>
            {footer}
          </div>
          {Icon !== undefined ? (
            iconStyle === "plain" ? (
              <Icon
                className="h-5 w-5 text-[var(--neutral-600)]"
                strokeWidth={LUCIDE_STROKE}
                aria-hidden
              />
            ) : (
              <IconWell
                icon={Icon}
                surface={iconSurface}
                shape="squircle"
                size={iconSize}
                className={iconWellClassName}
              />
            )
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
          "mw-shine mw-shine-once border border-[var(--border)] p-6 transition-shadow duration-[var(--duration-short2)] ease-[var(--ease-standard)] hover:shadow-md",
          className,
        )}
      >
        {Icon !== undefined && (
          <div className="mb-4">{renderIcon()}</div>
        )}
        <div className={valueClasses}>{value}</div>
        <p className="mt-1 text-xs font-medium text-[var(--neutral-500)]">
          {label}
        </p>
        {hint !== undefined && hint !== "" ? (
          <p className="mt-1 text-xs text-[var(--neutral-500)]">{hint}</p>
        ) : null}
        {footer}
      </Card>
    );
  }

  return (
    <Card
      variant="flat"
      className={cn(
        "mw-shine mw-shine-once p-6 transition-shadow duration-[var(--duration-short2)] ease-[var(--ease-standard)] hover:shadow-md",
        className,
      )}
    >
      {(Icon !== undefined || trailing !== undefined) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          {Icon !== undefined ? renderIcon() : <span />}
          {trailing !== undefined ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {trailing}
            </div>
          ) : null}
        </div>
      )}
      <p className="mb-1 text-sm font-medium text-[var(--neutral-500)]">
        {label}
      </p>
      <div className={valueClasses}>{value}</div>
      {hint !== undefined && hint !== "" ? (
        <p className="mt-2 text-xs text-[var(--neutral-500)]">{hint}</p>
      ) : null}
      {footer}
    </Card>
  );
}
