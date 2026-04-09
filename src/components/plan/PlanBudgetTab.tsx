/**
 * Plan Budget Tab - Restricted to Scheduler/Manager/Admin roles
 * Shows budget summary, category breakdown, spend vs plan chart, and AI insights
 * Per PLAN 05 database schema: categories are materials, labour, purchase, overhead
 * Note: 'purchase' displays as 'Subcontract' in UI
 */

import React, { useState } from 'react';
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertCircle, DollarSign, Receipt, Clock, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { AnimatedRefresh, AnimatedTrendingUp, AnimatedTrendingDown, AnimatedSparkles } from '../ui/animated-icons';
import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';
import { MW_AXIS_TICK, MW_CARTESIAN_GRID, MW_TOOLTIP_STYLE, MW_RECHARTS_ANIMATION, getChartScaleColour } from '@/components/shared/charts/chart-theme';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { IconWell } from '@/components/shared/icons/IconWell';


interface PlanBudgetTabProps {
  jobId: string;
  userRole: 'Operator' | 'Supervisor' | 'Scheduler' | 'Manager' | 'Admin';
  quoteId?: string;
}

// Mock data - replace with actual API calls
const mockBudgetData = {
  totalBudget: 18500,
  totalSpent: 14230,
  remaining: 4270,
  estimatedFinalSpend: 17800,
  targetMargin: 15, // configurable in settings
  currentMargin: 23.1,
  quotedMargin: 18.5,
  projectedMargin: 19.2,
  quoteReference: 'Q-2026-0042',
};

const mockCategories = [
  {
    category: 'materials',
    displayName: 'Materials',
    budget: 8200,
    actual: 7450,
    variance: -750,
    percentUsed: 91,
    status: 'on_track' as const
  },
  {
    category: 'labour',
    displayName: 'Labour',
    budget: 6100,
    actual: 4890,
    variance: -1210,
    percentUsed: 80,
    status: 'on_track' as const
  },
  {
    category: 'overhead',
    displayName: 'Overhead',
    budget: 2500,
    actual: 1490,
    variance: -1010,
    percentUsed: 60,
    status: 'on_track' as const
  },
  {
    category: 'purchase',
    displayName: 'Subcontract', // Note: 'purchase' displays as 'Subcontract'
    budget: 1200,
    actual: 400,
    variance: -800,
    percentUsed: 33,
    status: 'on_track' as const
  },
];

// Spend vs Plan chart data
const mockSpendData = [
  { week: 1, planned: 3700, actual: 2800, label: 'Wk 1' },
  { week: 2, planned: 7400, actual: 6200, label: 'Wk 2' },
  { week: 3, planned: 11100, actual: 9100, label: 'Wk 3' },
  { week: 4, planned: 14800, actual: 11500, label: 'Wk 4' },
  { week: 5, planned: 18500, actual: 14230, label: 'Wk 5' }, // Current week
  { week: 6, planned: 18500, actual: null, label: 'Wk 6' }, // Future weeks
];


const getProgressColor = (pct: number) => getChartScaleColour(Math.min(100, pct));

export function PlanBudgetTab({ jobId, userRole, quoteId }: PlanBudgetTabProps) {
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Role check
  if (!['Scheduler', 'Manager', 'Admin'].includes(userRole)) {
    return (
      <div className="p-6">
        <Card className="border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-foreground" />
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Access Restricted
              </h3>
              <p className="mt-1 text-xs text-[var(--neutral-600)]">
                Budget information is only visible to Scheduler, Manager, and Admin roles.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const utilizationPercent = (mockBudgetData.totalSpent / mockBudgetData.totalBudget) * 100;
  const totalVariance = mockBudgetData.remaining;
  const totalActual = mockCategories.reduce((sum, cat) => sum + cat.actual, 0);
  const totalBudgeted = mockCategories.reduce((sum, cat) => sum + cat.budget, 0);

  const handleRefreshInsight = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6 bg-[var(--neutral-100)]"
    >
      {/* Budget Summary - 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
            <div className="flex items-center justify-between mb-4">
              <IconWell icon={DollarSign} surface="onLight" />
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Total Budget
            </h3>
            <p className=" text-2xl font-medium tabular-nums text-foreground">
              ${mockBudgetData.totalBudget.toLocaleString()}
            </p>
            <p className=" text-xs text-[var(--neutral-500)] mt-2">
              from quote{' '}
              <a href={`/sell/quotes/${quoteId || mockBudgetData.quoteReference}`} className="text-foreground hover:underline">
                {mockBudgetData.quoteReference}
              </a>
            </p>
          </Card>
        </motion.div>

        {/* Total Spent */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="relative border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] group">
            <div className="flex items-center justify-between mb-4">
              <IconWell icon={Receipt} surface="onLight" />
              <Badge className="rounded-full border-0 bg-[var(--neutral-100)] px-2 py-0.5 text-xs text-foreground">
                <span className="tabular-nums">{utilizationPercent.toFixed(0)}% used</span>
              </Badge>
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Total Spent
            </h3>
            <p className=" text-2xl font-medium tabular-nums text-foreground">
              ${mockBudgetData.totalSpent.toLocaleString()}
            </p>
            <div className="mt-3">
              <ProgressBar value={utilizationPercent} />
            </div>

            {/* Hover tooltip — total budget */}
            <div
              className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20",
                "pointer-events-none",
                "opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0",
                "transition-all duration-100 ease-[cubic-bezier(0,0,0,1)]"
              )}
            >
              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-[var(--mw-mirage)] rotate-45 -mb-1" />
              </div>
              <div className="bg-[var(--mw-mirage)] text-white rounded-[var(--shape-lg)] px-3 py-2 shadow-lg whitespace-nowrap">
                <p className=" text-xs text-[var(--neutral-400)] mb-0.5">
                  Total Budget
                </p>
                <p className=" text-sm font-medium tabular-nums">
                  ${mockBudgetData.totalBudget.toLocaleString()}
                </p>
                <p className=" text-xs tabular-nums text-[var(--neutral-400)] mt-0.5">
                  ${(mockBudgetData.totalBudget - mockBudgetData.totalSpent).toLocaleString()} remaining
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Remaining */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
            <div className="flex items-center justify-between mb-4">
              <IconWell icon={Clock} surface="onLight" />
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Remaining
            </h3>
            <p className=" text-2xl font-medium tabular-nums text-foreground">
              ${mockBudgetData.remaining.toLocaleString()}
            </p>
            <p className=" text-xs tabular-nums text-[var(--neutral-500)] mt-2">
              Est. final spend: ${mockBudgetData.estimatedFinalSpend.toLocaleString()}
            </p>
          </Card>
        </motion.div>

        {/* Margin */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
            <div className="flex items-center justify-between mb-4">
              <IconWell icon={BarChart3} surface="onLight" />
              <div className="flex items-center gap-1">
                {mockBudgetData.currentMargin > mockBudgetData.targetMargin ? (
                  <>
                    <AnimatedTrendingUp className="w-4 h-4 text-foreground" />
                    <span className="text-xs font-medium tabular-nums text-foreground">
                      +{(mockBudgetData.currentMargin - mockBudgetData.targetMargin).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <AnimatedTrendingDown className="h-4 w-4 text-[var(--neutral-600)]" />
                    <span className="text-xs font-medium tabular-nums text-[var(--neutral-600)]">
                      {(mockBudgetData.currentMargin - mockBudgetData.targetMargin).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Margin
            </h3>
            <p className=" text-2xl font-medium tabular-nums text-foreground">
              {mockBudgetData.currentMargin.toFixed(1)}%
            </p>
            <p className=" text-xs tabular-nums text-[var(--neutral-500)] mt-2">
              Target: {mockBudgetData.targetMargin}% (configurable)
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown Table */}
      <motion.div variants={staggerItem}>
        <FinancialTable
          columns={[
            { key: 'category', header: 'Category', accessor: (r) => r.displayName, format: 'text', align: 'left' },
            { key: 'budget', header: 'Budget', accessor: (r) => r.budget, format: 'currency' },
            { key: 'actual', header: 'Actual', accessor: (r) => r.actual, format: 'currency' },
            { key: 'variance', header: 'Variance', accessor: (r) => r.variance, format: 'currency' },
            { key: 'percentUsed', header: '% Used', accessor: (r) => r.percentUsed, format: 'percentage' },
            { key: 'status', header: 'Status', accessor: (r) => r.status === 'on_track' ? 'On track' : r.status === 'monitor' ? 'Monitor' : 'Over budget', format: 'text', align: 'left' },
          ] satisfies FinancialColumn<typeof mockCategories[number]>[]}
          data={mockCategories}
          keyExtractor={(r) => r.category}
          totals={{
            budget: totalBudgeted,
            actual: totalActual,
            variance: -(totalBudgeted - totalActual),
          }}
        />
      </motion.div>

      {/* Spend vs Plan Chart */}
      <motion.div variants={staggerItem}>
        <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className=" text-base font-medium text-foreground">
              Spend vs Plan
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateRange('week')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'week'
                    ? "bg-[var(--mw-yellow-400)] text-primary-foreground font-medium"
                    : "bg-[var(--neutral-100)] text-[var(--neutral-500)] hover:bg-[var(--border)]"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'month'
                    ? "bg-[var(--mw-yellow-400)] text-primary-foreground font-medium"
                    : "bg-[var(--neutral-100)] text-[var(--neutral-500)] hover:bg-[var(--border)]"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'all'
                    ? "bg-[var(--mw-yellow-400)] text-primary-foreground font-medium"
                    : "bg-[var(--neutral-100)] text-[var(--neutral-500)] hover:bg-[var(--border)]"
                )}
              >
                All
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockSpendData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mw-yellow-400)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--mw-yellow-400)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis
                dataKey="label"
                tick={MW_AXIS_TICK}
              />
              <YAxis
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                tick={MW_AXIS_TICK}
              />
              <Tooltip
                formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                labelFormatter={(label) => `Week ${label.replace('Wk ', '')}`}
              />
              {/* Vertical line marking "today" — x must match the XAxis dataKey value */}
              <ReferenceLine x="Wk 5" stroke="var(--mw-mirage)" strokeDasharray="4 4" label={{ value: 'Today', position: 'top', fill: 'var(--neutral-500)', fontSize: 11 }} />
              {/* Planned burn — dashed line */}
              <Area
                type="monotone"
                dataKey="planned"
                stroke="var(--neutral-400)"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="none"
                dot={false}
                name="Planned"
              />
              {/* Actual spend with shaded area */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="var(--mw-yellow-400)"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-[var(--neutral-500)] mt-3 text-center">
            This chart shows if spending is tracking at the expected rate based on the budget plan.
          </p>
        </Card>
      </motion.div>

      {/* AI Budget Insight Card */}
      <motion.div variants={staggerItem}>
        <AIInsightCard
          title="AI budget insight"
          updatedAt="2 minutes ago"
          onRefresh={handleRefreshInsight}
          refreshing={refreshing}
          actionLabel="View in Intelligence Hub"
          onAction={() => { window.location.hash = '#intelligence'; }}
        >
          Labour tracking 8% under budget. Based on 3 similar historical jobs, expect final spend between $23,200–$24,100.
          Material delivery for PO-0089 may increase costs by $400 if delayed past Friday.
        </AIInsightCard>
      </motion.div>
    </motion.div>
  );
}