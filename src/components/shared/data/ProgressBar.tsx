import * as React from "react";
import { cn } from "@/components/ui/utils";
import { getChartScaleColour } from "@/components/shared/charts/chart-theme";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "linear" | "segmented";
  segments?: { value: number; color: string }[];
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "linear",
  segments,
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const cap = max > 0 ? max : 1;
  const pct = Math.min(100, Math.max(0, (value / cap) * 100));

  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={cn("flex items-center gap-3 w-full min-w-0", className)}>
      <div
        className={cn(
          "flex-1 min-w-0 rounded-full bg-[var(--neutral-100)] overflow-hidden",
          height,
        )}
      >
        {variant === "linear" ? (
          <div
            className="h-full rounded-full transition-[width] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
            style={{ width: `${pct}%`, backgroundColor: getChartScaleColour(pct) }}
          />
        ) : (
          <div className="flex h-full w-full rounded-full overflow-hidden">
            {(() => {
              const segs = segments ?? [];
              const total = segs.reduce((s, seg) => s + seg.value, 0) || 1;
              return segs.map((seg, i) => (
                <div
                  key={i}
                  className="h-full shrink-0"
                  style={{
                    width: `${(seg.value / total) * 100}%`,
                    backgroundColor: seg.color,
                  }}
                />
              ));
            })()}
          </div>
        )}
      </div>
      {showLabel ? (
        <span className="text-xs font-medium tabular-nums text-[var(--neutral-700)] shrink-0">
          {Math.round(pct)}%
        </span>
      ) : null}
    </div>
  );
}
