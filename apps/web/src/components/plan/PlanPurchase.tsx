/**
 * Plan Purchase — Project-Aware Purchase Planning
 * Material requirements by job, suggested POs grouped by supplier,
 * stock-level indicators, and bulk actions.
 */
import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Plus,
  FileText,
  ExternalLink,
  Package,
  Truck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { toast } from 'sonner';

// ── Mock Data ───────────────────────────────────────────────────────

interface MaterialRequirement {
  id: string;
  material: string;
  sku: string;
  requiredQty: number;
  availableStock: number;
  onOrder: number;
  shortfall: number;
  requiredBy: string;
  job: string;
  jobTitle: string;
  supplier: string;
  unitCost: number;
  status: 'in_stock' | 'low' | 'out_of_stock';
}

const MATERIAL_REQUIREMENTS: MaterialRequirement[] = [
  { id: '1', material: 'Mild Steel Sheet 3mm', sku: 'MAT-MS-001', requiredQty: 50, availableStock: 15, onOrder: 20, shortfall: 15, requiredBy: '2026-04-10', job: 'JOB-2026-0012', jobTitle: 'Mounting Bracket Assembly', supplier: 'Hunter Steel Co', unitCost: 85, status: 'low' },
  { id: '2', material: 'Aluminium Angle 50x50x5', sku: 'MAT-AL-042', requiredQty: 20, availableStock: 0, onOrder: 0, shortfall: 20, requiredBy: '2026-04-10', job: 'JOB-2026-0012', jobTitle: 'Mounting Bracket Assembly', supplier: 'Pacific Metals', unitCost: 42, status: 'out_of_stock' },
  { id: '3', material: 'Welding Rod ER70S-6 4mm', sku: 'CONS-WR-001', requiredQty: 100, availableStock: 150, onOrder: 0, shortfall: 0, requiredBy: '2026-04-12', job: 'JOB-2026-0011', jobTitle: 'Custom Brackets x50', supplier: 'Sydney Welding Supply', unitCost: 12, status: 'in_stock' },
  { id: '4', material: 'RHS 50x25x2.5 Steel', sku: 'MAT-RHS-001', requiredQty: 80, availableStock: 0, onOrder: 40, shortfall: 40, requiredBy: '2026-04-12', job: 'JOB-2026-0011', jobTitle: 'Custom Brackets x50', supplier: 'Hunter Steel Co', unitCost: 65, status: 'out_of_stock' },
  { id: '5', material: 'Hardware Kit M10 SS', sku: 'CONS-HW-001', requiredQty: 12, availableStock: 15, onOrder: 0, shortfall: 0, requiredBy: '2026-04-18', job: 'JOB-2026-0013', jobTitle: 'Cable Tray Supports', supplier: 'Generic Parts Co', unitCost: 18, status: 'in_stock' },
  { id: '6', material: 'Powder Coat Paint RAL 7035', sku: 'CONS-PC-001', requiredQty: 6, availableStock: 8, onOrder: 0, shortfall: 0, requiredBy: '2026-04-18', job: 'JOB-2026-0013', jobTitle: 'Cable Tray Supports', supplier: 'Sydney Welding Supply', unitCost: 95, status: 'in_stock' },
  { id: '7', material: '10mm Mild Steel Plate', sku: 'MS-10-3678', requiredQty: 20, availableStock: 45, onOrder: 0, shortfall: 0, requiredBy: '2026-04-20', job: 'JOB-2026-0015', jobTitle: 'Control Panel Enclosure', supplier: 'Hunter Steel Co', unitCost: 120, status: 'in_stock' },
  { id: '8', material: 'Aluminium Base Plate 5052', sku: 'AL-5052-BP', requiredQty: 40, availableStock: 8, onOrder: 0, shortfall: 32, requiredBy: '2026-04-20', job: 'JOB-2026-0015', jobTitle: 'Control Panel Enclosure', supplier: 'Pacific Metals', unitCost: 78, status: 'low' },
  { id: '9', material: 'SS Fasteners M10 Grade A4', sku: 'FST-M10A4', requiredQty: 30, availableStock: 0, onOrder: 0, shortfall: 30, requiredBy: '2026-04-10', job: 'JOB-2026-0012', jobTitle: 'Mounting Bracket Assembly', supplier: 'Generic Parts Co', unitCost: 4.50, status: 'out_of_stock' },
  { id: '10', material: 'Stainless 316 Tube 25mm', sku: 'MAT-SS316-T25', requiredQty: 60, availableStock: 12, onOrder: 20, shortfall: 28, requiredBy: '2026-04-28', job: 'JOB-2026-0013', jobTitle: 'Cable Tray Supports', supplier: 'Pacific Metals', unitCost: 55, status: 'low' },
  { id: '11', material: 'Cold Rolled Steel 1.6mm', sku: 'MAT-CRS-16', requiredQty: 24, availableStock: 0, onOrder: 0, shortfall: 24, requiredBy: '2026-04-20', job: 'JOB-2026-0015', jobTitle: 'Control Panel Enclosure', supplier: 'Hunter Steel Co', unitCost: 92, status: 'out_of_stock' },
];

interface SuggestedPO {
  id: string;
  supplier: string;
  items: { material: string; qty: number; unitCost: number; total: number; job: string }[];
  totalValue: number;
  leadTimeDays: number;
}

const SUGGESTED_POS: SuggestedPO[] = [
  {
    id: 'spo-001', supplier: 'Hunter Steel Co',
    items: [
      { material: 'Mild Steel Sheet 3mm', qty: 15, unitCost: 85, total: 1275, job: 'JOB-2026-0012' },
      { material: 'RHS 50x25x2.5 Steel', qty: 40, unitCost: 65, total: 2600, job: 'JOB-2026-0011' },
      { material: 'Cold Rolled Steel 1.6mm', qty: 24, unitCost: 92, total: 2208, job: 'JOB-2026-0015' },
    ],
    totalValue: 6083, leadTimeDays: 5,
  },
  {
    id: 'spo-002', supplier: 'Pacific Metals',
    items: [
      { material: 'Aluminium Angle 50x50x5', qty: 20, unitCost: 42, total: 840, job: 'JOB-2026-0012' },
      { material: 'Aluminium Base Plate 5052', qty: 32, unitCost: 78, total: 2496, job: 'JOB-2026-0015' },
      { material: 'Stainless 316 Tube 25mm', qty: 28, unitCost: 55, total: 1540, job: 'JOB-2026-0013' },
    ],
    totalValue: 4876, leadTimeDays: 7,
  },
  {
    id: 'spo-003', supplier: 'Generic Parts Co',
    items: [
      { material: 'SS Fasteners M10 Grade A4', qty: 30, unitCost: 4.50, total: 135, job: 'JOB-2026-0012' },
    ],
    totalValue: 135, leadTimeDays: 3,
  },
];

// ── Job filter options ──────────────────────────────────────────────

const JOB_OPTIONS = [
  { key: 'all', label: 'All Jobs' },
  { key: 'JOB-2026-0012', label: 'JOB-2026-0012' },
  { key: 'JOB-2026-0011', label: 'JOB-2026-0011' },
  { key: 'JOB-2026-0013', label: 'JOB-2026-0013' },
  { key: 'JOB-2026-0015', label: 'JOB-2026-0015' },
];

type StatusFilter = 'all' | 'out_of_stock' | 'low' | 'in_stock';

// ── Columns ─────────────────────────────────────────────────────────

const columns: MwColumnDef<MaterialRequirement>[] = [
  {
    key: 'material',
    header: 'Material',
    tooltip: 'Material name',
    cell: (row) => (
      <div>
        <span className="font-medium text-foreground">{row.material}</span>
        <span className="block text-xs tabular-nums text-[var(--neutral-500)]">{row.sku}</span>
      </div>
    ),
  },
  {
    key: 'job',
    header: 'Job',
    tooltip: 'Associated job',
    cell: (row) => (
      <div>
        <span className="tabular-nums font-medium text-foreground text-xs">{row.job}</span>
        <span className="block text-xs text-[var(--neutral-500)] truncate max-w-[140px]">{row.jobTitle}</span>
      </div>
    ),
  },
  {
    key: 'requiredQty',
    header: 'Required',
    tooltip: 'Total quantity required',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums font-medium',
    cell: (row) => row.requiredQty,
  },
  {
    key: 'availableStock',
    header: 'Available',
    tooltip: 'Current stock on hand',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums',
    cell: (row) => row.availableStock,
  },
  {
    key: 'shortfall',
    header: 'Shortfall',
    tooltip: 'Remaining shortfall after stock and orders',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums font-medium',
    cell: (row) => (
      <span style={{ color: row.shortfall > 0 ? 'var(--mw-error)' : 'var(--mw-success)' }}>
        {row.shortfall > 0 ? row.shortfall : '\u2014'}
      </span>
    ),
  },
  {
    key: 'requiredBy',
    header: 'Required By',
    tooltip: 'Date material is needed',
    className: 'tabular-nums text-[var(--neutral-500)] text-xs',
    cell: (row) => {
      const d = new Date(row.requiredBy);
      return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    },
  },
  {
    key: 'supplier',
    header: 'Supplier',
    tooltip: 'Preferred supplier',
    className: 'text-foreground text-xs',
    cell: (row) => row.supplier,
  },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Stock availability status',
    cell: (row) => {
      if (row.status === 'in_stock') return <StatusBadge variant="neutral" withDot>In Stock</StatusBadge>;
      if (row.status === 'low') return <StatusBadge variant="warning" withDot>Low</StatusBadge>;
      return <StatusBadge variant="error" withDot>Out of Stock</StatusBadge>;
    },
  },
];

// ── Component ───────────────────────────────────────────────────────

export function PlanPurchase() {
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    return MATERIAL_REQUIREMENTS.filter((r) => {
      const matchJob = jobFilter === 'all' || r.job === jobFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch =
        !search ||
        r.material.toLowerCase().includes(search.toLowerCase()) ||
        r.sku.toLowerCase().includes(search.toLowerCase()) ||
        r.job.toLowerCase().includes(search.toLowerCase());
      return matchJob && matchStatus && matchSearch;
    });
  }, [search, jobFilter, statusFilter]);

  const countOutOfStock = MATERIAL_REQUIREMENTS.filter((r) => r.status === 'out_of_stock').length;
  const countLow = MATERIAL_REQUIREMENTS.filter((r) => r.status === 'low').length;
  const countInStock = MATERIAL_REQUIREMENTS.filter((r) => r.status === 'in_stock').length;
  const totalShortfallValue = MATERIAL_REQUIREMENTS.filter((r) => r.shortfall > 0).reduce((s, r) => s + r.shortfall * r.unitCost, 0);

  const statusCounts = {
    all: MATERIAL_REQUIREMENTS.length,
    out_of_stock: countOutOfStock,
    low: countLow,
    in_stock: countInStock,
  };

  return (
    <PageShell>
      <PageHeader
        title="Purchase Planning"
        subtitle={`${countOutOfStock + countLow} shortfalls across ${new Set(MATERIAL_REQUIREMENTS.map((r) => r.job)).size} jobs \u00B7 $${totalShortfallValue.toLocaleString()} estimated value`}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-[var(--border)] gap-2 h-12"
              onClick={() => toast.success('Recalculating MRP...')}
            >
              <RefreshCw className="w-4 h-4" /> Recalculate MRP
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border)] gap-2 h-12"
              onClick={() => toast.success('Exporting purchase plan...')}
            >
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        }
      />

      {/* Summary bar */}
      <ToolbarSummaryBar
        segments={[
          { key: 'out_of_stock', label: 'Out of Stock', value: countOutOfStock, color: 'var(--mw-error)' },
          { key: 'low', label: 'Low', value: countLow, color: 'var(--mw-warning)' },
          { key: 'in_stock', label: 'In Stock', value: countInStock, color: 'var(--neutral-400)' },
        ]}
        formatValue={(v) => String(v)}
      />

      {/* KPI summary cards */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Out of Stock', count: countOutOfStock, icon: AlertTriangle, bg: 'bg-[var(--mw-error-100)] dark:bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]' },
          { label: 'Low Stock', count: countLow, icon: Package, bg: 'bg-[var(--mw-amber-100)] dark:bg-[var(--mw-warning)]/10', text: 'text-[var(--mw-yellow-800)] dark:text-[var(--mw-warning)]' },
          { label: 'In Stock', count: countInStock, icon: CheckCircle, bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-foreground' },
          { label: 'Shortfall Value', count: totalShortfallValue, icon: ShoppingCart, bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-foreground', isCurrency: true },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={staggerItem}>
              <Card className="p-6">
                <div className={cn('w-8 h-8 rounded-[var(--shape-md)] flex items-center justify-center mb-4', s.bg)}>
                  <Icon className={cn('w-4 h-4', s.text)} />
                </div>
                <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
                <p className={cn('text-2xl tabular-nums font-medium', s.text)}>
                  {(s as { isCurrency?: boolean }).isCurrency ? `$${s.count.toLocaleString()}` : s.count}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filters & search */}
      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search materials..." />
        <ToolbarFilterPills
          value={statusFilter}
          onChange={(k) => setStatusFilter(k as StatusFilter)}
          options={[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'out_of_stock', label: 'Out of Stock', count: statusCounts.out_of_stock },
            { key: 'low', label: 'Low', count: statusCounts.low },
            { key: 'in_stock', label: 'In Stock', count: statusCounts.in_stock },
          ]}
        />
        <ToolbarSpacer />
        {/* Job filter */}
        <div className="flex items-center gap-1 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-lg)] p-1">
          {JOB_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setJobFilter(opt.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums',
                jobFilter === opt.key
                  ? 'bg-card dark:bg-[var(--neutral-700)] text-foreground shadow-sm'
                  : 'text-[var(--neutral-500)] hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <ToolbarFilterButton />
      </PageToolbar>

      {/* Material requirements table */}
      <MwDataTable<MaterialRequirement>
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items...`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items...`)}
      />

      {/* Suggested Purchase Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">Suggested Purchase Orders</h2>
            <p className="text-sm text-[var(--neutral-500)]">
              Grouped by supplier based on current shortfalls
            </p>
          </div>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2 h-12"
            onClick={() => toast.success('Creating all suggested POs...')}
          >
            <Plus className="w-4 h-4" /> Create All POs
          </Button>
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {SUGGESTED_POS.map((po) => (
            <motion.div key={po.id} variants={staggerItem}>
              <Card className="overflow-hidden">
                <div className="p-5 border-b border-[var(--border)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{po.supplier}</h3>
                      <p className="text-xs text-[var(--neutral-500)]">
                        {po.items.length} {po.items.length === 1 ? 'item' : 'items'} \u00B7 {po.leadTimeDays} day lead time
                      </p>
                    </div>
                    <span className="text-lg font-medium tabular-nums text-foreground">
                      ${po.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
                    <span className="text-xs text-[var(--neutral-500)]">Est. delivery: {po.leadTimeDays} business days</span>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {po.items.map((item, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm text-foreground">{item.material}</span>
                        <span className="block text-xs tabular-nums text-[var(--neutral-500)]">{item.job} \u00B7 Qty {item.qty}</span>
                      </div>
                      <span className="text-sm tabular-nums font-medium text-foreground">${item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 flex gap-2 border-t border-[var(--border)]">
                  <Button
                    className="flex-1 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2"
                    onClick={() => toast.success(`Creating PO for ${po.supplier}...`)}
                  >
                    <Plus className="w-4 h-4" /> Create PO
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[var(--border)] gap-2"
                    onClick={() => toast('Opening RFQ form...')}
                  >
                    <FileText className="w-4 h-4" /> Request Quote
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[var(--border)] gap-2"
                    onClick={() => toast('Navigating to supplier...')}
                  >
                    <ExternalLink className="w-4 h-4" /> View Supplier
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageShell>
  );
}
