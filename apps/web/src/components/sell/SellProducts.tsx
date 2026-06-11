/**
 * Sell Products - Product card view with Card/List toggle
 * Shows product image, name, SKU, category, stock level, unit price.
 * List view supports inline + bulk editing of unit price and fulfilment
 * route; edits persist into the central mock array across navigation.
 */

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Grid3x3, List, Package, ShoppingCart, Check, Route as RouteIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { products as centralProducts } from '@/services';
import type { ProductRoute } from '@/types/entities';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { RouteChip } from '@/components/workflow/RouteChip';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';

// Tenant is Australian (Alliance Metal) — prices render in AUD everywhere.
const AUD = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

const ROUTE_OPTIONS: { value: ProductRoute; label: string }[] = [
  { value: 'mto', label: 'Make-to-Order' },
  { value: 'stock_sale', label: 'Stock Sale' },
  { value: 'eto', label: 'Engineer-to-Order' },
];

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockLevel: number;
  reorderPoint: number;
  unitPrice: number;
  defaultRoute: ProductRoute;
  imageUrl?: string;
}

// Bridge centralized Product data to the local shape expected by rendering code.
// stockLevel and reorderPoint are synthesized from weightKg as a deterministic seed
// until real inventory data is available.
const toRow = (p: (typeof centralProducts)[number]): Product => ({
  id: p.id,
  name: p.description,
  sku: p.partNumber,
  category: p.category,
  stockLevel: Math.round(p.weightKg * 10),
  reorderPoint: Math.round(p.weightKg * 3),
  unitPrice: p.unitPrice,
  defaultRoute: p.defaultRoute ?? 'mto',
  imageUrl: p.imageUrl,
});

const getStockBadgeProps = (stockLevel: number, reorderPoint: number) => {
  if (stockLevel === 0) return { variant: 'error' as const, label: 'Out of stock' };
  if (stockLevel < reorderPoint) return { variant: 'warning' as const, label: 'Low stock' };
  return { variant: 'success' as const, label: 'In stock' };
};

export function SellProducts() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  // Local rows mirror the central mock array; edits write through to both so
  // they survive navigation (the central array is a module singleton).
  const [rows, setRows] = useState<Product[]>(() =>
    centralProducts.filter((p) => p.isActive).map(toRow),
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState('');

  // Write a patch through to the central mock array AND local state.
  const persist = useCallback(
    (ids: string[], patch: Partial<Pick<Product, 'unitPrice' | 'defaultRoute'>>) => {
      ids.forEach((id) => {
        const src = centralProducts.find((p) => p.id === id);
        if (!src) return;
        if (patch.unitPrice !== undefined) src.unitPrice = patch.unitPrice;
        if (patch.defaultRoute !== undefined) src.defaultRoute = patch.defaultRoute;
      });
      setRows((prev) =>
        prev.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)),
      );
    },
    [],
  );

  const commitPrice = (id: string) => {
    const n = Number(priceDraft);
    if (!Number.isNaN(n) && n >= 0) {
      persist([id], { unitPrice: n });
      toast.success(`Price updated to ${AUD.format(n)}`);
    }
    setEditingPriceId(null);
  };

  const applyBulkRoute = (route: ProductRoute, clear: () => void) => {
    const ids = [...selectedKeys].map(String);
    persist(ids, { defaultRoute: route });
    const label = ROUTE_OPTIONS.find((o) => o.value === route)?.label ?? route;
    toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} set to ${label}`);
    clear();
  };

  const applyBulkPrice = (factor: number, clear: () => void) => {
    const ids = [...selectedKeys].map(String);
    ids.forEach((id) => {
      const row = rows.find((r) => r.id === id);
      if (row) {
        const src = centralProducts.find((p) => p.id === id);
        const next = Math.round(row.unitPrice * factor * 100) / 100;
        if (src) src.unitPrice = next;
      }
    });
    setRows((prev) =>
      prev.map((r) =>
        ids.includes(r.id)
          ? { ...r, unitPrice: Math.round(r.unitPrice * factor * 100) / 100 }
          : r,
      ),
    );
    const pct = Math.round((factor - 1) * 100);
    toast.success(
      `${ids.length} price${ids.length === 1 ? '' : 's'} adjusted by ${pct > 0 ? '+' : ''}${pct}%`,
    );
    clear();
  };

  const filteredProducts = rows.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const summaryByCategory = {
    rawMaterials: rows.filter(p => p.category === 'Raw Materials').length,
    finishedGoods: rows.filter(p => p.category === 'Finished Goods').length,
    consumables: rows.filter(p => p.category === 'Consumables').length,
  };

  const productColumns: MwColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      tooltip: 'Product name and description',
      cell: (p) => (
        <a href={`/sell/products/${p.id}`} className="text-sm font-medium text-foreground hover:underline">
          {p.name}
        </a>
      ),
    },
    { key: 'sku', header: 'SKU', tooltip: 'Stock keeping unit code', className: 'tabular-nums text-[var(--neutral-600)]', cell: (p) => p.sku },
    {
      key: 'route',
      header: 'Route',
      tooltip: 'Fulfilment route — editable inline',
      cell: (p) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={p.defaultRoute}
            onValueChange={(v) => persist([p.id], { defaultRoute: v as ProductRoute })}
          >
            <SelectTrigger className="h-8 w-[150px] border-transparent bg-transparent px-2 hover:border-[var(--border)] hover:bg-card focus:border-[var(--border)]">
              <SelectValue>
                <RouteChip route={p.defaultRoute} size="sm" />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ROUTE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    { key: 'stock', header: 'Stock', tooltip: 'Current stock level in units', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (p) => p.stockLevel },
    {
      key: 'unitPrice',
      header: 'Unit price',
      tooltip: 'Sell price per unit excl. tax — click to edit',
      headerClassName: 'text-right',
      className: 'text-right font-medium tabular-nums',
      cell: (p) =>
        editingPriceId === p.id ? (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Input
              autoFocus
              type="number"
              min={0}
              step="0.01"
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              onBlur={() => commitPrice(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitPrice(p.id);
                if (e.key === 'Escape') setEditingPriceId(null);
              }}
              className="h-8 w-24 text-right tabular-nums"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPriceId(p.id);
              setPriceDraft(p.unitPrice.toFixed(2));
            }}
            className="rounded px-2 py-1 tabular-nums hover:bg-[var(--neutral-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]"
          >
            {AUD.format(p.unitPrice)}
          </button>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      tooltip: 'Stock availability status',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (p) => {
        const stockBadge = getStockBadgeProps(p.stockLevel, p.reorderPoint);
        return (
          <div className="flex items-center justify-center">
            <StatusBadge variant={stockBadge.variant}>{stockBadge.label}</StatusBadge>
          </div>
        );
      },
    },
  ];

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${filteredProducts.length} total products`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'rawMaterials', label: 'Raw Materials', value: summaryByCategory.rawMaterials, color: 'var(--mw-yellow-400)' },
          { key: 'finishedGoods', label: 'Finished Goods', value: summaryByCategory.finishedGoods, color: 'var(--mw-mirage)' },
          { key: 'consumables', label: 'Consumables', value: summaryByCategory.consumables, color: 'var(--neutral-400)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <PageToolbar>
        <ToolbarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search products…" />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <IconViewToggle
          value={viewMode}
          onChange={(k) => setViewMode(k as 'card' | 'list')}
          options={[
            { key: 'card', icon: Grid3x3, label: 'Card view' },
            { key: 'list', icon: List, label: 'List view' },
          ]}
        />
        <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/products/new')}>
          New Product
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Product Cards Grid */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, idx) => {
            const stockBadge = getStockBadgeProps(product.stockLevel, product.reorderPoint);
            return (
              <motion.div
                key={product.id}
                variants={staggerItem}
                custom={idx}
                className="h-full min-h-0"
              >
                <SpotlightCard
                  radius="rounded-lg"
                  className="h-full min-h-0"
                >
                  <Card
                    variant="interactive"
                    className="group h-full overflow-hidden border-[var(--border)] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                    onClick={() => navigate(`/sell/products/${product.id}`)}
                  >
                  <div className="h-40 bg-[var(--neutral-100)] flex items-center justify-center p-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-[var(--neutral-400)]" />
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[var(--neutral-500)] tabular-nums">{product.sku}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-600)] border-0 text-xs">{product.category}</Badge>
                      <RouteChip route={product.defaultRoute} size="sm" />
                      <StatusBadge variant={stockBadge.variant}>{stockBadge.label}</StatusBadge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Stock Level</p>
                        <p className="text-sm font-medium tabular-nums text-foreground">
                          {product.stockLevel} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Unit Price</p>
                        <p className="text-sm font-medium tabular-nums text-foreground">
                          {AUD.format(product.unitPrice)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Sales order started for ${product.name}`);
                        navigate('/sell/quotes/new');
                      }}
                      className="w-full mt-4 h-10 gap-2 text-sm font-medium bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Sell
                    </Button>
                  </div>
                  </Card>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <MwDataTable<Product>
          columns={productColumns}
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => navigate(`/sell/products/${p.id}`)}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          bulkActions={(_count, clear) => (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-[var(--neutral-600)]">
                    <RouteIcon className="w-4 h-4" strokeWidth={1.5} />
                    Set route
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Set fulfilment route</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ROUTE_OPTIONS.map((o) => (
                    <DropdownMenuItem key={o.value} onClick={() => applyBulkRoute(o.value, clear)}>
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-[var(--neutral-600)]">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    Adjust price
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Adjust unit price</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyBulkPrice(1.1, clear)}>
                    <TrendingUp className="w-4 h-4" /> Increase 10%
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyBulkPrice(1.05, clear)}>
                    <TrendingUp className="w-4 h-4" /> Increase 5%
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyBulkPrice(0.95, clear)}>
                    <TrendingDown className="w-4 h-4" /> Decrease 5%
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyBulkPrice(0.9, clear)}>
                    <TrendingDown className="w-4 h-4" /> Decrease 10%
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-[var(--neutral-600)]"
                onClick={() => { toast.success(`Exporting ${selectedKeys.size} items…`); }}
              >
                <Check className="w-4 h-4" strokeWidth={1.5} />
                Done
              </Button>
            </>
          )}
          striped
        />
      )}

      {filteredProducts.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or create a new product"
            action={{ label: "Create Product", onClick: () => navigate('/sell/products/new'), icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
