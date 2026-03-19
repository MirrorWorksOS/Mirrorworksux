/**
 * Make Dashboard - Andon Board with machine status grid
 * Touch-optimized for shop floor displays
 */

import React from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

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
    case 'running': return { bg: 'bg-[#36B37E]', text: 'text-white', icon: CheckCircle2, label: 'Running' };
    case 'idle': return { bg: 'bg-[#FACC15]', text: 'text-[#2C2C2C]', icon: Clock, label: 'Idle' };
    case 'down': return { bg: 'bg-[#EF4444]', text: 'text-white', icon: AlertTriangle, label: 'Down' };
    case 'maintenance': return { bg: 'bg-[#7C3AED]', text: 'text-white', icon: Wrench, label: 'Maintenance' };
    case 'setup': return { bg: 'bg-[#FF8B00]', text: 'text-white', icon: Zap, label: 'Setup' };
  }
};

export function MakeDashboard() {
  const runningCount = mockMachines.filter(m => m.status === 'running').length;
  const downCount = mockMachines.filter(m => m.status === 'down').length;
  const avgUtilization = Math.round(mockMachines.reduce((sum, m) => sum + m.utilizationToday, 0) / mockMachines.length);

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      {/* Andon Board Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[48px] tracking-tight text-[#1A2732] font-bold">Andon Board</h1>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-[#737373] mb-1">Running</p>
            <p className="text-[32px] font-bold text-[#36B37E]">{runningCount}/{mockMachines.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[#737373] mb-1">Down</p>
            <p className="text-[32px] font-bold text-[#EF4444]">{downCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[#737373] mb-1">Avg Utilization</p>
            <p className="text-[32px] font-bold text-[#0A0A0A]">{avgUtilization}%</p>
          </div>
        </div>
      </div>

      {/* Machine Status Grid - LARGE TOUCH TARGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMachines.map((machine) => {
          const statusConfig = getStatusColor(machine.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div key={machine.id} variants={animationVariants.listItem}>
              <Card className={cn(
                "rounded-lg p-8 cursor-pointer transition-all duration-300 border-4",
                statusConfig.bg,
                statusConfig.text
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-[24px] font-bold mb-1">{machine.name}</h2>
                    <p className="text-[16px] opacity-90">{machine.workCenter}</p>
                  </div>
                  <StatusIcon className="w-12 h-12" />
                </div>

                <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'currentColor', opacity: 0.3 }}>
                  {machine.currentJob && (
                    <div>
                      <p className="text-[12px] opacity-75 mb-1">Current Job</p>
                      <p className="text-[18px] font-bold font-['Roboto_Mono',monospace]">{machine.currentJob}</p>
                    </div>
                  )}
                  {machine.operator && (
                    <div>
                      <p className="text-[12px] opacity-75 mb-1">Operator</p>
                      <p className="text-[16px] font-medium">{machine.operator}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[12px] opacity-75 mb-1">Utilization Today</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-black bg-opacity-20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-300"
                          style={{ width: `${machine.utilizationToday}%` }}
                        />
                      </div>
                      <span className="text-[18px] font-bold font-['Roboto_Mono',monospace] min-w-[60px]">
                        {machine.utilizationToday}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'currentColor', opacity: 0.3 }}>
                  <Badge className="w-full justify-center py-3 text-[16px] font-bold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'currentColor',
                      border: 'none'
                    }}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <h3 className="text-sm font-medium text-[#737373] mb-3">STATUS LEGEND</h3>
        <div className="flex flex-wrap gap-4">
          {(['running', 'idle', 'setup', 'down', 'maintenance'] as MachineStatus[]).map(status => {
            const config = getStatusColor(status);
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded", config.bg)} />
                <span className="text-sm text-[#0A0A0A]">{config.label}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
