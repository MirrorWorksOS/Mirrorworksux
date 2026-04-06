/**
 * MakeScrapAnalysis — Heat map of scrap rates at /make/scrap-analysis.
 *
 * Grid of machine cards coloured by scrap rate (inverted scale — high scrap = high colour).
 * Group by: equipment (default), operator, week.
 * KPI cards: avg scrap rate, worst machine, total scrap qty.
 */

import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { AlertTriangle, BarChart3, Trash2 } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { cn } from "@/components/ui/utils";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { getChartScaleColour } from "@/components/shared/charts/chart-theme";
import { makeService } from "@/services/makeService";
import type { ScrapRecord } from "@/types/entities";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type GroupBy = "equipment" | "operator" | "week";

interface AggregatedCell {
  key: string;
  label: string;
  avgScrapRate: number;
  totalScrapQty: number;
  recordCount: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function aggregate(records: ScrapRecord[], groupBy: GroupBy): AggregatedCell[] {
  const map = new Map<string, { label: string; rates: number[]; qty: number }>();

  for (const r of records) {
    let key: string;
    let label: string;

    switch (groupBy) {
      case "equipment":
        key = r.machineId;
        label = r.machineName;
        break;
      case "operator":
        key = r.operatorId;
        label = r.operatorName;
        break;
      case "week":
        key = r.week;
        label = r.week;
        break;
    }

    const existing = map.get(key);
    if (existing) {
      existing.rates.push(r.scrapRatePercent);
      existing.qty += r.scrapQty;
    } else {
      map.set(key, { label, rates: [r.scrapRatePercent], qty: r.scrapQty });
    }
  }

  return Array.from(map.entries()).map(([key, val]) => ({
    key,
    label: val.label,
    avgScrapRate: val.rates.reduce((a, b) => a + b, 0) / val.rates.length,
    totalScrapQty: val.qty,
    recordCount: val.rates.length,
  }));
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MakeScrapAnalysis() {
  const [records, setRecords] = useState<ScrapRecord[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("equipment");

  useEffect(() => {
    makeService.getScrapRecords().then(setRecords);
  }, []);

  const cells = useMemo(() => aggregate(records, groupBy), [records, groupBy]);

  // KPI computations
  const avgScrapRate =
    records.length > 0
      ? records.reduce((s, r) => s + r.scrapRatePercent, 0) / records.length
      : 0;

  const totalScrapQty = records.reduce((s, r) => s + r.scrapQty, 0);

  const worstMachine = useMemo(() => {
    const equipCells = aggregate(records, "equipment");
    return equipCells.length > 0
      ? equipCells.reduce((a, b) => (a.avgScrapRate > b.avgScrapRate ? a : b))
      : null;
  }, [records]);

  const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
    { value: "equipment", label: "Equipment" },
    { value: "operator", label: "Operator" },
    { value: "week", label: "Week" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Scrap Analysis"
        subtitle="Heat map of scrap rates across equipment, operators, and time"
        breadcrumbs={[
          { label: "Make", href: "/make" },
          { label: "Scrap Analysis" },
        ]}
        actions={
          <div className="flex items-center gap-1 rounded-[var(--shape-md)] border border-[var(--neutral-200)] p-1">
            {GROUP_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={groupBy === opt.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setGroupBy(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* KPI row */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <KpiStatCard
            label="Avg Scrap Rate"
            value={`${avgScrapRate.toFixed(1)}%`}
            icon={BarChart3}
            layout="compact"
          />
          <KpiStatCard
            label="Worst Machine"
            value={worstMachine?.label ?? "N/A"}
            icon={AlertTriangle}
            layout="compact"
            hint={
              worstMachine
                ? `${worstMachine.avgScrapRate.toFixed(1)}% avg scrap`
                : undefined
            }
          />
          <KpiStatCard
            label="Total Scrap Qty"
            value={totalScrapQty.toString()}
            icon={Trash2}
            layout="compact"
            hint="Units scrapped across all records"
          />
        </motion.div>

        {/* Heat map grid */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <h3 className="mb-4 text-base font-medium text-foreground">
              Scrap Rate — by {groupBy}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cells.map((cell) => {
                // Inverted scale: high scrap = high colour (bad)
                // scrapRate * 10 maps ~0-10% scrap to 0-100 scale
                const scaleValue = Math.min(cell.avgScrapRate * 10, 100);
                const colour = getChartScaleColour(scaleValue);

                return (
                  <motion.div key={cell.key} variants={staggerItem}>
                    <div
                      className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] p-4 transition-shadow hover:shadow-md"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${colour} 12%, transparent)`,
                        borderColor: `color-mix(in srgb, ${colour} 30%, var(--neutral-200))`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {cell.label}
                        </h4>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
                          style={{
                            borderColor: `color-mix(in srgb, ${colour} 40%, transparent)`,
                            color: colour,
                          }}
                        >
                          {cell.avgScrapRate.toFixed(1)}%
                        </Badge>
                      </div>

                      {/* Scrap bar */}
                      <div className="mb-2 h-2 w-full rounded-full bg-[var(--neutral-200)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(cell.avgScrapRate * 10, 100)}%`,
                            backgroundColor: colour,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">
                          {cell.totalScrapQty} units scrapped
                        </span>
                        <span>{cell.recordCount} records</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {cells.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No scrap records found.
              </p>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
