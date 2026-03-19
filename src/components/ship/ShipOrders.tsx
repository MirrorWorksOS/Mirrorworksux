import React, { useState } from 'react';
import { Search, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';

const Y = '#FFCF4B';
const D = '#141414';

type Stage = 'Pick' | 'Pack' | 'Ship' | 'Transit' | 'Delivered';

interface Order {
  id: string; customer: string; items: number; weight: string;
  carrier: string; due: string; stage: Stage; progress: number;
  urgent?: boolean;
}

const ORDERS: Order[] = [
  { id: 'SH-001', customer: 'Con-form Group', items: 3, weight: '12.4 kg', carrier: 'StarTrack', due: '2d', stage: 'Pick', progress: 0, urgent: true },
  { id: 'SH-002', customer: 'Acme Steel', items: 1, weight: '45.0 kg', carrier: 'Toll', due: '1d', stage: 'Pick', progress: 0, urgent: true },
  { id: 'SH-003', customer: 'Pacific Fab', items: 5, weight: '8.2 kg', carrier: 'Aus Post', due: '4d', stage: 'Pack', progress: 40 },
  { id: 'SH-004', customer: 'Hunter Steel', items: 2, weight: '22.1 kg', carrier: 'TNT', due: '3d', stage: 'Pack', progress: 60 },
  { id: 'SH-005', customer: 'BHP Contractors', items: 8, weight: '34.5 kg', carrier: 'DHL', due: '2d', stage: 'Ship', progress: 95, urgent: true },
  { id: 'SH-006', customer: 'Sydney Rail', items: 4, weight: '18.9 kg', carrier: 'StarTrack', due: '1d', stage: 'Ship', progress: 95 },
  { id: 'SH-007', customer: 'Lincoln Electric', items: 6, weight: '28.7 kg', carrier: 'Toll', due: 'Today', stage: 'Transit', progress: 100 },
  { id: 'SH-008', customer: 'Dulux Coatings', items: 3, weight: '9.4 kg', carrier: 'TNT', due: '—', stage: 'Delivered', progress: 100 },
  { id: 'SH-009', customer: 'Kemppi Welding', items: 2, weight: '6.3 kg', carrier: 'Sendle', due: '5d', stage: 'Pick', progress: 0 },
];

const STAGES: Stage[] = ['Pick', 'Pack', 'Ship', 'Transit', 'Delivered'];
const ALL_STAGES: Stage[] = ['Pick', 'Pack', 'Ship', 'Transit', 'Delivered'];

const OrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white rounded-lg p-4 cursor-pointer transition-all duration-150 border",
      order.urgent ? "border-[#FFCF4B]" : "border-[#F0F0F0] hover:border-[#D4D4D4]"
    )}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-[#141414]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{order.id}</span>
      {order.urgent && <div className="w-2 h-2 rounded-full bg-[#FFCF4B]" />}
    </div>
    <p className="text-sm text-[#141414] mb-0.5">{order.customer}</p>
    <p className="text-xs text-[#8A8A8A] mb-3">{order.items} items · {order.weight}</p>
    <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden mb-3">
      <div className="h-full rounded-full transition-all" style={{ width: `${order.progress}%`, backgroundColor: order.progress === 100 ? D : Y }} />
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#8A8A8A]">{order.carrier}</span>
      <span className={cn(order.due === 'Today' || order.due === '1d' ? 'text-[#141414]' : 'text-[#8A8A8A]')} style={{ fontWeight: order.due === 'Today' ? 500 : 400 }}>{order.due}</span>
    </div>
  </div>
);

const DetailTimeline = ({ current }: { current: Stage }) => {
  const idx = ALL_STAGES.indexOf(current);
  return (
    <div className="space-y-0 relative py-2">
      <div className="absolute left-[7px] top-5 bottom-5 w-px bg-[#E8E8E8]" />
      {ALL_STAGES.map((stage, i) => {
        const done = i <= idx;
        return (
          <div key={stage} className="flex items-center gap-4 relative py-3">
            <div className={cn("w-4 h-4 rounded-full shrink-0 z-10 border-2", done ? "bg-[#141414] border-[#141414]" : "bg-white border-[#D4D4D4]")} />
            <span className={cn("text-sm", done ? "text-[#141414]" : "text-[#C0C0C0]")} style={{ fontWeight: done ? 500 : 400 }}>{stage}</span>
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
    <div className="p-8 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h4 className="text-[#141414] tracking-tight">Orders</h4>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C0C0]" strokeWidth={1.5} />
            <Input placeholder="Search orders..." className="pl-10 h-11 bg-[#FAFAFA] border-0 rounded-lg text-sm" />
          </div>
          <div className="flex bg-[#FAFAFA] rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={cn("p-2 rounded-md transition-colors", view === 'kanban' ? 'bg-[#141414] text-white' : 'text-[#8A8A8A]')}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={cn("p-2 rounded-md transition-colors", view === 'list' ? 'bg-[#141414] text-white' : 'text-[#8A8A8A]')}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden min-h-0 pb-4">
          {STAGES.map(stage => {
            const stageOrders = ORDERS.filter(o => o.stage === stage);
            return (
              <div key={stage} className="min-w-[260px] max-w-[320px] flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-xs text-[#8A8A8A] tracking-widest uppercase" style={{ fontWeight: 500 }}>{stage}</span>
                  <span className="text-xs text-[#C0C0C0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{stageOrders.length}</span>
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
        <div className="flex-1 overflow-auto bg-white rounded-xl border border-[#F0F0F0]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                {['ORDER', 'CUSTOMER', 'ITEMS', 'CARRIER', 'DUE', 'STAGE'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest text-[#A0A0A0] uppercase" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o, i) => (
                <tr key={o.id} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] cursor-pointer transition-colors" onClick={() => setSelected(o)}>
                  <td className="px-4 py-3 text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{o.id}</td>
                  <td className="px-4 py-3 text-sm text-[#141414]">{o.customer}</td>
                  <td className="px-4 py-3 text-sm text-[#8A8A8A]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{o.items}</td>
                  <td className="px-4 py-3 text-sm text-[#8A8A8A]">{o.carrier}</td>
                  <td className="px-4 py-3 text-sm" style={{ fontWeight: o.due === 'Today' ? 500 : 400 }}>{o.due}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] tracking-widest uppercase text-[#8A8A8A]" style={{ fontWeight: 500 }}>{o.stage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[#F0F0F0]">
          {selected && (
            <>
              <SheetHeader className="p-8 pb-6">
                <SheetTitle className="text-xl" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{selected.id}</SheetTitle>
                <SheetDescription className="text-[#8A8A8A]">{selected.customer}</SheetDescription>
              </SheetHeader>
              <div className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { l: 'Items', v: `${selected.items}` },
                    { l: 'Weight', v: selected.weight },
                    { l: 'Carrier', v: selected.carrier },
                    { l: 'Due', v: selected.due },
                  ].map(f => (
                    <div key={f.l}>
                      <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>{f.l}</span>
                      <p className="text-sm text-[#141414] mt-1" style={{ fontFamily: f.l === 'Weight' ? 'Roboto Mono, monospace' : undefined, fontWeight: 500 }}>{f.v}</p>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[#F0F0F0]" />
                <div>
                  <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Progress</span>
                  <DetailTimeline current={selected.stage} />
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 h-12 rounded-lg text-sm transition-colors" style={{ backgroundColor: Y, color: D, fontWeight: 500 }}>Advance Stage</button>
                  <button className="flex-1 h-12 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors" style={{ fontWeight: 500 }}>Flag Issue</button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
