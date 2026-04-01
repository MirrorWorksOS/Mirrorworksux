/**
 * Plan Dashboard - Production planning KPIs + action cards in bento grid (§4.1)
 */

import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp, Package, Plus, ClipboardList, CalendarDays, ArrowRight, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_RECHARTS_ANIMATION_BAR,
  getChartScaleColour,
} from '@/components/shared/charts/chart-theme';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { useNavigate } from 'react-router';

const kpiData = {
  activeJobs: 12,
  tasksToday: 8,
  avgLeadTime: 8.5,
  onTimeRate: 92,
};

const weeklyCapacity = [
  { week: 'Wk 12', planned: 85, actual: 72 },
  { week: 'Wk 13', planned: 90, actual: 88 },
  { week: 'Wk 14', planned: 80, actual: 75 },
  { week: 'Wk 15', planned: 95, actual: 92 },
  { week: 'Wk 16', planned: 85, actual: 0 },
];

const upcomingTasks = [
  { id: 1, title: 'Review BOM for Job MW-015', time: '9:00 AM', type: 'review' as const },
  { id: 2, title: 'Schedule laser cutting — MW-012', time: '10:30 AM', type: 'schedule' as const },
  { id: 3, title: 'QC sign-off pending — MW-009', time: '11:00 AM', type: 'qc' as const },
  { id: 4, title: 'Material order follow-up — MW-014', time: '1:00 PM', type: 'purchase' as const },
  { id: 5, title: 'Subcontractor call — Powder Coat', time: '2:30 PM', type: 'external' as const },
];

const priorityJobs = [
  { id: 'MW-009', name: 'Mounting Bracket Assy', customer: 'TechCorp', due: 'Apr 3', priority: 'high' as const, value: '$24,500' },
  { id: 'MW-012', name: 'Gear Housing Assembly', customer: 'Precision Ltd', due: 'Apr 5', priority: 'high' as const, value: '$18,200' },
  { id: 'MW-015', name: 'Control Panel Enclosure', customer: 'AutoDrive', due: 'Apr 8', priority: 'medium' as const, value: '$31,000' },
];

const taskTypeColors: Record<string, string> = {
  review: 'bg-[var(--mw-blue)]',
  schedule: 'bg-[var(--mw-yellow-400)]',
  qc: 'bg-[var(--mw-green)]',
  purchase: 'bg-[var(--mw-amber)]',
  external: 'bg-[var(--neutral-400)]',
};

const priorityColors: Record<string, string> = {
  high: 'bg-[var(--mw-error)] text-white',
  medium: 'bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]',
  low: 'bg-[var(--mw-green)] text-white',
};

const planTabs = [{ key: 'overview', label: 'Overview' }];

export function PlanDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <ModuleDashboard
      title="Production Planning"
      tabs={planTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="plan"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards — §4.1: Active Jobs, Tasks Today, Avg Lead Time, On-Time Rate */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Active Jobs"
            value={kpiData.activeJobs}
            icon={Calendar}
            iconSurface="key"
            trailing={
              <Badge className="border-0 bg-[var(--mw-green)]/10 text-[var(--mw-green)] text-xs">
                +3 this week
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Tasks Today"
            value={kpiData.tasksToday}
            icon={ClipboardList}
            trailing={
              <Badge className="border-0 bg-[var(--mw-yellow-400)]/20 text-[var(--neutral-800)] text-xs">
                2 overdue
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Lead Time"
            value={`${kpiData.avgLeadTime} days`}
            icon={Clock}
            trailing={
              <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
                Rolling 30d
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="On-Time Rate"
            value={`${kpiData.onTimeRate}%`}
            icon={TrendingUp}
            trailing={
              <Badge className="border-0 bg-[var(--mw-green)]/10 text-[var(--mw-green)] text-xs">
                +4% vs target
              </Badge>
            }
          />
        </motion.div>
      </div>

      {/* Action Cards Row — §4.1: Upcoming Tasks, Priority Jobs, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <motion.div variants={staggerItem}>
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--mw-mirage)]">Upcoming Tasks</h3>
                <p className="text-xs text-[var(--neutral-500)]">Today's priority items</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[var(--neutral-500)]"
                onClick={() => navigate('/plan/activities')}
              >
                View all
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--accent)] transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${taskTypeColors[task.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--mw-mirage)] truncate">{task.title}</p>
                  </div>
                  <span className="text-xs tabular-nums text-[var(--neutral-500)] flex-shrink-0">{task.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Priority Jobs */}
        <motion.div variants={staggerItem}>
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--mw-mirage)]">Priority Jobs</h3>
                <p className="text-xs text-[var(--neutral-500)]">Requires attention</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[var(--neutral-500)]"
                onClick={() => navigate('/plan/jobs')}
              >
                View all
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {priorityJobs.map((job) => (
                <div
                  key={job.id}
                  className="px-5 py-3 hover:bg-[var(--accent)] transition-colors cursor-pointer"
                  onClick={() => navigate(`/plan/jobs/${job.id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[var(--mw-mirage)]">{job.id}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[job.priority]}`}>
                        {job.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs tabular-nums font-medium text-[var(--mw-mirage)]">{job.value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--neutral-500)]">{job.name} — {job.customer}</p>
                    <span className="text-xs text-[var(--neutral-500)]">Due {job.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-[var(--mw-mirage)] mb-1">Quick Actions</h3>
            <p className="text-xs text-[var(--neutral-500)] mb-4">Common workflows</p>
            <div className="space-y-2">
              <Button
                className="w-full justify-start bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] h-10"
                onClick={() => navigate('/plan/jobs')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-[var(--border)] h-10"
                onClick={() => navigate('/plan/schedule')}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-[var(--border)] h-10"
                onClick={() => navigate('/plan/activities')}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                View Tasks
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-[var(--border)] h-10"
                onClick={() => navigate('/plan/purchase')}
              >
                <Package className="w-4 h-4 mr-2" />
                Material Requirements
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-[var(--border)] h-10"
                onClick={() => navigate('/plan/nc-connect')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                NC Connect
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Production Schedule Chart — §4.1 */}
      <motion.div variants={staggerItem}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-medium text-[var(--mw-mirage)]">Weekly Capacity (% Utilisation)</h3>
              <p className="text-xs text-[var(--neutral-500)]">Planned vs actual output</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyCapacity} barGap={4}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="week" tick={MW_AXIS_TICK} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `${v}%`} />
              <Legend />
              <Bar key="planned" dataKey="planned" radius={[4, 4, 0, 0]} name="Planned" fill="var(--mw-yellow-400)" {...MW_RECHARTS_ANIMATION_BAR} />
              <Bar key="actual" dataKey="actual" radius={[4, 4, 0, 0]} name="Actual" {...MW_RECHARTS_ANIMATION_BAR}>
                {weeklyCapacity.map((e, i) => (
                  <Cell key={`actual-${i}`} fill={getChartScaleColour(e.actual)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
      </motion.div>
    </ModuleDashboard>
  );
}
