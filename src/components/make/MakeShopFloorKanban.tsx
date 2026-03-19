/**
 * MakeShopFloorKanban - Kanban board view of Manufacturing Orders
 * Extracted from MakeShopFloor to be used as a tab within the full shop floor screen.
 * Clicking a card opens WorkOrderFullScreen overlay.
 */

import React, { useState } from 'react';
import { Clock, Zap, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';

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

const columns: { key: MOStatus; label: string; color: string; headerBg: string; icon: any }[] = [
  { key: 'overdue',     label: 'Overdue',     color: '#EF4444', headerBg: 'bg-[#FEE2E2]', icon: Clock },
  { key: 'in_progress', label: 'In Progress', color: '#FFCF4B', headerBg: 'bg-[#FFFBF0]', icon: Zap },
  { key: 'not_started', label: 'Not Started', color: '#737373', headerBg: 'bg-[#F5F5F5]', icon: Calendar },
];

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-[#FEE2E2] text-[#EF4444]';
    case 'high':   return 'bg-[#FFEDD5] text-[#FF8B00]';
    case 'medium': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'low':    return 'bg-[#E3FCEF] text-[#36B37E]';
    default:       return 'bg-[#F5F5F5] text-[#737373]';
  }
};

export function MakeShopFloorKanban() {
  const [selectedMO, setSelectedMO] = useState<any>(null);

  const getMOsByStatus = (status: MOStatus) => mockMOs.filter(mo => mo.status === status);

  const handleCardClick = (mo: ManufacturingOrder) => {
    setSelectedMO({
      id: mo.id,
      moId: mo.moNumber,
      name: mo.partName,
      station: mo.workCenter,
      status: mo.status === 'in_progress' ? 'progress' : mo.status === 'not_started' ? 'pending' : 'hold',
      progress: mo.status === 'in_progress' ? 45 : 0,
      unitsCompleted: mo.status === 'in_progress' ? Math.floor(mo.quantity * 0.45) : 0,
      totalUnits: mo.quantity,
      moCustomer: 'Alliance Metal',
      moPartName: mo.partName,
    });
  };

  return (
    <div className="p-6 h-full overflow-auto bg-[#F8F7F4]">
      <div className="flex gap-6 pb-4" style={{ minHeight: 'calc(100% - 24px)' }}>
        {columns.map((column) => {
          const ColumnIcon = column.icon;
          const columnMOs = getMOsByStatus(column.key);

          return (
            <div key={column.key} className="flex-shrink-0 w-[380px] flex flex-col">
              {/* Column Header */}
              <div className={cn('rounded-t-lg px-4 py-3 flex items-center justify-between', column.headerBg)}>
                <div className="flex items-center gap-2">
                  <ColumnIcon className="w-4 h-4" style={{ color: column.color }} />
                  <span className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
                    {column.label}
                  </span>
                </div>
                <Badge
                  className="border-0 text-xs"
                  style={{ backgroundColor: column.color + '22', color: column.color }}
                >
                  {columnMOs.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex-1 bg-[#FAFAFA] rounded-b-lg p-3 space-y-3">
                {columnMOs.map((mo) => (
                  <Card
                    key={mo.id}
                    className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
                    onClick={() => handleCardClick(mo)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-['JetBrains_Mono',monospace] text-[13px] font-semibold text-[#0052CC]">
                          {mo.moNumber}
                        </p>
                        <p className="font-['JetBrains_Mono',monospace] text-[11px] text-[#737373] mt-0.5">
                          {mo.jobNumber}
                        </p>
                      </div>
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded capitalize', getPriorityStyle(mo.priority))}>
                        {mo.priority}
                      </span>
                    </div>

                    {/* Part Name */}
                    <h4 className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A] mb-3">
                      {mo.partName}
                    </h4>

                    {/* Metadata */}
                    <div className="space-y-1.5 mb-3 text-[13px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#737373]">Qty</span>
                        <span className="font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{mo.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#737373]">Work centre</span>
                        <span className="text-[#0A0A0A]">{mo.workCenter}</span>
                      </div>
                      {mo.operator && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#737373]">Operator</span>
                          <span className="text-[#0A0A0A]">{mo.operator}</span>
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[13px]">
                      <span className="text-[#737373]">Due</span>
                      <span className={cn(
                        'font-medium',
                        mo.status === 'overdue' ? 'text-[#EF4444]' : 'text-[#0A0A0A]'
                      )}>
                        {new Date(mo.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                      </span>
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
          );
        })}
      </div>

      {/* WorkOrderFullScreen overlay */}
      {selectedMO && (
        <WorkOrderFullScreen
          workOrder={selectedMO}
          onClose={() => setSelectedMO(null)}
        />
      )}
    </div>
  );
}
