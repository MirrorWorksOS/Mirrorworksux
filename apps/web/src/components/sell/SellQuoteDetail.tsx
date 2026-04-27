/**
 * SellQuoteDetail — Full-page quote detail using JobWorkspaceLayout.
 * Route: /sell/quotes/:id
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
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
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import { quotes, opportunities, customers } from '@/services';
import { CapableToPromise } from '@/components/sell/CapableToPromise';
import { DxfUploadPanel } from '@/components/sell/DxfUploadPanel';
import { ESignaturePanel } from '@/components/sell/ESignaturePanel';
import { LeadScoreIndicator } from '@/components/sell/LeadScoreIndicator';
import { QuoteHeuristicPanel } from '@/components/sell/QuoteHeuristicPanel';
import { QuoteViewActivity } from '@/components/sell/QuoteViewActivity';
import { quoteHeuristics } from '@/services';

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
  { id: 'ai-analysis', label: 'Agent Analysis' },
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
          <div className="space-y-6">
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
                  className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                  onClick={() => {
                    // TODO(backend): quotes.send(quote.id) — server emails the quote and updates status.
                    toast.success('Quote sent to customer');
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Quote
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[var(--border)]"
                  onClick={() => {
                    // TODO(backend): quotes.convertToOrder(quote.id) — server creates the order and returns its id.
                    navigate(`/sell/orders/new?quoteId=${quote.id}`);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Convert to Sales Order
                </Button>
              </div>
            </Card>

            {/* Customer View Activity */}
            <QuoteViewActivity viewEvents={quote.viewEvents} quoteRef={quote.ref} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CapableToPromise />
            <DxfUploadPanel />
          </div>

          <ESignaturePanel quote={quote} />
          </div>
        );

      case 'line-items': {
        type LineItem = (typeof quote.lineItems)[number];
        const columns: MwColumnDef<LineItem>[] = [
          {
            key: 'productId',
            header: 'Product',
            tooltip: 'Product SKU',
            cell: (li) => <span className="font-medium tabular-nums">{li.productId}</span>,
          },
          {
            key: 'description',
            header: 'Description',
            cell: (li) => <span className="text-foreground">{li.description}</span>,
          },
          {
            key: 'qty',
            header: 'Qty',
            headerClassName: 'text-right',
            cell: (li) => <span className="tabular-nums">{li.qty}</span>,
            className: 'text-right',
          },
          {
            key: 'unitPrice',
            header: 'Unit Price',
            tooltip: 'Price per unit excl. GST',
            headerClassName: 'text-right',
            cell: (li) => <span className="tabular-nums">{fmtCurrency(li.unitPrice)}</span>,
            className: 'text-right',
          },
          {
            key: 'total',
            header: 'Total',
            tooltip: 'Line total excl. GST',
            headerClassName: 'text-right',
            cell: (li) => <span className="font-medium tabular-nums">{fmtCurrency(li.total)}</span>,
            className: 'text-right',
          },
        ];

        return (
          <div className="space-y-4">
            <MwDataTable<LineItem>
              columns={columns}
              data={quote.lineItems}
              keyExtractor={(li, i) => `${li.productId}-${i}`}
              striped
            />
            <div className="flex justify-end px-2">
              <div className="text-sm font-medium text-foreground tabular-nums">
                Subtotal: {fmtCurrency(subtotal)}
              </div>
            </div>
          </div>
        );
      }

      case 'ai-analysis':
        return <QuoteHeuristicPanel quoteId={quote.id} />;

      default:
        return null;
    }
  };

  const heuristic = quoteHeuristics[quote.id];

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Sell', href: '/sell' },
        ...(opp ? [{ label: 'Opportunities', href: '/sell/opportunities' }, { label: opp.title, href: `/sell/opportunities/${opp.id}` }] : [{ label: 'Quotes', href: '/sell/quotes' }]),
        { label: quote.ref },
      ]}
      title={`Quote ${quote.ref}`}
      subtitle={
        <span className="text-sm text-[var(--neutral-500)]">
          {quote.customerName} &middot; {fmtDate(quote.date)} &middot; {fmtCurrency(quote.value)}
        </span>
      }
      metaRow={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={isExpired ? 'overdue' : quote.status}>
            {isExpired ? 'Expired' : STATUS_LABEL[quote.status] ?? quote.status}
          </StatusBadge>
          {heuristic && (
            <div className="flex items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-card px-2 py-1">
              <span className="text-xs text-[var(--neutral-500)]">Win</span>
              <span className={cn(
                'text-xs font-medium tabular-nums',
                heuristic.winProbability >= 75 ? 'text-[var(--mw-green)]' : heuristic.winProbability >= 50 ? 'text-[var(--mw-yellow-500)]' : 'text-[var(--mw-error)]',
              )}>
                {heuristic.winProbability}%
              </span>
            </div>
          )}
          {opp && typeof opp.aiScore === 'number' && (
            <div className="flex items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-card px-2 py-1">
              <span className="text-xs text-[var(--neutral-500)]">Lead score</span>
              <LeadScoreIndicator score={opp.aiScore} />
            </div>
          )}
          {opp && (
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
              <Link to={`/sell/opportunities/${opp.id}`} className="hover:underline">
                Opportunity: {opp.title}
              </Link>
            </Badge>
          )}
        </div>
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to={opp ? `/sell/opportunities/${opp.id}` : '/sell/quotes'}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button variant="outline" className="border-[var(--border)]" onClick={() => {
            // TODO(backend): quotes.exportPdf(quote.id) — server returns a download URL.
            toast('Downloading PDF…');
          }}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={() => {
              // TODO(backend): quotes.sendEmail(quote.id) — server sends the quote and logs the activity.
              toast.success('Quote emailed to customer');
            }}
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
