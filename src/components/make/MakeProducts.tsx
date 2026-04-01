/**
 * MakeProducts — Products page for the Make module at /make/products.
 * Shows products relevant to manufacturing with BOM and routing info.
 */

import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  bomStatus: 'complete' | 'draft' | 'missing';
  routingSteps: number;
  defaultWorkCentre: string;
  unitCost: number;
}

const PRODUCTS: Product[] = [
  { id: '1', sku: 'PROD-SR-001', name: 'Server Rack Chassis', category: 'Sheet Metal', bomStatus: 'complete', routingSteps: 6, defaultWorkCentre: 'Laser → CNC → Weld', unitCost: 1280 },
  { id: '2', sku: 'PROD-MB-002', name: 'Mounting Bracket Assembly', category: 'Fabrication', bomStatus: 'complete', routingSteps: 4, defaultWorkCentre: 'Laser → Bend → Pack', unitCost: 85 },
  { id: '3', sku: 'PROD-CT-003', name: 'Cable Tray Support', category: 'Structural', bomStatus: 'draft', routingSteps: 3, defaultWorkCentre: 'Cut → Weld → Coat', unitCost: 210 },
  { id: '4', sku: 'PROD-MG-004', name: 'Machine Guard Panel', category: 'Sheet Metal', bomStatus: 'complete', routingSteps: 5, defaultWorkCentre: 'Laser → Bend → Weld → Coat → Pack', unitCost: 340 },
  { id: '5', sku: 'PROD-AE-005', name: 'Aluminium Enclosure Panel', category: 'Sheet Metal', bomStatus: 'missing', routingSteps: 0, defaultWorkCentre: '—', unitCost: 0 },
  { id: '6', sku: 'PROD-RP-006', name: 'Rail Platform Component', category: 'Structural', bomStatus: 'complete', routingSteps: 7, defaultWorkCentre: 'Cut → Drill → Weld → Blast → Coat → QC → Pack', unitCost: 1750 },
];

export function MakeProducts() {
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageShell>
      <PageHeader
        title="Products"
        subtitle={`${PRODUCTS.length} products with manufacturing data`}
        actions={<ToolbarPrimaryButton label="New Product" onClick={() => toast('New product form coming soon')} />}
      />

      <div className="flex items-center gap-3 px-6 pb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-[var(--border)]"
          />
        </div>
        <ToolbarFilterButton onClick={() => toast('Filter panel coming soon')} />
      </div>

      <div className="px-6">
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">BOM</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Routing</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Default Work Centre</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--mw-mirage)] tabular-nums">{p.sku}</td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-700)]">{p.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-[var(--border)] text-xs">{p.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.bomStatus === 'complete' ? 'completed' : p.bomStatus === 'draft' ? 'draft' : 'overdue'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-600)] tabular-nums">{p.routingSteps > 0 ? `${p.routingSteps} steps` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-600)]">{p.defaultWorkCentre}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--neutral-900)] text-right tabular-nums">
                    {p.unitCost > 0 ? `$${p.unitCost.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
