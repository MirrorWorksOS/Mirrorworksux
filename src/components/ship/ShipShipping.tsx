/**
 * Ship Shipping — carriers, rates, manifests
 * Token-aligned: #141414 → var(--neutral-900), #F0F0F0 → var(--neutral-200), #8A8A8A → var(--neutral-500)
 */
import React, { useState } from 'react';
import { Truck, Download, Printer, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

const CARRIERS = [
  { name: 'Australia Post', ships: 12, avg: 3.2, onTime: 97, ok: true },
  { name: 'StarTrack',      ships: 8,  avg: 2.1, onTime: 95, ok: true },
  { name: 'Toll/IPEC',      ships: 5,  avg: 2.8, onTime: 93, ok: true },
  { name: 'TNT Express',    ships: 6,  avg: 2.4, onTime: 91, ok: true },
  { name: 'DHL Express',    ships: 3,  avg: 1.5, onTime: 98, ok: true },
  { name: 'Aramex',         ships: 0,  avg: 3.8, onTime: 88, ok: false },
  { name: 'Sendle',         ships: 4,  avg: 3.5, onTime: 94, ok: true },
];

const RATES = [
  { carrier: 'Sendle',     service: 'Standard',     cost: 8.50,  days: 4, ai: false },
  { carrier: 'Aus Post',   service: 'Parcel Post',  cost: 11.20, days: 5, ai: false },
  { carrier: 'StarTrack',  service: 'Premium',      cost: 14.80, days: 2, ai: true },
  { carrier: 'TNT',        service: 'Road Express', cost: 16.50, days: 2, ai: false },
  { carrier: 'DHL',        service: 'Domestic',     cost: 22.00, days: 1, ai: false },
];

const MANIFESTS = [
  { date: '02 Mar', carrier: 'StarTrack', count: 8,  weight: '124.5 kg', open: true },
  { date: '02 Mar', carrier: 'Aus Post',  count: 12, weight: '45.2 kg',  open: true },
  { date: '01 Mar', carrier: 'StarTrack', count: 15, weight: '198.3 kg', open: false },
  { date: '01 Mar', carrier: 'Toll',      count: 6,  weight: '312.0 kg', open: false },
  { date: '28 Feb', carrier: 'DHL',       count: 3,  weight: '22.1 kg',  open: false },
];

export function ShipShipping() {
  const [tab, setTab] = useState('carriers');
  const tabs = [
    { id: 'carriers',  label: 'Carriers' },
    { id: 'rates',     label: 'Rates' },
    { id: 'manifests', label: 'Manifests' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Shipping</h1>

      <div className="flex gap-1 bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm transition-colors font-medium',
              tab === t.id ? 'bg-[var(--mw-mirage)] text-white' : 'text-[var(--neutral-500)] hover:text-[var(--mw-mirage)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Carriers */}
      {tab === 'carriers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CARRIERS.map(c => (
            <div key={c.name} className="bg-white rounded-[var(--shape-lg)] p-5 border border-[var(--border)] hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[var(--mw-mirage)]" strokeWidth={1.5} />
                  <span className="text-sm text-[var(--mw-mirage)] font-medium">{c.name}</span>
                </div>
                <div className={cn('w-2 h-2 rounded-full', c.ok ? 'bg-[var(--mw-mirage)]' : 'bg-[var(--neutral-200)]')} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: 'Today',   v: c.ships },
                  { l: 'Avg days', v: c.avg },
                  { l: 'On-time', v: `${c.onTime}%` },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-lg text-[var(--mw-mirage)]  font-medium">{s.v}</div>
                    <span className="text-[10px] text-[var(--neutral-500)] tracking-wider">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rates */}
      {tab === 'rates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'FROM', v: '2787' }, { l: 'TO', v: '2128' },
                { l: 'WEIGHT', v: '12.4 kg' }, { l: 'DIMS', v: '45×35×25' },
              ].map(f => (
                <div key={f.l}>
                  <span className="text-[10px] text-[var(--neutral-500)] tracking-widest uppercase font-medium">{f.l}</span>
                  <Input defaultValue={f.v} className="h-12 mt-1 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] " />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {[...RATES].sort((a, b) => a.cost - b.cost).map((r, i) => (
              <div
                key={`${r.carrier}-${r.service}`}
                className={cn(
                  'flex items-center gap-4 bg-white rounded-[var(--shape-lg)] p-5 transition-colors duration-150 cursor-pointer',
                  r.ai ? 'border-2 border-[var(--mw-yellow-400)]' : 'border border-[var(--border)] hover:border-[var(--neutral-400)]'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--mw-mirage)] font-medium">{r.carrier}</span>
                    <span className="text-xs text-[var(--neutral-500)]">{r.service}</span>
                    {r.ai && (
                      <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] font-medium flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> AI pick
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--neutral-500)]">{r.days}d transit</span>
                </div>
                <span className="text-xl text-[var(--mw-mirage)]  font-medium">${r.cost.toFixed(2)}</span>
                <button
                  className={cn(
                    'h-10 px-5 rounded-[var(--shape-lg)] text-sm transition-colors font-medium',
                    i === 0 || r.ai
                      ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)]'
                      : 'border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)]'
                  )}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manifests */}
      {tab === 'manifests' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="h-10 px-5 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors font-medium">
              Generate manifest
            </button>
          </div>
          <div className="bg-white rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  {['DATE', 'CARRIER', 'SHIPMENTS', 'WEIGHT', 'STATUS', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MANIFESTS.map((m, i) => (
                  <tr key={i} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--mw-mirage)]">{m.date}</td>
                    <td className="px-4 py-3 text-sm text-[var(--neutral-500)]">{m.carrier}</td>
                    <td className="px-4 py-3 text-sm  font-medium">{m.count}</td>
                    <td className="px-4 py-3 text-sm ">{m.weight}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', m.open ? 'bg-[var(--mw-yellow-400)]' : 'bg-[var(--mw-mirage)]')} />
                        <span className="text-xs text-[var(--neutral-500)]">{m.open ? 'Open' : 'Closed'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center hover:bg-[var(--neutral-100)] transition-colors">
                        <Download className="w-4 h-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
                      </button>
                      <button className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center hover:bg-[var(--neutral-100)] transition-colors">
                        <Printer className="w-4 h-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
