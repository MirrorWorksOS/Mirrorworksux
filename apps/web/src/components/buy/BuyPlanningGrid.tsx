/**
 * Purchase Planning Grid — Heatmap of demand by material and week.
 * Route: /buy/planning-grid
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarRange } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChartScaleColour } from "@/components/shared/charts/chart-theme";
import { AISuggestion } from "@/components/shared/ai/AISuggestion";
import { buyService } from "@/services";

const breadcrumbs = [
  { label: "Buy", href: "/buy" },
  { label: "Planning Grid" },
];

const weekKeys = ["wk14", "wk15", "wk16", "wk17", "wk18", "wk19"] as const;
const weekLabels: Record<string, string> = {
  wk14: "Wk 14",
  wk15: "Wk 15",
  wk16: "Wk 16",
  wk17: "Wk 17",
  wk18: "Wk 18",
  wk19: "Wk 19",
};

interface GridRow {
  material: string;
  gauge: string;
  [key: string]: string | number;
}

export function BuyPlanningGrid() {
  const [rows, setRows] = useState<GridRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyService.getPurchasePlanningGrid().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  const maxDemand = useMemo(() => {
    let max = 0;
    for (const row of rows) {
      for (const wk of weekKeys) {
        const val = row[wk] as number;
        if (val > max) max = val;
      }
    }
    return max || 1;
  }, [rows]);

  /** Map a demand value to a percentage (0-100) for colour scale */
  const demandToPercent = (val: number): number =>
    Math.round((val / maxDemand) * 100);

  return (
    <PageShell>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <PageHeader
          title="Purchase Planning Grid"
          subtitle="6-week demand heatmap by material type"
          breadcrumbs={breadcrumbs}
          actions={
            <Badge className="gap-1.5 border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
              <CalendarRange className="h-3.5 w-3.5" strokeWidth={1.5} />
              Wk 14 -- Wk 19
            </Badge>
          }
        />

        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Demand by Material / Week
              </h3>
              <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                <span>Low</span>
                <div className="flex gap-0.5">
                  <div
                    className="h-3 w-6 rounded-sm"
                    style={{ backgroundColor: "var(--chart-scale-low)" }}
                  />
                  <div
                    className="h-3 w-6 rounded-sm"
                    style={{ backgroundColor: "var(--chart-scale-mid)" }}
                  />
                  <div
                    className="h-3 w-6 rounded-sm"
                    style={{ backgroundColor: "var(--chart-scale-high)" }}
                  />
                </div>
                <span>High</span>
              </div>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-[var(--neutral-500)]">
                Loading planning grid...
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Gauge</TableHead>
                    {weekKeys.map((wk) => (
                      <TableHead key={wk} className="text-center">
                        {weekLabels[wk]}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const rowTotal = weekKeys.reduce(
                      (sum, wk) => sum + (row[wk] as number),
                      0,
                    );
                    return (
                      <TableRow key={row.material}>
                        <TableCell className="font-medium text-foreground">
                          {row.material}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-[var(--neutral-600)]">
                          {row.gauge}
                        </TableCell>
                        {weekKeys.map((wk) => {
                          const val = row[wk] as number;
                          const pct = demandToPercent(val);
                          const bg =
                            val === 0
                              ? "transparent"
                              : getChartScaleColour(pct);
                          // Mid band (34–66%) renders on --mw-mirage (dark navy) → needs white text.
                          // Low (≤33%) is light grey and high (>66%) is yellow → both take dark text.
                          const textColor =
                            val === 0
                              ? "var(--neutral-400)"
                              : pct > 33 && pct <= 66
                                ? "#ffffff"
                                : "var(--foreground)";
                          return (
                            <TableCell key={wk} className="text-center p-1">
                              <div
                                className="mx-auto flex h-9 w-14 items-center justify-center rounded-md font-mono text-sm tabular-nums transition-colors"
                                style={{
                                  backgroundColor: bg,
                                  color: textColor,
                                  opacity: val === 0 ? 0.5 : 1,
                                }}
                              >
                                {val}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-mono tabular-nums font-medium">
                          {rowTotal}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-3">
          <h3 className="text-base font-medium text-foreground">
            MirrorWorks Agent suggestions
          </h3>

          <AISuggestion
            title="Consolidate Mild Steel 3mm into a single Wk 14 order"
            confidence={89}
            source="Planning grid Wk 14–18 · supplier quote history"
            impact="Est. saving $1,240 · avoids 2 rush freight charges"
          >
            Mild Steel 3mm shows alternating peaks (Wk 14: 12, Wk 16: 15, Wk 18: 10) totalling <strong>37 sheets</strong> across three
            separate orders. Consolidating into a single <strong>Wk 14 bulk PO with staged delivery</strong> unlocks the supplier's
            30+ sheet price break and removes two expedite fees.
          </AISuggestion>

          <AISuggestion
            title="Cold Rolled Steel 1.6mm trending above safety stock"
            confidence={92}
            source="6-week demand forecast · current on-hand inventory"
            impact="Prevents Wk 15 stockout · protects 4 open jobs"
          >
            Cold Rolled Steel 1.6mm is the highest-demand line in the grid (<strong>58 units / 6 wks</strong>) with sustained draw
            from Wk 14 through Wk 19. At current consumption you'll <strong>breach safety stock mid-Wk 15</strong>. Recommend raising
            a PO for 30 sheets this week with a standing replenishment trigger.
          </AISuggestion>

          <AISuggestion
            title="Delay Aluminium 6061 purchase to Wk 16"
            confidence={74}
            source="Demand pattern · 10-day lead time from primary supplier"
            impact="Frees ~$2,800 in working capital"
          >
            Aluminium 6061 demand is back-loaded (0 in Wk 15, 0 in Wk 17, only 10 units total). With a 10-day lead time, pushing
            the PO to <strong>Wk 16</strong> still covers Wk 18–19 requirements while reducing early-month cash outlay.
          </AISuggestion>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
