/**
 * Ship Shipping — carriers, rates, manifests
 * Token-aligned: #141414 → var(--neutral-900), #F0F0F0 → var(--neutral-200), #8A8A8A → var(--neutral-500)
 */
import React, { useState } from 'react';
import { Truck, Download, Printer, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { TextSegmentedControl } from '@/components/shared/layout/TextSegmentedControl';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { carriers as centralCarriers } from '@/services/mock';

const SHIP_COUNTS = [12, 8, 5, 6, 3, 4];
const CARRIERS = [
  ...centralCarriers.map((c, i) => ({
    name: c.name === 'Aus Post' ? 'Australia Post' : c.name === 'Toll' ? 'Toll/IPEC' : c.name === 'TNT' ? 'TNT Express' : c.name === 'DHL' ? 'DHL Express' : c.name,
    ships: SHIP_COUNTS[i] ?? 0,
    avg: c.avgTransitDays,
    onTime: c.onTimePercent,
    ok: c.onTimePercent >= 90,
  })),
  { name: 'Aramex', ships: 0, avg: 3.8, onTime: 88, ok: false },
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

type Manifest = (typeof MANIFESTS)[number];

const manifestColumns: MwColumnDef<Manifest>[] = [
  { key: 'date', header: 'Date', tooltip: 'Manifest date', cell: (m) => <span className="text-foreground tabular-nums">{m.date}</span> },
  { key: 'carrier', header: 'Carrier', tooltip: 'Shipping carrier', cell: (m) => (
    <span className="text-[var(--neutral-500)] inline-flex items-center gap-1.5">
      <Truck className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
      {m.carrier}
    </span>
  ) },
  { key: 'count', header: 'Shipments', tooltip: 'Number of shipments in manifest', headerClassName: 'text-right', className: 'text-right', cell: (m) => <span className="font-medium tabular-nums">{m.count}</span> },
  { key: 'weight', header: 'Weight', headerClassName: 'text-right', className: 'text-right', cell: (m) => <span className="tabular-nums">{m.weight}</span> },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Manifest status',
    cell: (m) => (
      <StatusBadge variant={m.open ? 'warning' : 'dark'}>{m.open ? 'Open' : 'Closed'}</StatusBadge>
    ),
  },
  {
    key: 'actions',
    header: '',
    cell: () => (
      <div className="flex gap-1">
        <button className="size-12 rounded-full flex items-center justify-center hover:bg-[var(--neutral-100)] transition-colors" onClick={(e) => { e.stopPropagation(); toast.success('Downloading shipping document…'); }}>
          <Download className="w-4 h-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
        </button>
        <button className="size-12 rounded-full flex items-center justify-center hover:bg-[var(--neutral-100)] transition-colors" onClick={(e) => { e.stopPropagation(); toast('Printing label…'); }}>
          <Printer className="w-4 h-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
        </button>
      </div>
    ),
  },
];

export function ShipShipping() {
  const [tab, setTab] = useState('carriers');
  const tabs = [
    { key: 'carriers', label: 'Carriers' },
    { key: 'rates', label: 'Rates' },
    { key: 'manifests', label: 'Manifests' },
  ];

  const totalCarriers = CARRIERS.length;
  const activeCarriers = CARRIERS.filter(c => c.ok).length;
  const totalShipmentsToday = CARRIERS.reduce((s, c) => s + c.ships, 0);
  const avgOnTime = Math.round(CARRIERS.reduce((s, c) => s + c.onTime, 0) / CARRIERS.length);

  return (
    <PageShell className="overflow-y-auto">
      <PageHeader title="Shipping" />

      <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
        {[
          { label: 'Active Carriers', value: activeCarriers, sub: `${totalCarriers} total`, bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'Shipments Today', value: totalShipmentsToday, sub: 'Across all carriers', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Avg On-Time', value: `${avgOnTime}%`, sub: 'Delivery performance', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Open Manifests', value: MANIFESTS.filter(m => m.open).length, sub: 'Awaiting closure', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
        ].map(s => (
          <SpotlightCard key={s.label} radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
            <Card variant="flat" className="h-full border-[var(--border)] p-6">
              <p className="mb-1 text-xs font-medium text-[var(--neutral-500)]">{s.label}</p>
              <p className={cn('text-2xl font-medium tabular-nums', s.text)}>{s.value}</p>
              <p className="mt-0.5 text-xs text-[var(--neutral-500)]">{s.sub}</p>
            </Card>
          </SpotlightCard>
        ))}
      </div>

      <TextSegmentedControl
        ariaLabel="Shipping sections"
        value={tab}
        onChange={setTab}
        options={tabs}
      />

      {/* Carriers */}
      {tab === 'carriers' && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CARRIERS.map(c => (
            <SpotlightCard key={c.name} radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
            <Card variant="flat" className="h-full border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Truck className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  <span className="text-sm text-foreground font-medium">{c.name}</span>
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
                    <div className="text-lg text-foreground font-medium tabular-nums">{s.v}</div>
                    <span className="text-[10px] text-[var(--neutral-500)] tracking-wider">{s.l}</span>
                  </div>
                ))}
              </div>
            </Card>
            </SpotlightCard>
          ))}
        </div>
      )}

      {/* Rates */}
      {tab === 'rates' && (
        <div className="space-y-6">
          <Card className="p-6">
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
          </Card>

          <div className="space-y-2">
            {[...RATES].sort((a, b) => a.cost - b.cost).map((r, i) => (
              <Card
                key={`${r.carrier}-${r.service}`}
                className={cn(
                  'flex items-center gap-4 p-6 transition-colors duration-[var(--duration-short2)] cursor-pointer',
                  r.ai ? 'border-2 border-[var(--mw-yellow-400)]' : 'hover:border-[var(--neutral-400)]'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground font-medium">{r.carrier}</span>
                    <span className="text-xs text-[var(--neutral-500)]">{r.service}</span>
                    {r.ai && (
                      <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-[var(--mw-purple)]/15 text-[var(--mw-purple)] font-medium flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> AI pick
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--neutral-500)]">{r.days}d transit</span>
                </div>
                <span className="text-xl text-foreground font-medium tabular-nums">${r.cost.toFixed(2)}</span>
                <button
                  className={cn(
                    'h-14 px-5 rounded-full text-sm transition-colors font-medium',
                    i === 0 || r.ai
                      ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground'
                      : 'border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)]'
                  )}
                >
                  Select
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manifests */}
      {tab === 'manifests' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="h-12 min-h-[48px] px-6 rounded-full text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground transition-colors font-medium" onClick={() => toast.success('Shipping manifest generated')}>
              Generate manifest
            </button>
          </div>
          <MwDataTable
            columns={manifestColumns}
            data={MANIFESTS}
            keyExtractor={(_m, i) => String(i)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </div>
      )}
    </PageShell>
  );
}
