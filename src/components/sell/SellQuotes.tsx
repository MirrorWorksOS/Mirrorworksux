/**
 * Sell Quotes - Manage and track all quotes
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

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
    className: 'border-0 bg-blue-50 text-blue-700',
  },
  accepted: {
    label: 'Accepted',
    className: 'border-0 bg-green-50 text-green-700',
  },
  expired: {
    label: 'Expired',
    className: 'border-0 bg-red-50 text-red-700',
  },
};

export function SellQuotes() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <PageHeader
        title="Quotes"
        subtitle="Manage and track all quotes"
        actions={
          <Button
            className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]"
            onClick={() => navigate('/sell/quotes/new')}
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
            New Quote
          </Button>
        }
      />

      <div className="px-6 pb-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Quote #</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Opportunity</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Customer</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--neutral-600)]">Value</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Created</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Valid Until</th>
                </tr>
              </thead>
              <tbody>
                {mockQuotes.map((quote) => {
                  const statusBadge = STATUS_BADGE[quote.status];
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => navigate('/sell/quotes/new')}
                      className="cursor-pointer border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--neutral-50)]"
                    >
                      <td className="px-4 py-3 font-medium tabular-nums text-[var(--neutral-900)]">
                        {quote.quoteNumber}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--neutral-600)]">
                        {quote.opportunity}
                      </td>
                      <td className="px-4 py-3 text-[var(--neutral-900)]">{quote.customer}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--neutral-900)]">
                        ${quote.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--neutral-600)]">{quote.created}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--neutral-600)]">{quote.validUntil}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
