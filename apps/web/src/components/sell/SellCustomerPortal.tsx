/**
 * Sell Customer Portal — customer-facing dashboard preview.
 *
 * This is the preview of the view-only portal customers see after signing
 * in. It deliberately does NOT expose edit / create / delete actions for
 * records the customer doesn't own, to avoid unintentional changes
 * (mirrors Odoo / Fulcrum Pro customer-portal patterns).
 *
 * Sections (order, top to bottom):
 *   1. Hero + summary KPIs
 *   2. Shipping status — mini chart + active shipment list
 *   3. Quotes — cards with Accept / Decline (these ARE customer actions)
 *   4. Sales Orders — read-only table
 *   5. Invoices — read-only table with view + download-PDF
 *   6. Active activities feed — opt-in via Sell Settings → Portal
 *
 * Each section is independently toggleable from Sell Settings → Portal.
 * Customer is a mock "logged-in" customer (TechCorp Industries).
 *
 * Access is gated in Control via the `sell.portal.access` group flag
 * (see docs/dev/modules/sell/customer-portal.md) — the preview here is
 * rendered for Sell users so they can see what the customer sees.
 *
 * Route: /sell/portal
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  FileText,
  ClipboardList,
  Truck,
  Calendar,
  Download,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Info,
  CreditCard,
  UserCog,
  FileDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  StatusBadge,
  type StatusKey,
} from '@/components/shared/data/StatusBadge';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import {
  quotes,
  salesOrders,
  sellInvoices,
  shipments,
  sellActivities,
  customers,
  attachmentService,
  getInvoicePdf,
  getDeliveryNotePdf,
} from '@/services';
import { PortalQuoteDetail } from '@/components/sell/PortalQuoteDetail';
import type { Quote } from '@/types/entities';
import { usePortalPreferences } from '@/components/sell/portalPreferences';
import { useAuth } from '@/contexts/AuthContext';
import { PortalSubscriptionSection } from './PortalSubscriptionSection';
import { PortalProfileDrawer } from './PortalProfileDrawer';

// ── Helpers ──────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
  });
}

const orderStatusMap: Record<string, StatusKey> = {
  draft: 'draft',
  confirmed: 'approved',
  in_production: 'in_progress',
  shipped: 'shipped',
  invoiced: 'completed',
  cancelled: 'rejected',
};

const invoiceStatusMap: Record<string, StatusKey> = {
  draft: 'draft',
  sent: 'sent',
  paid: 'completed',
  overdue: 'overdue',
  void: 'rejected',
};

const quoteStatusMap: Record<string, StatusKey> = {
  draft: 'pending',
  sent: 'pending',
  accepted: 'approved',
  declined: 'rejected',
  expired: 'overdue',
  revision_requested: 'pending',
};

const shipStageMap: Record<string, StatusKey> = {
  pick: 'pending',
  pack: 'pending',
  label: 'in_progress',
  transit: 'in_progress',
  delivered: 'completed',
  exception: 'rejected',
};

// ── Hero card ────────────────────────────────────────────────────────

function HeroCard({
  customerName,
  activeOrders,
  outstandingInvoices,
  openQuotes,
  inTransitShipments,
}: {
  customerName: string;
  activeOrders: number;
  outstandingInvoices: number;
  openQuotes: number;
  inTransitShipments: number;
}) {
  const initials = customerName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <motion.div variants={staggerItem}>
      <Card
        variant="flat"
        className="relative overflow-hidden bg-[var(--mw-mirage)] text-white p-6"
      >
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-lg font-bold text-[var(--mw-mirage)]">
              {initials}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">
                Welcome back
              </p>
              <p className="text-xl font-semibold">{customerName}</p>
              <p className="text-xs text-white/60">
                Signed in to the Alliance Metal customer portal
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiTile
              icon={<Package className="h-4 w-4" strokeWidth={1.5} />}
              label="Active orders"
              value={activeOrders}
            />
            <KpiTile
              icon={<Truck className="h-4 w-4" strokeWidth={1.5} />}
              label="In transit"
              value={inTransitShipments}
            />
            <KpiTile
              icon={<ClipboardList className="h-4 w-4" strokeWidth={1.5} />}
              label="Open quotes"
              value={openQuotes}
            />
            <KpiTile
              icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}
              label="Due invoices"
              value={outstandingInvoices}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function KpiTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[var(--shape-md)] bg-white/10 px-3 py-2">
      <div className="flex items-center gap-1.5 text-white/70">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

// ── Shipping status section ──────────────────────────────────────────

function ShippingSection({
  customerId,
  allowDeliveryNoteDownload,
}: {
  customerId: string;
  allowDeliveryNoteDownload: boolean;
}) {
  const customerShipments = useMemo(
    () => shipments.filter((s) => s.customerId === customerId),
    [customerId],
  );
  const customerCompany = useMemo(
    () => customers.find((c) => c.id === customerId)?.company ?? 'Customer',
    [customerId],
  );

  const handleDownloadDeliveryNote = (
    s: (typeof customerShipments)[number],
  ) => {
    const pdf = getDeliveryNotePdf({
      shipmentId: s.id,
      shipmentNumber: s.shipmentNumber,
      orderNumber: s.orderNumber,
      carrier: s.carrier,
      trackingNumber: s.trackingNumber,
      customerCompany,
      packages: s.packages,
      weightKg: s.weight,
    });
    attachmentService.triggerDownload(pdf);
    toast.success(`Downloaded ${s.shipmentNumber} delivery note`, {
      description: pdf.filename,
    });
  };

  // Count by stage for the mini bar chart
  const stageCounts = useMemo(() => {
    const keys: Array<[string, string]> = [
      ['pick', 'Pick'],
      ['pack', 'Pack'],
      ['label', 'Label'],
      ['transit', 'Transit'],
      ['delivered', 'Delivered'],
    ];
    return keys.map(([key, label]) => ({
      key,
      label,
      count: customerShipments.filter((s) => s.stage === key).length,
    }));
  }, [customerShipments]);

  const totalShipments = customerShipments.length;

  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat" className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-yellow-50)]">
              <Truck
                className="h-5 w-5 text-[var(--mw-yellow-700)]"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Shipping status
              </p>
              <p className="text-xs text-[var(--neutral-500)]">
                {totalShipments} shipment
                {totalShipments === 1 ? '' : 's'} linked to your orders
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Mini chart */}
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageCounts}
                margin={{ top: 5, right: 5, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--neutral-500)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'var(--neutral-500)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--neutral-100)' }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stageCounts.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        entry.key === 'delivered'
                          ? 'var(--mw-success)'
                          : entry.key === 'transit'
                            ? 'var(--mw-yellow-500)'
                            : 'var(--mw-yellow-300)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Active shipments list */}
          <div className="space-y-2">
            {customerShipments.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-[var(--shape-md)] border border-[var(--border)] px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-medium text-foreground">
                      {s.shipmentNumber}
                    </p>
                    <span className="text-xs text-[var(--neutral-400)]">·</span>
                    <p className="text-xs text-[var(--neutral-500)]">
                      {s.orderNumber}
                    </p>
                  </div>
                  <p className="text-[11px] text-[var(--neutral-500)]">
                    {s.carrier}
                    {s.trackingNumber ? ` · ${s.trackingNumber}` : ''} · ETA{' '}
                    {s.estimatedDelivery}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge
                    status={shipStageMap[s.stage] ?? 'pending'}
                    withDot
                  >
                    {s.stage.charAt(0).toUpperCase() + s.stage.slice(1)}
                  </StatusBadge>
                  {allowDeliveryNoteDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleDownloadDeliveryNote(s)}
                      aria-label={`Download delivery note for ${s.shipmentNumber}`}
                    >
                      <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {customerShipments.length === 0 && (
              <p className="py-6 text-center text-xs text-[var(--neutral-400)]">
                No shipments in flight.
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Quotes section (cards, with Accept/Decline) ──────────────────────

function QuotesSection({
  customerId,
  onSelectQuote,
}: {
  customerId: string;
  onSelectQuote: (q: Quote) => void;
}) {
  const [localQuotes, setLocalQuotes] = useState(() =>
    quotes.filter((q) => q.customerId === customerId),
  );

  const handleAccept = (id: string) => {
    setLocalQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'accepted' as const } : q)),
    );
    toast.success('Quote accepted', {
      description: 'Your acceptance has been sent to your account manager.',
    });
  };

  const handleDecline = (id: string) => {
    setLocalQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'declined' as const } : q)),
    );
    toast.info('Quote declined');
  };

  return (
    <motion.div variants={staggerItem}>
      <SectionHeader
        icon={<ClipboardList className="h-5 w-5" strokeWidth={1.5} />}
        title="Your quotes"
        subtitle="Review, accept, or decline open quotes."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {localQuotes.map((quote) => (
          <Card key={quote.id} variant="flat" className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-sm font-medium text-foreground">
                  {quote.ref}
                </p>
                <p className="text-xs text-[var(--neutral-500)]">
                  {quote.lineItems.length} item
                  {quote.lineItems.length !== 1 ? 's' : ''}
                  {quote.revisions && quote.revisions.length > 1 &&
                    ` · v${quote.revisions.length}`}
                </p>
              </div>
              <StatusBadge
                status={quoteStatusMap[quote.status] ?? 'pending'}
                withDot
              >
                {quote.status.charAt(0).toUpperCase() +
                  quote.status.slice(1).replace('_', ' ')}
              </StatusBadge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--neutral-500)]">Value</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(quote.value)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--neutral-500)]">
              <span>Issued: {quote.date}</span>
              <span>Expires: {quote.expiryDate}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onSelectQuote(quote)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                View
              </Button>
              {(quote.status === 'sent' || quote.status === 'draft') && (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                    onClick={() => handleAccept(quote.id)}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(quote.id)}
                    aria-label="Decline quote"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
        {localQuotes.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[var(--neutral-400)]">
            No open quotes.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Orders section (read-only) ───────────────────────────────────────

function OrdersSection({ customerId }: { customerId: string }) {
  const customerOrders = useMemo(
    () => salesOrders.filter((o) => o.customerId === customerId),
    [customerId],
  );

  return (
    <motion.div variants={staggerItem}>
      <SectionHeader
        icon={<Package className="h-5 w-5" strokeWidth={1.5} />}
        title="Your sales orders"
        subtitle="Read-only view. Contact your account manager to request changes."
      />
      <Card variant="flat">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell className="text-[var(--neutral-600)]">
                  {order.date}
                </TableCell>
                <TableCell className="text-[var(--neutral-600)]">
                  {order.deliveryDate}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={orderStatusMap[order.status] ?? 'pending'}
                    withDot
                  />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
            {customerOrders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-[var(--neutral-400)]"
                >
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

// ── Invoices section (read-only + downloads) ─────────────────────────

function InvoicesSection({
  customerId,
  customerCompany,
  allowDownload,
  allowOnlinePayment,
}: {
  customerId: string;
  customerCompany: string;
  allowDownload: boolean;
  allowOnlinePayment: boolean;
}) {
  const customerInvoices = useMemo(
    () => sellInvoices.filter((i) => i.customerId === customerId),
    [customerId],
  );

  const handleView = (inv: (typeof customerInvoices)[number]) => {
    const pdf = getInvoicePdf({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerCompany,
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: inv.status,
    });
    attachmentService.openInNewTab(pdf);
  };

  const handleDownload = (inv: (typeof customerInvoices)[number]) => {
    const pdf = getInvoicePdf({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerCompany,
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: inv.status,
    });
    attachmentService.triggerDownload(pdf);
    toast.success(`Downloaded ${inv.invoiceNumber}`, {
      description: pdf.filename,
    });
  };

  const handlePayOnline = (inv: (typeof customerInvoices)[number]) => {
    // In production this would redirect to a Stripe Checkout / PayID handoff.
    // For now we open a mock payment page in a new tab and toast success so
    // the internal reviewer can see the flow.
    const mockUrl = `about:blank#pay/${encodeURIComponent(inv.invoiceNumber)}`;
    if (typeof window !== 'undefined') {
      window.open(mockUrl, '_blank', 'noopener,noreferrer');
    }
    toast.success(`Payment session opened for ${inv.invoiceNumber}`, {
      description: `${formatCurrency(inv.amount)} · mock handoff`,
    });
  };

  return (
    <motion.div variants={staggerItem}>
      <SectionHeader
        icon={<FileText className="h-5 w-5" strokeWidth={1.5} />}
        title="Your invoices"
        subtitle="Download a copy, pay online, or review what's outstanding."
      />
      <Card variant="flat">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerInvoices.map((inv) => {
              const unpaid =
                inv.status === 'sent' || inv.status === 'overdue';
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-[var(--neutral-600)]">
                    {inv.date}
                  </TableCell>
                  <TableCell className="text-[var(--neutral-600)]">
                    {inv.dueDate}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={invoiceStatusMap[inv.status] ?? 'pending'}
                      withDot
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(inv)}
                        aria-label={`View ${inv.invoiceNumber}`}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      {allowDownload && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(inv)}
                          aria-label={`Download ${inv.invoiceNumber}`}
                        >
                          <Download className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      )}
                      {allowOnlinePayment && unpaid && (
                        <Button
                          size="sm"
                          className="ml-1 h-8 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                          onClick={() => handlePayOnline(inv)}
                        >
                          <CreditCard
                            className="mr-1 h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                          Pay
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {customerInvoices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-[var(--neutral-400)]"
                >
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

// ── Activities feed (opt-in via settings) ────────────────────────────

function ActivitiesFeed({ customerId }: { customerId: string }) {
  const customerActivities = useMemo(
    () =>
      sellActivities
        .filter((a) => a.customerId === customerId)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [customerId],
  );

  const iconFor = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" strokeWidth={1.5} />;
      case 'call':
        return <Phone className="h-4 w-4" strokeWidth={1.5} />;
      case 'meeting':
        return <Calendar className="h-4 w-4" strokeWidth={1.5} />;
      default:
        return <MessageSquare className="h-4 w-4" strokeWidth={1.5} />;
    }
  };

  return (
    <motion.div variants={staggerItem}>
      <SectionHeader
        icon={<MessageSquare className="h-5 w-5" strokeWidth={1.5} />}
        title="Activity feed"
        subtitle="Recent interactions with your account team."
      />
      <Card variant="flat" className="p-0">
        <ul className="divide-y divide-[var(--neutral-100)]">
          {customerActivities.slice(0, 6).map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 px-4 py-3 text-sm"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-700)]">
                {iconFor(a.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-foreground">{a.description}</p>
                <p className="text-xs text-[var(--neutral-500)]">
                  {a.opportunityTitle} ·{' '}
                  {new Date(a.dueDate).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] font-medium uppercase"
              >
                {a.status}
              </Badge>
            </li>
          ))}
          {customerActivities.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--neutral-400)]">
              No recent activity.
            </li>
          )}
        </ul>
      </Card>
    </motion.div>
  );
}

// ── Small bits ──────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)] text-[var(--neutral-700)]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-[var(--neutral-500)]">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewBanner({
  isInternal,
  customerId,
  onChangeCustomer,
}: {
  isInternal: boolean;
  customerId: string;
  onChangeCustomer: (id: string) => void;
}) {
  // A real customer-side login wouldn't see this banner at all.
  if (!isInternal) return null;

  return (
    <motion.div variants={staggerItem}>
      <div className="flex items-start gap-3 rounded-[var(--shape-md)] border border-[var(--mw-yellow-300)] bg-[var(--mw-yellow-50)] px-4 py-3 text-sm">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-yellow-700)]"
          strokeWidth={1.5}
        />
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-[var(--mw-yellow-900)] dark:text-[var(--mw-yellow-100)]">
              Portal preview
            </p>
            <p className="text-xs text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
              You're viewing the portal as your customer would see it.
              Configure which sections appear in{' '}
              <a
                href="/sell/settings"
                className="inline-flex items-center gap-1 font-medium text-[var(--mw-yellow-800)] underline-offset-2 hover:underline dark:text-[var(--mw-yellow-200)]"
              >
                Sell → Settings → Portal
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
              .
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-[var(--neutral-600)]">
              Viewing as
            </span>
            <Select value={customerId} onValueChange={onChangeCustomer}>
              <SelectTrigger className="h-8 w-[220px] border-[var(--mw-yellow-300)] bg-white text-xs">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function SellCustomerPortal() {
  const { viewingCustomerId, setViewingCustomerId, identity, hasPermission } =
    useAuth();
  const [prefs] = usePortalPreferences(viewingCustomerId);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const customer = customers.find((c) => c.id === viewingCustomerId);
  const customerName = customer?.company ?? 'Customer';

  const isInternalPreview = identity.kind === 'internal';
  const canViewSubscription = hasPermission('portal.subscriptions.view');

  // Summary counts (recompute when the viewed customer changes)
  const activeOrders = useMemo(
    () =>
      salesOrders.filter(
        (o) =>
          o.customerId === viewingCustomerId &&
          o.status !== 'cancelled' &&
          o.status !== 'invoiced',
      ).length,
    [viewingCustomerId],
  );
  const outstandingInvoices = useMemo(
    () =>
      sellInvoices.filter(
        (i) =>
          i.customerId === viewingCustomerId &&
          (i.status === 'sent' || i.status === 'overdue'),
      ).length,
    [viewingCustomerId],
  );
  const openQuotes = useMemo(
    () =>
      quotes.filter(
        (q) =>
          q.customerId === viewingCustomerId &&
          (q.status === 'sent' || q.status === 'draft'),
      ).length,
    [viewingCustomerId],
  );
  const inTransitShipments = useMemo(
    () =>
      shipments.filter(
        (s) =>
          s.customerId === viewingCustomerId &&
          (s.stage === 'transit' || s.stage === 'pack' || s.stage === 'pick'),
      ).length,
    [viewingCustomerId],
  );

  if (selectedQuote) {
    return (
      <PageShell>
        <PageHeader
          title="Customer Portal"
          subtitle={customerName}
          breadcrumbs={[
            { label: 'Sell', href: '/sell' },
            { label: 'Customer Portal', href: '/sell/portal' },
            { label: selectedQuote.ref },
          ]}
        />
        <PortalQuoteDetail
          quote={selectedQuote}
          onBack={() => setSelectedQuote(null)}
          onAccept={() => {
            toast.success('Quote accepted');
            setSelectedQuote(null);
          }}
          onDecline={() => {
            toast.info('Quote declined');
            setSelectedQuote(null);
          }}
        />
      </PageShell>
    );
  }

  const headerActions = prefs.allowProfileEdit && (
    <Button
      variant="outline"
      size="sm"
      className="h-9 border-[var(--border)]"
      onClick={() => setProfileOpen(true)}
    >
      <UserCog className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
      Profile & address
    </Button>
  );

  return (
    <PageShell>
      <PageHeader
        title="Customer Portal"
        subtitle="Read-only dashboard for your customer — shows quotes, orders, invoices and shipping status."
        breadcrumbs={[
          { label: 'Sell', href: '/sell' },
          { label: 'Customer Portal' },
        ]}
        actions={headerActions}
      />

      <PreviewBanner
        isInternal={isInternalPreview}
        customerId={viewingCustomerId}
        onChangeCustomer={setViewingCustomerId}
      />

      <HeroCard
        customerName={customerName}
        activeOrders={activeOrders}
        outstandingInvoices={outstandingInvoices}
        openQuotes={openQuotes}
        inTransitShipments={inTransitShipments}
      />

      {prefs.showShipping && (
        <ShippingSection
          customerId={viewingCustomerId}
          allowDeliveryNoteDownload={prefs.allowDeliveryNoteDownload}
        />
      )}

      {prefs.showQuotes && (
        <QuotesSection
          customerId={viewingCustomerId}
          onSelectQuote={setSelectedQuote}
        />
      )}

      <OrdersSection customerId={viewingCustomerId} />

      <InvoicesSection
        customerId={viewingCustomerId}
        customerCompany={customerName}
        allowDownload={prefs.allowInvoiceDownload}
        allowOnlinePayment={prefs.allowOnlinePayment}
      />

      {canViewSubscription && (
        <PortalSubscriptionSection
          customerId={viewingCustomerId}
          showUsage={prefs.showSubscriptionUsage}
          openOrdersCount={activeOrders}
          outstandingInvoicesCount={outstandingInvoices}
        />
      )}

      {prefs.showActivities && (
        <ActivitiesFeed customerId={viewingCustomerId} />
      )}

      {prefs.allowProfileEdit && (
        <PortalProfileDrawer
          open={profileOpen}
          onOpenChange={setProfileOpen}
          customerId={viewingCustomerId}
        />
      )}
    </PageShell>
  );
}
