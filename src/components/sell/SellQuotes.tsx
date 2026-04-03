/**
 * Sell Quotes - Manage and track all quotes
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '../ui/button';
import { quotes as centralQuotes } from '@/services/mock';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired';

interface Quote {
  id: string;
  quoteNumber: string;
  opportunity: string;
  customer: string;
  value: number;
  status: QuoteStatus;
  created: string;
  validUntil: string;
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
}));

const STATUS_VARIANT: Record<QuoteStatus, { variant: 'neutral' | 'info' | 'success' | 'error'; label: string }> = {
  draft: { variant: 'neutral', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  accepted: { variant: 'success', label: 'Accepted' },
  expired: { variant: 'error', label: 'Expired' },
};

const TABS = [
  { label: 'All', count: mockQuotes.length },
  { label: 'Draft', count: mockQuotes.filter((q) => q.status === 'draft').length },
  { label: 'Sent', count: mockQuotes.filter((q) => q.status === 'sent').length },
  { label: 'Accepted', count: mockQuotes.filter((q) => q.status === 'accepted').length },
  { label: 'Expired', count: mockQuotes.filter((q) => q.status === 'expired').length },
];

const STATUS_MAP: Record<string, QuoteStatus> = {
  Draft: 'draft',
  Sent: 'sent',
  Accepted: 'accepted',
  Expired: 'expired',
};

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
    tooltip: 'Linked sales opportunity',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (row) => row.opportunity,
  },
  {
    key: 'customer',
    header: 'Customer',
    tooltip: 'Quoting customer name',
    className: 'text-foreground',
    cell: (row) => row.customer,
  },
  {
    key: 'value',
    header: 'Value',
    tooltip: 'Total quoted value incl. tax',
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
    key: 'created',
    header: 'Created',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (row) => row.created,
  },
  {
    key: 'validUntil',
    header: 'Valid until',
    tooltip: 'Quote expiry date',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (row) => row.validUntil,
  },
];

export function SellQuotes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const totalValue = mockQuotes.reduce((sum, q) => sum + q.value, 0);

  const filtered = mockQuotes
    .filter((q) => activeTab === 'All' || q.status === STATUS_MAP[activeTab])
    .filter(
      (q) =>
        !search ||
        q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.customer.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Quotes"
        subtitle={`${mockQuotes.length} quotes • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'accepted', label: 'Accepted', value: mockQuotes.filter(q => q.status === 'accepted').reduce((s, q) => s + q.value, 0), color: 'var(--mw-yellow-400)' },
          { key: 'sent', label: 'Sent', value: mockQuotes.filter(q => q.status === 'sent').reduce((s, q) => s + q.value, 0), color: 'var(--mw-mirage)' },
          { key: 'draft', label: 'Draft', value: mockQuotes.filter(q => q.status === 'draft').reduce((s, q) => s + q.value, 0), color: 'var(--neutral-400)' },
          { key: 'expired', label: 'Expired', value: mockQuotes.filter(q => q.status === 'expired').reduce((s, q) => s + q.value, 0), color: 'var(--neutral-200)' },
        ]}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search quotes…" />
        <ToolbarFilterPills
          value={activeTab}
          onChange={setActiveTab}
          options={TABS.map((t) => ({ key: t.label, label: t.label, count: t.count }))}
        />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <Button
          variant="outline"
          className="h-12 gap-2 rounded-full border-[var(--neutral-200)] px-5 group"
          onClick={() => toast.success('Quotes exported')}
        >
          <Download className="w-4 h-4" /> Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/quotes/new')}>
          New Quote
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filtered.length} of {filtered.length}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </PageShell>
  );
}
