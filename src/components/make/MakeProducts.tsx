/**
 * MakeProducts — Products page for the Make module at /make/products.
 * Card/List toggle with manufacturing-specific data (BOM, routing, work centres).
 * Each card has a prominent "Make" CTA to start a Manufacturing Order.
 */

import React, { useState } from 'react';
import { Plus, Grid3x3, List, Package, Play } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { useNavigate } from 'react-router';
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

const getBomBadgeProps = (status: Product['bomStatus']) => {
  if (status === 'complete') return { variant: 'success' as const, label: 'Completed' };
  if (status === 'draft') return { variant: 'warning' as const, label: 'Draft' };
  return { variant: 'error' as const, label: 'Missing' };
};

const productColumns: MwColumnDef<Product>[] = [
  {
    key: 'sku',
    header: 'SKU',
    cell: (p) => <span className="font-medium text-[var(--mw-mirage)] tabular-nums">{p.sku}</span>,
  },
  {
    key: 'name',
    header: 'Product',
    cell: (p) => <span className="text-[var(--neutral-700)]">{p.name}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    cell: (p) => <Badge variant="outline" className="border-[var(--border)] text-xs">{p.category}</Badge>,
  },
  {
    key: 'bom',
    header: 'BOM',
    cell: (p) => {
      const badge = getBomBadgeProps(p.bomStatus);
      return <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>;
    },
  },
  {
    key: 'routing',
    header: 'Routing',
    cell: (p) => <span className="text-[var(--neutral-600)] tabular-nums">{p.routingSteps > 0 ? `${p.routingSteps} steps` : '—'}</span>,
  },
  {
    key: 'workCentre',
    header: 'Default Work Centre',
    cell: (p) => <span className="text-[var(--neutral-600)]">{p.defaultWorkCentre}</span>,
  },
  {
    key: 'unitCost',
    header: 'Unit Cost',
    headerClassName: 'text-right',
    className: 'text-right font-medium text-[var(--neutral-900)] tabular-nums',
    cell: (p) => p.unitCost > 0 ? `$${p.unitCost.toLocaleString()}` : '—',
  },
];

export function MakeProducts() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleMake = (product: Product) => {
    toast.success(`Manufacturing order started for ${product.name}`);
    navigate('/make/manufacturing-orders/new');
  };

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${filtered.length} products with manufacturing data`}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search products…" />
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

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, idx) => {
            const bomBadge = getBomBadgeProps(product.bomStatus);
            const canMake = product.bomStatus === 'complete';
            return (
              <motion.div key={product.id} variants={staggerItem} custom={idx}>
                <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden hover:shadow-md transition-all duration-200 group">
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
                      <StatusBadge variant={bomBadge.variant}>{bomBadge.label}</StatusBadge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Routing</p>
                        <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                          {product.routingSteps > 0 ? `${product.routingSteps} steps` : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Unit Cost</p>
                        <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                          {product.unitCost > 0 ? `$${product.unitCost.toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleMake(product)}
                      disabled={!canMake}
                      className="w-full mt-4 h-14 min-h-[56px] gap-2 text-base font-medium bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5" />
                      Make
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <MwDataTable<Product>
          columns={productColumns}
          data={filtered}
          keyExtractor={(p) => p.id}
          striped
        />
      )}

      {filtered.length === 0 && (
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
