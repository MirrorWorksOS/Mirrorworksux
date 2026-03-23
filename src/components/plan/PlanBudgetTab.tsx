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
import { AIInsightCard } from '../shared/ai/AIInsightCard';


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
  quoteReference: 'MW-Q-0042',
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

const getStatusColor = (status: 'on_track' | 'monitor' | 'over_budget') => {
  switch (status) {
    case 'on_track':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--mw-success)' };
    case 'monitor':
      return { bg: 'bg-[var(--mw-amber-50)]', text: 'text-[var(--mw-yellow-900)]', dot: 'var(--mw-warning)' };
    case 'over_budget':
      return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', dot: 'var(--mw-error)' };
  }
};

const getProgressColor = (pct: number) => {
  if (pct > 95) return 'var(--mw-error)'; // Red
  if (pct > 80) return 'var(--mw-warning)'; // Yellow
  return 'var(--mw-success)'; // Green
};

export function PlanBudgetTab({ jobId, userRole, quoteId }: PlanBudgetTabProps) {
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Role check
  if (!['Scheduler', 'Manager', 'Admin'].includes(userRole)) {
    return (
      <div className="p-6">
        <Card className="bg-[var(--mw-amber-50)] border-[var(--mw-warning)] p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--mw-yellow-900)]" />
            <div>
              <h3 className=" text-sm font-medium text-[var(--mw-yellow-900)]">
                Access Restricted
              </h3>
              <p className=" text-xs text-[var(--mw-yellow-900)] mt-1">
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
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-blue-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[var(--mw-blue)]" />
              </div>
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Total Budget
            </h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">
              ${mockBudgetData.totalBudget.toLocaleString()}
            </p>
            <p className=" text-xs text-[var(--neutral-500)] mt-2">
              from quote{' '}
              <a href={`/sell/quotes/${quoteId || mockBudgetData.quoteReference}`} className="text-[var(--mw-mirage)] hover:underline">
                {mockBudgetData.quoteReference}
              </a>
            </p>
          </Card>
        </motion.div>

        {/* Total Spent */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow duration-200 relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-amber-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[var(--mw-amber)]" />
              </div>
              <Badge className={cn(
                "rounded-full text-xs px-2 py-0.5 border-0",
                utilizationPercent > 95 ? "bg-[var(--mw-error-100)] text-[var(--mw-error)]" :
                utilizationPercent > 80 ? "bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]" :
                "bg-[var(--neutral-100)] text-[var(--mw-mirage)]"
              )}>
                {utilizationPercent.toFixed(0)}% used
              </Badge>
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Total Spent
            </h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">
              ${mockBudgetData.totalSpent.toLocaleString()}
            </p>
            <div className="mt-3">
              <div className="h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(utilizationPercent, 100)}%`,
                    backgroundColor: getProgressColor(utilizationPercent)
                  }}
                />
              </div>
            </div>

            {/* Hover tooltip — total budget */}
            <div
              className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20",
                "pointer-events-none",
                "opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0",
                "transition-all duration-150 ease-out"
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
                <p className=" text-sm font-semibold">
                  ${mockBudgetData.totalBudget.toLocaleString()}
                </p>
                <p className=" text-xs text-[var(--neutral-400)] mt-0.5">
                  ${(mockBudgetData.totalBudget - mockBudgetData.totalSpent).toLocaleString()} remaining
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Remaining */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--mw-mirage)]" />
              </div>
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Remaining
            </h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">
              ${mockBudgetData.remaining.toLocaleString()}
            </p>
            <p className=" text-xs text-[var(--neutral-500)] mt-2">
              Est. final spend: ${mockBudgetData.estimatedFinalSpend.toLocaleString()}
            </p>
          </Card>
        </motion.div>

        {/* Margin */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[var(--mw-mirage)]" />
              </div>
              <div className="flex items-center gap-1">
                {mockBudgetData.currentMargin > mockBudgetData.targetMargin ? (
                  <>
                    <AnimatedTrendingUp className="w-4 h-4 text-[var(--mw-mirage)]" />
                    <span className="text-xs font-medium text-[var(--mw-mirage)]">
                      +{(mockBudgetData.currentMargin - mockBudgetData.targetMargin).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <AnimatedTrendingDown className="w-4 h-4 text-[var(--mw-error)]" />
                    <span className="text-xs font-medium text-[var(--mw-error)]">
                      {(mockBudgetData.currentMargin - mockBudgetData.targetMargin).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <h3 className=" text-xs font-medium text-[var(--neutral-500)] mb-1">
              Margin
            </h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">
              {mockBudgetData.currentMargin.toFixed(1)}%
            </p>
            <p className=" text-xs text-[var(--neutral-500)] mt-2">
              Target: {mockBudgetData.targetMargin}% (configurable)
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown Table */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border)]">
            <h3 className=" text-base font-semibold text-[var(--mw-mirage)]">
              Category Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  <th className="px-6 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    CATEGORY
                  </th>
                  <th className="px-6 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    BUDGET
                  </th>
                  <th className="px-6 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    ACTUAL
                  </th>
                  <th className="px-6 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    VARIANCE
                  </th>
                  <th className="px-6 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    % USED
                  </th>
                  <th className="px-6 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockCategories.map((row, idx) => {
                  const statusColors = getStatusColor(row.status);
                  return (
                    <tr key={row.category} className="border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] transition-colors">
                      <td className="px-6 text-sm text-[var(--mw-mirage)] font-medium">
                        {row.displayName}
                      </td>
                      <td className="px-6 text-right text-sm  font-medium">
                        ${row.budget.toLocaleString()}
                      </td>
                      <td className="px-6 text-right text-sm  font-medium">
                        ${row.actual.toLocaleString()}
                      </td>
                      <td className="px-6 text-right text-sm  font-medium"
                        style={{ color: row.variance < 0 ? 'var(--mw-success)' : 'var(--mw-error)' }}>
                        {row.variance < 0 ? '-' : '+'}${Math.abs(row.variance).toLocaleString()}
                      </td>
                      <td className="px-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(row.percentUsed, 100)}%`,
                                backgroundColor: getProgressColor(row.percentUsed)
                              }}
                            />
                          </div>
                          <span className="text-xs text-[var(--neutral-500)] ">
                            {row.percentUsed}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6">
                        <div className="flex items-center justify-center">
                          <Badge className={cn(
                            "rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5",
                            statusColors.bg,
                            statusColors.text
                          )}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: statusColors.dot }} />
                            {row.status === 'on_track' ? 'On track' :
                             row.status === 'monitor' ? 'Monitor' :
                             'Over budget'}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="border-t-2 border-[var(--mw-mirage)] h-14 bg-[var(--neutral-100)]">
                  <td className="px-6 text-sm font-bold text-[var(--mw-mirage)]">
                    TOTAL
                  </td>
                  <td className="px-6 text-right text-sm  font-bold">
                    ${totalBudgeted.toLocaleString()}
                  </td>
                  <td className="px-6 text-right text-sm  font-bold">
                    ${totalActual.toLocaleString()}
                  </td>
                  <td className="px-6 text-right text-sm  font-bold text-[var(--mw-mirage)]">
                    -${(totalBudgeted - totalActual).toLocaleString()}
                  </td>
                  <td className="px-6 text-center text-sm text-[var(--neutral-500)]">
                    {((totalActual / totalBudgeted) * 100).toFixed(0)}%
                  </td>
                  <td className="px-6"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Spend vs Plan Chart */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className=" text-base font-semibold text-[var(--mw-mirage)]">
              Spend vs Plan
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateRange('week')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'week'
                    ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] font-medium"
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
                    ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] font-medium"
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
                    ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] font-medium"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--neutral-500)' }}
              />
              <YAxis
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'var(--neutral-500)' }}
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