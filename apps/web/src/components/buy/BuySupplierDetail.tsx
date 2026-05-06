/**
 * BuySupplierDetail — Full-page supplier detail using JobWorkspaceLayout.
 * Route: /buy/suppliers/:id
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Mail, Phone, Star, Package, Clock, TrendingUp, FileText } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { MirrorWorksAgentCard, type AgentCardTone } from '@/components/shared/ai/MirrorWorksAgentCard';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import { suppliers, purchaseOrders, bills } from '@/services';

/* ------------------------------------------------------------------ */
/*  Build lookup from centralised data                                */
/* ------------------------------------------------------------------ */

const SUP_BY_ID = Object.fromEntries(suppliers.map((s) => [s.id, s]));

const createBlankSupplier = () => ({
  id: `new-${Date.now()}`,
  company: '',
  contact: '',
  email: '',
  phone: '',
  category: '',
  paymentTerms: 'Net 30',
  onTimePercent: 0,
  rating: 0,
});

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'purchase-orders', label: 'Purchase Orders' },
  { id: 'bills', label: 'Bills' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BuySupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isNew = !id || id === 'new';
  const supplier = isNew ? createBlankSupplier() : (id ? SUP_BY_ID[id] : undefined);

  const handleSave = () => {
    // TODO(backend): isNew ? suppliers.create(supplier) : suppliers.update(supplier.id, supplier)
    if (isNew && supplier) {
      toast.success('Supplier created');
      navigate(`/buy/suppliers/${supplier.id}`, { replace: true });
    } else {
      toast.success('Supplier saved');
    }
  };

  const supplierPOs = useMemo(
    () => (supplier ? purchaseOrders.filter((po) => po.supplierId === supplier.id) : []),
    [supplier],
  );

  const supplierBills = useMemo(
    () => (supplier ? bills.filter((b) => b.supplierId === supplier.id) : []),
    [supplier],
  );

  const totalSpend = supplierPOs.reduce((s, po) => s + po.total, 0);

  /* ---------------------------------------------------------------- */
  /*  AI Agent suggestion — driven by supplier metrics                */
  /* ---------------------------------------------------------------- */
  const agentSuggestion = useMemo(() => {
    if (!supplier || isNew) return null;

    const overdueBills = supplierBills.filter((b) => b.status === 'overdue');
    const partialPOs = supplierPOs.filter((po) => po.status === 'partial');
    const openPOs = supplierPOs.filter((po) => po.status !== 'received');

    // Risk path — poor on-time / low rating / overdue bills
    if (supplier.onTimePercent < 80 || supplier.rating <= 3) {
      return {
        tone: 'risk' as AgentCardTone,
        title: 'Performance risk — consider a backup supplier',
        suggestion: (
          <>
            <strong>{supplier.company}</strong> is trending below your reliability threshold
            ({supplier.onTimePercent}% on-time, rating {supplier.rating}/5). Sourcing the next
            order from a backup in <em>{supplier.category}</em> could reduce schedule slippage.
          </>
        ),
        primary: { label: 'Compare alternatives', onClick: () => navigate('/buy/vendor-comparison') },
        secondary: { label: 'Dismiss', onClick: () => toast('Suggestion dismissed') },
        statusText: 'Updated just now',
        detail: (
          <div className="space-y-1.5">
            <p>• On-time delivery has trailed peer suppliers in <em>{supplier.category}</em> for 3 consecutive months.</p>
            <p>• {partialPOs.length} active PO{partialPOs.length === 1 ? '' : 's'} currently partial-received.</p>
            <p>• {overdueBills.length} bill{overdueBills.length === 1 ? '' : 's'} overdue — possible disputes.</p>
            <p className="pt-1 text-[var(--neutral-500)]">Run a vendor comparison to evaluate Pacific Metals or Hunter Steel for next order.</p>
          </div>
        ),
      };
    }

    // Opportunity — overdue bills with otherwise good supplier
    if (overdueBills.length > 0) {
      const overdueAmount = overdueBills.reduce((s, b) => s + (b.amount - b.paidAmount), 0);
      return {
        tone: 'opportunity' as AgentCardTone,
        title: 'Pay overdue bills to protect supplier terms',
        suggestion: (
          <>
            <strong>{overdueBills.length} bill{overdueBills.length === 1 ? '' : 's'}</strong>{' '}
            ({fmtCurrency(overdueAmount)}) overdue with {supplier.company}. Clearing now keeps
            your {supplier.paymentTerms} terms intact and protects priority on next pour.
          </>
        ),
        primary: { label: 'Open AP queue', onClick: () => setActiveTab('bills') },
        secondary: { label: 'Snooze', onClick: () => toast('Snoozed for 7 days') },
        statusText: 'Updated 1 hour ago',
      };
    }

    // Opportunity — top performer, room to consolidate or renegotiate
    if (supplier.onTimePercent >= 95 && supplier.rating >= 4 && totalSpend > 10000) {
      return {
        tone: 'opportunity' as AgentCardTone,
        title: 'Negotiate volume discount or extended terms',
        suggestion: (
          <>
            <strong>{supplier.company}</strong> ranks in your top tier ({supplier.onTimePercent}%
            on-time, rating {supplier.rating}/5) with {fmtCurrency(totalSpend)} of spend.
            You have leverage to push for a 3-5% volume discount or extend terms from {supplier.paymentTerms} → Net 60.
          </>
        ),
        primary: { label: 'Draft renegotiation email', onClick: () => toast.success('Draft created — open Outbox') },
        secondary: { label: 'Not now', onClick: () => toast('Saved for later') },
        statusText: 'Based on last 6 months of spend',
        detail: (
          <div className="space-y-1.5">
            <p>• Spend trajectory: {fmtCurrency(totalSpend)} across {supplierPOs.length} POs in the period.</p>
            <p>• On-time {supplier.onTimePercent}% beats your category average by ~6 pts.</p>
            <p>• Comparable suppliers in <em>{supplier.category}</em> typically offer Net 45-60 at this volume.</p>
          </div>
        ),
      };
    }

    // Default — informational nudge for active POs
    if (openPOs.length > 0) {
      return {
        tone: 'neutral' as AgentCardTone,
        title: `${openPOs.length} open PO${openPOs.length === 1 ? '' : 's'} with this supplier`,
        suggestion: (
          <>
            You have <strong>{openPOs.length} open PO{openPOs.length === 1 ? '' : 's'}</strong> ({fmtCurrency(openPOs.reduce((s, po) => s + (po.total - po.received), 0))} outstanding).
            Bundle next requisition with the existing batch to save freight on this lane.
          </>
        ),
        primary: { label: 'View open POs', onClick: () => setActiveTab('purchase-orders') },
        statusText: 'Updated this morning',
      };
    }

    return {
      tone: 'success' as AgentCardTone,
      title: 'No actions required',
      suggestion: (
        <>
          {supplier.company} is healthy — no overdue bills, no open POs, performance on track.
          MirrorWorks Agent will alert you if anything changes.
        </>
      ),
      statusText: 'Last review just now',
    };
  }, [supplier, isNew, supplierPOs, supplierBills, totalSpend, navigate]);

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === 'purchase-orders') return { ...t, count: supplierPOs.length };
      if (t.id === 'bills') return { ...t, count: supplierBills.length };
      return t;
    });
  }, [supplierPOs, supplierBills]);

  if (!supplier) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/buy/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to suppliers
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Supplier not found. Open one from the suppliers list.
        </p>
      </div>
    );
  }

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* AI agent suggestion */}
            {agentSuggestion && (
              <MirrorWorksAgentCard
                title={agentSuggestion.title}
                suggestion={agentSuggestion.suggestion}
                tone={agentSuggestion.tone}
                primaryAction={agentSuggestion.primary}
                secondaryAction={agentSuggestion.secondary}
                statusText={agentSuggestion.statusText}
                detailContent={agentSuggestion.detail}
                evidenceLevel={agentSuggestion.detail ? 'expandable' : 'hidden'}
                detailLabel="Evidence"
              />
            )}

            {/* KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiStatCard label="Total Spend" value={fmtCurrency(totalSpend)} icon={TrendingUp} />
              <KpiStatCard label="Active POs" value={supplierPOs.filter((po) => po.status !== 'received').length} icon={Package} />
              <KpiStatCard label="On-Time %" value={`${supplier.onTimePercent}%`} icon={Clock} />
              <KpiStatCard
                label="Rating"
                value={`${supplier.rating}/5`}
                icon={Star}
                trailing={
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={cn('w-3.5 h-3.5', i < supplier.rating ? 'fill-[var(--mw-yellow-400)] text-[var(--mw-yellow-400)]' : 'text-[var(--neutral-300)]')} />
                    ))}
                  </div>
                }
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 p-6 space-y-5">
                <h3 className="text-sm font-medium text-foreground">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Company', value: supplier.company },
                    { label: 'Category', value: supplier.category },
                    { label: 'Payment Terms', value: supplier.paymentTerms },
                    { label: 'Rating', value: `${supplier.rating} / 5` },
                  ].map((f) => (
                    <div key={f.label}>
                      <Label className="text-xs text-[var(--neutral-500)]">{f.label}</Label>
                      <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 space-y-5">
                <h3 className="text-sm font-medium text-foreground">Primary Contact</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Name</Label>
                    <p className="text-sm font-medium text-foreground mt-0.5">{supplier.contact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                    <a href={`mailto:${supplier.email}`} className="text-sm text-[var(--mw-blue)] hover:underline">{supplier.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                    <span className="text-sm text-foreground">{supplier.phone}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border)] space-y-2">
                  <Button variant="outline" className="w-full border-[var(--border)]" onClick={() => toast('Composing email…')}>
                    <Mail className="w-4 h-4 mr-2" /> Email Supplier
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'purchase-orders':
        return (
          <MwDataTable<typeof supplierPOs[number]>
            columns={[
              {
                key: 'po',
                header: 'PO #',
                headerClassName: 'text-xs',
                className: 'text-xs font-medium tabular-nums',
                cell: (po) => po.poNumber,
              },
              {
                key: 'date',
                header: 'Date',
                headerClassName: 'text-xs',
                className: 'text-xs tabular-nums text-[var(--neutral-500)]',
                cell: (po) => fmtDate(po.date),
              },
              {
                key: 'delivery',
                header: 'Delivery',
                headerClassName: 'text-xs',
                className: 'text-xs tabular-nums text-[var(--neutral-500)]',
                cell: (po) => fmtDate(po.deliveryDate),
              },
              {
                key: 'status',
                header: 'Status',
                headerClassName: 'text-xs',
                cell: (po) => (
                  <StatusBadge status={po.status === 'acknowledged' ? 'approved' : po.status === 'partial' ? 'in_progress' : po.status}>
                    {po.status}
                  </StatusBadge>
                ),
              },
              {
                key: 'total',
                header: 'Total',
                headerClassName: 'text-xs text-right',
                className: 'text-xs text-right tabular-nums font-medium',
                cell: (po) => fmtCurrency(po.total),
              },
              {
                key: 'received',
                header: 'Received',
                headerClassName: 'text-xs text-right',
                className: 'text-xs text-right tabular-nums',
                cell: (po) => fmtCurrency(po.received),
              },
            ]}
            data={supplierPOs}
            keyExtractor={(po) => po.id}
            emptyState={
              <div className="text-center text-xs text-[var(--neutral-500)] py-8">
                No purchase orders found for this supplier.
              </div>
            }
          />
        );

      case 'bills':
        return (
          <MwDataTable<typeof supplierBills[number]>
            columns={[
              {
                key: 'bill',
                header: 'Bill #',
                headerClassName: 'text-xs',
                className: 'text-xs font-medium tabular-nums',
                cell: (bill) => bill.billNumber,
              },
              {
                key: 'date',
                header: 'Date',
                headerClassName: 'text-xs',
                className: 'text-xs tabular-nums text-[var(--neutral-500)]',
                cell: (bill) => fmtDate(bill.date),
              },
              {
                key: 'due',
                header: 'Due',
                headerClassName: 'text-xs',
                className: 'text-xs tabular-nums text-[var(--neutral-500)]',
                cell: (bill) => fmtDate(bill.dueDate),
              },
              {
                key: 'status',
                header: 'Status',
                headerClassName: 'text-xs',
                cell: (bill) => (
                  <StatusBadge status={bill.status === 'received' ? 'sent' : bill.status}>
                    {bill.status}
                  </StatusBadge>
                ),
              },
              {
                key: 'amount',
                header: 'Amount',
                headerClassName: 'text-xs text-right',
                className: 'text-xs text-right tabular-nums font-medium',
                cell: (bill) => fmtCurrency(bill.amount),
              },
              {
                key: 'paid',
                header: 'Paid',
                headerClassName: 'text-xs text-right',
                className: 'text-xs text-right tabular-nums',
                cell: (bill) => fmtCurrency(bill.paidAmount),
              },
            ]}
            data={supplierBills}
            keyExtractor={(bill) => bill.id}
            emptyState={
              <div className="text-center text-xs text-[var(--neutral-500)] py-8">
                No bills found for this supplier.
              </div>
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Buy', href: '/buy' },
        { label: 'Suppliers', href: '/buy/suppliers' },
        { label: isNew ? 'New' : supplier.company },
      ]}
      title={isNew ? 'New Supplier' : supplier.company}
      subtitle={
        isNew ? (
          <span className="text-sm text-[var(--neutral-500)]">
            Fill out the details below and click Save to create.
          </span>
        ) : (
          <span className="text-sm text-[var(--neutral-500)]">
            {supplier.contact} &middot; {supplier.category} &middot; {supplier.paymentTerms}
          </span>
        )
      }
      metaRow={
        isNew ? null : (
          <div className="flex items-center gap-2">
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
              {supplier.category}
            </Badge>
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
              {supplier.onTimePercent}% on-time
            </Badge>
          </div>
        )
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to="/buy/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          {isNew ? (
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={handleSave}
            >
              Save
            </Button>
          ) : (
            <>
              <Button variant="outline" className="border-[var(--border)]" onClick={() => {
                // TODO(backend): suppliers.composeEmail(supplier.id)
                toast('Composing email…');
              }}>
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
              <Button
                className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                onClick={() => navigate(`/buy/orders/new?supplierId=${supplier.id}`)}
              >
                <FileText className="mr-2 h-4 w-4" /> New PO
              </Button>
            </>
          )}
        </>
      }
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}
