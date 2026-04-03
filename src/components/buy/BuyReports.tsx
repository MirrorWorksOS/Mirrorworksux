/**
 * Buy Reports - Spend analysis and procurement analytics
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import {
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_RECHARTS_ANIMATION,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_V,
  MW_FILL,
  getChartScaleColour,
} from '@/components/shared/charts/chart-theme';
import { ChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';

const spendBySupplier = [
  { name: 'Hunter Steel Co', spend: 156000 },
  { name: 'Pacific Metals', spend: 89000 },
  { name: 'Sydney Welding', spend: 45000 },
  { name: 'BHP Suppliers', spend: 128000 },
];

const monthlySpend = [
  { month: 'Oct', spend: 95000 },
  { month: 'Nov', spend: 88000 },
  { month: 'Dec', spend: 92000 },
  { month: 'Jan', spend: 102000 },
  { month: 'Feb', spend: 89000 },
  { month: 'Mar', spend: 105000 },
];

export function BuyReports() {
  const spendTotal = useMemo(
    () => spendBySupplier.reduce((s, x) => s + x.spend, 0),
    [],
  );

  const spendSlices = useMemo(
    () =>
      spendBySupplier.map((s) => ({
        ...s,
        fill: getChartScaleColour((s.spend / spendTotal) * 100),
      })),
    [spendTotal],
  );

  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
        <PageHeader title="Procurement Reports" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={staggerItem}>
            <ChartCard title="Spend by Supplier">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={spendSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="spend"
                    {...MW_RECHARTS_ANIMATION}
                  >
                    {spendSlices.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={MW_TOOLTIP_STYLE} formatter={(v: number) => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <ChartCard title="Monthly Spend Trend">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlySpend}>
                  <ChartPatternDefs />
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                  <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                  <Tooltip contentStyle={MW_TOOLTIP_STYLE} cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar
                    dataKey="spend"
                    fill={MW_FILL.HATCH_YELLOW}
                    radius={MW_BAR_RADIUS_V}
                    {...MW_RECHARTS_ANIMATION_BAR}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}
