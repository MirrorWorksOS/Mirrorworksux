/**
 * Plan Products — product catalogue with production context
 * Lead time, routing steps, work centres, BOM status
 */
import React, { useState } from 'react';
import { Search, ExternalLink, Package } from 'lucide-react';
import { Input } from '../ui/input';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


const PRODUCTS = [
  { id: '1', name: 'Server Rack Chassis',            sku: 'PROD-SR-001', category: 'Finished Goods',  leadTime: 12, routingSteps: 6, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Welding', 'Finishing'],  cycleHrs: 12,  lastProduced: 'Mar 18' },
  { id: '2', name: 'Structural Bracket Type A',       sku: 'PROD-BP-002', category: 'Finished Goods',  leadTime: 5,  routingSteps: 4, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Finishing'],             cycleHrs: 2.25,lastProduced: 'Mar 12' },
  { id: '3', name: 'Aluminium Enclosure 600x400',     sku: 'PROD-AE-003', category: 'Finished Goods',  leadTime: 8,  routingSteps: 8, hasBOM: true,  workCenters: ['Machining', 'Forming', 'Assembly'],            cycleHrs: 8,   lastProduced: 'Mar 10' },
  { id: '4', name: 'Rail Platform Guard',             sku: 'PROD-RPG-004',category: 'Finished Goods',  leadTime: 18, routingSteps: 5, hasBOM: true,  workCenters: ['Cutting', 'Welding', 'Finishing'],             cycleHrs: 16,  lastProduced: 'Feb 28' },
  { id: '5', name: 'Machine Guard Panel',             sku: 'PROD-MG-005', category: 'Finished Goods',  leadTime: 7,  routingSteps: 4, hasBOM: false, workCenters: ['Cutting', 'Forming', 'Finishing'],             cycleHrs: 3.5, lastProduced: 'Feb 20' },
  { id: '6', name: 'Custom Electrical Cabinet',       sku: 'PROD-EC-006', category: 'Finished Goods',  leadTime: 25, routingSteps: 9, hasBOM: false, workCenters: ['Cutting', 'Forming', 'Welding', 'Assembly'],   cycleHrs: 22,  lastProduced: '—' },
];

type PlanProduct = (typeof PRODUCTS)[number];

const planProductColumns: MwColumnDef<PlanProduct>[] = [
  {
    key: 'name',
    header: 'Product',
    cell: (p) => (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
        <span className="font-medium text-[var(--mw-mirage)]">{p.name}</span>
      </div>
    ),
  },
  { key: 'sku', header: 'SKU', className: 'text-xs tabular-nums text-[var(--neutral-500)]', cell: (p) => p.sku },
  { key: 'leadTime', header: 'Lead time', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (p) => `${p.leadTime}d` },
  { key: 'cycleHrs', header: 'Cycle hrs', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (p) => `${p.cycleHrs}h` },
  { key: 'routingSteps', header: 'Routing steps', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (p) => p.routingSteps },
  {
    key: 'workCenters',
    header: 'Work centres',
    cell: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.workCenters.slice(0, 3).map(wc => (
          <span key={wc} className="text-[10px] bg-[var(--neutral-100)] text-[var(--neutral-500)] px-1.5 py-0.5 rounded">{wc}</span>
        ))}
        {p.workCenters.length > 3 && <span className="text-[10px] text-[var(--neutral-500)]">+{p.workCenters.length - 3}</span>}
      </div>
    ),
  },
  {
    key: 'bom',
    header: 'BOM',
    cell: (p) =>
      p.hasBOM
        ? <StatusBadge variant="neutral">Yes</StatusBadge>
        : <StatusBadge variant="warning">Missing</StatusBadge>,
  },
  { key: 'lastProduced', header: 'Last produced', className: 'text-[var(--neutral-500)]', cell: (p) => p.lastProduced },
];

export function PlanProducts() {
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
      <PageHeader
        title="Products"
        subtitle={`${PRODUCTS.length} products · ${PRODUCTS.filter(p => p.hasBOM).length} with BOMs${PRODUCTS.filter(p => !p.hasBOM).length > 0 ? ` · ${PRODUCTS.filter(p => !p.hasBOM).length} missing BOM` : ''}`}
        actions={
          <p className="text-xs text-[var(--neutral-500)] bg-[var(--neutral-100)] px-3 py-2 rounded-[var(--shape-lg)]">
            Product master managed in <span className="font-medium">Control → Products</span>
          </p>
        }
      />

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] text-sm" />
      </div>

      <MwDataTable
        columns={planProductColumns}
        data={filtered}
        keyExtractor={(p) => p.id}
      />
    </PageShell>
  );
}
