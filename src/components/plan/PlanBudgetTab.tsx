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
import { designSystem } from '../../lib/design-system';
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
import { AIInsightCard } from '../shared/AIInsightCard';

const { animationVariants } = designSystem;

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
      return { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', dot: '#36B37E' };
    case 'monitor':
      return { bg: 'bg-[#FFF4CC]', text: 'text-[#805900]', dot: '#FACC15' };
    case 'over_budget':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', dot: '#EF4444' };
  }
};

const getProgressColor = (pct: number) => {
  if (pct > 95) return '#DE350B'; // Red
  if (pct > 80) return '#FACC15'; // Yellow
  return '#36B37E'; // Green
};

export function PlanBudgetTab({ jobId, userRole, quoteId }: PlanBudgetTabProps) {
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Role check
  if (!['Scheduler', 'Manager', 'Admin'].includes(userRole)) {
    return (
      <div className="p-6">
        <Card className="bg-[#FFF4CC] border-[#FACC15] p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#805900]" />
            <div>
              <h3 className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#805900]">
                Access Restricted
              </h3>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#805900] mt-1">
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
      variants={animationVariants.stagger}
      className="p-6 space-y-6 bg-[#FAFAFA]"
    >
      {/* Budget Summary - 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <motion.div variants={animationVariants.listItem}>
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#0A7AFF]" />
              </div>
            </div>
            <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
              Total Budget
            </h3>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
              ${mockBudgetData.totalBudget.toLocaleString()}
            </p>
            <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
              from quote{' '}
              <a href={`/sell/quotes/${quoteId || mockBudgetData.quoteReference}`} className="text-[#0052CC] hover:underline">
                {mockBudgetData.quoteReference}
              </a>
            </p>
          </Card>
        </motion.div>

        {/* Total Spent */}
        <motion.div variants={animationVariants.listItem}>
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-200 relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[#FF8B00]" />
              </div>
              <Badge className={cn(
                "rounded-full text-[11px] px-2 py-0.5 border-0",
                utilizationPercent > 95 ? "bg-[#FEE2E2] text-[#EF4444]" :
                utilizationPercent > 80 ? "bg-[#FFF4CC] text-[#805900]" :
                "bg-[#E3FCEF] text-[#36B37E]"
              )}>
                {utilizationPercent.toFixed(0)}% used
              </Badge>
            </div>
            <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
              Total Spent
            </h3>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
              ${mockBudgetData.totalSpent.toLocaleString()}
            </p>
            <div className="mt-3">
              <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
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
                <div className="w-2 h-2 bg-[#0A0A0A] rotate-45 -mb-1" />
              </div>
              <div className="bg-[#0A0A0A] text-white rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                <p className="font-['Geist:Medium',sans-serif] text-[11px] text-[#A3A3A3] mb-0.5">
                  Total Budget
                </p>
                <p className="font-['Roboto_Mono',monospace] text-[14px] font-semibold">
                  ${mockBudgetData.totalBudget.toLocaleString()}
                </p>
                <p className="font-['Geist:Regular',sans-serif] text-[11px] text-[#A3A3A3] mt-0.5">
                  ${(mockBudgetData.totalBudget - mockBudgetData.totalSpent).toLocaleString()} remaining
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Remaining */}
        <motion.div variants={animationVariants.listItem}>
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#36B37E]" />
              </div>
            </div>
            <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
              Remaining
            </h3>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#36B37E]">
              ${mockBudgetData.remaining.toLocaleString()}
            </p>
            <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
              Est. final spend: ${mockBudgetData.estimatedFinalSpend.toLocaleString()}
            </p>
          </Card>
        </motion.div>

        {/* Margin */}
        <motion.div variants={animationVariants.listItem}>
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#36B37E]" />
              </div>
              <div className="flex items-center gap-1">
                {mockBudgetData.currentMargin > mockBudgetData.targetMargin ? (
                  <>
                    <AnimatedTrendingUp className="w-4 h-4 text-[#36B37E]" />
                    <span className="text-[11px] font-medium text-[#36B37E]">
                      +{(mockBudgetData.currentMargin - mockBudgetData.targetMargin).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <AnimatedTrendingDown className="w-4 h-4 text-[#EF4444]" />
                    <span className="text-[11px] font-medium text-[#EF4444]">
                      {(mockBudgetData.currentMargin - mockBudgetData.targetMargin).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
              Margin
            </h3>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#36B37E]">
              {mockBudgetData.currentMargin.toFixed(1)}%
            </p>
            <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
              Target: {mockBudgetData.targetMargin}% (configurable)
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown Table */}
      <motion.div variants={animationVariants.listItem}>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#E5E5E5]">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Category Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                  <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">
                    CATEGORY
                  </th>
                  <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">
                    BUDGET
                  </th>
                  <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">
                    ACTUAL
                  </th>
                  <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">
                    VARIANCE
                  </th>
                  <th className="px-6 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">
                    % USED
                  </th>
                  <th className="px-6 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockCategories.map((row, idx) => {
                  const statusColors = getStatusColor(row.status);
                  return (
                    <tr key={row.category} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors">
                      <td className="px-6 text-sm text-[#0A0A0A] font-medium">
                        {row.displayName}
                      </td>
                      <td className="px-6 text-right text-sm font-['Roboto_Mono',monospace] font-medium">
                        ${row.budget.toLocaleString()}
                      </td>
                      <td className="px-6 text-right text-sm font-['Roboto_Mono',monospace] font-medium">
                        ${row.actual.toLocaleString()}
                      </td>
                      <td className="px-6 text-right text-sm font-['Roboto_Mono',monospace] font-medium"
                        style={{ color: row.variance < 0 ? '#36B37E' : '#EF4444' }}>
                        {row.variance < 0 ? '-' : '+'}${Math.abs(row.variance).toLocaleString()}
                      </td>
                      <td className="px-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(row.percentUsed, 100)}%`,
                                backgroundColor: getProgressColor(row.percentUsed)
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#737373] font-['Roboto_Mono',monospace]">
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
                <tr className="border-t-2 border-[#0A0A0A] h-14 bg-[#FAFAFA]">
                  <td className="px-6 text-sm font-bold text-[#0A0A0A]">
                    TOTAL
                  </td>
                  <td className="px-6 text-right text-sm font-['Roboto_Mono',monospace] font-bold">
                    ${totalBudgeted.toLocaleString()}
                  </td>
                  <td className="px-6 text-right text-sm font-['Roboto_Mono',monospace] font-bold">
                    ${totalActual.toLocaleString()}
                  </td>
                  <td className="px-6 text-right text-sm font-['Roboto_Mono',monospace] font-bold text-[#36B37E]">
                    -${(totalBudgeted - totalActual).toLocaleString()}
                  </td>
                  <td className="px-6 text-center text-sm text-[#737373]">
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
      <motion.div variants={animationVariants.listItem}>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Spend vs Plan
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateRange('week')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'week'
                    ? "bg-[#FFCF4B] text-[#2C2C2C] font-medium"
                    : "bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5]"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'month'
                    ? "bg-[#FFCF4B] text-[#2C2C2C] font-medium"
                    : "bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5]"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={cn(
                  "px-3 py-1 text-xs rounded transition-all duration-200",
                  dateRange === 'all'
                    ? "bg-[#FFCF4B] text-[#2C2C2C] font-medium"
                    : "bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5]"
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
                  <stop offset="5%" stopColor="#FFCF4B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFCF4B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }}
              />
              <YAxis
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }}
              />
              <Tooltip
                formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                labelFormatter={(label) => `Week ${label.replace('Wk ', '')}`}
              />
              {/* Vertical line marking "today" — x must match the XAxis dataKey value */}
              <ReferenceLine x="Wk 5" stroke="#0A0A0A" strokeDasharray="4 4" label={{ value: 'Today', position: 'top', fill: '#737373', fontSize: 11 }} />
              {/* Planned burn — dashed line */}
              <Area
                type="monotone"
                dataKey="planned"
                stroke="#A3A3A3"
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
                stroke="#FFCF4B"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#737373] mt-3 text-center">
            This chart shows if spending is tracking at the expected rate based on the budget plan.
          </p>
        </Card>
      </motion.div>

      {/* AI Budget Insight Card */}
      <motion.div variants={animationVariants.listItem}>
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