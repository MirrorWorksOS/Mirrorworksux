/**
 * Book Invoices — AR list with persistent due-date chip + aging-bucket facet.
 *
 * Direct port of the SellInvoices pattern (commit d4f0c565). Aging buckets
 * (Current / 1–30 / 31–60 / 61–90 / 90+) are a first-class facet so AR work —
 * the daily collections task — has one-click scopes. Adds the Book quick-range
 * default (lastMonth / thisMonth / thisQuarter / ytd / lastYear).
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  FileWarning,
  List as ListIcon,
  MoreVertical,
  Plus,
  Table as TableIcon,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { sellInvoices, salesOrders, jobs, customers as centralCustomers } from '@/services';
import { useDraftInvoiceStore } from '@/store/draftInvoiceStore';

import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { AnimatedDownload, AnimatedSend } from '../ui/animated-icons';

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partiallyPaid' | 'paid' | 'overdue' | 'cancelled';

interface Invoice {
  id: string;
  customer: string;
  customerLogo?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  balanceDue: number;
  jobReference?: string;
}

const BASE_INVOICES: Invoice[] = [
  ...sellInvoices.map((inv) => {
    const so = inv.salesOrderId ? salesOrders.find((s) => s.id === inv.salesOrderId) : undefined;
    const job = so?.jobId ? jobs.find((j) => j.id === so.jobId) : undefined;
    return {
      id: inv.invoiceNumber,
      customer: inv.customerName,
      issueDate: inv.date,
      dueDate: inv.dueDate,
      status: inv.status as InvoiceStatus,
      total: inv.amount,
      balanceDue: inv.amount - inv.paidAmount,
      jobReference: job?.jobNumber,
    };
  }),
  // Extra entries for status variety (viewed, partiallyPaid)
  {
    id: 'INV-2026-0237',
    customer: 'Climate Systems',
    issueDate: '2026-03-15',
    dueDate: '2026-04-15',
    status: 'viewed' as InvoiceStatus,
    total: 45200,
    balanceDue: 45200,
    jobReference: 'JOB-2026-0014',
  },
  {
    id: 'INV-2026-0238',
    customer: 'Construction Pro',
    issueDate: '2026-03-18',
    dueDate: '2026-04-18',
    status: 'partiallyPaid' as InvoiceStatus,
    total: 89500,
    balanceDue: 44750,
    jobReference: 'JOB-2026-0015',
  },
];

const STATUS_LABEL_MAP: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partiallyPaid: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

const MODULE_ID = 'book.invoices';

const customerOptions = centralCustomers.map((c) => ({ value: c.company, label: c.company }));

const AR_AGING_OPTIONS = [
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

const bookInvoicesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Invoices (AR)',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'draft', label: 'Draft', color: 'var(--neutral-300)' },
        { value: 'sent', label: 'Sent', color: 'var(--mw-mirage)' },
        { value: 'viewed', label: 'Viewed', color: 'var(--mw-info)' },
        { value: 'partiallyPaid', label: 'Partially Paid', color: 'var(--mw-info)' },
        { value: 'paid', label: 'Paid', color: 'var(--mw-yellow-400)' },
        { value: 'overdue', label: 'Overdue', color: 'var(--mw-error)' },
        { value: 'cancelled', label: 'Cancelled', color: 'var(--neutral-400)' },
      ],
    },
    {
      id: 'aging',
      label: 'Aging',
      kind: 'multi',
      pinned: true,
      icon: Clock,
      options: AR_AGING_OPTIONS,
    },
    { id: 'customer', label: 'Customer', kind: 'select', icon: UserIcon, options: customerOptions },
    { id: 'balanceDue', label: 'Balance due', kind: 'range', icon: DollarSign },
    { id: 'jobRef', label: 'Job / SO', kind: 'tag' },
    {
      id: 'dueDate',
      label: 'Due',
      kind: 'date',
      icon: CalendarDays,
      placeholder: 'Any due date',
      quickRanges: ['thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'ytd'],
    },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'board', label: 'Aging buckets', icon: TableIcon, groupBy: 'aging' },
  ],
  defaultView: 'list',
  dateFacetId: 'dueDate',
};

function lastMonthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

function thisMonthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

registerSystemPresets(MODULE_ID, [
  {
    name: 'Aged debtors > 60 days',
    icon: AlertTriangle,
    iconTone: 'error',
    state: {
      values: { aging: ['61-90', '90+'] },
      search: '',
      view: 'board',
    },
  },
  {
    name: 'Month-end close — unposted',
    icon: FileWarning,
    iconTone: 'warning',
    state: {
      values: { status: ['draft'], dueDate: thisMonthRange() },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Top balances due',
    icon: DollarSign,
    iconTone: 'warning',
    state: {
      values: { balanceDue: { from: 5000 } },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Overdue right now',
    icon: Zap,
    iconTone: 'error',
    state: {
      values: { status: ['overdue'] },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Last month posted',
    icon: CalendarDays,
    iconTone: 'info',
    state: {
      values: { dueDate: lastMonthRange() },
      search: '',
      view: 'list',
    },
  },
]);

interface BookInvoicesProps {
  onSelectInvoice?: (invoiceId: string) => void;
}

export function BookInvoices({ onSelectInvoice }: BookInvoicesProps) {
  const navigate = useNavigate();
  const filters = useModuleFilters(bookInvoicesFilterSchema);
  const { state } = filters;

  // Pull drafts that were auto-created from delivered shipments and prepend
  // them so they appear at the top of the list as fresh draft rows.
  const drafts = useDraftInvoiceStore((s) => s.drafts);
  const invoices: Invoice[] = useMemo(
    () => [
      ...drafts.map((d) => ({
        id: d.id,
        customer: d.customer,
        issueDate: d.issueDate,
        dueDate: d.dueDate,
        status: 'draft' as InvoiceStatus,
        total: d.total,
        balanceDue: d.balanceDue,
        jobReference: d.sourceShipment,
      })),
      ...BASE_INVOICES,
    ],
    [drafts],
  );

  const filteredInvoices = useMemo(
    () =>
      applyFilters({
        schema: bookInvoicesFilterSchema,
        state,
        rows: invoices,
        getSearchText: (inv) => `${inv.id} ${inv.customer} ${inv.jobReference ?? ''}`,
        getFacetValue: (inv, id) => {
          switch (id) {
            case 'status': return inv.status;
            case 'aging': return agingBucket(inv);
            case 'customer': return inv.customer;
            case 'balanceDue': return inv.balanceDue;
            case 'jobRef': return inv.jobReference ? [inv.jobReference] : [];
            case 'dueDate': return inv.dueDate;
            default: return undefined;
          }
        },
      }),
    [invoices, state],
  );

  // Compute summary totals by status (over filtered set so users see the slice)
  const paidTotal = filteredInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pendingTotal = filteredInvoices.filter(i => ['sent', 'viewed', 'partiallyPaid', 'draft'].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const overdueTotal = filteredInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const columns: MwColumnDef<Invoice>[] = [
    {
      key: 'id',
      header: 'Invoice #',
      tooltip: 'Unique invoice identifier',
      cell: (invoice) => (
        <div className="flex flex-col">
          <span className="text-xs text-foreground font-medium tabular-nums">{invoice.id}</span>
          {invoice.jobReference && (
            <span className="font-normal text-xs text-[var(--neutral-500)]">
              Job: {invoice.jobReference}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (invoice) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border border-[var(--border)]">
            <AvatarImage src={invoice.customerLogo} />
            <AvatarFallback className="text-xs">
              {invoice.customer.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-xs text-foreground">{invoice.customer}</span>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      cell: (invoice) => (
        <span className="font-normal text-xs text-[var(--neutral-500)] tabular-nums">
          {new Date(invoice.issueDate).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      tooltip: 'Payment due date',
      cell: (invoice) => (
        <span
          className={cn(
            'text-xs tabular-nums',
            invoice.status === 'overdue' ? 'text-[var(--mw-error)] font-medium' : 'text-[var(--neutral-500)]'
          )}
        >
          {new Date(invoice.dueDate).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (invoice) => (
        <StatusBadge status={invoice.status as StatusKey}>
          {STATUS_LABEL_MAP[invoice.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (invoice) => (
        <span className="text-xs text-foreground font-medium tabular-nums">
          ${invoice.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      tooltip: 'Outstanding amount remaining',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (invoice) => (
        <span className="tabular-nums text-xs font-medium text-foreground">
          {invoice.balanceDue === 0 ? 'Paid' : `$${invoice.balanceDue.toLocaleString()}`}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: () => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <AnimatedSend className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <AnimatedDownload className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${filteredInvoices.length} of ${invoices.length} invoices`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'paid', label: 'Paid', value: paidTotal, color: 'var(--mw-yellow-400)' },
          { key: 'pending', label: 'Pending', value: pendingTotal, color: 'var(--mw-mirage)' },
          { key: 'overdue', label: 'Overdue', value: overdueTotal, color: 'var(--neutral-400)' },
        ]}
      />

      <ModuleFilterBar
        schema={bookInvoicesFilterSchema}
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
            <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/book/invoices/new')}>
              New Invoice
            </ToolbarPrimaryButton>
          </>
        }
      />

      {state.view === 'list' && (
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          <MwDataTable
            columns={columns}
            data={filteredInvoices}
            keyExtractor={(invoice) => invoice.id}
            selectable
            striped
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            onRowClick={(invoice) => onSelectInvoice ? onSelectInvoice(invoice.id) : navigate(`/book/invoices/${invoice.id}`)}
            emptyState={
              <EmptyState
                variant="compact"
                icon={FileText}
                title="No invoices found"
                description="Try adjusting your search or filter criteria"
              />
            }
          />
        </motion.div>
      )}

      {state.view === 'board' && (
        <motion.div variants={staggerItem} className="overflow-x-auto">
          <div className="flex min-w-min gap-4 pb-2">
            {AR_AGING_OPTIONS.map((bucket) => {
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
                        onClick={() => onSelectInvoice ? onSelectInvoice(inv.id) : navigate(`/book/invoices/${inv.id}`)}
                        className="block w-full rounded-md border border-[var(--border)] bg-background p-2 text-left text-xs transition-colors hover:bg-[var(--neutral-50)]"
                      >
                        <div className="font-medium tabular-nums text-foreground">{inv.id}</div>
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
