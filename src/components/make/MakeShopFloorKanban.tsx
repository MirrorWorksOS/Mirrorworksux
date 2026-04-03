/**
 * MakeShopFloorKanban - Kanban board view of Manufacturing Orders
 * Extracted from MakeShopFloor to be used as a tab within the full shop floor screen.
 * Clicking a card opens WorkOrderFullScreen overlay.
 */

import React, { useCallback, useState } from 'react';
import { Clock, Zap, Calendar } from 'lucide-react';
import { InlineEmpty } from '@/components/shared/feedback/EmptyState';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { cn } from '../ui/utils';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';
import { manufacturingOrders, workOrders } from '@/services/mock';

const KANBAN_ITEM_TYPE = 'shop-floor-mo';

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

const deriveShopFloorStatus = (moStatus: string, dueDate: string): MOStatus => {
  if (moStatus === 'in_progress' && new Date(dueDate) < new Date()) return 'overdue';
  if (moStatus === 'in_progress') return 'in_progress';
  return 'not_started';
};

const WORK_CENTER_LOOKUP: Record<string, string> = {
  'mach-001': 'Cutting', 'mach-002': 'Forming', 'mach-003': 'Welding',
  'mach-004': 'Machining', 'mach-005': 'Finishing', 'mach-006': 'Cutting',
};

const mockMOs: ManufacturingOrder[] = manufacturingOrders
  .filter((mo) => mo.status !== 'done')
  .map((mo) => {
    const firstWO = workOrders.find((wo) => wo.manufacturingOrderId === mo.id);
    return {
      id: mo.id,
      moNumber: mo.moNumber,
      jobNumber: mo.jobNumber,
      partName: mo.productName,
      quantity: mo.workOrders * 5,
      dueDate: mo.dueDate,
      workCenter: firstWO ? WORK_CENTER_LOOKUP[firstWO.machineId] ?? firstWO.machineName.split(' ')[0] : 'General',
      operator: mo.operatorName || undefined,
      status: deriveShopFloorStatus(mo.status, mo.dueDate),
      priority: mo.priority as ManufacturingOrder['priority'],
    };
  });

const columns: { key: MOStatus; label: string; color: string; icon: typeof Clock }[] = [
  { key: 'overdue', label: 'Overdue', color: 'var(--mw-error)', icon: Clock },
  { key: 'in_progress', label: 'In Progress', color: 'var(--mw-yellow-400)', icon: Zap },
  { key: 'not_started', label: 'Not Started', color: 'var(--neutral-500)', icon: Calendar },
];

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-[var(--mw-mirage)] text-white';
    case 'high':   return 'bg-[var(--mw-yellow-400)]/20 text-foreground';
    case 'medium': return 'bg-[var(--neutral-100)] text-foreground';
    case 'low':    return 'bg-[var(--neutral-100)] text-[var(--neutral-500)]';
    default:       return 'bg-[var(--neutral-100)] text-[var(--neutral-500)]';
  }
};

export function MakeShopFloorKanban() {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>(mockMOs);
  const [selectedMO, setSelectedMO] = useState<any>(null);

  const getMOsByStatus = (status: MOStatus) => manufacturingOrders.filter(mo => mo.status === status);

  const handleKanbanDrop = useCallback((item: KanbanDragItem, columnId: string) => {
    setManufacturingOrders(prev =>
      prev.map(mo => (mo.id === item.id ? { ...mo, status: columnId as MOStatus } : mo)),
    );
  }, []);

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
    <div className="p-6 h-full overflow-auto bg-[var(--neutral-100)]">
      <div style={{ minHeight: 'calc(100% - 24px)' }}>
        <KanbanBoard className="gap-6">
          {columns.map((column) => {
            const ColumnIcon = column.icon;
            const columnMOs = getMOsByStatus(column.key);

            return (
              <KanbanColumn
                key={column.key}
                id={column.key}
                title={column.label}
                count={columnMOs.length}
                accept={KANBAN_ITEM_TYPE}
                onDrop={handleKanbanDrop}
                className="min-w-[380px] w-[380px] flex-shrink-0"
              >
                <div className="flex items-center gap-2 px-0.5 pb-2">
                  <ColumnIcon className="w-4 h-4 shrink-0" style={{ color: column.color }} aria-hidden />
                </div>
                {columnMOs.map((mo) => (
                  <KanbanCard key={mo.id} id={mo.id} type={KANBAN_ITEM_TYPE} className="p-0">
                    <div
                      role="button"
                      tabIndex={0}
                      className="p-6 cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => handleCardClick(mo)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardClick(mo);
                        }
                      }}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-medium tabular-nums text-foreground">
                            {mo.moNumber}
                          </p>
                          <p className="text-xs tabular-nums text-[var(--neutral-500)] mt-0.5">
                            {mo.jobNumber}
                          </p>
                        </div>
                        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full capitalize', getPriorityStyle(mo.priority))}>
                          {mo.priority}
                        </span>
                      </div>

                      {/* Part Name */}
                      <h4 className="text-sm font-medium text-foreground mb-4">
                        {mo.partName}
                      </h4>

                      {/* Metadata */}
                      <div className="space-y-1.5 mb-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--neutral-500)]">Qty</span>
                          <span className="font-medium tabular-nums text-foreground">{mo.quantity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--neutral-500)]">Work centre</span>
                          <span className="text-foreground">{mo.workCenter}</span>
                        </div>
                        {mo.operator && (
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--neutral-500)]">Operator</span>
                            <span className="text-foreground">{mo.operator}</span>
                          </div>
                        )}
                      </div>

                      {/* Due Date */}
                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                        <span className="text-[var(--neutral-500)]">Due</span>
                        <span className={cn(
                          'font-medium tabular-nums',
                          mo.status === 'overdue' ? 'text-[var(--mw-error)]' : 'text-foreground'
                        )}>
                          {new Date(mo.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </KanbanCard>
                ))}

                {columnMOs.length === 0 && (
                  <InlineEmpty message="No orders" />
                )}
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
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
