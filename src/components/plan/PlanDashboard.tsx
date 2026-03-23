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
    <ModuleDashboard title="Production Planning" tabs={planTabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-blue-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--mw-blue)]" />
              </div>
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Active Jobs</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{kpiData.activeJobs}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[var(--mw-mirage)]" />
              </div>
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Scheduled MOs</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{kpiData.scheduledMOs}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-error-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--mw-error)]" />
              </div>
              <Badge className="bg-[var(--mw-error-100)] text-[var(--mw-error)] border-0">{kpiData.overdueJobs}</Badge>
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Overdue Jobs</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-error)]">{kpiData.overdueJobs}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-amber-100)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-[var(--mw-amber)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Avg Lead Time</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{kpiData.avgLeadTime} days</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-[var(--mw-mirage)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Utilization Rate</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{kpiData.utilizationRate}%</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-blue-100)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Package className="w-5 h-5 text-[var(--mw-blue)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">On-Time Delivery</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{kpiData.onTimeDelivery}%</p>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Capacity Chart */}
      <motion.div variants={staggerItem}>
        <Card className="p-6">
          <h3 className=" text-base font-semibold text-[var(--mw-mirage)] mb-4">Weekly Capacity (% Utilization)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyCapacity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar key="planned" dataKey="planned" fill="#E8E2D9" radius={[4, 4, 0, 0]} name="Planned" />
              <Bar key="actual" dataKey="actual" fill="#FFCF4B" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
      </motion.div>
    </ModuleDashboard>
  );
}