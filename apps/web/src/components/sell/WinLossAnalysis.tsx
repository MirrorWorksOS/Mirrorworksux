/**
 * Win/Loss Analysis — dashboard analysis component with win rate trend,
 * loss reason breakdown, and KPI cards.
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Clock, BarChart3, Target } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import {
  MW_RECHARTS_ANIMATION,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_CARTESIAN_GRID,
  MW_AXIS_TICK,
  MW_CHART_COLOURS,
  MW_BAR_RADIUS_H,
  MW_BAR_TOOLTIP_CURSOR,
} from "@/components/shared/charts/chart-theme";
import { sellService } from "@/services";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import type { WinLossRecord, LossReasonBreakdown } from "@/types/entities";

// ── Sub-components ────────────────────────────────────────────────────

function WinRateChart({ data }: { data: WinLossRecord[] }) {
  return (
    <ChartCard title="Win Rate Over Time" subtitle="Monthly win rate trend (%)">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid {...MW_CARTESIAN_GRID} />
          <XAxis dataKey="month" tick={MW_AXIS_TICK} />
          <YAxis
            tick={MW_AXIS_TICK}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={MW_TOOLTIP_STYLE}
            formatter={(value: number) => [`${value}%`, "Win Rate"]}
          />
          <Line
            type="monotone"
            dataKey="winRate"
            stroke={MW_CHART_COLOURS[0]}
            strokeWidth={2}
            dot={{ r: 4, fill: MW_CHART_COLOURS[0], strokeWidth: 0 }}
            activeDot={{ r: 6, fill: MW_CHART_COLOURS[0], strokeWidth: 2, stroke: "var(--background)" }}
            {...MW_RECHARTS_ANIMATION}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function LossReasonsChart({ data }: { data: LossReasonBreakdown[] }) {
  return (
    <ChartCard title="Loss Reasons" subtitle="Breakdown by frequency">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid {...MW_CARTESIAN_GRID} horizontal={false} vertical />
          <XAxis type="number" tick={MW_AXIS_TICK} />
          <YAxis
            type="category"
            dataKey="reason"
            tick={MW_AXIS_TICK}
            width={130}
          />
          <Tooltip
            contentStyle={MW_TOOLTIP_STYLE}
            cursor={MW_BAR_TOOLTIP_CURSOR}
            formatter={(value: number, _name: string, item) => {
              const row = (item as { payload?: LossReasonBreakdown }).payload;
              const total = row?.totalValue ?? 0;
              return [
                `${value} deals ($${(total / 1000).toFixed(0)}k)`,
                "Lost",
              ];
            }}
          />
          <Bar
            dataKey="count"
            fill={MW_CHART_COLOURS[1]}
            radius={MW_BAR_RADIUS_H}
            {...MW_RECHARTS_ANIMATION_BAR}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function WinLossAnalysis() {
  const [history, setHistory] = useState<WinLossRecord[]>([]);
  const [reasons, setReasons] = useState<LossReasonBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sellService.getWinLossHistory(),
      sellService.getLossReasons(),
    ]).then(([h, r]) => {
      setHistory(h);
      setReasons(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[var(--shape-lg)] bg-[var(--neutral-100)]" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-[var(--shape-lg)] bg-[var(--neutral-100)]" />
      </div>
    );
  }

  // Compute aggregate KPIs
  const totalWins = history.reduce((s, r) => s + r.wins, 0);
  const totalLosses = history.reduce((s, r) => s + r.losses, 0);
  const totalDeals = totalWins + totalLosses;
  const overallWinRate = totalDeals > 0 ? Math.round((totalWins / totalDeals) * 100) : 0;
  const avgDaysToClose =
    history.length > 0
      ? Math.round(history.reduce((s, r) => s + r.avgDaysToClose, 0) / history.length)
      : 0;

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Overall Win Rate"
            value={`${overallWinRate}%`}
            icon={Target}
            layout="compact"
            hint={`${totalWins} won of ${totalDeals} total`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Days to Close"
            value={`${avgDaysToClose}`}
            icon={Clock}
            layout="compact"
            hint="Across all months"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Total Wins"
            value={totalWins.toString()}
            icon={TrendingUp}
            layout="compact"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Total Losses"
            value={totalLosses.toString()}
            icon={BarChart3}
            layout="compact"
          />
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={staggerItem}>
          <WinRateChart data={history} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <LossReasonsChart data={reasons} />
        </motion.div>
      </div>
    </motion.div>
  );
}
