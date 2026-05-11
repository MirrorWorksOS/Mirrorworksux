/**
 * Sell Quotes — list of quotes with the schema-driven filter bar.
 *
 * Persistent valid-until date chip (expiry is the daily-task lens for reps).
 * Facets: status, customer, value range, opened-by-customer.
 * View modes: table (have), kanban-by-status, calendar-by-validUntil.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  AlarmClock,
  CalendarDays,
  Columns3,
  DollarSign,
  Download,
  Eye,
  FileText,
  List as ListIcon,
  Plus,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { staggerItem } from '@/components/shared/motion/motion-variants';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { quotes as centralQuotes, customers as centralCustomers } from '@/services';
import { QuoteViewBadge } from '@/components/sell/QuoteViewActivity';
import type { QuoteViewEvent } from '@/types/entities';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'declined' | 'revision_requested';

interface Quote {
  id: string;
  quoteNumber: string;
  opportunity: string;
  customer: string;
  value: number;
  status: QuoteStatus;
  created: string;
  validUntil: string;
  viewEvents?: QuoteViewEvent[];
}

const mockQuotes: Quote[] = centralQuotes.map((q) => ({
  id: q.id,
  quoteNumber: q.ref,
  opportunity: q.opportunityId,
  customer: q.customerName,
  value: q.value,
  status: q.status as QuoteStatus,
  created: q.date,
  validUntil: q.expiryDate,
  viewEvents: q.viewEvents,
}));

const STATUS_VARIANT: Record<QuoteStatus, { variant: 'neutral' | 'info' | 'success' | 'error' | 'warning'; label: string; color: string }> = {
  draft: { variant: 'neutral', label: 'Draft', color: 'var(--neutral-400)' },
  sent: { variant: 'info', label: 'Sent', color: 'var(--mw-mirage)' },
  accepted: { variant: 'success', label: 'Accepted', color: 'var(--mw-yellow-400)' },
  declined: { variant: 'error', label: 'Declined', color: 'var(--mw-error)' },
  expired: { variant: 'error', label: 'Expired', color: 'var(--neutral-300)' },
  revision_requested: { variant: 'warning', label: 'Revision requested', color: 'var(--mw-warning)' },
};

const MODULE_ID = 'sell.quotes';

const customerOptions = centralCustomers.map((c) => ({ value: c.company, label: c.company }));

const quotesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Quotes',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: (Object.keys(STATUS_VARIANT) as QuoteStatus[]).map((s) => ({
        value: s,
        label: STATUS_VARIANT[s].label,
        color: STATUS_VARIANT[s].color,
      })),
    },
    { id: 'customer', label: 'Customer', kind: 'select', icon: UserIcon, options: customerOptions },
    { id: 'value', label: 'Value', kind: 'range', icon: DollarSign },
    { id: 'opened', label: 'Viewed by customer', kind: 'boolean', icon: Eye },
    {
      id: 'validUntil',
      label: 'Valid until',
      kind: 'date',
      icon: CalendarDays,
      placeholder: 'Any date',
    },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'kanban', label: 'Kanban by status', icon: Columns3, groupBy: 'status' },
  ],
  defaultView: 'list',
  dateFacetId: 'validUntil',
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'Expiring this week',
    icon: AlarmClock,
    iconTone: 'warning',
    state: { values: { validUntil: thisWeekRange(), status: ['sent'] }, search: '', view: 'list' },
  },
  {
    name: 'Awaiting response',
    icon: Send,
    iconTone: 'info',
    state: { values: { status: ['sent'], opened: true }, search: '', view: 'list' },
  },
  {
    name: 'High-value drafts',
    icon: FileText,
    iconTone: 'neutral',
    state: { values: { status: ['draft'], value: { from: 50000 } }, search: '', view: 'list' },
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

const quoteColumns: MwColumnDef<Quote>[] = [
  {
    key: 'quoteNumber',
    header: 'Quote #',
    tooltip: 'Unique quote reference number',
    className: 'font-medium tabular-nums text-foreground',
    cell: (row) => row.quoteNumber,
  },
  {
    key: 'opportunity',
    header: 'Opportunity',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (row) => (
      <a
        href={`/sell/opportunities/${row.opportunity}`}
        className="text-[var(--mw-info)] hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.opportunity.toUpperCase()}
      </a>
    ),
  },
  { key: 'customer', header: 'Customer', className: 'text-foreground', cell: (row) => row.customer },
  {
    key: 'value',
    header: 'Value',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums font-medium text-foreground',
    cell: (row) => `$${row.value.toLocaleString()}`,
  },
  {
    key: 'status',
    header: 'Status',
    headerClassName: 'text-center',
    className: 'text-center',
    cell: (row) => {
      const sv = STATUS_VARIANT[row.status];
      return (
        <div className="flex items-center justify-center">
          <StatusBadge variant={sv.variant}>{sv.label}</StatusBadge>
        </div>
      );
    },
  },
  {
    key: 'views',
    header: 'Views',
    headerClassName: 'text-center',
    className: 'text-center',
    cell: (row) => <QuoteViewBadge viewEvents={row.viewEvents} />,
  },
  {
    key: 'created',
    header: 'Created',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (row) => row.created,
  },
  {
    key: 'validUntil',
    header: 'Valid until',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (row) => row.validUntil,
  },
];

export function SellQuotes() {
  const navigate = useNavigate();
  const filters = useModuleFilters(quotesFilterSchema);
  const { state } = filters;

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: quotesFilterSchema,
        state,
        rows: mockQuotes,
        getSearchText: (q) => `${q.quoteNumber} ${q.customer} ${q.opportunity}`,
        getFacetValue: (q, id) => {
          switch (id) {
            case 'status': return q.status;
            case 'customer': return q.customer;
            case 'value': return q.value;
            case 'opened': return (q.viewEvents?.length ?? 0) > 0;
            case 'validUntil': return q.validUntil;
            default: return undefined;
          }
        },
      }),
    [state],
  );

  const totalValue = filtered.reduce((sum, q) => sum + q.value, 0);

  const kanbanStatuses: QuoteStatus[] = ['draft', 'sent', 'accepted', 'expired', 'declined', 'revision_requested'];

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Quotes"
        subtitle={`${filtered.length} of ${mockQuotes.length} • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'accepted', label: 'Accepted', value: filtered.filter(q => q.status === 'accepted').reduce((s, q) => s + q.value, 0), color: 'var(--mw-yellow-400)' },
          { key: 'sent', label: 'Sent', value: filtered.filter(q => q.status === 'sent').reduce((s, q) => s + q.value, 0), color: 'var(--mw-mirage)' },
          { key: 'draft', label: 'Draft', value: filtered.filter(q => q.status === 'draft').reduce((s, q) => s + q.value, 0), color: 'var(--neutral-400)' },
          { key: 'expired', label: 'Expired', value: filtered.filter(q => q.status === 'expired').reduce((s, q) => s + q.value, 0), color: 'var(--neutral-200)' },
        ]}
      />

      <ModuleFilterBar
        schema={quotesFilterSchema}
        filters={filters}
        searchPlaceholder="Search quotes…"
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-full border-[var(--neutral-200)] px-4"
              onClick={() => toast.success('Quotes exported')}
            >
              <Download className="w-4 h-4" /> Export
            </Button>
            <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/quotes/new')}>
              New Quote
            </ToolbarPrimaryButton>
          </>
        }
      />

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable<Quote>
            columns={quoteColumns}
            data={filtered}
            keyExtractor={(row) => row.id}
            onRowClick={(q) => navigate(`/sell/quotes/${q.id}`)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            striped
          />
        </motion.div>
      )}

      {state.view === 'kanban' && (
        <motion.div variants={staggerItem}>
          <KanbanBoard className="gap-4">
            {kanbanStatuses.map((s) => {
              const colQuotes = filtered.filter((q) => q.status === s);
              const sv = STATUS_VARIANT[s];
              const colValue = colQuotes.reduce((sum, q) => sum + q.value, 0);
              return (
                <KanbanColumn
                  key={s}
                  id={s}
                  title={sv.label}
                  count={colQuotes.length}
                  accept="quote-kanban"
                  onDrop={() => undefined}
                  className="min-w-[280px] w-[280px] flex-shrink-0"
                >
                  <div className="flex items-center justify-between px-0.5 pb-1 text-xs text-[var(--neutral-500)]">
                    <span className="tabular-nums">${colValue.toLocaleString()}</span>
                  </div>
                  {colQuotes.map((q) => (
                    <KanbanCard key={q.id} id={q.id} type="quote-kanban" className="p-0">
                      <div
                        role="button"
                        tabIndex={0}
                        className="p-4 cursor-pointer"
                        onClick={() => navigate(`/sell/quotes/${q.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/sell/quotes/${q.id}`); }}
                      >
                        <div className="text-sm font-medium tabular-nums">{q.quoteNumber}</div>
                        <div className="mt-1 text-xs text-[var(--neutral-500)]">{q.customer}</div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-medium tabular-nums text-foreground">${q.value.toLocaleString()}</span>
                          <span className="text-[var(--neutral-500)]">exp {q.validUntil}</span>
                        </div>
                      </div>
                    </KanbanCard>
                  ))}
                  {colQuotes.length === 0 && (
                    <Card variant="flat" className="p-3 text-center text-xs text-[var(--neutral-500)]">
                      None
                    </Card>
                  )}
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
        </motion.div>
      )}
    </PageShell>
  );
}
