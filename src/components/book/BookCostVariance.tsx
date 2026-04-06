/**
 * BookCostVariance — Standard vs actual cost comparison with grouped bar chart
 * and drill-down table per job showing category breakdown.
 */
import { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
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

import { bookService } from "@/services/bookService";
import type { CostVarianceRecord } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

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
        <Card variant="flat" className="p-6">
          <h3 className="mb-4 text-base font-medium text-foreground">
            Variance by Job
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Job #</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Variance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobGroups.map((group) => {
                const isExpanded = expandedJob === group.jobId;
                const varPct =
                  group.budget > 0
                    ? ((group.variance / group.budget) * 100).toFixed(1)
                    : "0.0";

                return (
                  <>
                    <TableRow
                      key={group.jobId}
                      className="cursor-pointer hover:bg-[var(--neutral-50)]"
                      onClick={() =>
                        setExpandedJob(isExpanded ? null : group.jobId)
                      }
                    >
                      <TableCell>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-[var(--neutral-400)] transition-transform",
                            isExpanded && "rotate-90",
                          )}
                          strokeWidth={1.5}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {group.jobNumber}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtAud(group.budget)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtAud(group.actual)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono font-medium",
                          group.variance > 0
                            ? "text-[var(--mw-error)]"
                            : "text-[var(--mw-success)]",
                        )}
                      >
                        {group.variance > 0 ? "+" : ""}
                        {fmtAud(group.variance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono",
                            group.variance > 0
                              ? "border-[var(--mw-error)] text-[var(--mw-error)]"
                              : "border-[var(--mw-success)] text-[var(--mw-success)]",
                          )}
                        >
                          {group.variance > 0 ? "+" : ""}
                          {varPct}%
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Category breakdown rows */}
                    {isExpanded &&
                      group.categories.map((cat) => (
                        <TableRow
                          key={cat.id}
                          className="bg-[var(--neutral-50)]"
                        >
                          <TableCell />
                          <TableCell className="pl-8 text-sm capitalize text-[var(--neutral-500)]">
                            {cat.category}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {fmtAud(cat.budgetAmount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {fmtAud(cat.actualAmount)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-mono text-sm",
                              cat.varianceAmount > 0
                                ? "text-[var(--mw-error)]"
                                : "text-[var(--mw-success)]",
                            )}
                          >
                            {cat.varianceAmount > 0 ? "+" : ""}
                            {fmtAud(cat.varianceAmount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[var(--neutral-500)]">
                            {cat.variancePercent > 0 ? "+" : ""}
                            {cat.variancePercent.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </PageShell>
  );
}
