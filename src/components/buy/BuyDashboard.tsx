/**
 * Buy Dashboard - Procurement KPIs and action cards
 * Matches BookDashboard/SellDashboard pattern
 */

import React, { useState } from 'react';
import { ShoppingCart, FileText, AlertTriangle, Clock, DollarSign, Package } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { MW_AXIS_TICK, MW_CHART_PURPLE } from '@/components/shared/charts/chart-theme';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';


const kpiData = {
  openPOs: { count: 18, value: 156800 },
  pendingRequisitions: { count: 7 },
  overdueDeliveries: { count: 4, value: 28500 },
  avgLeadTime: { days: 12 },
  spendThisMonth: { value: 89400, budget: 100000 },
  pendingBills: { count: 5, value: 42300 },
};

const spendByCategory = [
  { category: 'Materials', amount: 45000, color: 'var(--mw-info)' },
  { category: 'Subcontract', amount: 28000, color: MW_CHART_PURPLE },
  { category: 'Consumables', amount: 12400, color: 'var(--mw-success)' },
  { category: 'Equipment', amount: 4000, color: 'var(--mw-warning)' },
];

const supplierPerformance = [
  { supplier: 'Hunter Steel Co', onTime: 98, color: 'var(--mw-success)' },
  { supplier: 'Pacific Metals', onTime: 95, color: 'var(--mw-success)' },
  { supplier: 'Sydney Welding', onTime: 88, color: 'var(--mw-warning)' },
  { supplier: 'BHP Suppliers', onTime: 82, color: 'var(--mw-warning)' },
  { supplier: 'Generic Parts Co', onTime: 65, color: 'var(--mw-error)' },
];

const approvalQueue = [
  { type: 'Requisition', id: 'REQ-2026-0089', requestor: 'Sarah Chen', value: 8500 },
  { type: 'PO', id: 'PO-2026-0234', supplier: 'Hunter Steel Co', value: 12400 },
  { type: 'Requisition', id: 'REQ-2026-0088', requestor: 'Mike Thompson', value: 3200 },
];

const buyTabs = [{ key: 'overview', label: 'Overview' }];

export function BuyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ModuleDashboard
      title="Buy"
      tabs={buyTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="buy"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Open Purchase Orders"
            value={`$${kpiData.openPOs.value.toLocaleString()}`}
            icon={ShoppingCart}
            tone="info"
            trailing={
              <Badge className="border-transparent bg-[var(--neutral-100)] text-[var(--neutral-500)]">
                {kpiData.openPOs.count} POs
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Pending Requisitions"
            value={kpiData.pendingRequisitions.count}
            icon={FileText}
            tone="warning"
            trailing={
              <Badge className="border-transparent bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]">
                {kpiData.pendingRequisitions.count}
              </Badge>
            }
            hint="Awaiting approval"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Overdue Deliveries"
            value={`$${kpiData.overdueDeliveries.value.toLocaleString()}`}
            icon={AlertTriangle}
            tone="danger"
            valueClassName="text-[var(--mw-error)]"
            trailing={
              <Badge className="border-transparent bg-[var(--mw-error-100)] text-[var(--mw-error)]">
                {kpiData.overdueDeliveries.count}
              </Badge>
            }
            hint="Requires follow-up"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Lead Time"
            value={`${kpiData.avgLeadTime.days} days`}
            icon={Clock}
            tone="brand"
            hint="Last 30 days"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Spend This Month"
            value={`$${kpiData.spendThisMonth.value.toLocaleString()}`}
            icon={DollarSign}
            tone="info"
            trailing={
              <Badge className="border-transparent bg-[var(--neutral-100)] text-[var(--neutral-500)]">
                {Math.round((kpiData.spendThisMonth.value / kpiData.spendThisMonth.budget) * 100)}% of budget
              </Badge>
            }
            footer={
              <div className="mt-3">
                <div className="relative h-2 overflow-hidden rounded-full bg-[var(--neutral-100)]">
                  <div
                    className="absolute inset-0 bg-[var(--mw-yellow-400)] transition-all duration-300"
                    style={{
                      width: `${(kpiData.spendThisMonth.value / kpiData.spendThisMonth.budget) * 100}%`,
                    }}
                  />
                </div>
              </div>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Pending Bills"
            value={`$${kpiData.pendingBills.value.toLocaleString()}`}
            icon={Package}
            tone="warning"
            trailing={
              <Badge className="border-transparent bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]">
                {kpiData.pendingBills.count}
              </Badge>
            }
            hint="Needs matching"
          />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spend by Category */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="text-base font-medium text-[var(--mw-mirage)] mb-4">Spend by Category</h3>
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
                  <span className="text-xs text-[var(--neutral-600)]">{cat.category}</span>
                  <span className="text-xs  text-[var(--neutral-500)] ml-auto">${(cat.amount / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Supplier Performance */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="text-base font-medium text-[var(--mw-mirage)] mb-4">Supplier Performance (On-Time %)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={supplierPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <YAxis dataKey="supplier" type="category" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} width={120} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="onTime" radius={[0, 4, 4, 0]} barSize={16} name="On-time %">
                  {supplierPerformance.map((entry, i) => (<Cell key={`perf-${i}`} fill={entry.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">Approval Queue</h3>
              <Badge className="bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] border-transparent">{approvalQueue.length}</Badge>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--neutral-100)] rounded-lg hover:bg-[var(--neutral-100)] transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[var(--mw-mirage)]">{item.type}</span>
                      <span className="tabular-nums text-xs text-[var(--neutral-500)]">{item.id}</span>
                    </div>
                    <p className="text-xs text-[var(--neutral-600)]">{item.requestor || item.supplier}</p>
                    <p className=" text-sm font-medium text-[var(--mw-mirage)] mt-1">${item.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-[var(--border)]">View All Approvals</Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">Goods Awaiting Receipt</h3>
              <Badge className="bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)] border-transparent">3</Badge>
            </div>
            <p className="text-sm text-[var(--neutral-500)] mb-4">3 purchase orders ready for goods receipt</p>
            <Button variant="outline" className="w-full border-[var(--border)]">Go to Receipts</Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">Bills Needing Matching</h3>
              <Badge className="bg-[var(--mw-error-100)] text-[var(--mw-error)] border-transparent">5</Badge>
            </div>
            <p className="text-sm text-[var(--neutral-500)] mb-4">5 bills awaiting three-way match</p>
            <Button variant="outline" className="w-full border-[var(--border)]">Go to Bills</Button>
          </Card>
        </motion.div>
      </div>
      </motion.div>
    </ModuleDashboard>
  );
}