/**
 * Sell Customer Portal — customer-facing portal preview.
 * Full-page component with PageShell + PageHeader.
 * Tabs: Orders, Invoices, Quotes — with quote detail drill-down.
 * Route: /sell/portal
 *
 * Uses centralized mock data filtered by a mock logged-in customer (TechCorp, cust-001).
 */

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Package, FileText, ClipboardList, Download, Eye, Check, X } from "lucide-react";
import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge, type StatusKey } from "@/components/shared/data/StatusBadge";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { toast } from "sonner";
import { quotes, salesOrders, sellInvoices } from "@/services/mock";
import { PortalQuoteDetail } from "@/components/sell/PortalQuoteDetail";
import type { Quote } from "@/types/entities";

// ── Constants ────────────────────────────────────────────────────────

const PORTAL_CUSTOMER_ID = "cust-001"; // TechCorp Industries

// ── Helpers ──────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

const orderStatusMap: Record<string, StatusKey> = {
  draft: "draft",
  confirmed: "approved",
  in_production: "in_progress",
  shipped: "shipped",
  invoiced: "completed",
  cancelled: "rejected",
};

const invoiceStatusMap: Record<string, StatusKey> = {
  draft: "draft",
  sent: "sent",
  paid: "completed",
  overdue: "overdue",
  void: "rejected",
};

const quoteStatusMap: Record<string, StatusKey> = {
  draft: "pending",
  sent: "pending",
  accepted: "approved",
  declined: "rejected",
  expired: "overdue",
  revision_requested: "pending",
};

// ── Sub-components ───────────────────────────────────────────────────

function OrdersTab() {
  const customerOrders = useMemo(
    () => salesOrders.filter((o) => o.customerId === PORTAL_CUSTOMER_ID),
    [],
  );

  return (
    <motion.div variants={staggerItem}>
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
                <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{order.date}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{order.deliveryDate}</TableCell>
                <TableCell>
                  <StatusBadge status={orderStatusMap[order.status] ?? "pending"} withDot />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(order.total)}</TableCell>
              </TableRow>
            ))}
            {customerOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-[var(--neutral-400)] py-8">
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

function InvoicesTab() {
  const customerInvoices = useMemo(
    () => sellInvoices.filter((i) => i.customerId === PORTAL_CUSTOMER_ID),
    [],
  );

  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{inv.date}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{inv.dueDate}</TableCell>
                <TableCell>
                  <StatusBadge status={invoiceStatusMap[inv.status] ?? "pending"} withDot />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(inv.amount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Viewing ${inv.invoiceNumber}`)}
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Downloading ${inv.invoiceNumber}`)}
                    >
                      <Download className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {customerInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-[var(--neutral-400)] py-8">
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

function QuotesTab({ onSelectQuote }: { onSelectQuote: (q: Quote) => void }) {
  const [localQuotes, setLocalQuotes] = useState(() =>
    quotes.filter((q) => q.customerId === PORTAL_CUSTOMER_ID),
  );

  const handleAccept = (id: string) => {
    setLocalQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "accepted" as const } : q)),
    );
    toast.success("Quote accepted");
  };

  const handleDecline = (id: string) => {
    setLocalQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "declined" as const } : q)),
    );
    toast.info("Quote declined");
  };

  return (
    <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2">
      {localQuotes.map((quote) => (
        <Card key={quote.id} variant="flat" className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground font-mono">{quote.ref}</p>
              <p className="text-xs text-[var(--neutral-500)]">
                {quote.lineItems.length} item{quote.lineItems.length !== 1 ? "s" : ""}
                {quote.revisions && quote.revisions.length > 1 && ` · v${quote.revisions.length}`}
              </p>
            </div>
            <StatusBadge status={quoteStatusMap[quote.status] ?? "pending"} withDot>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace("_", " ")}
            </StatusBadge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--neutral-500)]">Value</span>
            <span className="font-mono font-medium text-foreground">{formatCurrency(quote.value)}</span>
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
              View Details
            </Button>
            {(quote.status === "sent" || quote.status === "draft") && (
              <>
                <Button size="sm" className="flex-1" onClick={() => handleAccept(quote.id)}>
                  <Check className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(quote.id)}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </>
            )}
          </div>
        </Card>
      ))}
      {localQuotes.length === 0 && (
        <p className="text-sm text-[var(--neutral-400)] text-center col-span-2 py-8">
          No quotes yet.
        </p>
      )}
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function SellCustomerPortal() {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  if (selectedQuote) {
    return (
      <PageShell>
        <PageHeader
          title="Customer Portal"
          subtitle="TechCorp Industries"
          breadcrumbs={[
            { label: "Sell", href: "/sell" },
            { label: "Customer Portal", href: "/sell/portal" },
            { label: selectedQuote.ref },
          ]}
        />
        <PortalQuoteDetail
          quote={selectedQuote}
          onBack={() => setSelectedQuote(null)}
          onAccept={(id) => {
            toast.success("Quote accepted");
            setSelectedQuote(null);
          }}
          onDecline={(id) => {
            toast.info("Quote declined");
            setSelectedQuote(null);
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Customer Portal"
        subtitle="TechCorp Industries — Preview of customer-facing portal"
        breadcrumbs={[
          { label: "Sell", href: "/sell" },
          { label: "Customer Portal" },
        ]}
      />

      <motion.div variants={staggerItem}>
        <Tabs defaultValue="quotes">
          <TabsList>
            <TabsTrigger value="orders">
              <Package className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <FileText className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="quotes">
              <ClipboardList className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
              Quotes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="invoices" className="mt-4">
            <InvoicesTab />
          </TabsContent>
          <TabsContent value="quotes" className="mt-4">
            <QuotesTab onSelectQuote={setSelectedQuote} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageShell>
  );
}
