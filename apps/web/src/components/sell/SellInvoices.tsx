/**
 * Sell Invoices — invoice list with persistent due-date chip + aging-bucket facet.
 *
 * Replaces the duplicate "filter pills + popover" combo with one bar driven
 * by FilterSchema. Aging buckets (Current / 1–30 / 31–60 / 61–90 / 90+) are a
 * first-class facet so AR work — the daily task — has one-click scopes.
 */

import { useMemo } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  DollarSign,
  ExternalLink,
  FileWarning,
  List as ListIcon,
  MoreVertical,
  Plus,
  Table as TableIcon,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

import { sellInvoices, customers as centralCustomers } from '@/services';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { staggerItem } from '@/components/shared/motion/motion-variants';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

import { Button } from '../ui/button';
import { AnimatedDownload } from '../ui/animated-icons';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  balanceDue: number;
}

const mockInvoices: Invoice[] = sellInvoices.map((si) => ({
  id: si.id,
  invoiceNumber: si.invoiceNumber,
  customer: si.customerName,
  issueDate: si.date,
  dueDate: si.dueDate,
  status: si.status as InvoiceStatus,
  total: si.amount,
  balanceDue: si.amount - si.paidAmount,
}));

const MODULE_ID = 'sell.invoices';
const customerOptions = centralCustomers.map((c) => ({ value: c.company, label: c.company }));

const AGING_OPTIONS = [
  { value: 'current', label: 'Current (not due)' },
  { value: '0-30', label: '1–30 days overdue' },
  { value: '31-60', label: '31–60 days overdue' },
  { value: '61-90', label: '61–90 days overdue' },
  { value: '90+', label: '90+ days overdue' },
];

function agingBucket(invoice: Invoice): string {
  if (invoice.balanceDue <= 0) return 'current';
  const days = Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'current';
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

const invoicesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Invoices',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'draft', label: 'Draft', color: 'var(--neutral-300)' },
        { value: 'sent', label: 'Sent', color: 'var(--mw-mirage)' },
        { value: 'paid', label: 'Paid', color: 'var(--mw-yellow-400)' },
        { value: 'overdue', label: 'Overdue', color: 'var(--mw-error)' },
        { value: 'void', label: 'Void', color: 'var(--neutral-400)' },
      ],
    },
    {
      id: 'aging',
      label: 'Aging',
      kind: 'multi',
      pinned: true,
      icon: Clock,
      options: AGING_OPTIONS,
    },
    { id: 'customer', label: 'Customer', kind: 'select', icon: UserIcon, options: customerOptions },
    { id: 'balanceDue', label: 'Balance due', kind: 'range', icon: DollarSign },
    { id: 'dueDate', label: 'Due', kind: 'date', icon: CalendarDays, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'board', label: 'Aging buckets', icon: TableIcon, groupBy: 'aging' },
  ],
  defaultView: 'list',
  dateFacetId: 'dueDate',
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'Overdue 60+ days',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { aging: ['61-90', '90+'] }, search: '', view: 'list' },
  },
  {
    name: 'Due this week',
    icon: Zap,
    iconTone: 'warning',
    state: { values: { status: ['sent'], dueDate: thisWeekRange() }, search: '', view: 'list' },
  },
  {
    name: 'Drafts > 7 days',
    icon: FileWarning,
    iconTone: 'neutral',
    state: { values: { status: ['draft'] }, search: '', view: 'list' },
  },
]);

function thisWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - (day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

export function SellInvoices() {
  const navigate = useNavigate();
  const filters = useModuleFilters(invoicesFilterSchema);
  const { state } = filters;

  const filteredInvoices = useMemo(
    () =>
      applyFilters({
        schema: invoicesFilterSchema,
        state,
        rows: mockInvoices,
        getSearchText: (inv) => `${inv.invoiceNumber} ${inv.customer}`,
        getFacetValue: (inv, id) => {
          switch (id) {
            case 'status': return inv.status;
            case 'aging': return agingBucket(inv);
            case 'customer': return inv.customer;
            case 'balanceDue': return inv.balanceDue;
            case 'dueDate': return inv.dueDate;
            default: return undefined;
          }
        },
      }),
    [state],
  );

  const totalValue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const summaryByStatus = {
    paid: filteredInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    sent: filteredInvoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0),
    overdue: filteredInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    draft: filteredInvoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.total, 0),
  };

  const invoiceColumns: MwColumnDef<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      cell: (inv) => (
        <span className="text-foreground text-sm font-medium tabular-nums hover:underline flex items-center gap-1">
          {inv.invoiceNumber}
          <ExternalLink className="w-4 h-4" />
        </span>
      ),
    },
    { key: 'customer', header: 'Customer', cell: (inv) => inv.customer },
    {
      key: 'issueDate',
      header: 'Issue date',
      cell: (inv) => (
        <span className="text-[var(--neutral-600)]">
          {new Date(inv.issueDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due date',
      cell: (inv) => {
        const daysOverdue = inv.status === 'overdue'
          ? Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return (
          <span className="text-[var(--neutral-600)]">
            {new Date(inv.dueDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
            {inv.status === 'overdue' && (
              <span className="ml-2 text-xs text-[var(--mw-error)] tabular-nums">({daysOverdue}d overdue)</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (inv) => (
        <div className="flex items-center justify-center">
          <StatusBadge status={inv.status} withDot />
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headerClassName: 'text-right',
      className: 'text-right font-medium tabular-nums',
      cell: (inv) => `$${inv.total.toLocaleString()}`,
    },
    {
      key: 'balanceDue',
      header: 'Balance due',
      headerClassName: 'text-right',
      className: 'text-right font-medium tabular-nums',
      cell: (inv) => (
        <span style={{ color: inv.balanceDue > 0 ? 'var(--mw-error)' : 'var(--mw-success)' }}>
          ${inv.balanceDue.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-12',
      className: 'w-12',
      cell: (inv) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
                <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/sell/invoices/${inv.id}`)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/sell/invoices/${inv.id}?edit=1`)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success('Invoice duplicated')}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast('Invoice deleted')} className="text-[var(--mw-error)]">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${filteredInvoices.length} of ${mockInvoices.length} invoices • $${totalValue.toLocaleString()} total • $${totalOutstanding.toLocaleString()} outstanding`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'paid', label: 'Paid', value: summaryByStatus.paid, color: 'var(--mw-yellow-400)' },
          { key: 'sent', label: 'Sent', value: summaryByStatus.sent, color: 'var(--mw-mirage)' },
          { key: 'overdue', label: 'Overdue', value: summaryByStatus.overdue, color: 'var(--neutral-300)' },
          { key: 'draft', label: 'Draft', value: summaryByStatus.draft, color: 'var(--neutral-200)' },
        ]}
      />

      <ModuleFilterBar
        schema={invoicesFilterSchema}
        filters={filters}
        searchPlaceholder="Search invoices…"
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-full border-[var(--neutral-200)] px-4"
              onClick={() => toast.success('Invoices exported')}
            >
              <AnimatedDownload className="w-4 h-4" />
              Export
            </Button>
            <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/invoices/new')}>
              New Invoice
            </ToolbarPrimaryButton>
          </>
        }
      />

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable<Invoice>
            columns={invoiceColumns}
            data={filteredInvoices}
            keyExtractor={(inv) => inv.id}
            onRowClick={(inv) => navigate(`/sell/invoices/${inv.id}`)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            striped
          />
        </motion.div>
      )}

      {state.view === 'board' && (
        <motion.div variants={staggerItem} className="overflow-x-auto">
          <div className="flex min-w-min gap-4 pb-2">
            {AGING_OPTIONS.map((bucket) => {
              const inBucket = filteredInvoices.filter((inv) => agingBucket(inv) === bucket.value);
              const sum = inBucket.reduce((s, i) => s + i.balanceDue, 0);
              return (
                <div
                  key={bucket.value}
                  className="w-72 shrink-0 rounded-lg border border-[var(--border)] bg-card p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{bucket.label}</h4>
                    <span className="rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-xs tabular-nums">
                      {inBucket.length}
                    </span>
                  </div>
                  <div className="mb-3 text-xs text-[var(--neutral-500)] tabular-nums">
                    ${sum.toLocaleString()} outstanding
                  </div>
                  <div className="space-y-2">
                    {inBucket.length === 0 ? (
                      <div className="text-xs text-[var(--neutral-400)]">None</div>
                    ) : inBucket.map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => navigate(`/sell/invoices/${inv.id}`)}
                        className="block w-full rounded-md border border-[var(--border)] bg-background p-2 text-left text-xs transition-colors hover:bg-[var(--neutral-50)]"
                      >
                        <div className="font-medium tabular-nums text-foreground">{inv.invoiceNumber}</div>
                        <div className="text-[var(--neutral-500)]">{inv.customer}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="tabular-nums text-foreground">${inv.balanceDue.toLocaleString()}</span>
                          <span className="text-[var(--neutral-400)]">{inv.dueDate}</span>
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
    </PageShell>
  );
}
