/**
 * Sell Dashboard - Commercial engine KPIs and action cards
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { DollarSign, Receipt, TrendingUp, BarChart3, AlertTriangle, CreditCard, FileText, CheckCircle2, RefreshCw, Clock, LineChart, BarChart2, Users, Target, Trophy, Download, Sparkles, PieChart as PieChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { AISuggestion } from '@/components/shared/ai/AISuggestion';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { IconWell } from '@/components/shared/icons/IconWell';
import {
  MW_AXIS_TICK,
  MW_CARTESIAN_GRID,
  MW_BAR_TOOLTIP_CURSOR,
  MW_RECHARTS_ANIMATION,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_H,
  getChartScalePattern,
  marginToScalePercent,
} from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart as RechartsLineChart,
  Line,
  Legend,
} from 'recharts';

const kpiData = {
  monthlyRevenue: { value: 287500, change: 12.5, trend: 'up' },
  outstandingInvoices: { count: 12, value: 45800, trend: 'neutral' },
  profitMargin: { value: 18.3, change: 2.1, trend: 'up' },
  cashFlow: { value: 156200, change: -5.2, trend: 'down' },
  overdueInvoices: { count: 3, value: 18500, trend: 'warning' },
  expensesThisMonth: { value: 42300, budget: 50000, trend: 'neutral' },
};

const revenueData = [
  { month: 'Mar', revenue: 245000, expenses: 198000 },
  { month: 'Apr', revenue: 268000, expenses: 205000 },
  { month: 'May', revenue: 291000, expenses: 218000 },
  { month: 'Jun', revenue: 278000, expenses: 212000 },
  { month: 'Jul', revenue: 255000, expenses: 195000 },
  { month: 'Aug', revenue: 282000, expenses: 208000 },
  { month: 'Sep', revenue: 269000, expenses: 201000 },
  { month: 'Oct', revenue: 298000, expenses: 225000 },
  { month: 'Nov', revenue: 275000, expenses: 210000 },
  { month: 'Dec', revenue: 260000, expenses: 200000 },
  { month: 'Jan', revenue: 283000, expenses: 215000 },
  { month: 'Feb', revenue: 287500, expenses: 220000 },
];

const jobProfitabilityData = [
  { job: 'JOB-0012', margin: 23.1 },
  { job: 'JOB-0010', margin: 15.1 },
  { job: 'JOB-0008', margin: 18.4 },
  { job: 'JOB-0007', margin: 21.2 },
  { job: 'JOB-0006', margin: 12.8 },
  { job: 'JOB-0003', margin: 16.5 },
  { job: 'JOB-0011', margin: 6.5 },
  { job: 'JOB-0005', margin: 3.2 },
  { job: 'JOB-0004', margin: 8.9 },
  { job: 'JOB-0009', margin: -7.8 },
];

const badgeNeutral =
  'border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)]';

const approvalQueue = [
  { type: 'Quote', id: 'QT-2026-0142', amount: 12500, customer: 'TechCorp Industries' },
  { type: 'Order', id: 'SO-2026-0089', amount: 8900, customer: 'Pacific Fab' },
  { type: 'Quote', id: 'QT-2026-0143', amount: 3500, customer: 'Hunter Steel' },
];

const overdueActions = [
  { type: 'Invoice', id: 'INV-2026-0234', customer: 'TechCorp Industries', amount: 12400, daysOverdue: 14 },
  { type: 'Invoice', id: 'INV-2026-0198', customer: 'AeroSpace Ltd', amount: 4800, daysOverdue: 7 },
  { type: 'Follow-up', id: 'OPP-0156', customer: 'BHP Contractors', value: 28000, daysOverdue: 3 },
];

/* ── Analysis tab data ── */

const pipelineFunnel = [
  { stage: 'Opportunity', count: 48, value: 1420000 },
  { stage: 'Qualified', count: 32, value: 980000 },
  { stage: 'Proposal', count: 18, value: 620000 },
  { stage: 'Negotiation', count: 9, value: 385000 },
  { stage: 'Closed Won', count: 6, value: 287500 },
];

const winLossData = { wins: 62, losses: 38 };

const revenueTrendData = [
  { month: 'Sep', revenue: 269000 },
  { month: 'Oct', revenue: 298000 },
  { month: 'Nov', revenue: 275000 },
  { month: 'Dec', revenue: 260000 },
  { month: 'Jan', revenue: 283000 },
  { month: 'Feb', revenue: 287500 },
];

const topPerformers = [
  { name: 'Sarah Chen', initials: 'SC', revenue: 98500, deals: 14 },
  { name: 'Mike Thompson', initials: 'MT', revenue: 82300, deals: 11 },
  { name: 'Jessica Park', initials: 'JP', revenue: 64200, deals: 9 },
  { name: 'David Lee', initials: 'DL', revenue: 42500, deals: 7 },
];

/* ── Reports tab data ── */

const reportTemplates = [
  { icon: BarChart3, title: 'Sales Summary', description: 'Monthly overview of revenue, margins, and order volumes across all channels.' },
  { icon: Target, title: 'Pipeline Report', description: 'Current pipeline stages, conversion rates, and projected close dates.' },
  { icon: Clock, title: 'Activity Report', description: 'Sales team activities including calls, meetings, and follow-ups this period.' },
  { icon: DollarSign, title: 'Revenue by Product', description: 'Revenue breakdown by product line with year-over-year comparisons.' },
  { icon: Users, title: 'Customer Analysis', description: 'Customer segmentation, lifetime value, and retention metrics.' },
  { icon: TrendingUp, title: 'Forecast Accuracy', description: 'Comparison of forecasted vs actual revenue with variance analysis.' },
];

/* ── Forecasts tab data ── */

const forecastChartData = [
  { month: 'Sep', actual: 269000, forecast: null },
  { month: 'Oct', actual: 298000, forecast: null },
  { month: 'Nov', actual: 275000, forecast: null },
  { month: 'Dec', actual: 260000, forecast: null },
  { month: 'Jan', actual: 283000, forecast: null },
  { month: 'Feb', actual: 287500, forecast: null },
  { month: 'Mar', actual: null, forecast: 295000 },
  { month: 'Apr', actual: null, forecast: 310000 },
  { month: 'May', actual: null, forecast: 328000 },
];

const quarterlyTargets = [
  { quarter: 'Q1', target: 850000, current: 830500, status: 'complete' },
  { quarter: 'Q2', target: 920000, current: 287500, status: 'active' },
  { quarter: 'Q3', target: 980000, current: 0, status: 'upcoming' },
  { quarter: 'Q4', target: 1050000, current: 0, status: 'upcoming' },
];

const sellTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'reports', label: 'Reports' },
  { key: 'forecasts', label: 'Forecasts' },
];

export function SellDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ModuleDashboard
      title="Sell"
      tabs={sellTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="sell"
    >
      {activeTab === 'overview' && (
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Monthly Revenue"
            value={`$${kpiData.monthlyRevenue.value.toLocaleString()}`}
            icon={DollarSign}
            iconSurface="key"
            trailing={
              <Badge className={badgeNeutral}>
                +{kpiData.monthlyRevenue.change}%
              </Badge>
            }
            hint="vs. previous month"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Outstanding Invoices"
            value={`$${kpiData.outstandingInvoices.value.toLocaleString()}`}
            icon={Receipt}
            trailing={
              <Badge className={badgeNeutral}>
                {kpiData.outstandingInvoices.count} invoices
              </Badge>
            }
            hint="Awaiting payment"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Profit Margin"
            value={`${kpiData.profitMargin.value}%`}
            icon={TrendingUp}
            trailing={
              <Badge className={badgeNeutral}>
                +{kpiData.profitMargin.change}%
              </Badge>
            }
            hint="Average job margin"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Cash Flow"
            value={`$${kpiData.cashFlow.value.toLocaleString()}`}
            icon={BarChart3}
            trailing={
              <Badge className={badgeNeutral}>
                {kpiData.cashFlow.change}%
              </Badge>
            }
            hint="Net invoiced - expenses"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Overdue Invoices"
            value={`$${kpiData.overdueInvoices.value.toLocaleString()}`}
            icon={AlertTriangle}
            trailing={
              <Badge className={badgeNeutral}>
                {kpiData.overdueInvoices.count} overdue
              </Badge>
            }
            hint="Requires attention"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Expenses This Month"
            value={`$${kpiData.expensesThisMonth.value.toLocaleString()}`}
            icon={CreditCard}
            trailing={
              <Badge className={badgeNeutral}>
                {Math.round((kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100)}% of budget
              </Badge>
            }
            footer={
              <div className="mt-3">
                <ProgressBar value={kpiData.expensesThisMonth.value} max={kpiData.expensesThisMonth.budget} />
              </div>
            }
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={staggerItem}>
          <ChartCard title="Revenue vs Expenses (12 months)">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-scale-high)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--chart-scale-high)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-scale-mid)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--chart-scale-mid)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...MW_CARTESIAN_GRID} />
                <XAxis dataKey="month" tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={MW_TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-scale-high)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  {...MW_RECHARTS_ANIMATION}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--chart-scale-mid)"
                  strokeWidth={2}
                  fill="url(#expensesGradient)"
                  {...MW_RECHARTS_ANIMATION}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChartCard title="Top 10 Jobs by Profit Margin">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={jobProfitabilityData} layout="vertical">
                {mwChartPatternDefs()}
                <CartesianGrid {...MW_CARTESIAN_GRID} horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                <YAxis dataKey="job" type="category" tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} width={80} />
                <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `${v}%`} contentStyle={MW_TOOLTIP_STYLE} />
                <Bar dataKey="margin" radius={MW_BAR_RADIUS_H} barSize={20} {...MW_RECHARTS_ANIMATION_BAR}>
                  {jobProfitabilityData.map((entry, i) => (
                    <Cell
                      key={`cell-${entry.job}-${i}`}
                      fill={getChartScalePattern(marginToScalePercent(entry.margin))}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Approval Queue
              </h3>
              <Badge className="border-0 bg-[var(--mw-yellow-400)] text-primary-foreground">
                {approvalQueue.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((item, i) => (
                <div key={i} className="flex cursor-pointer items-center justify-between rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-3 transition-colors hover:bg-[var(--neutral-100)]">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {item.type}
                      </span>
                      <span className="text-xs text-[var(--neutral-500)] tabular-nums">
                        {item.id}
                      </span>
                    </div>
                    <p className="mb-1 text-xs text-[var(--neutral-600)]">
                      {item.customer}
                    </p>
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      ${item.amount.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-[var(--neutral-700)]" strokeWidth={1.5} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full border-[var(--border)]" onClick={() => toast('Opening approvals\u2026')}>
              <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} />
              View All Approvals
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Xero Sync Status
              </h3>
              <div className="h-3 w-3 rounded-full bg-[var(--mw-yellow-400)]" />
            </div>
            <div className="mb-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--neutral-500)]">
                  Last synced
                </span>
                <span className="text-xs font-medium text-foreground">
                  2 minutes ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--neutral-500)]">
                  Invoices synced
                </span>
                <span className="text-xs font-medium text-foreground">
                  147 / 147
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--neutral-500)]">
                  Status
                </span>
                <Badge className={badgeNeutral}>
                  Healthy
                </Badge>
              </div>
            </div>
            <Button className="group w-full bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" onClick={() => { toast('Syncing with Xero\u2026'); setTimeout(() => toast.success('Xero sync complete'), 1500); }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 3
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} />
              </motion.div>
              Sync Now
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Overdue Actions
              </h3>
              <Badge className="border-0 bg-[var(--neutral-200)] text-[var(--neutral-800)]">
                {overdueActions.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {overdueActions.map((item, i) => (
                <div key={i} className="flex cursor-pointer items-center justify-between rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-3 transition-colors hover:bg-[var(--neutral-200)]">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium tabular-nums text-foreground">
                        {item.id}
                      </span>
                      <Badge className="border-0 bg-[var(--neutral-300)] text-foreground text-xs">
                        {item.daysOverdue}d
                      </Badge>
                    </div>
                    <p className="mb-1 text-xs text-foreground">
                      {item.customer}
                    </p>
                    <p className="text-xs font-medium tabular-nums text-[var(--neutral-800)]">
                      ${item.amount?.toLocaleString() || `$${item.value?.toLocaleString()}`}
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-[var(--neutral-600)]" strokeWidth={1.5} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full border-[var(--border)] text-foreground" onClick={() => toast.success('Follow-up emails queued for 3 contacts')}>
              <AlertTriangle className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Follow Up All
            </Button>
          </Card>
        </motion.div>
      </div>
      </motion.div>
      )}

      {/* ── Analysis Tab ── */}
      {activeTab === 'analysis' && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">

          {/* Pipeline Funnel */}
          <motion.div variants={staggerItem}>
            <Card className="p-6">
              <h3 className="mb-6 text-base font-medium text-foreground">
                Pipeline Funnel
              </h3>
              <div className="flex items-stretch gap-1">
                {pipelineFunnel.map((stage, i) => {
                  const maxCount = pipelineFunnel[0].count;
                  const heightPct = 40 + (stage.count / maxCount) * 60;
                  return (
                    <div key={stage.stage} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative flex w-full flex-col items-center justify-center rounded-[var(--shape-md)] px-2 py-4" style={{
                        backgroundColor: `color-mix(in srgb, var(--mw-yellow-400) ${100 - i * 18}%, var(--neutral-100))`,
                        minHeight: `${heightPct}px`,
                      }}>
                        <span className="text-2xl font-bold tabular-nums text-foreground">{stage.count}</span>
                        <span className="text-[10px] font-medium tabular-nums text-[var(--neutral-700)]">${(stage.value / 1000).toFixed(0)}k</span>
                      </div>
                      <span className="text-xs font-medium text-[var(--neutral-600)] text-center">{stage.stage}</span>
                      {i < pipelineFunnel.length - 1 && (
                        <span className="text-[10px] tabular-nums text-[var(--neutral-400)]">
                          {Math.round((pipelineFunnel[i + 1].count / stage.count) * 100)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Win/Loss Analysis */}
            <motion.div variants={staggerItem}>
              <Card className="p-6">
                <h3 className="mb-4 text-base font-medium text-foreground">
                  Win / Loss Analysis
                </h3>
                <div className="flex items-center gap-8">
                  {/* Visual pie-style display */}
                  <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--neutral-100)" strokeWidth="16" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="var(--chart-scale-high)"
                        strokeWidth="16"
                        strokeDasharray={`${winLossData.wins * 2.51} ${100 * 2.51}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold tabular-nums text-foreground">{winLossData.wins}%</span>
                      <span className="text-xs text-[var(--neutral-500)]">Win Rate</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--chart-scale-high)]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Won</p>
                        <p className="text-xs text-[var(--neutral-500)]">{winLossData.wins}% of opportunities</p>
                      </div>
                      <span className="text-lg font-bold tabular-nums text-foreground">31</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--neutral-200)]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Lost</p>
                        <p className="text-xs text-[var(--neutral-500)]">{winLossData.losses}% of opportunities</p>
                      </div>
                      <span className="text-lg font-bold tabular-nums text-foreground">19</span>
                    </div>
                    <div className="rounded-[var(--shape-md)] bg-[var(--neutral-100)] px-3 py-2">
                      <p className="text-xs text-[var(--neutral-600)]">Top loss reason: <span className="font-medium text-foreground">Price (42%)</span></p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Revenue Trend (6 months) */}
            <motion.div variants={staggerItem}>
              <ChartCard title="Revenue Trend (6 months)">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueTrendData}>
                    <defs>
                      <linearGradient id="revTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-scale-high)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--chart-scale-high)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...MW_CARTESIAN_GRID} />
                    <XAxis dataKey="month" tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                    <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={MW_TOOLTIP_STYLE} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--chart-scale-high)"
                      strokeWidth={2}
                      fill="url(#revTrendGrad)"
                      {...MW_RECHARTS_ANIMATION}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </motion.div>
          </div>

          {/* Top Performers */}
          <motion.div variants={staggerItem}>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-medium text-foreground">
                  Top Performers
                </h3>
                <Badge className={badgeNeutral}>This quarter</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {topPerformers.map((rep, i) => (
                  <div key={rep.name} className="flex items-center gap-3 rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-4">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-sm font-bold text-primary-foreground">
                      {rep.initials}
                      {i === 0 && (
                        <Trophy className="absolute -right-1 -top-1 h-4 w-4 text-[var(--mw-yellow-600)]" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{rep.name}</p>
                      <p className="text-xs tabular-nums text-[var(--neutral-600)]">{rep.deals} deals</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-foreground">${(rep.revenue / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* ── Reports Tab ── */}
      {activeTab === 'reports' && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">

          {/* Export Row */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">Report Templates</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-[var(--border)] text-xs" onClick={() => toast.success('Exporting as PDF\u2026')}>
                  <Download className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="border-[var(--border)] text-xs" onClick={() => toast.success('Exporting as CSV\u2026')}>
                  <Download className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="border-[var(--border)] text-xs" onClick={() => toast.success('Exporting as Excel\u2026')}>
                  <Download className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  Excel
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Report Template Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((report) => {
              const Icon = report.icon;
              return (
                <motion.div key={report.title} variants={staggerItem}>
                  <Card className="flex h-full flex-col p-6">
                    <IconWell icon={Icon} surface="onDark" className="mb-3" />
                    <h4 className="mb-1 text-sm font-medium text-foreground">{report.title}</h4>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-[var(--neutral-500)]">{report.description}</p>
                    <Button className="w-full bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" size="sm" onClick={() => toast('Generating report\u2026')}>
                      Generate
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Forecasts Tab ── */}
      {activeTab === 'forecasts' && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">

          {/* Forecast Chart */}
          <motion.div variants={staggerItem}>
            <ChartCard title="Revenue Forecast">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastChartData}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-scale-high)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--chart-scale-high)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--mw-yellow-400)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--mw-yellow-400)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="month" tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                  <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                  <Tooltip formatter={(v: number) => v ? `$${v.toLocaleString()}` : '--'} contentStyle={MW_TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--chart-scale-high)"
                    strokeWidth={2}
                    fill="url(#actualGrad)"
                    connectNulls={false}
                    {...MW_RECHARTS_ANIMATION}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="var(--mw-yellow-500)"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="url(#forecastGrad)"
                    connectNulls={false}
                    {...MW_RECHARTS_ANIMATION}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-5 bg-[var(--chart-scale-high)]" />
                  <span className="text-xs text-[var(--neutral-500)]">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-5 border-t-2 border-dashed border-[var(--mw-yellow-500)]" />
                  <span className="text-xs text-[var(--neutral-500)]">Forecast</span>
                </div>
              </div>
            </ChartCard>
          </motion.div>

          {/* Quarterly Targets */}
          <motion.div variants={staggerItem}>
            <h3 className="mb-4 text-base font-medium text-foreground">Quarterly Targets</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quarterlyTargets.map((q) => {
                const pct = q.target > 0 ? Math.min(100, Math.round((q.current / q.target) * 100)) : 0;
                const isComplete = q.status === 'complete';
                const isActive = q.status === 'active';
                return (
                  <Card key={q.quarter} className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{q.quarter}</span>
                      {isComplete && (
                        <Badge className="border-0 bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Complete
                        </Badge>
                      )}
                      {isActive && (
                        <Badge className="border-0 bg-[var(--mw-yellow-400)]/15 text-[var(--mw-yellow-600)] text-xs">
                          Active
                        </Badge>
                      )}
                      {q.status === 'upcoming' && (
                        <Badge className={badgeNeutral + ' text-xs'}>Upcoming</Badge>
                      )}
                    </div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--neutral-500)]">Target</span>
                      <span className="text-sm font-medium tabular-nums text-foreground">${(q.target / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--neutral-500)]">Current</span>
                      <span className="text-sm font-medium tabular-nums text-foreground">${(q.current / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--neutral-500)]">Completion</span>
                      <span className="text-sm font-bold tabular-nums text-foreground">{pct}%</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-[var(--neutral-100)]">
                      <div
                        className="absolute inset-0 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isComplete ? 'var(--chart-scale-high)' : isActive ? 'var(--mw-yellow-400)' : 'var(--neutral-300)',
                        }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          {/* AI Forecast Insight */}
          <motion.div variants={staggerItem}>
            <AISuggestion
              title="Q2 Revenue Forecast Adjustment"
              confidence={87}
              source="Historical revenue data, pipeline analysis, seasonal trends"
              impact="Projected +8.2% uplift if recommended actions are taken"
            >
              Based on current pipeline velocity and seasonal patterns, Q2 revenue is tracking 4.3% above initial forecast.
              Recommend increasing the Q2 target from $920k to $960k. Three high-value opportunities (TechCorp expansion,
              Pacific Fab renewal, Hunter Steel new project) have a combined 78% close probability and represent $142k in
              potential upside. Consider accelerating proposals for these accounts before end of April.
            </AISuggestion>
          </motion.div>
        </motion.div>
      )}
    </ModuleDashboard>
  );
}
