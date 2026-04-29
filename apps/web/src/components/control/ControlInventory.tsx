/**
 * Control Inventory — stock master data with search, filter, status,
 * stocktake wizard, inventory adjustments, stock transfers, and enhanced dashboard.
 */
import React, { useState, useMemo } from 'react';
import {
  Plus, Download, ClipboardCheck, ArrowLeftRight, AlertTriangle,
  TrendingDown, CheckCircle2,
  ChevronRight, ChevronLeft, DollarSign, Percent,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  MW_AXIS_TICK, MW_CARTESIAN_GRID, MW_BAR_TOOLTIP_CURSOR, MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE, MW_CHART_COLOURS, MW_BAR_RADIUS_V,
} from '@/components/shared/charts/chart-theme';
import { cn } from '@/components/ui/utils';

// ---------------------------------------------------------------------------
// Inventory Data
// ---------------------------------------------------------------------------

const INVENTORY = [
  { id: '1',  sku: 'AL-5052-BP',  name: 'Aluminium Base Plate 5052',    category: 'Raw Materials',  unit: 'each',   onHand: 120, minStock: 50,  costPrice: 28.50,  location: 'A-01-03', status: 'ok' },
  { id: '2',  sku: 'AL-5052-SA',  name: 'Aluminium Support Arm 5052',   category: 'Raw Materials',  unit: 'each',   onHand: 85,  minStock: 40,  costPrice: 34.20,  location: 'A-02-01', status: 'ok' },
  { id: '3',  sku: 'RHS-50252',   name: 'RHS 50x25x2.5 Steel Section',  category: 'Raw Materials',  unit: 'length', onHand: 200, minStock: 100, costPrice: 12.80,  location: 'B-02-05', status: 'ok' },
  { id: '4',  sku: 'MS-10-3678',  name: '10mm Mild Steel Plate',        category: 'Raw Materials',  unit: 'sheet',  onHand: 45,  minStock: 20,  costPrice: 185.00, location: 'A-03-02', status: 'ok' },
  { id: '5',  sku: 'HW-KIT-001',  name: 'Hardware Kit M10 SS',          category: 'Consumables',    unit: 'kit',    onHand: 15,  minStock: 30,  costPrice: 8.40,   location: 'C-04-02', status: 'low' },
  { id: '6',  sku: 'WW-ER70S6',   name: 'Welding Wire ER70S-6 15kg',    category: 'Consumables',    unit: 'spool',  onHand: 50,  minStock: 10,  costPrice: 92.00,  location: 'C-01-01', status: 'ok' },
  { id: '7',  sku: 'FST-M10A4',   name: 'SS Fasteners M10 Grade A4',    category: 'Consumables',    unit: 'box',    onHand: 0,   minStock: 20,  costPrice: 24.50,  location: 'D-01-01', status: 'out' },
  { id: '8',  sku: 'PNT-RAL7035', name: 'Powder Coat Paint RAL 7035',   category: 'Consumables',    unit: 'kg',     onHand: 8,   minStock: 15,  costPrice: 11.00,  location: 'Paint-01',status: 'low' },
  { id: '9',  sku: 'PROD-SR-001', name: 'Server Rack Chassis',          category: 'Finished Goods', unit: 'each',   onHand: 3,   minStock: 0,   costPrice: 820.00, location: 'FG-01-01',status: 'ok' },
  { id: '10', sku: 'PROD-BP-002', name: 'Bracket Type A (standard)',    category: 'Finished Goods', unit: 'each',   onHand: 12,  minStock: 5,   costPrice: 145.00, location: 'FG-01-02',status: 'ok' },
];

// ---------------------------------------------------------------------------
// Adjustment mock data
// ---------------------------------------------------------------------------

type AdjustmentType = 'Damage' | 'Theft' | 'Found' | 'Correction' | 'Scrap';

interface AdjustmentRecord {
  id: string;
  date: string;
  type: AdjustmentType;
  item: string;
  sku: string;
  location: string;
  qty: number;
  reason: string;
  notes: string;
  createdBy: string;
}

const MOCK_ADJUSTMENTS: AdjustmentRecord[] = [
  { id: 'ADJ-001', date: '2026-04-03', type: 'Damage', item: 'Hardware Kit M10 SS', sku: 'HW-KIT-001', location: 'C-04-02', qty: -5, reason: 'Water damage from roof leak', notes: 'Insurance claim filed', createdBy: 'Matt Quigley' },
  { id: 'ADJ-002', date: '2026-04-01', type: 'Correction', item: 'RHS 50x25x2.5 Steel Section', sku: 'RHS-50252', location: 'B-02-05', qty: 12, reason: 'Count discrepancy from stocktake', notes: '', createdBy: 'Sarah Park' },
  { id: 'ADJ-003', date: '2026-03-28', type: 'Scrap', item: 'Aluminium Base Plate 5052', sku: 'AL-5052-BP', location: 'A-01-03', qty: -3, reason: 'Failed QC inspection', notes: 'Scratched during handling', createdBy: 'James Wilson' },
  { id: 'ADJ-004', date: '2026-03-25', type: 'Found', item: 'SS Fasteners M10 Grade A4', sku: 'FST-M10A4', location: 'D-01-01', qty: 8, reason: 'Found in unmarked bin', notes: '', createdBy: 'Tom Richards' },
];

// ---------------------------------------------------------------------------
// Transfer mock data
// ---------------------------------------------------------------------------

type TransferStatus = 'Draft' | 'In Transit' | 'Received';

interface TransferRecord {
  id: string;
  date: string;
  from: string;
  to: string;
  items: { name: string; sku: string; qty: number }[];
  status: TransferStatus;
  createdBy: string;
}

const MOCK_TRANSFERS: TransferRecord[] = [
  { id: 'TRF-001', date: '2026-04-04', from: 'A-01-03', to: 'FG-01-01', items: [{ name: 'Aluminium Base Plate 5052', sku: 'AL-5052-BP', qty: 20 }], status: 'In Transit', createdBy: 'Matt Quigley' },
  { id: 'TRF-002', date: '2026-04-02', from: 'C-01-01', to: 'Bay C - Welding', items: [{ name: 'Welding Wire ER70S-6 15kg', sku: 'WW-ER70S6', qty: 5 }], status: 'Received', createdBy: 'Ravi Patel' },
  { id: 'TRF-003', date: '2026-04-01', from: 'Paint-01', to: 'Bay E - Finishing', items: [{ name: 'Powder Coat Paint RAL 7035', sku: 'PNT-RAL7035', qty: 3 }], status: 'Draft', createdBy: 'Sarah Park' },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = ['All', 'Raw Materials', 'Consumables', 'Finished Goods'];
const ADJUSTMENT_TYPES: AdjustmentType[] = ['Damage', 'Theft', 'Found', 'Correction', 'Scrap'];
const LOCATIONS = [...new Set(INVENTORY.map(i => i.location))];

type InventoryItem = (typeof INVENTORY)[number];

const STATUS_BADGE_MAP: Record<string, 'active' | 'pending' | 'cancelled'> = {
  ok: 'active',
  low: 'pending',
  out: 'cancelled',
};
const STATUS_LABEL_MAP: Record<string, string> = { ok: 'OK', low: 'Low', out: 'Out' };

const TRANSFER_STATUS_MAP: Record<TransferStatus, 'info' | 'warning' | 'success'> = {
  'Draft': 'info',
  'In Transit': 'warning',
  'Received': 'success',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Dashboard KPI Card
// ---------------------------------------------------------------------------

function DashboardKpi({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-card border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] rounded-[var(--shape-lg)] p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[var(--shape-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[var(--neutral-500)]">{label}</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
          {subtext && <p className="text-xs text-[var(--neutral-500)]">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stock Value by Location chart data
// ---------------------------------------------------------------------------

function getStockValueByLocation() {
  const map = new Map<string, number>();
  INVENTORY.forEach(item => {
    const val = item.onHand * item.costPrice;
    map.set(item.location, (map.get(item.location) || 0) + val);
  });
  return Array.from(map.entries())
    .map(([loc, val]) => ({ location: loc, value: Math.round(val) }))
    .sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// Inventory Table Columns
// ---------------------------------------------------------------------------

const inventoryColumns: MwColumnDef<InventoryItem>[] = [
  {
    key: 'sku', header: 'SKU', tooltip: 'Stock-keeping unit code',
    cell: (item) => item.sku,
    className: 'text-xs font-medium text-[var(--neutral-500)]',
  },
  {
    key: 'name', header: 'Name', tooltip: 'Item description',
    cell: (item) => item.name,
    className: 'font-medium text-foreground',
  },
  {
    key: 'category', header: 'Category', tooltip: 'Inventory category',
    cell: (item) => <StatusBadge variant="neutral">{item.category}</StatusBadge>,
  },
  {
    key: 'onHand', header: 'On Hand', tooltip: 'Current stock quantity',
    headerClassName: 'text-right', className: 'text-right font-medium tabular-nums',
    cell: (item) => (
      <span style={{ color: item.status === 'out' ? 'var(--mw-error)' : item.status === 'low' ? 'var(--mw-amber)' : 'var(--mw-mirage)' }}>
        {item.onHand} {item.unit}
      </span>
    ),
  },
  {
    key: 'minStock', header: 'Min Stock', tooltip: 'Minimum stock threshold',
    headerClassName: 'text-right', className: 'text-right text-[var(--neutral-500)] tabular-nums',
    cell: (item) => item.minStock,
  },
  {
    key: 'cost', header: 'Cost', tooltip: 'Unit cost price',
    headerClassName: 'text-right', className: 'text-right tabular-nums',
    cell: (item) => formatCurrency(item.costPrice),
  },
  {
    key: 'value', header: 'Stock Value', tooltip: 'Total value on hand',
    headerClassName: 'text-right', className: 'text-right tabular-nums font-medium',
    cell: (item) => formatCurrency(item.onHand * item.costPrice),
  },
  {
    key: 'location', header: 'Location', tooltip: 'Warehouse location code',
    className: 'text-xs font-medium text-[var(--neutral-500)]',
    cell: (item) => item.location,
  },
  {
    key: 'status', header: 'Status', tooltip: 'Stock level status', headerClassName: 'text-center',
    cell: (item) => (
      <div className="flex justify-center">
        <StatusBadge status={STATUS_BADGE_MAP[item.status] as any} withDot>
          {STATUS_LABEL_MAP[item.status]}
        </StatusBadge>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Adjustment Table Columns
// ---------------------------------------------------------------------------

const adjustmentColumns: MwColumnDef<AdjustmentRecord>[] = [
  { key: 'id', header: 'ID', tooltip: 'Adjustment reference', cell: (r) => <span className="text-xs font-medium text-[var(--neutral-500)]">{r.id}</span> },
  { key: 'date', header: 'Date', tooltip: 'Adjustment date', cell: (r) => <span className="text-sm text-[var(--neutral-500)]">{formatDate(r.date)}</span> },
  { key: 'type', header: 'Type', tooltip: 'Adjustment reason type', cell: (r) => <StatusBadge variant={r.type === 'Found' || r.type === 'Correction' ? 'info' : 'warning'}>{r.type}</StatusBadge> },
  { key: 'item', header: 'Item', tooltip: 'Adjusted item', cell: (r) => <span className="text-sm font-medium text-foreground">{r.item}</span> },
  { key: 'qty', header: 'Qty', tooltip: 'Quantity adjusted', headerClassName: 'text-right', className: 'text-right tabular-nums font-medium', cell: (r) => <span style={{ color: r.qty > 0 ? 'var(--mw-success)' : 'var(--mw-error)' }}>{r.qty > 0 ? `+${r.qty}` : r.qty}</span> },
  { key: 'reason', header: 'Reason', tooltip: 'Adjustment reason', cell: (r) => <span className="text-sm text-[var(--neutral-500)]">{r.reason}</span> },
  { key: 'createdBy', header: 'By', tooltip: 'Created by', cell: (r) => <span className="text-xs text-[var(--neutral-500)]">{r.createdBy}</span> },
];

// ---------------------------------------------------------------------------
// Transfer Table Columns
// ---------------------------------------------------------------------------

const transferColumns: MwColumnDef<TransferRecord>[] = [
  { key: 'id', header: 'ID', tooltip: 'Transfer reference', cell: (r) => <span className="text-xs font-medium text-[var(--neutral-500)]">{r.id}</span> },
  { key: 'date', header: 'Date', tooltip: 'Transfer date', cell: (r) => <span className="text-sm text-[var(--neutral-500)]">{formatDate(r.date)}</span> },
  { key: 'from', header: 'From', tooltip: 'Source location', cell: (r) => <span className="text-sm text-foreground">{r.from}</span> },
  { key: 'to', header: 'To', tooltip: 'Destination location', cell: (r) => <span className="text-sm text-foreground">{r.to}</span> },
  { key: 'items', header: 'Items', tooltip: 'Transferred items', cell: (r) => <span className="text-sm text-foreground">{r.items.map(i => `${i.name} (${i.qty})`).join(', ')}</span> },
  { key: 'status', header: 'Status', tooltip: 'Transfer status', headerClassName: 'text-center', cell: (r) => <div className="flex justify-center"><StatusBadge variant={TRANSFER_STATUS_MAP[r.status]}>{r.status}</StatusBadge></div> },
  { key: 'createdBy', header: 'By', tooltip: 'Created by', cell: (r) => <span className="text-xs text-[var(--neutral-500)]">{r.createdBy}</span> },
];

// ---------------------------------------------------------------------------
// Stocktake Wizard
// ---------------------------------------------------------------------------

type StocktakeStep = 'location' | 'count' | 'review' | 'approve';

interface StocktakeCount {
  id: string;
  name: string;
  sku: string;
  expected: number;
  counted: number | null;
  unit: string;
}

export function StocktakeWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<StocktakeStep>('location');
  const [selectedLocation, setSelectedLocation] = useState('A-01-03');
  const [counts, setCounts] = useState<StocktakeCount[]>([]);

  const steps: { key: StocktakeStep; label: string }[] = [
    { key: 'location', label: 'Select Location' },
    { key: 'count', label: 'Count' },
    { key: 'review', label: 'Review' },
    { key: 'approve', label: 'Approve' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const initCounts = (loc: string) => {
    const items = INVENTORY.filter(i => i.location === loc);
    setCounts(items.map(i => ({
      id: i.id, name: i.name, sku: i.sku, expected: i.onHand, counted: null, unit: i.unit,
    })));
  };

  const handleNext = () => {
    if (step === 'location') {
      initCounts(selectedLocation);
      setStep('count');
    } else if (step === 'count') {
      setStep('review');
    } else if (step === 'review') {
      setStep('approve');
    } else {
      toast.success('Stocktake approved and saved');
      onOpenChange(false);
      setStep('location');
    }
  };

  const handleBack = () => {
    if (step === 'count') setStep('location');
    else if (step === 'review') setStep('count');
    else if (step === 'approve') setStep('review');
  };

  const updateCount = (id: string, value: number) => {
    setCounts(prev => prev.map(c => c.id === id ? { ...c, counted: value } : c));
  };

  const discrepancies = counts.filter(c => c.counted !== null && c.counted !== c.expected);
  const totalVarianceValue = discrepancies.reduce((sum, d) => {
    const item = INVENTORY.find(i => i.id === d.id);
    return sum + ((d.counted ?? 0) - d.expected) * (item?.costPrice ?? 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Stocktake</DialogTitle>
          <DialogDescription>Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 transition-colors',
                i <= currentStepIndex ? 'bg-[var(--mw-yellow-400)] text-primary-foreground' : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-500)]',
              )}>
                {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 rounded-full transition-colors',
                  i < currentStepIndex ? 'bg-[var(--mw-yellow-400)]' : 'bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]',
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {step === 'location' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Location</Label>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={cn(
                      'px-3 py-2 rounded-[var(--shape-md)] border text-sm text-left transition-colors',
                      selectedLocation === loc
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10 text-foreground'
                        : 'border-[var(--neutral-200)] dark:border-[var(--neutral-700)] text-[var(--neutral-600)] hover:border-[var(--neutral-400)]',
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'count' && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--neutral-500)]">Location: <span className="font-medium text-foreground">{selectedLocation}</span></p>
              {counts.length === 0 ? (
                <p className="text-sm text-[var(--neutral-500)] py-6 text-center">No items found at this location.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {counts.map(c => (
                    <div key={c.id} className="flex items-center gap-3 bg-[var(--neutral-50)] dark:bg-[var(--neutral-800)]/50 rounded-[var(--shape-md)] p-3 border border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-xs text-[var(--neutral-500)]">{c.sku} · Expected: {c.expected} {c.unit}</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        className="w-24 h-10 text-right tabular-nums"
                        placeholder="Count"
                        value={c.counted ?? ''}
                        onChange={(e) => updateCount(c.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--neutral-500)]">
                {discrepancies.length === 0 ? 'No discrepancies found.' : `${discrepancies.length} discrepancies found.`}
              </p>
              {discrepancies.length > 0 && (
                <>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {discrepancies.map(d => {
                      const variance = (d.counted ?? 0) - d.expected;
                      const item = INVENTORY.find(i => i.id === d.id);
                      const valueImpact = variance * (item?.costPrice ?? 0);
                      return (
                        <div key={d.id} className="flex items-center justify-between bg-[var(--neutral-50)] dark:bg-[var(--neutral-800)]/50 rounded-[var(--shape-md)] p-3 border border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
                          <div>
                            <p className="text-sm font-medium text-foreground">{d.name}</p>
                            <p className="text-xs text-[var(--neutral-500)]">Expected: {d.expected} / Counted: {d.counted}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn('text-sm font-medium tabular-nums', variance > 0 ? 'text-[var(--mw-success)]' : 'text-[var(--mw-error)]')}>
                              {variance > 0 ? '+' : ''}{variance}
                            </p>
                            <p className="text-xs text-[var(--neutral-500)] tabular-nums">{formatCurrency(valueImpact)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
                    <span className="text-sm text-[var(--neutral-500)]">Total value impact</span>
                    <span className={cn('text-sm font-bold tabular-nums', totalVarianceValue >= 0 ? 'text-[var(--mw-success)]' : 'text-[var(--mw-error)]')}>
                      {totalVarianceValue >= 0 ? '+' : ''}{formatCurrency(totalVarianceValue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'approve' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--mw-success-light)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[var(--mw-success)]" />
              </div>
              <p className="text-sm font-medium text-foreground">Ready to approve</p>
              <p className="text-sm text-[var(--neutral-500)]">
                {counts.length} items counted at {selectedLocation}.
                {discrepancies.length > 0 && ` ${discrepancies.length} discrepancies (${formatCurrency(totalVarianceValue)} impact).`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStepIndex > 0 && (
            <Button variant="outline" className="gap-1 rounded-full" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <div className="flex-1" />
          <Button
            className="gap-1 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleNext}
          >
            {step === 'approve' ? 'Approve & Save' : 'Next'}
            {step !== 'approve' && <ChevronRight className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// New Adjustment Dialog
// ---------------------------------------------------------------------------

export function NewAdjustmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [adjType, setAdjType] = useState<AdjustmentType>('Damage');
  const [adjItem, setAdjItem] = useState('');
  const [adjLocation, setAdjLocation] = useState('');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjNotes, setAdjNotes] = useState('');

  const handleSubmit = () => {
    toast.success('Adjustment recorded');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Inventory Adjustment</DialogTitle>
          <DialogDescription>Record a stock adjustment with reason and documentation.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Type</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {ADJUSTMENT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAdjType(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    adjType === t
                      ? 'bg-[var(--mw-mirage)] text-white'
                      : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="adj-item" className="text-sm font-medium">Item</Label>
            <Input id="adj-item" className="mt-1.5 h-10" placeholder="Select item..." value={adjItem} onChange={e => setAdjItem(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="adj-location" className="text-sm font-medium">Location</Label>
              <Input id="adj-location" className="mt-1.5 h-10" placeholder="e.g. A-01-03" value={adjLocation} onChange={e => setAdjLocation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="adj-qty" className="text-sm font-medium">Quantity</Label>
              <Input id="adj-qty" type="number" className="mt-1.5 h-10" placeholder="±qty" value={adjQty} onChange={e => setAdjQty(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="adj-reason" className="text-sm font-medium">Reason</Label>
            <Input id="adj-reason" className="mt-1.5 h-10" placeholder="Why is this adjustment needed?" value={adjReason} onChange={e => setAdjReason(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="adj-notes" className="text-sm font-medium">Notes (optional)</Label>
            <Textarea id="adj-notes" className="mt-1.5" rows={2} placeholder="Additional details..." value={adjNotes} onChange={e => setAdjNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground" onClick={handleSubmit}>
            Record Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// New Transfer Dialog
// ---------------------------------------------------------------------------

export function NewTransferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [transferItem, setTransferItem] = useState('');
  const [transferQty, setTransferQty] = useState('');

  const handleSubmit = () => {
    toast.success('Transfer created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Stock Transfer</DialogTitle>
          <DialogDescription>Move stock between locations.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="trf-from" className="text-sm font-medium">From Location</Label>
              <Input id="trf-from" className="mt-1.5 h-10" placeholder="e.g. A-01-03" value={fromLoc} onChange={e => setFromLoc(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="trf-to" className="text-sm font-medium">To Location</Label>
              <Input id="trf-to" className="mt-1.5 h-10" placeholder="e.g. FG-01-01" value={toLoc} onChange={e => setToLoc(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="trf-item" className="text-sm font-medium">Item</Label>
            <Input id="trf-item" className="mt-1.5 h-10" placeholder="Select item..." value={transferItem} onChange={e => setTransferItem(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="trf-qty" className="text-sm font-medium">Quantity</Label>
            <Input id="trf-qty" type="number" min={1} className="mt-1.5 h-10" placeholder="Qty to transfer" value={transferQty} onChange={e => setTransferQty(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground" onClick={handleSubmit}>
            Create Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ControlInventory() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('stock');
  const [stocktakeOpen, setStocktakeOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const filtered = INVENTORY.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || item.category === category;
    return matchSearch && matchCategory;
  });

  const totals = useMemo(() => ({
    items: INVENTORY.length,
    low: INVENTORY.filter(i => i.status === 'low').length,
    out: INVENTORY.filter(i => i.status === 'out').length,
    totalValue: INVENTORY.reduce((sum, i) => sum + i.onHand * i.costPrice, 0),
    belowReorder: INVENTORY.filter(i => i.onHand < i.minStock && i.minStock > 0).length,
  }), []);

  const stockValueData = useMemo(() => getStockValueByLocation(), []);

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Inventory"
        subtitle={`${totals.items} SKUs${totals.low > 0 ? ` · ${totals.low} low stock` : ''}${totals.out > 0 ? ` · ${totals.out} out of stock` : ''}`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        {/* ---- Stock Tab ---- */}
        <TabsContent value="stock" className="space-y-6">
          <PageToolbar>
            <ToolbarSearch value={search} onChange={setSearch} placeholder="Search by name or SKU..." />
            <ToolbarFilterPills
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map(c => ({ key: c, label: c }))}
            />
            <ToolbarSpacer />
            <Button variant="outline" className="h-12 gap-2 border-[var(--neutral-200)] px-5 rounded-full" onClick={() => setStocktakeOpen(true)}>
              <ClipboardCheck className="w-4 h-4" /> Start Stocktake
            </Button>
            <Button variant="outline" className="h-12 gap-2 border-[var(--neutral-200)] px-5 rounded-full" onClick={() => toast.success('Exporting inventory...')}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <ToolbarPrimaryButton
              icon={Plus}
              onClick={() => {
                // TODO(backend): inventory.create(fields)
                toast.success('Inventory item added');
              }}
            >
              New item
            </ToolbarPrimaryButton>
          </PageToolbar>

          <ToolbarSummaryBar
            segments={[
              { key: 'ok', label: 'In Stock', value: INVENTORY.filter(i => i.status === 'ok').length, color: 'var(--mw-yellow-400)' },
              { key: 'low', label: 'Low Stock', value: totals.low, color: 'var(--mw-mirage)' },
              { key: 'out', label: 'Out of Stock', value: totals.out, color: 'var(--neutral-400)' },
            ]}
            formatValue={(v) => String(v)}
          />

          <MwDataTable
            columns={inventoryColumns}
            data={filtered}
            keyExtractor={(item) => item.id}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items...`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items...`)}
            emptyState={<EmptyState variant="inline" title="No items match your search." />}
          />
        </TabsContent>

        {/* ---- Dashboard Tab ---- */}
        <TabsContent value="dashboard" className="space-y-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <DashboardKpi
              icon={DollarSign}
              label="Total Stock Value"
              value={formatCurrency(totals.totalValue)}
              subtext={`${totals.items} SKUs`}
              color="var(--mw-yellow-400)"
            />
            <DashboardKpi
              icon={Percent}
              label="Inventory Accuracy"
              value="96.2%"
              subtext="Last stocktake: 28 Mar"
              color="var(--mw-success)"
            />
            <DashboardKpi
              icon={AlertTriangle}
              label="Below Reorder"
              value={String(totals.belowReorder)}
              subtext="Items need replenishment"
              color="var(--mw-error)"
            />
            <DashboardKpi
              icon={TrendingDown}
              label="Dead Stock"
              value="2"
              subtext="No movement > 90 days"
              color="var(--neutral-500)"
            />
          </motion.div>

          {/* Turnover Rate cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="dark:border-[var(--neutral-700)] p-4">
              <p className="text-xs text-[var(--neutral-500)]">Avg Turnover Rate</p>
              <p className="text-2xl font-bold text-foreground tabular-nums mt-1">4.2x</p>
              <p className="text-xs text-[var(--mw-success)] mt-0.5">+0.3 from last month</p>
            </Card>
            <Card className="dark:border-[var(--neutral-700)] p-4">
              <p className="text-xs text-[var(--neutral-500)]">Raw Materials Value</p>
              <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
                {formatCurrency(INVENTORY.filter(i => i.category === 'Raw Materials').reduce((s, i) => s + i.onHand * i.costPrice, 0))}
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{INVENTORY.filter(i => i.category === 'Raw Materials').length} items</p>
            </Card>
            <Card className="dark:border-[var(--neutral-700)] p-4">
              <p className="text-xs text-[var(--neutral-500)]">Finished Goods Value</p>
              <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
                {formatCurrency(INVENTORY.filter(i => i.category === 'Finished Goods').reduce((s, i) => s + i.onHand * i.costPrice, 0))}
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{INVENTORY.filter(i => i.category === 'Finished Goods').length} items</p>
            </Card>
          </div>

          {/* Stock Value by Location Chart */}
          <Card className="dark:border-[var(--neutral-700)] p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Stock Value by Location</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockValueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="location" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={MW_AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    cursor={MW_BAR_TOOLTIP_CURSOR}
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                  />
                  <Bar
                    dataKey="value"
                    radius={MW_BAR_RADIUS_V}
                    {...MW_RECHARTS_ANIMATION_BAR}
                  >
                    {stockValueData.map((_, i) => (
                      <Cell key={i} fill={MW_CHART_COLOURS[i % MW_CHART_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Dead Stock Alerts */}
          <Card className="dark:border-[var(--neutral-700)] p-5">
            <h3 className="text-sm font-medium text-foreground mb-3">Dead Stock Alerts</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-[var(--mw-error-light)] dark:bg-[var(--mw-error)]/10 rounded-[var(--shape-md)] p-3">
                <AlertTriangle className="w-4 h-4 text-[var(--mw-error)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">SS Fasteners M10 Grade A4</p>
                  <p className="text-xs text-[var(--neutral-500)]">Out of stock for 30+ days · D-01-01</p>
                </div>
                <StatusBadge variant="error">Out</StatusBadge>
              </div>
              <div className="flex items-center gap-3 bg-[var(--mw-warning-light)] dark:bg-[var(--mw-warning)]/10 rounded-[var(--shape-md)] p-3">
                <AlertTriangle className="w-4 h-4 text-[var(--mw-yellow-600)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Powder Coat Paint RAL 7035</p>
                  <p className="text-xs text-[var(--neutral-500)]">Low movement last 60 days · Paint-01</p>
                </div>
                <StatusBadge variant="warning">Low</StatusBadge>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ---- Adjustments Tab ---- */}
        <TabsContent value="adjustments" className="space-y-6">
          <PageToolbar>
            <ToolbarSearch value="" onChange={() => {}} placeholder="Search adjustments..." />
            <ToolbarSpacer />
            <ToolbarPrimaryButton icon={Plus} onClick={() => setAdjustmentOpen(true)}>
              New Adjustment
            </ToolbarPrimaryButton>
          </PageToolbar>

          <MwDataTable
            columns={adjustmentColumns}
            data={MOCK_ADJUSTMENTS}
            keyExtractor={(r) => r.id}
            emptyState={<EmptyState variant="inline" title="No adjustments recorded." />}
          />
        </TabsContent>

        {/* ---- Transfers Tab ---- */}
        <TabsContent value="transfers" className="space-y-6">
          <PageToolbar>
            <ToolbarSearch value="" onChange={() => {}} placeholder="Search transfers..." />
            <ToolbarSpacer />
            <ToolbarPrimaryButton icon={ArrowLeftRight} onClick={() => setTransferOpen(true)}>
              New Transfer
            </ToolbarPrimaryButton>
          </PageToolbar>

          <MwDataTable
            columns={transferColumns}
            data={MOCK_TRANSFERS}
            keyExtractor={(r) => r.id}
            emptyState={<EmptyState variant="inline" title="No transfers recorded." />}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StocktakeWizard open={stocktakeOpen} onOpenChange={setStocktakeOpen} />
      <NewAdjustmentDialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen} />
      <NewTransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
    </PageShell>
  );
}
