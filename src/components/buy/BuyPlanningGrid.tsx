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
import { buyService } from "@/services/buyService";

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
                          const textColor =
                            val === 0
                              ? "var(--neutral-400)"
                              : pct > 66
                                ? "var(--foreground)"
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
      </motion.div>
    </PageShell>
  );
}
