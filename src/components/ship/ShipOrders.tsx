/**
 * Ship Orders — token-aligned to standard design system
 */
import React, { useCallback, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { toast } from 'sonner';

type Stage = 'Pick' | 'Pack' | 'Ship' | 'Transit' | 'Delivered';

interface Order {
  id: string; customer: string; items: number; weight: string;
  carrier: string; due: string; stage: Stage; progress: number;
  urgent?: boolean;
}

const ORDERS: Order[] = [
  { id: 'SH-001', customer: 'Con-form Group',  items: 3, weight: '12.4 kg', carrier: 'StarTrack', due: '2d',    stage: 'Pick',      progress: 0,   urgent: true },
  { id: 'SH-002', customer: 'Acme Steel',       items: 1, weight: '45.0 kg', carrier: 'Toll',      due: '1d',    stage: 'Pick',      progress: 0,   urgent: true },
  { id: 'SH-003', customer: 'Pacific Fab',       items: 5, weight: '8.2 kg',  carrier: 'Aus Post',  due: '4d',    stage: 'Pack',      progress: 40 },
  { id: 'SH-004', customer: 'Hunter Steel',      items: 2, weight: '22.1 kg', carrier: 'TNT',       due: '3d',    stage: 'Pack',      progress: 60 },
  { id: 'SH-005', customer: 'BHP Contractors',   items: 8, weight: '34.5 kg', carrier: 'DHL',       due: '2d',    stage: 'Ship',      progress: 95,  urgent: true },
  { id: 'SH-006', customer: 'Sydney Rail',       items: 4, weight: '18.9 kg', carrier: 'StarTrack', due: '1d',    stage: 'Ship',      progress: 95 },
  { id: 'SH-007', customer: 'Lincoln Electric',  items: 6, weight: '28.7 kg', carrier: 'Toll',      due: 'Today', stage: 'Transit',   progress: 100 },
  { id: 'SH-008', customer: 'Dulux Coatings',   items: 3, weight: '9.4 kg',  carrier: 'TNT',       due: '—',     stage: 'Delivered', progress: 100 },
  { id: 'SH-009', customer: 'Kemppi Welding',   items: 2, weight: '6.3 kg',  carrier: 'Sendle',    due: '5d',    stage: 'Pick',      progress: 0 },
];

const KANBAN_ITEM_TYPE = 'ship-order';
const STAGES: Stage[] = ['Pick', 'Pack', 'Ship', 'Transit', 'Delivered'];

const OrderCardContent = ({ order, onClick }: { order: Order; onClick: () => void }) => (
  <div onClick={onClick} className="p-4 cursor-pointer">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-[var(--mw-mirage)] font-medium tabular-nums">{order.id}</span>
      {order.urgent && (
        <StatusBadge priority="urgent">Urgent</StatusBadge>
      )}
    </div>
    <p className="text-sm text-[var(--mw-mirage)] mb-0.5 font-medium">{order.customer}</p>
    <p className="text-xs text-[var(--neutral-500)] tabular-nums mb-4">{order.items} items · {order.weight}</p>
    <div className="h-1 bg-[var(--neutral-200)] rounded-full overflow-hidden mb-4">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${order.progress}%`, backgroundColor: order.progress === 100 ? 'var(--mw-mirage)' : 'var(--mw-yellow-400)' }}
      />
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--neutral-500)]">{order.carrier}</span>
      <span className={cn('text-[var(--neutral-500)]', (order.due === 'Today' || order.due === '1d') && 'text-[var(--mw-mirage)] font-medium')}>
        {order.due}
      </span>
    </div>
  </div>
);

const DetailTimeline = ({ current }: { current: Stage }) => {
  const idx = STAGES.indexOf(current);
  return (
    <div className="space-y-0 relative py-2">
      <div className="absolute left-[7px] top-5 bottom-5 w-px bg-[var(--neutral-200)]" />
      {STAGES.map((stage, i) => {
        const done = i <= idx;
        return (
          <div key={stage} className="flex items-center gap-4 relative py-3">
            <div className={cn('w-4 h-4 rounded-full shrink-0 z-10 border-2', done ? 'bg-[var(--mw-mirage)] border-[var(--mw-mirage)]' : 'bg-white border-[var(--border)]')} />
            <span className={cn('text-sm', done ? 'text-[var(--mw-mirage)] font-medium' : 'text-[var(--neutral-400)]')}>{stage}</span>
          </div>
        );
      })}
    </div>
  );
};

export function ShipOrders() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const handleKanbanDrop = useCallback((item: KanbanDragItem, columnId: string) => {
    setOrders(prev => prev.map(o => o.id === item.id ? { ...o, stage: columnId as Stage } : o));
  }, []);

  return (
    <PageShell className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      <PageHeader title="Orders" />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search orders…" />
        <ToolbarSpacer />
        <IconViewToggle
          value={view}
          onChange={(k) => setView(k as 'kanban' | 'list')}
          options={[
            { key: 'kanban', icon: LayoutGrid, label: 'Kanban view' },
            { key: 'list', icon: List, label: 'List view' },
          ]}
        />
      </PageToolbar>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="flex-1 min-h-0">
          <KanbanBoard className="h-full">
            {STAGES.map(stage => {
              const stageOrders = orders.filter(o => o.stage === stage);
              return (
                <KanbanColumn
                  key={stage}
                  id={stage}
                  title={stage}
                  count={stageOrders.length}
                  accept={KANBAN_ITEM_TYPE}
                  onDrop={handleKanbanDrop}
                  className="min-w-[280px] w-[300px] flex-shrink-0"
                >
                  {stageOrders.map(order => (
                    <KanbanCard key={order.id} id={order.id} type={KANBAN_ITEM_TYPE} className="p-0">
                      <OrderCardContent order={order} onClick={() => setSelected(order)} />
                    </KanbanCard>
                  ))}
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <div className="flex-1 overflow-auto">
          <MwDataTable<Order>
            columns={orderColumns}
            data={orders}
            keyExtractor={(o) => o.id}
            onRowClick={(o) => setSelected(o)}
          />
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Order details</SheetTitle>
          {selected && (
            <>
              <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
                <p className="text-xl  font-medium text-[var(--mw-mirage)]">{selected.id}</p>
                <SheetDescription className="text-[var(--neutral-500)]">{selected.customer}</SheetDescription>
              </SheetHeader>
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { l: 'Items',   v: `${selected.items}` },
                    { l: 'Weight',  v: selected.weight },
                    { l: 'Carrier', v: selected.carrier },
                    { l: 'Due',     v: selected.due },
                  ].map(f => (
                    <div key={f.l}>
                      <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">{f.l}</span>
                      <p className={cn('text-sm text-[var(--mw-mirage)] mt-1 font-medium', f.l === 'Weight' && '')}>{f.v}</p>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[var(--neutral-200)]" />
                <div>
                  <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Progress</span>
                  <DetailTimeline current={selected.stage} />
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 h-14 min-h-[56px] rounded-[var(--shape-lg)] text-sm font-medium bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors" onClick={() => toast.success('Order advanced to next stage')}>
                    Advance stage
                  </button>
                  <button className="flex-1 h-14 min-h-[56px] rounded-[var(--shape-lg)] text-sm font-medium border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors" onClick={() => toast('Issue flagged on order')}>
                    Flag issue
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}