/**
 * Sell Product Detail — 5-tab view
 * Tabs: Overview · Manufacturing · Inventory · Accounting · Documents
 * Figma nodes: 484:251921 through 519:332160
 */
import React, { useState } from 'react';
import { ArrowLeft, Edit, MoreVertical, Package, TrendingUp, AlertTriangle, FileText, Download, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { useNavigate } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── Mock product data ─────────────────────────────────────
const PRODUCT = {
  id: '1',
  name: 'Server Rack Chassis',
  sku: 'PROD-SR-001',
  category: 'Finished Goods',
  type: 'Manufactured',
  status: 'active',
  description: 'Custom-fabricated server rack chassis in 1.5mm cold-rolled steel, powder-coated in RAL 7035 light grey. Designed to Australian data centre standard AS/NZS 2755. Available in 6U, 12U, and 24U configurations.',
  sellPrice: 1280.00,
  costPrice: 820.00,
  weight: '12.4 kg',
  dimensions: '600 × 480 × 265 mm',
  lead_time: 12,
  moq: 1,
  updatedAt: 'Mar 15',
};

const ROUTING = [
  { step: 1, name: 'CNC Laser Cutting',   workCenter: 'Cutting',   duration: 2,   setup: 30 },
  { step: 2, name: 'Press Brake Forming', workCenter: 'Forming',   duration: 1.5, setup: 20 },
  { step: 3, name: 'MIG Welding',         workCenter: 'Welding',   duration: 3,   setup: 15 },
  { step: 4, name: 'Grind & Deburr',      workCenter: 'Finishing', duration: 0.5, setup: 0 },
  { step: 5, name: 'Powder Coat',         workCenter: 'Finishing', duration: 4,   setup: 45 },
  { step: 6, name: 'Assembly & QC',       workCenter: 'Assembly',  duration: 1,   setup: 0 },
];

const BOM_LINES = [
  { sku: 'MS-10-3678',  description: '10mm MS Plate',        qty: 4,    unit: 'sheet', cost: 185.00 },
  { sku: 'RHS-50252',   description: 'RHS 50x25x2.5',       qty: 8,    unit: 'length',cost: 12.80 },
  { sku: 'HW-KIT-001',  description: 'Hardware Kit M10 SS', qty: 2,    unit: 'kit',   cost: 8.40 },
  { sku: 'PNT-RAL7035', description: 'Powder Coat RAL 7035',qty: 1.5,  unit: 'kg',    cost: 11.00 },
  { sku: 'LABOUR-FAB',  description: 'Fabrication Labour',  qty: 6.5,  unit: 'hrs',   cost: 55.00 },
  { sku: 'LABOUR-WLD',  description: 'Welding Labour',      qty: 3,    unit: 'hrs',   cost: 60.00 },
];

const INVENTORY_MOVEMENTS = [
  { date: 'Mar 20', type: 'Production',  ref: 'MO-0045', qty: +5,  balance: 8 },
  { date: 'Mar 18', type: 'Shipment',    ref: 'SH-041',  qty: -3,  balance: 3 },
  { date: 'Mar 15', type: 'Production',  ref: 'MO-0041', qty: +4,  balance: 6 },
  { date: 'Mar 10', type: 'Shipment',    ref: 'SH-038',  qty: -2,  balance: 2 },
  { date: 'Mar 05', type: 'Adjustment',  ref: 'ADJ-012', qty: +1,  balance: 4 },
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
  { name: 'Technical Drawing Rev C',         type: 'DWG', size: '2.4 MB', date: 'Mar 15', status: 'current' },
  { name: 'Material Certificate MS Plate',   type: 'PDF', size: '480 KB', date: 'Mar 01', status: 'current' },
  { name: 'QC Inspection Report #2026-044',  type: 'PDF', size: '1.1 MB', date: 'Feb 28', status: 'current' },
  { name: 'Step File (CAD)',                 type: 'STP', size: '8.2 MB', date: 'Feb 20', status: 'current' },
  { name: 'BOM Excel Export',               type: 'XLS', size: '156 KB', date: 'Feb 15', status: 'outdated' },
  { name: 'Powder Coat Specification',       type: 'PDF', size: '320 KB', date: 'Jan 10', status: 'current' },
];

const TABS = ['Overview', 'Manufacturing', 'Inventory', 'Accounting', 'Documents'] as const;
type Tab = typeof TABS[number];

// ── Sub-tabs ─────────────────────────────────────────────
function OverviewTab() {
  const margin = ((PRODUCT.sellPrice - PRODUCT.costPrice) / PRODUCT.sellPrice) * 100;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sell price',  value: `$${PRODUCT.sellPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, mono: true },
          { label: 'Cost price',  value: `$${PRODUCT.costPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, mono: true },
          { label: 'Margin',      value: `${margin.toFixed(1)}%`, mono: true, highlight: margin >= 25 ? 'green' : 'yellow' },
          { label: 'Lead time',   value: `${PRODUCT.lead_time} days`, mono: false },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] mb-1 font-medium">{kpi.label}</p>
            <p className={cn(
              'text-xl font-semibold tabular-nums',
              kpi.highlight === 'green' ? 'text-[var(--neutral-900)]' : kpi.highlight === 'yellow' ? 'text-[var(--neutral-900)]' : 'text-[var(--neutral-900)]'
            )}>
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h4 className="text-sm font-medium text-[var(--neutral-900)] mb-4">Description</h4>
          <p className="text-sm text-[var(--neutral-500)] leading-relaxed">{PRODUCT.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
            {[
              { l: 'SKU',         v: PRODUCT.sku },
              { l: 'Category',    v: PRODUCT.category },
              { l: 'Type',        v: PRODUCT.type },
              { l: 'Weight',      v: PRODUCT.weight },
              { l: 'Dimensions',  v: PRODUCT.dimensions },
              { l: 'MOQ',         v: `${PRODUCT.moq} unit` },
            ].map(f => (
              <div key={f.l}>
                <p className="text-xs text-[var(--neutral-500)] mb-0.5">{f.l}</p>
                <p className="text-sm text-[var(--neutral-900)] font-medium">{f.v}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <h4 className="text-sm font-medium text-[var(--neutral-900)] mb-4">Stock on hand</h4>
            <p className="text-3xl font-semibold tabular-nums text-[var(--neutral-900)]">8</p>
            <p className="text-xs text-[var(--neutral-500)]">units · Min reorder: 0</p>
          </Card>
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <h4 className="text-sm font-medium text-[var(--neutral-900)] mb-4">This month</h4>
            <p className="text-2xl font-semibold tabular-nums text-[var(--neutral-900)]">18 units</p>
            <p className="text-xs text-[var(--neutral-900)] mt-0.5">▲ 29% vs last month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ManufacturingTab() {
  const totalTime = ROUTING.reduce((s, r) => s + r.duration, 0);
  return (
    <div className="space-y-6">
      {/* Routing */}
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[var(--neutral-900)]">Routing — <span className="tabular-nums">{totalTime}h</span> total cycle time</h4>
          <Button variant="outline" size="sm" className="border-[var(--border)] h-8 text-xs">Edit routing</Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              {['Step', 'Operation', 'Work Centre', 'Cycle (hrs)', 'Setup (min)'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROUTING.map(r => (
              <tr key={r.step} className="border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)]">
                <td className="px-4 text-sm font-medium tabular-nums text-[var(--neutral-500)]">{String(r.step).padStart(2, '0')}</td>
                <td className="px-4 text-sm text-[var(--neutral-900)] font-medium">{r.name}</td>
                <td className="px-4"><Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs">{r.workCenter}</Badge></td>
                <td className="px-4 text-sm tabular-nums">{r.duration}</td>
                <td className="px-4 text-sm tabular-nums text-[var(--neutral-500)]">{r.setup > 0 ? r.setup : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* BOM */}
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[var(--neutral-900)]">Bill of Materials · v1.2</h4>
          <Button variant="outline" size="sm" className="border-[var(--border)] h-8 text-xs">Edit BOM</Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              {['SKU', 'Description', 'Qty', 'Unit', 'Unit cost', 'Line total'].map(h => (
                <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium', ['Qty', 'Unit cost', 'Line total'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOM_LINES.map(line => (
              <tr key={line.sku} className="border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)]">
                <td className="px-4 text-xs tabular-nums text-[var(--neutral-500)]">{line.sku}</td>
                <td className="px-4 text-sm text-[var(--neutral-900)]">{line.description}</td>
                <td className="px-4 text-right text-sm tabular-nums">{line.qty}</td>
                <td className="px-4 text-sm text-[var(--neutral-500)]">{line.unit}</td>
                <td className="px-4 text-right text-sm tabular-nums">${line.cost.toFixed(2)}</td>
                <td className="px-4 text-right text-sm font-medium tabular-nums">${(line.qty * line.cost).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-[var(--neutral-100)] border-t border-[var(--border)]">
              <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right text-[var(--neutral-900)]">Total BOM cost</td>
              <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-[var(--neutral-900)]">
                ${BOM_LINES.reduce((s, l) => s + l.qty * l.cost, 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function InventoryTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'On hand',   value: '8',  sub: 'units available' },
          { label: 'Reserved',  value: '5',  sub: 'units allocated to jobs' },
          { label: 'On order',  value: '0',  sub: 'units in production' },
          { label: 'Avg cost',  value: '$820.00', sub: 'per unit (FIFO)' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] mb-1 font-medium">{kpi.label}</p>
            <p className="text-xl font-semibold tabular-nums text-[var(--neutral-900)]">{kpi.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h4 className="text-sm font-medium text-[var(--neutral-900)]">Stock movements</h4>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              {['Date', 'Type', 'Reference', 'Qty', 'Balance'].map(h => (
                <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium', ['Qty', 'Balance'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVENTORY_MOVEMENTS.map((m, i) => (
              <tr key={i} className="border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)]">
                <td className="px-4 text-sm text-[var(--neutral-500)]">{m.date}</td>
                <td className="px-4">
                  <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5',
                    m.type === 'Production' ? 'bg-[var(--neutral-100)] text-[var(--neutral-900)]' :
                    m.type === 'Shipment'   ? 'bg-[var(--neutral-100)] text-[var(--neutral-900)]' :
                    'bg-[var(--neutral-100)] text-[var(--neutral-500)]'
                  )}>
                    {m.type}
                  </Badge>
                </td>
                <td className="px-4 text-sm tabular-nums text-[var(--neutral-500)]">{m.ref}</td>
                <td className={cn('px-4 text-right text-sm font-medium tabular-nums', m.qty > 0 ? 'text-[var(--neutral-900)]' : 'text-[var(--mw-error)]')}>
                  {m.qty > 0 ? `+${m.qty}` : m.qty}
                </td>
                <td className="px-4 text-right text-sm font-medium tabular-nums">{m.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AccountingTab() {
  const margin = ((PRODUCT.sellPrice - PRODUCT.costPrice) / PRODUCT.sellPrice) * 100;
  return (
    <div className="space-y-6">
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
        <h4 className="text-sm font-medium text-[var(--neutral-900)] mb-4">Revenue — last 6 months</h4>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--neutral-500)', fontVariantNumeric: 'tabular-nums' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: 'var(--neutral-500)', fontVariantNumeric: 'tabular-nums' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Area key="revenue" type="monotone" dataKey="revenue" stroke="var(--mw-yellow-400)" fill="var(--accent)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h4 className="text-sm font-medium text-[var(--neutral-900)] mb-4">Pricing</h4>
          <div className="space-y-3">
            {[
              { l: 'Sell price (ex GST)',  v: `$${PRODUCT.sellPrice.toFixed(2)}`, mono: true },
              { l: 'Cost price',           v: `$${PRODUCT.costPrice.toFixed(2)}`,  mono: true },
              { l: 'Gross profit',         v: `$${(PRODUCT.sellPrice - PRODUCT.costPrice).toFixed(2)}`, mono: true, green: true },
              { l: 'Gross margin',         v: `${margin.toFixed(1)}%`, mono: true, green: true },
            ].map(r => (
              <div key={r.l} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--neutral-500)]">{r.l}</span>
                <span className={cn('text-sm font-medium tabular-nums', r.green && 'text-[var(--neutral-900)]')}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h4 className="text-sm font-medium text-[var(--neutral-900)] mb-4">YTD performance</h4>
          <div className="space-y-3">
            {[
              { l: 'Units sold',    v: '89' },
              { l: 'Revenue',       v: '$113,920.00', mono: true },
              { l: 'COGS',          v: '$72,980.00',  mono: true },
              { l: 'Gross profit',  v: '$40,940.00',  mono: true, green: true },
            ].map(r => (
              <div key={r.l} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--neutral-500)]">{r.l}</span>
                <span className={cn('text-sm font-medium tabular-nums', (r as any).green && 'text-[var(--neutral-900)]')}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DocumentsTab() {
  const typeColor: Record<string, string> = {
    PDF: 'bg-[var(--neutral-100)] text-[var(--mw-error)]',
    DWG: 'bg-[var(--neutral-100)] text-[var(--neutral-900)]',
    STP: 'bg-[var(--neutral-100)] text-[var(--neutral-900)]',
    XLS: 'bg-[var(--neutral-100)] text-[var(--neutral-900)]',
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-900)] gap-2">
          <FileText className="w-4 h-4" /> Upload document
        </Button>
      </div>
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              {['Document', 'Type', 'Size', 'Updated', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((doc, i) => (
              <tr key={i} className="border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)]">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                    <span className="text-sm text-[var(--neutral-900)]">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4">
                  <Badge className={cn('border-0 text-[10px] rounded px-1.5 py-0.5 ', typeColor[doc.type] ?? 'bg-[var(--neutral-100)] text-[var(--neutral-500)]')}>
                    {doc.type}
                  </Badge>
                </td>
                <td className="px-4 text-sm text-[var(--neutral-500)] tabular-nums">{doc.size}</td>
                <td className="px-4 text-sm text-[var(--neutral-500)]">{doc.date}</td>
                <td className="px-4">
                  {doc.status === 'current'
                    ? <span className="flex items-center gap-1 text-xs text-[var(--neutral-900)]"><CheckCircle className="w-4 h-4" /> Current</span>
                    : <span className="flex items-center gap-1 text-xs text-[var(--neutral-900)]"><AlertTriangle className="w-4 h-4" /> Outdated</span>
                  }
                </td>
                <td className="px-4">
                  <button className="p-1.5 hover:bg-[var(--neutral-100)] rounded transition-colors">
                    <Download className="w-4 h-4 text-[var(--neutral-500)]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const TAB_COMPONENTS: Record<Tab, () => JSX.Element> = {
  Overview:      OverviewTab,
  Manufacturing: ManufacturingTab,
  Inventory:     InventoryTab,
  Accounting:    AccountingTab,
  Documents:     DocumentsTab,
};

// ── Root ─────────────────────────────────────────────────
export function SellProductDetail() {
  const navigate  = useNavigate();
  const [tab, setTab] = useState<Tab>('Overview');
  const TabContent = TAB_COMPONENTS[tab];

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      {/* Back + header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate(-1)} className="mt-1 p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl tracking-tight text-[var(--neutral-900)] font-medium">{PRODUCT.name}</h1>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-900)] border-0 text-xs rounded-full px-2">Active</Badge>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-900)] border-0 text-xs rounded-full px-2">{PRODUCT.type}</Badge>
            </div>
            <p className="text-sm text-[var(--neutral-500)]"><span className="tabular-nums">{PRODUCT.sku}</span> · {PRODUCT.category}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-[var(--border)] gap-2 h-10">
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button variant="ghost" className="h-10 px-2">
            <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'py-3 mr-8 text-sm border-b-2 transition-colors',
              tab === t
                ? 'border-[var(--mw-mirage)] text-[var(--neutral-900)] font-medium'
                : 'border-transparent text-[var(--neutral-500)] hover:text-[var(--neutral-900)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <TabContent />
    </div>
  );
}
