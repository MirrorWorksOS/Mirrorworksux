/**
 * Sell Products - Product card view with Card/List toggle
 * Shows product image, name, SKU, category, stock level, unit price
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, Grid3x3, List, Package, DollarSign } from 'lucide-react';
import { EmptyState } from '../shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus, AnimatedFilter, AnimatedSearch } from '../ui/animated-icons';


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

const getStockBadge = (stockLevel: number, reorderPoint: number) => {
  if (stockLevel === 0) return { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]', label: 'Out of stock' };
  if (stockLevel < reorderPoint) return { bg: 'bg-[var(--mw-yellow-400)]/20', text: 'text-[var(--neutral-900)]', label: 'Low stock' };
  return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-900)]', label: 'In stock' };
};

export function SellProducts() {
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--neutral-900)]">Products</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">{filteredProducts.length} total products</p>
        </div>
        <div className="flex gap-3">
          <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--neutral-900)] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
          <Input
            placeholder="Search products..."
            className="pl-10 h-10 border-[var(--border)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter */}
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
          <AnimatedFilter className="w-4 h-4" />
          Filter
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "p-2 rounded transition-all duration-200",
              viewMode === 'card'
                ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded transition-all duration-200",
              viewMode === 'list'
                ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, idx) => {
            const stockBadge = getStockBadge(product.stockLevel, product.reorderPoint);
            return (
              <motion.div key={product.id} variants={staggerItem} custom={idx}>
                <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group">
                  {/* Product Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-[var(--neutral-100)] to-[var(--border)] flex items-center justify-center">
                    <Package className="w-16 h-16 text-[var(--neutral-400)]" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[var(--neutral-900)] group-hover:text-[var(--mw-yellow-400)] transition-colors line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className=" text-xs text-[var(--neutral-500)]">{product.sku}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-600)] border-0 text-xs">{product.category}</Badge>
                      <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", stockBadge.bg, stockBadge.text)}>
                        {stockBadge.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <div>
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Stock Level</p>
                        <p className=" text-sm font-semibold text-[var(--neutral-900)]">
                          {product.stockLevel} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Unit Price</p>
                        <p className=" text-sm font-semibold text-[var(--neutral-900)]">
                          ${product.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">PRODUCT</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">CATEGORY</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">STOCK</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">UNIT PRICE</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => {
                  const stockBadge = getStockBadge(product.stockLevel, product.reorderPoint);
                  return (
                    <tr key={product.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[var(--neutral-100)]")}>
                      <td className="px-4">
                        <a href={`/sell/products/${product.id}`} className="text-sm font-medium text-[var(--neutral-900)] hover:underline">
                          {product.name}
                        </a>
                      </td>
                      <td className="px-4  text-sm text-[var(--neutral-600)]">{product.sku}</td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">{product.category}</td>
                      <td className="px-4 text-right  text-sm font-medium">{product.stockLevel}</td>
                      <td className="px-4 text-right  text-sm font-medium text-[var(--neutral-900)]">
                        ${product.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", stockBadge.bg, stockBadge.text)}>
                            {stockBadge.label}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredProducts.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or create a new product"
            action={{ label: "Create Product", onClick: () => {}, icon: Plus }}
          />
        </Card>
      )}
    </motion.div>
  );
}
