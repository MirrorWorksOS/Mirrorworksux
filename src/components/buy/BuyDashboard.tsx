/**
 * Buy Dashboard - Procurement KPIs and action cards
 * Matches BookDashboard/SellDashboard pattern
 */

import React from 'react';
import { ShoppingCart, FileText, AlertTriangle, Clock, DollarSign, Package } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const { animationVariants } = designSystem;

const kpiData = {
  openPOs: { count: 18, value: 156800 },
  pendingRequisitions: { count: 7 },
  overdueDeliveries: { count: 4, value: 28500 },
  avgLeadTime: { days: 12 },
  spendThisMonth: { value: 89400, budget: 100000 },
  pendingBills: { count: 5, value: 42300 },
};

const spendByCategory = [
  { category: 'Materials', amount: 45000, color: '#0052CC' },
  { category: 'Subcontract', amount: 28000, color: '#7C3AED' },
  { category: 'Consumables', amount: 12400, color: '#36B37E' },
  { category: 'Equipment', amount: 4000, color: '#FACC15' },
];

const supplierPerformance = [
  { supplier: 'Hunter Steel Co', onTime: 98, color: '#36B37E' },
  { supplier: 'Pacific Metals', onTime: 95, color: '#36B37E' },
  { supplier: 'Sydney Welding', onTime: 88, color: '#FACC15' },
  { supplier: 'BHP Suppliers', onTime: 82, color: '#FACC15' },
  { supplier: 'Generic Parts Co', onTime: 65, color: '#DE350B' },
];

const approvalQueue = [
  { type: 'Requisition', id: 'REQ-2026-0089', requestor: 'Sarah Chen', value: 8500 },
  { type: 'PO', id: 'PO-2026-0234', supplier: 'Hunter Steel Co', value: 12400 },
  { type: 'Requisition', id: 'REQ-2026-0088', requestor: 'Mike Thompson', value: 3200 },
];

export function BuyDashboard() {
  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#0A7AFF]" />
            </div>
            <Badge className="bg-[#F5F5F5] text-[#737373] border-transparent">{kpiData.openPOs.count} POs</Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">Open Purchase Orders</h3>
          <p className=" text-[24px] font-semibold text-[#1A2732]">${kpiData.openPOs.value.toLocaleString()}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FFF4CC] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#805900]" />
            </div>
            <Badge className="bg-[#FFF4CC] text-[#805900] border-transparent">{kpiData.pendingRequisitions.count}</Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">Pending Requisitions</h3>
          <p className=" text-[24px] font-semibold text-[#1A2732]">{kpiData.pendingRequisitions.count}</p>
          <p className="text-[12px] text-[#737373] mt-2">Awaiting approval</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-transparent">{kpiData.overdueDeliveries.count}</Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">Overdue Deliveries</h3>
          <p className=" text-[24px] font-semibold text-[#EF4444]">${kpiData.overdueDeliveries.value.toLocaleString()}</p>
          <p className="text-[12px] text-[#737373] mt-2">Requires follow-up</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#1A2732] rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#FFCF4B]" />
            </div>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">Avg Lead Time</h3>
          <p className=" text-[24px] font-semibold text-[#1A2732]">{kpiData.avgLeadTime.days} days</p>
          <p className="text-[12px] text-[#737373] mt-2">Last 30 days</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0A7AFF]" />
            </div>
            <Badge className="bg-[#F5F5F5] text-[#737373] border-transparent">
              {Math.round((kpiData.spendThisMonth.value / kpiData.spendThisMonth.budget) * 100)}% of budget
            </Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">Spend This Month</h3>
          <p className=" text-[24px] font-semibold text-[#1A2732]">${kpiData.spendThisMonth.value.toLocaleString()}</p>
          <div className="mt-3">
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#FFCF4B] transition-all duration-300" style={{ width: `${(kpiData.spendThisMonth.value / kpiData.spendThisMonth.budget) * 100}%` }} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#FF8B00]" />
            </div>
            <Badge className="bg-[#FFF4CC] text-[#805900] border-transparent">{kpiData.pendingBills.count}</Badge>
          </div>
          <h3 className="text-[13px] font-medium text-[#737373] mb-1">Pending Bills</h3>
          <p className=" text-[24px] font-semibold text-[#1A2732]">${kpiData.pendingBills.value.toLocaleString()}</p>
          <p className="text-[12px] text-[#737373] mt-2">Needs matching</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spend by Category */}
        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h3 className="text-[16px] font-semibold text-[#1A2732] mb-4">Spend by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={spendByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="amount">
                {spendByCategory.map((entry, i) => (<Cell key={`cat-${i}`} fill={entry.color} />))}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {spendByCategory.map(cat => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-[#525252]">{cat.category}</span>
                <span className="text-xs  text-[#737373] ml-auto">${(cat.amount / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Supplier Performance */}
        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h3 className="text-[16px] font-semibold text-[#1A2732] mb-4">Supplier Performance (On-Time %)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={supplierPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis dataKey="supplier" type="category" tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} width={120} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="onTime" radius={[0, 4, 4, 0]} barSize={16} name="On-time %">
                {supplierPerformance.map((entry, i) => (<Cell key={`perf-${i}`} fill={entry.color} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#1A2732]">Approval Queue</h3>
            <Badge className="bg-[#FFCF4B] text-[#2C2C2C] border-transparent">{approvalQueue.length}</Badge>
          </div>
          <div className="space-y-3">
            {approvalQueue.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-[#1A2732]">{item.type}</span>
                    <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#737373]">{item.id}</span>
                  </div>
                  <p className="text-[12px] text-[#525252]">{item.requestor || item.supplier}</p>
                  <p className=" text-[14px] font-medium text-[#1A2732] mt-1">${item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 border-[var(--border)]">View All Approvals</Button>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#1A2732]">Goods Awaiting Receipt</h3>
            <Badge className="bg-[#FFF4CC] text-[#805900] border-transparent">3</Badge>
          </div>
          <p className="text-sm text-[#737373] mb-4">3 purchase orders ready for goods receipt</p>
          <Button variant="outline" className="w-full border-[var(--border)]">Go to Receipts</Button>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#1A2732]">Bills Needing Matching</h3>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-transparent">5</Badge>
          </div>
          <p className="text-sm text-[#737373] mb-4">5 bills awaiting three-way match</p>
          <Button variant="outline" className="w-full border-[var(--border)]">Go to Bills</Button>
        </motion.div>
      </div>
    </motion.div>
  );
}