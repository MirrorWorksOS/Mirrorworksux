/**
 * Ship Tracking — token-aligned
 * Status dots now use proper semantic colours (green=delivered, red=exception, blue=transit)
 */
import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, ExternalLink, Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { TimelineView, type TimelineEvent } from '@/components/shared/schedule/TimelineView';

type Status = 'shipped' | 'transit' | 'delivering' | 'delivered' | 'exception';

const statusConfig: Record<Status, { label: string; dot: string; badge: string; text: string }> = {
  shipped:    { label: 'Shipped',     dot: 'var(--neutral-400)', badge: 'bg-[var(--neutral-100)]',  text: 'text-[var(--neutral-500)]' },
  transit:    { label: 'In Transit',  dot: 'var(--mw-blue)', badge: 'bg-[var(--mw-blue-100)]',  text: 'text-[var(--mw-blue)]' },
  delivering: { label: 'Delivering',  dot: 'var(--mw-amber)', badge: 'bg-[var(--mw-amber-100)]',  text: 'text-[var(--mw-amber)]' },
  delivered:  { label: 'Delivered',   dot: 'var(--mw-mirage)', badge: 'bg-[var(--neutral-100)]',  text: 'text-[var(--mw-mirage)]' },
  exception:  { label: 'Exception',   dot: 'var(--mw-error)', badge: 'bg-[var(--mw-error-100)]',  text: 'text-[var(--mw-error)]' },
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
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Tracking</h1>
        <button
          onClick={() => setExceptionsOnly(!exceptionsOnly)}
          className={cn(
            'h-10 px-4 rounded-[var(--shape-lg)] text-sm flex items-center gap-2 transition-colors font-medium',
            exceptionsOnly
              ? 'bg-[var(--mw-error-100)] text-[var(--mw-error)]'
              : 'border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)]'
          )}
        >
          <AlertTriangle className="w-4 h-4" /> Exceptions
        </button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
        <Input placeholder="Search tracking..." className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] text-sm" />
      </div>

      <div className="bg-white rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              {['TRACKING', 'CUSTOMER', 'CARRIER', 'STATUS', 'ETA', 'UPDATED'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const cfg = statusConfig[s.status];
              return (
                <tr
                  key={s.tracking}
                  className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors"
                  onClick={() => setSelected(s)}
                >
                  <td className="px-4 py-3 text-sm  font-medium text-[var(--mw-mirage)]">{s.tracking}</td>
                  <td className="px-4 py-3 text-sm text-[var(--mw-mirage)]">{s.customer}</td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-500)]">{s.carrier}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>{cfg.label}</Badge>
                    </div>
                  </td>
                  <td className={cn('px-4 py-3 text-sm', s.eta === 'Today' ? 'font-semibold' : 'font-normal', s.status === 'exception' ? 'text-[var(--mw-error)]' : 'text-[var(--neutral-500)]')}>
                    {s.eta}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--neutral-500)]">{s.updated}</td>
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
                  <p className="text-xl  font-medium text-[var(--mw-mirage)]">{selected.tracking}</p>
                  <SheetDescription className="text-[var(--neutral-500)]">{selected.customer} · {selected.carrier}</SheetDescription>
                </SheetHeader>
                <div className="px-6 py-6 space-y-6">
                  {/* Timeline */}
                  <div>
                    <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium mb-3 block">Timeline</span>
                    <TimelineView
                      events={TIMELINE.map((evt, i): TimelineEvent => ({
                        id: `step-${i}`,
                        title: evt.step,
                        timestamp: evt.time,
                        status: evt.current ? 'current' : evt.done ? 'completed' : 'upcoming',
                      }))}
                    />
                  </div>

                  {/* Details */}
                  <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-4 space-y-2">
                    {[
                      { l: 'Weight',  v: '12.4 kg',                          mono: true },
                      { l: 'Dims',    v: '45×35×25 cm',                      mono: true },
                      { l: 'Address', v: '45 Industrial Dr, Silverwater NSW', mono: false },
                    ].map(d => (
                      <div key={d.l} className="flex justify-between text-sm">
                        <span className="text-[var(--neutral-500)]">{d.l}</span>
                        <span className={cn('text-[var(--mw-mirage)] font-medium', d.mono && 'tabular-nums')}>{d.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <button className="w-full h-11 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors font-medium flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Notify customer
                    </button>
                    <button className="w-full h-11 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors font-medium flex items-center justify-center gap-2">
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