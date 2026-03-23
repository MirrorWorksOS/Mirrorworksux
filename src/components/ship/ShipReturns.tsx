/**
 * Ship Returns — RMA management
 * Token-aligned: #141414 → #0A0A0A, #F0F0F0 → #E5E5E5, #8A8A8A → #737373
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
  pending:    { label: 'Pending',    badge: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]', dot: '#FF8B00' },
  approved:   { label: 'Approved',   badge: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', dot: '#0A7AFF' },
  in_transit: { label: 'In Transit', badge: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', dot: '#0A7AFF' },
  received:   { label: 'Received',   badge: 'bg-[var(--warm-200)]', text: 'text-[#1A2732]', dot: '#1A2732' },
  refunded:   { label: 'Refunded',   badge: 'bg-[var(--warm-200)]', text: 'text-[#1A2732]', dot: '#1A2732' },
  closed:     { label: 'Closed',     badge: 'bg-[#F5F5F5]', text: 'text-[#737373]', dot: '#737373' },
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
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Returns</h1>
        <button className="h-10 px-5 rounded-lg text-sm bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] transition-colors flex items-center gap-2 font-medium">
          <PlusCircle className="w-4 h-4" /> Create RMA
        </button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" strokeWidth={1.5} />
        <Input placeholder="Search returns..." className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Table */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
                {['RMA', 'CUSTOMER', 'REASON', 'STATUS', 'DATE', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RMAS.map(r => {
                const cfg = rStatusConfig[r.status];
                return (
                  <tr key={r.id} className="border-b border-[#F5F5F5] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors" onClick={() => setSelected(r)}>
                    <td className="px-4 py-3 text-sm  font-medium text-[#1A2732]">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-[#1A2732]">{r.customer}</td>
                    <td className="px-4 py-3 text-xs text-[#737373]">{r.reason}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373]">{r.date}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-[#E5E5E5]" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
            <span className="text-xs text-[#737373] tracking-widest uppercase font-medium">This Month</span>
            <div className="text-3xl text-[#1A2732] mt-1  font-semibold">12</div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
            <span className="text-xs text-[#737373] tracking-widest uppercase font-medium block mb-3">Top Reasons</span>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={REASONS} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 10, fill: '#737373' }} width={70} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar key="count" dataKey="count" fill="#0A0A0A" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
            <span className="text-xs text-[#737373] tracking-widest uppercase font-medium">Avg Processing</span>
            <div className="text-3xl text-[#1A2732] mt-1  font-semibold">
              4.2<span className="text-sm text-[#737373] ml-1">days</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
            <span className="text-xs text-[#737373] tracking-widest uppercase font-medium">Return Rate</span>
            <div className="text-3xl text-[#1A2732] mt-1  font-semibold">2.8%</div>
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
                  <p className="text-xl  font-medium text-[#1A2732]">{selected.id}</p>
                  <SheetDescription className="text-[#737373]">{selected.customer} · {selected.reason}</SheetDescription>
                </SheetHeader>
                <div className="px-6 py-6 space-y-6">
                  <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#737373]">Order</span><span className=" font-medium">{selected.order}</span></div>
                    <div className="flex justify-between"><span className="text-[#737373]">Items</span><span className=" font-medium">{selected.items}</span></div>
                    <div className="flex justify-between"><span className="text-[#737373]">Created</span><span>{selected.date}</span></div>
                  </div>

                  <div>
                    <span className="text-xs text-[#737373] tracking-widest uppercase font-medium">Progress</span>
                    <div className="space-y-0 relative mt-3">
                      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#E5E5E5]" />
                      {TIMELINE_STAGES.map((stage, i) => {
                        const idx = TIMELINE_STAGES.indexOf(selected.status);
                        const done = i <= idx;
                        const stageCfg = rStatusConfig[stage];
                        return (
                          <div key={stage} className="flex items-center gap-4 relative py-2.5">
                            <div className={cn(
                              'w-4 h-4 rounded-full shrink-0 z-10 border-2 transition-colors',
                              done ? 'bg-[#1A2732] border-[#1A2732]' : 'bg-white border-[var(--border)]'
                            )} />
                            <span className={cn('text-sm', done ? 'text-[#1A2732] font-medium' : 'text-[#A3A3A3]')}>
                              {stageCfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {selected.status === 'pending' && (
                      <button className="w-full h-11 rounded-lg text-sm bg-[#1A2732] text-white hover:bg-[#2C2C2C] transition-colors font-medium">
                        Approve return
                      </button>
                    )}
                    {selected.status === 'received' && (
                      <button className="w-full h-11 rounded-lg text-sm bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] transition-colors font-medium">
                        Process refund
                      </button>
                    )}
                    <button className="w-full h-11 rounded-lg text-sm border border-[var(--border)] text-[#1A2732] hover:bg-[#F5F5F5] transition-colors font-medium">
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