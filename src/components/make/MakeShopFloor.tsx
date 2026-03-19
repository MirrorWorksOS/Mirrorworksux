/**
 * Make Shop Floor - Kanban view (Overdue/In Progress/Not Started)
 * Touch-optimized for tablet/shop floor devices
 */

import React from 'react';
import { Clock, Zap, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

type MOStatus = 'overdue' | 'in_progress' | 'not_started';

interface ManufacturingOrder {
  id: string;
  moNumber: string;
  jobNumber: string;
  partName: string;
  quantity: number;
  dueDate: string;
  workCenter: string;
  operator?: string;
  status: MOStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const mockMOs: ManufacturingOrder[] = [
  { id: '1', moNumber: 'MO-2026-0042', jobNumber: 'JOB-2026-0009', partName: 'Chassis Frame', quantity: 5, dueDate: '2026-03-18', workCenter: 'Welding', status: 'overdue', priority: 'urgent' },
  { id: '2', moNumber: 'MO-2026-0045', jobNumber: 'JOB-2026-0012', partName: 'Side Panel', quantity: 10, dueDate: '2026-03-22', workCenter: 'Cutting', operator: 'Sarah Chen', status: 'in_progress', priority: 'high' },
  { id: '3', moNumber: 'MO-2026-0044', jobNumber: 'JOB-2026-0011', partName: 'Bracket Assembly', quantity: 20, dueDate: '2026-03-23', workCenter: 'Welding', operator: 'Mike Thompson', status: 'in_progress', priority: 'medium' },
  { id: '4', moNumber: 'MO-2026-0046', jobNumber: 'JOB-2026-0012', partName: 'Top Cover', quantity: 10, dueDate: '2026-03-24', workCenter: 'Forming', status: 'not_started', priority: 'medium' },
  { id: '5', moNumber: 'MO-2026-0047', jobNumber: 'JOB-2026-0010', partName: 'Custom Bracket', quantity: 15, dueDate: '2026-03-25', workCenter: 'Machining', status: 'not_started', priority: 'low' },
];

const columns: { key: MOStatus; label: string; color: string; icon: any }[] = [
  { key: 'overdue', label: 'Overdue', color: '#EF4444', icon: Clock },
  { key: 'in_progress', label: 'In Progress', color: '#FACC15', icon: Zap },
  { key: 'not_started', label: 'Not Started', color: '#737373', icon: Calendar },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-[#FEE2E2] text-[#EF4444]';
    case 'high': return 'bg-[#FFF4CC] text-[#805900]';
    case 'medium': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'low': return 'bg-[#F5F5F5] text-[#737373]';
  }
};

export function MakeShopFloor() {
  const getMOsByStatus = (status: MOStatus) => mockMOs.filter(mo => mo.status === status);

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Shop Floor</h1>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const ColumnIcon = column.icon;
          const columnMOs = getMOsByStatus(column.key);

          return (
            <div key={column.key} className="flex-shrink-0 w-[380px]">
              <div className="bg-[#FAFAFA] rounded-lg p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className="w-5 h-5" style={{ color: column.color }} />
                    <h2 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">{column.label}</h2>
                    <Badge className="bg-[#E5E5E5] text-[#525252] border-0 text-xs">{columnMOs.length}</Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {columnMOs.map((mo) => (
                    <Card key={mo.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-['Roboto_Mono',monospace] text-[14px] font-semibold text-[#0052CC] mb-1">{mo.moNumber}</h3>
                          <p className="font-['Roboto_Mono',monospace] text-[12px] text-[#737373]">{mo.jobNumber}</p>
                        </div>
                        <Badge className={cn("rounded text-xs px-2 py-0.5 border-0", getPriorityColor(mo.priority))}>
                          {mo.priority.charAt(0).toUpperCase() + mo.priority.slice(1)}
                        </Badge>
                      </div>

                      <h4 className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A] mb-3">
                        {mo.partName}
                      </h4>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#737373]">Quantity:</span>
                          <span className="font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{mo.quantity}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#737373]">Work Center:</span>
                          <span className="text-[#0A0A0A]">{mo.workCenter}</span>
                        </div>
                        {mo.operator && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#737373]">Operator:</span>
                            <span className="text-[#0A0A0A]">{mo.operator}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E5E5E5]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#737373]">Due Date:</span>
                          <span className={cn(
                            "font-medium",
                            mo.status === 'overdue' ? 'text-[#EF4444]' : 'text-[#0A0A0A]'
                          )}>
                            {new Date(mo.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {columnMOs.length === 0 && (
                    <div className="bg-white border border-dashed border-[#E5E5E5] rounded-lg p-6 text-center">
                      <p className="text-xs text-[#737373]">No orders</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
