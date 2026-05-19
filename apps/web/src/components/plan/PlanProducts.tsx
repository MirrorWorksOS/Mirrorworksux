/**
 * Plan Products — product catalogue with production context
 * Lead time, routing steps, work centres, BOM status
 */
import React, { useMemo, useState } from 'react';
import { Search, Package, Boxes } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { toast } from 'sonner';
import { studioProductIdForCatalogId } from '@/lib/product-studio-catalog-map';
import { products as centralProducts } from '@/services';

// Plan-flavoured view onto the canonical product catalogue (Sell > Products,
// Control > Products). Production fields (leadTime/cycleHrs/routing/BOM) are
// derived locally — backend wires them in when the engineering tables land.
interface PlanProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  leadTime: number;
  routingSteps: number;
  hasBOM: boolean;
  workCenters: string[];
  cycleHrs: number;
  lastProduced: string;
}

const PRODUCTION_OVERRIDES: Record<string, Partial<PlanProduct>> = {
  'prod-001': { leadTime: 5,  routingSteps: 4, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Finishing'],            cycleHrs: 2.25, lastProduced: 'Mar 12' },
  'prod-002': { leadTime: 6,  routingSteps: 3, hasBOM: true,  workCenters: ['Cutting', 'Finishing'],                       cycleHrs: 1.50, lastProduced: 'Mar 14' },
  'prod-003': { leadTime: 8,  routingSteps: 8, hasBOM: true,  workCenters: ['Machining', 'Forming', 'Assembly'],           cycleHrs: 8.00, lastProduced: 'Mar 10' },
  'prod-004': { leadTime: 12, routingSteps: 6, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Welding', 'Finishing'], cycleHrs: 12.0, lastProduced: 'Mar 18' },
  'prod-005': { leadTime: 7,  routingSteps: 4, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Finishing'],             cycleHrs: 3.50, lastProduced: 'Feb 28' },
  'prod-006': { leadTime: 14, routingSteps: 5, hasBOM: false, workCenters: ['Cutting', 'Forming', 'Finishing'],             cycleHrs: 6.00, lastProduced: 'Feb 20' },
  'prod-007': { leadTime: 9,  routingSteps: 5, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Welding'],               cycleHrs: 4.00, lastProduced: 'Feb 25' },
  'prod-008': { leadTime: 28, routingSteps: 9, hasBOM: true,  workCenters: ['Cutting', 'Welding', 'Finishing'],             cycleHrs: 32.0, lastProduced: 'Feb 14' },
  'prod-009': { leadTime: 18, routingSteps: 5, hasBOM: true,  workCenters: ['Cutting', 'Welding', 'Finishing'],             cycleHrs: 16.0, lastProduced: 'Feb 18' },
  'prod-010': { leadTime: 25, routingSteps: 9, hasBOM: false, workCenters: ['Cutting', 'Forming', 'Welding', 'Assembly'],   cycleHrs: 22.0, lastProduced: '—' },
};

const DEFAULT_PRODUCTION: Pick<PlanProduct, 'leadTime' | 'routingSteps' | 'hasBOM' | 'workCenters' | 'cycleHrs' | 'lastProduced'> = {
  leadTime: 0, routingSteps: 0, hasBOM: false, workCenters: [], cycleHrs: 0, lastProduced: '—',
};

function toPlanProduct(p: typeof centralProducts[number]): PlanProduct {
  const overrides = PRODUCTION_OVERRIDES[p.id] ?? {};
  return {
    id: p.id,
    name: p.description,
    sku: p.partNumber,
    category: p.category,
    ...DEFAULT_PRODUCTION,
    ...overrides,
  } as PlanProduct;
}

function buildPlanProductColumns(
  navigate: ReturnType<typeof useNavigate>,
): MwColumnDef<PlanProduct>[] {
  const openStudio = (p: PlanProduct) => {
    const sid = studioProductIdForCatalogId(p.id);
    if (sid) navigate(`/plan/product-studio/${sid}`);
    else {
      toast.message('No configurator record for this SKU', {
        description: 'Open Product Studio to build configurable products.',
      });
      navigate('/plan/product-studio');
    }
  };

  return [
  {
    key: 'name',
    header: 'Product',
    tooltip: 'Product name',
    cell: (p) => (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
        <Link to={`/plan/products/${p.id}`} className="font-medium text-foreground hover:underline">{p.name}</Link>
      </div>
    ),
  },
  { key: 'sku', header: 'SKU', tooltip: 'Stock keeping unit', className: 'text-xs tabular-nums text-[var(--neutral-500)]', cell: (p) => p.sku },
  { key: 'leadTime', header: 'Lead time', tooltip: 'Manufacturing lead time in days', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (p) => `${p.leadTime}d` },
  { key: 'cycleHrs', header: 'Cycle hrs', tooltip: 'Total cycle hours per unit', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (p) => `${p.cycleHrs}h` },
  { key: 'routingSteps', header: 'Routing steps', tooltip: 'Number of production steps', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (p) => p.routingSteps },
  {
    key: 'workCenters',
    header: 'Work centres',
    tooltip: 'Assigned production work centres',
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
    tooltip: 'Bill of materials status',
    cell: (p) =>
      p.hasBOM
        ? <StatusBadge variant="neutral">Yes</StatusBadge>
        : <StatusBadge variant="warning">Missing</StatusBadge>,
  },
  { key: 'lastProduced', header: 'Last produced', tooltip: 'Most recent production date', className: 'tabular-nums text-[var(--neutral-500)]', cell: (p) => p.lastProduced },
  {
    key: 'studio',
    header: 'Studio',
    tooltip: 'Product Studio — configurable product builder',
    headerClassName: 'w-[1%] whitespace-nowrap',
    className: 'w-[1%] whitespace-nowrap',
    cell: (p) => (
      <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-[var(--border)] text-xs shrink-0"
          onClick={() => openStudio(p)}
        >
          {studioProductIdForCatalogId(p.id) ? 'Open in Studio' : 'Studio'}
        </Button>
      </div>
    ),
  },
];
}

export function PlanProducts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const columns = useMemo(() => buildPlanProductColumns(navigate), [navigate]);

  // Source of truth is the central product catalogue — any change made in
  // Sell > Products (or Control > Products) flows through here automatically.
  const products = useMemo(() => centralProducts.map(toPlanProduct), []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products · ${products.filter(p => p.hasBOM).length} with BOMs${products.filter(p => !p.hasBOM).length > 0 ? ` · ${products.filter(p => !p.hasBOM).length} missing BOM` : ''}`}
        actions={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-[var(--border)] gap-2"
              onClick={() => navigate('/plan/product-studio')}
            >
              <Boxes className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Product Studio
            </Button>
            <p className="text-xs text-[var(--neutral-500)] bg-[var(--neutral-100)] px-3 py-2 rounded-lg max-w-md">
              Product master in <span className="font-medium">Control → Products</span>
              . Use Product Studio for configurable products, options, and rules.
            </p>
          </div>
        }
      />

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-lg text-sm" />
      </div>

      <ToolbarSummaryBar
        segments={[
          { key: 'withBom', label: 'With BOM', value: products.filter(p => p.hasBOM).length, color: 'var(--mw-yellow-400)' },
          { key: 'missingBom', label: 'Missing BOM', value: products.filter(p => !p.hasBOM).length, color: 'var(--mw-mirage)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <MwDataTable
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => navigate(`/plan/products/${p.id}`)}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
      />
    </PageShell>
  );
}
