/**
 * Control Inventory — stock master data with search, filter, status
 */
import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/data/StatusBadge';


const INVENTORY = [
  { id: '1',  sku: 'AL-5052-BP',  name: 'Aluminium Base Plate 5052',    category: 'Raw Materials',  unit: 'each',   onHand: 120, minStock: 50,  costPrice: 28.50,  location: 'A-01-03', status: 'ok' },
  { id: '2',  sku: 'AL-5052-SA',  name: 'Aluminium Support Arm 5052',   category: 'Raw Materials',  unit: 'each',   onHand: 85,  minStock: 40,  costPrice: 34.20,  location: 'A-02-01', status: 'ok' },
  { id: '3',  sku: 'RHS-50252',   name: 'RHS 50x25x2.5 Steel Section',  category: 'Raw Materials',  unit: 'length', onHand: 200, minStock: 100, costPrice: 12.80,  location: 'B-02-05', status: 'ok' },
  { id: '4',  sku: 'MS-10-3678',  name: '10mm Mild Steel Plate',        category: 'Raw Materials',  unit: 'sheet',  onHand: 45,  minStock: 20,  costPrice: 185.00, location: 'A-03-02', status: 'ok' },
  { id: '5',  sku: 'HW-KIT-001',  name: 'Hardware Kit M10 SS',          category: 'Consumables',    unit: 'kit',    onHand: 15,  minStock: 30,  costPrice: 8.40,   location: 'C-04-02', status: 'low' },
  { id: '6',  sku: 'WW-ER70S6',   name: 'Welding Wire ER70S-6 15kg',    category: 'Consumables',    unit: 'spool',  onHand: 50,  minStock: 10,  costPrice: 92.00,  location: 'C-01-01', status: 'ok' },
  { id: '7',  sku: 'FST-M10A4',   name: 'SS Fasteners M10 Grade A4',    category: 'Consumables',    unit: 'box',    onHand: 0,   minStock: 20,  costPrice: 24.50,  location: 'D-01-01', status: 'out' },
  { id: '8',  sku: 'PNT-RAL7035', name: 'Powder Coat Paint RAL 7035',   category: 'Consumables',    unit: 'kg',     onHand: 8,   minStock: 15,  costPrice: 11.00,  location: 'Paint-01',status: 'low' },
  { id: '9',  sku: 'PROD-SR-001', name: 'Server Rack Chassis',          category: 'Finished Goods', unit: 'each',   onHand: 3,   minStock: 0,   costPrice: 820.00, location: 'FG-01-01',status: 'ok' },
  { id: '10', sku: 'PROD-BP-002', name: 'Bracket Type A (standard)',    category: 'Finished Goods', unit: 'each',   onHand: 12,  minStock: 5,   costPrice: 145.00, location: 'FG-01-02',status: 'ok' },
];

const CATEGORIES = ['All', 'Raw Materials', 'Consumables', 'Finished Goods'];

type InventoryItem = (typeof INVENTORY)[number];

const STATUS_BADGE_MAP: Record<string, 'active' | 'pending' | 'cancelled'> = {
  ok: 'active',
  low: 'pending',
  out: 'cancelled',
};
const STATUS_LABEL_MAP: Record<string, string> = { ok: 'OK', low: 'Low', out: 'Out' };

const inventoryColumns: MwColumnDef<InventoryItem>[] = [
  {
    key: 'sku',
    header: 'SKU',
    tooltip: 'Stock-keeping unit code',
    cell: (item) => item.sku,
    className: 'text-xs font-medium text-[var(--neutral-500)]',
  },
  {
    key: 'name',
    header: 'Name',
    tooltip: 'Item description',
    cell: (item) => item.name,
    className: 'font-medium text-[var(--mw-mirage)]',
  },
  {
    key: 'category',
    header: 'Category',
    tooltip: 'Inventory category',
    cell: (item) => (
      <StatusBadge variant="neutral">{item.category}</StatusBadge>
    ),
  },
  {
    key: 'onHand',
    header: 'On Hand',
    tooltip: 'Current stock quantity',
    headerClassName: 'text-right',
    className: 'text-right font-medium tabular-nums',
    cell: (item) => (
      <span
        style={{
          color: item.status === 'out' ? 'var(--mw-error)' : item.status === 'low' ? 'var(--mw-amber)' : 'var(--mw-mirage)',
        }}
      >
        {item.onHand} {item.unit}
      </span>
    ),
  },
  {
    key: 'minStock',
    header: 'Min Stock',
    tooltip: 'Minimum stock threshold',
    headerClassName: 'text-right',
    className: 'text-right text-[var(--neutral-500)] tabular-nums',
    cell: (item) => item.minStock,
  },
  {
    key: 'cost',
    header: 'Cost',
    tooltip: 'Unit cost price',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums',
    cell: (item) => `$${item.costPrice.toFixed(2)}`,
  },
  {
    key: 'location',
    header: 'Location',
    tooltip: 'Warehouse location code',
    className: 'text-xs font-medium text-[var(--neutral-500)]',
    cell: (item) => item.location,
  },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Stock level status',
    headerClassName: 'text-center',
    cell: (item) => (
      <div className="flex justify-center">
        <StatusBadge status={STATUS_BADGE_MAP[item.status] as any} withDot>
          {STATUS_LABEL_MAP[item.status]}
        </StatusBadge>
      </div>
    ),
  },
];

export function ControlInventory() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  const filtered = INVENTORY.filter(item => {
    const matchSearch   = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || item.category === category;
    return matchSearch && matchCategory;
  });

  const totals = {
    items: INVENTORY.length,
    low:   INVENTORY.filter(i => i.status === 'low').length,
    out:   INVENTORY.filter(i => i.status === 'out').length,
  };

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Inventory"
        subtitle={`${totals.items} SKUs${totals.low > 0 ? ` · ${totals.low} low stock` : ''}${totals.out > 0 ? ` · ${totals.out} out of stock` : ''}`}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search by name or SKU…" />
        <ToolbarFilterPills
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map(c => ({ key: c, label: c }))}
        />
        <ToolbarSpacer />
        <Button variant="outline" className="h-12 gap-2 rounded-md border-[var(--neutral-200)] px-5" onClick={() => toast.success('Exporting inventory...')}>
          <Download className="w-4 h-4" /> Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New inventory item coming soon')}>
          New item
        </ToolbarPrimaryButton>
      </PageToolbar>

      <ToolbarSummaryBar
        segments={[
          { key: 'ok', label: 'In Stock', value: INVENTORY.filter(i => i.status === 'ok').length, color: 'var(--mw-yellow-400)' },
          { key: 'low', label: 'Low Stock', value: totals.low, color: 'var(--mw-mirage)' },
          { key: 'out', label: 'Out of Stock', value: totals.out, color: 'var(--neutral-400)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <MwDataTable
        columns={inventoryColumns}
        data={filtered}
        keyExtractor={(item) => item.id}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        emptyState={<EmptyState variant="inline" title="No items match your search." />}
      />
    </PageShell>
  );
}
