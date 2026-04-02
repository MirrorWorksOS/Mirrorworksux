/**
 * Sell Order Detail — full-page workspace using shared JobWorkspaceLayout.
 * Orders list navigates here via /sell/orders/:id
 */

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Package,
  Printer,
  Truck,
} from "lucide-react";
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from "@/components/shared/layout/JobWorkspaceLayout";
import { AIInsightCard } from "@/components/shared/ai/AIInsightCard";
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

type OrderStatus = "Draft" | "Confirmed" | "In Production" | "Shipped" | "Delivered";

interface SellOrder {
  id: string;
  soNumber: string;
  title: string;
  customer: string;
  value: number;
  status: OrderStatus;
  opportunityId: string;
  jobId?: string;
  orderDate: string;
  expectedDelivery: string;
  paymentTerms: string;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  shippingAddress: string;
  shippingMethod: string;
  trackingNumber?: string;
  itemsShipped: number;
  itemsTotal: number;
}

interface LineItem {
  id: string;
  product: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  status: string;
}

interface DocFile {
  id: string;
  name: string;
  size: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ORDERS: Record<string, SellOrder> = {
  "1": {
    id: "1",
    soNumber: "SO-0001",
    title: "Server Rack Fabrication",
    customer: "TechCorp Industries",
    value: 45000,
    status: "Confirmed",
    opportunityId: "1",
    jobId: "JOB-2026-0012",
    orderDate: "2026-03-10",
    expectedDelivery: "2026-04-14",
    paymentTerms: "Net 30",
    subtotal: 40909,
    tax: 4091,
    total: 45000,
    paid: 22500,
    shippingAddress: "12 Tech Park Dr, Macquarie Park NSW 2113",
    shippingMethod: "Standard Freight",
    trackingNumber: "TRK-20260310-001",
    itemsShipped: 0,
    itemsTotal: 6,
  },
  "2": {
    id: "2",
    soNumber: "SO-0002",
    title: "Structural Steel Package",
    customer: "BHP Contractors",
    value: 128000,
    status: "In Production",
    opportunityId: "2",
    jobId: "JOB-2026-0013",
    orderDate: "2026-03-05",
    expectedDelivery: "2026-04-28",
    paymentTerms: "Net 45",
    subtotal: 116364,
    tax: 11636,
    total: 128000,
    paid: 38400,
    shippingAddress: "1 BHP Way, Brisbane QLD 4000",
    shippingMethod: "Heavy Haulage",
    trackingNumber: undefined,
    itemsShipped: 0,
    itemsTotal: 6,
  },
  "3": {
    id: "3",
    soNumber: "SO-0003",
    title: "Custom Brackets (50 units)",
    customer: "Pacific Fab",
    value: 8500,
    status: "Shipped",
    opportunityId: "3",
    jobId: undefined,
    orderDate: "2026-02-20",
    expectedDelivery: "2026-03-25",
    paymentTerms: "Net 14",
    subtotal: 7727,
    tax: 773,
    total: 8500,
    paid: 8500,
    shippingAddress: "44 Fabrication Rd, Dandenong VIC 3175",
    shippingMethod: "Express Courier",
    trackingNumber: "TRK-20260318-042",
    itemsShipped: 6,
    itemsTotal: 6,
  },
  "4": {
    id: "4",
    soNumber: "SO-0004",
    title: "Rail Platform Components",
    customer: "Sydney Rail Corp",
    value: 67000,
    status: "Draft",
    opportunityId: "4",
    jobId: undefined,
    orderDate: "2026-03-28",
    expectedDelivery: "2026-05-15",
    paymentTerms: "Net 60",
    subtotal: 60909,
    tax: 6091,
    total: 67000,
    paid: 0,
    shippingAddress: "130 Elizabeth St, Sydney NSW 2000",
    shippingMethod: "Flatbed Delivery",
    trackingNumber: undefined,
    itemsShipped: 0,
    itemsTotal: 6,
  },
};

const MOCK_LINE_ITEMS: LineItem[] = [
  { id: "li-1", product: "PROD-SR-001", description: "Server rack frame — powder coated", qty: 4, unitPrice: 5120, total: 20480, status: "Ready" },
  { id: "li-2", product: "PROD-SR-002", description: "Side panel — 1.6 mm galv steel", qty: 8, unitPrice: 980, total: 7840, status: "Ready" },
  { id: "li-3", product: "LABOUR-FAB", description: "Fabrication labour (hrs)", qty: 24, unitPrice: 140, total: 3360, status: "In Progress" },
  { id: "li-4", product: "PROD-SR-003", description: "Cable management tray", qty: 4, unitPrice: 420, total: 1680, status: "Pending" },
  { id: "li-5", product: "MAT-HDWR-010", description: "M8 cage nuts & bolts kit", qty: 16, unitPrice: 38, total: 608, status: "Ready" },
  { id: "li-6", product: "LABOUR-QC", description: "Quality inspection (hrs)", qty: 6, unitPrice: 160, total: 960, status: "Pending" },
];

const MOCK_DOCUMENTS: DocFile[] = [
  { id: "doc-1", name: "Purchase_Order_PO-4421.pdf", size: "245 KB", date: "10 Mar 2026" },
  { id: "doc-2", name: "Drawing_Rev_C.dxf", size: "1.2 MB", date: "8 Mar 2026" },
  { id: "doc-3", name: "Packing_List.pdf", size: "98 KB", date: "18 Mar 2026" },
  { id: "doc-4", name: "Invoice_INV-0089.pdf", size: "180 KB", date: "20 Mar 2026" },
];

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_BADGE: Record<OrderStatus, string> = {
  Draft: "border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]",
  Confirmed: "border-0 bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
  "In Production": "border-0 bg-[var(--mw-yellow-400)]/25 text-[var(--neutral-900)]",
  Shipped: "border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
  Delivered: "border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
};

const STATUS_TIMELINE: OrderStatus[] = [
  "Draft",
  "Confirmed",
  "In Production",
  "Shipped",
  "Delivered",
];

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "line-items", label: "Line Items" },
  { id: "fulfilment", label: "Fulfilment" },
  { id: "documents", label: "Documents" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SellOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const order = id ? MOCK_ORDERS[id] : undefined;

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === "line-items") return { ...t, count: MOCK_LINE_ITEMS.length };
      if (t.id === "documents") return { ...t, count: MOCK_DOCUMENTS.length };
      return { ...t };
    });
  }, []);

  if (!order) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/sell/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Order not found. Open one from the orders list.
        </p>
      </div>
    );
  }

  const balance = order.total - order.paid;
  const currentStageIdx = STATUS_TIMELINE.indexOf(order.status);

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
              {/* Order details card */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-1 text-base font-medium text-[var(--neutral-900)]">
                  Order details
                </h2>
                <p className="mb-6 text-xs text-[var(--neutral-500)]">
                  Key information for this sales order
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">SO number</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={order.soNumber} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Customer</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.customer} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Order date</Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={new Date(order.orderDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Expected delivery</Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={new Date(order.expectedDelivery).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Linked opportunity</Label>
                    <div className="mt-1">
                      <Link
                        to={`/sell/opportunities/${order.opportunityId}`}
                        className="inline-flex h-12 w-full items-center rounded-[var(--shape-md)] border border-[var(--border)] bg-background px-3 text-sm text-[var(--mw-info)] hover:underline tabular-nums"
                      >
                        OPP-{order.opportunityId.padStart(4, "0")}
                      </Link>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Linked job</Label>
                    <div className="mt-1">
                      {order.jobId ? (
                        <Link
                          to={`/plan/jobs/${order.jobId}`}
                          className="inline-flex h-12 w-full items-center rounded-[var(--shape-md)] border border-[var(--border)] bg-background px-3 text-sm text-[var(--mw-info)] hover:underline tabular-nums"
                        >
                          {order.jobId}
                        </Link>
                      ) : (
                        <Input readOnly className="h-12 border-[var(--border)] text-[var(--neutral-400)]" value="No job linked" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Status</Label>
                    <div className="mt-1 flex h-12 items-center">
                      <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[order.status])}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Payment terms</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.paymentTerms} />
                  </div>
                </div>
              </Card>

              {/* Line items summary */}
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
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">Qty</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_LINE_ITEMS.slice(0, 3).map((li) => (
                      <TableRow key={li.id} className="min-h-14">
                        <TableCell className="text-sm">{li.product}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{li.qty}</TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">{fmt(li.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Right column (sticky) */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Order value card */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-4 text-base font-medium text-[var(--neutral-900)]">Order value</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Subtotal</dt>
                    <dd className="font-medium tabular-nums text-[var(--neutral-900)]">{fmt(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Tax (GST)</dt>
                    <dd className="font-medium tabular-nums text-[var(--neutral-900)]">{fmt(order.tax)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-3">
                    <dt className="font-medium text-[var(--neutral-900)]">Total</dt>
                    <dd className="font-medium tabular-nums text-[var(--neutral-900)]">{fmt(order.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Paid</dt>
                    <dd className="font-medium tabular-nums text-[var(--mw-success)]">{fmt(order.paid)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Balance due</dt>
                    <dd className={cn("font-medium tabular-nums", balance > 0 ? "text-[var(--mw-error)]" : "text-[var(--neutral-900)]")}>
                      {fmt(balance)}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Status timeline */}
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="mb-4 text-base font-medium text-[var(--neutral-900)]">Status timeline</h2>
                <ol className="space-y-3">
                  {STATUS_TIMELINE.map((step, i) => {
                    const done = i <= currentStageIdx;
                    const isCurrent = i === currentStageIdx;
                    return (
                      <li key={step} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                            done
                              ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-900)]"
                              : "border border-[var(--border)] bg-white text-[var(--neutral-400)]",
                          )}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={cn(
                            "text-sm",
                            isCurrent
                              ? "font-medium text-[var(--neutral-900)]"
                              : done
                                ? "text-[var(--neutral-600)]"
                                : "text-[var(--neutral-400)]",
                          )}
                        >
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </Card>

              {/* AI insight */}
              <AIInsightCard title="Delivery forecast">
                This order is tracking 2 days ahead of schedule. Expected delivery:{" "}
                <strong className="text-[var(--neutral-900)]">14 Apr</strong>.
              </AIInsightCard>
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
                <Package className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--neutral-100)] hover:bg-[var(--neutral-100)]">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Qty</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Unit Price</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LINE_ITEMS.map((li) => (
                  <TableRow key={li.id} className="min-h-14">
                    <TableCell className="text-sm font-medium tabular-nums">{li.product}</TableCell>
                    <TableCell className="text-sm text-[var(--neutral-600)]">{li.description}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{li.qty}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{fmt(li.unitPrice)}</TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">{fmt(li.total)}</TableCell>
                    <TableCell>
                      <Badge className="border-0 bg-[var(--neutral-100)] text-[var(--neutral-900)] text-xs">
                        {li.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        );

      /* ============================================================ */
      /*  FULFILMENT                                                   */
      /* ============================================================ */
      case "fulfilment":
        return (
          <div className="space-y-6">
            {/* Shipping details */}
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-1 text-base font-medium text-[var(--neutral-900)]">Shipping details</h2>
              <p className="mb-6 text-xs text-[var(--neutral-500)]">Delivery address and logistics</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-xs text-[var(--neutral-500)]">Shipping address</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.shippingAddress} />
                </div>
                <div>
                  <Label className="text-xs text-[var(--neutral-500)]">Shipping method</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.shippingMethod} />
                </div>
                <div>
                  <Label className="text-xs text-[var(--neutral-500)]">Tracking number</Label>
                  <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={order.trackingNumber ?? "Not yet assigned"} />
                </div>
              </div>
            </Card>

            {/* Fulfilment progress */}
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-4 text-base font-medium text-[var(--neutral-900)]">Fulfilment progress</h2>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-[var(--neutral-600)]">
                  Items shipped
                </span>
                <span className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                  {order.itemsShipped} / {order.itemsTotal}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--neutral-100)]">
                <div
                  className="h-full rounded-full bg-[var(--mw-yellow-400)] transition-all"
                  style={{ width: `${order.itemsTotal > 0 ? (order.itemsShipped / order.itemsTotal) * 100 : 0}%` }}
                />
              </div>
            </Card>

            {/* Job link */}
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h2 className="mb-4 text-base font-medium text-[var(--neutral-900)]">Production job</h2>
              {order.jobId ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral-900)] tabular-nums">{order.jobId}</p>
                    <p className="text-xs text-[var(--neutral-500)]">Manufacturing job linked to this order</p>
                  </div>
                  <Button variant="outline" className="h-12 border-[var(--border)]" asChild>
                    <Link to={`/plan/jobs/${order.jobId}`}>
                      <Truck className="mr-2 h-4 w-4" />
                      View Job
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--neutral-500)]">No production job linked yet.</p>
                  <Button className="h-12 bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]" asChild>
                    <Link to="/plan/jobs">
                      <Package className="mr-2 h-4 w-4" />
                      Create Job
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      /* ============================================================ */
      /*  DOCUMENTS                                                    */
      /* ============================================================ */
      case "documents":
        return (
          <Card className="border border-[var(--neutral-200)] bg-white shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-[var(--neutral-900)]">Documents</h2>
              <Button className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] h-12" onClick={() => toast('Upload document coming soon')}>
                <FileText className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {MOCK_DOCUMENTS.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[var(--neutral-500)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--neutral-900)]">{doc.name}</p>
                      <p className="text-xs text-[var(--neutral-500)]">
                        <span className="tabular-nums">{doc.size}</span> &middot; {doc.date}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 border-[var(--border)]" onClick={() => toast.success('Downloading\u2026')}>
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: "Sell", href: "/sell" },
        { label: "Orders", href: "/sell/orders" },
        { label: order.soNumber },
      ]}
      title={order.title}
      subtitle={`${order.soNumber} \u00b7 ${order.customer} \u00b7 $${order.value.toLocaleString()}`}
      metaRow={
        <>
          <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[order.status])}>
            {order.status}
          </Badge>
          <Badge variant="outline" className="rounded-full border-[var(--border)]">
            <Link to={`/sell/opportunities/${order.opportunityId}`} className="hover:underline">
              OPP-{order.opportunityId.padStart(4, "0")}
            </Link>
          </Badge>
        </>
      }
      headerActions={
        <>
          <Button variant="outline" className="h-12 border-[var(--border)]" asChild>
            <Link to="/sell/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => toast.success('Email sent to customer')}>
            <Mail className="mr-2 h-4 w-4" />
            Email Customer
          </Button>
          <Button className="h-12 bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]" onClick={() => { toast('Printing\u2026'); window.print(); }}>
            <Printer className="mr-2 h-4 w-4" />
            Print Order
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
