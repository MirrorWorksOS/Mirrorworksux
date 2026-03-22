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
  ok:       { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', dot: '#36B37E', label: 'OK' },
  low:      { bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]', dot: '#FF8B00', label: 'Low' },
  empty:    { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', dot: '#EF4444', label: 'Empty' },
  reserved: { bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', dot: '#0A7AFF', label: 'Reserved' },
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
      <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Warehouse</h1>

      <div className="flex gap-1 bg-[#F5F5F5] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm transition-colors font-medium',
              tab === t.id ? 'bg-[#0A0A0A] text-white' : 'text-[#737373] hover:text-[#0A0A0A]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Map */}
      {tab === 'map' && (
        <div className="bg-white rounded-lg p-6 border border-[#E5E5E5]">
          <div className="relative bg-[#FAFAFA] rounded-lg" style={{ paddingBottom: '55%' }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {ZONES.map((z) => (
                <g key={z.name}>
                  <rect
                    x={z.x} y={z.y} width={z.w} height={z.h} rx={1.5}
                    fill={z.util > 60 ? '#FFFBF0' : '#F5F5F5'}
                    stroke={z.util > 60 ? '#FFCF4B' : '#E5E5E5'}
                    strokeWidth={0.4}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 2} textAnchor="middle" fontSize={2.2} fill="#0A0A0A" fontWeight={500}>{z.name}</text>
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 3} textAnchor="middle" fontSize={1.8} fill="#737373" fontFamily="Roboto Mono, monospace">{z.util}%</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <div className="w-3 h-3 rounded bg-[#FFFBF0] border border-[#FFCF4B]" /> High usage
            </div>
            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <div className="w-3 h-3 rounded bg-[#F5F5F5] border border-[#E5E5E5]" /> Normal
            </div>
          </div>
        </div>
      )}

      {/* Inventory */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" strokeWidth={1.5} />
              <Input placeholder="Search inventory..." className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm" />
            </div>
            <button className="h-10 px-4 rounded-lg text-sm border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                  {['BIN', 'SKU', 'PRODUCT', 'ON HAND', 'AVAILABLE', 'STATUS'].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[#737373] uppercase font-medium', ['ON HAND', 'AVAILABLE'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY.map(inv => {
                  const cfg = statusBadge[inv.status];
                  return (
                    <tr key={inv.bin} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors">
                      <td className="px-4 py-3 text-sm font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{inv.bin}</td>
                      <td className="px-4 py-3 text-xs text-[#737373] font-['Roboto_Mono',monospace]">{inv.sku}</td>
                      <td className="px-4 py-3 text-sm text-[#0A0A0A]">{inv.name}</td>
                      <td className="px-4 py-3 text-sm text-right font-['Roboto_Mono',monospace] font-medium">{inv.onHand}</td>
                      <td className="px-4 py-3 text-sm text-right font-['Roboto_Mono',monospace] font-medium">{inv.avail}</td>
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
          <div className="bg-white rounded-lg p-6 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-[#0A0A0A] font-medium font-['Roboto_Mono',monospace]">CC-2026-012</span>
                <span className="text-xs text-[#737373] ml-2">Zone A · 2 of 4 counted</span>
              </div>
              <button className="h-10 px-4 rounded-lg text-sm border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 font-medium">
                <Play className="w-4 h-4" /> New count
              </button>
            </div>
            <div className="h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div className="h-full bg-[#FFCF4B] rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                  {['BIN', 'SKU', 'EXPECTED', 'ACTUAL', ''].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[#737373] uppercase font-medium', ['EXPECTED', 'ACTUAL'].includes(h) ? 'text-right' : 'text-left', h === '' && 'text-center')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CYCLE.map(c => {
                  const v = c.actual !== null ? c.actual - c.expected : null;
                  return (
                    <tr key={c.bin} className="border-b border-[#F5F5F5] h-14">
                      <td className="px-4 py-3 text-sm font-['Roboto_Mono',monospace] font-medium">{c.bin}</td>
                      <td className="px-4 py-3 text-xs text-[#737373] font-['Roboto_Mono',monospace]">{c.sku}</td>
                      <td className="px-4 py-3 text-sm text-right font-['Roboto_Mono',monospace] font-medium">{c.expected}</td>
                      <td className="px-4 py-3 text-right">
                        {c.actual !== null
                          ? <span className="text-sm font-['Roboto_Mono',monospace] font-medium">{c.actual}</span>
                          : <Input className="h-10 w-20 text-right bg-[#F5F5F5] border-transparent rounded-lg ml-auto font-['Roboto_Mono',monospace]" placeholder="—" />
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        {v !== null && (
                          v === 0
                            ? <CheckCircle className="w-4 h-4 text-[#36B37E] mx-auto" />
                            : (
                              <div className="flex items-center justify-center gap-1">
                                <AlertCircle className="w-4 h-4 text-[#FF8B00]" />
                                <span className="text-xs font-['Roboto_Mono',monospace] font-medium text-[#FF8B00]">{v > 0 ? '+' : ''}{v}</span>
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
            <button className="h-12 px-8 rounded-lg text-sm bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] transition-colors font-medium">
              Submit count
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
