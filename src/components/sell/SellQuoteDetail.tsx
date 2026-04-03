/**
 * SellQuoteDetail — Full-page quote detail using JobWorkspaceLayout.
 * Route: /sell/quotes/:id
 */

import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Download, Mail, Send, FileText } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import { quotes, opportunities, customers } from '@/services/mock';

/* ------------------------------------------------------------------ */
/*  Build lookup from centralised data                                */
/* ------------------------------------------------------------------ */

const QUOTE_BY_ID = Object.fromEntries(quotes.map((q) => [q.id, q]));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'line-items', label: 'Line Items' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SellQuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const quote = id ? QUOTE_BY_ID[id] : undefined;

  const opp = useMemo(
    () => (quote ? opportunities.find((o) => o.id === quote.opportunityId) : undefined),
    [quote],
  );

  const customer = useMemo(
    () => (quote ? customers.find((c) => c.id === quote.customerId) : undefined),
    [quote],
  );

  const subtotal = quote ? quote.lineItems.reduce((s, li) => s + li.total, 0) : 0;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;

  const tabConfig = useMemo(() => {
    if (!quote) return DEFAULT_TABS;
    return DEFAULT_TABS.map((t) => {
      if (t.id === 'line-items') return { ...t, count: quote.lineItems.length };
      return t;
    });
  }, [quote]);

  if (!quote) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/sell/quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quotes
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Quote not found. Open one from the quotes list.
        </p>
      </div>
    );
  }

  const isExpired = new Date(quote.expiryDate) < new Date();

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left — Details */}
            <Card className="lg:col-span-3 p-6 space-y-5">
              <h3 className="text-sm font-medium text-foreground">Quote Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Reference', value: quote.ref },
                  { label: 'Date', value: fmtDate(quote.date) },
                  { label: 'Expiry', value: fmtDate(quote.expiryDate) },
                  { label: 'Customer', value: quote.customerName },
                  { label: 'Value', value: fmtCurrency(quote.value) },
                  { label: 'Line Items', value: `${quote.lineItems.length} items` },
                ].map((f) => (
                  <div key={f.label}>
                    <Label className="text-xs text-[var(--neutral-500)]">{f.label}</Label>
                    <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--neutral-500)]">Subtotal</span>
                  <span className="tabular-nums text-foreground">{fmtCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--neutral-500)]">GST (10%)</span>
                  <span className="tabular-nums text-foreground">{fmtCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-[var(--border)]">
                  <span className="text-foreground">Total (inc. GST)</span>
                  <span className="tabular-nums text-foreground">{fmtCurrency(total)}</span>
                </div>
              </div>
            </Card>

            {/* Right — Status + Links */}
            <Card className="lg:col-span-2 p-6 space-y-5">
              <h3 className="text-sm font-medium text-foreground">Status</h3>
              <StatusBadge status={isExpired ? 'overdue' : quote.status}>
                {isExpired ? 'Expired' : STATUS_LABEL[quote.status] ?? quote.status}
              </StatusBadge>

              {opp && (
                <div className="pt-4 border-t border-[var(--border)]">
                  <Label className="text-xs text-[var(--neutral-500)]">Linked Opportunity</Label>
                  <Link
                    to={`/sell/opportunities/${opp.id}`}
                    className="text-sm font-medium text-[var(--mw-blue)] hover:underline block mt-0.5"
                  >
                    {opp.title}
                  </Link>
                </div>
              )}

              {customer && (
                <div className="pt-4 border-t border-[var(--border)]">
                  <Label className="text-xs text-[var(--neutral-500)]">Customer</Label>
                  <Link
                    to={`/sell/crm/${customer.id}`}
                    className="text-sm font-medium text-[var(--mw-blue)] hover:underline block mt-0.5"
                  >
                    {customer.company}
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <Button
                  className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)]"
                  onClick={() => toast.success('Quote sent to customer')}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Quote
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[var(--border)]"
                  onClick={() => toast.success('Converting to order…')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Convert to Order
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'line-items':
        return (
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs text-right">Unit Price</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.lineItems.map((li, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium tabular-nums">{li.productId}</TableCell>
                    <TableCell className="text-xs">{li.description}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{li.qty}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{fmtCurrency(li.unitPrice)}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums font-medium">{fmtCurrency(li.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end p-4 border-t border-[var(--border)]">
              <div className="text-sm font-medium text-foreground tabular-nums">
                Subtotal: {fmtCurrency(subtotal)}
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Sell', href: '/sell' },
        { label: 'Quotes', href: '/sell/quotes' },
        { label: quote.ref },
      ]}
      title={`Quote ${quote.ref}`}
      subtitle={
        <span className="text-sm text-[var(--neutral-500)]">
          {quote.customerName} &middot; {fmtDate(quote.date)} &middot; {fmtCurrency(quote.value)}
        </span>
      }
      metaRow={
        <div className="flex items-center gap-2">
          <StatusBadge status={isExpired ? 'overdue' : quote.status}>
            {isExpired ? 'Expired' : STATUS_LABEL[quote.status] ?? quote.status}
          </StatusBadge>
          {opp && (
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
              {opp.title}
            </Badge>
          )}
        </div>
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to="/sell/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button variant="outline" className="border-[var(--border)]" onClick={() => toast('Downloading PDF…')}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)]"
            onClick={() => toast.success('Quote emailed to customer')}
          >
            <Mail className="mr-2 h-4 w-4" /> Email Quote
          </Button>
        </>
      }
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}
