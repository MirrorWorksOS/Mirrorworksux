/**
 * Make Dashboard - Andon Board with machine status grid
 * Touch-optimized for shop floor displays
 */

import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';


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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Running"
            value={`${runningCount}/${mockMachines.length}`}
            icon={CheckCircle2}
            iconSurface="key"
            valueClassName="text-3xl font-bold"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Down"
            value={downCount}
            icon={AlertTriangle}
            valueClassName="text-3xl font-bold text-[var(--mw-error)]"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            layout="compact"
            label="Avg utilisation"
            value={`${avgUtilization}%`}
            icon={Clock}
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
                "rounded-[var(--shape-lg)] p-8 cursor-pointer transition-all duration-[var(--duration-medium1)] border-4",
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
      </motion.div>
    </ModuleDashboard>
  );
}
