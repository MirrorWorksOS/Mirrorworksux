import React, { useState } from 'react';
import { Search, AlertTriangle, ExternalLink, Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';

const Y = '#FFCF4B';
const D = '#141414';

type Status = 'shipped' | 'transit' | 'delivering' | 'delivered' | 'exception';
const statusLabel: Record<Status, string> = {
  shipped: 'Shipped', transit: 'In Transit', delivering: 'Delivering', delivered: 'Delivered', exception: 'Exception',
};

interface Shipment {
  tracking: string; customer: string; carrier: string;
  status: Status; eta: string; updated: string;
}

const SHIPMENTS: Shipment[] = [
  { tracking: 'SP-001', customer: 'Con-form Group', carrier: 'StarTrack', status: 'transit', eta: '03 Mar', updated: '1h ago' },
  { tracking: 'SP-002', customer: 'Acme Steel', carrier: 'Toll', status: 'delivering', eta: 'Today', updated: '25m ago' },
  { tracking: 'SP-003', customer: 'Pacific Fab', carrier: 'Aus Post', status: 'delivered', eta: '—', updated: '28 Feb' },
  { tracking: 'SP-004', customer: 'Hunter Steel', carrier: 'TNT', status: 'exception', eta: 'Delayed', updated: '5h ago' },
  { tracking: 'SP-005', customer: 'BHP Contractors', carrier: 'DHL', status: 'delivered', eta: '—', updated: '27 Feb' },
  { tracking: 'SP-006', customer: 'Sydney Rail', carrier: 'StarTrack', status: 'transit', eta: '04 Mar', updated: '3h ago' },
  { tracking: 'SP-007', customer: 'Kemppi Welding', carrier: 'Sendle', status: 'shipped', eta: '06 Mar', updated: '1d ago' },
  { tracking: 'SP-008', customer: 'Oberon Eng', carrier: 'Aramex', status: 'exception', eta: 'Unknown', updated: '2d ago' },
];

const TIMELINE = [
  { step: 'Order Placed', time: '25 Feb 09:15', done: true },
  { step: 'Picked & Packed', time: '25 Feb 14:30', done: true },
  { step: 'Shipped', time: '25 Feb 16:00', done: true },
  { step: 'In Transit', time: '26 Feb 08:00', done: true, current: true },
  { step: 'Out for Delivery', time: 'Est. 03 Mar', done: false },
  { step: 'Delivered', time: '', done: false },
];

export function ShipTracking() {
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const filtered = exceptionsOnly ? SHIPMENTS.filter(s => s.status === 'exception') : SHIPMENTS;

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-[#141414] tracking-tight">Tracking</h4>
        <button onClick={() => setExceptionsOnly(!exceptionsOnly)}
          className={cn("h-10 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors",
            exceptionsOnly ? "bg-[#141414] text-white" : "border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA]")}
          style={{ fontWeight: 500 }}>
          <AlertTriangle className="w-4 h-4" /> Exceptions
        </button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C0C0]" strokeWidth={1.5} />
        <Input placeholder="Search tracking..." className="pl-10 h-11 bg-[#FAFAFA] border-0 rounded-lg text-sm" />
      </div>

      <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0F0F0]">
              {['TRACKING', 'CUSTOMER', 'CARRIER', 'STATUS', 'ETA', 'UPDATED'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest text-[#A0A0A0] uppercase" style={{ fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.tracking} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] cursor-pointer transition-colors" onClick={() => setSelected(s)}>
                <td className="px-4 py-3.5 text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{s.tracking}</td>
                <td className="px-4 py-3.5 text-sm text-[#141414]">{s.customer}</td>
                <td className="px-4 py-3.5 text-sm text-[#8A8A8A]">{s.carrier}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", s.status === 'exception' ? "bg-[#141414]" : s.status === 'delivered' ? "bg-[#FFCF4B]" : "bg-[#D4D4D4]")} />
                    <span className="text-xs text-[#8A8A8A]">{statusLabel[s.status]}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#8A8A8A]" style={{ fontWeight: s.eta === 'Today' ? 500 : 400, color: s.eta === 'Delayed' || s.eta === 'Unknown' ? D : undefined }}>{s.eta}</td>
                <td className="px-4 py-3.5 text-xs text-[#A0A0A0]">{s.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[#F0F0F0]">
          {selected && (
            <>
              <SheetHeader className="p-8 pb-6">
                <SheetTitle className="text-xl" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{selected.tracking}</SheetTitle>
                <SheetDescription>{selected.customer} · {selected.carrier}</SheetDescription>
              </SheetHeader>
              <div className="px-8 pb-8 space-y-6">
                {/* Timeline */}
                <div>
                  <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Timeline</span>
                  <div className="space-y-0 relative mt-3">
                    <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#E8E8E8]" />
                    {TIMELINE.map((evt, i) => (
                      <div key={i} className="flex items-start gap-4 relative py-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full shrink-0 z-10 border-2",
                          evt.done ? "bg-[#141414] border-[#141414]" : "bg-white border-[#D4D4D4]",
                          evt.current && "ring-4 ring-[#FFCF4B]/30"
                        )} />
                        <div>
                          <p className={cn("text-sm", evt.done ? "text-[#141414]" : "text-[#C0C0C0]")} style={{ fontWeight: evt.current ? 500 : 400 }}>{evt.step}</p>
                          {evt.time && <span className="text-xs text-[#A0A0A0]">{evt.time}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-[#FAFAFA] rounded-lg p-4 space-y-2">
                  {[
                    { l: 'Weight', v: '12.4 kg' },
                    { l: 'Dims', v: '45×35×25 cm' },
                    { l: 'Address', v: '45 Industrial Dr, Silverwater NSW' },
                  ].map(d => (
                    <div key={d.l} className="flex justify-between text-sm">
                      <span className="text-[#8A8A8A]">{d.l}</span>
                      <span className="text-[#141414]" style={{ fontFamily: d.l === 'Weight' || d.l === 'Dims' ? 'Roboto Mono, monospace' : undefined, fontWeight: 500 }}>{d.v}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <button className="w-full h-12 rounded-lg text-sm bg-[#FFCF4B] text-[#141414] hover:bg-[#F2BF30] transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 500 }}>
                    <Send className="w-4 h-4" /> Notify Customer
                  </button>
                  <button className="w-full h-12 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 500 }}>
                    <ExternalLink className="w-4 h-4" /> Carrier Portal
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
