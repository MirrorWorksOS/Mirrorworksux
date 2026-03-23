/**
 * Sell Dashboard - Commercial engine KPIs and action cards
 * Matches BookDashboard pattern with MW design system
 */

import React from 'react';
import { DollarSign, Receipt, TrendingUp, BarChart3, AlertTriangle, CreditCard, FileText, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { cn } from '../ui/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';

const { animationVariants } = designSystem;

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
  { job: 'JOB-0012', margin: 23.1, color: '#36B37E' },
  { job: 'JOB-0010', margin: 15.1, color: '#36B37E' },
  { job: 'JOB-0008', margin: 18.4, color: '#36B37E' },
  { job: 'JOB-0007', margin: 21.2, color: '#36B37E' },
  { job: 'JOB-0006', margin: 12.8, color: '#FACC15' },
  { job: 'JOB-0003', margin: 16.5, color: '#36B37E' },
  { job: 'JOB-0011', margin: 6.5, color: '#FACC15' },
  { job: 'JOB-0005', margin: 3.2, color: '#DE350B' },
  { job: 'JOB-0004', margin: 8.9, color: '#FACC15' },
  { job: 'JOB-0009', margin: -7.8, color: '#DE350B' },
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

export function SellDashboard() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-8 space-y-8"
    >
      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DEEBFF] rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0052CC]" />
            </div>
            <Badge className="bg-[#E3FCEF] text-[#36B37E] border-transparent">
              +{kpiData.monthlyRevenue.change}%
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">
            Monthly Revenue
          </h3>
          <p className="font-mono text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.monthlyRevenue.value.toLocaleString()}
          </p>
          <p className="text-[12px] text-[#737373] mt-2">
            vs. previous month
          </p>
        </motion.div>

        {/* Outstanding Invoices */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#FF8B00]" />
            </div>
            <Badge className="bg-[#F5F5F5] text-[#737373] border-transparent">
              {kpiData.outstandingInvoices.count} invoices
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">
            Outstanding Invoices
          </h3>
          <p className="font-mono text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.outstandingInvoices.value.toLocaleString()}
          </p>
          <p className="text-[12px] text-[#737373] mt-2">
            Awaiting payment
          </p>
        </motion.div>

        {/* Profit Margin */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#36B37E]" />
            </div>
            <Badge className="bg-[#E3FCEF] text-[#36B37E] border-transparent">
              +{kpiData.profitMargin.change}%
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">
            Profit Margin
          </h3>
          <p className="font-mono text-[24px] font-semibold text-[#0A0A0A]">
            {kpiData.profitMargin.value}%
          </p>
          <p className="text-[12px] text-[#737373] mt-2">
            Average job margin
          </p>
        </motion.div>

        {/* Cash Flow */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DEEBFF] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#0052CC]" />
            </div>
            <Badge className="bg-[#FFEBE6] text-[#DE350B] border-transparent">
              {kpiData.cashFlow.change}%
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">
            Cash Flow
          </h3>
          <p className="font-mono text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.cashFlow.value.toLocaleString()}
          </p>
          <p className="text-[12px] text-[#737373] mt-2">
            Net invoiced - expenses
          </p>
        </motion.div>

        {/* Overdue Invoices */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FFEBE6] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#DE350B]" />
            </div>
            <Badge className="bg-[#FFEBE6] text-[#DE350B] border-transparent">
              {kpiData.overdueInvoices.count} overdue
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">
            Overdue Invoices
          </h3>
          <p className="font-mono text-[24px] font-semibold text-[#DE350B]">
            ${kpiData.overdueInvoices.value.toLocaleString()}
          </p>
          <p className="text-[12px] text-[#737373] mt-2">
            Requires attention
          </p>
        </motion.div>

        {/* Expenses This Month */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#737373]" />
            </div>
            <Badge className="bg-[#F5F5F5] text-[#737373] border-transparent">
              {Math.round((kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100)}% of budget
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">
            Expenses This Month
          </h3>
          <p className="font-mono text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.expensesThisMonth.value.toLocaleString()}
          </p>
          <div className="mt-3">
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-[#36B37E] transition-all duration-300"
                style={{ width: `${(kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses Area Chart */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
        >
          <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">
            Revenue vs Expenses (12 months)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36B37E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#36B37E" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DE350B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DE350B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#737373', fontFamily: 'Roboto Mono' }} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: '#737373', fontFamily: 'Roboto Mono' }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#36B37E" strokeWidth={2} fill="url(#revenueGradient)" />
              <Area type="monotone" dataKey="expenses" stroke="#DE350B" strokeWidth={2} fill="url(#expensesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Job Profitability Bar Chart */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
        >
          <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">
            Top 10 Jobs by Profit Margin
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={jobProfitabilityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis dataKey="job" type="category" tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} width={80} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20}>
                {jobProfitabilityData.map((entry, i) => (
                  <Cell key={`cell-${entry.job}-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Approval Queue */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#0A0A0A]">
              Approval Queue
            </h3>
            <Badge className="bg-[#FFCF4B] text-[#2C2C2C] border-transparent">
              {approvalQueue.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {approvalQueue.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-[#0A0A0A]">
                      {item.type}
                    </span>
                    <span className="font-mono text-[12px] text-[#737373]">
                      {item.id}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#525252] mb-1">
                    {item.customer}
                  </p>
                  <p className="font-mono text-[14px] font-medium text-[#0A0A0A]">
                    ${item.amount.toLocaleString()}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#36B37E]" />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 border-[#E5E5E5]">
            <FileText className="w-4 h-4 mr-2" />
            View All Approvals
          </Button>
        </motion.div>

        {/* Xero Sync Status */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#0A0A0A]">
              Xero Sync Status
            </h3>
            <div className="w-3 h-3 bg-[#36B37E] rounded-full" />
          </div>
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#737373]">
                Last synced
              </span>
              <span className="text-[13px] font-medium text-[#0A0A0A]">
                2 minutes ago
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#737373]">
                Invoices synced
              </span>
              <span className="text-[13px] font-medium text-[#0A0A0A]">
                147 / 147
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#737373]">
                Status
              </span>
              <Badge className="bg-[#E3FCEF] text-[#36B37E] border-transparent text-xs">
                Healthy
              </Badge>
            </div>
          </div>
          <Button className="w-full bg-[#FFCF4B] hover:bg-[var(--mw-yellow-500)] text-[#2C2C2C] group">
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
        </motion.div>

        {/* Overdue Actions */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#0A0A0A]">
              Overdue Actions
            </h3>
            <Badge className="bg-[#FFEBE6] text-[#DE350B] border-transparent">
              {overdueActions.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {overdueActions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#FFEBE6] rounded-lg hover:bg-[#FFCDD2] transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[12px] text-[#DE350B] font-medium">
                      {item.id}
                    </span>
                    <Badge className="bg-[#DE350B] text-white text-xs">
                      {item.daysOverdue}d
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[#0A0A0A] mb-1">
                    {item.customer}
                  </p>
                  <p className="font-mono text-[13px] font-medium text-[#DE350B]">
                    ${item.amount?.toLocaleString() || `$${item.value?.toLocaleString()}`}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-[#DE350B]" />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 border-[#E5E5E5] text-[#DE350B]">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Follow Up All
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}