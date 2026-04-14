/**
 * Capable-to-Promise — calculated delivery date card for quotes.
 * Shows capacity utilisation, earliest available date, confidence, and bottleneck.
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Gauge, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sellService } from "@/services";
import type { CapableToPromiseResult } from "@/types/entities";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { ProgressBar } from "@/components/shared/data/ProgressBar";

function confidenceColour(pct: number): string {
  if (pct >= 80) return "var(--mw-success)";
  if (pct >= 60) return "var(--mw-warning)";
  return "var(--mw-error)";
}

function ConfidenceRing({ percent }: { percent: number }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const colour = confidenceColour(percent);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--neutral-200)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className="absolute text-sm font-medium tabular-nums"
        style={{ color: colour }}
      >
        {percent}%
      </span>
    </div>
  );
}

export function CapableToPromise() {
  const [data, setData] = useState<CapableToPromiseResult | null>(null);

  useEffect(() => {
    sellService.getCapableToPromise().then(setData);
  }, []);

  if (!data) {
    return (
      <Card variant="flat" className="p-6 animate-pulse">
        <div className="h-32 rounded bg-[var(--neutral-100)]" />
      </Card>
    );
  }

  const formattedDate = new Date(data.earliestDate).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat" className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-medium text-foreground">Capable-to-Promise</h3>
            <p className="text-sm text-muted-foreground">Calculated delivery estimate</p>
          </div>
          <ConfidenceRing percent={data.confidencePercent} />
        </div>

        {/* Earliest date */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-[var(--neutral-500)]">Earliest Available Date</p>
            <p className="text-lg font-semibold text-foreground">{formattedDate}</p>
          </div>
        </div>

        {/* Capacity utilisation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[var(--neutral-600)]">
              <Gauge className="h-4 w-4" strokeWidth={1.5} />
              Capacity Utilisation
            </span>
            <span className="font-mono text-foreground">{data.capacityUtilization}%</span>
          </div>
          <ProgressBar value={data.capacityUtilization} showLabel={false} />
        </div>

        {/* Bottleneck */}
        {data.bottleneckWorkCenter && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--mw-warning-light)] px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-[var(--mw-warning)]" strokeWidth={1.5} />
            <span className="text-sm text-[var(--mw-yellow-800)]">
              Bottleneck: <span className="font-medium">{data.bottleneckWorkCenter}</span>
            </span>
          </div>
        )}

        {/* Confidence badge */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[var(--neutral-500)]">Confidence Level</span>
          <Badge
            variant="outline"
            className="font-mono tabular-nums"
          >
            {data.confidencePercent >= 80 ? "High" : data.confidencePercent >= 60 ? "Medium" : "Low"}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}
