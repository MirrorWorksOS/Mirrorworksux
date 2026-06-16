/**
 * Control Products — product master data catalogue.
 * Reads the live product catalog from controlService (single source of
 * truth shared with Inventory / Plan / Sell) and hosts the bulk
 * export → edit → re-import flow via <DataRoundTrip>.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Package, Boxes, Download, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'motion/react';
import { staggerContainer } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FilterBar } from '@/components/shared/layout/FilterBar';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { studioProductIdForCatalogId } from '@/lib/product-studio-catalog-map';
import { DataRoundTrip, exportAdapterCsv } from '@/components/shared/round-trip/DataRoundTrip';
import { controlService } from '@/services';
import type { Product } from '@/types/entities';
import { productsRoundTripAdapter } from './productsRoundTripAdapter';

type CatalogRow = Product & { hasBom: boolean };

const CATEGORIES_DEFAULT = ['All'];
const TYPES = ['All', 'Manufactured', 'Purchased'];

function buildControlProductColumns(
  navigate: ReturnType<typeof useNavigate>,
): MwColumnDef<CatalogRow>[] {
  const openStudio = (p: CatalogRow) => {
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
    key: 'product', header: 'Product', tooltip: 'Product name',
    cell: (p) => (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
        <span className="text-sm text-foreground font-medium">{p.description}</span>
      </div>
    ),
  },
  { key: 'sku', header: 'SKU', tooltip: 'Stock-keeping unit code', cell: (p) => <span className="text-xs font-medium text-[var(--neutral-500)]">{p.sku ?? p.partNumber}</span> },
  { key: 'category', header: 'Category', tooltip: 'Product category', cell: (p) => <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs">{p.category}</Badge> },
  {
    key: 'type', header: 'Type', headerClassName: 'text-center', tooltip: 'Manufactured or purchased',
    cell: (p) => (
      <div className="flex justify-center">
        <StatusBadge variant={p.isManufactured ? 'accent' : 'neutral'}>
          {p.isManufactured ? 'Manufactured' : 'Purchased'}
        </StatusBadge>
      </div>
    ),
  },
  {
    key: 'cost', header: 'Cost', headerClassName: 'text-right', className: 'text-right tabular-nums', tooltip: 'Standard cost price',
    cell: (p) => <span className="text-sm font-medium text-foreground">{p.standardCost !== undefined ? `$${p.standardCost.toFixed(2)}` : '—'}</span>,
  },
  {
    key: 'sell', header: 'Sell', headerClassName: 'text-right', className: 'text-right tabular-nums', tooltip: 'Unit sell price',
    cell: (p) => <span className="text-sm font-medium text-foreground">{p.unitPrice > 0 ? `$${p.unitPrice.toFixed(2)}` : '—'}</span>,
  },
  {
    key: 'bom', header: 'BOM', headerClassName: 'text-center', tooltip: 'Has a Bill of Materials',
    cell: (p) => (
      <div className="flex justify-center">
        {p.hasBom
          ? <Badge className="bg-[var(--neutral-100)] text-foreground border-0 text-xs rounded-full px-2 py-0.5">Yes</Badge>
          : <span className="text-xs text-[var(--neutral-400)]">{'—'}</span>
        }
      </div>
    ),
  },
  {
    key: 'studio',
    header: 'Studio',
    tooltip: 'Product Studio — configurable product builder',
    headerClassName: 'w-[1%] whitespace-nowrap',
    className: 'w-[1%] whitespace-nowrap',
    cell: (p) => (
      <div className="flex justify-end">
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

export function ControlProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CatalogRow[]>([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [type,     setType]     = useState('All');

  const refresh = () => {
    controlService.getProductCatalog().then(setProducts);
  };
  useEffect(refresh, []);

  const columns = useMemo(() => buildControlProductColumns(navigate), [navigate]);

  const categories = useMemo(
    () => [...CATEGORIES_DEFAULT, ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products],
  );

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const sku = (p.sku ?? p.partNumber).toLowerCase();
    const matchSearch   = p.description.toLowerCase().includes(q) || sku.includes(q);
    const matchCategory = category === 'All' || p.category === category;
    const matchType     = type === 'All' || (type === 'Manufactured') === Boolean(p.isManufactured);
    return matchSearch && matchCategory && matchType;
  });

  const activeCount = products.filter(p => p.isActive).length;
  const inactiveCount = products.filter(p => !p.isActive).length;
  const manufacturedCount = products.filter(p => p.isManufactured).length;
  const purchasedCount = products.filter(p => !p.isManufactured).length;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-foreground">Product master</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {activeCount} active products
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[48px] border-[var(--border)] gap-2"
            onClick={() => exportAdapterCsv(productsRoundTripAdapter)}
          >
            <Download className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Export
          </Button>
          <DataRoundTrip adapter={productsRoundTripAdapter} onApplied={refresh} />
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[48px] border-[var(--border)] gap-2"
            onClick={() => navigate('/control/inventory')}
          >
            <Warehouse className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Inventory
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[48px] border-[var(--border)] gap-2"
            onClick={() => navigate('/plan/product-studio')}
          >
            <Boxes className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Product Studio
          </Button>
          <Button
            className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2"
            onClick={() => navigate('/make/products/new')}
          >
            <Plus className="w-4 h-4" /> New product
          </Button>
        </div>
      </div>

      <ToolbarSummaryBar
        segments={[
          { key: 'active', label: 'Active', value: activeCount, color: 'var(--mw-yellow-400)' },
          { key: 'inactive', label: 'Inactive', value: inactiveCount, color: 'var(--neutral-400)' },
          { key: 'manufactured', label: 'Manufactured', value: manufacturedCount, color: 'var(--mw-mirage)' },
          { key: 'purchased', label: 'Purchased', value: purchasedCount, color: 'var(--neutral-200)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <MwDataTable<CatalogRow>
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        selectable
        onRowClick={(p) => navigate(`/make/products/${p.id}`)}
        onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        filterBar={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or SKU..."
            filters={
              <>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-44 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-40 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            }
          />
        }
        emptyState={<EmptyState variant="inline" title="No products match your filters." />}
      />
    </motion.div>
  );
}
