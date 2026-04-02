/**
 * Make Dashboard - Andon Board with machine status grid
 * Touch-optimized for shop floor displays
 */

import React, { useState } from 'react';
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
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { toast } from 'sonner';


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

const mockMachines: Machine[] = [
  { id: '1', name: 'Laser Cutter #1', workCenter: 'Cutting', status: 'running', currentJob: 'JOB-2026-0012', operator: 'Sarah Chen', utilizationToday: 85 },
  { id: '2', name: 'Press Brake #2', workCenter: 'Forming', status: 'idle', utilizationToday: 42 },
  { id: '3', name: 'Welding Station A', workCenter: 'Welding', status: 'running', currentJob: 'JOB-2026-0011', operator: 'Mike Thompson', utilizationToday: 92 },
  { id: '4', name: 'CNC Mill #3', workCenter: 'Machining', status: 'setup', currentJob: 'JOB-2026-0010', operator: 'David Lee', utilizationToday: 67 },
  { id: '5', name: 'Powder Coat Line', workCenter: 'Finishing', status: 'down', utilizationToday: 28 },
  { id: '6', name: 'Laser Cutter #2', workCenter: 'Cutting', status: 'maintenance', utilizationToday: 0 },
];

const getStatusColor = (status: MachineStatus) => {
  switch (status) {
    case 'running': return { bg: 'bg-[var(--mw-mirage)]', text: 'text-white', icon: CheckCircle2, label: 'Running' };
    case 'idle': return { bg: 'bg-[var(--mw-warning)]', text: 'text-[var(--neutral-800)]', icon: Clock, label: 'Idle' };
    case 'down': return { bg: 'bg-[var(--mw-error)]', text: 'text-white', icon: AlertTriangle, label: 'Down' };
    case 'maintenance': return { bg: 'bg-[var(--mw-mirage)]', text: 'text-white', icon: Wrench, label: 'Maintenance' };
    case 'setup': return { bg: 'bg-[var(--mw-amber)]', text: 'text-white', icon: Zap, label: 'Setup' };
  }
};

const makeTabs = [{ key: 'overview', label: 'Overview' }];

export function MakeDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const runningCount = mockMachines.filter(m => m.status === 'running').length;
  const downCount = mockMachines.filter(m => m.status === 'down').length;
  const avgUtilization = Math.round(mockMachines.reduce((sum, m) => sum + m.utilizationToday, 0) / mockMachines.length);

  return (
    <ModuleDashboard
      title="Andon Board"
      tabs={makeTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="make"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* §4.1.2 KPI Cards */}
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
                          className="h-full bg-white rounded-full transition-all duration-[var(--duration-medium1)]"
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
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
        <h3 className="text-sm font-medium text-[var(--neutral-500)] mb-4">Status legend</h3>
        <div className="flex flex-wrap gap-4">
          {(['running', 'idle', 'setup', 'down', 'maintenance'] as MachineStatus[]).map(status => {
            const config = getStatusColor(status);
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded", config.bg)} />
                <span className="text-sm text-[var(--mw-mirage)]">{config.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* §4.1.5 Quality Alerts */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6" style={{ borderLeft: '4px solid var(--mw-warning)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--mw-mirage)]">Quality Alerts</h3>
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
                  <p className="text-sm text-[var(--mw-mirage)]">{alert.desc}</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{alert.time}</p>
                </div>
                <button className="text-xs font-medium text-[var(--mw-mirage)] hover:underline shrink-0">View</button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <Button variant="outline" size="sm" className="w-full">
              <ShieldAlert className="w-4 h-4" />
              Report Issue
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* §4.1.6 Today's Schedule Gantt Strip */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-4">Today's Schedule</h3>
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
              {([
                { name: 'Laser-01', blocks: [{ start: 0, width: 33, color: 'var(--mw-mirage)', label: 'WO-001' }, { start: 37, width: 30, color: 'var(--mw-warning)', label: 'WO-004' }] },
                { name: 'CNC-01',   blocks: [{ start: 0, width: 55, color: 'var(--mw-mirage)', label: 'WO-002' }, { start: 60, width: 25, color: 'var(--mw-warning)', label: 'WO-007' }] },
                { name: 'CNC-02',   blocks: [{ start: 11, width: 44, color: 'var(--mw-mirage)', label: 'WO-003' }] },
                { name: 'Press-01', blocks: [{ start: 0, width: 22, color: 'var(--mw-mirage)', label: 'WO-005' }, { start: 33, width: 33, color: 'var(--mw-warning)', label: 'WO-008' }, { start: 78, width: 22, color: 'var(--neutral-300)', label: 'Idle' }] },
                { name: 'Weld-01',  blocks: [{ start: 5, width: 50, color: 'var(--mw-mirage)', label: 'WO-006' }] },
                { name: 'Pack-01',  blocks: [{ start: 22, width: 33, color: 'var(--mw-warning)', label: 'WO-009' }, { start: 60, width: 28, color: 'var(--neutral-300)', label: 'Idle' }] },
              ]).map((row) => (
                <div key={row.name} className="flex items-center gap-2">
                  <span className="w-[92px] text-xs font-medium text-[var(--mw-mirage)] truncate shrink-0">{row.name}</span>
                  <div className="flex-1 h-7 bg-[var(--neutral-100)] rounded relative overflow-hidden">
                    {row.blocks.map((block, j) => (
                      <div
                        key={j}
                        className="absolute top-0 h-full rounded flex items-center justify-center text-[10px] font-medium text-white truncate px-1"
                        style={{
                          left: `${block.start}%`,
                          width: `${block.width}%`,
                          backgroundColor: block.color,
                          color: block.color === 'var(--neutral-300)' ? 'var(--neutral-600)' : 'white',
                        }}
                      >
                        {block.label}
                      </div>
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

      {/* §4.1.7 Bottom Row — Quick Actions, OEE Trend, Throughput vs Target */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 h-full">
            <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: 'Start New Job', icon: Play },
                { label: 'Log QC Check', icon: ClipboardCheck },
                { label: 'Scan Material', icon: ScanBarcode },
                { label: 'Print Traveler', icon: Printer },
                { label: 'Log Downtime', icon: TimerOff },
              ]).map((action) => (
                <Button key={action.label} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 text-xs font-medium" onClick={() => toast(`${action.label} coming soon`)}>
                  <action.icon className="w-5 h-5 text-[var(--mw-mirage)]" />
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Real-time OEE Trend */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 h-full">
            <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-4">Real-time OEE Trend</h3>
            <div className="flex items-end gap-1 h-[140px]">
              {[62, 68, 71, 65, 74, 78, 72, 80, 76, 82, 79, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <span className="text-[9px] text-[var(--neutral-500)]">{val}%</span>
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
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 h-full">
            <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-4">Throughput vs Target</h3>
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
                      <span className="text-xs font-medium text-[var(--mw-mirage)]">{row.label}</span>
                      <span className="text-xs text-[var(--neutral-500)]">{row.actual}/{row.target} units</span>
                    </div>
                    <div className="h-2.5 bg-[var(--neutral-100)] rounded-full overflow-hidden relative">
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
