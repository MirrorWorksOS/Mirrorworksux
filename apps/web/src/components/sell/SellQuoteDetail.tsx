/**
 * SellQuoteDetail — Full-page quote detail using JobWorkspaceLayout.
 * Route: /sell/quotes/:id
 *
 * Phase 2 (Sell overhaul) adds editable line items with state machine
 * (draft → sent → locked), Odoo-style totals card with margin %, payment
 * terms / T&Cs / payment-details / customer-message panels, history
 * timeline, product images, and a Revise affordance.
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Download,
  Mail,
  Send,
  FileText,
  Plus,
  Trash2,
  Package,
  Lock,
  RotateCcw,
} from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import {
  quotes,
  opportunities,
  customers,
  products,
  paymentTerms,
  legalTemplates,
} from '@/services';
import { CapableToPromise } from '@/components/sell/CapableToPromise';
import { DxfUploadPanel } from '@/components/sell/DxfUploadPanel';
import { ESignaturePanel } from '@/components/sell/ESignaturePanel';
import { LeadScoreIndicator } from '@/components/sell/LeadScoreIndicator';
import { QuoteHeuristicPanel } from '@/components/sell/QuoteHeuristicPanel';
import { QuoteViewActivity } from '@/components/sell/QuoteViewActivity';
import { quoteHeuristics } from '@/services';
import {
  EditableCard,
  type EditableCardChildProps,
} from '@/components/shared/forms/EditableCard';
import { Field, EditSelect, EditTextarea } from '@/components/shared/forms/EditField';
import { EntityPickerModal } from '@/components/shared/pickers/EntityPickerModal';
import { HistoryPanel } from '@/components/shared/history/HistoryPanel';
import {
  getChartScaleColour,
  marginToScalePercent,
} from '@/components/shared/charts/chart-theme';
import type { Quote, QuoteLineItem, QuoteHistoryEntry } from '@/types/entities';

/* ------------------------------------------------------------------ */
/*  Build lookup from centralised data                                */
/* ------------------------------------------------------------------ */

const QUOTE_BY_ID = Object.fromEntries(quotes.map((q) => [q.id, q]));
const PRODUCT_BY_ID = Object.fromEntries(products.map((p) => [p.id, p]));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

const GST_RATE = 0.1;

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'line-items', label: 'Line Items' },
  { id: 'ai-analysis', label: 'MirrorWorks Agent' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SellQuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const initialQuote = id ? QUOTE_BY_ID[id] : undefined;

  /* --- Local quote state (everything mutates in memory) ------- */
  const [quote, setQuote] = useState<Quote | undefined>(initialQuote);
  const [discount, setDiscount] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const opp = useMemo(
    () => (quote ? opportunities.find((o) => o.id === quote.opportunityId) : undefined),
    [quote],
  );

  const customer = useMemo(
    () => (quote ? customers.find((c) => c.id === quote.customerId) : undefined),
    [quote],
  );

  const isDraft = quote?.status === 'draft';
  const locked = !isDraft;

  /* --- Totals ----------------------------------------------------- */
  const subtotal = quote ? quote.lineItems.reduce((s, li) => s + li.total, 0) : 0;
  const totalCost = quote
    ? quote.lineItems.reduce((s, li) => s + li.qty * (li.unitCost ?? 0), 0)
    : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * GST_RATE * 100) / 100;
  const total = taxable + tax;
  const marginPct = subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;

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

  // Expiry is purely informational once the quote has been sent or progressed:
  // a sent/accepted/rejected quote should never read "Expired" just because
  // its expiry date has passed (the date check is for draft quotes only).
  const isExpired =
    quote.status === 'draft' &&
    !quote.sentAt &&
    new Date(quote.expiryDate) < new Date();

  /* --- Helpers --------------------------------------------------- */
  const appendHistory = (action: string, extra?: Partial<QuoteHistoryEntry>) => {
    const entry: QuoteHistoryEntry = {
      id: `h-${Date.now()}`,
      at: new Date().toISOString(),
      action,
      user: 'You',
      ...extra,
    };
    setQuote((q) => (q ? { ...q, history: [...(q.history ?? []), entry] } : q));
  };

  const updateLineItem = (idx: number, patch: Partial<QuoteLineItem>) => {
    setQuote((q) => {
      if (!q) return q;
      const next = [...q.lineItems];
      const merged = { ...next[idx], ...patch };
      merged.total = (merged.qty ?? 0) * (merged.unitPrice ?? 0);
      next[idx] = merged;
      return { ...q, lineItems: next };
    });
  };

  const removeLineItem = (idx: number) => {
    setQuote((q) => {
      if (!q) return q;
      const next = q.lineItems.filter((_, i) => i !== idx);
      return { ...q, lineItems: next };
    });
  };

  const handleAddProducts = (ids: string[]) => {
    if (ids.length === 0) return;
    setQuote((q) => {
      if (!q) return q;
      const additions: QuoteLineItem[] = ids
        .map((pid) => PRODUCT_BY_ID[pid])
        .filter(Boolean)
        .map((p) => ({
          productId: p.id,
          description: p.description,
          qty: 1,
          unitPrice: p.unitPrice,
          total: p.unitPrice,
          imageUrl: p.imageUrl,
        }));
      return { ...q, lineItems: [...q.lineItems, ...additions] };
    });
    appendHistory(`Added ${ids.length} line item${ids.length === 1 ? '' : 's'}`);
    toast.success(`Added ${ids.length} line item${ids.length === 1 ? '' : 's'}`);
  };

  const handleSend = () => {
    if (!isDraft) return;
    const now = new Date().toISOString();
    setQuote((q) => (q ? { ...q, status: 'sent', sentAt: now } : q));
    appendHistory('Sent to customer', { toValue: `Quote ${quote.ref}`, note: 'Quote locked' });
    toast.success('Quote sent to customer');
  };

  const handleRevise = () => {
    setQuote((q) => {
      if (!q) return q;
      const prev = q.currentRevisionLabel ?? 'v1';
      const num = parseInt(prev.replace(/[^0-9]/g, ''), 10) || 1;
      const nextLabel = `v${num + 1}`;
      const newRev = {
        version: num + 1,
        date: new Date().toISOString(),
        changedBy: 'shop' as const,
        changes: ['Revised quote'],
        totalValue: q.value,
      };
      return {
        ...q,
        status: 'draft',
        currentRevisionLabel: nextLabel,
        revisions: [...(q.revisions ?? []), newRev],
      };
    });
    appendHistory('Revision started', { toValue: 'New revision opened for edit' });
    toast.success('Revision created — quote unlocked');
  };

  /* --- Terms / payment-terms templates --------------------------- */
  const tncTemplate =
    legalTemplates.find((t) => t.id === quote.termsAndConditionsId) ??
    legalTemplates.find((t) => t.kind === 'terms_and_conditions' && t.isDefault);
  const paymentDetailsTemplate = legalTemplates.find(
    (t) => t.kind === 'payment_details' && t.isDefault,
  );
  const activePaymentTermId =
    quote.paymentTermsId ?? customer?.paymentTermsId ?? paymentTerms.find((p) => p.isDefault)?.id;
  const activePaymentTerm = paymentTerms.find((p) => p.id === activePaymentTermId);

  /* --- Product picker items -------------------------------------- */
  const productPickerItems = products.map((p) => ({
    id: p.id,
    label: p.partNumber,
    sub: p.description,
    right: fmtCurrency(p.unitPrice),
  }));

  /* --------------------------------------------------------------- */
  /*  Tab panels                                                     */
  /* --------------------------------------------------------------- */

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left — Details + Terms + supporting cards */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 space-y-5">
                  <h3 className="text-sm font-medium text-foreground">Quote Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Reference', value: quote.ref },
                      { label: 'Revision', value: quote.currentRevisionLabel ?? 'v1' },
                      { label: 'Date', value: fmtDate(quote.date) },
                      { label: 'Expiry', value: fmtDate(quote.expiryDate) },
                      { label: 'Customer', value: quote.customerName },
                      { label: 'Line Items', value: `${quote.lineItems.length} items` },
                    ].map((f) => (
                      <div key={f.label}>
                        <Label className="text-xs text-[var(--neutral-500)]">{f.label}</Label>
                        <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Payment terms */}
                <PaymentTermsCard
                  quote={quote}
                  activeTermId={activePaymentTermId}
                  customerFallbackId={customer?.paymentTermsId}
                  onSave={(termId) => {
                    setQuote((q) => (q ? { ...q, paymentTermsId: termId || undefined } : q));
                    appendHistory('Updated payment terms', {
                      toValue: paymentTerms.find((p) => p.id === termId)?.label ?? '—',
                    });
                  }}
                />

                {/* Terms & conditions */}
                <TermsAndConditionsCard
                  quote={quote}
                  onSave={(templateId, override) => {
                    setQuote((q) =>
                      q
                        ? { ...q, termsAndConditionsId: templateId || undefined, notes: override }
                        : q,
                    );
                    appendHistory('Updated terms & conditions');
                  }}
                />

                {/* Payment details (default template, read-only) */}
                {paymentDetailsTemplate && (
                  <Card className="p-6">
                    <h3 className="mb-3 text-sm font-medium text-foreground">Payment details</h3>
                    <p className="whitespace-pre-line text-sm text-[var(--neutral-700)] dark:text-[var(--muted-foreground)]">
                      {paymentDetailsTemplate.body}
                    </p>
                  </Card>
                )}

                {/* Customer message */}
                <CustomerMessageCard
                  message={quote.customerMessage ?? ''}
                  onSave={(msg) => {
                    setQuote((q) => (q ? { ...q, customerMessage: msg } : q));
                    appendHistory('Updated customer message');
                  }}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <CapableToPromise />
                  <DxfUploadPanel />
                </div>

                <ESignaturePanel quote={quote} />
              </div>

              {/* Right — Status + Totals + History + Activity */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 space-y-5">
                  <h3 className="text-sm font-medium text-foreground">Status</h3>
                  <StatusBadge status={isExpired ? 'overdue' : quote.status}>
                    {isExpired ? 'Expired' : STATUS_LABEL[quote.status] ?? quote.status}
                  </StatusBadge>

                  {quote.sentAt && (
                    <p className="text-xs text-[var(--neutral-500)]">
                      Sent {fmtDateTime(quote.sentAt)}
                    </p>
                  )}
                  {activePaymentTerm && (
                    <p className="text-xs text-[var(--neutral-500)]">
                      Terms: <span className="text-foreground">{activePaymentTerm.label}</span>
                    </p>
                  )}

                  {opp && (
                    <div className="pt-4 border-t border-[var(--border)]">
                      <Label className="text-xs text-[var(--neutral-500)]">
                        Linked Opportunity
                      </Label>
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
                    {isDraft ? (
                      <Button
                        className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                        onClick={handleSend}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Quote
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-[var(--border)]"
                        onClick={handleRevise}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Revise
                      </Button>
                    )}
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

                {/* Totals card */}
                <Card className="p-6 space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Totals</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--neutral-500)]">Subtotal</span>
                      <span className="tabular-nums text-foreground">{fmtCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--neutral-500)]">Discount</span>
                        <span className="tabular-nums text-foreground">
                          −{fmtCurrency(discount)}
                        </span>
                      </div>
                    )}
                    {isDraft && (
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-[var(--neutral-500)]">Discount</Label>
                        <Input
                          type="number"
                          min={0}
                          value={discount}
                          onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                          className="h-8 w-28 text-right tabular-nums"
                        />
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[var(--neutral-500)]">GST (10%)</span>
                      <span className="tabular-nums text-foreground">{fmtCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold">
                      <span className="text-foreground">Total (incl. GST)</span>
                      <span className="tabular-nums text-foreground">{fmtCurrency(total)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded border border-[var(--border)] px-3 py-2">
                      <span className="text-xs text-[var(--neutral-500)]">Margin</span>
                      <span
                        className="rounded px-2 py-0.5 text-sm font-semibold tabular-nums text-foreground"
                        style={{
                          backgroundColor: getChartScaleColour(marginToScalePercent(marginPct)),
                        }}
                      >
                        {marginPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </Card>

                <HistoryPanel entries={quote.history ?? []} title="History" />

                <QuoteViewActivity viewEvents={quote.viewEvents} quoteRef={quote.ref} />
              </div>
            </div>
          </div>
        );

      case 'line-items': {
        return (
          <div className="space-y-4">
            {locked && (
              <div className="flex items-start gap-3 rounded-[var(--shape-md)] border border-[var(--mw-amber)]/30 bg-[var(--mw-amber)]/10 px-4 py-3 text-sm">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-amber)]" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Quote {quote.ref} was sent
                    {quote.sentAt ? ` on ${fmtDateTime(quote.sentAt)}` : ''}.
                  </p>
                  <p className="text-xs text-[var(--neutral-600)]">
                    Click <span className="font-medium">Revise</span> to create a new revision.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 border-[var(--border)]"
                  onClick={handleRevise}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Revise
                </Button>
              </div>
            )}

            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--border)] bg-[var(--neutral-50)] text-xs text-[var(--neutral-500)] dark:bg-[var(--neutral-50)]">
                    <tr>
                      <th className="w-14 px-3 py-2 text-left font-medium">Image</th>
                      <th className="px-3 py-2 text-left font-medium">Product</th>
                      <th className="min-w-[220px] px-3 py-2 text-left font-medium">
                        Description
                      </th>
                      <th className="w-20 px-3 py-2 text-right font-medium">Qty</th>
                      <th className="w-28 px-3 py-2 text-right font-medium">Unit price</th>
                      <th className="w-28 px-3 py-2 text-right font-medium">Unit cost</th>
                      <th className="w-24 px-3 py-2 text-right font-medium">Margin %</th>
                      <th className="w-28 px-3 py-2 text-right font-medium">Total</th>
                      {isDraft && <th className="w-10 px-3 py-2" />}
                    </tr>
                  </thead>
                  <tbody>
                    {quote.lineItems.length === 0 && (
                      <tr>
                        <td
                          colSpan={isDraft ? 9 : 8}
                          className="px-3 py-6 text-center text-sm text-[var(--neutral-500)]"
                        >
                          No line items yet.
                        </td>
                      </tr>
                    )}
                    {quote.lineItems.map((li, idx) => {
                      const prod = PRODUCT_BY_ID[li.productId];
                      const img = li.imageUrl ?? prod?.imageUrl;
                      const unitCost = li.unitCost ?? 0;
                      const lineMargin =
                        li.unitPrice > 0
                          ? ((li.unitPrice - unitCost) / li.unitPrice) * 100
                          : 0;
                      return (
                        <tr
                          key={`${li.productId}-${idx}`}
                          className="border-b border-[var(--border)] last:border-b-0"
                        >
                          <td className="px-3 py-2">
                            {img ? (
                              <img
                                src={img}
                                alt={li.description}
                                className="h-10 w-10 rounded object-cover bg-[var(--neutral-100)]"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--neutral-100)] text-[var(--neutral-400)]">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium tabular-nums text-foreground">
                            {prod?.partNumber ?? li.productId}
                          </td>
                          <td className="px-3 py-2">
                            {isDraft ? (
                              <Input
                                value={li.description}
                                onChange={(e) =>
                                  updateLineItem(idx, { description: e.target.value })
                                }
                                className="h-8"
                              />
                            ) : (
                              <span className="text-foreground">{li.description}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {isDraft ? (
                              <Input
                                type="number"
                                min={0}
                                value={li.qty}
                                onChange={(e) =>
                                  updateLineItem(idx, { qty: Number(e.target.value) || 0 })
                                }
                                className="h-8 w-20 text-right tabular-nums"
                              />
                            ) : (
                              <span className="tabular-nums">{li.qty}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {isDraft ? (
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={li.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(idx, {
                                    unitPrice: Number(e.target.value) || 0,
                                  })
                                }
                                className="h-8 w-28 text-right tabular-nums"
                              />
                            ) : (
                              <span className="tabular-nums">{fmtCurrency(li.unitPrice)}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {isDraft ? (
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={li.unitCost ?? 0}
                                onChange={(e) =>
                                  updateLineItem(idx, {
                                    unitCost: Number(e.target.value) || 0,
                                  })
                                }
                                className="h-8 w-28 text-right tabular-nums"
                              />
                            ) : (
                              <span className="tabular-nums">
                                {fmtCurrency(li.unitCost ?? 0)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className="inline-block rounded px-2 py-0.5 text-xs font-medium tabular-nums text-foreground"
                              style={{
                                backgroundColor: getChartScaleColour(
                                  marginToScalePercent(lineMargin),
                                ),
                              }}
                            >
                              {lineMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-foreground">
                            {fmtCurrency(li.total)}
                          </td>
                          {isDraft && (
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[var(--neutral-500)] hover:text-[var(--mw-error)]"
                                onClick={() => removeLineItem(idx)}
                                aria-label="Remove line"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isDraft && (
                <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--neutral-50)]/50 px-3 py-2 dark:bg-[var(--neutral-50)]/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-foreground"
                    onClick={() => setPickerOpen(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add product
                  </Button>
                </div>
              )}
            </Card>

            <div className="flex flex-col items-end gap-1 text-sm px-2">
              <div className="text-[var(--neutral-500)] tabular-nums">
                Subtotal: <span className="text-foreground">{fmtCurrency(subtotal)}</span>
              </div>
              <div className="text-[var(--neutral-500)] tabular-nums">
                GST (10%): <span className="text-foreground">{fmtCurrency(tax)}</span>
              </div>
              <div className="font-medium text-foreground tabular-nums">
                Total (incl. GST): {fmtCurrency(total)}
              </div>
              {subtotal > 0 && (
                <div className="mt-1 flex items-center gap-2 tabular-nums">
                  <span className="text-[var(--neutral-500)]">Total margin</span>
                  <span
                    className="rounded-[var(--shape-md)] px-2 py-0.5 text-xs font-medium text-[var(--mw-mirage)]"
                    style={{
                      backgroundColor: getChartScaleColour(
                        marginToScalePercent(marginPct),
                      ),
                    }}
                    title={
                      totalCost > 0
                        ? `Unit costs entered on every line.`
                        : 'No unit cost entered on any line — margin defaults to 100%.'
                    }
                  >
                    {marginPct.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <EntityPickerModal
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              kind="product"
              multiSelect
              items={productPickerItems}
              title="Add product"
              confirmLabel="Add"
              onSelect={handleAddProducts}
            />
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
        ...(opp
          ? [
              { label: 'Opportunities', href: '/sell/opportunities' },
              { label: opp.title, href: `/sell/opportunities/${opp.id}` },
            ]
          : [{ label: 'Quotes', href: '/sell/quotes' }]),
        { label: quote.ref },
      ]}
      title={`Quote ${quote.ref}`}
      subtitle={
        <span className="text-sm text-[var(--neutral-500)]">
          {quote.customerName} &middot; {fmtDate(quote.date)} &middot; {fmtCurrency(total)}
        </span>
      }
      metaRow={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={isExpired ? 'overdue' : quote.status}>
            {isExpired ? 'Expired' : STATUS_LABEL[quote.status] ?? quote.status}
          </StatusBadge>
          {quote.currentRevisionLabel && (
            <Badge
              variant="outline"
              className="border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-700)] dark:border-[var(--border)] dark:bg-[var(--neutral-200)] dark:text-[var(--muted-foreground)]"
            >
              {quote.currentRevisionLabel}
            </Badge>
          )}
          {heuristic && (
            <div className="flex items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-card px-2 py-1">
              <span className="text-xs text-[var(--neutral-500)]">Win</span>
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  heuristic.winProbability >= 75
                    ? 'text-[var(--mw-green)]'
                    : heuristic.winProbability >= 50
                      ? 'text-[var(--mw-yellow-500)]'
                      : 'text-[var(--mw-error)]',
                )}
              >
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
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs dark:bg-[var(--neutral-200)] dark:text-[var(--neutral-800)] dark:border-[var(--border)]">
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
          <Button
            variant="outline"
            className="border-[var(--border)]"
            onClick={() => {
              // TODO(backend): quotes.exportPdf(quote.id) — server returns a download URL.
              toast('Downloading PDF…');
            }}
          >
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

/* ------------------------------------------------------------------ */
/*  Sub-cards — kept inline so state stays close to parent             */
/* ------------------------------------------------------------------ */

interface PaymentTermsCardProps {
  quote: Quote;
  activeTermId?: string;
  customerFallbackId?: string;
  onSave: (termId: string) => void;
}

function PaymentTermsCard({
  quote,
  activeTermId,
  customerFallbackId,
  onSave,
}: PaymentTermsCardProps) {
  const [draft, setDraft] = useState(quote.paymentTermsId ?? '');
  const activeTerm = paymentTerms.find((p) => p.id === activeTermId);
  const isInherited =
    !quote.paymentTermsId && customerFallbackId && customerFallbackId === activeTermId;

  return (
    <EditableCard
      title="Payment terms"
      onSave={async () => onSave(draft)}
      onCancel={() => setDraft(quote.paymentTermsId ?? '')}
    >
      {({ mode }: EditableCardChildProps) =>
        mode === 'edit' ? (
          <EditSelect
            label="Payment terms template"
            value={draft}
            onChange={setDraft}
            options={paymentTerms.map((p) => ({ value: p.id, label: p.label }))}
            placeholder="Use customer default"
          />
        ) : (
          <div className="space-y-1">
            <Field label="Terms" value={activeTerm?.label ?? '—'} />
            {activeTerm?.notes && (
              <p className="text-xs text-[var(--neutral-500)]">{activeTerm.notes}</p>
            )}
            {isInherited && (
              <p className="text-xs text-[var(--neutral-500)]">Inherited from customer default.</p>
            )}
          </div>
        )
      }
    </EditableCard>
  );
}

interface TermsAndConditionsCardProps {
  quote: Quote;
  onSave: (templateId: string, override?: string) => void;
}

function TermsAndConditionsCard({ quote, onSave }: TermsAndConditionsCardProps) {
  const initialTemplate =
    quote.termsAndConditionsId ??
    legalTemplates.find((t) => t.kind === 'terms_and_conditions' && t.isDefault)?.id ??
    '';
  const [templateId, setTemplateId] = useState(initialTemplate);
  const [override, setOverride] = useState(quote.notes ?? '');

  const tncOptions = legalTemplates
    .filter((t) => t.kind === 'terms_and_conditions')
    .map((t) => ({ value: t.id, label: t.name }));

  const activeTemplate = legalTemplates.find((t) => t.id === templateId);

  return (
    <EditableCard
      title="Terms & conditions"
      onSave={async () => onSave(templateId, override || undefined)}
      onCancel={() => {
        setTemplateId(initialTemplate);
        setOverride(quote.notes ?? '');
      }}
    >
      {({ mode }: EditableCardChildProps) =>
        mode === 'edit' ? (
          <div className="space-y-4">
            <EditSelect
              label="Template"
              value={templateId}
              onChange={setTemplateId}
              options={tncOptions}
            />
            <EditTextarea
              label="Override (optional)"
              value={override}
              onChange={setOverride}
              rows={4}
              placeholder="Add a quote-specific override; leave blank to use the template above as-is."
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[var(--neutral-500)]">
              {activeTemplate?.name ?? 'No template selected'}
            </p>
            <p className="whitespace-pre-line text-sm text-[var(--neutral-700)] dark:text-[var(--muted-foreground)]">
              {quote.notes?.trim() || activeTemplate?.body || '—'}
            </p>
          </div>
        )
      }
    </EditableCard>
  );
}

interface CustomerMessageCardProps {
  message: string;
  onSave: (msg: string) => void;
}

function CustomerMessageCard({ message, onSave }: CustomerMessageCardProps) {
  const [draft, setDraft] = useState(message);

  return (
    <EditableCard
      title="Customer message"
      subtitle="Shown in the emailed quote and the customer portal."
      onSave={async () => onSave(draft)}
      onCancel={() => setDraft(message)}
    >
      {({ mode }: EditableCardChildProps) =>
        mode === 'edit' ? (
          <EditTextarea
            label="Message"
            value={draft}
            onChange={setDraft}
            rows={4}
            placeholder="Add a short note for the customer (optional)…"
          />
        ) : message.trim() ? (
          <p className="whitespace-pre-line text-sm text-foreground">{message}</p>
        ) : (
          <p className="text-sm text-[var(--neutral-500)]">No customer message.</p>
        )
      }
    </EditableCard>
  );
}

