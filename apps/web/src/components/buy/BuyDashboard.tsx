/**
 * Buy Dashboard - Procurement KPIs and action cards
 */

import React, { useMemo, useState } from 'react';
import { ShoppingCart, FileText, AlertTriangle, Clock, DollarSign, Package } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { ModuleQuickNav } from '@/components/shared/dashboard/ModuleQuickNav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AIFeed } from '@/components/shared/ai/AIFeed';
import {
  MW_BAR_TOOLTIP_CURSOR,
  MW_RECHARTS_ANIMATION,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_H,
  getChartScaleColour,
  getChartScalePattern,
} from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import {
  buyKpis as kpiData,
  spendByCategory,
  supplierPerformance,
  buyApprovalQueue as approvalQueue,
} from '@/services';

const buyTabs = [{ key: 'overview', label: 'Overview' }];

const badgeNeutral =
  'border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)]';

export function BuyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const spendTotal = useMemo(
    () => spendByCategory.reduce((s, x) => s + x.amount, 0),
    [],
  );

  const spendSlices = useMemo(
    () =>
      spendByCategory.map((c) => ({
        ...c,
        fill: getChartScaleColour((c.amount / spendTotal) * 100),
      })),
    [spendTotal],
  );

  return (
    <ModuleDashboard
      title="Buy"
      tabs={buyTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="buy"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* AI Insight Feed — positioned below the AI command bar */}
      <motion.div variants={staggerItem}>
        <AIFeed module="buy" />
      </motion.div>

      {/* Quick navigation bento — jump to any sub-page without using sidebar */}
      <motion.div variants={staggerItem}>
        <ModuleQuickNav moduleKey="buy" />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Open Purchase Orders"
            value={`$${kpiData.openPOs.value.toLocaleString()}`}
            icon={ShoppingCart}
            iconSurface="key"
            trailing={
              <Badge className={badgeNeutral}>
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
            trailing={
              <Badge className={badgeNeutral}>
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
            trailing={
              <Badge className={badgeNeutral}>
                {kpiData.overdueDeliveries.count}
              </Badge>
            }
            hint="Requires follow-up"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Lead Time"
            value={`${kpiData.avgLeadTime.value} days`}
            icon={Clock}
            hint="Last 30 days"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Spend This Month"
            value={`$${kpiData.spendThisMonth.value.toLocaleString()}`}
            icon={DollarSign}
            trailing={
              <Badge className={badgeNeutral}>
                {Math.round((kpiData.spendThisMonth.value / (kpiData.spendThisMonth.budget ?? 1)) * 100)}% of budget
              </Badge>
            }
            footer={
              <div className="mt-3">
                <div className="relative h-2 overflow-hidden rounded-full bg-[var(--neutral-100)]">
                  <div
                    className="absolute inset-0 bg-[var(--mw-yellow-400)] transition-all duration-300"
                    style={{
                      width: `${(kpiData.spendThisMonth.value / (kpiData.spendThisMonth.budget ?? 1)) * 100}%`,
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
            trailing={
              <Badge className={badgeNeutral}>
                {kpiData.pendingBills.count}
              </Badge>
            }
            hint="Needs matching"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={staggerItem}>
          <ChartCard title="Spend by Category">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={spendSlices}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                  {...MW_RECHARTS_ANIMATION}
                >
                  {spendSlices.map((entry, i) => (
                    <Cell key={`cat-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={MW_TOOLTIP_STYLE} formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {spendSlices.map((cat) => (
                <div key={cat.category} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.fill }}
                  />
                  <span className="text-xs text-[var(--neutral-600)]">{cat.category}</span>
                  <span className="ml-auto text-xs text-[var(--neutral-500)] tabular-nums">
                    ${(cat.amount / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChartCard title="Supplier Performance (On-Time %)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={supplierPerformance} layout="vertical">
                {mwChartPatternDefs()}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <YAxis dataKey="supplier" type="category" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} width={120} />
                <Tooltip contentStyle={MW_TOOLTIP_STYLE} cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="onTime" radius={MW_BAR_RADIUS_H} barSize={16} name="On-time %" {...MW_RECHARTS_ANIMATION_BAR}>
                  {supplierPerformance.map((entry, i) => (
                    <Cell key={`perf-${i}`} fill={getChartScalePattern(entry.onTime)} />
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
              <h3 className="text-base font-medium text-foreground">Approval Queue</h3>
              <Badge className="border-0 bg-[var(--mw-yellow-400)] text-primary-foreground">{approvalQueue.length}</Badge>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((item, i) => (
                <div key={i} className="flex cursor-pointer items-center justify-between rounded-lg bg-[var(--neutral-100)] p-3 transition-colors hover:bg-[var(--neutral-100)]">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{item.type}</span>
                      <span className="text-xs tabular-nums text-[var(--neutral-500)]">{item.id}</span>
                    </div>
                    <p className="text-xs text-[var(--neutral-600)]">{item.requestor || item.supplier}</p>
                    <p className="mt-1 text-sm font-medium text-foreground tabular-nums">${item.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full border-[var(--border)]">View All Approvals</Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">Goods Awaiting Receipt</h3>
              <Badge className={badgeNeutral}>3</Badge>
            </div>
            <p className="mb-4 text-sm text-[var(--neutral-500)]">3 purchase orders ready for goods receipt</p>
            <Button variant="outline" className="w-full border-[var(--border)]">Go to Receipts</Button>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">Bills Needing Matching</h3>
              <Badge className={badgeNeutral}>5</Badge>
            </div>
            <p className="mb-4 text-sm text-[var(--neutral-500)]">5 bills awaiting three-way match</p>
            <Button variant="outline" className="w-full border-[var(--border)]">Go to Bills</Button>
          </Card>
        </motion.div>
      </div>
      </motion.div>
    </ModuleDashboard>
  );
}
