/**
 * Buy Order Detail — full-page purchase order workspace using shared JobWorkspaceLayout.
 * Route: /buy/orders/:id
 */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  FileText,
  Package,
  Printer,
  Truck,
} from "lucide-react";
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from "@/components/shared/layout/JobWorkspaceLayout";
import { AIInsightCard } from "@/components/shared/ai/AIInsightCard";
import { StatusBadge } from "@/components/shared/data/StatusBadge";
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
import { purchaseOrders } from "@/services/mock";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type POStatus = "draft" | "sent" | "acknowledged" | "partial" | "received" | "cancelled";

interface PODetail {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDate: string;
  receivedDate?: string;
  status: POStatus;
  total: number;
  received: number;
  jobId?: string;
  currency: string;
  paymentTerms: string;
  shippingMethod: string;
  trackingNumber?: string;
  carrier?: string;
  subtotal: number;
  tax: number;
  notes: string;
}

interface POLineItem {
  id: string;
  product: string;
  description: string;
  qtyOrdered: number;
  qtyReceived: number;
  unitPrice: number;
  total: number;
  status: string;
}

interface ActivityEvent {
  id: string;
  date: string;
  action: string;
  user: string;
}

interface RelatedDoc {
  id: string;
  type: string;
  reference: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const PO_DETAILS: Record<string, PODetail> = Object.fromEntries(
  purchaseOrders.map((po) => [
    po.id,
    {
      ...po,
      receivedDate: po.status === "received" ? "2026-03-20" : undefined,
      currency: "AUD",
      paymentTerms: po.status === "draft" ? "Net 14" : "Net 30",
      shippingMethod: "Standard Freight",
      trackingNumber:
        po.status === "received"
          ? "TRK-20260320-087"
          : po.status === "partial"
            ? "TRK-20260318-042"
            : undefined,
      carrier:
        po.status === "received" || po.status === "partial"
          ? "StarTrack"
          : undefined,
      subtotal: Math.round(po.total / 1.1),
      tax: po.total - Math.round(po.total / 1.1),
      notes:
        po.status === "draft"
          ? "Awaiting approval before sending to supplier."
          : "Please deliver to warehouse dock B during business hours.",
    },
  ]),
);

const MOCK_LINE_ITEMS: Record<string, POLineItem[]> = {
  "po-001": [
    { id: "li-1", product: "PLT-042", description: "Base Plate 200x200 -- Stainless 304", qtyOrdered: 20, qtyReceived: 0, unitPrice: 67.0, total: 1340, status: "Pending" },
    { id: "li-2", product: "BKT-001", description: "Mounting Bracket 90deg -- Mild Steel", qtyOrdered: 100, qtyReceived: 0, unitPrice: 24.5, total: 2450, status: "Pending" },
    { id: "li-3", product: "CTR-008", description: "Cable Tray Support 600mm", qtyOrdered: 50, qtyReceived: 0, unitPrice: 38.0, total: 1900, status: "Pending" },
    { id: "li-4", product: "HSG-015", description: "Motor Housing Assembly", qtyOrdered: 10, qtyReceived: 0, unitPrice: 185.0, total: 1850, status: "Pending" },
    { id: "li-5", product: "MGD-020", description: "Machine Guard Assembly -- CNC", qtyOrdered: 15, qtyReceived: 0, unitPrice: 320.0, total: 4800, status: "Pending" },
  ],
  "po-002": [
    { id: "li-1", product: "SSP-200", description: "Structural Steel Package -- I-Beam Assembly", qtyOrdered: 4, qtyReceived: 2, unitPrice: 4500.0, total: 18000, status: "Partial" },
    { id: "li-2", product: "BKT-001", description: "Mounting Bracket 90deg -- Mild Steel", qtyOrdered: 50, qtyReceived: 50, unitPrice: 24.5, total: 1225, status: "Received" },
    { id: "li-3", product: "PLT-042", description: "Base Plate 200x200 -- Stainless 304", qtyOrdered: 10, qtyReceived: 0, unitPrice: 67.0, total: 670, status: "Pending" },
  ],
  "po-003": [
    { id: "li-1", product: "CTR-008", description: "Cable Tray Support 600mm", qtyOrdered: 40, qtyReceived: 40, unitPrice: 38.0, total: 1520, status: "Received" },
    { id: "li-2", product: "BKT-001", description: "Mounting Bracket 90deg -- Mild Steel", qtyOrdered: 60, qtyReceived: 60, unitPrice: 24.5, total: 1470, status: "Received" },
  ],
  "po-004": [
    { id: "li-1", product: "SSP-200", description: "Structural Steel Package -- I-Beam Assembly", qtyOrdered: 6, qtyReceived: 0, unitPrice: 4500.0, total: 27000, status: "Pending" },
    { id: "li-2", product: "RPC-010", description: "Rail Platform Component -- Handrail Section", qtyOrdered: 2, qtyReceived: 0, unitPrice: 890.0, total: 1780, status: "Pending" },
  ],
  "po-005": [
    { id: "li-1", product: "BKT-001", description: "Mounting Bracket 90deg -- Mild Steel", qtyOrdered: 100, qtyReceived: 0, unitPrice: 24.5, total: 2450, status: "Draft" },
    { id: "li-2", product: "CTR-008", description: "Cable Tray Support 600mm", qtyOrdered: 30, qtyReceived: 0, unitPrice: 38.0, total: 1140, status: "Draft" },
  ],
};

const MOCK_ACTIVITIES: Record<string, ActivityEvent[]> = {
  "po-001": [
    { id: "act-1", date: "2026-03-15", action: "Purchase order created", user: "Priya Sharma" },
    { id: "act-2", date: "2026-03-15", action: "Sent to Hunter Steel Co", user: "Priya Sharma" },
    { id: "act-3", date: "2026-03-16", action: "Acknowledged by supplier", user: "System" },
  ],
  "po-002": [
    { id: "act-1", date: "2026-03-12", action: "Purchase order created", user: "Mike Thompson" },
    { id: "act-2", date: "2026-03-12", action: "Sent to Pacific Metals", user: "Mike Thompson" },
    { id: "act-3", date: "2026-03-13", action: "Acknowledged by supplier", user: "System" },
    { id: "act-4", date: "2026-03-18", action: "Partial shipment dispatched", user: "System" },
    { id: "act-5", date: "2026-03-22", action: "Partial receipt recorded (GR-2026-0035)", user: "Warehouse" },
  ],
  "po-003": [
    { id: "act-1", date: "2026-03-10", action: "Purchase order created", user: "Priya Sharma" },
    { id: "act-2", date: "2026-03-10", action: "Sent to Sydney Welding Supply", user: "Priya Sharma" },
    { id: "act-3", date: "2026-03-12", action: "Acknowledged by supplier", user: "System" },
    { id: "act-4", date: "2026-03-18", action: "Shipment dispatched (TRK-20260320-087)", user: "System" },
    { id: "act-5", date: "2026-03-20", action: "Goods received in full (GR-2026-0034)", user: "Warehouse" },
  ],
  "po-004": [
    { id: "act-1", date: "2026-03-08", action: "Purchase order created", user: "Mike Thompson" },
    { id: "act-2", date: "2026-03-08", action: "Sent to BHP Suppliers", user: "Mike Thompson" },
  ],
  "po-005": [
    { id: "act-1", date: "2026-03-19", action: "Draft purchase order created", user: "Priya Sharma" },
  ],
};

const MOCK_RELATED_DOCS: Record<string, RelatedDoc[]> = {
  "po-001": [
    { id: "rd-1", type: "Requisition", reference: "REQ-2026-0089", href: "/buy/requisitions/req-001" },
  ],
  "po-002": [
    { id: "rd-1", type: "Receipt", reference: "GR-2026-0035", href: "/buy/receipts" },
    { id: "rd-2", type: "Bill", reference: "BILL-2026-0044", href: "/buy/bills" },
  ],
  "po-003": [
    { id: "rd-1", type: "Receipt", reference: "GR-2026-0034", href: "/buy/receipts" },
    { id: "rd-2", type: "Bill", reference: "BILL-2026-0045", href: "/buy/bills" },
  ],
  "po-004": [],
  "po-005": [],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_BADGE: Record<POStatus, string> = {
  draft: "border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]",
  sent: "border-0 bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
  acknowledged: "border-0 bg-[var(--neutral-100)] text-foreground",
  partial: "border-0 bg-[var(--mw-yellow-400)]/25 text-foreground",
  received: "border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
  cancelled: "border-0 bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
};

const STATUS_LABEL: Record<POStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  acknowledged: "Acknowledged",
  partial: "Partial",
  received: "Received",
  cancelled: "Cancelled",
};

const PO_TIMELINE: POStatus[] = ["draft", "sent", "acknowledged", "partial", "received"];

const SBADGE_VARIANT = (status: POStatus) => {
  switch (status) {
    case "draft": return "neutral" as const;
    case "sent": return "info" as const;
    case "acknowledged": return "neutral" as const;
    case "partial": return "warning" as const;
    case "received": return "success" as const;
    case "cancelled": return "error" as const;
  }
};

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "line-items", label: "Line Items" },
  { id: "delivery", label: "Delivery" },
  { id: "activity", label: "Activity" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BuyOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const order = id ? PO_DETAILS[id] : undefined;
  const lineItems = id ? MOCK_LINE_ITEMS[id] ?? [] : [];
  const activities = id ? MOCK_ACTIVITIES[id] ?? [] : [];
  const relatedDocs = id ? MOCK_RELATED_DOCS[id] ?? [] : [];

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === "line-items") return { ...t, count: lineItems.length };
      if (t.id === "activity") return { ...t, count: activities.length };
      return { ...t };
    });
  }, [lineItems.length, activities.length]);

  if (!order) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/buy/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Purchase order not found. Open one from the orders list.
        </p>
      </div>
    );
  }

  const currentStageIdx = order.status === "cancelled" ? -1 : PO_TIMELINE.indexOf(order.status);

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
              {/* Order details card */}
              <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-1 text-base font-medium text-foreground">
                  Order details
                </h2>
                <p className="mb-6 text-xs text-[var(--neutral-500)]">
                  Key information for this purchase order
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">PO number</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={order.poNumber} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Supplier</Label>
                    <div className="mt-1">
                      <Link
                        to={`/buy/suppliers/${order.supplierId}`}
                        className="inline-flex h-12 w-full items-center rounded-[var(--shape-md)] border border-[var(--border)] bg-background px-3 text-sm text-[var(--mw-info)] hover:underline"
                      >
                        {order.supplierName}
                      </Link>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Order date</Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={fmtDate(order.date)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Expected delivery</Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={fmtDate(order.deliveryDate)}
                    />
                  </div>
                  {order.receivedDate && (
                    <div>
                      <Label className="text-xs text-[var(--neutral-500)]">Received date</Label>
                      <Input
                        readOnly
                        className="mt-1 h-12 border-[var(--border)]"
                        value={fmtDate(order.receivedDate)}
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Status</Label>
                    <div className="mt-1 flex h-12 items-center">
                      <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[order.status])}>
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Payment terms</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.paymentTerms} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Shipping method</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.shippingMethod} />
                  </div>
                  {order.jobId && (
                    <div>
                      <Label className="text-xs text-[var(--neutral-500)]">Linked job</Label>
                      <div className="mt-1">
                        <Link
                          to={`/plan/jobs/${order.jobId}`}
                          className="inline-flex h-12 w-full items-center rounded-[var(--shape-md)] border border-[var(--border)] bg-background px-3 text-sm text-[var(--mw-info)] hover:underline tabular-nums"
                        >
                          {order.jobId}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Line items summary */}
              <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">Line items</h2>
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
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">Qty</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.slice(0, 3).map((li) => (
                      <TableRow key={li.id} className="min-h-14">
                        <TableCell className="text-sm">{li.product}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{li.qtyOrdered}</TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">{fmtCurrency(li.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Notes */}
              {order.notes && (
                <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <h2 className="mb-2 text-base font-medium text-foreground">Notes</h2>
                  <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">{order.notes}</p>
                </Card>
              )}

              {/* Related documents */}
              {relatedDocs.length > 0 && (
                <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <h2 className="mb-4 text-base font-medium text-foreground">Related documents</h2>
                  <ul className="divide-y divide-[var(--border)]">
                    {relatedDocs.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 shrink-0 text-[var(--neutral-500)]" />
                          <div>
                            <p className="text-sm font-medium text-foreground tabular-nums">{doc.reference}</p>
                            <p className="text-xs text-[var(--neutral-500)]">{doc.type}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 border-[var(--border)]" asChild>
                          <Link to={doc.href}>View</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Right column (sticky) */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Order value card */}
              <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-4 text-base font-medium text-foreground">Order value</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Currency</dt>
                    <dd className="font-medium text-foreground">{order.currency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Subtotal</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmtCurrency(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Tax (GST)</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmtCurrency(order.tax)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-3">
                    <dt className="font-medium text-foreground">Total</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmtCurrency(order.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Received value</dt>
                    <dd className={cn("font-medium tabular-nums", order.received > 0 ? "text-[var(--mw-success)]" : "text-foreground")}>
                      {fmtCurrency(order.received)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Outstanding</dt>
                    <dd className={cn("font-medium tabular-nums", (order.total - order.received) > 0 ? "text-[var(--mw-error)]" : "text-foreground")}>
                      {fmtCurrency(order.total - order.received)}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Status timeline */}
              <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-4 text-base font-medium text-foreground">Status timeline</h2>
                <ol className="space-y-3">
                  {PO_TIMELINE.map((step, i) => {
                    const done = currentStageIdx >= 0 && i <= currentStageIdx;
                    const isCurrent = i === currentStageIdx;
                    return (
                      <li key={step} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                            done
                              ? "bg-[var(--mw-yellow-400)] text-primary-foreground"
                              : "border border-[var(--border)] bg-card text-[var(--neutral-400)]",
                          )}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={cn(
                            "text-sm",
                            isCurrent
                              ? "font-medium text-foreground"
                              : done
                                ? "text-[var(--neutral-600)] dark:text-[var(--neutral-400)]"
                                : "text-[var(--neutral-400)]",
                          )}
                        >
                          {STATUS_LABEL[step]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </Card>

              {/* AI insight */}
              <AIInsightCard title="Supplier performance">
                {order.supplierName} has a <strong className="text-foreground">94% on-time</strong> delivery
                rate over the last 12 months. Average lead time is 8 business days.
              </AIInsightCard>
            </div>
          </div>
        );

      /* ============================================================ */
      /*  LINE ITEMS                                                   */
      /* ============================================================ */
      case "line-items":
        return (
          <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-foreground">
                Line items
              </h2>
              <Button
                className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12"
                onClick={() => toast("Add line item coming soon")}
              >
                <Package className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--neutral-100)] dark:bg-[var(--neutral-100)]/10 hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-100)]/10">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Ordered</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Received</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Unit Price</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((li) => (
                  <TableRow key={li.id} className="min-h-14">
                    <TableCell className="text-sm font-medium tabular-nums">{li.product}</TableCell>
                    <TableCell className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">{li.description}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{li.qtyOrdered}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{li.qtyReceived}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{fmtCurrency(li.unitPrice)}</TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">{fmtCurrency(li.total)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={
                          li.status === "Received" ? "success"
                            : li.status === "Partial" ? "warning"
                              : li.status === "Draft" ? "neutral"
                                : "neutral"
                        }
                        withDot
                      >
                        {li.status}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Line items summary footer */}
            <div className="border-t border-[var(--border)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-100)]/5 px-6 py-4">
              <div className="flex justify-end gap-8">
                <div className="text-sm">
                  <span className="text-[var(--neutral-500)]">Total ordered: </span>
                  <span className="font-medium tabular-nums text-foreground">{lineItems.reduce((s, li) => s + li.qtyOrdered, 0)} units</span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--neutral-500)]">Total value: </span>
                  <span className="font-medium tabular-nums text-foreground">{fmtCurrency(lineItems.reduce((s, li) => s + li.total, 0))}</span>
                </div>
              </div>
            </div>
          </Card>
        );

      /* ============================================================ */
      /*  DELIVERY                                                     */
      /* ============================================================ */
      case "delivery":
        return (
          <div className="space-y-6">
            {/* Delivery tracking */}
            <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-1 text-base font-medium text-foreground">Delivery tracking</h2>
              <p className="mb-6 text-xs text-[var(--neutral-500)]">Shipment and logistics information</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-[var(--neutral-500)]">Expected delivery</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={fmtDate(order.deliveryDate)} />
                </div>
                <div>
                  <Label className="text-xs text-[var(--neutral-500)]">Shipping method</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.shippingMethod} />
                </div>
                <div>
                  <Label className="text-xs text-[var(--neutral-500)]">Carrier</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.carrier ?? "Not yet assigned"} />
                </div>
                <div>
                  <Label className="text-xs text-[var(--neutral-500)]">Tracking number</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={order.trackingNumber ?? "Not yet assigned"} />
                </div>
              </div>
            </Card>

            {/* Receiving progress */}
            <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-4 text-base font-medium text-foreground">Receiving progress</h2>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                  Items received
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {lineItems.reduce((s, li) => s + li.qtyReceived, 0)} / {lineItems.reduce((s, li) => s + li.qtyOrdered, 0)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-100)]/10">
                <div
                  className="h-full rounded-full bg-[var(--mw-yellow-400)] transition-all"
                  style={{
                    width: `${
                      lineItems.reduce((s, li) => s + li.qtyOrdered, 0) > 0
                        ? (lineItems.reduce((s, li) => s + li.qtyReceived, 0) /
                            lineItems.reduce((s, li) => s + li.qtyOrdered, 0)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </Card>

            {/* Per-line receiving detail */}
            <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-medium text-foreground">Line item receiving</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--neutral-100)] dark:bg-[var(--neutral-100)]/10 hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-100)]/10">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Ordered</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Received</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Outstanding</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((li) => (
                    <TableRow key={li.id} className="min-h-14">
                      <TableCell className="text-sm font-medium tabular-nums">{li.product}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{li.qtyOrdered}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{li.qtyReceived}</TableCell>
                      <TableCell className={cn("text-right text-sm tabular-nums", (li.qtyOrdered - li.qtyReceived) > 0 && "text-[var(--mw-error)]")}>
                        {li.qtyOrdered - li.qtyReceived}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={
                            li.qtyReceived >= li.qtyOrdered ? "success"
                              : li.qtyReceived > 0 ? "warning"
                                : "neutral"
                          }
                          withDot
                        >
                          {li.qtyReceived >= li.qtyOrdered ? "Complete" : li.qtyReceived > 0 ? "Partial" : "Pending"}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      /* ============================================================ */
      /*  ACTIVITY                                                     */
      /* ============================================================ */
      case "activity":
        return (
          <div className="space-y-6">
            {/* Activity timeline */}
            <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-6 text-base font-medium text-foreground">Activity timeline</h2>
              <ol className="relative border-l-2 border-[var(--neutral-200)] dark:border-[var(--border)] ml-3 space-y-6">
                {[...activities].reverse().map((evt) => (
                  <li key={evt.id} className="ml-6">
                    <div className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-[var(--neutral-200)] dark:border-[var(--border)] bg-card" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{evt.action}</span>
                      <span className="text-xs text-[var(--neutral-500)]">
                        {fmtDate(evt.date)} &middot; {evt.user}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Comments placeholder */}
            <Card className="border border-[var(--neutral-200)] dark:border-[var(--border)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-4 text-base font-medium text-foreground">Comments</h2>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Add a comment..."
                  className="flex-1 h-12 border-[var(--border)]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      toast.success("Comment added");
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                  onClick={() => toast.success("Comment added")}
                >
                  Post
                </Button>
              </div>
              <p className="mt-3 text-xs text-[var(--neutral-500)]">No comments yet.</p>
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
        { label: "Buy", href: "/buy" },
        { label: "Orders", href: "/buy/orders" },
        { label: order.poNumber },
      ]}
      title={`Purchase Order ${order.poNumber}`}
      subtitle={
        <>
          <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">
            {order.poNumber}
          </span>
          <span>{order.supplierName}</span>
          <span className="tabular-nums">{fmtCurrency(order.total)}</span>
        </>
      }
      metaRow={
        <>
          <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[order.status])}>
            {STATUS_LABEL[order.status]}
          </Badge>
          <Badge variant="outline" className="rounded-full border-[var(--border)]">
            <Link to={`/buy/suppliers/${order.supplierId}`} className="hover:underline">
              {order.supplierName}
            </Link>
          </Badge>
          {order.jobId && (
            <Badge variant="outline" className="rounded-full border-[var(--border)]">
              <Link to={`/plan/jobs/${order.jobId}`} className="hover:underline tabular-nums">
                {order.jobId}
              </Link>
            </Badge>
          )}
        </>
      }
      headerActions={
        <>
          <Button variant="outline" className="h-12 border-[var(--border)]" asChild>
            <Link to="/buy/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-12 border-[var(--border)]"
            onClick={() => toast("Edit mode coming soon")}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {order.status === "draft" && (
            <Button
              variant="outline"
              className="h-12 border-[var(--border)]"
              onClick={() => toast.success("PO approved")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {(order.status === "acknowledged" || order.status === "partial") && (
            <Button
              variant="outline"
              className="h-12 border-[var(--border)]"
              onClick={() => toast.success("Receive goods flow started")}
            >
              <Truck className="mr-2 h-4 w-4" />
              Receive
            </Button>
          )}
          <Button
            className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={() => {
              toast("Printing...");
              window.print();
            }}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
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
