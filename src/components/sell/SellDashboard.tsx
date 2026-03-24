/**
 * Sell Dashboard - Commercial engine KPIs and action cards
 */

import React, { useState } from 'react';
import { DollarSign, Receipt, TrendingUp, BarChart3, AlertTriangle, CreditCard, FileText, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import {
  MW_AXIS_TICK,
  MW_CARTESIAN_GRID,
  MW_BAR_TOOLTIP_CURSOR,
  MW_RECHARTS_ANIMATION,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  getChartScaleColour,
  marginToScalePercent,
} from '@/components/shared/charts/chart-theme';
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

const sellTabs = [{ key: 'overview', label: 'Overview' }];

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
                <div className="relative h-2 overflow-hidden rounded-full bg-[var(--neutral-100)]">
                  <div
                    className="absolute inset-0 bg-[var(--mw-yellow-400)] transition-all duration-300"
                    style={{
                      width: `${(kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100}%`,
                    }}
                  />
                </div>
              </div>
            }
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="mb-4 text-base font-medium text-[var(--neutral-900)]">
              Revenue vs Expenses (12 months)
            </h3>
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
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="mb-4 text-base font-medium text-[var(--neutral-900)]">
              Top 10 Jobs by Profit Margin
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={jobProfitabilityData} layout="vertical">
                <CartesianGrid {...MW_CARTESIAN_GRID} horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} />
                <YAxis dataKey="job" type="category" tick={{ ...MW_AXIS_TICK, fontVariantNumeric: 'tabular-nums' }} width={80} />
                <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `${v}%`} contentStyle={MW_TOOLTIP_STYLE} />
                <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20} {...MW_RECHARTS_ANIMATION_BAR}>
                  {jobProfitabilityData.map((entry, i) => (
                    <Cell
                      key={`cell-${entry.job}-${i}`}
                      fill={getChartScaleColour(marginToScalePercent(entry.margin))}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-[var(--neutral-900)]">
                Approval Queue
              </h3>
              <Badge className="border-0 bg-[var(--mw-yellow-400)] text-[var(--neutral-900)]">
                {approvalQueue.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((item, i) => (
                <div key={i} className="flex cursor-pointer items-center justify-between rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-3 transition-colors hover:bg-[var(--neutral-100)]">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--neutral-900)]">
                        {item.type}
                      </span>
                      <span className="text-xs text-[var(--neutral-500)] tabular-nums">
                        {item.id}
                      </span>
                    </div>
                    <p className="mb-1 text-xs text-[var(--neutral-600)]">
                      {item.customer}
                    </p>
                    <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                      ${item.amount.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-[var(--neutral-700)]" strokeWidth={1.5} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full border-[var(--border)]">
              <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} />
              View All Approvals
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-[var(--neutral-900)]">
                Xero Sync Status
              </h3>
              <div className="h-3 w-3 rounded-full bg-[var(--mw-yellow-400)]" />
            </div>
            <div className="mb-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--neutral-500)]">
                  Last synced
                </span>
                <span className="text-xs font-medium text-[var(--neutral-900)]">
                  2 minutes ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--neutral-500)]">
                  Invoices synced
                </span>
                <span className="text-xs font-medium text-[var(--neutral-900)]">
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
            <Button className="group w-full bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]">
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
              <h3 className="text-base font-medium text-[var(--neutral-900)]">
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
                      <span className="text-xs font-medium tabular-nums text-[var(--neutral-900)]">
                        {item.id}
                      </span>
                      <Badge className="border-0 bg-[var(--neutral-300)] text-[var(--neutral-900)] text-xs">
                        {item.daysOverdue}d
                      </Badge>
                    </div>
                    <p className="mb-1 text-xs text-[var(--neutral-900)]">
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
            <Button variant="outline" className="mt-4 w-full border-[var(--border)] text-[var(--neutral-900)]">
              <AlertTriangle className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Follow Up All
            </Button>
          </Card>
        </motion.div>
      </div>
      </motion.div>
    </ModuleDashboard>
  );
}
