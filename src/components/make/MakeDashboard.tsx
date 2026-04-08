/**
 * Make Dashboard - Andon Board with machine status grid
 * Touch-optimized for shop floor displays
 *
 * TASK 1: AI Feed integrated below command bar
 * TASK 2: Schedule Gantt strip has rich hover tooltips
 * TASK 3: Work orders elevated to top with larger cards
 */

import { useState } from 'react';
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, Zap,
  ShieldAlert, TrendingUp, Play, ClipboardCheck,
  ScanBarcode, Printer, TimerOff, BarChart3, Activity,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { ModuleQuickNav } from '@/components/shared/dashboard/ModuleQuickNav';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { toast } from 'sonner';
import { machines as centralMachines } from '@/services/mock';
import { AIFeed } from '@/components/shared/ai/AIFeed';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../ui/hover-card';


type MachineStatus = 'running' | 'idle' | 'down' | 'maintenance' | 'setup';

interface Machine {
  id: string;
  name: string;
  workCenter: string;
  status: MachineStatus;
  currentJob?: string;
  operator?: string;
  utilizationToday: number;
}

const mockMachines: Machine[] = centralMachines.map((m) => ({
  id: m.id,
  name: m.name,
  workCenter: m.workCenter,
  status: m.status as MachineStatus,
  currentJob: m.currentJobNumber,
  operator: m.operatorName,
  utilizationToday: m.utilizationToday,
}));

/** Mock work orders for the dashboard work-order cards and schedule tooltips */
interface DashboardWorkOrder {
  woNumber: string;
  product: string;
  qty: number;
  operator: string;
  operatorInitials: string;
  machine: string;
  status: 'in_progress' | 'scheduled' | 'completed' | 'pending';
  progress: number;
  startTime: string;
  endTime: string;
}

const dashboardWorkOrders: DashboardWorkOrder[] = [
  { woNumber: 'WO-001', product: 'Server Rack Chassis', qty: 12, operator: 'Sarah Chen', operatorInitials: 'SC', machine: 'Laser-01', status: 'in_progress', progress: 72, startTime: '08:00', endTime: '10:55' },
  { woNumber: 'WO-002', product: 'Mounting Bracket Assy', qty: 50, operator: 'David Lee', operatorInitials: 'DL', machine: 'CNC-01', status: 'in_progress', progress: 45, startTime: '08:00', endTime: '12:30' },
  { woNumber: 'WO-003', product: 'Cable Tray Support', qty: 24, operator: 'James Murray', operatorInitials: 'JM', machine: 'CNC-02', status: 'in_progress', progress: 33, startTime: '09:00', endTime: '12:50' },
  { woNumber: 'WO-004', product: 'Server Rack Chassis', qty: 12, operator: 'Sarah Chen', operatorInitials: 'SC', machine: 'Laser-01', status: 'scheduled', progress: 0, startTime: '11:15', endTime: '13:55' },
  { woNumber: 'WO-005', product: 'Machine Guard', qty: 8, operator: 'Mike Thompson', operatorInitials: 'MT', machine: 'Press-01', status: 'completed', progress: 100, startTime: '08:00', endTime: '10:10' },
  { woNumber: 'WO-006', product: 'Rail Platform Comp.', qty: 6, operator: 'James Murray', operatorInitials: 'JM', machine: 'Weld-01', status: 'in_progress', progress: 58, startTime: '08:30', endTime: '13:00' },
  { woNumber: 'WO-007', product: 'Aluminium Enclosure', qty: 18, operator: 'David Lee', operatorInitials: 'DL', machine: 'CNC-01', status: 'scheduled', progress: 0, startTime: '13:00', endTime: '15:15' },
  { woNumber: 'WO-008', product: 'Structural Bracket A', qty: 36, operator: 'Emma Wilson', operatorInitials: 'EW', machine: 'Press-01', status: 'scheduled', progress: 0, startTime: '11:00', endTime: '14:00' },
  { woNumber: 'WO-009', product: 'Cable Tray Support', qty: 24, operator: 'Emma Wilson', operatorInitials: 'EW', machine: 'Pack-01', status: 'scheduled', progress: 0, startTime: '10:10', endTime: '13:05' },
];

/** Look up a work order by WO label for schedule tooltips */
const woByLabel: Record<string, DashboardWorkOrder> = {};
dashboardWorkOrders.forEach((wo) => {
  woByLabel[wo.woNumber] = wo;
});

const getWoStatusConfig = (status: DashboardWorkOrder['status']) => {
  switch (status) {
    case 'in_progress': return { bg: 'bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10', text: 'text-foreground', label: 'In Progress', dot: 'bg-[var(--mw-yellow-400)]' };
    case 'scheduled': return { bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-[var(--neutral-600)] dark:text-[var(--neutral-400)]', label: 'Scheduled', dot: 'bg-[var(--neutral-400)]' };
    case 'completed': return { bg: 'bg-[var(--mw-success-light)] dark:bg-[var(--mw-success)]/10', text: 'text-[var(--mw-success)]', label: 'Completed', dot: 'bg-[var(--mw-success)]' };
    case 'pending': return { bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-[var(--neutral-500)]', label: 'Pending', dot: 'bg-[var(--neutral-400)]' };
  }
};

const getStatusColor = (status: MachineStatus) => {
  switch (status) {
    case 'running': return { bg: 'bg-[var(--mw-mirage)]', text: 'text-white', icon: CheckCircle2, label: 'Running' };
    case 'idle': return { bg: 'bg-[var(--mw-warning)]', text: 'text-[#1A1A1A]', icon: Clock, label: 'Idle' };
    case 'down': return { bg: 'bg-[var(--mw-error)]', text: 'text-white', icon: AlertTriangle, label: 'Down' };
    case 'maintenance': return { bg: 'bg-[var(--mw-mirage)]', text: 'text-white', icon: Wrench, label: 'Maintenance' };
    case 'setup': return { bg: 'bg-[var(--mw-amber)]', text: 'text-[#1A1A1A]', icon: Zap, label: 'Setup' };
  }
};

/** Schedule block with enriched tooltip data */
interface ScheduleBlock {
  start: number;
  width: number;
  color: string;
  label: string;
}

interface ScheduleRow {
  name: string;
  blocks: ScheduleBlock[];
}

const scheduleRows: ScheduleRow[] = [
  { name: 'Laser-01', blocks: [{ start: 0, width: 33, color: 'var(--mw-mirage)', label: 'WO-001' }, { start: 37, width: 30, color: 'var(--mw-warning)', label: 'WO-004' }] },
  { name: 'CNC-01',   blocks: [{ start: 0, width: 55, color: 'var(--mw-mirage)', label: 'WO-002' }, { start: 60, width: 25, color: 'var(--mw-warning)', label: 'WO-007' }] },
  { name: 'CNC-02',   blocks: [{ start: 11, width: 44, color: 'var(--mw-mirage)', label: 'WO-003' }] },
  { name: 'Press-01', blocks: [{ start: 0, width: 22, color: 'var(--mw-mirage)', label: 'WO-005' }, { start: 33, width: 33, color: 'var(--mw-warning)', label: 'WO-008' }, { start: 78, width: 22, color: 'var(--neutral-300)', label: 'Idle' }] },
  { name: 'Weld-01',  blocks: [{ start: 5, width: 50, color: 'var(--mw-mirage)', label: 'WO-006' }] },
  { name: 'Pack-01',  blocks: [{ start: 22, width: 33, color: 'var(--mw-warning)', label: 'WO-009' }, { start: 60, width: 28, color: 'var(--neutral-300)', label: 'Idle' }] },
];

function ScheduleBlockTooltip({ block }: { block: ScheduleBlock }) {
  const wo = woByLabel[block.label];
  const isIdle = block.label === 'Idle';

  if (isIdle || !wo) {
    return (
      <div
        className="absolute top-0 h-full rounded flex items-center justify-center text-[10px] font-medium truncate px-1 transition-transform duration-150 hover:scale-y-[1.15] hover:z-10"
        style={{
          left: `${block.start}%`,
          width: `${block.width}%`,
          backgroundColor: block.color,
          color: block.color === 'var(--neutral-300)' ? 'var(--neutral-600)' : 'white',
        }}
      >
        {block.label}
      </div>
    );
  }

  const statusCfg = getWoStatusConfig(wo.status);

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className="absolute top-0 h-full rounded flex items-center justify-center text-[10px] font-medium truncate px-1 cursor-pointer transition-transform duration-150 hover:scale-y-[1.15] hover:z-10"
          style={{
            left: `${block.start}%`,
            width: `${block.width}%`,
            backgroundColor: block.color,
            color: 'white',
          }}
        >
          {block.label}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        sideOffset={8}
        className="w-72 rounded-lg bg-white dark:bg-neutral-800 border border-[var(--border)] shadow-lg p-0 z-50"
      >
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground tabular-nums">{wo.woNumber}</span>
            <Badge className={cn('border-0 text-[10px] px-1.5 py-0.5', statusCfg.bg, statusCfg.text)}>
              {statusCfg.label}
            </Badge>
          </div>
          {/* Product */}
          <p className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">{wo.product}</p>
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div>
              <span className="text-[var(--neutral-500)]">Qty</span>
              <p className="font-medium text-foreground tabular-nums">{wo.qty} units</p>
            </div>
            <div>
              <span className="text-[var(--neutral-500)]">Operator</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-[8px] font-medium text-white dark:bg-[var(--neutral-600)]">
                  {wo.operatorInitials}
                </div>
                <span className="font-medium text-foreground truncate">{wo.operator}</span>
              </div>
            </div>
            <div>
              <span className="text-[var(--neutral-500)]">Start</span>
              <p className="font-medium text-foreground tabular-nums">{wo.startTime}</p>
            </div>
            <div>
              <span className="text-[var(--neutral-500)]">End</span>
              <p className="font-medium text-foreground tabular-nums">{wo.endTime}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--neutral-500)]">Progress</span>
              <span className="text-[10px] font-medium text-foreground tabular-nums">{wo.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${wo.progress}%`,
                  backgroundColor: wo.progress >= 100 ? 'var(--mw-success)' : wo.progress > 0 ? 'var(--mw-yellow-400)' : 'var(--neutral-300)',
                }}
              />
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}


const makeTabs = [{ key: 'overview', label: 'Overview' }];

export function MakeDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const runningCount = mockMachines.filter(m => m.status === 'running').length;
  const downCount = mockMachines.filter(m => m.status === 'down').length;
  const avgUtilization = Math.round(mockMachines.reduce((sum, m) => sum + m.utilizationToday, 0) / mockMachines.length);

  const activeWOs = dashboardWorkOrders.filter((wo) => wo.status === 'in_progress');
  const scheduledWOs = dashboardWorkOrders.filter((wo) => wo.status === 'scheduled');
  const completedWOs = dashboardWorkOrders.filter((wo) => wo.status === 'completed');

  return (
    <ModuleDashboard
      title="Make"
      tabs={makeTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="make"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">

      {/* TASK 1 — AI Feed below command bar */}
      <motion.div variants={staggerItem}>
        <AIFeed module="make" />
      </motion.div>

      {/* Quick navigation bento — jump to any sub-page without using sidebar */}
      <motion.div variants={staggerItem}>
        <ModuleQuickNav moduleKey="make" />
      </motion.div>

      {/* TASK 3 — Work Orders elevated to top with larger cards */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">Active Work Orders</h2>
          <Badge className="bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10 text-foreground border-0 text-xs">
            {activeWOs.length} active
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeWOs.map((wo) => {
            const statusCfg = getWoStatusConfig(wo.status);
            return (
              <motion.div
                key={wo.woNumber}
                variants={staggerItem}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="bg-card border border-[var(--border)] rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow duration-[var(--duration-medium1)]">
                  {/* Top row: WO number + status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-foreground tabular-nums">{wo.woNumber}</span>
                    <Badge className={cn('border-0 text-xs px-2 py-0.5', statusCfg.bg, statusCfg.text)}>
                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full mr-1.5', statusCfg.dot)} />
                      {statusCfg.label}
                    </Badge>
                  </div>

                  {/* Product name */}
                  <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)] mb-4">{wo.product}</p>

                  {/* Progress indicator */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--neutral-500)]">Progress</span>
                      <span className="text-sm font-medium text-foreground tabular-nums">{wo.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${wo.progress}%` }}
                        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                        style={{
                          backgroundColor: wo.progress >= 100 ? 'var(--mw-success)' : 'var(--mw-yellow-400)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta row: operator, machine, qty */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-[10px] font-medium text-white dark:bg-[var(--neutral-600)]">
                        {wo.operatorInitials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground leading-tight">{wo.operator}</p>
                        <p className="text-[10px] text-[var(--neutral-500)]">{wo.machine}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground tabular-nums">{wo.qty} units</p>
                      <p className="text-[10px] text-[var(--neutral-500)] tabular-nums">{wo.startTime} - {wo.endTime}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Scheduled + Completed work order rows (compact) */}
      {scheduledWOs.length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-[var(--neutral-500)]">Scheduled</h3>
            <span className="text-xs text-[var(--neutral-400)]">{scheduledWOs.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {scheduledWOs.map((wo) => {
              const statusCfg = getWoStatusConfig(wo.status);
              return (
                <Card key={wo.woNumber} className="bg-card border border-[var(--border)] rounded-lg p-4 hover:shadow-sm transition-shadow duration-[var(--duration-medium1)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground tabular-nums">{wo.woNumber}</span>
                    <Badge className={cn('border-0 text-[10px] px-1.5 py-0.5', statusCfg.bg, statusCfg.text)}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--neutral-500)] mb-2 truncate">{wo.product}</p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--neutral-500)]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-[8px] font-medium text-white dark:bg-[var(--neutral-600)]">
                        {wo.operatorInitials}
                      </div>
                      <span>{wo.machine}</span>
                    </div>
                    <span className="tabular-nums">{wo.startTime} - {wo.endTime}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Active Orders"
            value={`${runningCount}/${mockMachines.length}`}
            icon={CheckCircle2}
            iconSurface="key"
            valueClassName="text-3xl font-bold"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Machines Running"
            value={runningCount}
            icon={Activity}
            valueClassName="text-3xl font-bold"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Completion Rate"
            value="87%"
            icon={TrendingUp}
            valueClassName="text-3xl font-bold"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Quality Holds"
            value={3}
            icon={ShieldAlert}
            valueClassName="text-3xl font-bold text-[var(--mw-warning)]"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="OEE Utilisation"
            value={`${avgUtilization}%`}
            icon={BarChart3}
            valueClassName="text-3xl font-bold"
          />
        </motion.div>
      </div>

      {/* Machine Status Grid - LARGE TOUCH TARGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMachines.map((machine) => {
          const statusConfig = getStatusColor(machine.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div key={machine.id} variants={staggerItem}>
              <Card className={cn(
                "rounded-[var(--shape-lg)] p-6 cursor-pointer transition-all duration-[var(--duration-medium1)] border-4",
                statusConfig.bg,
                statusConfig.text
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-medium mb-2">{machine.name}</h2>
                    <p className="text-base opacity-90">{machine.workCenter}</p>
                  </div>
                  <StatusIcon className="w-12 h-12" strokeWidth={1.5} aria-hidden />
                </div>

                <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'currentColor', opacity: 0.3 }}>
                  {machine.currentJob && (
                    <div>
                      <p className="text-xs opacity-75 mb-2">Current Job</p>
                      <p className="text-lg font-medium tabular-nums">{machine.currentJob}</p>
                    </div>
                  )}
                  {machine.operator && (
                    <div>
                      <p className="text-xs opacity-75 mb-2">Operator</p>
                      <p className="text-base font-medium">{machine.operator}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs opacity-75 mb-2">Utilization Today</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-black bg-opacity-20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-card rounded-full transition-all duration-[var(--duration-medium1)]"
                          style={{ width: `${machine.utilizationToday}%` }}
                        />
                      </div>
                      <span className="text-lg font-medium tabular-nums min-w-[60px]">
                        {machine.utilizationToday}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'currentColor', opacity: 0.3 }}>
                  <Badge className="w-full justify-center py-3 text-base font-medium bg-white/20 text-current border-0">
                    {statusConfig.label}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
        <h3 className="text-sm font-medium text-[var(--neutral-500)] mb-4">Status legend</h3>
        <div className="flex flex-wrap gap-4">
          {(['running', 'idle', 'setup', 'down', 'maintenance'] as MachineStatus[]).map(status => {
            const config = getStatusColor(status);
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded", config.bg)} />
                <span className="text-sm text-foreground">{config.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quality Alerts */}
      <motion.div variants={staggerItem}>
        <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6" style={{ borderLeft: '4px solid var(--mw-warning)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Quality Alerts</h3>
            <Badge className="bg-[var(--mw-warning)]/10 text-[var(--mw-warning)] border-0">3 Active</Badge>
          </div>
          <div className="space-y-3">
            {[
              { desc: 'Material thickness variance on WO-002', time: '12 min ago' },
              { desc: 'Tooling wear detected on CNC-01', time: '34 min ago' },
              { desc: 'Surface finish defect on batch 3', time: '1 hr ago' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <AlertTriangle className="w-5 h-5 text-[var(--mw-warning)] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{alert.desc}</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{alert.time}</p>
                </div>
                <button className="text-xs font-medium text-foreground hover:underline shrink-0">View</button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <Button variant="outline" size="sm" className="w-full h-14">
              <ShieldAlert className="w-4 h-4" />
              Report Issue
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* TASK 2 — Today's Schedule Gantt Strip with rich hover tooltips */}
      <motion.div variants={staggerItem}>
        <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h3 className="text-base font-medium text-foreground mb-4">Today's Schedule</h3>
          <div className="overflow-x-auto">
            {/* Time header */}
            <div className="flex items-end mb-2 ml-[100px]">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="flex-1 text-xs text-[var(--neutral-500)] text-left">
                  {`${i + 8}:00`}
                </div>
              ))}
            </div>
            {/* Machine rows */}
            <div className="space-y-1.5">
              {scheduleRows.map((row) => (
                <div key={row.name} className="flex items-center gap-2">
                  <span className="w-[92px] text-xs font-medium text-foreground truncate shrink-0">{row.name}</span>
                  <div className="flex-1 h-7 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded relative overflow-visible">
                    {row.blocks.map((block, j) => (
                      <ScheduleBlockTooltip key={j} block={block} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Gantt legend */}
            <div className="flex gap-4 mt-3 ml-[100px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-mirage)' }} />
                <span className="text-xs text-[var(--neutral-500)]">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-warning)' }} />
                <span className="text-xs text-[var(--neutral-500)]">Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--neutral-300)' }} />
                <span className="text-xs text-[var(--neutral-500)]">Idle</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Bottom Row -- Quick Actions, OEE Trend, Throughput vs Target */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div variants={staggerItem}>
          <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6 h-full">
            <h3 className="text-base font-medium text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: 'Start New Job', icon: Play },
                { label: 'Log QC Check', icon: ClipboardCheck },
                { label: 'Scan Material', icon: ScanBarcode },
                { label: 'Print Traveler', icon: Printer },
                { label: 'Log Downtime', icon: TimerOff },
              ]).map((action) => (
                <Button key={action.label} variant="outline" className="flex flex-col items-center gap-2 h-auto min-h-14 py-4 text-xs font-medium" onClick={() => toast(`${action.label} coming soon`)}>
                  <action.icon className="w-5 h-5 text-foreground" />
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Real-time OEE Trend */}
        <motion.div variants={staggerItem}>
          <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6 h-full">
            <h3 className="text-base font-medium text-foreground mb-4">Real-time OEE Trend</h3>
            <div className="flex items-end gap-1 h-[140px]">
              {[62, 68, 71, 65, 74, 78, 72, 80, 76, 82, 79, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <span className="text-xs text-[var(--neutral-500)]">{val}%</span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${val}%`,
                      backgroundColor: val >= 75 ? 'var(--mw-mirage)' : 'var(--mw-warning)',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[var(--neutral-400)]">
              <span>8:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-mirage)' }} />
                <span className="text-xs text-[var(--neutral-500)]">&ge; 75% (target)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-warning)' }} />
                <span className="text-xs text-[var(--neutral-500)]">&lt; 75%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Throughput vs Target */}
        <motion.div variants={staggerItem}>
          <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6 h-full">
            <h3 className="text-base font-medium text-foreground mb-4">Throughput vs Target</h3>
            <div className="space-y-3">
              {([
                { label: 'Cutting', actual: 42, target: 50 },
                { label: 'Forming', actual: 28, target: 35 },
                { label: 'Welding', actual: 31, target: 30 },
                { label: 'Machining', actual: 18, target: 25 },
                { label: 'Finishing', actual: 22, target: 20 },
              ]).map((row) => {
                const pct = Math.min(100, Math.round((row.actual / row.target) * 100));
                const onTrack = row.actual >= row.target;
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{row.label}</span>
                      <span className="text-xs text-[var(--neutral-500)]">{row.actual}/{row.target} units</span>
                    </div>
                    <div className="h-2.5 bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden relative">
                      {/* target marker */}
                      <div className="absolute top-0 h-full w-px bg-[var(--neutral-400)]" style={{ left: '100%' }} />
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: onTrack ? 'var(--mw-mirage)' : 'var(--mw-warning)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-mirage)' }} />
                <span className="text-xs text-[var(--neutral-500)]">On track</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-warning)' }} />
                <span className="text-xs text-[var(--neutral-500)]">Below target</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      </motion.div>
    </ModuleDashboard>
  );
}
