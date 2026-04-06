/**
 * Sell Customer Portal — mock customer-facing portal preview.
 * Full-page component with PageShell + PageHeader.
 * Tabs: Orders, Invoices, Quotes.
 * Route: /sell/portal
 */

import { useState } from "react";
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

// ── Mock portal data ──────────────────────────────────────────────────

interface PortalOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: StatusKey;
  total: number;
  items: number;
}

interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: StatusKey;
  amount: number;
}

interface PortalQuote {
  id: string;
  ref: string;
  date: string;
  expiryDate: string;
  value: number;
  status: "pending" | "accepted" | "declined";
  description: string;
}

const portalOrders: PortalOrder[] = [
  { id: "po-001", orderNumber: "SO-2024-0089", date: "2024-03-15", status: "shipped", total: 24500, items: 3 },
  { id: "po-002", orderNumber: "SO-2024-0076", date: "2024-03-08", status: "in_progress", total: 18200, items: 2 },
  { id: "po-003", orderNumber: "SO-2024-0065", date: "2024-02-28", status: "completed", total: 31400, items: 5 },
  { id: "po-004", orderNumber: "SO-2024-0052", date: "2024-02-15", status: "completed", total: 12800, items: 1 },
  { id: "po-005", orderNumber: "SO-2024-0041", date: "2024-02-01", status: "completed", total: 45600, items: 4 },
];

const portalInvoices: PortalInvoice[] = [
  { id: "pi-001", invoiceNumber: "INV-2024-0134", date: "2024-03-18", dueDate: "2024-04-17", status: "sent", amount: 24500 },
  { id: "pi-002", invoiceNumber: "INV-2024-0121", date: "2024-03-05", dueDate: "2024-04-04", status: "overdue", amount: 18200 },
  { id: "pi-003", invoiceNumber: "INV-2024-0108", date: "2024-02-28", dueDate: "2024-03-29", status: "paid", amount: 31400 },
  { id: "pi-004", invoiceNumber: "INV-2024-0095", date: "2024-02-15", dueDate: "2024-03-16", status: "paid", amount: 12800 },
];

const portalQuotes: PortalQuote[] = [
  { id: "pq-001", ref: "QTE-2024-0042", date: "2024-03-20", expiryDate: "2024-04-19", value: 28900, status: "pending", description: "Structural steel frames x 4 — warehouse fit-out" },
  { id: "pq-002", ref: "QTE-2024-0038", date: "2024-03-12", expiryDate: "2024-04-11", value: 15400, status: "pending", description: "Custom bracket assemblies — mining conveyor upgrade" },
  { id: "pq-003", ref: "QTE-2024-0029", date: "2024-02-25", expiryDate: "2024-03-26", value: 42000, status: "accepted", description: "Platform grating panels — commercial kitchen" },
  { id: "pq-004", ref: "QTE-2024-0021", date: "2024-02-10", expiryDate: "2024-03-11", value: 8600, status: "declined", description: "Sheet metal enclosures x 10 — electrical cabinets" },
];

// ── Sub-components ────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function OrdersTab() {
  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portalOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{order.date}</TableCell>
                <TableCell className="font-mono">{order.items}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} withDot />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(order.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

function InvoicesTab() {
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
            {portalInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{inv.date}</TableCell>
                <TableCell className="text-[var(--neutral-600)]">{inv.dueDate}</TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} withDot />
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
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

function QuotesTab() {
  const [quotes, setQuotes] = useState(portalQuotes);

  const handleAccept = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "accepted" as const } : q)),
    );
    toast.success("Quote accepted");
  };

  const handleDecline = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "declined" as const } : q)),
    );
    toast.info("Quote declined");
  };

  const quoteStatusMap: Record<PortalQuote["status"], StatusKey> = {
    pending: "pending",
    accepted: "approved",
    declined: "rejected",
  };

  return (
    <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2">
      {quotes.map((quote) => (
        <Card key={quote.id} variant="flat" className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground font-mono">{quote.ref}</p>
              <p className="text-xs text-[var(--neutral-500)]">{quote.description}</p>
            </div>
            <StatusBadge status={quoteStatusMap[quote.status]} withDot>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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

          {quote.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1" onClick={() => handleAccept(quote.id)}>
                <Check className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleDecline(quote.id)}
              >
                <X className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                Decline
              </Button>
            </div>
          )}
        </Card>
      ))}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function SellCustomerPortal() {
  return (
    <PageShell>
      <PageHeader
        title="Customer Portal"
        subtitle="Preview of your customer-facing portal"
        breadcrumbs={[
          { label: "Sell", href: "/sell" },
          { label: "Customer Portal" },
        ]}
      />

      <motion.div variants={staggerItem}>
        <Tabs defaultValue="orders">
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
            <QuotesTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageShell>
  );
}
