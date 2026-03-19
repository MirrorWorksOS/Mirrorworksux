import React from 'react';
import { DollarSign, Receipt, TrendingUp, BarChart3, AlertTriangle, CreditCard, FileText, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { colors, motion: motionConfig, animationVariants } = designSystem;

export function BookDashboard() {
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
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-6 space-y-6"
    >
      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0A7AFF]" />
            </div>
            <Badge className="bg-[#E3FCEF] text-[#36B37E] border-transparent">
              +{kpiData.monthlyRevenue.change}%
            </Badge>
          </div>
          <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
            Monthly Revenue
          </h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.monthlyRevenue.value.toLocaleString()}
          </p>
          <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
            vs. previous month
          </p>
        </motion.div>

        {/* Outstanding Invoices */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#FF8B00]" />
            </div>
            <Badge className="bg-[#F5F5F5] text-[#737373] border-transparent">
              {kpiData.outstandingInvoices.count} invoices
            </Badge>
          </div>
          <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
            Outstanding Invoices
          </h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.outstandingInvoices.value.toLocaleString()}
          </p>
          <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
            Awaiting payment
          </p>
        </motion.div>

        {/* Profit Margin */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#36B37E]" />
            </div>
            <Badge className="bg-[#E3FCEF] text-[#36B37E] border-transparent">
              +{kpiData.profitMargin.change}%
            </Badge>
          </div>
          <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
            Profit Margin
          </h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
            {kpiData.profitMargin.value}%
          </p>
          <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
            Average job margin
          </p>
        </motion.div>

        {/* Cash Flow */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#0A7AFF]" />
            </div>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-transparent">
              {kpiData.cashFlow.change}%
            </Badge>
          </div>
          <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
            Cash Flow
          </h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
            ${kpiData.cashFlow.value.toLocaleString()}
          </p>
          <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
            Net invoiced - expenses
          </p>
        </motion.div>

        {/* Overdue Invoices */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-transparent">
              {kpiData.overdueInvoices.count} overdue
            </Badge>
          </div>
          <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
            Overdue Invoices
          </h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#EF4444]">
            ${kpiData.overdueInvoices.value.toLocaleString()}
          </p>
          <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373] mt-2">
            Requires attention
          </p>
        </motion.div>

        {/* Expenses This Month */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#737373]" />
            </div>
            <Badge className="bg-[#F5F5F5] text-[#737373] border-transparent">
              {Math.round((kpiData.expensesThisMonth.value / kpiData.expensesThisMonth.budget) * 100)}% of budget
            </Badge>
          </div>
          <h3 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">
            Expenses This Month
          </h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">
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

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Approval Queue */}
        <motion.div
          variants={animationVariants.listItem}
          className="bg-white border border-[#E5E5E5] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
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
                    <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                      {item.type}
                    </span>
                    <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#737373]">
                      {item.id}
                    </span>
                  </div>
                  <p className="font-['Roboto_Mono',monospace] text-[14px] font-medium text-[#0A0A0A]">
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
          className="bg-white border border-[#E5E5E5] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Xero Sync Status
            </h3>
            <div className="w-3 h-3 bg-[#36B37E] rounded-full" />
          </div>
          
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                Last synced
              </span>
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                2 minutes ago
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                Invoices synced
              </span>
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                147 / 147
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                Status
              </span>
              <Badge className="bg-[#E3FCEF] text-[#36B37E] border-transparent text-xs">
                Healthy
              </Badge>
            </div>
          </div>
          
          <Button className="w-full bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] group">
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
          className="bg-white border border-[#E5E5E5] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Overdue Actions
            </h3>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-transparent">
              {overdueActions.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {overdueActions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#FEE2E2] rounded-lg hover:bg-[#FECACA] transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#EF4444] font-medium">
                      {item.id}
                    </span>
                    <Badge className="bg-[#EF4444] text-white text-xs">
                      {item.daysOverdue}d
                    </Badge>
                  </div>
                  <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#0A0A0A] mb-1">
                    {item.type === 'Invoice' ? item.customer : item.vendor}
                  </p>
                  <p className="font-['Roboto_Mono',monospace] text-[13px] font-medium text-[#EF4444]">
                    ${item.amount.toLocaleString()}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-[#EF4444]" />
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4 border-[#E5E5E5] text-[#EF4444]">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Follow Up All
          </Button>
        </motion.div>
      </div>

      {/* Revenue vs Expenses Chart Placeholder */}
      <motion.div
        variants={animationVariants.listItem}
        className="bg-white border border-[#E5E5E5] rounded-lg p-6"
      >
        <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-4">
          Revenue vs Expenses
        </h3>
        <div className="h-[300px] bg-[#FAFAFA] rounded-lg flex items-center justify-center">
          <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
            Chart visualization (Recharts integration)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}