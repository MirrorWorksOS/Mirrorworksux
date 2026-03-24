/**
 * Plan Dashboard - Production planning KPIs in bento grid
 */

import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp, Package, Wrench } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MW_CHART_COLOURS, MW_AXIS_TICK, MW_CARTESIAN_GRID } from '@/components/shared/charts/chart-theme';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';


const kpiData = {
  activeJobs: 12,
  scheduledMOs: 28,
  overdueJobs: 3,
  avgLeadTime: 8.5,
  utilizationRate: 78,
  onTimeDelivery: 92,
};

const weeklyCapacity = [
  { week: 'Wk 12', planned: 85, actual: 72 },
  { week: 'Wk 13', planned: 90, actual: 88 },
  { week: 'Wk 14', planned: 80, actual: 75 },
  { week: 'Wk 15', planned: 95, actual: 92 },
  { week: 'Wk 16', planned: 85, actual: 0 },
];

const planTabs = [{ key: 'overview', label: 'Overview' }];

export function PlanDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ModuleDashboard
      title="Production Planning"
      tabs={planTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="plan"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Active Jobs"
            value={kpiData.activeJobs}
            icon={Calendar}
            tone="info"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Scheduled MOs"
            value={kpiData.scheduledMOs}
            icon={Wrench}
            tone="neutral"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Overdue Jobs"
            value={kpiData.overdueJobs}
            icon={AlertTriangle}
            tone="danger"
            valueClassName="text-[var(--mw-error)]"
            trailing={
              <Badge className="border-0 bg-[var(--mw-error-100)] text-[var(--mw-error)]">
                {kpiData.overdueJobs}
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Lead Time"
            value={`${kpiData.avgLeadTime} days`}
            icon={Clock}
            tone="warning"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Utilisation Rate"
            value={`${kpiData.utilizationRate}%`}
            icon={TrendingUp}
            tone="neutral"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="On-Time Delivery"
            value={`${kpiData.onTimeDelivery}%`}
            icon={Package}
            tone="info"
          />
        </motion.div>
      </div>

      {/* Weekly Capacity Chart */}
      <motion.div variants={staggerItem}>
        <Card className="p-6">
          <h3 className=" text-base font-medium text-[var(--mw-mirage)] mb-4">Weekly Capacity (% Utilisation)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyCapacity}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="week" tick={MW_AXIS_TICK} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar key="planned" dataKey="planned" fill={MW_CHART_COLOURS[3]} radius={[4, 4, 0, 0]} name="Planned" />
              <Bar key="actual" dataKey="actual" fill={MW_CHART_COLOURS[0]} radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
      </motion.div>
    </ModuleDashboard>
  );
}