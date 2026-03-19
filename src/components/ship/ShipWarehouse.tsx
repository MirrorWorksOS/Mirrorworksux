import React, { useState } from 'react';
import { Search, Download, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

const Y = '#FFCF4B';
const D = '#141414';

const ZONES = [
  { name: 'Receiving', items: 34, util: 45, x: 5, y: 5, w: 25, h: 35 },
  { name: 'Storage', items: 245, util: 72, x: 35, y: 5, w: 30, h: 60 },
  { name: 'Pick Face', items: 89, util: 68, x: 70, y: 5, w: 25, h: 35 },
  { name: 'Pack', items: 12, util: 30, x: 5, y: 45, w: 25, h: 25 },
  { name: 'Dispatch', items: 28, util: 55, x: 70, y: 45, w: 25, h: 25 },
  { name: 'Returns', items: 8, util: 20, x: 5, y: 75, w: 25, h: 20 },
];

const INVENTORY = [
  { bin: 'A-01-03', sku: 'AL-5052-BP', name: 'Base Plate', onHand: 120, avail: 96, status: 'ok' },
  { bin: 'A-02-01', sku: 'AL-5052-SA', name: 'Support Arm', onHand: 85, avail: 45, status: 'ok' },
  { bin: 'B-02-05', sku: 'RHS-50252', name: 'RHS 50x25x2.5', onHand: 200, avail: 140, status: 'ok' },
  { bin: 'C-04-02', sku: 'HW-KIT-001', name: 'Hardware Kit M10', onHand: 15, avail: 3, status: 'low' },
  { bin: 'C-01-01', sku: 'WW-ER70S6', name: 'Welding Wire', onHand: 50, avail: 50, status: 'ok' },
  { bin: 'D-01-01', sku: 'FST-M10A4', name: 'SS Fasteners M10', onHand: 0, avail: 0, status: 'empty' },
  { bin: 'A-03-02', sku: 'MS-10-3678', name: '10mm MS Plate', onHand: 45, avail: 0, status: 'reserved' },
  { bin: 'Paint-01', sku: 'PNT-RAL7035', name: 'Paint RAL 7035', onHand: 8, avail: 6, status: 'low' },
];

const CYCLE = [
  { bin: 'A-01-03', sku: 'AL-5052-BP', expected: 120, actual: null as number | null },
  { bin: 'A-02-01', sku: 'AL-5052-SA', expected: 85, actual: 85 },
  { bin: 'A-03-02', sku: 'MS-10-3678', expected: 45, actual: 43 },
  { bin: 'B-02-05', sku: 'RHS-50252', expected: 200, actual: null },
];

export function ShipWarehouse() {
  const [tab, setTab] = useState('map');
  const tabs = [
    { id: 'map', label: 'Map' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'count', label: 'Cycle Count' },
  ];

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      <h4 className="text-[#141414] tracking-tight">Warehouse</h4>

      <div className="flex gap-1 bg-[#FAFAFA] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-4 py-2 rounded-md text-sm transition-colors", tab === t.id ? "bg-[#141414] text-white" : "text-[#8A8A8A] hover:text-[#141414]")}
            style={{ fontWeight: 500 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Map */}
      {tab === 'map' && (
        <div className="bg-white rounded-xl p-6 border border-[#F0F0F0]">
          <div className="relative bg-[#FAFAFA] rounded-lg" style={{ paddingBottom: '55%' }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {ZONES.map((z, i) => (
                <g key={z.name}>
                  <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={1.5}
                    fill={z.util > 60 ? `${Y}20` : '#F0F0F0'} stroke={z.util > 60 ? Y : '#D4D4D4'} strokeWidth={0.4}
                    className="cursor-pointer hover:opacity-80 transition-opacity" />
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 2} textAnchor="middle" fontSize={2.2} fill={D} fontWeight={500}>{z.name}</text>
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 3} textAnchor="middle" fontSize={1.8} fill="#8A8A8A" fontFamily="Roboto Mono, monospace">{z.util}%</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-[#8A8A8A]"><div className="w-3 h-3 rounded" style={{ backgroundColor: `${Y}30`, border: `1px solid ${Y}` }} /> High usage</div>
            <div className="flex items-center gap-2 text-xs text-[#8A8A8A]"><div className="w-3 h-3 rounded bg-[#F0F0F0] border border-[#D4D4D4]" /> Normal</div>
          </div>
        </div>
      )}

      {/* Inventory */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C0C0]" strokeWidth={1.5} />
              <Input placeholder="Search inventory..." className="pl-10 h-11 bg-[#FAFAFA] border-0 rounded-lg text-sm" />
            </div>
            <button className="h-10 px-4 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  {['BIN', 'SKU', 'PRODUCT', 'ON HAND', 'AVAILABLE', 'STATUS'].map(h => (
                    <th key={h} className={cn("px-4 py-3 text-[10px] tracking-widest text-[#A0A0A0] uppercase", ['ON HAND', 'AVAILABLE'].includes(h) ? 'text-right' : 'text-left')} style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY.map(inv => (
                  <tr key={inv.bin} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3.5 text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{inv.bin}</td>
                    <td className="px-4 py-3.5 text-xs text-[#8A8A8A]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{inv.sku}</td>
                    <td className="px-4 py-3.5 text-sm text-[#141414]">{inv.name}</td>
                    <td className="px-4 py-3.5 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{inv.onHand}</td>
                    <td className="px-4 py-3.5 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{inv.avail}</td>
                    <td className="px-4 py-3.5">
                      <div className={cn("w-2 h-2 rounded-full inline-block",
                        inv.status === 'ok' ? "bg-[#FFCF4B]" : inv.status === 'low' ? "bg-[#141414]" : "bg-[#D4D4D4]")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cycle Count */}
      {tab === 'count' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#F0F0F0]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-[#141414]" style={{ fontWeight: 500 }}>CC-2026-012</span>
                <span className="text-xs text-[#8A8A8A] ml-2">Zone A · 2 of 4 counted</span>
              </div>
              <button className="h-10 px-4 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
                <Play className="w-4 h-4" /> New Count
              </button>
            </div>
            <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div className="h-full bg-[#FFCF4B] rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  {['BIN', 'SKU', 'EXPECTED', 'ACTUAL', ''].map(h => (
                    <th key={h} className={cn("px-4 py-3 text-[10px] tracking-widest text-[#A0A0A0] uppercase", ['EXPECTED', 'ACTUAL'].includes(h) ? 'text-right' : 'text-left', h === '' && 'text-center')} style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CYCLE.map(c => {
                  const v = c.actual !== null ? c.actual - c.expected : null;
                  return (
                    <tr key={c.bin} className="border-b border-[#F8F8F8]">
                      <td className="px-4 py-3.5 text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{c.bin}</td>
                      <td className="px-4 py-3.5 text-xs text-[#8A8A8A]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{c.sku}</td>
                      <td className="px-4 py-3.5 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{c.expected}</td>
                      <td className="px-4 py-3.5 text-right">
                        {c.actual !== null
                          ? <span className="text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{c.actual}</span>
                          : <Input className="h-11 w-20 text-right bg-[#FAFAFA] border-0 rounded-lg ml-auto" style={{ fontFamily: 'Roboto Mono, monospace' }} placeholder="—" />
                        }
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {v !== null && (
                          v === 0
                            ? <CheckCircle className="w-4 h-4 text-[#FFCF4B] mx-auto" />
                            : <div className="flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4 text-[#141414]" /><span className="text-xs" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{v > 0 ? '+' : ''}{v}</span></div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button className="h-12 px-8 rounded-lg text-sm bg-[#141414] text-white transition-colors" style={{ fontWeight: 500 }}>Submit Count</button>
          </div>
        </div>
      )}
    </div>
  );
}
