/**
 * Ship Warehouse — map, inventory, cycle count
 * Token-aligned + semantic status dot colours
 */
import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle, Package, Play } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { FilterBar } from '@/components/shared/layout/FilterBar';
import { TextSegmentedControl } from '@/components/shared/layout/TextSegmentedControl';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';

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

type InvItem = (typeof INVENTORY)[number];

const warehouseInvColumns: MwColumnDef<InvItem>[] = [
  { key: 'bin', header: 'Bin', tooltip: 'Warehouse bin location', cell: (inv) => (
    <span className="font-medium tabular-nums text-[var(--mw-mirage)] inline-flex items-center gap-1.5">
      <Package className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
      {inv.bin}
    </span>
  ) },
  { key: 'sku', header: 'SKU', tooltip: 'Stock keeping unit', className: 'text-xs text-[var(--neutral-500)] tabular-nums', cell: (inv) => inv.sku },
  { key: 'name', header: 'Product', cell: (inv) => <span className="text-[var(--mw-mirage)]">{inv.name}</span> },
  { key: 'onHand', header: 'On Hand', tooltip: 'Total quantity in warehouse', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (inv) => inv.onHand },
  { key: 'avail', header: 'Available', tooltip: 'Quantity available for allocation', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (inv) => inv.avail },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Stock status',
    cell: (inv) => {
      const v = inv.status === 'ok' ? 'dark' : inv.status === 'low' ? 'warning' : inv.status === 'empty' ? 'error' : 'info';
      return <StatusBadge variant={v as 'dark' | 'warning' | 'error' | 'info'}>{statusBadge[inv.status].label}</StatusBadge>;
    },
  },
];

type CycleItem = (typeof CYCLE)[number];

const cycleColumns: MwColumnDef<CycleItem>[] = [
  { key: 'bin', header: 'Bin', tooltip: 'Warehouse bin location', cell: (c) => <span className="font-medium tabular-nums">{c.bin}</span> },
  { key: 'sku', header: 'SKU', tooltip: 'Stock keeping unit', className: 'text-xs text-[var(--neutral-500)] tabular-nums', cell: (c) => c.sku },
  { key: 'expected', header: 'Expected', tooltip: 'System quantity', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (c) => c.expected },
  {
    key: 'actual',
    header: 'Actual',
    headerClassName: 'text-right',
    className: 'text-right',
    cell: (c) =>
      c.actual !== null ? (
        <span className="font-medium tabular-nums">{c.actual}</span>
      ) : (
        <Input className="h-10 w-20 text-right tabular-nums bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] ml-auto" placeholder="—" />
      ),
  },
  {
    key: 'variance',
    header: '',
    headerClassName: 'text-center',
    className: 'text-center',
    cell: (c) => {
      const v = c.actual !== null ? c.actual - c.expected : null;
      if (v === null) return null;
      return v === 0 ? (
        <CheckCircle className="w-4 h-4 text-[var(--mw-mirage)] mx-auto" />
      ) : (
        <div className="flex items-center justify-center gap-1">
          <AlertCircle className="w-4 h-4 text-[var(--mw-amber)]" />
          <span className="text-xs font-medium tabular-nums text-[var(--mw-amber)]">{v > 0 ? '+' : ''}{v}</span>
        </div>
      );
    },
  },
];

export function ShipWarehouse() {
  const [tab, setTab] = useState('map');
  const [invSearch, setInvSearch] = useState('');
  const tabs = [
    { key: 'map', label: 'Map' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'count', label: 'Cycle count' },
  ];

  const totalItems = ZONES.reduce((s, z) => s + z.items, 0);
  const avgUtil = Math.round(ZONES.reduce((s, z) => s + z.util, 0) / ZONES.length);
  const lowStockCount = INVENTORY.filter(i => i.status === 'low').length;
  const emptyCount = INVENTORY.filter(i => i.status === 'empty').length;

  return (
    <PageShell className="overflow-y-auto">
      <PageHeader title="Warehouse" />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalItems, sub: `${ZONES.length} zones`, bg: 'bg-[var(--mw-yellow-50)]', text: 'text-[var(--mw-mirage)]' },
          { label: 'Avg Utilisation', value: `${avgUtil}%`, sub: 'Across all zones', bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]' },
          { label: 'Low Stock', value: lowStockCount, sub: 'Below threshold', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
          { label: 'Empty Bins', value: emptyCount, sub: 'Needs restock', bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
        ].map(s => (
          <Card key={s.label} className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <TextSegmentedControl
        ariaLabel="Warehouse sections"
        value={tab}
        onChange={setTab}
        options={tabs}
      />

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
          <FilterBar
            searchValue={invSearch}
            onSearchChange={setInvSearch}
            searchPlaceholder="Search inventory…"
            actions={
              <button className="h-14 px-4 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors flex items-center gap-2 font-medium">
                <Download className="w-4 h-4" /> Export
              </button>
            }
          />
          <MwDataTable
            columns={warehouseInvColumns}
            data={INVENTORY}
            keyExtractor={(inv) => inv.bin}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </div>
      )}

      {/* Cycle Count */}
      {tab === 'count' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[var(--shape-lg)] p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-[var(--mw-mirage)] font-medium tabular-nums">CC-2026-012</span>
                <span className="text-xs text-[var(--neutral-500)] ml-2">Zone A · 2 of 4 counted</span>
              </div>
              <button className="h-14 px-4 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors flex items-center gap-2 font-medium">
                <Play className="w-4 h-4" /> New count
              </button>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--mw-yellow-400)] rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          <MwDataTable
            columns={cycleColumns}
            data={CYCLE}
            keyExtractor={(c) => c.bin}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />

          <div className="flex justify-end">
            <button className="h-12 px-8 rounded-[var(--shape-lg)] text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] transition-colors font-medium">
              Submit count
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
