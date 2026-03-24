import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { KpiStatCard, type IconSurface } from "@/components/shared/cards/KpiStatCard";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; label?: string };
  icon?: LucideIcon;
  /** @deprecated Merged into icon well styling via design tokens */
  iconBg?: string;
  className?: string;
  iconSurface?: IconSurface;
}

/**
 * Thin wrapper around `KpiStatCard` with icon on the right (inline-end layout).
 * For module dashboards, prefer `KpiStatCard` directly.
 */
export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg,
  className,
  iconSurface = "onLight",
}: StatCardProps) {
  const changePositive = change !== undefined && change.value > 0;
  const changeNegative = change !== undefined && change.value < 0;

  const footer =
    change !== undefined ? (
      <div
        className={cn(
          "mt-1 flex items-center gap-1 text-sm font-medium tabular-nums text-[var(--neutral-600)]",
          changePositive && "text-[var(--neutral-900)]",
          changeNegative && "text-[var(--neutral-700)]",
        )}
      >
        {changePositive && (
          <TrendingUp
            className="h-4 w-4 shrink-0"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
        {changeNegative && (
          <TrendingDown
            className="h-4 w-4 shrink-0"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
        <span>
          {changePositive ? "+" : ""}
          {change.value}
          {change.label !== undefined ? ` ${change.label}` : ""}
        </span>
      </div>
    ) : undefined;

  return (
    <KpiStatCard
      label={label}
      value={value}
      icon={Icon}
      iconSurface={iconSurface}
      layout="inlineEnd"
      className={className}
      footer={footer}
      iconWellClassName={iconBg}
    />
  );
}
