/**
 * Ship Warehouse — map, inventory, cycle count
 * Token-aligned + semantic status dot colours
 */
import React, { useState } from 'react';
import { Search, Download, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

const ZONES = [
  { name: 'Receiving', items: 34,  util: 45, x: 5,  y: 5,  w: 25, h: 35 },
  { name: 'Storage',   items: 245, util: 72, x: 35, y: 5,  w: 30, h: 60 },
  { name: 'Pick Face', items: 89,  util: 68, x: 70, y: 5,  w: 25, h: 35 },
  { name: 'Pack',      items: 12,  util: 30, x: 5,  y: 45, w: 25, h: 25 },
  { name: 'Dispatch',  items: 28,  util: 55, x: 70, y: 45, w: 25, h: 25 },
  { name: 'Returns',   items: 8,   util: 20, x: 5,  y: 75, w: 25, h: 20 },
];

const INVENTORY = [
  { bin: 'A-01-03',  sku: 'AL-5052-BP',  name: 'Base Plate',        onHand: 120, avail: 96,  status: 'ok' },
  { bin: 'A-02-01',  sku: 'AL-5052-SA',  name: 'Support Arm',       onHand: 85,  avail: 45,  status: 'ok' },
  { bin: 'B-02-05',  sku: 'RHS-50252',   name: 'RHS 50x25x2.5',     onHand: 200, avail: 140, status: 'ok' },
  { bin: 'C-04-02',  sku: 'HW-KIT-001',  name: 'Hardware Kit M10',  onHand: 15,  avail: 3,   status: 'low' },
  { bin: 'C-01-01',  sku: 'WW-ER70S6',   name: 'Welding Wire',      onHand: 50,  avail: 50,  status: 'ok' },
  { bin: 'D-01-01',  sku: 'FST-M10A4',   name: 'SS Fasteners M10',  onHand: 0,   avail: 0,   status: 'empty' },
  { bin: 'A-03-02',  sku: 'MS-10-3678',  name: '10mm MS Plate',     onHand: 45,  avail: 0,   status: 'reserved' },
  { bin: 'Paint-01', sku: 'PNT-RAL7035', name: 'Paint RAL 7035',    onHand: 8,   avail: 6,   status: 'low' },
];

const statusBadge: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ok:       { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--mw-mirage)', label: 'OK' },
  low:      { bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', dot: 'var(--mw-amber)', label: 'Low' },
  empty:    { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', dot: 'var(--mw-error)', label: 'Empty' },
  reserved: { bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', dot: 'var(--mw-blue)', label: 'Reserved' },
};

const CYCLE = [
  { bin: 'A-01-03', sku: 'AL-5052-BP',  expected: 120, actual: null as number | null },
  { bin: 'A-02-01', sku: 'AL-5052-SA',  expected: 85,  actual: 85 },
  { bin: 'A-03-02', sku: 'MS-10-3678',  expected: 45,  actual: 43 },
  { bin: 'B-02-05', sku: 'RHS-50252',   expected: 200, actual: null },
];

export function ShipWarehouse() {
  const [tab, setTab] = useState('map');
  const tabs = [
    { id: 'map',       label: 'Map' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'count',     label: 'Cycle count' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Warehouse</h1>

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

      {/* Map */}
      {tab === 'map' && (
        <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
          <div className="relative bg-[var(--neutral-100)] rounded-[var(--shape-lg)]" style={{ paddingBottom: '55%' }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {ZONES.map((z) => (
                <g key={z.name}>
                  <rect
                    x={z.x} y={z.y} width={z.w} height={z.h} rx={1.5}
                    fill={z.util > 60 ? 'var(--accent)' : 'var(--neutral-100)'}
                    stroke={z.util > 60 ? 'var(--mw-yellow-400)' : 'var(--border)'}
                    strokeWidth={0.4}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 2} textAnchor="middle" fontSize={2.2} fill="var(--mw-mirage)" fontWeight={500}>{z.name}</text>
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 3} textAnchor="middle" fontSize={1.8} fill="var(--neutral-500)">{z.util}%</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
              <div className="w-3 h-3 rounded bg-[var(--mw-yellow-50)] border border-[var(--mw-yellow-400)]" /> High usage
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
              <div className="w-3 h-3 rounded bg-[var(--neutral-100)] border border-[var(--border)]" /> Normal
            </div>
          </div>
        </div>
      )}

      {/* Inventory */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
              <Input placeholder="Search inventory..." className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] text-sm" />
            </div>
            <button className="h-10 px-4 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="bg-white rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  {['BIN', 'SKU', 'PRODUCT', 'ON HAND', 'AVAILABLE', 'STATUS'].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium', ['ON HAND', 'AVAILABLE'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY.map(inv => {
                  const cfg = statusBadge[inv.status];
                  return (
                    <tr key={inv.bin} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] transition-colors">
                      <td className="px-4 py-3 text-sm  font-medium text-[var(--mw-mirage)]">{inv.bin}</td>
                      <td className="px-4 py-3 text-xs text-[var(--neutral-500)] ">{inv.sku}</td>
                      <td className="px-4 py-3 text-sm text-[var(--mw-mirage)]">{inv.name}</td>
                      <td className="px-4 py-3 text-sm text-right  font-medium">{inv.onHand}</td>
                      <td className="px-4 py-3 text-sm text-right  font-medium">{inv.avail}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>
                          {cfg.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cycle Count */}
      {tab === 'count' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-[var(--mw-mirage)] font-medium ">CC-2026-012</span>
                <span className="text-xs text-[var(--neutral-500)] ml-2">Zone A · 2 of 4 counted</span>
              </div>
              <button className="h-10 px-4 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors flex items-center gap-2 font-medium">
                <Play className="w-4 h-4" /> New count
              </button>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--mw-yellow-400)] rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          <div className="bg-white rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  {['BIN', 'SKU', 'EXPECTED', 'ACTUAL', ''].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium', ['EXPECTED', 'ACTUAL'].includes(h) ? 'text-right' : 'text-left', h === '' && 'text-center')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CYCLE.map(c => {
                  const v = c.actual !== null ? c.actual - c.expected : null;
                  return (
                    <tr key={c.bin} className="border-b border-[var(--neutral-100)] h-14">
                      <td className="px-4 py-3 text-sm  font-medium">{c.bin}</td>
                      <td className="px-4 py-3 text-xs text-[var(--neutral-500)] ">{c.sku}</td>
                      <td className="px-4 py-3 text-sm text-right  font-medium">{c.expected}</td>
                      <td className="px-4 py-3 text-right">
                        {c.actual !== null
                          ? <span className="text-sm  font-medium">{c.actual}</span>
                          : <Input className="h-10 w-20 text-right bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] ml-auto " placeholder="—" />
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        {v !== null && (
                          v === 0
                            ? <CheckCircle className="w-4 h-4 text-[var(--mw-mirage)] mx-auto" />
                            : (
                              <div className="flex items-center justify-center gap-1">
                                <AlertCircle className="w-4 h-4 text-[var(--mw-amber)]" />
                                <span className="text-xs  font-medium text-[var(--mw-amber)]">{v > 0 ? '+' : ''}{v}</span>
                              </div>
                            )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button className="h-12 px-8 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors font-medium">
              Submit count
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
