/**
 * BuySupplierDetail — Full-page supplier detail using JobWorkspaceLayout.
 * Route: /buy/suppliers/:id
 */

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import { suppliers, purchaseOrders, bills } from '@/services/mock';

/* ------------------------------------------------------------------ */
/*  Build lookup from centralised data                                */
/* ------------------------------------------------------------------ */

const SUP_BY_ID = Object.fromEntries(suppliers.map((s) => [s.id, s]));

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
  const [activeTab, setActiveTab] = useState('overview');

  const supplier = id ? SUP_BY_ID[id] : undefined;

  const supplierPOs = useMemo(
    () => (supplier ? purchaseOrders.filter((po) => po.supplierId === supplier.id) : []),
    [supplier],
  );

  const supplierBills = useMemo(
    () => (supplier ? bills.filter((b) => b.supplierId === supplier.id) : []),
    [supplier],
  );

  const totalSpend = supplierPOs.reduce((s, po) => s + po.total, 0);

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
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">PO #</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Delivery</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierPOs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-[var(--neutral-500)] py-8">
                      No purchase orders found for this supplier.
                    </TableCell>
                  </TableRow>
                )}
                {supplierPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="text-xs font-medium tabular-nums">{po.poNumber}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[var(--neutral-500)]">{fmtDate(po.date)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[var(--neutral-500)]">{fmtDate(po.deliveryDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={po.status === 'acknowledged' ? 'approved' : po.status === 'partial' ? 'in_progress' : po.status}>
                        {po.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums font-medium">{fmtCurrency(po.total)}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{fmtCurrency(po.received)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        );

      case 'bills':
        return (
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Bill #</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Due</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierBills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-[var(--neutral-500)] py-8">
                      No bills found for this supplier.
                    </TableCell>
                  </TableRow>
                )}
                {supplierBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="text-xs font-medium tabular-nums">{bill.billNumber}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[var(--neutral-500)]">{fmtDate(bill.date)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[var(--neutral-500)]">{fmtDate(bill.dueDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={bill.status === 'received' ? 'sent' : bill.status}>
                        {bill.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums font-medium">{fmtCurrency(bill.amount)}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{fmtCurrency(bill.paidAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
        { label: supplier.company },
      ]}
      title={supplier.company}
      subtitle={
        <span className="text-sm text-[var(--neutral-500)]">
          {supplier.contact} &middot; {supplier.category} &middot; {supplier.paymentTerms}
        </span>
      }
      metaRow={
        <div className="flex items-center gap-2">
          <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
            {supplier.category}
          </Badge>
          <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
            {supplier.onTimePercent}% on-time
          </Badge>
        </div>
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to="/buy/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button variant="outline" className="border-[var(--border)]" onClick={() => toast('Composing email…')}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={() => toast.success('New PO created')}
          >
            <FileText className="mr-2 h-4 w-4" /> New PO
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
