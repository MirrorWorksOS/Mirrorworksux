/**
 * Sell Products - Product card view with Card/List toggle
 * Shows product image, name, SKU, category, stock level, unit price
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Grid3x3, List, Package, ShoppingCart } from 'lucide-react';
import { products as centralProducts } from '@/services/mock';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';


interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockLevel: number;
  reorderPoint: number;
  unitPrice: number;
  imageUrl?: string;
}

// Bridge centralized Product data to the local shape expected by rendering code.
// stockLevel and reorderPoint are synthesized from weightKg as a deterministic seed
// until real inventory data is available.
const mockProducts: Product[] = centralProducts
  .filter((p) => p.isActive)
  .map((p) => ({
    id: p.id,
    name: p.description,
    sku: p.partNumber,
    category: p.category,
    stockLevel: Math.round(p.weightKg * 10),
    reorderPoint: Math.round(p.weightKg * 3),
    unitPrice: p.unitPrice,
    imageUrl: p.imageUrl,
  }));

const getStockBadgeProps = (stockLevel: number, reorderPoint: number) => {
  if (stockLevel === 0) return { variant: 'error' as const, label: 'Out of stock' };
  if (stockLevel < reorderPoint) return { variant: 'warning' as const, label: 'Low stock' };
  return { variant: 'success' as const, label: 'In stock' };
};

export function SellProducts() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const summaryByCategory = {
    rawMaterials: mockProducts.filter(p => p.category === 'Raw Materials').length,
    finishedGoods: mockProducts.filter(p => p.category === 'Finished Goods').length,
    consumables: mockProducts.filter(p => p.category === 'Consumables').length,
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
    { key: 'category', header: 'Category', cell: (p) => <span className="text-[var(--neutral-600)]">{p.category}</span> },
    { key: 'stock', header: 'Stock', tooltip: 'Current stock level in units', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (p) => p.stockLevel },
    { key: 'unitPrice', header: 'Unit price', tooltip: 'Sell price per unit excl. tax', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (p) => `$${p.unitPrice.toFixed(2)}` },
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
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New product form coming soon')}>
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
                  radius="rounded-[var(--shape-lg)]"
                  className="h-full min-h-0"
                >
                  <Card
                    variant="flat"
                    className="group h-full cursor-pointer overflow-hidden border-[var(--border)] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
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
                          ${product.unitPrice.toFixed(2)}
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
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          striped
        />
      )}

      {filteredProducts.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or create a new product"
            action={{ label: "Create Product", onClick: () => toast('New product form coming soon'), icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
