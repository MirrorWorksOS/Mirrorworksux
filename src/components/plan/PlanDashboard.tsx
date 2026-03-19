/**
 * Plan Dashboard - Production planning KPIs in bento grid
 */

import React from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp, Package, Wrench } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { animationVariants } = designSystem;

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

export function PlanDashboard() {
  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Production Planning</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#0A7AFF]" />
            </div>
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Active Jobs</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{kpiData.activeJobs}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#36B37E]" />
            </div>
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Scheduled MOs</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{kpiData.scheduledMOs}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-0">{kpiData.overdueJobs}</Badge>
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Overdue Jobs</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#EF4444]">{kpiData.overdueJobs}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-[#FF8B00]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Avg Lead Time</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{kpiData.avgLeadTime} days</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-[#36B37E]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Utilization Rate</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#36B37E]">{kpiData.utilizationRate}%</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center mb-4">
            <Package className="w-5 h-5 text-[#0A7AFF]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">On-Time Delivery</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#36B37E]">{kpiData.onTimeDelivery}%</p>
        </motion.div>
      </div>

      {/* Weekly Capacity Chart */}
      <motion.div variants={animationVariants.listItem}>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-4">Weekly Capacity (% Utilization)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyCapacity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="planned" fill="#E5E5E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#FFCF4B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </motion.div>
  );
}
