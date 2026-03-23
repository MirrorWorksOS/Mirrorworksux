/**
 * Ship Tracking — token-aligned
 * Status dots now use proper semantic colours (green=delivered, red=exception, blue=transit)
 */
import React, { useState } from 'react';
import { Search, AlertTriangle, ExternalLink, Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';

type Status = 'shipped' | 'transit' | 'delivering' | 'delivered' | 'exception';

const statusConfig: Record<Status, { label: string; dot: string; badge: string; text: string }> = {
  shipped:    { label: 'Shipped',     dot: '#A3A3A3', badge: 'bg-[#F5F5F5]',  text: 'text-[#737373]' },
  transit:    { label: 'In Transit',  dot: '#0A7AFF', badge: 'bg-[#DBEAFE]',  text: 'text-[#0A7AFF]' },
  delivering: { label: 'Delivering',  dot: '#FF8B00', badge: 'bg-[#FFEDD5]',  text: 'text-[#FF8B00]' },
  delivered:  { label: 'Delivered',   dot: '#1A2732', badge: 'bg-[var(--warm-200)]',  text: 'text-[#1A2732]' },
  exception:  { label: 'Exception',   dot: '#EF4444', badge: 'bg-[#FEE2E2]',  text: 'text-[#EF4444]' },
};

interface Shipment {
  tracking: string; customer: string; carrier: string;
  status: Status; eta: string; updated: string;
}

const SHIPMENTS: Shipment[] = [
  { tracking: 'SP-001', customer: 'Con-form Group', carrier: 'StarTrack', status: 'transit',    eta: '03 Mar',  updated: '1h ago' },
  { tracking: 'SP-002', customer: 'Acme Steel',     carrier: 'Toll',      status: 'delivering', eta: 'Today',   updated: '25m ago' },
  { tracking: 'SP-003', customer: 'Pacific Fab',    carrier: 'Aus Post',  status: 'delivered',  eta: '—',       updated: '28 Feb' },
  { tracking: 'SP-004', customer: 'Hunter Steel',   carrier: 'TNT',       status: 'exception',  eta: 'Delayed', updated: '5h ago' },
  { tracking: 'SP-005', customer: 'BHP Contractors',carrier: 'DHL',       status: 'delivered',  eta: '—',       updated: '27 Feb' },
  { tracking: 'SP-006', customer: 'Sydney Rail',    carrier: 'StarTrack', status: 'transit',    eta: '04 Mar',  updated: '3h ago' },
  { tracking: 'SP-007', customer: 'Kemppi Welding', carrier: 'Sendle',    status: 'shipped',    eta: '06 Mar',  updated: '1d ago' },
  { tracking: 'SP-008', customer: 'Oberon Eng',     carrier: 'Aramex',    status: 'exception',  eta: 'Unknown', updated: '2d ago' },
];

const TIMELINE = [
  { step: 'Order Placed',     time: '25 Feb 09:15', done: true },
  { step: 'Picked & Packed',  time: '25 Feb 14:30', done: true },
  { step: 'Shipped',          time: '25 Feb 16:00', done: true },
  { step: 'In Transit',       time: '26 Feb 08:00', done: true,  current: true },
  { step: 'Out for Delivery', time: 'Est. 03 Mar',  done: false },
  { step: 'Delivered',        time: '',             done: false },
];

export function ShipTracking() {
  const [selected, setSelected]               = useState<Shipment | null>(null);
  const [exceptionsOnly, setExceptionsOnly]   = useState(false);
  const filtered = exceptionsOnly ? SHIPMENTS.filter(s => s.status === 'exception') : SHIPMENTS;

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Tracking</h1>
        <button
          onClick={() => setExceptionsOnly(!exceptionsOnly)}
          className={cn(
            'h-10 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors font-medium',
            exceptionsOnly
              ? 'bg-[#FEE2E2] text-[#EF4444]'
              : 'border border-[var(--border)] text-[#1A2732] hover:bg-[#F5F5F5]'
          )}
        >
          <AlertTriangle className="w-4 h-4" /> Exceptions
        </button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" strokeWidth={1.5} />
        <Input placeholder="Search tracking..." className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm" />
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
              {['TRACKING', 'CUSTOMER', 'CARRIER', 'STATUS', 'ETA', 'UPDATED'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const cfg = statusConfig[s.status];
              return (
                <tr
                  key={s.tracking}
                  className="border-b border-[#F5F5F5] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors"
                  onClick={() => setSelected(s)}
                >
                  <td className="px-4 py-3 text-sm  font-medium text-[#1A2732]">{s.tracking}</td>
                  <td className="px-4 py-3 text-sm text-[#1A2732]">{s.customer}</td>
                  <td className="px-4 py-3 text-sm text-[#737373]">{s.carrier}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>{cfg.label}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#737373]" style={{ fontWeight: s.eta === 'Today' ? 600 : 400, color: s.status === 'exception' ? '#EF4444' : undefined }}>
                    {s.eta}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#737373]">{s.updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Tracking details</SheetTitle>
          {selected && (() => {
            const cfg = statusConfig[selected.status];
            return (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
                  <p className="text-xl  font-medium text-[#1A2732]">{selected.tracking}</p>
                  <SheetDescription className="text-[#737373]">{selected.customer} · {selected.carrier}</SheetDescription>
                </SheetHeader>
                <div className="px-6 py-6 space-y-6">
                  {/* Timeline */}
                  <div>
                    <span className="text-xs text-[#737373] tracking-widest uppercase font-medium">Timeline</span>
                    <div className="space-y-0 relative mt-3">
                      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#E5E5E5]" />
                      {TIMELINE.map((evt, i) => (
                        <div key={i} className="flex items-start gap-4 relative py-3">
                          <div className={cn(
                            'w-4 h-4 rounded-full shrink-0 z-10 border-2',
                            evt.done ? 'bg-[#1A2732] border-[#1A2732]' : 'bg-white border-[var(--border)]',
                            evt.current && 'ring-4 ring-[#FFCF4B]/30'
                          )} />
                          <div>
                            <p className={cn('text-sm', evt.done ? 'text-[#1A2732]' : 'text-[#A3A3A3]')} style={{ fontWeight: evt.current ? 600 : 400 }}>
                              {evt.step}
                            </p>
                            {evt.time && <span className="text-xs text-[#737373]">{evt.time}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-2">
                    {[
                      { l: 'Weight',  v: '12.4 kg',                          mono: true },
                      { l: 'Dims',    v: '45×35×25 cm',                      mono: true },
                      { l: 'Address', v: '45 Industrial Dr, Silverwater NSW', mono: false },
                    ].map(d => (
                      <div key={d.l} className="flex justify-between text-sm">
                        <span className="text-[#737373]">{d.l}</span>
                        <span className={cn('text-[#1A2732] font-medium', d.mono && 'font-[\'Roboto_Mono\',monospace]')}>{d.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <button className="w-full h-11 rounded-lg text-sm bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] transition-colors font-medium flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Notify customer
                    </button>
                    <button className="w-full h-11 rounded-lg text-sm border border-[var(--border)] text-[#1A2732] hover:bg-[#F5F5F5] transition-colors font-medium flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Carrier portal
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