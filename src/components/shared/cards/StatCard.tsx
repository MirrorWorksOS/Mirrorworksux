import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; label?: string };
  icon?: LucideIcon;
  iconBg?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg,
  className,
}: StatCardProps) {
  const changePositive = change !== undefined && change.value > 0;
  const changeNegative = change !== undefined && change.value < 0;

  return (
    <Card variant="flat" className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--neutral-900)]">
            {value}
          </p>
          {change !== undefined && (
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-sm font-medium tabular-nums",
                changePositive && "text-[var(--mw-success)]",
                changeNegative && "text-[var(--mw-error)]",
                !changePositive && !changeNegative && "text-muted-foreground",
              )}
            >
              {changePositive && <TrendingUp className="h-4 w-4 shrink-0" aria-hidden />}
              {changeNegative && <TrendingDown className="h-4 w-4 shrink-0" aria-hidden />}
              <span>
                {changePositive ? "+" : ""}
                {change.value}
                {change.label !== undefined ? ` ${change.label}` : ""}
              </span>
            </div>
          )}
        </div>
        {Icon !== undefined && (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-[var(--shape-lg)] p-2",
              iconBg ?? "bg-[var(--neutral-100)]",
            )}
          >
            <Icon className="h-5 w-5 text-[var(--neutral-700)]" aria-hidden />
          </div>
        )}
      </div>
    </Card>
  );
}
