/**
 * Buy Bills — Supplier bills with three-way matching, aging buckets and kanban-by-match.
 *
 * Schema-driven filter bar replaces the hand-rolled search input. Aging bucket
 * facet mirrors `SellInvoices.tsx` so AP work has one-click scopes.
 */
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Columns3,
  DollarSign,
  FileWarning,
  List as ListIcon,
  MessageSquareWarning,
  Plus,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { suppliers as centralSuppliers } from '@/services';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

type BillStatus = 'matched' | 'pending' | 'mismatch' | 'overdue';

interface Bill {
  id: string;
  billNumber: string;
  supplier: string;
  invoiceDate: string; // ISO yyyy-mm-dd
  dueDate: string;     // ISO yyyy-mm-dd
  poNumber: string;
  grnNumber: string;
  amount: number;
  status: BillStatus;
  matchStatus: { po: boolean; receipt: boolean; bill: boolean; amountOk: boolean };
  notes?: string;
}

const BILLS: Bill[] = [
  { id: '1', billNumber: 'BILL-2026-093', supplier: 'Hunter Steel Co',      invoiceDate: '2026-03-18', dueDate: '2026-04-17', poNumber: 'PO-0089', grnNumber: 'GRN-0112', amount: 12400.00, status: 'matched',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true } },
  { id: '2', billNumber: 'BILL-2026-092', supplier: 'Pacific Metals',       invoiceDate: '2026-03-15', dueDate: '2026-04-14', poNumber: 'PO-0088', grnNumber: 'GRN-0110', amount: 8500.00,  status: 'pending',  matchStatus: { po: true, receipt: false, bill: true, amountOk: true }, notes: 'GRN not confirmed yet' },
  { id: '3', billNumber: 'BILL-2026-091', supplier: 'Sydney Welding Supply',invoiceDate: '2026-03-12', dueDate: '2026-04-11', poNumber: 'PO-0087', grnNumber: 'GRN-0109', amount: 3420.00,  status: 'mismatch', matchStatus: { po: true, receipt: true, bill: true, amountOk: false }, notes: 'Invoice $220 higher than PO' },
  { id: '4', billNumber: 'BILL-2026-090', supplier: 'Dulux Coatings',       invoiceDate: '2026-03-10', dueDate: '2026-03-25', poNumber: 'PO-0086', grnNumber: 'GRN-0108', amount: 2200.00,  status: 'overdue',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true }, notes: 'Payment overdue by 5 days' },
  { id: '5', billNumber: 'BILL-2026-089', supplier: 'BHP Suppliers',        invoiceDate: '2026-03-08', dueDate: '2026-04-07', poNumber: 'PO-0085', grnNumber: 'GRN-0107', amount: 28000.00, status: 'matched',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true } },
  { id: '6', billNumber: 'BILL-2026-088', supplier: 'Fasteners Plus',       invoiceDate: '2026-03-05', dueDate: '2026-04-04', poNumber: 'PO-0084', grnNumber: 'GRN-0106', amount: 450.00,   status: 'matched',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true } },
];

const STATUS_CONFIG: Record<BillStatus, { text: string; label: string; icon: typeof CheckCircle2 }> = {
  matched:  { text: 'text-foreground',         label: 'Matched',  icon: CheckCircle2 },
  pending:  { text: 'text-[var(--mw-amber)]',  label: 'Pending',  icon: AlertTriangle },
  mismatch: { text: 'text-[var(--mw-error)]',  label: 'Mismatch', icon: AlertTriangle },
  overdue:  { text: 'text-[var(--mw-error)]',  label: 'Overdue',  icon: AlertTriangle },
};

const AGING_OPTIONS = [
  { value: 'current', label: 'Current',     color: 'var(--neutral-300)' },
  { value: '1-30',    label: '1–30 days',   color: 'var(--mw-mirage)' },
  { value: '31-60',   label: '31–60 days',  color: 'var(--mw-warning)' },
  { value: '61-90',   label: '61–90 days',  color: 'var(--mw-amber)' },
  { value: '90+',     label: '90+ days',    color: 'var(--mw-error)' },
];

function agingBucket(bill: Bill): string {
  const days = Math.floor((Date.now() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'current';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

function MatchDots({ ms }: { ms: Bill['matchStatus'] }) {
  const dots = [
    { label: 'PO',  ok: ms.po },
    { label: 'GRN', ok: ms.receipt },
    { label: 'Inv', ok: ms.bill },
    { label: '$',   ok: ms.amountOk },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {dots.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-0.5" title={d.label}>
          <div className={cn('w-2 h-2 rounded-full', d.ok ? 'bg-[var(--mw-mirage)]' : 'bg-[var(--mw-error)]')} />
          <span className="text-[8px] text-[var(--neutral-400)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

const MODULE_ID = 'buy.bills';

const supplierOptions = centralSuppliers.map((s) => ({ value: s.company, label: s.company }));

const billsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Bills',
  facets: [
    {
      id: 'matchStatus',
      label: 'Match status',
      kind: 'multi',
      pinned: true,
      icon: CheckCircle2,
      options: [
        { value: 'matched',   label: 'Matched',         color: 'var(--mw-mirage)' },
        { value: 'pending',   label: 'Pending GRN',     color: 'var(--mw-warning)' },
        { value: 'mismatch',  label: 'Amount mismatch', color: 'var(--mw-error)' },
        { value: 'overdue',   label: 'Overdue',         color: 'var(--mw-error)' },
      ],
    },
    { id: 'aging',     label: 'Aging',    kind: 'multi', pinned: true, icon: Clock, options: AGING_OPTIONS },
    { id: 'supplier',  label: 'Supplier', kind: 'multi', icon: Building2, options: supplierOptions },
    { id: 'hasDispute', label: 'Disputed', kind: 'boolean', icon: MessageSquareWarning },
    { id: 'amount',    label: 'Amount',   kind: 'range', icon: DollarSign },
    {
      id: 'dueDate',
      label: 'Due',
      kind: 'date',
      icon: Calendar,
      placeholder: 'Any date',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'lastMonth'],
    },
    // TODO(filters): needs Bill.currency — plan §6 currency facet.
    // TODO(filters): needs Bill.approverId — plan §6 approver facet.
  ],
  viewModes: [
    { id: 'list',   label: 'List',            icon: ListIcon },
    { id: 'board',  label: 'Aging buckets',   icon: TableIcon, groupBy: 'aging' },
    { id: 'kanban', label: 'Kanban by match', icon: Columns3,  groupBy: 'matchStatus' },
  ],
  defaultView: 'list',
  dateFacetId: 'dueDate',
};

function thisWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - (day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

registerSystemPresets(MODULE_ID, [
  {
    name: 'Overdue 60+ days',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { aging: ['61-90', '90+'] }, search: '', view: 'board' },
  },
  {
    name: 'Three-way match exceptions',
    icon: AlertCircle,
    iconTone: 'warning',
    state: { values: { matchStatus: ['mismatch', 'pending'] }, search: '', view: 'kanban' },
  },
  {
    name: 'Due this week',
    icon: Calendar,
    iconTone: 'yellow',
    state: { values: { matchStatus: ['matched'], dueDate: thisWeekRange() }, search: '', view: 'list' },
  },
  {
    name: 'Disputed',
    icon: MessageSquareWarning,
    iconTone: 'error',
    state: { values: { hasDispute: true }, search: '', view: 'list' },
  },
  {
    name: 'Drafts > 7 days',
    icon: FileWarning,
    iconTone: 'neutral',
    state: { values: { matchStatus: ['pending'] }, search: '', view: 'list' },
  },
]);

const KANBAN_STATUSES: BillStatus[] = ['matched', 'pending', 'mismatch', 'overdue'];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BuyBills() {
  const filters = useModuleFilters(billsFilterSchema);
  const { state } = filters;

  const [selected, setSelected] = useState<Bill | null>(null);
  const [showNewBill, setShowNewBill] = useState(false);
  const [draftBillNumber, setDraftBillNumber] = useState('');
  const [draftSupplier, setDraftSupplier] = useState('');
  const [draftAmount, setDraftAmount] = useState(0);
  const [draftInvoiceDate, setDraftInvoiceDate] = useState('');
  const [draftDueDate, setDraftDueDate] = useState('');

  const handleCreateBill = () => {
    toast.success(`Bill ${draftBillNumber || 'NEW'} created`);
    setShowNewBill(false);
    setDraftBillNumber('');
    setDraftSupplier('');
    setDraftAmount(0);
    setDraftInvoiceDate('');
    setDraftDueDate('');
  };

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: billsFilterSchema,
        state,
        rows: BILLS,
        getSearchText: (b) => `${b.billNumber} ${b.supplier} ${b.poNumber}`,
        getFacetValue: (b, id) => {
          switch (id) {
            case 'matchStatus': return b.status;
            case 'aging': return agingBucket(b);
            case 'supplier': return b.supplier;
            case 'hasDispute': return b.status === 'mismatch' || Boolean(b.notes && /dispute|query/i.test(b.notes));
            case 'amount': return b.amount;
            case 'dueDate': return b.dueDate;
            default: return undefined;
          }
        },
      }),
    [state],
  );

  const totals = {
    matched: BILLS.filter(b => b.status === 'matched').reduce((s, b) => s + b.amount, 0),
    pending: BILLS.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0),
    issues:  BILLS.filter(b => ['mismatch', 'overdue'].includes(b.status)).length,
  };

  const columns: MwColumnDef<Bill>[] = [
    { key: 'billNumber', header: 'Bill #', tooltip: 'Bill reference number', cell: (bill) => <span className="font-medium text-foreground">{bill.billNumber}</span> },
    { key: 'supplier', header: 'Supplier', tooltip: 'Supplier company name', cell: (bill) => <span className="font-medium text-foreground">{bill.supplier}</span> },
    { key: 'invoiceDate', header: 'Invoice date', tooltip: 'Date invoice was received', cell: (bill) => (
      <span className="tabular-nums text-[var(--neutral-500)]">
        {new Date(bill.invoiceDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
      </span>
    )},
    { key: 'dueDate', header: 'Due', tooltip: 'Payment due date', cell: (bill) => (
      <span className={cn('tabular-nums', bill.status === 'overdue' ? 'text-[var(--mw-error)] font-medium' : 'text-[var(--neutral-500)] font-normal')}>
        {new Date(bill.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
      </span>
    )},
    { key: 'poNumber', header: 'PO #', tooltip: 'Linked purchase order', cell: (bill) => <span className="font-medium tabular-nums text-foreground">{bill.poNumber}</span> },
    { key: 'matchStatus', header: '3-way match', tooltip: 'PO, GRN and invoice match status', cell: (bill) => <MatchDots ms={bill.matchStatus} /> },
    { key: 'amount', header: 'Amount', tooltip: 'Invoice total amount', headerClassName: 'text-right', className: 'text-right', cell: (bill) => (
      <span className="font-medium tabular-nums">${bill.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
    )},
    { key: 'status', header: 'Status', tooltip: 'Current bill status', cell: (bill) => {
      const cfg = STATUS_CONFIG[bill.status];
      const Icon = cfg.icon;
      return (
        <div className="flex items-center gap-1.5">
          <Icon className={cn('w-4 h-4', cfg.text)} />
          <StatusBadge variant={bill.status === 'matched' ? 'neutral' : bill.status === 'pending' ? 'warning' : 'error'}>
            {cfg.label}
          </StatusBadge>
        </div>
      );
    }},
  ];

  return (
    <PageShell>
      <PageHeader
        title="Bills"
        subtitle={`$${totals.matched.toLocaleString()} matched${totals.issues > 0 ? ` · ${totals.issues} require attention` : ''}`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Matched',         value: BILLS.filter(b => b.status === 'matched').length,  sub: `$${totals.matched.toLocaleString()}`, bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Pending GRN',     value: BILLS.filter(b => b.status === 'pending').length,  sub: `$${totals.pending.toLocaleString()}`, bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
          { label: 'Amount mismatch', value: BILLS.filter(b => b.status === 'mismatch').length, sub: 'Needs review',                        bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
          { label: 'Overdue',         value: BILLS.filter(b => b.status === 'overdue').length,  sub: 'Past due date',                       bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
        ].map(s => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-lg p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <ModuleFilterBar
        schema={billsFilterSchema}
        filters={filters}
        searchPlaceholder="Search bills…"
        actions={
          <ToolbarPrimaryButton icon={Plus} onClick={() => setShowNewBill(true)}>
            New bill
          </ToolbarPrimaryButton>
        }
      />

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable
            columns={columns}
            data={filtered}
            keyExtractor={(bill) => bill.id}
            onRowClick={(bill) => setSelected(bill)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </motion.div>
      )}

      {state.view === 'board' && (
        <motion.div variants={staggerItem} className="overflow-x-auto">
          <div className="flex min-w-min gap-4 pb-2">
            {AGING_OPTIONS.map((bucket) => {
              const inBucket = filtered.filter((b) => agingBucket(b) === bucket.value);
              const sum = inBucket.reduce((s, b) => s + b.amount, 0);
              return (
                <div key={bucket.value} className="w-72 shrink-0 rounded-lg border border-[var(--border)] bg-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{bucket.label}</h4>
                    <span className="rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-xs tabular-nums">{inBucket.length}</span>
                  </div>
                  <div className="mb-3 text-xs text-[var(--neutral-500)] tabular-nums">${sum.toLocaleString()} outstanding</div>
                  <div className="space-y-2">
                    {inBucket.length === 0 ? (
                      <div className="text-xs text-[var(--neutral-400)]">None</div>
                    ) : inBucket.map((bill) => (
                      <button
                        key={bill.id}
                        type="button"
                        onClick={() => setSelected(bill)}
                        className="block w-full rounded-md border border-[var(--border)] bg-background p-2 text-left text-xs transition-colors hover:bg-[var(--neutral-50)]"
                      >
                        <div className="font-medium tabular-nums text-foreground">{bill.billNumber}</div>
                        <div className="text-[var(--neutral-500)]">{bill.supplier}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="tabular-nums text-foreground">${bill.amount.toLocaleString()}</span>
                          <span className="text-[var(--neutral-400)]">
                            {new Date(bill.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {state.view === 'kanban' && (
        <motion.div variants={staggerItem} className="overflow-x-auto">
          <div className="flex min-w-min gap-4 pb-2">
            {KANBAN_STATUSES.map((s) => {
              const colBills = filtered.filter((b) => b.status === s);
              const sum = colBills.reduce((sum, b) => sum + b.amount, 0);
              return (
                <div key={s} className="w-72 shrink-0 rounded-lg border border-[var(--border)] bg-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{STATUS_CONFIG[s].label}</h4>
                    <span className="rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-xs tabular-nums">{colBills.length}</span>
                  </div>
                  <div className="mb-3 text-xs text-[var(--neutral-500)] tabular-nums">${sum.toLocaleString()}</div>
                  <div className="space-y-2">
                    {colBills.length === 0 ? (
                      <div className="text-xs text-[var(--neutral-400)]">None</div>
                    ) : colBills.map((bill) => (
                      <button
                        key={bill.id}
                        type="button"
                        onClick={() => setSelected(bill)}
                        className="block w-full rounded-md border border-[var(--border)] bg-background p-2 text-left text-xs transition-colors hover:bg-[var(--neutral-50)]"
                      >
                        <div className="font-medium tabular-nums text-foreground">{bill.billNumber}</div>
                        <div className="text-[var(--neutral-500)]">{bill.supplier}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="tabular-nums text-foreground">${bill.amount.toLocaleString()}</span>
                          <span className="text-[var(--neutral-400)]">
                            {new Date(bill.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Detail Sheet */}
      {selected && (
        <Sheet open onOpenChange={() => setSelected(null)}>
          <SheetContent className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto border-l border-[var(--border)]">
            <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
              <SheetTitle className="text-lg font-medium  text-foreground">{selected.billNumber}</SheetTitle>
              <SheetDescription className="text-[var(--neutral-500)]">{selected.supplier}</SheetDescription>
            </SheetHeader>
            <div className="p-6 space-y-6">
              {selected.notes && (
                <div className={cn('rounded-lg p-4 flex items-start gap-3', selected.status === 'mismatch' ? 'bg-[var(--mw-error-100)]' : 'bg-[var(--mw-amber-100)]')}>
                  <AlertTriangle className={cn('w-4 h-4 shrink-0 mt-0.5', selected.status === 'mismatch' ? 'text-[var(--mw-error)]' : 'text-[var(--mw-amber)]')} />
                  <p className="text-sm font-medium" style={{ color: selected.status === 'mismatch' ? 'var(--mw-error)' : 'var(--mw-amber)' }}>{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-[var(--neutral-500)] uppercase tracking-wider font-medium mb-3">Three-way match</p>
                <div className="space-y-3">
                  {[
                    { label: 'Purchase Order',    ref: selected.poNumber,  ok: selected.matchStatus.po },
                    { label: 'Goods Receipt',     ref: selected.grnNumber, ok: selected.matchStatus.receipt },
                    { label: 'Supplier Invoice',  ref: selected.billNumber,ok: selected.matchStatus.bill },
                    { label: 'Amount matches',    ref: `$${selected.amount.toLocaleString()}`, ok: selected.matchStatus.amountOk },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-[var(--neutral-100)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', row.ok ? 'bg-[var(--neutral-100)]' : 'bg-[var(--mw-error-100)]')}>
                          {row.ok
                            ? <CheckCircle2 className="w-4 h-4 text-foreground" />
                            : <X className="w-4 h-4 text-[var(--mw-error)]" />
                          }
                        </div>
                        <span className="text-sm text-foreground font-medium">{row.label}</span>
                      </div>
                      <span className="text-sm  text-[var(--neutral-500)]">{row.ref}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: 'Invoice date', v: new Date(selected.invoiceDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) },
                  { l: 'Due date',     v: new Date(selected.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) },
                  { l: 'PO number',    v: selected.poNumber },
                  { l: 'GRN',          v: selected.grnNumber },
                ].map(f => (
                  <div key={f.l}>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">{f.l}</p>
                    <p className="text-sm font-medium ">{f.v}</p>
                  </div>
                ))}
              </div>

              {selected.status === 'matched' && (
                <Button
                  className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-11"
                  onClick={() => toast.success('Bill approved for payment')}
                >
                  Approve for payment
                </Button>
              )}
              {selected.status === 'mismatch' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[var(--mw-mirage)] hover:bg-[var(--neutral-800)] text-white h-11 text-sm"
                    onClick={() => toast.success('Bill rejected')}
                  >
                    Reject
                  </Button>
                  <Button variant="outline" className="flex-1 border-[var(--border)] h-11 text-sm" onClick={() => toast.success(`Query sent to ${selected.supplier}`)}>
                    Query supplier
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      <Sheet open={showNewBill} onOpenChange={setShowNewBill}>
        <SheetContent className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto border-l border-[var(--border)]">
          <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
            <SheetTitle className="text-base font-medium text-foreground">New Bill</SheetTitle>
            <SheetDescription className="text-[var(--neutral-500)] text-xs">
              Manually enter a supplier bill. Three-way matching will resolve once linked to a PO and GRN.
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Bill number <span className="text-[var(--mw-error)]">*</span></label>
              <Input value={draftBillNumber} onChange={(e) => setDraftBillNumber(e.target.value)} placeholder="BILL-XXXX" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Supplier <span className="text-[var(--mw-error)]">*</span></label>
              <Input value={draftSupplier} onChange={(e) => setDraftSupplier(e.target.value)} placeholder="Supplier name" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <Input type="number" min={0} step="0.01" value={draftAmount} onChange={(e) => setDraftAmount(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-foreground">Invoice date</label>
                <Input type="date" value={draftInvoiceDate} onChange={(e) => setDraftInvoiceDate(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-foreground">Due date</label>
                <Input type="date" value={draftDueDate} onChange={(e) => setDraftDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewBill(false)}>Cancel</Button>
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={handleCreateBill}
              disabled={!draftBillNumber.trim() || !draftSupplier.trim()}
            >
              Create bill
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
