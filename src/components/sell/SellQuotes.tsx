/**
 * Sell Quotes - Manage and track all quotes
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

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

const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QT-2026-0142',
    opportunity: 'OPP-0156',
    customer: 'TechCorp Industries',
    value: 12500,
    status: 'sent',
    created: '2026-03-20',
    validUntil: '2026-04-20',
  },
  {
    id: '2',
    quoteNumber: 'QT-2026-0143',
    opportunity: 'OPP-0159',
    customer: 'Hunter Steel Co',
    value: 3500,
    status: 'draft',
    created: '2026-03-22',
    validUntil: '2026-04-22',
  },
  {
    id: '3',
    quoteNumber: 'QT-2026-0139',
    opportunity: 'OPP-0148',
    customer: 'BHP Contractors',
    value: 87000,
    status: 'accepted',
    created: '2026-03-10',
    validUntil: '2026-04-10',
  },
  {
    id: '4',
    quoteNumber: 'QT-2026-0135',
    opportunity: 'OPP-0138',
    customer: 'Sydney Rail Corp',
    value: 45000,
    status: 'expired',
    created: '2026-02-15',
    validUntil: '2026-03-15',
  },
  {
    id: '5',
    quoteNumber: 'QT-2026-0144',
    opportunity: 'OPP-0162',
    customer: 'Pacific Fabrication',
    value: 22800,
    status: 'sent',
    created: '2026-03-25',
    validUntil: '2026-04-25',
  },
  {
    id: '6',
    quoteNumber: 'QT-2026-0145',
    opportunity: 'OPP-0165',
    customer: 'AeroSpace Ltd',
    value: 64000,
    status: 'draft',
    created: '2026-03-28',
    validUntil: '2026-04-28',
  },
];

const STATUS_BADGE: Record<QuoteStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-700)]',
  },
  sent: {
    label: 'Sent',
    className: 'border-0 bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  },
  accepted: {
    label: 'Accepted',
    className: 'border-0 bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  },
  expired: {
    label: 'Expired',
    className: 'border-0 bg-[var(--mw-error)]/10 text-[var(--mw-error)]',
  },
};

const TABS = [
  { label: 'All', count: 6 },
  { label: 'Draft', count: 2 },
  { label: 'Sent', count: 2 },
  { label: 'Accepted', count: 1 },
  { label: 'Expired', count: 1 },
];

const STATUS_MAP: Record<string, QuoteStatus> = {
  Draft: 'draft',
  Sent: 'sent',
  Accepted: 'accepted',
  Expired: 'expired',
};

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
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">QUOTE #</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">OPPORTUNITY</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">CUSTOMER</th>
                <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">VALUE</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">CREATED</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">VALID UNTIL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote, idx) => {
                const statusBadge = STATUS_BADGE[quote.status];
                return (
                  <tr
                    key={quote.id}
                    onClick={() => navigate('/sell/quotes/new')}
                    className={cn(
                      'border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)] cursor-pointer transition-colors',
                      idx % 2 === 1 && 'bg-[var(--neutral-100)]',
                    )}
                  >
                    <td className="px-4 text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-4 text-sm tabular-nums text-[var(--neutral-600)]">
                      {quote.opportunity}
                    </td>
                    <td className="px-4 text-sm text-[var(--neutral-900)]">{quote.customer}</td>
                    <td className="px-4 text-right text-sm tabular-nums font-medium text-[var(--neutral-900)]">
                      ${quote.value.toLocaleString()}
                    </td>
                    <td className="px-4">
                      <div className="flex items-center justify-center">
                        <Badge className={cn('rounded-full text-xs px-2 py-0.5', statusBadge.className)}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 text-sm tabular-nums text-[var(--neutral-600)]">{quote.created}</td>
                    <td className="px-4 text-sm tabular-nums text-[var(--neutral-600)]">{quote.validUntil}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filtered.length} of {filtered.length}</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
