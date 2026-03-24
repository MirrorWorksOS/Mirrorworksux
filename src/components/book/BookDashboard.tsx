import React, { useState } from 'react';
import { DollarSign, Receipt, TrendingUp, BarChart3, AlertTriangle, CreditCard, FileText, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';

const bookTabs = [{ key: 'overview', label: 'Overview' }];

export function BookDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const kpiData = {
    monthlyRevenue: { value: 287500, change: 12.5, trend: 'up' },
    outstandingInvoices: { count: 12, value: 45800, trend: 'neutral' },
    profitMargin: { value: 18.3, change: 2.1, trend: 'up' },
    cashFlow: { value: 156200, change: -5.2, trend: 'down' },
    overdueInvoices: { count: 3, value: 18500, trend: 'warning' },
    expensesThisMonth: { value: 42300, budget: 50000, trend: 'neutral' },
  };

  const approvalQueue = [
    { type: 'Expense', id: 'EXP-2026-0142', amount: 1250, status: 'pending' },
    { type: 'PO', id: 'PO-2026-0089', amount: 8900, status: 'pending' },
    { type: 'Expense', id: 'EXP-2026-0143', amount: 350, status: 'pending' },
  ];

  const overdueActions = [
    { type: 'Invoice', id: 'INV-2026-0234', customer: 'TechCorp Industries', amount: 12400, daysOverdue: 14 },
    { type: 'Invoice', id: 'INV-2026-0198', customer: 'AeroSpace Ltd', amount: 4800, daysOverdue: 7 },
    { type: 'Bill', id: 'BILL-789', vendor: 'Steel Suppliers Co', amount: 1300, daysOverdue: 3 },
  ];

  return (
    <ModuleDashboard title="Book" tabs={bookTabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-blue-100)] rounded-[var(--shape-lg)] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[var(--mw-blue)]" />
              </div>
              <Badge className="bg-[var(--mw-mirage)] text-[var(--mw-yellow-400)] border-transparent">
                +{kpiData.monthlyRevenue.change}%
              </Badge>
            </div>
            <h3 className="font-medium text-xs font-medium text-[var(--neutral-500)] mb-1">
              Monthly Revenue
            </h3>
            <p className="text-2xl font-semibold tabular-nums text-[var(--mw-mirage)]">
              ${kpiData.monthlyRevenue.value.toLocaleString()}
            </p>
            <p className="font-normal text-xs text-[var(--neutral-500)] mt-2">
              vs. previous month
            </p>
          </Card>
        </motion.div>

        {/* Outstanding Invoices */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-amber-100)] rounded-[var(--shape-lg)] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[var(--mw-amber)]" />
              </div>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-transparent">
                {kpiData.outstandingInvoices.count} invoices
              </Badge>
            </div>
            <h3 className="font-medium text-xs font-medium text-[var(--neutral-500)] mb-1">
              Outstanding Invoices
            </h3>
            <p className="text-2xl font-semibold tabular-nums text-[var(--mw-mirage)]">
              ${kpiData.outstandingInvoices.value.toLocaleString()}
            </p>
            <p className="font-normal text-xs text-[var(--neutral-500)] mt-2">
              Awaiting payment
            </p>
          </Card>
        </motion.div>

        {/* Profit Margin */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-lg)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--mw-yellow-400)]" />
              </div>
              <Badge className="bg-[var(--mw-mirage)] text-[var(--mw-yellow-400)] border-transparent">
                +{kpiData.profitMargin.change}%
              </Badge>
            </div>
            <h3 className="font-medium text-xs font-medium text-[var(--neutral-500)] mb-1">
              Profit Margin
            </h3>
            <p className="text-2xl font-semibold tabular-nums text-[var(--mw-mirage)]">
              {kpiData.profitMargin.value}%
            </p>
            <p className="font-normal text-xs text-[var(--neutral-500)] mt-2">
              Average job margin
            </p>
          </Card>
        </motion.div>

        {/* Cash Flow */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-blue-100)] rounded-[var(--shape-lg)] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[var(--mw-blue)]" />
              </div>
              <Badge className="bg-[var(--mw-error-100)] text-[var(--mw-error)] border-transparent">
                {kpiData.cashFlow.change}%
              </Badge>
            </div>
            <h3 className="font-medium text-xs font-medium text-[var(--neutral-500)] mb-1">
              Cash Flow
            </h3>
            <p className="text-2xl font-semibold tabular-nums text-[var(--mw-mirage)]">
              ${kpiData.cashFlow.value.toLocaleString()}
            </p>
            <p className="font-normal text-xs text-[var(--neutral-500)] mt-2">
              Net invoiced - expenses
            </p>
          </Card>
        </motion.div>

        {/* Overdue Invoices */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-error-100)] rounded-[var(--shape-lg)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--mw-error)]" />
              </div>
              <Badge className="bg-[var(--mw-error-100)] text-[var(--mw-error)] border-transparent">
                {kpiData.overdueInvoices.count} overdue
              </Badge>
            </div>
            <h3 className="font-medium text-xs font-medium text-[var(--neutral-500)] mb-1">
              Overdue Invoices
            </h3>
            <p className="text-2xl font-semibold tabular-nums text-[var(--mw-error)]">
              ${kpiData.overdueInvoices.value.toLocaleString()}
            </p>
            <p className="font-normal text-xs text-[var(--neutral-500)] mt-2">
              Requires attention
            </p>
          </Card>
        </motion.div>

        {/* Expenses This Month */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-lg)] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[var(--neutral-500)]" />
              </div>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-transparent">
                {Math.round((kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100)}% of budget
              </Badge>
            </div>
            <h3 className="font-medium text-xs font-medium text-[var(--neutral-500)] mb-1">
              Expenses This Month
            </h3>
            <p className="text-2xl font-semibold tabular-nums text-[var(--mw-mirage)]">
              ${kpiData.expensesThisMonth.value.toLocaleString()}
            </p>
            <div className="mt-3">
              <div className="relative h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-[var(--mw-yellow-400)] transition-all duration-[var(--duration-medium1)]"
                  style={{ width: `${(kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Approval Queue */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">
                Approval Queue
              </h3>
              <Badge className="bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] border-transparent">
                {approvalQueue.length}
              </Badge>
            </div>
            
            <div className="space-y-4">
              {approvalQueue.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--neutral-100)] rounded-[var(--shape-lg)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs font-medium text-[var(--mw-mirage)]">
                        {item.type}
                      </span>
                      <span className="text-xs text-[var(--neutral-500)] tabular-nums">
                        {item.id}
                      </span>
                    </div>
                    <p className="text-sm font-medium tabular-nums text-[var(--mw-mirage)]">
                      ${item.amount.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[var(--mw-yellow-400)]" />
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
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">
                Xero Sync Status
              </h3>
              <div className="w-3 h-3 bg-[var(--mw-yellow-400)] rounded-full" />
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-normal text-xs text-[var(--neutral-500)]">
                  Last synced
                </span>
                <span className="font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  2 minutes ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-normal text-xs text-[var(--neutral-500)]">
                  Invoices synced
                </span>
                <span className="font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  147 / 147
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-normal text-xs text-[var(--neutral-500)]">
                  Status
                </span>
                <Badge className="bg-[var(--mw-mirage)] text-[var(--mw-yellow-400)] border-transparent text-xs">
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
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">
                Overdue Actions
              </h3>
              <Badge className="bg-[var(--mw-error-100)] text-[var(--mw-error)] border-transparent">
                {overdueActions.length}
              </Badge>
            </div>
            
            <div className="space-y-4">
              {overdueActions.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--mw-error-100)] rounded-[var(--shape-lg)] hover:bg-[var(--mw-error-200)] transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--mw-error)] font-medium tabular-nums">
                        {item.id}
                      </span>
                      <Badge className="bg-[var(--mw-error)] text-white text-xs">
                        {item.daysOverdue}d
                      </Badge>
                    </div>
                    <p className="font-normal text-xs text-[var(--mw-mirage)] mb-1">
                      {item.type === 'Invoice' ? item.customer : item.vendor}
                    </p>
                    <p className="text-xs font-medium tabular-nums text-[var(--mw-error)]">
                      ${item.amount.toLocaleString()}
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

      {/* Revenue vs Expenses Chart Placeholder */}
      <motion.div variants={staggerItem}>
        <Card className="p-6">
          <h3 className="text-base font-medium text-[var(--mw-mirage)] mb-4">
            Revenue vs Expenses
          </h3>
          <div className="h-[300px] bg-[var(--neutral-100)] rounded-[var(--shape-lg)] flex items-center justify-center">
            <p className="font-normal text-sm text-[var(--neutral-500)]">
              Chart visualization (Recharts integration)
            </p>
          </div>
        </Card>
      </motion.div>
      </motion.div>
    </ModuleDashboard>
  );
}
