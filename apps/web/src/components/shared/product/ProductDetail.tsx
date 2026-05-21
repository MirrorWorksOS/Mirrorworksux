/**
 * Shared Product Detail — 6-tab view used across Sell, Plan & Make modules
 * Tabs: Overview | Manufacturing | Inventory | Planning | Accounting | Documents
 * Figma: 484:251921, 519:290499, 519:295628, 519:332160
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  Package, Box, Layers, Settings, Wrench, Scissors,
  Barcode, Plus, TrendingUp, Eye, Download, Upload, FileText,
  CheckCircle, ClipboardList, Tag, Cog, DollarSign,
  ShoppingCart, Truck, ArrowDownUp, Heart, MessageSquare,
  RotateCcw, Star, BarChart3, ChevronRight, ChevronDown, Clock, MapPin,
  RefreshCw, Boxes, ArrowLeft, AlertTriangle, Trash2, Layers3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarcodeDisplay } from '@/components/shared/barcode/BarcodeDisplay';
import type { BarcodeSymbology } from '@/types/common';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import {
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION,
  MW_AXIS_TICK,
  MW_CARTESIAN_GRID,
  MW_TOOLTIP_STYLE,
} from '@/components/shared/charts/chart-theme';

import { machines as allMachines } from '@/services';
import { getAccounts as getXeroAccounts } from '@/services/xeroService';
import type { XeroAccount } from '@/types/xero';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { MirrorWorksAgentCard } from '@/components/shared/ai/MirrorWorksAgentCard';
import { studioProductIdForCatalogId } from '@/lib/product-studio-catalog-map';
import { PartThumbnail } from '@/components/shared/product/PartThumbnail';
import { BomEditorSheet, type BomDraft, type BomLineDraft } from '@/components/control/BomEditorSheet';
import { BomRoutingTree } from '@/components/plan/BomRoutingTree';
import type { AssemblyNode, OperationStatus } from '@/components/plan/BomRoutingTree.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useJobActivityStore } from '@/store/jobActivityStore';
import type { ProductKind } from '@/types/job-activity';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import { AssigneeChip } from '@/components/shared/assignee/AssigneeChip';

// ── Mock product data ─────────────────────────────────────
const PRODUCT = {
  name: 'Product Name',
  capabilities: ['Can be Sold', 'Can be Purchased', 'Can be Manufactured'] as const,
  traceable: true,
  productType: 'storable' as string,
  category: 'Manufactured Goods — Metal Fabrication',
  family: 'Structural Components',
  sku: 'BKT-001',
  mpn: 'MFG-12345',
  barcode: '',
  barcodeType: 'EAN-13',
  serialPrefix: 'SN-2025-',
  listPrice: 1000.00,
  cost: 650.00,
  marginPercent: 35,
  salesDescription: 'Description shown on quotes and orders.',
  invoicingPolicy: 'Ordered quantities',
  warranty: '1 year manufacturer warranty',
  imageUrl: undefined as string | undefined,
  /** Drives default activity-template suggestion when sold. */
  productKind: 'configurable' as 'widget' | 'configurable' | 'mixed',
  /** Explicit template pins; empty = fall back to productKind filter. */
  defaultTemplateIds: [] as string[],
};

const PRODUCT_TYPES = [
  { id: 'storable', label: 'Storable Product', sub: 'Inventory tracked', icon: Package },
  { id: 'raw', label: 'Raw Material', sub: 'For manufacturing', icon: Layers },
  { id: 'component', label: 'Component', sub: 'Assembly part', icon: Settings },
  { id: 'consumable', label: 'Consumable', sub: 'No tracking', icon: Scissors },
  { id: 'service', label: 'Service', sub: 'Non-physical', icon: Wrench },
  { id: 'kit', label: 'Kit/Bundle', sub: 'For assembly', icon: Box },
];

const TIERED_PRICING = [
  { minQty: 1, maxQty: 100, unitPrice: 1000.00, effectiveDate: '2025-01-01' },
  { minQty: 101, maxQty: 500, unitPrice: 950.00, effectiveDate: '2025-01-01' },
];

const ROUTING = [
  { step: 1, name: 'CNC Laser Cutting',     workCenter: 'Cutting',  duration: 2,   setup: 30, status: 'complete'    as const, actualHours: 2.2, preferredMachineIds: ['mach-001'], excludedMachineIds: ['mach-006'], material: 'Mild Steel', thicknessMm: 3, sheetWidthMm: 1830 },
  { step: 2, name: 'Press Brake Forming',   workCenter: 'Forming',  duration: 1.5, setup: 20, status: 'complete'    as const, actualHours: 1.4, preferredMachineIds: ['mach-002'], excludedMachineIds: [],          material: 'Mild Steel', thicknessMm: 3, sheetWidthMm: 1830 },
  { step: 3, name: 'MIG Welding',           workCenter: 'Welding',  duration: 3,   setup: 15, status: 'in_progress' as const, actualHours: 1.8, preferredMachineIds: ['mach-003'], excludedMachineIds: [],          material: 'Mild Steel', thicknessMm: 3, sheetWidthMm: 1830 },
  { step: 4, name: 'Grind & Deburr',        workCenter: 'Finishing',duration: 0.5, setup: 0,  status: 'not_started' as const, actualHours: 0,   preferredMachineIds: [],           excludedMachineIds: [],          material: 'Mild Steel', thicknessMm: 3, sheetWidthMm: 1830 },
  { step: 5, name: 'Powder Coat',           workCenter: 'Finishing',duration: 4,   setup: 45, status: 'not_started' as const, actualHours: 0,   preferredMachineIds: ['mach-005'], excludedMachineIds: [],          material: 'Mild Steel', thicknessMm: 3, sheetWidthMm: 1830 },
  { step: 6, name: 'Assembly & QC',         workCenter: 'Assembly', duration: 1,   setup: 0,  status: 'not_started' as const, actualHours: 0,   preferredMachineIds: [],           excludedMachineIds: [],          material: 'Mild Steel', thicknessMm: 3, sheetWidthMm: 1830 },
];

type RoutingStatus = 'not_started' | 'in_progress' | 'complete';

// ── MRP / Inventory Planning data ──────────────────────────
const STOCK_PROJECTION = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 230;
  // Simulate demand drawdown with a restock bump at day 18
  const demand = Math.round(day * 6.5 + Math.sin(day * 0.5) * 15);
  const restock = day >= 18 ? 150 : 0;
  const projected = Math.max(0, base - demand + restock);
  return {
    day: `Day ${day}`,
    stock: projected,
    reorderPoint: 50,
    safetyStock: 25,
  };
});

// ── Suppliers (Odoo / FulcrumPro parity) ──────────────────
// Per-vendor pricing, lead time and MOQ. Mock data; backend wiring TODO.
interface ProductSupplier {
  id: string;
  vendorName: string;
  vendorPartNo?: string;
  mpn?: string;
  unitPrice: number;
  leadTimeDays: number;
  moq: number;
  preferred: boolean;
}
const PRODUCT_SUPPLIERS: ProductSupplier[] = [
  { id: 'sup-1', vendorName: 'Acme Industries',    vendorPartNo: 'ACM-BKT-1200', mpn: 'BKT-001-A',  unitPrice: 645.00, leadTimeDays: 14, moq: 25, preferred: true  },
  { id: 'sup-2', vendorName: 'Bluescope Steel',    vendorPartNo: 'BS-12345',     mpn: 'BS-BKT-001', unitPrice: 660.00, leadTimeDays: 7,  moq: 50, preferred: false },
  { id: 'sup-3', vendorName: 'Sandvik Coromant',   vendorPartNo: 'SC-789-A',                       unitPrice: 692.00, leadTimeDays: 28, moq: 10, preferred: false },
];

// ── Where-used (parent BOMs that reference this product) ──
interface WhereUsedRow { id: string; parentName: string; parentSku: string; qtyPer: number; bomVersion: string; }
const WHERE_USED: WhereUsedRow[] = [
  { id: 'wu-1', parentName: 'Frame Assembly v2',     parentSku: 'FRM-200',  qtyPer: 4, bomVersion: 'v1.4' },
  { id: 'wu-2', parentName: 'Mezzanine Module',      parentSku: 'MZN-110',  qtyPer: 2, bomVersion: 'v2.0' },
  { id: 'wu-3', parentName: 'Trailer Decking Kit',   parentSku: 'TDK-S320', qtyPer: 8, bomVersion: 'v1.0' },
];

const BOM_LINES = [
  { sku: 'MS-10-3678', description: '10mm MS Plate', qty: 4, unit: 'sheet', cost: 185.00 },
  { sku: 'RHS-50252', description: 'RHS 50x25x2.5', qty: 8, unit: 'length', cost: 12.80 },
  { sku: 'HW-KIT-001', description: 'Hardware Kit M10 SS', qty: 2, unit: 'kit', cost: 8.40 },
  { sku: 'PNT-RAL7035', description: 'Powder Coat RAL 7035', qty: 1.5, unit: 'kg', cost: 11.00 },
  { sku: 'LABOUR-FAB', description: 'Fabrication Labour', qty: 6.5, unit: 'hrs', cost: 55.00 },
  { sku: 'LABOUR-WLD', description: 'Welding Labour', qty: 3, unit: 'hrs', cost: 60.00 },
];

const STOCK_DONUT = [
  { name: 'Available', value: 230 },
  { name: 'Reserved', value: 20 },
];
const DONUT_COLORS = ['var(--mw-yellow-400)', 'var(--neutral-200)'];

const STOCK_BY_LOCATION = {
  warehouseA: {
    name: 'Warehouse A - Sydney',
    total: 155,
    rows: [
      { location: 'Shelf 12, Bin 3', qty: 100, status: 'Available' },
      { location: 'Floor Stock', qty: 50, status: 'Available' },
      { location: 'Quality Hold', qty: 5, status: 'On Hold' },
    ],
  },
  warehouseB: {
    name: 'Warehouse B - Melbourne',
    total: 95,
    rows: [
      { location: 'Rack 8, Level 2', qty: 95, status: 'Available' },
    ],
  },
};

const STOCK_MOVEMENTS = [
  { icon: 'receive', label: 'Received 50 units (PO-2398)', sub: 'Today — Warehouse A' },
  { icon: 'ship', label: 'Shipped 25 units (SO-1234)', sub: 'Today — Customer ABC' },
  { icon: 'transfer', label: 'Transferred 30 units', sub: 'Yesterday — Warehouse A to B' },
];

const REVENUE_DATA = [
  { month: 'Oct', revenue: 15360, units: 12 },
  { month: 'Nov', revenue: 20480, units: 16 },
  { month: 'Dec', revenue: 11520, units: 9 },
  { month: 'Jan', revenue: 25600, units: 20 },
  { month: 'Feb', revenue: 17920, units: 14 },
  { month: 'Mar', revenue: 23040, units: 18 },
];

const DOCUMENTS = [
  { name: 'Technical Specification Sheet.pdf', category: 'Spec Sheet', version: '2.0', uploadedBy: 'Sarah Johnson', date: '2025-10-01', type: 'pdf' },
  { name: 'CAD-Drawing-RevC.dwg', category: 'CAD Drawing', version: '3.0', uploadedBy: 'Engineering Team', date: '2025-09-28', type: 'dwg' },
  { name: 'Quality Certificate.pdf', category: 'Certificate', version: '1.0', uploadedBy: 'Quality Dept', date: '2025-09-15', type: 'pdf' },
];

const SALES_ORDERS = [
  { number: 'SO-1234', customer: 'Customer ABC', qty: 75, amount: 75000, status: 'Processing' },
  { number: 'SO-1189', customer: 'Customer XYZ', qty: 50, amount: 50000, status: 'Shipped' },
];

const PURCHASE_ORDERS = [
  { number: 'PO-2401', vendor: 'Acme Industries', qty: 100, amount: 72500, expectedDate: '2025-10-20' },
];

const COLLAB_FEED = [
  { type: 'system', author: 'System Update', time: '10 min ago', content: 'Stock level dropped below reorder point. PO-2402 auto-created.', comments: 2, likes: 0 },
  { type: 'user', author: 'John Smith', time: '2 hours ago', content: '@Sarah: Customer ABC requested a quote for 500 units. What\'s lead time?', reply: 'Sarah replied: 12 weeks, we\'ll need to order raw materials', comments: 2, likes: 3 },
  { type: 'document', author: 'Document Added', time: 'Yesterday', content: 'New CAD drawing uploaded: PSCS-76902-RevC.dwg', comments: 0, likes: 0 },
];

const TOP_CUSTOMERS = [
  { name: 'Customer A', amount: 45000, units: '92 units' },
  { name: 'Customer B', amount: 32000, units: '64 units' },
  { name: 'Customer C', amount: 28000, units: '57 units' },
];

// ── Tab definitions ─────────────────────────────────────
const TABS = ['Overview', 'Manufacturing', 'MirrorView', 'Inventory', 'Planning', 'Accounting', 'Documents'] as const;
type Tab = (typeof TABS)[number];

// ── Section heading helper ──────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-medium text-foreground">{children}</h2>;
}

function SubHeading({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base font-medium text-foreground">{children}</h3>
      {actions}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════
function OverviewTab() {
  const [selectedType, setSelectedType] = useState(PRODUCT.productType);
  const [barcodeValue, setBarcodeValue] = useState(PRODUCT.barcode);
  const [barcodeType, setBarcodeType] = useState<BarcodeSymbology>('ean13');
  const [listPrice, setListPrice] = useState(PRODUCT.listPrice.toFixed(2));
  const [tiers, setTiers] = useState<typeof TIERED_PRICING[number][]>(TIERED_PRICING);

  const handleAddTier = () => {
    setTiers((prev) => {
      const last = prev[prev.length - 1];
      const nextMin = last ? last.maxQty + 1 : 1;
      // TODO(backend): products.priceTiers.add(productId, fields)
      return [
        ...prev,
        {
          minQty: nextMin,
          maxQty: nextMin + 99,
          unitPrice: last ? Math.round(last.unitPrice * 0.95 * 100) / 100 : 0,
          effectiveDate: new Date().toISOString().slice(0, 10),
        },
      ];
    });
    toast.success('Pricing tier added');
  };

  return (
    <div className="space-y-8">
      {/* ── Product Classification ────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Product Classification</SectionHeading>
        <div>
          <p className="text-sm text-[var(--neutral-500)] mb-3">Product Type</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRODUCT_TYPES.map((t) => {
              const Icon = t.icon;
              const active = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-4 rounded-lg border text-left transition-all',
                    active
                      ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] shadow-sm'
                      : 'border-[var(--border)] bg-card hover:border-[var(--neutral-300)]'
                  )}
                >
                  <Icon className={cn('w-5 h-5 mb-1', active ? 'text-foreground' : 'text-[var(--neutral-400)]')} />
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  <span className="text-xs text-[var(--neutral-500)]">{t.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Product Category</label>
            <Select defaultValue="manufactured">
              <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufactured">Manufactured Goods — Metal Fabrication</SelectItem>
                <SelectItem value="raw">Raw Materials</SelectItem>
                <SelectItem value="consumable">Consumables</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Product Family</label>
            <Select defaultValue="structural">
              <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                <SelectValue placeholder="Select family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structural">Structural Components</SelectItem>
                <SelectItem value="enclosures">Enclosures</SelectItem>
                <SelectItem value="brackets">Brackets & Supports</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">SKU</label>
            <Input
              defaultValue={PRODUCT.sku}
              className="h-10 bg-card border-[var(--border)] tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Manufacturer Part Number</label>
          <Input defaultValue={PRODUCT.mpn} className="h-10 bg-[var(--mw-yellow-50)] border-[var(--mw-yellow-200)] max-w-sm" />
        </div>
      </section>

      {/* ── Identification & Tracking ────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Identification & Tracking</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Primary Barcode</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter or generate barcode"
                className="h-10 bg-card border-[var(--border)] flex-1"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
              />
              <Button
                variant="outline"
                className="h-10 gap-2 border-[var(--border)]"
                onClick={() => {
                  const generated = barcodeType === 'ean13'
                    ? '400638133393'  // 12 digits — check digit auto-computed
                    : `PRD-${PRODUCT.sku}`;
                  setBarcodeValue(generated);
                  toast.success('Barcode generated');
                }}
              >
                <Barcode className="w-4 h-4" /> Generate
              </Button>
            </div>
            <div className="mt-2 flex items-start gap-4">
              <Select value={barcodeType} onValueChange={(v) => setBarcodeType(v as BarcodeSymbology)}>
                <SelectTrigger className="h-9 w-32 bg-card border-[var(--border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ean13">EAN-13</SelectItem>
                  <SelectItem value="code128">Code 128</SelectItem>
                  <SelectItem value="qrcode">QR Code</SelectItem>
                </SelectContent>
              </Select>
              {barcodeValue && (
                <BarcodeDisplay
                  value={barcodeValue}
                  symbology={barcodeType}
                  className="mt-1"
                />
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Serial Number Prefix</label>
            <Input defaultValue={PRODUCT.serialPrefix} className="h-10 bg-card border-[var(--border)]" />
            <p className="text-xs text-[var(--neutral-400)] mt-1">example: SN-2025-auto-increment</p>
          </div>
        </div>
      </section>

      {/* ── Pricing & Revenue ────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Pricing & Revenue</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">List Price</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[var(--border)] bg-[var(--neutral-100)] text-sm text-[var(--neutral-500)]">USD</span>
              <Input
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                className="h-10 rounded-l-none bg-card border-[var(--border)]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Cost</label>
            <Input defaultValue="$650.00" className="h-10 bg-card border-[var(--border)]" />
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Margin %</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--mw-yellow-400)]" style={{ width: '35%' }} />
              </div>
              <span className="text-sm tabular-nums font-medium text-foreground">35%</span>
              <StatusBadge variant="success">healthy</StatusBadge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Tiered Pricing</h4>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs border-[var(--border)]"
            onClick={handleAddTier}
          >
            <Plus className="w-3 h-3" /> Add Tier
          </Button>
        </div>
        <Card variant="flat" className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Min Qty</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Max Qty</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Unit Price</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 tabular-nums">{tier.minQty}</td>
                  <td className="px-4 py-3 tabular-nums">{tier.maxQty}</td>
                  <td className="px-4 py-3 tabular-nums">${tier.unitPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 tabular-nums">{tier.effectiveDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Last sold + margin trend + quick quote */}
        <PricingIntelligence />
      </section>

      {/* ── Sales Configuration ──────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Sales Configuration</SectionHeading>
        <div>
          <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Sales Description</label>
          <Textarea
            defaultValue={PRODUCT.salesDescription}
            placeholder="Description shown on quotes and orders..."
            className="min-h-[80px] bg-[var(--neutral-50)] border-[var(--border)]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Invoicing Policy</label>
            <Select defaultValue="ordered">
              <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordered">Ordered quantities</SelectItem>
                <SelectItem value="delivered">Delivered quantities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Warranty</label>
            <Input defaultValue={PRODUCT.warranty} className="h-10 bg-card border-[var(--border)]" />
          </div>
        </div>
      </section>

      {/* ── Bottom dashboard cards ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock Status */}
        <Card variant="flat" className="p-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Stock Status</h4>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STOCK_DONUT}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={42}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {STOCK_DONUT.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium tabular-nums text-foreground">230</span>
              </div>
            </div>
            <div className="space-y-1">
              <StatusBadge variant="success">Healthy Stock</StatusBadge>
              <div className="text-sm text-[var(--neutral-500)]">
                <p>Available: <span className="text-foreground font-medium tabular-nums">230 units</span></p>
                <p>Next reorder: <span className="text-foreground">Oct 25 (11 days)</span></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Demand Forecast */}
        <Card variant="flat" className="p-6">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--neutral-400)]" /> Demand Forecast
          </h4>
          <p className="text-xs text-[var(--neutral-500)] mb-2">Next 30 days</p>
          <p className="text-2xl font-medium tabular-nums text-foreground mb-1">85 units</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 rounded-full bg-[var(--neutral-200)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--mw-yellow-400)]" style={{ width: '87%' }} />
            </div>
            <span className="text-xs tabular-nums text-[var(--neutral-500)]">87% confidence</span>
          </div>
          <p className="text-xs text-[var(--neutral-500)]">Based on historical sales + open quotes + seasonal trends.</p>
        </Card>

        {/* Supplier Performance */}
        <Card variant="flat" className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--mw-yellow-400)]" /> Supplier Performance
            </h4>
            <Badge variant="softAccent" className="text-xs tabular-nums">94/100</Badge>
          </div>
          <p className="text-sm font-medium text-foreground mb-3">Acme Industries</p>
          {[
            { label: 'On-time', value: 96, color: 'var(--mw-yellow-400)' },
            { label: 'Quality', value: 45, suffix: '4.5★', color: 'var(--mw-yellow-400)' },
            { label: 'Price', value: 100, text: 'Competitive', color: 'var(--mw-yellow-400)' },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3 mb-2 last:mb-0">
              <span className="text-xs text-[var(--neutral-500)] w-14">{m.label}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
              </div>
              <span className="text-xs tabular-nums text-foreground w-20 text-right">
                {m.text ?? `${m.value}%`}
              </span>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Customers YTD */}
        <Card variant="flat" className="p-6">
          <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[var(--neutral-400)]" /> Top Customers (YTD)
          </h4>
          <div className="space-y-3">
            {TOP_CUSTOMERS.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-[var(--neutral-500)]">{c.units}</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-foreground">${c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <MirrorWorksAgentCard
          title="Demand and margin signals"
          suggestion="MirrorWorks Agent sees stronger seasonal demand and better discount response on this product than the current setup reflects."
          tone="opportunity"
          primaryAction={{
            label: 'Review opportunities',
            onClick: () => toast.success('Opportunity review opened'),
          }}
          detailContent={
            <div className="space-y-2">
              <p>Sales increased 15% after adding customer XYZ Corp.</p>
              <p>Vendor lead times increased by 3 days over the last quarter.</p>
              <p>A 10% discount increased sales 25% in Q3.</p>
              <p>Peak demand remains Sep-Nov, accounting for roughly 40% of annual sales.</p>
            </div>
          }
          evidenceLevel="expandable"
          detailLabel="Signals"
        />

        {/* Recent Activities */}
        <Card variant="flat" className="p-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Recent Activities</h4>
          <div className="space-y-4">
            {[
              { icon: Package, label: 'Stock adjustment', sub: '+50 units • Yesterday', color: 'text-[var(--neutral-500)]' },
              { icon: FileText, label: 'New quote created', sub: 'SO-1245, 58 units • Yesterday', color: 'text-[var(--mw-yellow-400)]' },
              { icon: ClipboardList, label: 'PO received', sub: 'PO-2401, 100 units • 2 days ago', color: 'text-foreground' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-[var(--neutral-100)]">
                  <a.icon className={cn('w-4 h-4', a.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-xs text-[var(--neutral-500)]">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Quick Actions ────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: ShoppingCart, label: 'Create Sales Order' },
            { icon: Truck, label: 'Create Purchase Order' },
            { icon: ClipboardList, label: 'Create Work Order' },
            { icon: TrendingUp, label: 'View Reports' },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => {
                // TODO(backend): products.{a.key}(productId)
                toast.success(`${a.label} opened`);
              }}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] bg-card hover:bg-[var(--neutral-50)] transition-colors text-left"
            >
              <a.icon className="w-5 h-5 text-[var(--neutral-400)]" />
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Pricing intelligence: last-sold, margin trend, quick quote ─────────

/**
 * Resolve recent sales rows for this product to drive the last-sold strip
 * and the margin sparkline. Mock-only for now: in real life this comes from
 * the quotes / sales-orders services scoped to the current product id.
 */
function buildLastSoldHistory() {
  return [
    { date: '2026-04-12', customer: 'TechCorp Industries', qty: 8,  unitPrice: 1250, margin: 35 },
    { date: '2026-03-18', customer: 'BHP Contractors',     qty: 12, unitPrice: 1180, margin: 31 },
    { date: '2026-02-22', customer: 'Pacific Fabrication', qty: 6,  unitPrice: 1300, margin: 38 },
    { date: '2026-01-10', customer: 'TechCorp Industries', qty: 20, unitPrice: 1100, margin: 28 },
    { date: '2025-12-05', customer: 'Sydney Rail Corp',    qty: 4,  unitPrice: 1340, margin: 41 },
    { date: '2025-11-18', customer: 'Hunter Steel Co',     qty: 10, unitPrice: 1200, margin: 33 },
  ];
}

function PricingIntelligence() {
  const history = useMemo(buildLastSoldHistory, []);
  const lastSold = history[0];
  const avgMargin = history.reduce((s, r) => s + r.margin, 0) / history.length;
  const marginDelta = lastSold.margin - avgMargin;

  // Quick-quote state — pure derivation off TIERED_PRICING.
  const [qtyInput, setQtyInput] = useState<number>(50);
  const tier = useMemo(() => {
    return (
      TIERED_PRICING.find((t) => qtyInput >= t.minQty && qtyInput <= t.maxQty) ??
      TIERED_PRICING[TIERED_PRICING.length - 1]
    );
  }, [qtyInput]);
  const quotePrice = qtyInput * tier.unitPrice;
  const quoteMargin = ((tier.unitPrice - PRODUCT.cost) / tier.unitPrice) * 100;
  // Lead time grows mildly with qty (placeholder heuristic).
  const leadDays = Math.max(7, Math.round(7 + qtyInput / 25));

  return (
    <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Last sold + margin trend */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Last sold &amp; margin trend</h4>
          <Badge variant="outline" className="border-[var(--border)] text-xs">
            6-month rollup
          </Badge>
        </div>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-medium tabular-nums text-foreground">
            ${lastSold.unitPrice.toLocaleString('en-AU')}
          </span>
          <span className="text-sm text-[var(--neutral-500)]">
            to {lastSold.customer} · {lastSold.qty} units · {fmtDate(lastSold.date)}
          </span>
        </div>
        <div className="mb-3 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-[var(--neutral-500)]">Avg. margin</p>
            <p className="font-medium tabular-nums text-foreground">{avgMargin.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-[var(--neutral-500)]">Last sale margin</p>
            <p className="font-medium tabular-nums text-foreground">{lastSold.margin}%</p>
          </div>
          <div>
            <p className="text-xs text-[var(--neutral-500)]">vs avg.</p>
            <StatusBadge variant={marginDelta >= 0 ? 'success' : 'warning'}>
              {marginDelta >= 0 ? '+' : ''}
              {marginDelta.toFixed(1)} pts
            </StatusBadge>
          </div>
        </div>

        {/* Sparkline — margin per sale, oldest → newest */}
        <div style={{ width: '100%', height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...history].reverse().map((r, i) => ({ i, margin: r.margin }))}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <Line
                type="monotone"
                dataKey="margin"
                stroke="var(--mw-yellow-500)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--mw-yellow-500)', stroke: 'var(--mw-yellow-500)' }}
                isAnimationActive={false}
              />
              <ReferenceLine y={avgMargin} stroke="var(--neutral-300)" strokeDasharray="3 3" />
              <YAxis domain={[0, 50]} hide />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick-quote calculator */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Quick quote</h4>
          <Badge className="border-0 bg-[var(--mw-yellow-400)]/20 text-foreground text-xs">
            Live
          </Badge>
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[var(--neutral-500)]">Quantity</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={qtyInput}
              onChange={(e) => setQtyInput(Math.max(1, parseInt(e.target.value || '1', 10)))}
              className="h-10 w-28 tabular-nums"
            />
            <span className="text-xs text-[var(--neutral-500)]">
              tier: {tier.minQty}–{tier.maxQty} units @ ${tier.unitPrice}/ea
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-[var(--neutral-500)]">Quote price</p>
            <p className="text-lg font-medium tabular-nums text-foreground">
              ${quotePrice.toLocaleString('en-AU')}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--neutral-500)]">Margin</p>
            <p className="text-lg font-medium tabular-nums text-foreground">
              {quoteMargin.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--neutral-500)]">Lead time</p>
            <p className="text-lg font-medium tabular-nums text-foreground">
              {leadDays} days
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Routing pill helpers ────────────────────────────────
function routingStatusStyle(status: RoutingStatus) {
  switch (status) {
    case 'complete':
      return 'bg-[var(--mw-success-light)] text-[var(--mw-success)] dark:bg-[var(--mw-success)]/20 dark:text-[var(--mw-success)]';
    case 'in_progress':
      return 'bg-[var(--mw-yellow-400)] text-neutral-900';
    case 'not_started':
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
  }
}

function routingStatusLabel(status: RoutingStatus) {
  switch (status) {
    case 'complete': return 'Complete';
    case 'in_progress': return 'In progress';
    case 'not_started': return 'Not started';
  }
}

/** SVG arrow connector between routing pills */
function RoutingArrow() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" className="shrink-0 mx-0.5 hidden sm:block text-neutral-400 dark:text-neutral-500" aria-hidden="true">
      <path d="M0 8h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// MANUFACTURING TAB
// ═══════════════════════════════════════════════════════════

/**
 * Capability check for a single routing step against its preferred machines.
 * Surfaces any machine that can't handle the part's material / thickness /
 * sheet width. Returns an array of plain warning strings the panel can
 * render inline.
 */
type RoutingStepData = (typeof ROUTING)[number];

function checkRoutingCapabilities(op: RoutingStepData): string[] {
  const warnings: string[] = [];
  for (const machineId of op.preferredMachineIds ?? []) {
    const m = allMachines.find((x) => x.id === machineId);
    if (!m) {
      warnings.push(`${machineId}: not found in machine list — was it archived?`);
      continue;
    }
    const caps = m.capabilities;
    if (!caps) continue; // Older machines without structured capabilities — skip silently.
    if (caps.maxSheetWidthMm > 0 && op.sheetWidthMm > caps.maxSheetWidthMm) {
      warnings.push(
        `${m.name}: max sheet width ${caps.maxSheetWidthMm}mm — this part is ${op.sheetWidthMm}mm wide.`,
      );
    }
    if (
      caps.supportedMaterials.length > 0 &&
      !caps.supportedMaterials.some((mat) => op.material.toLowerCase().includes(mat.toLowerCase()))
    ) {
      warnings.push(
        `${m.name}: doesn't support "${op.material}" — supported: ${caps.supportedMaterials.join(', ')}.`,
      );
    }
    const range = caps.thicknessRangeByMaterial?.[op.material];
    if (range && (op.thicknessMm < range.minMm || op.thicknessMm > range.maxMm)) {
      warnings.push(
        `${m.name}: ${op.material} thickness range ${range.minMm}-${range.maxMm}mm — this part is ${op.thicknessMm}mm.`,
      );
    }
  }
  return warnings;
}

function RoutingStepPanel({
  op,
  totalSteps,
}: {
  op: RoutingStepData;
  totalSteps: number;
}) {
  const [preferred, setPreferred] = useState<string[]>(op.preferredMachineIds ?? []);
  const [excluded, setExcluded] = useState<string[]>(op.excludedMachineIds ?? []);
  const warnings = useMemo(() => checkRoutingCapabilities({ ...op, preferredMachineIds: preferred }), [op, preferred]);

  // Show only machines that match this work centre — fab shops never assign
  // a press brake step to a powder coat booth.
  const wcMachines = allMachines.filter((m) => m.workCenter.toLowerCase() === op.workCenter.toLowerCase());

  const togglePreferred = (id: string) => {
    setPreferred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    // Make preferred and excluded mutually exclusive.
    setExcluded((prev) => prev.filter((x) => x !== id));
  };

  const toggleExcluded = (id: string) => {
    setExcluded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setPreferred((prev) => prev.filter((x) => x !== id));
  };

  const variance = op.actualHours > 0 ? ((op.actualHours - op.duration) / op.duration) * 100 : null;
  const varianceTone =
    variance === null
      ? 'neutral'
      : variance > 10
        ? 'error'
        : variance > 0
          ? 'warning'
          : 'success';

  return (
    <Card variant="flat" className="p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="text-base font-medium text-foreground">{op.name}</h4>
          <p className="text-xs text-[var(--neutral-500)]">
            Step {op.step} of {totalSteps}
          </p>
        </div>
        <Badge className={cn('border-0 text-xs', routingStatusStyle(op.status))}>
          {routingStatusLabel(op.status)}
        </Badge>
      </div>

      {/* Top stat strip */}
      <div className="mb-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <p className="mb-0.5 text-xs text-[var(--neutral-500)]">Work centre</p>
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <MapPin className="h-3.5 w-3.5 text-[var(--neutral-400)]" /> {op.workCenter}
          </p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-[var(--neutral-500)]">Estimate</p>
          <p className="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
            <Clock className="h-3.5 w-3.5 text-[var(--neutral-400)]" /> {op.duration}h
            {op.setup > 0 && (
              <span className="text-xs text-[var(--neutral-500)]">+{op.setup}m setup</span>
            )}
          </p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-[var(--neutral-500)]">Actual avg.</p>
          <p className="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
            {op.actualHours > 0 ? `${op.actualHours.toFixed(1)}h` : '—'}
          </p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-[var(--neutral-500)]">Variance</p>
          {variance === null ? (
            <p className="text-sm text-[var(--neutral-400)]">No history yet</p>
          ) : (
            <StatusBadge variant={varianceTone}>
              {variance > 0 ? '+' : ''}
              {variance.toFixed(0)}%
            </StatusBadge>
          )}
        </div>
      </div>

      {/* Material constraints summary */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--neutral-500)]">
        <Badge variant="outline" className="border-[var(--border)] text-xs">
          {op.material}
        </Badge>
        <Badge variant="outline" className="border-[var(--border)] text-xs tabular-nums">
          {op.thicknessMm}mm thick
        </Badge>
        <Badge variant="outline" className="border-[var(--border)] text-xs tabular-nums">
          {op.sheetWidthMm}mm wide
        </Badge>
      </div>

      {/* Machine assignment */}
      <div className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium text-foreground">Preferred machines</p>
          <p className="mb-2 text-xs text-[var(--neutral-500)]">
            Scheduler will prefer these when both capacity and capability match.
          </p>
          <div className="flex flex-wrap gap-2">
            {wcMachines.length === 0 ? (
              <p className="text-xs text-[var(--neutral-400)]">
                No machines configured for {op.workCenter}. Add one in Control → Machines.
              </p>
            ) : (
              wcMachines.map((m) => {
                const isPreferred = preferred.includes(m.id);
                const isExcluded = excluded.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => togglePreferred(m.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                      isPreferred
                        ? 'border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-400)]/20 text-foreground'
                        : isExcluded
                          ? 'border-dashed border-[var(--mw-error)]/40 bg-card text-[var(--neutral-400)] line-through opacity-70'
                          : 'border-[var(--border)] bg-card text-[var(--neutral-600)] hover:border-[var(--mw-yellow-400)] hover:text-foreground',
                    )}
                  >
                    <Cog className="h-3 w-3 shrink-0" />
                    {m.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Excluded machines — advanced toggle */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-[var(--neutral-500)] hover:text-foreground">
            <span className="inline-flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
              Excluded machines (advanced)
            </span>
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {wcMachines.map((m) => {
              const isExcluded = excluded.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleExcluded(m.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                    isExcluded
                      ? 'border-[var(--mw-error)] bg-[var(--mw-error-light)] text-[var(--mw-error)]'
                      : 'border-[var(--border)] bg-card text-[var(--neutral-600)] hover:border-[var(--mw-error)] hover:text-[var(--mw-error)]',
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                  {m.name}
                </button>
              );
            })}
          </div>
        </details>

        {/* Capability warnings */}
        {warnings.length > 0 && (
          <div className="mt-3 rounded-md border border-[var(--mw-warning)] bg-[var(--mw-warning-light)] p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--neutral-800)]">
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--mw-warning)]" />
              Capability check — {warnings.length} issue{warnings.length === 1 ? '' : 's'}
            </p>
            <ul className="space-y-0.5 text-xs text-[var(--neutral-700)]">
              {warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

type BomLine = { sku: string; description: string; qty: number; unit: string; cost: number };

function ManufacturingTab() {
  const [bomLines, setBomLines] = useState<BomLine[]>(BOM_LINES);
  const [productKind, setProductKind] = useState<ProductKind>(PRODUCT.productKind);
  const [pinnedTemplateIds, setPinnedTemplateIds] = useState<string[]>(PRODUCT.defaultTemplateIds);
  const allTemplates = useJobActivityStore((s) => s.templates);
  const totalTime = ROUTING.reduce((s, r) => s + r.duration, 0);
  const totalMaterial = bomLines.reduce((s, l) => s + l.qty * l.cost, 0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [bomSheetOpen, setBomSheetOpen] = useState(false);
  const [routingEditMode, setRoutingEditMode] = useState(false);

  const bomColumns: FinancialColumn<BomLine>[] = [
    { key: 'sku', header: 'SKU', accessor: (row) => row.sku, format: 'text', align: 'left', className: 'text-xs text-[var(--neutral-500)]' },
    { key: 'description', header: 'Description', accessor: (row) => row.description, format: 'text', align: 'left' },
    { key: 'qty', header: 'Qty', accessor: (row) => row.qty, format: 'number', align: 'right' },
    { key: 'unit', header: 'Unit', accessor: (row) => row.unit, format: 'text', align: 'left', className: 'text-[var(--neutral-500)]' },
    { key: 'unitCost', header: 'Unit cost', accessor: (row) => row.cost, format: 'currency', align: 'right' },
    { key: 'lineTotal', header: 'Line total', accessor: (row) => row.qty * row.cost, format: 'currency', align: 'right' },
  ];

  const bomTotals: Record<string, number> = {
    lineTotal: totalMaterial,
  };

  // Map ProductDetail's flat BOM_LINES → BomEditorSheet's BomLineDraft shape.
  // Sub-assembly support is preserved because BomEditorSheet exposes it natively.
  const inferKind = (sku: string, unit: string): BomLineDraft['kind'] => {
    if (sku.startsWith('LABOUR')) return 'labour';
    if (unit === 'hrs') return 'labour';
    if (sku.startsWith('PNT-') || sku.startsWith('HW-')) return 'purchased';
    return 'material';
  };

  const initialBomDraft: BomDraft = {
    id: PRODUCT.sku,
    product: PRODUCT.name,
    sku: PRODUCT.sku,
    version: 'v1.2',
    status: 'active',
    kind: 'manufacture',
    lines: bomLines.map((l, i): BomLineDraft => ({
      key: `init-${i}`,
      kind: inferKind(l.sku, l.unit),
      sku: l.sku,
      description: l.description,
      qty: l.qty,
      unit: l.unit,
      unitCost: l.cost,
    })),
  };

  const handleBomSave = (next: BomDraft) => {
    // TODO(backend): products.bom.update(productId, next.lines)
    setBomLines(
      next.lines.map((l) => ({
        sku: l.sku,
        description: l.description,
        qty: l.qty,
        unit: l.unit,
        cost: l.unitCost ?? 0,
      })),
    );
    toast.success('BOM updated');
  };

  // Map the flat ROUTING array into the AssemblyNode shape consumed by
  // BomRoutingTree. The product itself acts as the single "make" part.
  const routingStatusMap: Record<RoutingStatus, OperationStatus> = {
    not_started: 'pending',
    in_progress: 'in_progress',
    complete: 'done',
  };
  const assembly: AssemblyNode = {
    name: PRODUCT.name,
    partNumber: PRODUCT.sku,
    qty: 1,
    cost: totalMaterial + totalTime * 55,
    parts: [
      {
        id: 'self',
        name: PRODUCT.name,
        partNumber: PRODUCT.sku,
        kind: 'make',
        qty: 1,
        uom: 'ea',
        material: 'Mild Steel',
        cost: totalMaterial + totalTime * 55,
        ncReady: true,
        inputs: bomLines.map((l, i) => ({
          id: `in-${i}`,
          name: l.description,
          spec: l.sku,
          qty: l.qty,
          uom: l.unit,
        })),
        operations: ROUTING.map((op) => ({
          id: `op-${op.step}`,
          sequence: op.step,
          name: op.name,
          workCentre: op.workCenter,
          minutes: Math.round(op.duration * 60),
          status: routingStatusMap[op.status],
        })),
        imageUrl: PRODUCT.imageUrl,
      },
    ],
    imageUrl: PRODUCT.imageUrl,
  };

  return (
    <div className="space-y-8">
      {/* ── BOM Material Pills ────────────────────────── */}
      <section className="space-y-4">
        <SubHeading actions={
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--border)] h-8 text-xs"
            onClick={() => setBomSheetOpen(true)}
          >
            Edit BOM
          </Button>
        }>
          Bill of Materials · v1.2
        </SubHeading>

        {/* Pill chips */}
        <div className="flex flex-wrap gap-2">
          {bomLines.map((line) => (
            <button
              key={line.sku}
              onClick={() => toast(`${line.description}: ${line.qty} ${line.unit} @ $${line.cost.toFixed(2)}`)}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-sm transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <span className="font-medium text-foreground">{line.description}</span>
              <span className="text-neutral-500 dark:text-neutral-400 tabular-nums">{line.qty} {line.unit}</span>
            </button>
          ))}
        </div>

        {/* Expandable full BOM table */}
        <details className="group">
          <summary className="text-xs text-[var(--neutral-500)] cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
            Show full BOM table — {bomLines.length} lines, ${totalMaterial.toLocaleString('en-AU', { minimumFractionDigits: 2 })} total
          </summary>
          <div className="mt-3">
            <FinancialTable columns={bomColumns} data={bomLines} keyExtractor={(row) => row.sku} totals={bomTotals} />
          </div>
        </details>

        <BomEditorSheet
          open={bomSheetOpen}
          onOpenChange={setBomSheetOpen}
          bom={initialBomDraft}
          onSave={handleBomSave}
        />
      </section>

      {/* ── Routing Flow Pipeline ─────────────────────── */}
      <section className="space-y-4">
        <SubHeading actions={
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--border)] h-8 text-xs"
            onClick={() => {
              if (routingEditMode) toast.success('Routing updated');
              setRoutingEditMode((v) => !v);
            }}
          >
            {routingEditMode ? 'Done' : 'Edit routing'}
          </Button>
        }>
          Routing — <span className="tabular-nums">{totalTime}h</span> total cycle time
        </SubHeading>

        {routingEditMode ? (
          <BomRoutingTree assembly={assembly} mode="plan" defaultExpandedPartIds={['self']} />
        ) : (
        <React.Fragment>
        {/* Pipeline pills with arrow connectors */}
        <div className="flex flex-wrap items-center gap-y-3">
          {ROUTING.map((op, idx) => (
            <React.Fragment key={op.step}>
              {idx > 0 && <RoutingArrow />}
              <motion.button
                layout
                onClick={() => setExpandedStep(expandedStep === op.step ? null : op.step)}
                className={cn(
                  'inline-flex flex-col items-start rounded-full px-4 py-1.5 text-sm font-medium transition-shadow cursor-pointer',
                  'border border-transparent',
                  routingStatusStyle(op.status),
                  expandedStep === op.step && 'ring-2 ring-[var(--mw-yellow-400)] ring-offset-1 ring-offset-background',
                )}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <span className="leading-tight">{op.name}</span>
                <span className="text-[10px] opacity-70 leading-tight">{op.workCenter} · {op.duration}h</span>
              </motion.button>
            </React.Fragment>
          ))}
        </div>

        {/* Expanded step detail */}
        <AnimatePresence mode="wait">
          {expandedStep !== null && (() => {
            const op = ROUTING.find(r => r.step === expandedStep);
            if (!op) return null;
            return (
              <motion.div
                key={op.step}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <RoutingStepPanel op={op} totalSteps={ROUTING.length} />
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Routing legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--neutral-500)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--mw-success-light)] border border-[var(--mw-success)]" /> Complete
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--mw-yellow-400)]" /> In progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600" /> Not started
          </span>
        </div>
        </React.Fragment>
        )}
      </section>

      {/* ── Cost Summary ──────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Cost Summary</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Material', value: `$${totalMaterial.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, pct: 65 },
            { label: 'Labour', value: `$${(totalTime * 55).toFixed(2)}`, pct: 20 },
            { label: 'Overhead', value: '$150.00', pct: 15 },
            { label: 'Total Cost', value: '$1,000.00', pct: 100 },
          ].map((c) => (
            <Card key={c.label} variant="flat" className="p-4">
              <p className="text-xs text-[var(--neutral-500)] mb-1">{c.label}</p>
              <p className="text-lg font-medium tabular-nums text-foreground">{c.value}</p>
              {c.pct < 100 && (
                <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--mw-yellow-400)]" style={{ width: `${c.pct}%` }} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* ── Suppliers — Odoo / FulcrumPro parity ──────── */}
      <section className="space-y-4">
        <SubHeading actions={
          <Button variant="outline" size="sm" className="border-[var(--border)] h-8 text-xs gap-1"
            onClick={() => toast.info('Add supplier — coming soon')}
          >
            <Plus className="w-3 h-3" /> Add supplier
          </Button>
        }>
          Suppliers · <span className="text-[var(--neutral-500)] font-normal">{PRODUCT_SUPPLIERS.length} vendors</span>
        </SubHeading>
        <Card variant="flat" className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <th className="text-left  px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Vendor</th>
                <th className="text-left  px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Vendor part #</th>
                <th className="text-left  px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">MPN</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Unit price</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Lead time</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">MOQ</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Preferred</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_SUPPLIERS.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{s.vendorName}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--neutral-500)]">{s.vendorPartNo ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--neutral-500)]">{s.mpn ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${s.unitPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--neutral-500)]">{s.leadTimeDays} days</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--neutral-500)]">{s.moq}</td>
                  <td className="px-4 py-3 text-center">
                    {s.preferred ? (
                      <Badge className="border-0 bg-[var(--mw-yellow-400)] text-primary-foreground text-xs">Preferred</Badge>
                    ) : (
                      <span className="text-[var(--neutral-400)] text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* ── Where-used — parent BOMs that consume this product ── */}
      <section className="space-y-4">
        <SubHeading>
          Where-used · <span className="text-[var(--neutral-500)] font-normal">{WHERE_USED.length} parent assemblies</span>
        </SubHeading>
        <Card variant="flat" className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <th className="text-left  px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Parent assembly</th>
                <th className="text-left  px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">SKU</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Qty / parent</th>
                <th className="text-left  px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)]">BOM</th>
              </tr>
            </thead>
            <tbody>
              {WHERE_USED.map((w) => (
                <tr key={w.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{w.parentName}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--neutral-500)]">{w.parentSku}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{w.qtyPer}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--neutral-500)]">{w.bomVersion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* ── Activity templates — fired when this product is sold ── */}
      <section className="space-y-4">
        <SubHeading>
          Activity templates ·{' '}
          <span className="text-[var(--neutral-500)] font-normal">
            Applied when sold (Plan)
          </span>
        </SubHeading>

        <Card variant="flat" className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">
                Product kind
              </label>
              <Select value={productKind} onValueChange={(v) => setProductKind(v as ProductKind)}>
                <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="widget">Widget — repeatable, light planning</SelectItem>
                  <SelectItem value="configurable">Configurable — full lifecycle</SelectItem>
                  <SelectItem value="mixed">Mixed — blend of both</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--neutral-500)] mt-1.5">
                Drives the default suggested template list. Pins below override.
              </p>
            </div>
            <div className="flex items-end">
              <p className="text-xs text-[var(--neutral-500)]">
                When this product is added to a sales order and the order is confirmed,
                the templates ticked below are pre-applied to the resulting Plan job.
                If none are pinned, all templates matching <em>{productKind}</em> are
                suggested.
              </p>
            </div>
          </div>

          {allTemplates.length === 0 ? (
            <p className="text-xs italic text-[var(--neutral-500)]">
              No templates defined yet — open Plan Settings ▸ Templates to create one.
            </p>
          ) : (
            <div className="space-y-2">
              <label className="text-sm text-[var(--neutral-500)] block">
                Pinned templates ({pinnedTemplateIds.length}/{allTemplates.length})
              </label>
              <div className="grid grid-cols-1 gap-2">
                {allTemplates.map((t) => {
                  const isPinned = pinnedTemplateIds.includes(t.id);
                  const matchesKind = t.productKinds.includes(productKind);
                  return (
                    <label
                      key={t.id}
                      className={cn(
                        'flex items-start gap-3 rounded-md border px-3 py-2.5 transition-colors cursor-pointer',
                        isPinned
                          ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                          : 'border-[var(--border)] bg-card hover:bg-[var(--neutral-50)]',
                      )}
                    >
                      <Checkbox
                        checked={isPinned}
                        onCheckedChange={(checked) => {
                          setPinnedTemplateIds((prev) =>
                            checked
                              ? [...prev, t.id]
                              : prev.filter((id) => id !== t.id),
                          );
                        }}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{t.name}</span>
                          <Badge
                            variant="outline"
                            className="border-[var(--border)] text-[10px] tabular-nums"
                          >
                            {t.id}
                          </Badge>
                          {!matchesKind && !isPinned && (
                            <Badge
                              variant="outline"
                              className="border-[var(--neutral-300)] text-[10px] text-[var(--neutral-500)]"
                            >
                              outside {productKind}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                          {t.activities.length} {t.activities.length === 1 ? 'activity' : 'activities'}
                          {' · '}
                          for{' '}
                          {t.productKinds.map((k, i) => (
                            <span key={k}>
                              {i > 0 ? ', ' : ''}
                              <span className="capitalize">{k}</span>
                            </span>
                          ))}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {t.activities
                            .map((a) => a.defaultAssignee)
                            .filter((x): x is NonNullable<typeof x> => Boolean(x))
                            .slice(0, 4)
                            .map((a, i) => (
                              <AssigneeChip key={i} assignee={a} />
                            ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MIRRORVIEW TAB — CAD files, revisions, 3D preview, where-used
// ═══════════════════════════════════════════════════════════

interface CadFile {
  id: string;
  name: string;
  kind: '2d' | '3d' | 'drawing';
  revision: string;
  sizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
  /** Auto-derived geometry summary; mock-only for now. */
  bboxMm?: { widthMm: number; heightMm: number };
  perimeterMm?: number;
  holeCount?: number;
  yieldPercent?: number;
}

const MOCK_CAD_FILES: CadFile[] = [
  {
    id: 'cad-1',
    name: 'BKT-001-RevC.dxf',
    kind: '2d',
    revision: 'Rev C',
    sizeKb: 184,
    uploadedBy: 'Emma Wilson',
    uploadedAt: '2026-04-12',
    bboxMm: { widthMm: 150, heightMm: 100 },
    perimeterMm: 612,
    holeCount: 4,
    yieldPercent: 78,
  },
  {
    id: 'cad-2',
    name: 'BKT-001-Assembly.step',
    kind: '3d',
    revision: 'Rev C',
    sizeKb: 1240,
    uploadedBy: 'Emma Wilson',
    uploadedAt: '2026-04-12',
  },
  {
    id: 'cad-3',
    name: 'BKT-001-Drawing-RevB.pdf',
    kind: 'drawing',
    revision: 'Rev B',
    sizeKb: 540,
    uploadedBy: 'Mike Thompson',
    uploadedAt: '2026-02-18',
  },
];

const MOCK_REVISIONS = [
  { revision: 'Rev C', effectiveAt: '2026-04-12', changes: 'Hole spacing 75mm → 80mm; added countersink on top face.', author: 'Emma Wilson' },
  { revision: 'Rev B', effectiveAt: '2026-02-18', changes: 'Increased plate thickness 2.5mm → 3mm for load spec compliance.', author: 'Mike Thompson' },
  { revision: 'Rev A', effectiveAt: '2025-11-04', changes: 'Initial release.', author: 'Sarah Chen' },
];

const MOCK_WHERE_USED = [
  { kind: 'quote',     ref: 'Q-2026-0055',  customer: 'TechCorp Industries', value: 42000, status: 'sent' },
  { kind: 'order',     ref: 'SO-2026-0085', customer: 'TechCorp Industries', value: 45000, status: 'confirmed' },
  { kind: 'job',       ref: 'JOB-2026-0012',customer: 'TechCorp Industries', value: 24500, status: 'in_production' },
  { kind: 'mo',        ref: 'MO-2026-0024', customer: 'TechCorp Industries', value: 18000, status: 'planned' },
];

const FILE_KIND_LABEL: Record<CadFile['kind'], { label: string; tone: 'accent' | 'info' | 'neutral' }> = {
  '2d': { label: '2D · DXF', tone: 'accent' },
  '3d': { label: '3D · STEP / GLB', tone: 'info' },
  drawing: { label: 'Drawing · PDF', tone: 'neutral' },
};

function fmtKb(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface MirrorViewTabProps {
  files: CadFile[];
  setFiles: React.Dispatch<React.SetStateAction<CadFile[]>>;
}

function MirrorViewTab({ files, setFiles }: MirrorViewTabProps) {
  const navigate = useNavigate();
  const { id: routeProductId } = useParams<{ id: string }>();
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id ?? '');
  const [dragOver, setDragOver] = useState(false);

  const activeRevision = MOCK_REVISIONS[0];
  const selected = files.find((f) => f.id === selectedFileId) ?? files[0];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length === 0) return;
    const additions: CadFile[] = dropped.map((f, i) => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      const kind: CadFile['kind'] =
        ext === 'pdf' ? 'drawing'
          : ['dxf', 'dwg'].includes(ext) ? '2d'
            : '3d';
      return {
        id: `upload-${Date.now()}-${i}`,
        name: f.name,
        kind,
        revision: activeRevision.revision,
        sizeKb: Math.round(f.size / 1024),
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
    });
    setFiles((prev) => [...additions, ...prev]);
    toast.success(`Uploaded ${additions.length} file${additions.length === 1 ? '' : 's'}`);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success('File removed');
  };

  return (
    <div className="space-y-8">
      {/* ── Revision header ────────────────────────────── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SectionHeading>Engineering files</SectionHeading>
            <Badge className="border-0 bg-[var(--mw-yellow-400)]/20 text-foreground tabular-nums">
              {activeRevision.revision}
            </Badge>
            <span className="text-xs text-[var(--neutral-500)]">
              Effective {fmtDate(activeRevision.effectiveAt)} · {activeRevision.author}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-[var(--border)]"
            onClick={() => {
              const studioId = routeProductId
                ? studioProductIdForCatalogId(routeProductId)
                : null;
              if (studioId) {
                navigate(`/plan/product-studio/${studioId}`);
              } else {
                navigate('/plan/product-studio');
              }
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New revision
          </Button>
        </div>
      </section>

      {/* ── 2-column main row ─────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
        {/* Left: Drop zone + 3D preview */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'flex aspect-[16/10] items-center justify-center rounded-xl border-2 border-dashed transition-colors',
              dragOver
                ? 'border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-400)]/10'
                : 'border-[var(--border)] bg-[var(--neutral-50)]',
            )}
          >
            {selected ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--mw-mirage)] text-white">
                  {selected.kind === '3d' ? (
                    <Layers3 className="h-10 w-10" strokeWidth={1.5} />
                  ) : selected.kind === '2d' ? (
                    <Boxes className="h-10 w-10" strokeWidth={1.5} />
                  ) : (
                    <FileText className="h-10 w-10" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selected.name}</p>
                  <p className="text-xs text-[var(--neutral-500)]">
                    {FILE_KIND_LABEL[selected.kind].label} · {fmtKb(selected.sizeKb)}
                  </p>
                </div>
                <p className="max-w-xs text-xs text-[var(--neutral-500)]">
                  3D preview wires up to the existing GLB viewer in P2. Drop files here to upload — DXF, DWG, STEP, STL, GLB, PDF.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-8 w-8 text-[var(--neutral-400)]" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">Drop CAD files to upload</p>
                <p className="text-xs text-[var(--neutral-500)]">DXF, DWG, STEP, STL, GLB, PDF — up to 50 MB each</p>
              </div>
            )}
          </div>

          {/* Derived metadata strip */}
          {selected?.bboxMm && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card variant="flat" className="p-3">
                <p className="text-xs text-[var(--neutral-500)]">Bounding box</p>
                <p className="text-sm font-medium tabular-nums text-foreground">
                  {selected.bboxMm.widthMm} × {selected.bboxMm.heightMm} mm
                </p>
              </Card>
              <Card variant="flat" className="p-3">
                <p className="text-xs text-[var(--neutral-500)]">Perimeter</p>
                <p className="text-sm font-medium tabular-nums text-foreground">{selected.perimeterMm} mm</p>
              </Card>
              <Card variant="flat" className="p-3">
                <p className="text-xs text-[var(--neutral-500)]">Holes</p>
                <p className="text-sm font-medium tabular-nums text-foreground">{selected.holeCount}</p>
              </Card>
              <Card variant="flat" className="p-3">
                <p className="text-xs text-[var(--neutral-500)]">Sheet yield</p>
                <p className="text-sm font-medium tabular-nums text-foreground">{selected.yieldPercent}%</p>
              </Card>
            </div>
          )}
        </div>

        {/* Right: File list */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Files{' '}
            <span className="text-xs text-[var(--neutral-500)] tabular-nums">({files.length})</span>
          </p>
          <ul className="space-y-1.5">
            {files.length === 0 ? (
              <p className="rounded-md bg-[var(--neutral-50)] p-4 text-center text-xs text-[var(--neutral-500)]">
                No files yet. Drop CAD files on the left to start.
              </p>
            ) : (
              files.map((f) => {
                const kindCfg = FILE_KIND_LABEL[f.kind];
                const isSelected = f.id === selectedFileId;
                return (
                  <li
                    key={f.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                      isSelected
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/10'
                        : 'border-[var(--border)] bg-card hover:border-[var(--neutral-300)]',
                    )}
                    onClick={() => setSelectedFileId(f.id)}
                  >
                    <div className="mt-0.5 shrink-0">
                      {f.kind === '3d' ? (
                        <Layers3 className="h-4 w-4 text-[var(--neutral-500)]" />
                      ) : f.kind === '2d' ? (
                        <Boxes className="h-4 w-4 text-[var(--neutral-500)]" />
                      ) : (
                        <FileText className="h-4 w-4 text-[var(--neutral-500)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--neutral-500)]">
                        <StatusBadge variant={kindCfg.tone}>{kindCfg.label}</StatusBadge>
                        <span className="tabular-nums">{f.revision}</span>
                        <span>·</span>
                        <span className="tabular-nums">{fmtKb(f.sizeKb)}</span>
                        <span>·</span>
                        <span>{fmtDate(f.uploadedAt)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-error)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.id);
                      }}
                      aria-label="Remove file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      {/* ── Revision history ──────────────────────────── */}
      <section className="space-y-3">
        <SubHeading>Revision history</SubHeading>
        <Card className="divide-y divide-[var(--border)] p-0">
          {MOCK_REVISIONS.map((r, i) => (
            <div key={r.revision} className="flex items-start gap-4 p-4">
              <div className="shrink-0">
                <Badge
                  className={cn(
                    'border-0 text-xs tabular-nums',
                    i === 0
                      ? 'bg-[var(--mw-yellow-400)]/20 text-foreground'
                      : 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
                  )}
                >
                  {r.revision}
                </Badge>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{r.changes}</p>
                <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                  {fmtDate(r.effectiveAt)} · {r.author}
                </p>
              </div>
              {i === 0 && (
                <Badge variant="outline" className="border-[var(--border)] text-xs">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </Card>
      </section>

      {/* ── Where used ───────────────────────────────── */}
      <section className="space-y-3">
        <SubHeading>Where used</SubHeading>
        <Card className="divide-y divide-[var(--border)] p-0">
          {MOCK_WHERE_USED.map((row) => (
            <div key={row.ref} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-[var(--border)] text-xs uppercase tabular-nums">
                  {row.kind}
                </Badge>
                <div>
                  <p className="text-sm font-medium tabular-nums text-foreground">{row.ref}</p>
                  <p className="text-xs text-[var(--neutral-500)]">{row.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  ${row.value.toLocaleString('en-AU')}
                </span>
                <StatusBadge status={row.status as never} />
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INVENTORY TAB
// ═══════════════════════════════════════════════════════════
function InventoryTab() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState(STOCK_BY_LOCATION.warehouseA.name);
  const [transferTo, setTransferTo] = useState(STOCK_BY_LOCATION.warehouseB.name);
  const [transferQty, setTransferQty] = useState('10');

  const submitTransfer = () => {
    // TODO(backend): inventory.transfer(productId, fromLoc, toLoc, qty)
    toast.success(`Transferred ${transferQty} units from ${transferFrom} to ${transferTo}`);
    setTransferOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* ── Stock Overview KPIs ───────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Stock Overview</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'On Hand', value: '250', hint: 'units', color: 'text-foreground' },
            { label: 'Available', value: '230', hint: '20 reserved', color: 'text-[var(--chart-scale-high)]' },
            { label: 'Incoming', value: '100', hint: 'PO-2401', color: 'text-[var(--chart-scale-mid)]' },
            { label: 'Outgoing', value: '75', hint: 'SO-1234', color: 'text-[var(--mw-yellow-400)]' },
            { label: 'Forecasted', value: '180', hint: '30 days', color: 'text-foreground' },
          ].map((s) => (
            <Card key={s.label} variant="flat" className="p-5">
              <p className="text-xs font-medium text-[var(--neutral-500)] mb-1">{s.label}</p>
              <p className={cn('text-2xl font-medium tabular-nums', s.color)}>{s.value}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.hint}</p>
            </Card>
          ))}
        </div>

        {/* Health Banner */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--mw-success-light)] border border-[var(--mw-green-100)]">
          <CheckCircle className="w-5 h-5 text-[var(--mw-success)]" />
          <div>
            <p className="text-sm font-medium text-[var(--mw-success)]">Healthy Stock Level</p>
            <p className="text-xs text-[var(--neutral-600)]">Above reorder point by 200 units</p>
          </div>
          <StatusBadge variant="success" className="ml-auto">Optimal</StatusBadge>
        </div>

        {/* Stock Level Chart Placeholder */}
        <Card variant="flat" className="p-6 flex items-center justify-center h-48">
          <div className="text-center text-[var(--neutral-400)]">
            <TrendingUp className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">Stock level chart (last 90 days + forecast)</p>
          </div>
        </Card>
      </section>

      {/* ── Stock by Location ────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Stock by Location</SectionHeading>
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-[var(--border)]"
            onClick={() => setTransferOpen(true)}
          >
            Transfer Stock
          </Button>
        </div>

        <Sheet open={transferOpen} onOpenChange={setTransferOpen}>
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Transfer stock</SheetTitle>
              <SheetDescription>Move inventory between warehouses for this product.</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4">
              <div>
                <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">From</label>
                <Select value={transferFrom} onValueChange={setTransferFrom}>
                  <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[STOCK_BY_LOCATION.warehouseA.name, STOCK_BY_LOCATION.warehouseB.name].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">To</label>
                <Select value={transferTo} onValueChange={setTransferTo}>
                  <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[STOCK_BY_LOCATION.warehouseA.name, STOCK_BY_LOCATION.warehouseB.name].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="h-10 bg-card border-[var(--border)]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="border-[var(--border)]" onClick={() => setTransferOpen(false)}>Cancel</Button>
                <Button
                  className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                  disabled={transferFrom === transferTo || Number(transferQty) <= 0}
                  onClick={submitTransfer}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {[STOCK_BY_LOCATION.warehouseA, STOCK_BY_LOCATION.warehouseB].map((wh) => (
          <Card key={wh.name} variant="flat" className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <h4 className="text-sm font-medium text-foreground">{wh.name}</h4>
              <Badge className="bg-[var(--mw-yellow-400)] text-primary-foreground border-0 text-xs tabular-nums">{wh.total} units</Badge>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Location</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Quantity</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {wh.rows.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 text-foreground">{r.location}</td>
                    <td className="px-5 py-3 tabular-nums text-foreground">{r.qty} units</td>
                    <td className="px-5 py-3">
                      <StatusBadge variant={r.status === 'Available' ? 'success' : 'warning'}>
                        {r.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}

        {/* Valuation Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Value', value: '$25,000', hint: '250 units @ $100/unit' },
            { label: 'Valuation Method', value: 'FIFO', hint: '' },
            { label: 'Last Cost Update', value: 'Oct 1, 2025', hint: '' },
          ].map((v) => (
            <Card key={v.label} variant="flat" className="p-5">
              <p className="text-xs font-medium text-[var(--neutral-500)] mb-1">{v.label}</p>
              <p className="text-lg font-medium text-foreground">{v.value}</p>
              {v.hint && <p className="text-xs text-[var(--neutral-500)] mt-0.5">{v.hint}</p>}
            </Card>
          ))}
        </div>
      </section>

      {/* ── Recent Stock Movements ────────────────────── */}
      <section className="space-y-4">
        <SubHeading actions={
          <Button variant="ghost" size="sm" className="text-[var(--mw-yellow-400)] text-xs" onClick={() => toast('View all movements')}>View All →</Button>
        }>
          Recent Stock Movements
        </SubHeading>
        <div className="space-y-3">
          {STOCK_MOVEMENTS.map((m, i) => {
            const iconMap: Record<string, React.ReactNode> = {
              receive: <ArrowDownUp className="w-4 h-4 text-[var(--mw-yellow-400)]" />,
              ship: <Truck className="w-4 h-4 text-[var(--mw-yellow-400)]" />,
              transfer: <RotateCcw className="w-4 h-4 text-[var(--neutral-500)]" />,
            };
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-card">
                <div className="p-2 rounded-lg bg-[var(--neutral-100)]">
                  {iconMap[m.icon]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-[var(--neutral-500)]">{m.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Logistics & Shipping ─────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Logistics & Shipping</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Length', value: '100', unit: 'cm' },
            { label: 'Width', value: '50', unit: 'cm' },
            { label: 'Height', value: '30', unit: 'cm' },
            { label: 'Weight', value: '15', unit: 'kg' },
          ].map((d) => (
            <div key={d.label}>
              <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">{d.label}</label>
              <div className="flex">
                <Input defaultValue={d.value} className="h-10 bg-card border-[var(--border)] rounded-r-none" />
                <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-[var(--border)] bg-[var(--neutral-100)] text-sm text-[var(--neutral-500)]">{d.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">HS Code (Customs)</label>
            <Input defaultValue="7308.90.00" className="h-10 bg-card border-[var(--border)]" />
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Country of Origin</label>
            <Input defaultValue="Australia" className="h-10 bg-card border-[var(--border)]" />
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACCOUNTING TAB
// ═══════════════════════════════════════════════════════════
function AccountingTab() {
  const [valuationMethod, setValuationMethod] = useState('fifo');
  const [financialPeriod, setFinancialPeriod] = useState('90');

  // Chart of accounts (Xero) — fetched once and reused for the three role-filtered Selects.
  const [accounts, setAccounts] = useState<XeroAccount[]>([]);
  useEffect(() => {
    let cancelled = false;
    getXeroAccounts().then((acc) => {
      if (!cancelled) setAccounts(acc);
    });
    return () => { cancelled = true; };
  }, []);

  const incomeAccounts = useMemo(
    () => accounts.filter((a) => a.Class === 'REVENUE'),
    [accounts],
  );
  const expenseAccounts = useMemo(
    () => accounts.filter((a) => a.Type === 'EXPENSE' || a.Type === 'DIRECTCOSTS' || a.Type === 'OVERHEADS'),
    [accounts],
  );
  const inventoryAccounts = useMemo(
    () => accounts.filter((a) => a.Type === 'INVENTORY' || a.Type === 'CURRENT' || a.Class === 'ASSET'),
    [accounts],
  );

  // Defaults attempt to match the previous free-text labels; if no match, pick the first
  // available account in the role. Stays in component state — backend wiring is TODO.
  const findCode = (list: XeroAccount[], name: string) =>
    list.find((a) => a.Name.toLowerCase().includes(name.toLowerCase()))?.Code ?? list[0]?.Code ?? '';

  const [incomeCode, setIncomeCode] = useState<string>('');
  const [expenseCode, setExpenseCode] = useState<string>('');
  const [inventoryCode, setInventoryCode] = useState<string>('');

  useEffect(() => {
    if (incomeAccounts.length && !incomeCode) setIncomeCode(findCode(incomeAccounts, 'Sales'));
  }, [incomeAccounts, incomeCode]);
  useEffect(() => {
    if (expenseAccounts.length && !expenseCode) setExpenseCode(findCode(expenseAccounts, 'Raw materials'));
  }, [expenseAccounts, expenseCode]);
  useEffect(() => {
    if (inventoryAccounts.length && !inventoryCode) setInventoryCode(findCode(inventoryAccounts, 'Inventory'));
  }, [inventoryAccounts, inventoryCode]);

  const accountFields: { label: string; value: string; setValue: (v: string) => void; options: XeroAccount[] }[] = [
    { label: 'Income Account',    value: incomeCode,    setValue: setIncomeCode,    options: incomeAccounts },
    { label: 'Expense Account',   value: expenseCode,   setValue: setExpenseCode,   options: expenseAccounts },
    { label: 'Inventory Account', value: inventoryCode, setValue: setInventoryCode, options: inventoryAccounts },
  ];

  return (
    <div className="space-y-8">
      {/* ── Accounting Configuration ─────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Accounting Configuration</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accountFields.map((f) => (
            <div key={f.label}>
              <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">{f.label}</label>
              <Select value={f.value} onValueChange={f.setValue}>
                <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                  <SelectValue placeholder={accounts.length ? 'Select account…' : 'Loading…'} />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((a) => (
                    <SelectItem key={a.AccountID} value={a.Code}>
                      <span className="tabular-nums text-[var(--neutral-500)] mr-2">{a.Code}</span>
                      {a.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm text-[var(--neutral-500)] mb-3 block">Inventory Valuation Method</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'manual', label: 'Manual', sub: 'Standard cost' },
              { id: 'actual', label: 'Actual Cost', sub: 'Real purchase cost' },
              { id: 'fifo', label: 'FIFO', sub: 'First In First Out' },
              { id: 'avco', label: 'Weighted Average (AVCO)', sub: 'Average Cost' },
              { id: 'lifo', label: 'LIFO', sub: 'Last In First Out' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setValuationMethod(m.id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 p-4 rounded-lg border text-left transition-all',
                  valuationMethod === m.id
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] shadow-sm'
                    : 'border-[var(--border)] bg-card hover:border-[var(--neutral-300)]'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 mb-1',
                  valuationMethod === m.id
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]'
                    : 'border-[var(--neutral-300)]'
                )} />
                <span className="text-sm font-medium text-foreground">{m.label}</span>
                <span className="text-xs text-[var(--neutral-500)]">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Costing ──────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Product Costing</SectionHeading>
        <Card variant="flat" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-foreground">Total Product Cost: $1,000</h4>
            <StatusBadge variant="success">Within Budget</StatusBadge>
          </div>
          {/* Stacked bar */}
          <div className="space-y-3 mb-6">
            {[
              { label: 'Material Cost', icon: Tag, value: '$650 (65%)', pct: 65, color: 'var(--mw-yellow-400)' },
              { label: 'Labor Cost', icon: Wrench, value: '$200 (20%)', pct: 20, color: 'var(--chart-scale-mid)' },
              { label: 'Overhead', icon: Cog, value: '$150 (15%)', pct: 15, color: 'var(--neutral-300)' },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <c.icon className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                <span className="text-sm font-medium text-foreground w-28">{c.label}</span>
                <div className="flex-1 h-3 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                </div>
                <span className="text-sm tabular-nums text-[var(--neutral-500)] w-28 text-right">{c.value}</span>
              </div>
            ))}
          </div>
          {/* Full-width stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden">
            <div style={{ width: '65%', backgroundColor: 'var(--mw-yellow-400)' }} />
            <div style={{ width: '20%', backgroundColor: 'var(--chart-scale-mid)' }} />
            <div style={{ width: '15%', backgroundColor: 'var(--neutral-300)' }} />
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Actual Cost', value: '$1,050', color: 'text-foreground' },
            { label: 'Standard Cost', value: '$1,000', color: 'text-foreground' },
            { label: 'Variance', value: '+$50 (5%)', color: 'text-[var(--mw-error)]' },
          ].map((c) => (
            <Card key={c.label} variant="flat" className="p-5">
              <p className="text-xs font-medium text-[var(--neutral-500)] mb-1">{c.label}</p>
              <p className={cn('text-2xl font-medium tabular-nums', c.color)}>{c.value}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Financial Performance ────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Financial Performance</SectionHeading>
          <div className="flex items-center gap-1 bg-[var(--neutral-100)] rounded-full p-1">
            {['30', '60', '90'].map((p) => (
              <button
                key={p}
                onClick={() => setFinancialPeriod(p)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  financialPeriod === p
                    ? 'bg-[var(--mw-yellow-400)] text-primary-foreground'
                    : 'text-[var(--neutral-500)] hover:text-foreground'
                )}
              >
                {p} days
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: '$125,000', hint: '↗ +12% vs. previous', accent: true, icon: DollarSign },
            { label: 'Units Sold', value: '125', hint: 'Avg. $1,000/unit', accent: false, icon: Package },
            { label: 'Gross Margin', value: '$43,750', hint: '35%', accent: false, icon: BarChart3 },
            { label: 'Profit/Unit', value: '$250', hint: 'After overhead', accent: false, icon: DollarSign },
          ].map((s) => (
            <Card key={s.label} variant="flat" className={cn('p-5', s.accent && 'bg-[var(--mw-yellow-400)]')}>
              <p className={cn('text-xs font-medium mb-1 flex items-center gap-1.5', s.accent ? 'text-primary-foreground' : 'text-[var(--neutral-500)]')}>
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </p>
              <p className={cn('text-2xl font-medium tabular-nums', s.accent ? 'text-primary-foreground' : 'text-foreground')}>{s.value}</p>
              <p className={cn('text-xs mt-0.5', s.accent ? 'text-primary-foreground/80' : 'text-[var(--neutral-500)]')}>{s.hint}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Profitability Analysis ────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Profitability Analysis</SectionHeading>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Contribution Margin', value: '$350', hint: 'per unit' },
            { label: 'Break-even Quantity', value: '50', hint: 'units/month' },
            { label: 'Price Elasticity', value: '0.8', hint: 'Moderate sensitivity' },
          ].map((p) => (
            <Card key={p.label} variant="flat" className="p-5">
              <p className="text-sm font-medium text-[var(--neutral-500)] mb-1">{p.label}</p>
              <p className="text-2xl font-medium tabular-nums text-foreground">{p.value}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{p.hint}</p>
            </Card>
          ))}
        </div>

        <MirrorWorksAgentCard
          title="Suggested price adjustment"
          suggestion="MirrorWorks Agent recommends lifting the list price to $1,050 to protect margin against recent input-cost increases without moving outside comparable market pricing."
          tone="opportunity"
          primaryAction={{
            label: 'Apply $1,050 price',
            onClick: () => {
              setListPrice('1050.00');
              toast.success('List price updated to $1,050');
            },
          }}
          detailContent={
            <div className="space-y-2">
              <p>Drivers: market trend movement, competitor benchmarks, and recent cost increases.</p>
              <p>Current list price: ${PRODUCT.listPrice.toFixed(0)}.</p>
              <p>Suggested list price: $1,050.</p>
            </div>
          }
          evidenceLevel="expandable"
          detailLabel="Pricing detail"
        />
      </section>

      {/* ── Tax & Compliance ─────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Tax & Compliance</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Sales Tax Rules</h4>
            <div className="flex flex-wrap gap-2">
              {['Sale (10%)', 'GST (15%)', 'Export Exempt'].map((t) => (
                <Badge key={t} variant="outline" className="border-[var(--border)] text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Purchase Tax Rules</h4>
            <div className="flex flex-wrap gap-2">
              {['Purchase (10%)', 'Import Duty (5%)'].map((t) => (
                <Badge key={t} variant="outline" className="border-[var(--border)] text-xs">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DOCUMENTS TAB
// ═══════════════════════════════════════════════════════════
type ProductDocument = typeof DOCUMENTS[number];

function DocumentsTab() {
  const [docs, setDocs] = useState<ProductDocument[]>(DOCUMENTS);
  const [previewDoc, setPreviewDoc] = useState<ProductDocument | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const additions: ProductDocument[] = [];
    Array.from(files).forEach((f) => {
      additions.push({
        name: f.name,
        category: 'Uploaded',
        version: '1.0',
        uploadedBy: 'You',
        date: new Date().toISOString().slice(0, 10),
        type: (f.name.split('.').pop() || 'file').toLowerCase(),
      });
    });
    setDocs((prev) => [...additions, ...prev]);
    // TODO(backend): products.documents.upload(productId, files)
    toast.success(`Uploaded ${additions.length} file${additions.length === 1 ? '' : 's'}`);
  };

  const handleDownload = (doc: ProductDocument) => {
    // Mock download — synthesize a small blob with the doc's metadata.
    const content = `MirrorWorks document — ${doc.name}\nCategory: ${doc.category}\nVersion: ${doc.version}\nUploaded by: ${doc.uploadedBy}\nDate: ${doc.date}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* ── Product Documents ────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Product Documents</SectionHeading>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" /> Upload Documents
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center py-10 border-2 border-dashed border-[var(--border)] rounded-lg bg-card hover:border-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-50)] transition-colors"
        >
          <Upload className="w-8 h-8 text-[var(--neutral-300)] mb-2" />
          <p className="text-sm font-medium text-foreground">Drag and drop files here</p>
          <p className="text-xs text-[var(--neutral-500)]">or click to browse</p>
        </button>

        {/* Documents Table */}
        <Card variant="flat" className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Type</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Name</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Category</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Version</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Uploaded By</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Date</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] transition-colors">
                  <td className="px-5 py-3">
                    <FileText className={cn(
                      'w-5 h-5',
                      doc.type === 'pdf' ? 'text-[var(--mw-error)]' : 'text-[var(--neutral-400)]'
                    )} />
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{doc.name}</td>
                  <td className="px-5 py-3 text-[var(--neutral-500)]">{doc.category}</td>
                  <td className="px-5 py-3 tabular-nums text-[var(--neutral-500)]">{doc.version}</td>
                  <td className="px-5 py-3 text-[var(--neutral-500)]">{doc.uploadedBy}</td>
                  <td className="px-5 py-3 tabular-nums text-[var(--neutral-500)]">{doc.date}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-2.5 hover:bg-[var(--neutral-100)] rounded-sm transition-colors"
                        onClick={() => setPreviewDoc(doc)}
                        aria-label={`Preview ${doc.name}`}
                      >
                        <Eye className="w-4 h-4 text-[var(--neutral-500)]" />
                      </button>
                      <button
                        className="p-2.5 hover:bg-[var(--neutral-100)] rounded-sm transition-colors"
                        onClick={() => handleDownload(doc)}
                        aria-label={`Download ${doc.name}`}
                      >
                        <Download className="w-4 h-4 text-[var(--neutral-500)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Preview dialog */}
        <Dialog open={previewDoc != null} onOpenChange={(o) => !o && setPreviewDoc(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewDoc?.name}</DialogTitle>
              <DialogDescription>
                {previewDoc?.category} · v{previewDoc?.version} · {previewDoc?.uploadedBy} · {previewDoc?.date}
              </DialogDescription>
            </DialogHeader>
            <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--neutral-50)] text-sm text-[var(--neutral-500)]">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-10 w-10 text-[var(--neutral-300)]" strokeWidth={1.5} />
                <span>Preview not available in demo</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-[var(--border)]"
                  onClick={() => previewDoc && handleDownload(previewDoc)}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download instead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* ── Related Records ──────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Related Records</SectionHeading>

        {/* Sales Orders */}
        <div>
          <SubHeading actions={
            <Button variant="ghost" size="sm" className="text-[var(--mw-yellow-400)] text-xs">View All</Button>
          }>
            Sales Orders
          </SubHeading>
          <Card variant="flat" className="overflow-hidden mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">SO Number</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Customer</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Qty</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Amount</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {SALES_ORDERS.map((so, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground tabular-nums">{so.number}</td>
                    <td className="px-5 py-3 text-[var(--neutral-500)]">{so.customer}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{so.qty}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium">${so.amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <StatusBadge variant={so.status === 'Shipped' ? 'success' : 'warning'}>{so.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Purchase Orders */}
        <div>
          <SubHeading actions={
            <Button variant="ghost" size="sm" className="text-[var(--mw-yellow-400)] text-xs">View All</Button>
          }>
            Purchase Orders
          </SubHeading>
          <Card variant="flat" className="overflow-hidden mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">PO Number</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Vendor</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Qty</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Amount</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[var(--neutral-500)]">Expected Date</th>
                </tr>
              </thead>
              <tbody>
                {PURCHASE_ORDERS.map((po, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground tabular-nums">{po.number}</td>
                    <td className="px-5 py-3 text-[var(--neutral-500)]">{po.vendor}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{po.qty}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium">${po.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 tabular-nums text-[var(--neutral-500)]">{po.expectedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* ── Collaboration Feed ────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Collaboration Feed</SectionHeading>
          <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">Follow Product</Button>
        </div>

        {/* Post box */}
        <Card variant="flat" className="p-4">
          <Textarea placeholder="Share an update with your team..." className="mb-3 min-h-[60px] bg-[var(--neutral-50)] border-[var(--border)]" />
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-2 text-[var(--neutral-500)] text-xs">
              <Upload className="w-4 h-4" /> Attach
            </Button>
            <Button size="sm" className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground" onClick={() => toast.success('Posted!')}>Post</Button>
          </div>
        </Card>

        {/* Feed Items */}
        <div className="space-y-4">
          {COLLAB_FEED.map((item, i) => (
            <Card key={i} variant="flat" className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                  item.type === 'system' ? 'bg-[var(--neutral-100)] text-[var(--neutral-500)]' :
                  item.type === 'user' ? 'bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-400)]' :
                  'bg-[var(--neutral-100)] text-[var(--neutral-500)]'
                )}>
                  {item.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{item.author}</span>
                    <span className="text-xs text-[var(--neutral-500)]">{item.time}</span>
                  </div>
                  <p className="text-sm text-[var(--neutral-600)]">{item.content}</p>
                  {item.reply && (
                    <p className="text-sm text-[var(--neutral-500)] mt-1 pl-3 border-l-2 border-[var(--border)]">{item.reply}</p>
                  )}
                  {item.type === 'document' && (
                    <div className="flex gap-3 mt-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                        <Eye className="w-3 h-3" /> Preview
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] hover:text-foreground hover:bg-[var(--neutral-100)] rounded-sm px-2 py-1.5 -ml-2 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> {item.comments} Comments
                    </button>
                    {item.likes > 0 && (
                      <button className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] hover:text-foreground hover:bg-[var(--neutral-100)] rounded-sm px-2 py-1.5 transition-colors">
                        <Heart className="w-3.5 h-3.5" /> {item.likes} Likes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PLANNING TAB (MRP / Reorder Rules)
// ═══════════════════════════════════════════════════════════
function PlanningTab() {
  const [reorderPoint, setReorderPoint] = useState('50');
  const [reorderQty, setReorderQty] = useState('150');
  const [safetyStock, setSafetyStock] = useState('25');
  const [leadTime, setLeadTime] = useState('12');
  const [autoReorder, setAutoReorder] = useState(true);
  const [lotSizing, setLotSizing] = useState('eoq');
  const [abcClass] = useState<'A' | 'B' | 'C'>('A');
  const currentStock = 230;

  // Stock level color indicator
  const stockColor = currentStock > Number(reorderPoint) * 2
    ? 'text-[var(--mw-success)]'
    : currentStock > Number(reorderPoint)
      ? 'text-[var(--mw-yellow-400)]'
      : 'text-[var(--mw-error)]';

  const stockBg = currentStock > Number(reorderPoint) * 2
    ? 'bg-[var(--mw-success-light)]'
    : currentStock > Number(reorderPoint)
      ? 'bg-[var(--mw-warning-light)]'
      : 'bg-[var(--mw-error-light)]';

  const stockLabel = currentStock > Number(reorderPoint) * 2
    ? 'Healthy'
    : currentStock > Number(reorderPoint)
      ? 'Caution'
      : 'Critical';

  const abcColors: Record<string, string> = {
    A: 'bg-[var(--mw-yellow-400)] text-neutral-900',
    B: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    C: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  };

  return (
    <div className="space-y-8">
      {/* ── Current Stock & Classification ─────────────── */}
      <section className="space-y-4">
        <SectionHeading>Current Stock Level</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="flat" className={cn('p-5', stockBg)}>
            <p className="text-xs font-medium text-[var(--neutral-500)] mb-1">Current Stock</p>
            <p className={cn('text-3xl font-medium tabular-nums', stockColor)}>{currentStock}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge variant={currentStock > Number(reorderPoint) * 2 ? 'success' : currentStock > Number(reorderPoint) ? 'warning' : 'error'}>
                {stockLabel}
              </StatusBadge>
              <span className="text-xs text-[var(--neutral-500)]">units on hand</span>
            </div>
          </Card>
          <Card variant="flat" className="p-5">
            <p className="text-xs font-medium text-[var(--neutral-500)] mb-1">ABC Classification</p>
            <div className="flex items-center gap-3 mt-2">
              {(['A', 'B', 'C'] as const).map((cls) => (
                <span
                  key={cls}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    cls === abcClass ? abcColors[cls] : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500',
                  )}
                >
                  {cls}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-2">
              Class {abcClass} — {abcClass === 'A' ? 'High value, tight control' : abcClass === 'B' ? 'Moderate value' : 'Low value, loose control'}
            </p>
          </Card>
          <Card variant="flat" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[var(--neutral-500)]">Auto-Reorder</p>
              <Switch checked={autoReorder} onCheckedChange={setAutoReorder} />
            </div>
            <p className="text-sm text-foreground font-medium">{autoReorder ? 'Enabled' : 'Disabled'}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-1">
              {autoReorder
                ? 'System will auto-generate POs when stock falls below reorder point'
                : 'Manual purchase orders only'}
            </p>
            {autoReorder && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--mw-success)]">
                <RefreshCw className="w-3 h-3" /> Next check: daily at 06:00
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ── Reorder Rules ─────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Reorder Rules</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Reorder Point</label>
            <div className="relative">
              <Input
                type="number"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                className="h-10 bg-card border-[var(--border)] pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">units</span>
            </div>
            <p className="text-xs text-[var(--neutral-400)] mt-1">Trigger reorder at this level</p>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Reorder Quantity (EOQ)</label>
            <div className="relative">
              <Input
                type="number"
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                className="h-10 bg-card border-[var(--border)] pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">units</span>
            </div>
            <p className="text-xs text-[var(--neutral-400)] mt-1">Economic order quantity</p>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Safety Stock</label>
            <div className="relative">
              <Input
                type="number"
                value={safetyStock}
                onChange={(e) => setSafetyStock(e.target.value)}
                className="h-10 bg-card border-[var(--border)] pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">units</span>
            </div>
            <p className="text-xs text-[var(--neutral-400)] mt-1">Buffer below reorder point</p>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Lead Time</label>
            <div className="relative">
              <Input
                type="number"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                className="h-10 bg-card border-[var(--border)] pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">days</span>
            </div>
            <p className="text-xs text-[var(--neutral-400)] mt-1">Avg. supplier lead time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Preferred Supplier</label>
            <Select defaultValue="acme">
              <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acme">Acme Industries</SelectItem>
                <SelectItem value="steel-co">Steel Co Australia</SelectItem>
                <SelectItem value="metalworks">MetalWorks PTY</SelectItem>
                <SelectItem value="bluescope">BlueScope Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Lot Sizing Method</label>
            <Select value={lotSizing} onValueChange={setLotSizing}>
              <SelectTrigger className="h-10 bg-card border-[var(--border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Quantity</SelectItem>
                <SelectItem value="lot-for-lot">Lot-for-Lot</SelectItem>
                <SelectItem value="eoq">Economic Order Quantity (EOQ)</SelectItem>
                <SelectItem value="period">Period Order Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Visual reorder level indicator */}
        <Card variant="flat" className="p-5">
          <p className="text-xs font-medium text-[var(--neutral-500)] mb-3">Stock Level Thresholds</p>
          <div className="relative h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            {/* Safety stock zone */}
            <div
              className="absolute inset-y-0 left-0 bg-[var(--mw-error-light)] dark:bg-[var(--mw-error)]/20"
              style={{ width: `${(Number(safetyStock) / (currentStock * 1.2)) * 100}%` }}
            />
            {/* Reorder zone */}
            <div
              className="absolute inset-y-0 left-0 bg-[var(--mw-warning-light)] dark:bg-[var(--mw-yellow-400)]/20"
              style={{ width: `${(Number(reorderPoint) / (currentStock * 1.2)) * 100}%` }}
            />
            {/* Current stock marker */}
            <div
              className="absolute inset-y-0 w-1 bg-[var(--mw-success)] rounded-full"
              style={{ left: `${Math.min((currentStock / (currentStock * 1.2)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--neutral-500)]">
            <span>0</span>
            <span className="text-[var(--mw-error)]">Safety: {safetyStock}</span>
            <span className="text-[var(--mw-yellow-600)] dark:text-[var(--mw-yellow-400)]">Reorder: {reorderPoint}</span>
            <span className="text-[var(--mw-success)]">Current: {currentStock}</span>
          </div>
        </Card>
      </section>

      {/* ── Stock Projection Chart ─────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>30-Day Stock Projection</SectionHeading>
        <Card variant="flat" className="p-6">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={STOCK_PROJECTION} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis
                dataKey="day"
                tick={MW_AXIS_TICK}
                axisLine={{ stroke: 'var(--neutral-200)' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={MW_AXIS_TICK}
                axisLine={{ stroke: 'var(--neutral-200)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={MW_TOOLTIP_STYLE}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 500, marginBottom: 4 }}
              />
              <ReferenceLine
                y={Number(reorderPoint)}
                stroke="var(--mw-yellow-400)"
                strokeDasharray="6 4"
                label={{ value: 'Reorder Point', position: 'insideTopRight', fill: 'var(--mw-yellow-600)', fontSize: 11 }}
              />
              <ReferenceLine
                y={Number(safetyStock)}
                stroke="var(--mw-error)"
                strokeDasharray="4 4"
                label={{ value: 'Safety Stock', position: 'insideBottomRight', fill: 'var(--mw-error)', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="stock"
                name="Projected Stock"
                stroke={MW_CHART_COLOURS[0]}
                strokeWidth={2}
                dot={false}
                {...MW_RECHARTS_ANIMATION}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-[var(--neutral-500)]">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full" style={{ backgroundColor: MW_CHART_COLOURS[0] }} /> Projected stock
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-[var(--mw-yellow-400)]" style={{ borderTop: '2px dashed' }} /> Reorder point
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-[var(--mw-error)]" style={{ borderTop: '2px dashed' }} /> Safety stock
            </span>
          </div>
        </Card>
      </section>

      {/* ── Agent Planning Insight ─────────────────────── */}
      <MirrorWorksAgentCard
        title="Seasonal stock recommendation"
        suggestion={<>MirrorWorks Agent recommends raising safety stock to <strong>35 units</strong> before the Sep-Nov demand peak while keeping the current EOQ of {reorderQty} units.</>}
        tone="neutral"
        primaryAction={{
          label: 'Update planning rules',
          onClick: () => toast.success('Planning recommendation applied'),
        }}
        detailContent={
          <div className="space-y-2">
            <p>Seasonal demand is concentrated in Sep-Nov.</p>
            <p>Current EOQ remains optimal for the current demand rate.</p>
            <p>The recommended change is to increase safety stock only, not reorder quantity.</p>
          </div>
        }
        evidenceLevel="expandable"
        detailLabel="Planning detail"
      />

      {/* ── Save actions ──────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" className="border-[var(--border)]" onClick={() => toast('Changes discarded')}>
          Discard
        </Button>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground" onClick={() => toast.success('Planning rules saved')}>
          Save Planning Rules
        </Button>
      </div>
    </div>
  );
}

/**
 * Total stock-location rows across all warehouses — used both by the
 * Inventory tab and the Inventory tab badge.
 */
function totalStockLocations(): number {
  return Object.values(STOCK_BY_LOCATION).reduce(
    (sum, wh) => sum + wh.rows.length,
    0,
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════
export interface ProductDetailProps {
  /** Module context for breadcrumb and back navigation */
  module?: 'sell' | 'buy' | 'plan' | 'make';
}

export function ProductDetail({ module = 'sell' }: ProductDetailProps) {
  const { id: routeProductId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !routeProductId || routeProductId === 'new';
  const studioProductId =
    module === 'plan' ? studioProductIdForCatalogId(routeProductId) : null;

  const handleSaveProduct = () => {
    // TODO(backend): isNew ? products.create(product) : products.update(product.id, product)
    if (isNew) {
      // Demo mode — synthetic ids don't resolve in the mock catalogue, so
      // bounce back to the list page rather than showing "not found".
      toast.success('Product created');
      navigate(`/${module}/products`, { replace: true });
    } else {
      toast.success('Product saved');
    }
  };

  const handleNewQuoteFromProduct = () => {
    if (isNew) return;
    navigate(`/sell/quotes/new?productId=${routeProductId}`);
  };

  const openProductStudio = () => {
    if (studioProductId) {
      navigate(`/plan/product-studio/${studioProductId}`);
      return;
    }
    toast.message('No configurator record for this SKU', {
      description: 'Product Studio lists configurable templates you can copy.',
    });
    navigate('/plan/product-studio');
  };

  const [tab, setTab] = useState<Tab>('Overview');

  // CAD files lifted up so the MirrorView tab badge reflects live state.
  const [cadFiles, setCadFiles] = useState<CadFile[]>(MOCK_CAD_FILES);

  /**
   * Tab badges derived from real data. Adding a CAD file or removing a BOM
   * line will bump the matching badge automatically. `Planning` stays the
   * "MRP" label since that's a category marker, not a count.
   */
  const tabBadges: Partial<Record<Tab, number | string>> = useMemo(
    () => ({
      Manufacturing: BOM_LINES.length,
      MirrorView: cadFiles.length,
      Inventory: totalStockLocations(),
      Planning: 'MRP',
      Documents: DOCUMENTS.length,
    }),
    [cadFiles.length],
  );

  const renderTabContent = (): JSX.Element => {
    switch (tab) {
      case 'Overview':      return <OverviewTab />;
      case 'Manufacturing': return <ManufacturingTab />;
      case 'MirrorView':    return <MirrorViewTab files={cadFiles} setFiles={setCadFiles} />;
      case 'Inventory':     return <InventoryTab />;
      case 'Planning':      return <PlanningTab />;
      case 'Accounting':    return <AccountingTab />;
      case 'Documents':     return <DocumentsTab />;
    }
  };

  const capabilityColors: Record<string, string> = {
    'Can be Sold': 'bg-[var(--mw-yellow-400)] text-primary-foreground',
    'Can be Purchased': 'bg-[var(--mw-error)] text-white',
    'Can be Manufactured': 'bg-[var(--chart-scale-mid)] text-white',
  };

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {!isNew && (
            <PartThumbnail
              size="xl"
              imageUrl={PRODUCT.imageUrl}
              alt={PRODUCT.name}
              fallbackIcon={Package}
            />
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-medium text-foreground">{isNew ? 'New Product' : PRODUCT.name}</h1>
            {!isNew && PRODUCT.capabilities.map((cap) => (
              <Badge key={cap} className={cn('border-0 text-xs', capabilityColors[cap] ?? 'bg-[var(--neutral-100)] text-[var(--neutral-500)]')}>
                {cap}
              </Badge>
            ))}
            {!isNew && PRODUCT.traceable && (
              <Badge variant="outline" className="border-[var(--border)] text-xs">Traceable</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="h-12 border-[var(--border)]"
            onClick={() => navigate(module === 'plan' ? '/plan/products' : module === 'make' ? '/make/products' : '/sell/products')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {module === 'plan' && !isNew && (
            <Button
              type="button"
              variant="outline"
              className="h-12 border-[var(--border)] gap-2"
              onClick={openProductStudio}
            >
              <Boxes className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              Product Studio
            </Button>
          )}
          <Button
            variant="outline"
            className="h-12 border-[var(--border)]"
            onClick={handleSaveProduct}
          >
            Save
          </Button>
          {!isNew && (
            <Button
              className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={handleNewQuoteFromProduct}
            >
              <FileText className="mr-2 h-4 w-4" />
              New quote
            </Button>
          )}
        </div>
      </div>

      {/* ── Tab bar — pill style matching Sell Opportunity / Plan Job ─ */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex w-full flex-col gap-0">
        <TabsList className="h-auto w-full min-h-11 flex-wrap justify-start gap-1 rounded-xl p-1 sm:w-fit">
          {TABS.map((t) => {
            const badge = tabBadges[t];
            return (
              <TabsTrigger key={t} value={t} className="gap-2 px-3 sm:px-4">
                <span>{t}</span>
                {badge !== undefined && (
                  <Badge
                    variant="secondary"
                    className="border-0 bg-[var(--neutral-200)] px-1.5 py-0 text-xs font-medium text-[var(--neutral-800)] tabular-nums"
                  >
                    {badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Tab content ─────────────────────────────── */}
        <TabsContent value={tab} className="mt-6 focus-visible:outline-none">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
