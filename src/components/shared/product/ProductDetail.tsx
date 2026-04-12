/**
 * Shared Product Detail — 6-tab view used across Sell, Plan & Make modules
 * Tabs: Overview | Manufacturing | Inventory | Planning | Accounting | Documents
 * Figma: 484:251921, 519:290499, 519:295628, 519:332160
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  Package, Box, Layers, Settings, Wrench, Scissors,
  Barcode, Plus, TrendingUp, Eye, Download, Upload, FileText,
  CheckCircle, ClipboardList, Tag, Cog, DollarSign,
  ShoppingCart, Truck, ArrowDownUp, Heart, MessageSquare,
  RotateCcw, Star, BarChart3, ChevronRight, Clock, MapPin,
  RefreshCw, Sparkles, Boxes,
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

import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { studioProductIdForCatalogId } from '@/lib/product-studio-catalog-map';

// ── Mock product data ─────────────────────────────────────
const PRODUCT = {
  name: 'Product Name',
  capabilities: ['Can be Sold', 'Can be Purchased', 'Can be Manufactured'] as const,
  traceable: true,
  productType: 'storable' as string,
  category: 'Manufactured Goods — Metal Fabrication',
  family: 'Structural Components',
  internalRef: 'INT-REF-001',
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
  { step: 1, name: 'CNC Laser Cutting', workCenter: 'Cutting', duration: 2, setup: 30, status: 'complete' as const },
  { step: 2, name: 'Press Brake Forming', workCenter: 'Forming', duration: 1.5, setup: 20, status: 'complete' as const },
  { step: 3, name: 'MIG Welding', workCenter: 'Welding', duration: 3, setup: 15, status: 'in_progress' as const },
  { step: 4, name: 'Grind & Deburr', workCenter: 'Finishing', duration: 0.5, setup: 0, status: 'not_started' as const },
  { step: 5, name: 'Powder Coat', workCenter: 'Finishing', duration: 4, setup: 45, status: 'not_started' as const },
  { step: 6, name: 'Assembly & QC', workCenter: 'Assembly', duration: 1, setup: 0, status: 'not_started' as const },
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
const TABS = ['Overview', 'Manufacturing', 'Inventory', 'Planning', 'Accounting', 'Documents'] as const;
type Tab = (typeof TABS)[number];

const TAB_BADGES: Partial<Record<Tab, number | string>> = {
  Manufacturing: 6,
  Inventory: 4,
  Planning: 'MRP',
  Documents: 3,
};

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
                    'flex flex-col items-start gap-1 p-4 rounded-[var(--shape-lg)] border text-left transition-all',
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
            <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">Internal Reference</label>
            <Input defaultValue={PRODUCT.internalRef} className="h-10 bg-card border-[var(--border)]" />
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
                    : `PRD-${PRODUCT.internalRef}`;
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
              <Input defaultValue="1,000.00" className="h-10 rounded-l-none bg-card border-[var(--border)]" />
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
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs border-[var(--border)]" onClick={() => toast('Add tier coming soon')}>
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
              {TIERED_PRICING.map((tier, i) => (
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

        {/* AI Insights */}
        <Card className="bg-[var(--mw-yellow-50)] border-[var(--mw-yellow-200)] p-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            Agent insights
          </h4>
          <div className="space-y-2.5 text-sm text-foreground">
            <p className="flex items-start gap-2"><TrendingUp className="w-4 h-4 text-[var(--mw-yellow-400)] mt-0.5 shrink-0" /> Sales increased <strong>15%</strong> after adding customer XYZ Corp.</p>
            <p className="flex items-start gap-2"><Truck className="w-4 h-4 text-[var(--mw-yellow-400)] mt-0.5 shrink-0" /> Vendor lead times increased by <strong>3 days</strong> over last quarter</p>
            <p className="flex items-start gap-2"><DollarSign className="w-4 h-4 text-[var(--mw-yellow-400)] mt-0.5 shrink-0" /> <strong>10% discount</strong> increased sales 25% in Q3</p>
            <p className="flex items-start gap-2"><BarChart3 className="w-4 h-4 text-[var(--mw-yellow-400)] mt-0.5 shrink-0" /> Peak demand: <strong>Sep-Nov</strong> (40% of annual sales)</p>
          </div>
        </Card>

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
              onClick={() => toast(`${a.label} coming soon`)}
              className="flex items-center gap-3 p-4 rounded-[var(--shape-lg)] border border-[var(--border)] bg-card hover:bg-[var(--neutral-50)] transition-colors text-left"
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
function ManufacturingTab() {
  const totalTime = ROUTING.reduce((s, r) => s + r.duration, 0);
  const totalMaterial = BOM_LINES.reduce((s, l) => s + l.qty * l.cost, 0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const bomColumns: FinancialColumn<(typeof BOM_LINES)[number]>[] = [
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

  return (
    <div className="space-y-8">
      {/* ── BOM Material Pills ────────────────────────── */}
      <section className="space-y-4">
        <SubHeading actions={
          <Button variant="outline" size="sm" className="border-[var(--border)] h-8 text-xs" onClick={() => toast('Edit BOM coming soon')}>Edit BOM</Button>
        }>
          Bill of Materials · v1.2
        </SubHeading>

        {/* Pill chips */}
        <div className="flex flex-wrap gap-2">
          {BOM_LINES.map((line) => (
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
            Show full BOM table — {BOM_LINES.length} lines, ${totalMaterial.toLocaleString('en-AU', { minimumFractionDigits: 2 })} total
          </summary>
          <div className="mt-3">
            <FinancialTable columns={bomColumns} data={BOM_LINES} keyExtractor={(row) => row.sku} totals={bomTotals} />
          </div>
        </details>
      </section>

      {/* ── Routing Flow Pipeline ─────────────────────── */}
      <section className="space-y-4">
        <SubHeading actions={
          <Button variant="outline" size="sm" className="border-[var(--border)] h-8 text-xs" onClick={() => toast('Edit routing coming soon')}>Edit routing</Button>
        }>
          Routing — <span className="tabular-nums">{totalTime}h</span> total cycle time
        </SubHeading>

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
                <Card variant="flat" className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-medium text-foreground">{op.name}</h4>
                      <p className="text-xs text-[var(--neutral-500)]">Step {op.step} of {ROUTING.length}</p>
                    </div>
                    <Badge className={cn('border-0 text-xs', routingStatusStyle(op.status))}>
                      {routingStatusLabel(op.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-0.5">Work Centre</p>
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--neutral-400)]" /> {op.workCenter}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-0.5">Cycle Time</p>
                      <p className="font-medium text-foreground tabular-nums flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[var(--neutral-400)]" /> {op.duration}h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-0.5">Setup Time</p>
                      <p className="font-medium text-foreground tabular-nums">{op.setup > 0 ? `${op.setup} min` : 'None'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-0.5">Total Duration</p>
                      <p className="font-medium text-foreground tabular-nums">{(op.duration + op.setup / 60).toFixed(1)}h</p>
                    </div>
                  </div>
                </Card>
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INVENTORY TAB
// ═══════════════════════════════════════════════════════════
function InventoryTab() {
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
        <div className="flex items-center gap-3 p-4 rounded-[var(--shape-lg)] bg-[var(--mw-success-light)] border border-[var(--mw-green-100)]">
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
          <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]" onClick={() => toast('Transfer stock coming soon')}>
            Transfer Stock
          </Button>
        </div>

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
              <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--shape-lg)] border border-[var(--border)] bg-card">
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

  return (
    <div className="space-y-8">
      {/* ── Accounting Configuration ─────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Accounting Configuration</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Income Account', value: 'Product Sales' },
            { label: 'Expense Account', value: 'Cost of Goods Sold' },
            { label: 'Inventory Account', value: 'Finished Goods Inventory' },
          ].map((a) => (
            <div key={a.label}>
              <label className="text-sm text-[var(--neutral-500)] mb-1.5 block">{a.label}</label>
              <Input defaultValue={a.value} className="h-10 bg-card border-[var(--border)]" />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm text-[var(--neutral-500)] mb-3 block">Inventory Valuation Method</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'manual', label: 'Manual', sub: 'Standard cost' },
              { id: 'fifo', label: 'FIFO', sub: 'First In First Out' },
              { id: 'avco', label: 'AVCO', sub: 'Average Cost' },
              { id: 'lifo', label: 'LIFO', sub: 'Last In First Out' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setValuationMethod(m.id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 p-4 rounded-[var(--shape-lg)] border text-left transition-all',
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

        {/* AI Suggested Price */}
        <div className="flex items-start gap-3 p-4 rounded-[var(--shape-lg)] bg-[var(--mw-yellow-50)] border border-[var(--mw-yellow-200)]">
          <Sparkles className="w-5 h-5 text-[var(--mw-yellow-400)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">AI-Suggested Price: $1,050</p>
            <p className="text-xs text-[var(--neutral-600)]">Based on market trends, competitor pricing, and recent cost increases</p>
          </div>
        </div>
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
function DocumentsTab() {
  return (
    <div className="space-y-8">
      {/* ── Product Documents ────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Product Documents</SectionHeading>
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2" onClick={() => toast('Upload documents coming soon')}>
            <Upload className="w-4 h-4" /> Upload Documents
          </Button>
        </div>

        {/* Drop zone */}
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[var(--border)] rounded-[var(--shape-lg)] bg-card">
          <Upload className="w-8 h-8 text-[var(--neutral-300)] mb-2" />
          <p className="text-sm font-medium text-foreground">Drag and drop files here</p>
          <p className="text-xs text-[var(--neutral-500)]">or click to browse</p>
        </div>

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
              {DOCUMENTS.map((doc, i) => (
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
                      <button className="p-2.5 hover:bg-[var(--neutral-100)] rounded-[var(--shape-sm)] transition-colors" onClick={() => toast('Preview coming soon')}>
                        <Eye className="w-4 h-4 text-[var(--neutral-500)]" />
                      </button>
                      <button className="p-2.5 hover:bg-[var(--neutral-100)] rounded-[var(--shape-sm)] transition-colors" onClick={() => toast.success('Downloading...')}>
                        <Download className="w-4 h-4 text-[var(--neutral-500)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
                    <button className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] hover:text-foreground hover:bg-[var(--neutral-100)] rounded-[var(--shape-sm)] px-2 py-1.5 -ml-2 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> {item.comments} Comments
                    </button>
                    {item.likes > 0 && (
                      <button className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] hover:text-foreground hover:bg-[var(--neutral-100)] rounded-[var(--shape-sm)] px-2 py-1.5 transition-colors">
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

      {/* ── AI Planning Insight ────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-[var(--shape-lg)] bg-[var(--mw-yellow-50)] border border-[var(--mw-yellow-200)]">
        <Sparkles className="w-5 h-5 text-[var(--mw-yellow-400)] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">AI Planning Recommendation</p>
          <p className="text-xs text-[var(--neutral-600)] mt-0.5">
            Based on demand patterns, consider increasing safety stock to <strong>35 units</strong> ahead of the Sep-Nov peak season.
            Current EOQ of {reorderQty} units is optimal for the current demand rate.
          </p>
        </div>
      </div>

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

// ── Tab component map ───────────────────────────────────
const TAB_COMPONENTS: Record<Tab, () => JSX.Element> = {
  Overview: OverviewTab,
  Manufacturing: ManufacturingTab,
  Inventory: InventoryTab,
  Planning: PlanningTab,
  Accounting: AccountingTab,
  Documents: DocumentsTab,
};

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
  const studioProductId =
    module === 'plan' ? studioProductIdForCatalogId(routeProductId) : null;

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
  const TabContent = TAB_COMPONENTS[tab];

  const capabilityColors: Record<string, string> = {
    'Can be Sold': 'bg-[var(--mw-yellow-400)] text-primary-foreground',
    'Can be Purchased': 'bg-[var(--mw-error)] text-white',
    'Can be Manufactured': 'bg-[var(--chart-scale-mid)] text-white',
  };

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-medium text-foreground">{PRODUCT.name}</h1>
          {PRODUCT.capabilities.map((cap) => (
            <Badge key={cap} className={cn('border-0 text-xs', capabilityColors[cap] ?? 'bg-[var(--neutral-100)] text-[var(--neutral-500)]')}>
              {cap}
            </Badge>
          ))}
          {PRODUCT.traceable && (
            <Badge variant="outline" className="border-[var(--border)] text-xs">Traceable</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {module === 'plan' && (
            <Button
              type="button"
              variant="outline"
              className="h-9 border-[var(--border)] text-sm gap-2"
              onClick={openProductStudio}
            >
              <Boxes className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Product Studio
            </Button>
          )}
          <Button variant="outline" className="h-9 border-[var(--border)] text-sm" onClick={() => toast.success('Product saved')}>Save</Button>
          <Button className="h-9 bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90 text-sm" onClick={() => toast('New quote coming soon')}>New Quote</Button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────── */}
      <div className="flex border-b border-[var(--border)] -mx-6 px-6">
        {TABS.map((t) => {
          const badge = TAB_BADGES[t];
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'py-3 mr-6 text-sm border-b-2 transition-colors flex items-center gap-1.5',
                tab === t
                  ? 'border-[var(--mw-mirage)] text-foreground font-medium'
                  : 'border-transparent text-[var(--neutral-500)] hover:text-foreground'
              )}
            >
              {t}
              {badge !== undefined && (
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-medium px-1',
                  tab === t
                    ? 'bg-[var(--mw-mirage)] text-white'
                    : 'bg-[var(--neutral-200)] text-[var(--neutral-500)]'
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      <TabContent />
    </PageShell>
  );
}
