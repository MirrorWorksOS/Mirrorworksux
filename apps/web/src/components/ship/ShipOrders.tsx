/**
 * Ship Orders — token-aligned to standard design system
 */
import React, { useCallback, useState } from 'react';
import { LayoutGrid, List, Truck } from 'lucide-react';
import { Card } from '../ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShipBillOfLading } from '@/components/ship/ShipBillOfLading';

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
      <span className="text-xs text-foreground font-medium tabular-nums">{order.id}</span>
      {order.urgent && (
        <StatusBadge priority="urgent">Urgent</StatusBadge>
      )}
    </div>
    <p className="text-sm text-foreground mb-0.5 font-medium">{order.customer}</p>
    <p className="text-xs text-[var(--neutral-500)] tabular-nums mb-4">{order.items} items · {order.weight}</p>
    <div className="h-1 bg-[var(--neutral-200)] rounded-full overflow-hidden mb-4">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${order.progress}%`, backgroundColor: order.progress === 100 ? 'var(--mw-mirage)' : 'var(--mw-yellow-400)' }}
      />
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--neutral-500)]">{order.carrier}</span>
      <span className={cn('text-[var(--neutral-500)]', (order.due === 'Today' || order.due === '1d') && 'text-foreground font-medium')}>
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
            <div className={cn('w-4 h-4 rounded-full shrink-0 z-10 border-2', done ? 'bg-[var(--mw-mirage)] border-[var(--mw-mirage)]' : 'bg-card border-[var(--border)]')} />
            <span className={cn('text-sm', done ? 'text-foreground font-medium' : 'text-[var(--neutral-400)]')}>{stage}</span>
          </div>
        );
      })}
    </div>
  );
};

const orderColumns: MwColumnDef<Order>[] = [
  { key: 'id', header: 'Order', tooltip: 'Shipping order number', cell: (o) => (
    <span className="font-medium tabular-nums text-foreground inline-flex items-center gap-1.5">
      <Truck className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
      {o.id}
    </span>
  ) },
  { key: 'customer', header: 'Customer', cell: (o) => <span className="text-foreground">{o.customer}</span> },
  { key: 'items', header: 'Items', tooltip: 'Number of items in order', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (o) => o.items },
  { key: 'weight', header: 'Weight', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (o) => o.weight },
  { key: 'carrier', header: 'Carrier', tooltip: 'Shipping carrier', cell: (o) => <span className="text-[var(--neutral-500)]">{o.carrier}</span> },
  { key: 'stage', header: 'Stage', tooltip: 'Current fulfilment stage', cell: (o) => <StatusBadge status={o.stage === 'Delivered' ? 'completed' : o.stage === 'Transit' ? 'progress' : o.stage === 'Ship' ? 'confirmed' : 'draft'}>{o.stage}</StatusBadge> },
  { key: 'due', header: 'Due', cell: (o) => <span className={cn('tabular-nums', (o.due === 'Today' || o.due === '1d') ? 'font-medium text-foreground' : 'text-[var(--neutral-500)]')}>{o.due}</span> },
  { key: 'progress', header: 'Progress', tooltip: 'Fulfilment progress', headerClassName: 'w-28', cell: (o) => <ProgressBar value={o.progress} size="sm" showLabel /> },
];

export function ShipOrders() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [bolOpen, setBolOpen] = useState(false);

  const handleKanbanDrop = useCallback((item: KanbanDragItem, columnId: string) => {
    setOrders(prev => prev.map(o => o.id === item.id ? { ...o, stage: columnId as Stage } : o));
  }, []);

  const pickCount = orders.filter(o => o.stage === 'Pick').length;
  const packCount = orders.filter(o => o.stage === 'Pack').length;
  const shipCount = orders.filter(o => o.stage === 'Ship').length;
  const urgentCount = orders.filter(o => o.urgent).length;

  return (
    <PageShell className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      <PageHeader title="Orders" />

      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'To Pick', value: pickCount, sub: 'Awaiting pick', bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'To Pack', value: packCount, sub: 'Ready to pack', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'To Ship', value: shipCount, sub: 'Awaiting dispatch', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Urgent', value: urgentCount, sub: 'Needs priority', bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
        ].map(s => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

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
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
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
                <p className="text-xl  font-medium text-foreground">{selected.id}</p>
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
                      <p className={cn('text-sm text-foreground mt-1 font-medium', f.l === 'Weight' && '')}>{f.v}</p>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[var(--neutral-200)]" />
                <div>
                  <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Progress</span>
                  <DetailTimeline current={selected.stage} />
                </div>
                <Dialog open={bolOpen} onOpenChange={setBolOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="mb-4 w-full h-12 rounded-full text-sm font-medium border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)] transition-colors"
                    >
                      View bill of lading
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Bill of lading</DialogTitle>
                    </DialogHeader>
                    <ShipBillOfLading />
                  </DialogContent>
                </Dialog>

                <div className="flex gap-4">
                  <button className="flex-1 h-14 min-h-[56px] rounded-full text-sm font-medium bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground transition-colors" onClick={() => toast.success('Order advanced to next stage')}>
                    Advance stage
                  </button>
                  <button className="flex-1 h-14 min-h-[56px] rounded-full text-sm font-medium border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)] transition-colors" onClick={() => toast('Issue flagged on order')}>
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