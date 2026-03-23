/**
 * Sell Dashboard - Commercial engine KPIs and action cards
 * Matches BookDashboard pattern with MW design system
 */

import React, { useState } from 'react';
import { DollarSign, Receipt, TrendingUp, BarChart3, AlertTriangle, CreditCard, FileText, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';


// Mock data
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
  { job: 'JOB-0012', margin: 23.1, color: 'var(--mw-yellow-400)' },
  { job: 'JOB-0010', margin: 15.1, color: 'var(--mw-yellow-400)' },
  { job: 'JOB-0008', margin: 18.4, color: 'var(--mw-yellow-400)' },
  { job: 'JOB-0007', margin: 21.2, color: 'var(--mw-yellow-400)' },
  { job: 'JOB-0006', margin: 12.8, color: 'var(--mw-mirage)' },
  { job: 'JOB-0003', margin: 16.5, color: 'var(--mw-yellow-400)' },
  { job: 'JOB-0011', margin: 6.5, color: 'var(--mw-mirage)' },
  { job: 'JOB-0005', margin: 3.2, color: 'var(--mw-mirage)' },
  { job: 'JOB-0004', margin: 8.9, color: 'var(--mw-mirage)' },
  { job: 'JOB-0009', margin: -7.8, color: 'var(--mw-mirage)' },
];

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
    <ModuleDashboard title="Sell" tabs={sellTabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[var(--mw-yellow-400)]" />
              </div>
              <Badge className="bg-[var(--mw-yellow-400)]/20 text-[var(--neutral-900)] border-transparent">
                +{kpiData.monthlyRevenue.change}%
              </Badge>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Monthly Revenue
            </h3>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              ${kpiData.monthlyRevenue.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              vs. previous month
            </p>
          </Card>
        </motion.div>

        {/* Outstanding Invoices */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-yellow-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[var(--mw-yellow-700)]" />
              </div>
              <Badge className="bg-[var(--neutral-100)] text-muted-foreground border-transparent">
                {kpiData.outstandingInvoices.count} invoices
              </Badge>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Outstanding Invoices
            </h3>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              ${kpiData.outstandingInvoices.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting payment
            </p>
          </Card>
        </motion.div>

        {/* Profit Margin */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--mw-yellow-400)]" />
              </div>
              <Badge className="bg-[var(--mw-yellow-400)]/20 text-foreground border-transparent">
                +{kpiData.profitMargin.change}%
              </Badge>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Profit Margin
            </h3>
            <p className="text-2xl font-semibold text-foreground">
              {kpiData.profitMargin.value}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Average job margin
            </p>
          </Card>
        </motion.div>

        {/* Cash Flow */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[var(--mw-yellow-400)]" />
              </div>
              <Badge className="bg-[var(--neutral-100)] text-foreground border-transparent">
                {kpiData.cashFlow.change}%
              </Badge>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Cash Flow
            </h3>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              ${kpiData.cashFlow.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Net invoiced - expenses
            </p>
          </Card>
        </motion.div>

        {/* Overdue Invoices */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--mw-yellow-400)]" />
              </div>
              <Badge className="bg-[var(--neutral-100)] text-foreground border-transparent">
                {kpiData.overdueInvoices.count} overdue
              </Badge>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Overdue Invoices
            </h3>
            <p className="text-2xl font-semibold text-[var(--mw-error)] tabular-nums">
              ${kpiData.overdueInvoices.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Requires attention
            </p>
          </Card>
        </motion.div>

        {/* Expenses This Month */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <Badge className="bg-[var(--neutral-100)] text-muted-foreground border-transparent">
                {Math.round((kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100)}% of budget
              </Badge>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Expenses This Month
            </h3>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              ${kpiData.expensesThisMonth.value.toLocaleString()}
            </p>
            <div className="mt-3">
              <div className="relative h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-[var(--mw-yellow-400)] transition-all duration-300"
                  style={{ width: `${(kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses Area Chart */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Revenue vs Expenses (12 months)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mw-yellow-400)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--mw-yellow-400)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mw-mirage)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--mw-mirage)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }} />
                <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="var(--mw-yellow-400)" strokeWidth={2} fill="url(#revenueGradient)" />
                <Area type="monotone" dataKey="expenses" stroke="var(--mw-mirage)" strokeWidth={2} fill="url(#expensesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Job Profitability Bar Chart */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Top 10 Jobs by Profit Margin
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={jobProfitabilityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', fill: 'var(--muted-foreground)' }} />
                <YAxis dataKey="job" type="category" tick={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', fill: 'var(--muted-foreground)' }} width={80} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20}>
                  {jobProfitabilityData.map((entry, i) => (
                    <Cell key={`cell-${entry.job}-${i}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Approval Queue */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Approval Queue
              </h3>
              <Badge className="bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] border-transparent">
                {approvalQueue.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--neutral-100)] rounded-[var(--shape-md)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {item.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.id}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--neutral-600)] mb-1">
                      {item.customer}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      ${item.amount.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-foreground" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-[var(--border)]">
              <FileText className="w-4 h-4 mr-2" />
              View All Approvals
            </Button>
          </Card>
        </motion.div>

        {/* Xero Sync Status */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Xero Sync Status
              </h3>
              <div className="w-3 h-3 bg-[var(--mw-mirage)] rounded-full" />
            </div>
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Last synced
                </span>
                <span className="text-xs font-medium text-foreground">
                  2 minutes ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Invoices synced
                </span>
                <span className="text-xs font-medium text-foreground">
                  147 / 147
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Status
                </span>
                <Badge className="bg-[var(--neutral-100)] text-foreground border-transparent text-xs">
                  Healthy
                </Badge>
              </div>
            </div>
            <Button className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] group">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 3
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              Sync Now
            </Button>
          </Card>
        </motion.div>

        {/* Overdue Actions */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Overdue Actions
              </h3>
              <Badge className="bg-[var(--mw-error-light)] text-[var(--mw-error)] border-transparent">
                {overdueActions.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {overdueActions.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--neutral-100)] rounded-[var(--shape-md)] hover:bg-[var(--neutral-200)] transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--mw-error)] font-medium">
                        {item.id}
                      </span>
                      <Badge className="bg-[var(--mw-error)] text-white text-xs">
                        {item.daysOverdue}d
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground mb-1">
                      {item.customer}
                    </p>
                    <p className="text-xs font-medium text-[var(--mw-error)]">
                      ${item.amount?.toLocaleString() || `$${item.value?.toLocaleString()}`}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-[var(--mw-error)]" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-[var(--border)] text-[var(--mw-error)]">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Follow Up All
            </Button>
          </Card>
        </motion.div>
      </div>
      </motion.div>
    </ModuleDashboard>
  );
}