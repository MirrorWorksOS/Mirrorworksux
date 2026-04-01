/**
 * Ship Orders — token-aligned to standard design system
 */
import React, { useState } from 'react';
import { Search, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
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

const STAGES: Stage[] = ['Pick', 'Pack', 'Ship', 'Transit', 'Delivered'];

const OrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      'bg-white rounded-[var(--shape-lg)] p-4 cursor-pointer transition-all duration-[var(--duration-short2)] border hover:shadow-md',
      order.urgent ? 'border-[var(--mw-yellow-400)]' : 'border-[var(--border)] hover:border-[var(--neutral-300)]'
    )}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-[var(--mw-mirage)] font-medium tabular-nums">{order.id}</span>
      {order.urgent && <div className="w-2 h-2 rounded-full bg-[var(--mw-error)]" />}
    </div>
    <p className="text-sm text-[var(--mw-mirage)] mb-0.5 font-medium">{order.customer}</p>
    <p className="text-xs text-[var(--neutral-500)] tabular-nums mb-4">{order.items} items · {order.weight}</p>
    <div className="h-1 bg-[var(--neutral-200)] rounded-full overflow-hidden mb-4">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${order.progress}%`, backgroundColor: order.progress === 100 ? 'var(--mw-success)' : 'var(--mw-yellow-400)' }}
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
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <PageShell className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Orders"
        actions={
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
              <Input placeholder="Search orders..." className="pl-10 h-12 min-h-[48px] bg-[var(--neutral-100)] border-transparent rounded-xl text-sm" />
            </div>
            <IconViewToggle
              value={view}
              onChange={(k) => setView(k as 'kanban' | 'list')}
              options={[
                { key: 'kanban', icon: LayoutGrid, label: 'Kanban view' },
                { key: 'list', icon: List, label: 'List view' },
              ]}
            />
          </div>
        }
      />

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden min-h-0 pb-4">
          {STAGES.map(stage => {
            const stageOrders = ORDERS.filter(o => o.stage === stage);
            return (
              <div key={stage} className="min-w-[260px] max-w-[320px] flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">{stage}</span>
                  <span className="text-xs text-[var(--neutral-400)] ">{stageOrders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                  {stageOrders.map(order => (
                    <OrderCard key={order.id} order={order} onClick={() => setSelected(order)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <div className="flex-1 overflow-auto bg-white rounded-[var(--shape-lg)] border border-[var(--border)]">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                {['ORDER', 'CUSTOMER', 'ITEMS', 'CARRIER', 'DUE', 'STAGE'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors" onClick={() => setSelected(o)}>
                  <td className="px-4 py-3 text-sm font-medium tabular-nums text-[var(--mw-mirage)]">{o.id}</td>
                  <td className="px-4 py-3 text-sm text-[var(--mw-mirage)]">{o.customer}</td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-500)] tabular-nums">{o.items}</td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-500)]">{o.carrier}</td>
                  <td className={cn('px-4 py-3 text-sm text-[var(--neutral-500)]', o.due === 'Today' ? 'font-medium' : 'font-normal')}>{o.due}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs tracking-widest uppercase text-[var(--neutral-500)] font-medium">{o.stage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <button className="flex-1 h-12 min-h-[48px] rounded-[var(--shape-lg)] text-sm font-medium bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors" onClick={() => toast.success('Order advanced to next stage')}>
                    Advance stage
                  </button>
                  <button className="flex-1 h-12 min-h-[48px] rounded-[var(--shape-lg)] text-sm font-medium border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors" onClick={() => toast('Issue flagged on order')}>
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