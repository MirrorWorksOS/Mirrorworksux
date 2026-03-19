import React, { useState } from 'react';
import { Search, PlusCircle, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const Y = '#FFCF4B';
const D = '#141414';

type RStatus = 'pending' | 'approved' | 'in_transit' | 'received' | 'refunded' | 'closed';
const rStatusLabel: Record<RStatus, string> = {
  pending: 'Pending', approved: 'Approved', in_transit: 'In Transit',
  received: 'Received', refunded: 'Refunded', closed: 'Closed',
};

interface RMA {
  id: string; order: string; customer: string; items: number; reason: string; status: RStatus; date: string;
}

const RMAS: RMA[] = [
  { id: 'RMA-001', order: 'SH-038', customer: 'Oberon Eng', items: 2, reason: 'Defective', status: 'pending', date: '01 Mar' },
  { id: 'RMA-002', order: 'SH-035', customer: 'Hunter Steel', items: 1, reason: 'Wrong Item', status: 'approved', date: '28 Feb' },
  { id: 'RMA-003', order: 'SH-030', customer: 'Pacific Fab', items: 3, reason: 'Damaged', status: 'in_transit', date: '25 Feb' },
  { id: 'RMA-004', order: 'SH-028', customer: 'Acme Steel', items: 1, reason: 'Change of Mind', status: 'received', date: '22 Feb' },
  { id: 'RMA-005', order: 'SH-025', customer: 'Con-form Group', items: 2, reason: 'Defective', status: 'refunded', date: '20 Feb' },
  { id: 'RMA-006', order: 'SH-020', customer: 'Sydney Rail', items: 4, reason: 'Damaged', status: 'closed', date: '15 Feb' },
];

const REASONS = [
  { reason: 'Defective', count: 8 }, { reason: 'Damaged', count: 5 },
  { reason: 'Wrong Item', count: 4 }, { reason: 'Other', count: 2 },
];

const TIMELINE: RStatus[] = ['pending', 'approved', 'in_transit', 'received', 'refunded', 'closed'];

export function ShipReturns() {
  const [selected, setSelected] = useState<RMA | null>(null);

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-[#141414] tracking-tight">Returns</h4>
        <button className="h-10 px-5 rounded-lg text-sm bg-[#FFCF4B] text-[#141414] hover:bg-[#F2BF30] transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
          <PlusCircle className="w-4 h-4" /> Create RMA
        </button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C0C0]" strokeWidth={1.5} />
        <Input placeholder="Search returns..." className="pl-10 h-11 bg-[#FAFAFA] border-0 rounded-lg text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                {['RMA', 'CUSTOMER', 'REASON', 'STATUS', 'DATE', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest text-[#A0A0A0] uppercase" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RMAS.map(r => (
                <tr key={r.id} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] cursor-pointer transition-colors" onClick={() => setSelected(r)}>
                  <td className="px-4 py-3.5 text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{r.id}</td>
                  <td className="px-4 py-3.5 text-sm text-[#141414]">{r.customer}</td>
                  <td className="px-4 py-3.5 text-xs text-[#8A8A8A]">{r.reason}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", ['closed', 'refunded'].includes(r.status) ? "bg-[#FFCF4B]" : "bg-[#D4D4D4]")} />
                      <span className="text-xs text-[#8A8A8A]">{rStatusLabel[r.status]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#8A8A8A]">{r.date}</td>
                  <td className="px-4 py-3.5"><ChevronRight className="w-4 h-4 text-[#D4D4D4]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-[#F0F0F0]">
            <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>This Month</span>
            <div className="text-3xl text-[#141414] mt-1" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>12</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#F0F0F0]">
            <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase mb-3 block" style={{ fontWeight: 500 }}>Top Reasons</span>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={REASONS} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 10, fill: '#8A8A8A' }} width={70} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill={D} radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#F0F0F0]">
            <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Avg Processing</span>
            <div className="text-3xl text-[#141414] mt-1" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>4.2<span className="text-sm text-[#8A8A8A] ml-1">days</span></div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#F0F0F0]">
            <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Return Rate</span>
            <div className="text-3xl text-[#141414] mt-1" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>2.8%</div>
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[#F0F0F0]">
          {selected && (
            <>
              <SheetHeader className="p-8 pb-6">
                <SheetTitle className="text-xl" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{selected.id}</SheetTitle>
                <SheetDescription>{selected.customer} · {selected.reason}</SheetDescription>
              </SheetHeader>
              <div className="px-8 pb-8 space-y-6">
                <div className="bg-[#FAFAFA] rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#8A8A8A]">Order</span><span style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{selected.order}</span></div>
                  <div className="flex justify-between"><span className="text-[#8A8A8A]">Items</span><span style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{selected.items}</span></div>
                  <div className="flex justify-between"><span className="text-[#8A8A8A]">Created</span><span>{selected.date}</span></div>
                </div>

                <div>
                  <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Progress</span>
                  <div className="space-y-0 relative mt-3">
                    <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#E8E8E8]" />
                    {TIMELINE.map((stage, i) => {
                      const idx = TIMELINE.indexOf(selected.status);
                      const done = i <= idx;
                      return (
                        <div key={stage} className="flex items-center gap-4 relative py-2.5">
                          <div className={cn("w-4 h-4 rounded-full shrink-0 z-10 border-2", done ? "bg-[#141414] border-[#141414]" : "bg-white border-[#D4D4D4]")} />
                          <span className={cn("text-sm", done ? "text-[#141414]" : "text-[#C0C0C0]")} style={{ fontWeight: done ? 500 : 400 }}>{rStatusLabel[stage]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {selected.status === 'pending' && (
                    <button className="w-full h-12 rounded-lg text-sm bg-[#141414] text-white transition-colors" style={{ fontWeight: 500 }}>Approve Return</button>
                  )}
                  {selected.status === 'received' && (
                    <button className="w-full h-12 rounded-lg text-sm bg-[#FFCF4B] text-[#141414] transition-colors" style={{ fontWeight: 500 }}>Process Refund</button>
                  )}
                  <button className="w-full h-12 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors" style={{ fontWeight: 500 }}>Contact Customer</button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
