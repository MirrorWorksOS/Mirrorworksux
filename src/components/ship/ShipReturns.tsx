/**
 * Ship Returns — RMA management
 * Token-aligned: #141414 → var(--neutral-900), #F0F0F0 → var(--neutral-200), #8A8A8A → var(--neutral-500)
 * Status dots now use semantic colours
 */
import React, { useState } from 'react';
import { Search, PlusCircle, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

type RStatus = 'pending' | 'approved' | 'in_transit' | 'received' | 'refunded' | 'closed';

const rStatusConfig: Record<RStatus, { label: string; badge: string; text: string; dot: string }> = {
  pending:    { label: 'Pending',    badge: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', dot: 'var(--mw-amber)' },
  approved:   { label: 'Approved',   badge: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', dot: 'var(--mw-blue)' },
  in_transit: { label: 'In Transit', badge: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', dot: 'var(--mw-blue)' },
  received:   { label: 'Received',   badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--mw-mirage)' },
  refunded:   { label: 'Refunded',   badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--mw-mirage)' },
  closed:     { label: 'Closed',     badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', dot: 'var(--neutral-500)' },
};

interface RMA {
  id: string; order: string; customer: string; items: number; reason: string; status: RStatus; date: string;
}

const RMAS: RMA[] = [
  { id: 'RMA-001', order: 'SH-038', customer: 'Oberon Eng',     items: 2, reason: 'Defective',     status: 'pending',    date: '01 Mar' },
  { id: 'RMA-002', order: 'SH-035', customer: 'Hunter Steel',   items: 1, reason: 'Wrong Item',    status: 'approved',   date: '28 Feb' },
  { id: 'RMA-003', order: 'SH-030', customer: 'Pacific Fab',    items: 3, reason: 'Damaged',       status: 'in_transit', date: '25 Feb' },
  { id: 'RMA-004', order: 'SH-028', customer: 'Acme Steel',     items: 1, reason: 'Change of Mind',status: 'received',   date: '22 Feb' },
  { id: 'RMA-005', order: 'SH-025', customer: 'Con-form Group', items: 2, reason: 'Defective',     status: 'refunded',   date: '20 Feb' },
  { id: 'RMA-006', order: 'SH-020', customer: 'Sydney Rail',    items: 4, reason: 'Damaged',       status: 'closed',     date: '15 Feb' },
];

const REASONS = [
  { reason: 'Defective',  count: 8 },
  { reason: 'Damaged',    count: 5 },
  { reason: 'Wrong Item', count: 4 },
  { reason: 'Other',      count: 2 },
];

const TIMELINE_STAGES: RStatus[] = ['pending', 'approved', 'in_transit', 'received', 'refunded', 'closed'];

export function ShipReturns() {
  const [selected, setSelected] = useState<RMA | null>(null);

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Returns</h1>
        <button className="h-10 px-5 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors flex items-center gap-2 font-medium">
          <PlusCircle className="w-4 h-4" /> Create RMA
        </button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
        <Input placeholder="Search returns..." className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Table */}
        <div className="lg:col-span-3 bg-white rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                {['RMA', 'CUSTOMER', 'REASON', 'STATUS', 'DATE', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RMAS.map(r => {
                const cfg = rStatusConfig[r.status];
                return (
                  <tr key={r.id} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors" onClick={() => setSelected(r)}>
                    <td className="px-4 py-3 text-sm font-medium tabular-nums text-[var(--mw-mirage)]">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-[var(--mw-mirage)]">{r.customer}</td>
                    <td className="px-4 py-3 text-xs text-[var(--neutral-500)]">{r.reason}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--neutral-500)]">{r.date}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-[var(--neutral-200)]" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">This month</span>
            <div className="text-3xl text-[var(--mw-mirage)] mt-1 font-semibold tabular-nums">12</div>
          </div>
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium block mb-4">Top reasons</span>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={REASONS} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 10, fill: 'var(--neutral-500)' }} width={70} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar key="count" dataKey="count" fill="var(--mw-mirage)" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Avg processing</span>
            <div className="text-3xl text-[var(--mw-mirage)] mt-1 font-semibold tabular-nums">
              4.2<span className="text-sm text-[var(--neutral-500)] ml-1">days</span>
            </div>
          </div>
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Return rate</span>
            <div className="text-3xl text-[var(--mw-mirage)] mt-1 font-semibold tabular-nums">2.8%</div>
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Return details</SheetTitle>
          {selected && (() => {
            const cfg = rStatusConfig[selected.status];
            return (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
                  <p className="text-xl  font-medium text-[var(--mw-mirage)]">{selected.id}</p>
                  <SheetDescription className="text-[var(--neutral-500)]">{selected.customer} · {selected.reason}</SheetDescription>
                </SheetHeader>
                <div className="px-6 py-6 space-y-6">
                  <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[var(--neutral-500)]">Order</span><span className="font-medium tabular-nums">{selected.order}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--neutral-500)]">Items</span><span className="font-medium tabular-nums">{selected.items}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--neutral-500)]">Created</span><span>{selected.date}</span></div>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Progress</span>
                    <div className="space-y-0 relative mt-3">
                      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[var(--neutral-200)]" />
                      {TIMELINE_STAGES.map((stage, i) => {
                        const idx = TIMELINE_STAGES.indexOf(selected.status);
                        const done = i <= idx;
                        const stageCfg = rStatusConfig[stage];
                        return (
                          <div key={stage} className="flex items-center gap-4 relative py-2">
                            <div className={cn(
                              'w-4 h-4 rounded-full shrink-0 z-10 border-2 transition-colors',
                              done ? 'bg-[var(--mw-mirage)] border-[var(--mw-mirage)]' : 'bg-white border-[var(--border)]'
                            )} />
                            <span className={cn('text-sm', done ? 'text-[var(--mw-mirage)] font-medium' : 'text-[var(--neutral-400)]')}>
                              {stageCfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {selected.status === 'pending' && (
                      <button className="w-full h-11 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-mirage)] text-white hover:bg-[var(--neutral-800)] transition-colors font-medium">
                        Approve return
                      </button>
                    )}
                    {selected.status === 'received' && (
                      <button className="w-full h-11 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors font-medium">
                        Process refund
                      </button>
                    )}
                    <button className="w-full h-11 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors font-medium">
                      Contact customer
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}