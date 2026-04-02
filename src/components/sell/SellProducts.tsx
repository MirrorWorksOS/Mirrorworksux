/**
 * Sell Products - Product card view with Card/List toggle
 * Shows product image, name, SKU, category, stock level, unit price
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Grid3x3, List, Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
  image?: string;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Mild Steel Sheet 1200x2400x3mm', sku: 'MAT-MS-001', category: 'Raw Materials', stockLevel: 45, reorderPoint: 20, unitPrice: 285.50 },
  { id: '2', name: 'Aluminium Angle 50x50x5mm', sku: 'MAT-AL-042', category: 'Raw Materials', stockLevel: 12, reorderPoint: 15, unitPrice: 42.80 },
  { id: '3', name: 'Server Rack Chassis - Custom', sku: 'PROD-SR-001', category: 'Finished Goods', stockLevel: 3, reorderPoint: 5, unitPrice: 1250.00 },
  { id: '4', name: 'Structural I-Beam 150mm', sku: 'MAT-STL-156', category: 'Raw Materials', stockLevel: 28, reorderPoint: 10, unitPrice: 385.00 },
  { id: '5', name: 'Welding Rod ER70S-6 4mm', sku: 'CONS-WR-001', category: 'Consumables', stockLevel: 150, reorderPoint: 50, unitPrice: 8.50 },
  { id: '6', name: 'Powder Coat - Black Matt', sku: 'CONS-PC-BLK', category: 'Consumables', stockLevel: 35, reorderPoint: 20, unitPrice: 65.00 },
];

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

  const productColumns: MwColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      cell: (p) => (
        <a href={`/sell/products/${p.id}`} className="text-sm font-medium text-[var(--neutral-900)] hover:underline">
          {p.name}
        </a>
      ),
    },
    { key: 'sku', header: 'SKU', className: 'tabular-nums text-[var(--neutral-600)]', cell: (p) => p.sku },
    { key: 'category', header: 'Category', cell: (p) => <span className="text-[var(--neutral-600)]">{p.category}</span> },
    { key: 'stock', header: 'Stock', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (p) => p.stockLevel },
    { key: 'unitPrice', header: 'Unit price', headerClassName: 'text-right', className: 'text-right font-medium tabular-nums', cell: (p) => `$${p.unitPrice.toFixed(2)}` },
    {
      key: 'status',
      header: 'Status',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, idx) => {
            const stockBadge = getStockBadgeProps(product.stockLevel, product.reorderPoint);
            return (
              <motion.div key={product.id} variants={staggerItem} custom={idx}>
                <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="h-40 bg-[var(--neutral-100)] flex items-center justify-center">
                    <Package className="w-16 h-16 text-[var(--neutral-400)]" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-[var(--neutral-900)] group-hover:text-[var(--mw-yellow-400)] transition-colors line-clamp-2 mb-1">
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
                        <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                          {product.stockLevel} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Unit Price</p>
                        <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                          ${product.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Sales order started for ${product.name}`);
                        navigate('/sell/orders/new');
                      }}
                      className="w-full mt-4 h-10 gap-2 text-sm font-medium bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[#2C2C2C]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Sell
                    </Button>
                  </div>
                </Card>
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
