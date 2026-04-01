/**
 * Sell Invoice Detail — full-page workspace using shared JobWorkspaceLayout.
 * Invoices list navigates here via /sell/invoices/:id
 */

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  DollarSign,
  Download,
  Mail,
  Plus,
  Send,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from "@/components/shared/layout/JobWorkspaceLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/components/ui/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Partially Paid";

interface SellInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  poReference: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
}

interface InvoiceLineItem {
  id: string;
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
  tax: string;
  total: number;
}

interface PaymentEvent {
  id: string;
  icon: "created" | "sent" | "viewed" | "payment" | "reminder";
  title: string;
  description?: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_INVOICES: Record<string, SellInvoice> = {
  "1": {
    id: "1",
    invoiceNumber: "INV-2026-001",
    customer: "TechCorp Industries",
    issueDate: "2026-03-15",
    dueDate: "2026-04-14",
    poReference: "PO-TC-2026-0441",
    status: "Sent",
    subtotal: 22272.73,
    taxRate: 10,
    tax: 2227.27,
    total: 24500,
    amountPaid: 0,
    balanceDue: 24500,
    notes: "Please reference INV-2026-001 on all remittances. Payment via EFT preferred.",
  },
  "2": {
    id: "2",
    invoiceNumber: "INV-2026-0233",
    customer: "Pacific Fabrication",
    issueDate: "2026-03-12",
    dueDate: "2026-04-11",
    poReference: "PO-PF-2026-088",
    status: "Paid",
    subtotal: 7727.27,
    taxRate: 10,
    tax: 772.73,
    total: 8500,
    amountPaid: 8500,
    balanceDue: 0,
    notes: "Paid in full. Thank you.",
  },
  "3": {
    id: "3",
    invoiceNumber: "INV-2026-0232",
    customer: "Sydney Rail Corp",
    issueDate: "2026-03-08",
    dueDate: "2026-04-07",
    poReference: "PO-SRC-2026-112",
    status: "Sent",
    subtotal: 60909.09,
    taxRate: 10,
    tax: 6090.91,
    total: 67000,
    amountPaid: 0,
    balanceDue: 67000,
    notes: "Net 60 terms apply.",
  },
  "4": {
    id: "4",
    invoiceNumber: "INV-2026-0231",
    customer: "Hunter Steel Co",
    issueDate: "2026-03-05",
    dueDate: "2026-04-04",
    poReference: "PO-HSC-2026-055",
    status: "Paid",
    subtotal: 20000,
    taxRate: 10,
    tax: 2000,
    total: 22000,
    amountPaid: 22000,
    balanceDue: 0,
    notes: "Paid in full.",
  },
  "5": {
    id: "5",
    invoiceNumber: "INV-2026-0230",
    customer: "BHP Contractors",
    issueDate: "2026-02-28",
    dueDate: "2026-03-30",
    poReference: "PO-BHP-2026-200",
    status: "Overdue",
    subtotal: 116363.64,
    taxRate: 10,
    tax: 11636.36,
    total: 128000,
    amountPaid: 0,
    balanceDue: 128000,
    notes: "Payment overdue. Follow up required.",
  },
  "6": {
    id: "6",
    invoiceNumber: "INV-2026-0229",
    customer: "Kemppi Australia",
    issueDate: "2026-02-25",
    dueDate: "2026-03-25",
    poReference: "PO-KA-2026-031",
    status: "Overdue",
    subtotal: 10909.09,
    taxRate: 10,
    tax: 1090.91,
    total: 12000,
    amountPaid: 0,
    balanceDue: 12000,
    notes: "Second reminder sent.",
  },
  "7": {
    id: "7",
    invoiceNumber: "INV-2026-DRAFT-01",
    customer: "TechCorp Industries",
    issueDate: "2026-03-19",
    dueDate: "2026-04-18",
    poReference: "PO-TC-2026-0445",
    status: "Draft",
    subtotal: 14090.91,
    taxRate: 10,
    tax: 1409.09,
    total: 15500,
    amountPaid: 0,
    balanceDue: 15500,
    notes: "Draft — awaiting approval.",
  },
  "8": {
    id: "8",
    invoiceNumber: "INV-2026-DRAFT-02",
    customer: "TechCorp Industries",
    issueDate: "2026-04-01",
    dueDate: "2026-05-01",
    poReference: "—",
    status: "Draft",
    subtotal: 0,
    taxRate: 10,
    tax: 0,
    total: 0,
    amountPaid: 0,
    balanceDue: 0,
    notes: "New draft from Sell — complete line items in Book if needed.",
  },
  "9": {
    id: "9",
    invoiceNumber: "INV-2026-0235",
    customer: "TechCorp Industries",
    issueDate: "2026-04-01",
    dueDate: "2026-05-01",
    poReference: "PO-TC-2026-0500",
    status: "Sent",
    subtotal: 18181.82,
    taxRate: 10,
    tax: 1818.18,
    total: 20000,
    amountPaid: 0,
    balanceDue: 20000,
    notes: "Issued from New Invoice flow — net 30 terms.",
  },
};

const MOCK_LINE_ITEMS: InvoiceLineItem[] = [
  { id: "li-1", item: "PROD-SR-001", description: "Server rack frame — powder coated", qty: 2, unitPrice: 5120, tax: "GST 10%", total: 11264 },
  { id: "li-2", item: "PROD-SR-002", description: "Side panel — 1.6 mm galv steel", qty: 4, unitPrice: 980, tax: "GST 10%", total: 4312 },
  { id: "li-3", item: "LABOUR-FAB", description: "Fabrication labour (hrs)", qty: 32, unitPrice: 140, tax: "GST 10%", total: 4928 },
  { id: "li-4", item: "MAT-HDWR-010", description: "M8 cage nuts & bolts kit", qty: 8, unitPrice: 38, tax: "GST 10%", total: 333.76 },
];

const MOCK_PAYMENT_HISTORY: PaymentEvent[] = [
  { id: "evt-1", icon: "created", title: "Invoice created by Matt", description: "INV-2026-001 generated from SO-0001", timestamp: "15 Mar 2026, 9:15 AM" },
  { id: "evt-2", icon: "sent", title: "Invoice sent to accounts@techcorp.com.au", timestamp: "15 Mar 2026, 9:22 AM" },
  { id: "evt-3", icon: "viewed", title: "Email opened by recipient", timestamp: "15 Mar 2026, 10:45 AM" },
  { id: "evt-4", icon: "reminder", title: "Payment reminder scheduled", description: "Auto-reminder set for 7 Apr 2026", timestamp: "15 Mar 2026, 9:22 AM" },
  { id: "evt-5", icon: "payment", title: "Partial payment received", description: "$12,250.00 via EFT — Ref: TFR-20260328-001", timestamp: "28 Mar 2026, 2:10 PM" },
];

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  Draft: "border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]",
  Sent: "border-0 bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
  "Partially Paid": "border-0 bg-[var(--mw-yellow-400)]/25 text-[var(--neutral-900)]",
  Paid: "border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
  Overdue: "border-0 bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
};

const EVENT_ICON: Record<PaymentEvent["icon"], React.ReactNode> = {
  created: <FileText className="h-4 w-4 text-[var(--neutral-500)]" />,
  sent: <Send className="h-4 w-4 text-[var(--mw-info)]" />,
  viewed: <Eye className="h-4 w-4 text-[var(--neutral-600)]" />,
  payment: <DollarSign className="h-4 w-4 text-[var(--mw-success)]" />,
  reminder: <Clock className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
};

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "line-items", label: "Line Items" },
  { id: "payment-history", label: "Payment History" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SellInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const invoice = id ? MOCK_INVOICES[id] : undefined;

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === "line-items") return { ...t, count: MOCK_LINE_ITEMS.length };
      if (t.id === "payment-history") return { ...t, count: MOCK_PAYMENT_HISTORY.length };
      return { ...t };
    });
  }, []);

  if (!invoice) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/sell/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Invoice not found. Open one from the invoices list.
        </p>
      </div>
    );
  }

  const fmt = (v: number) =>
    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      /* ============================================================ */
      /*  OVERVIEW                                                     */
      /* ============================================================ */
      case "overview":
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Invoice details card */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-1 text-base font-medium text-[var(--neutral-900)]">
                  Invoice details
                </h2>
                <p className="mb-6 text-xs text-[var(--neutral-500)]">
                  Key information for this invoice
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Invoice number</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={invoice.invoiceNumber} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Status</Label>
                    <div className="mt-1 flex h-12 items-center">
                      <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[invoice.status])}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Customer</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={invoice.customer} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">PO reference</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={invoice.poReference} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Issue date</Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={new Date(invoice.issueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Due date</Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={new Date(invoice.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    />
                  </div>
                </div>
              </Card>

              {/* Notes card */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-1 text-base font-medium text-[var(--neutral-900)]">Notes</h2>
                <p className="mb-4 text-xs text-[var(--neutral-500)]">Internal notes and payment instructions</p>
                <div className="rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-100)] p-4 text-sm text-[var(--neutral-700)]">
                  {invoice.notes}
                </div>
              </Card>
            </div>

            {/* Right column (sticky) */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Amounts card */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-4 text-base font-medium text-[var(--neutral-900)]">Amounts</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Subtotal</dt>
                    <dd className="font-medium tabular-nums text-[var(--neutral-900)]">{fmt(invoice.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Tax ({invoice.taxRate}% GST)</dt>
                    <dd className="font-medium tabular-nums text-[var(--neutral-900)]">{fmt(invoice.tax)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-3">
                    <dt className="font-medium text-[var(--neutral-900)]">Total</dt>
                    <dd className="font-semibold tabular-nums text-[var(--neutral-900)]">{fmt(invoice.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Amount paid</dt>
                    <dd className="font-medium tabular-nums text-[var(--mw-success)]">{fmt(invoice.amountPaid)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Balance due</dt>
                    <dd className={cn("font-medium tabular-nums", invoice.balanceDue > 0 ? "text-[var(--mw-error)]" : "text-[var(--neutral-900)]")}>
                      {fmt(invoice.balanceDue)}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Quick line items summary */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-[var(--neutral-900)]">Line items</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-[var(--neutral-500)]"
                    onClick={() => setActiveTab("line-items")}
                  >
                    View all
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Item</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">Qty</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_LINE_ITEMS.slice(0, 3).map((li) => (
                      <TableRow key={li.id} className="min-h-14">
                        <TableCell className="text-sm">{li.item}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{li.qty}</TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">{fmt(li.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        );

      /* ============================================================ */
      /*  LINE ITEMS                                                   */
      /* ============================================================ */
      case "line-items":
        return (
          <Card className="border border-[var(--neutral-200)] bg-white shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-[var(--neutral-900)]">
                Line items
              </h2>
              <Button className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] h-12" onClick={() => toast('Add line item coming soon')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--neutral-100)] hover:bg-[var(--neutral-100)]">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Item</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Qty</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Unit Price</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tax</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LINE_ITEMS.map((li) => (
                  <TableRow key={li.id} className="min-h-14">
                    <TableCell className="text-sm font-medium tabular-nums">{li.item}</TableCell>
                    <TableCell className="text-sm text-[var(--neutral-600)]">{li.description}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{li.qty}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{fmt(li.unitPrice)}</TableCell>
                    <TableCell className="text-xs text-[var(--neutral-500)]">{li.tax}</TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">{fmt(li.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals row */}
            <div className="border-t border-[var(--border)] px-6 py-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Subtotal</span>
                    <span className="font-medium tabular-nums">{fmt(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">GST ({invoice.taxRate}%)</span>
                    <span className="font-medium tabular-nums">{fmt(invoice.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2">
                    <span className="font-medium text-[var(--neutral-900)]">Total</span>
                    <span className="text-lg font-bold tabular-nums">{fmt(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      /* ============================================================ */
      /*  PAYMENT HISTORY                                              */
      /* ============================================================ */
      case "payment-history":
        return (
          <div className="space-y-6">
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-[var(--neutral-900)]">Payment history</h2>
                  <p className="text-xs text-[var(--neutral-500)]">Timeline of invoice events and payments</p>
                </div>
                <Button className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] h-12" onClick={() => toast('Record payment coming soon')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </div>

              {/* Timeline */}
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[var(--neutral-200)]" />
                {MOCK_PAYMENT_HISTORY.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-4 relative">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[var(--neutral-100)] z-10">
                      {EVENT_ICON[evt.icon]}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-medium text-[var(--neutral-900)]">{evt.title}</p>
                      {evt.description && (
                        <p className="text-xs text-[var(--neutral-600)] mt-0.5">{evt.description}</p>
                      )}
                      <p className="text-xs text-[var(--neutral-500)] mt-1">{evt.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment summary card */}
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-4 text-base font-medium text-[var(--neutral-900)]">Payment summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--neutral-500)]">Invoice total</dt>
                  <dd className="font-medium tabular-nums text-[var(--neutral-900)]">{fmt(invoice.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--neutral-500)]">Total paid</dt>
                  <dd className="font-medium tabular-nums text-[var(--mw-success)]">{fmt(invoice.amountPaid)}</dd>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-3">
                  <dt className="font-medium text-[var(--neutral-900)]">Outstanding</dt>
                  <dd className={cn("font-semibold tabular-nums", invoice.balanceDue > 0 ? "text-[var(--mw-error)]" : "text-[var(--mw-success)]")}>
                    {fmt(invoice.balanceDue)}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: "Sell", href: "/sell" },
        { label: "Invoices", href: "/sell/invoices" },
        { label: invoice.invoiceNumber },
      ]}
      title={`Invoice ${invoice.invoiceNumber}`}
      subtitle={`${invoice.customer} \u00b7 ${fmt(invoice.total)} \u00b7 Due ${new Date(invoice.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`}
      metaRow={
        <>
          <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[invoice.status])}>
            {invoice.status}
          </Badge>
          <Badge variant="outline" className="rounded-full border-[var(--border)] tabular-nums">
            {invoice.poReference}
          </Badge>
        </>
      }
      headerActions={
        <>
          <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => navigate("/sell/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => toast.success('Invoice sent')}>
            <Mail className="mr-2 h-4 w-4" />
            Send Invoice
          </Button>
          <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => toast.success('Downloading PDF\u2026')}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button className="h-12 bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]" onClick={() => toast('Record payment coming soon')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
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
