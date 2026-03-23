import * as React from "react";
import { cn } from "@/components/ui/utils";
import { MW_TOOLTIP_STYLE } from "./chart-theme";

export interface ChartTooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  dataKey: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, name: string) => string;
  className?: string;
}

function formatDefault(value: number): string {
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits: 2 }).format(value);
}

function toNumber(value: number | string): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={cn(className)} style={MW_TOOLTIP_STYLE}>
      {label ? (
        <div className="text-xs font-medium text-[var(--neutral-900)] mb-1.5">{label}</div>
      ) : null}
      <ul className="space-y-1">
        {payload.map((item, index) => {
          const num = toNumber(item.value);
          const text = formatter?.(num, item.name) ?? formatDefault(num);
          return (
            <li
              key={`${String(item.dataKey)}-${item.name}-${index}`}
              className="flex items-center gap-2 text-sm text-[var(--neutral-700)]"
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  !item.color && "bg-[var(--neutral-400)]",
                )}
                style={item.color ? { backgroundColor: item.color } : undefined}
              />
              <span className="flex-1 min-w-0">{item.name}</span>
              <span className="tabular-nums font-medium text-[var(--neutral-900)]">{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
