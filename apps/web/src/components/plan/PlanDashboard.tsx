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
import { ModuleQuickNav } from '@/components/shared/dashboard/ModuleQuickNav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_V,
  MW_FILL,
  getChartScalePattern,
} from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { useNavigate } from 'react-router';
import { AIFeed } from '@/components/shared/ai/AIFeed';
import {
  planKpis as kpiData,
  weeklyCapacity,
  planTasks,
  jobs,
} from '@/services';
import { PlanCapableToPromise } from '@/components/plan/PlanCapableToPromise';
import { BomGenerator } from '@/components/plan/BomGenerator';
import { PlanOperationRouting } from '@/components/plan/PlanOperationRouting';
import { PlanShiftCalendar } from '@/components/plan/PlanShiftCalendar';
import { PlanSubcontracting } from '@/components/plan/PlanSubcontracting';

const upcomingTasks = planTasks.map((t) => ({
  id: t.id,
  title: t.title,
  time: t.time,
  type: t.type as 'review' | 'schedule' | 'qc' | 'purchase' | 'external',
}));

const priorityJobs = jobs
  .filter((j) => j.status === 'in_progress' || j.status === 'planned')
  .sort((a, b) => {
    const p = { urgent: 0, high: 1, medium: 2, low: 3 };
    return p[a.priority] - p[b.priority];
  })
  .slice(0, 3)
  .map((j) => ({
    id: j.jobNumber,
    name: j.title,
    customer: j.customerName.split(' ')[0],
    due: new Date(j.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
    priority: j.priority as 'high' | 'medium' | 'low' | 'urgent',
    value: `$${j.value.toLocaleString()}`,
  }));

const taskTypeColors: Record<string, string> = {
  review: 'bg-[var(--mw-blue)]',
  schedule: 'bg-[var(--mw-yellow-400)]',
  qc: 'bg-[var(--mw-green)]',
  purchase: 'bg-[var(--mw-amber)]',
  external: 'bg-[var(--neutral-400)]',
};


const planTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'planning-tools', label: 'Planning tools' },
];

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
      {activeTab === 'overview' && (
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* AI Insight Feed — below AI command bar (inside space-y-6 with KPI row) */}
      <motion.div variants={staggerItem}>
        <AIFeed module="plan" />
      </motion.div>

      {/* Quick navigation bento — jump to any sub-page without using sidebar */}
      <motion.div variants={staggerItem}>
        <ModuleQuickNav moduleKey="plan" />
      </motion.div>

      {/* KPI Cards — §4.1: Active Jobs, Tasks Today, Avg Lead Time, On-Time Rate */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Active Jobs"
            value={kpiData.activeJobs.value}
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
            value={kpiData.tasksToday.value}
            icon={ClipboardList}
            trailing={
              <Badge variant="softAccent" className="text-xs">
                2 overdue
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Lead Time"
            value={`${kpiData.avgLeadTime.value} days`}
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
            value={`${kpiData.onTimeRate.value}%`}
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
                <h3 className="text-sm font-medium text-foreground">Upcoming Tasks</h3>
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
                    <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
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
                <h3 className="text-sm font-medium text-foreground">Priority Jobs</h3>
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
                      <span className="text-xs tabular-nums font-medium text-foreground">{job.id}</span>
                      <StatusBadge priority={job.priority.toLowerCase()}>{job.priority}</StatusBadge>
                    </div>
                    <span className="text-xs tabular-nums font-medium text-foreground">{job.value}</span>
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
          <Card className="p-6">
            <h3 className="text-sm font-medium text-foreground mb-1">Quick Actions</h3>
            <p className="text-xs text-[var(--neutral-500)] mb-4">Common workflows</p>
            <div className="space-y-2">
              <Button
                className="w-full justify-start bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-10"
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
        <ChartCard title="Weekly Capacity (% Utilisation)" subtitle="Planned vs actual output">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyCapacity} barGap={4}>
              {mwChartPatternDefs()}
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="week" tick={MW_AXIS_TICK} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} contentStyle={MW_TOOLTIP_STYLE} formatter={(v: number) => `${v}%`} />
              <Legend />
              <Bar key="planned" dataKey="planned" radius={MW_BAR_RADIUS_V} name="Planned" fill={MW_FILL.HATCH_YELLOW} {...MW_RECHARTS_ANIMATION_BAR} />
              <Bar key="actual" dataKey="actual" radius={MW_BAR_RADIUS_V} name="Actual" {...MW_RECHARTS_ANIMATION_BAR}>
                {weeklyCapacity.map((e, i) => (
                  <Cell key={`actual-${i}`} fill={getChartScalePattern(e.actual)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>
      </motion.div>
      )}

      {activeTab === 'planning-tools' && (
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <motion.div variants={staggerItem}>
            <PlanCapableToPromise />
          </motion.div>
          <motion.div variants={staggerItem}>
            <BomGenerator />
          </motion.div>
          <motion.div variants={staggerItem} className="xl:col-span-2">
            <PlanOperationRouting />
          </motion.div>
          <motion.div variants={staggerItem}>
            <PlanShiftCalendar />
          </motion.div>
          <motion.div variants={staggerItem}>
            <PlanSubcontracting />
          </motion.div>
        </div>
      </motion.div>
      )}
    </ModuleDashboard>
  );
}
