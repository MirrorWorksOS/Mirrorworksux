/**
 * MakeProducts — Products page for the Make module at /make/products.
 * Card/List toggle with manufacturing-specific data (BOM, routing, work centres).
 * Each card has a prominent "Make" CTA to start a Manufacturing Order.
 */

import React, { useState } from 'react';
import { Plus, Grid3x3, List, Package, Play, Layers } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
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

/* ── Mock BOM materials per product (keyed by product id) ── */
const BOM_MATERIALS: Record<string, { material: string; qty: string; unit: string }[]> = {
  '1': [
    { material: '2mm Mild Steel Sheet', qty: '4', unit: 'sheets' },
    { material: 'M6 Hex Bolts', qty: '24', unit: 'pcs' },
    { material: 'Rubber Gasket Strip', qty: '3.2', unit: 'm' },
    { material: 'Powder Coat — RAL 9005', qty: '0.8', unit: 'kg' },
  ],
  '2': [
    { material: '3mm Galvanised Steel', qty: '1', unit: 'sheet' },
    { material: 'M8 Flange Nuts', qty: '12', unit: 'pcs' },
  ],
  '3': [
    { material: '50x50x3 SHS Mild Steel', qty: '6', unit: 'm' },
    { material: 'Hot-Dip Galvanise', qty: '1', unit: 'batch' },
  ],
  '4': [
    { material: '1.6mm Mild Steel Sheet', qty: '2', unit: 'sheets' },
    { material: 'Weld Wire ER70S-6', qty: '0.5', unit: 'kg' },
    { material: 'Powder Coat — RAL 7035', qty: '0.4', unit: 'kg' },
  ],
  '6': [
    { material: '100x50x4 RHS Mild Steel', qty: '12', unit: 'm' },
    { material: 'Base Plate 20mm', qty: '4', unit: 'pcs' },
    { material: 'Primer Zinc-Rich', qty: '2', unit: 'L' },
    { material: 'Topcoat — RAL 1023', qty: '1.5', unit: 'L' },
    { material: 'M16 Anchor Bolts', qty: '16', unit: 'pcs' },
  ],
};

const WORK_CENTRES = [
  'Laser → CNC → Weld',
  'Laser → Bend → Pack',
  'Cut → Weld → Coat',
  'Laser → Bend → Weld → Coat → Pack',
  'Cut → Drill → Weld → Blast → Coat → QC → Pack',
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
    tooltip: 'Stock keeping unit identifier',
    cell: (p) => (
      <span className="font-medium text-foreground tabular-nums inline-flex items-center gap-1.5">
        <Package className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
        {p.sku}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Product',
    cell: (p) => <a href={`/make/products/${p.id}`} className="text-sm font-medium text-foreground hover:underline">{p.name}</a>,
  },
  {
    key: 'category',
    header: 'Category',
    cell: (p) => <Badge variant="outline" className="border-[var(--border)] text-xs">{p.category}</Badge>,
  },
  {
    key: 'bom',
    header: 'BOM',
    tooltip: 'Bill of Materials status',
    cell: (p) => {
      const badge = getBomBadgeProps(p.bomStatus);
      return <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>;
    },
  },
  {
    key: 'routing',
    header: 'Routing',
    tooltip: 'Number of manufacturing steps',
    cell: (p) => <span className="text-[var(--neutral-600)] tabular-nums">{p.routingSteps > 0 ? `${p.routingSteps} steps` : '—'}</span>,
  },
  {
    key: 'workCentre',
    header: 'Default Work Centre',
    tooltip: 'Manufacturing path through work centres',
    cell: (p) => <span className="text-[var(--neutral-600)]">{p.defaultWorkCentre}</span>,
  },
  {
    key: 'unitCost',
    header: 'Unit Cost',
    tooltip: 'Standard manufacturing cost per unit',
    headerClassName: 'text-right',
    className: 'text-right font-medium text-foreground tabular-nums',
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

  const completeCount = PRODUCTS.filter((p) => p.bomStatus === 'complete').length;
  const draftCount = PRODUCTS.filter((p) => p.bomStatus === 'draft').length;
  const missingCount = PRODUCTS.filter((p) => p.bomStatus === 'missing').length;
  const avgCost = Math.round(PRODUCTS.filter((p) => p.unitCost > 0).reduce((s, p) => s + p.unitCost, 0) / PRODUCTS.filter((p) => p.unitCost > 0).length);

  /* ── Create MO Dialog state ── */
  const [moDialogOpen, setMoDialogOpen] = useState(false);
  const [moProduct, setMoProduct] = useState<Product | null>(null);
  const [moQty, setMoQty] = useState('100');
  const [moDate, setMoDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [moWorkCentre, setMoWorkCentre] = useState('');
  const [moPriority, setMoPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [moNotes, setMoNotes] = useState('');

  const handleMake = (product: Product) => {
    setMoProduct(product);
    setMoWorkCentre(product.defaultWorkCentre);
    setMoQty('100');
    setMoPriority('medium');
    setMoNotes('');
    setMoDialogOpen(true);
  };

  const handleCreateMO = () => {
    if (!moProduct) return;
    setMoDialogOpen(false);
    toast.success(`Manufacturing order created for ${moProduct.name}`, {
      description: `Qty ${moQty} — due ${new Date(moDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    });
    navigate('/make/manufacturing-orders/mo-001');
  };

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${filtered.length} products with manufacturing data`}
      />

      <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Products', value: PRODUCTS.length, sub: `${filtered.length} shown`, bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'BOM Complete', value: completeCount, sub: 'Ready to manufacture', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'BOM Draft', value: draftCount, sub: 'In progress', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
          { label: 'BOM Missing', value: missingCount, sub: 'Needs attention', bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
        ].map(s => (
          <SpotlightCard
            key={s.label}
            radius="rounded-[var(--shape-lg)]"
            className="h-full min-h-0"
          >
            <Card variant="flat" className="h-full border-[var(--border)] p-6">
              <p className="mb-1 text-xs font-medium text-[var(--neutral-500)]">{s.label}</p>
              <p className={cn('text-2xl font-medium tabular-nums', s.text)}>{s.value}</p>
              <p className="mt-0.5 text-xs text-[var(--neutral-500)]">{s.sub}</p>
            </Card>
          </SpotlightCard>
        ))}
      </div>

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
        <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/make/products/new')}>
          New Product
        </ToolbarPrimaryButton>
      </PageToolbar>

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, idx) => {
            const bomBadge = getBomBadgeProps(product.bomStatus);
            const canMake = product.bomStatus === 'complete';
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
                    onClick={() => navigate(`/make/products/${product.id}`)}
                  >
                  <div className="h-40 bg-[var(--neutral-100)] flex items-center justify-center">
                    <Package className="w-16 h-16 text-[var(--neutral-400)]" />
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
                      <StatusBadge variant={bomBadge.variant}>{bomBadge.label}</StatusBadge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Routing</p>
                        <p className="text-sm font-medium tabular-nums text-foreground">
                          {product.routingSteps > 0 ? `${product.routingSteps} steps` : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--neutral-500)] mb-1">Unit Cost</p>
                        <p className="text-sm font-medium tabular-nums text-foreground">
                          {product.unitCost > 0 ? `$${product.unitCost.toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => { e.stopPropagation(); handleMake(product); }}
                      disabled={!canMake}
                      className="w-full mt-4 h-14 min-h-[56px] gap-2 text-base font-medium bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5" />
                      Make
                    </Button>
                  </div>
                  </Card>
                </SpotlightCard>
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
          onRowClick={(p) => navigate(`/make/products/${p.id}`)}
          striped
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        />
      )}

      {filtered.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or create a new product"
            action={{ label: "Create Product", onClick: () => navigate('/make/products/new'), icon: Plus }}
          />
        </Card>
      )}

      {/* ── Create Manufacturing Order Dialog ── */}
      <Dialog open={moDialogOpen} onOpenChange={setMoDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Manufacturing Order</DialogTitle>
            <DialogDescription>
              Fill in the details below to start production.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Product (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Product</Label>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-muted/40 px-3 py-2">
                <Package className="w-4 h-4 text-[var(--neutral-400)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{moProduct?.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{moProduct?.sku}</p>
                </div>
                {moProduct && (
                  <StatusBadge variant={getBomBadgeProps(moProduct.bomStatus).variant}>
                    {getBomBadgeProps(moProduct.bomStatus).label}
                  </StatusBadge>
                )}
              </div>
            </div>

            {/* Quantity + Target Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="mo-qty" className="text-sm font-medium text-foreground">Quantity</Label>
                <Input
                  id="mo-qty"
                  type="number"
                  min={1}
                  value={moQty}
                  onChange={(e) => setMoQty(e.target.value)}
                  className="tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mo-date" className="text-sm font-medium text-foreground">Target Date</Label>
                <Input
                  id="mo-date"
                  type="date"
                  value={moDate}
                  onChange={(e) => setMoDate(e.target.value)}
                />
              </div>
            </div>

            {/* Work Centre */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Work Centre</Label>
              <Select value={moWorkCentre} onValueChange={setMoWorkCentre}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select work centre" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_CENTRES.map((wc) => (
                    <SelectItem key={wc} value={wc}>{wc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Priority</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMoPriority(p)}
                    className={cn(
                      'h-9 rounded-full border text-sm font-medium capitalize transition-colors',
                      moPriority === p
                        ? p === 'urgent'
                          ? 'border-[var(--mw-error)] bg-[var(--mw-error-light)] text-[var(--mw-error)]'
                          : p === 'high'
                            ? 'border-[var(--mw-yellow-600)] bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-800)]'
                            : p === 'medium'
                              ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-800)]'
                              : 'border-[var(--border)] bg-muted text-foreground'
                        : 'border-[var(--border)] text-muted-foreground hover:bg-muted/60',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="mo-notes" className="text-sm font-medium text-foreground">Notes</Label>
              <Textarea
                id="mo-notes"
                placeholder="Special instructions, customer references, etc."
                value={moNotes}
                onChange={(e) => setMoNotes(e.target.value)}
                className="min-h-[72px] resize-none"
              />
            </div>

            {/* Linked BOM Materials */}
            {moProduct && BOM_MATERIALS[moProduct.id] && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Bill of Materials
                </Label>
                <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                  <MwDataTable<{ material: string; qty: string; unit: string }>
                    columns={[
                      {
                        key: 'material',
                        header: 'Material',
                        cell: (m) => m.material,
                      },
                      {
                        key: 'qty',
                        header: 'Qty',
                        headerClassName: 'text-right',
                        cell: (m) => <span className="tabular-nums">{m.qty}</span>,
                        className: 'text-right',
                      },
                      {
                        key: 'unit',
                        header: 'Unit',
                        cell: (m) => <span className="text-muted-foreground">{m.unit}</span>,
                      },
                    ]}
                    data={BOM_MATERIALS[moProduct.id]}
                    keyExtractor={(_, i) => i}
                    className="border-0 shadow-none rounded-none"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setMoDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMO}
              className="rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground font-medium gap-2"
            >
              <Play className="w-4 h-4" />
              Create MO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
