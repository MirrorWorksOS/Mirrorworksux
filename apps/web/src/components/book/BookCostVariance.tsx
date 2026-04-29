/**
 * BookCostVariance — Standard vs actual cost comparison with grouped bar chart
 * and drill-down table per job showing category breakdown.
 */
import { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { bookService } from "@/services";
import type { CostVarianceRecord } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { Badge } from "@/components/ui/badge";
import {
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION,
  MW_TOOLTIP_STYLE,
  MW_CARTESIAN_GRID,
  MW_AXIS_TICK,
  MW_BAR_RADIUS_V,
  MW_BAR_TOOLTIP_CURSOR,
} from "@/components/shared/charts/chart-theme";
import { cn } from "@/components/ui/utils";

function fmtAud(v: number): string {
  return v.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function BookCostVariance() {
  const [records, setRecords] = useState<CostVarianceRecord[]>([]);

  useEffect(() => {
    bookService.getCostVariance().then(setRecords);
  }, []);

  // Aggregate KPIs
  const totals = useMemo(() => {
    const budget = records.reduce((s, r) => s + r.budgetAmount, 0);
    const actual = records.reduce((s, r) => s + r.actualAmount, 0);
    return { budget, actual, variance: actual - budget };
  }, [records]);

  // Group by job for table + chart
  const jobGroups = useMemo(() => {
    const map = new Map<
      string,
      { jobNumber: string; categories: CostVarianceRecord[] }
    >();
    for (const r of records) {
      if (!map.has(r.jobId)) {
        map.set(r.jobId, { jobNumber: r.jobNumber, categories: [] });
      }
      map.get(r.jobId)!.categories.push(r);
    }
    return Array.from(map.entries()).map(([jobId, group]) => ({
      jobId,
      jobNumber: group.jobNumber,
      categories: group.categories,
      budget: group.categories.reduce((s, c) => s + c.budgetAmount, 0),
      actual: group.categories.reduce((s, c) => s + c.actualAmount, 0),
      variance: group.categories.reduce((s, c) => s + c.varianceAmount, 0),
    }));
  }, [records]);

  // Chart data (grouped bar: budget vs actual per job)
  const chartData = useMemo(
    () =>
      jobGroups.map((g) => ({
        name: g.jobNumber,
        Budget: g.budget,
        Actual: g.actual,
      })),
    [jobGroups],
  );

  return (
    <PageShell>
      <PageHeader
        title="Cost Variance"
        subtitle="Standard vs actual cost comparison by job"
        breadcrumbs={[
          { label: "Book", href: "/book" },
          { label: "Cost Variance" },
        ]}
      />

      {/* KPI row */}
      <motion.div
        variants={staggerItem}
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiStatCard
          label="Total Budget"
          value={<span className="font-mono">{fmtAud(totals.budget)}</span>}
          icon={DollarSign}
          iconSurface="onLight"
        />
        <KpiStatCard
          label="Total Actual"
          value={<span className="font-mono">{fmtAud(totals.actual)}</span>}
          icon={TrendingUp}
          iconSurface="onLight"
        />
        <KpiStatCard
          label="Total Variance"
          value={
            <span
              className={cn(
                "font-mono",
                totals.variance > 0
                  ? "text-[var(--mw-error)]"
                  : "text-[var(--mw-success)]",
              )}
            >
              {totals.variance > 0 ? "+" : ""}
              {fmtAud(totals.variance)}
            </span>
          }
          icon={TrendingDown}
          iconSurface={totals.variance > 0 ? "onLight" : "key"}
          hint={
            totals.variance > 0
              ? "Over budget"
              : "Under budget"
          }
        />
      </motion.div>

      {/* Grouped bar chart */}
      <motion.div variants={staggerItem}>
        <ChartCard
          title="Budget vs Actual by Job"
          subtitle="Grouped bar comparison across jobs"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="name" tick={MW_AXIS_TICK} />
              <YAxis
                tick={MW_AXIS_TICK}
                tickFormatter={(v: number) =>
                  `$${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                contentStyle={MW_TOOLTIP_STYLE}
                formatter={(v: number) => fmtAud(v)}
                cursor={MW_BAR_TOOLTIP_CURSOR}
              />
              <Legend />
              <Bar
                dataKey="Budget"
                fill={MW_CHART_COLOURS[1]}
                radius={MW_BAR_RADIUS_V}
                {...MW_RECHARTS_ANIMATION}
              />
              <Bar
                dataKey="Actual"
                fill={MW_CHART_COLOURS[0]}
                radius={MW_BAR_RADIUS_V}
                {...MW_RECHARTS_ANIMATION}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      {/* Drill-down table */}
      <motion.div variants={staggerItem}>
        <h3 className="mb-4 text-base font-medium text-foreground">
          Variance by Job
        </h3>
        <MwDataTable<typeof jobGroups[number]>
          columns={[
            {
              key: "jobNumber",
              header: "Job #",
              className: "font-mono font-medium",
              cell: (g) => g.jobNumber,
            },
            {
              key: "budget",
              header: "Budget",
              headerClassName: "text-right",
              className: "text-right font-mono",
              cell: (g) => fmtAud(g.budget),
            },
            {
              key: "actual",
              header: "Actual",
              headerClassName: "text-right",
              className: "text-right font-mono",
              cell: (g) => fmtAud(g.actual),
            },
            {
              key: "variance",
              header: "Variance",
              headerClassName: "text-right",
              cell: (g) => (
                <span
                  className={cn(
                    "text-right font-mono font-medium",
                    g.variance > 0 ? "text-[var(--mw-error)]" : "text-[var(--mw-success)]",
                  )}
                >
                  {g.variance > 0 ? "+" : ""}
                  {fmtAud(g.variance)}
                </span>
              ),
              className: "text-right",
            },
            {
              key: "variancePct",
              header: "Variance %",
              headerClassName: "text-right",
              className: "text-right",
              cell: (g) => {
                const varPct =
                  g.budget > 0 ? ((g.variance / g.budget) * 100).toFixed(1) : "0.0";
                return (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono",
                      g.variance > 0
                        ? "border-[var(--mw-error)] text-[var(--mw-error)]"
                        : "border-[var(--mw-success)] text-[var(--mw-success)]",
                    )}
                  >
                    {g.variance > 0 ? "+" : ""}
                    {varPct}%
                  </Badge>
                );
              },
            },
          ]}
          data={jobGroups}
          keyExtractor={(g) => g.jobId}
          expandable={{
            renderExpanded: (g) => (
              <div className="px-4 py-3">
                <table className="w-full">
                  <tbody>
                    {g.categories.map((cat) => (
                      <tr key={cat.id} className="text-sm">
                        <td className="pl-8 py-2 capitalize text-[var(--neutral-500)]">
                          {cat.category}
                        </td>
                        <td className="text-right font-mono py-2">
                          {fmtAud(cat.budgetAmount)}
                        </td>
                        <td className="text-right font-mono py-2">
                          {fmtAud(cat.actualAmount)}
                        </td>
                        <td
                          className={cn(
                            "text-right font-mono py-2",
                            cat.varianceAmount > 0
                              ? "text-[var(--mw-error)]"
                              : "text-[var(--mw-success)]",
                          )}
                        >
                          {cat.varianceAmount > 0 ? "+" : ""}
                          {fmtAud(cat.varianceAmount)}
                        </td>
                        <td className="text-right font-mono py-2 text-[var(--neutral-500)]">
                          {cat.variancePercent > 0 ? "+" : ""}
                          {cat.variancePercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          }}
        />
      </motion.div>
    </PageShell>
  );
}
