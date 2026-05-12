/**
 * Sell Order Detail — full-page workspace using shared JobWorkspaceLayout.
 * Orders list navigates here via /sell/orders/:id
 */

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate, useParams, useSearchParams, Link } from "react-router";
import {
  ArrowLeft,
  Download,
  FileText,
  Info,
  Mail,
  Package,
  Printer,
  Trash2,
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
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { EditableCard } from "@/components/shared/forms/EditableCard";
import { EditField, EditSelect, EditTextarea, Field } from "@/components/shared/forms/EditField";
import { EntityPickerModal } from "@/components/shared/pickers/EntityPickerModal";
import { products, quotes, salesOrders, sellInvoices } from "@/services";
import { lineage, parseRef, type DocumentPrefix } from "@/services/numbering";
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
  status: OrderStatus | 'Draft';
  opportunityId?: string;
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
  // ── Fulfilment (mirror of SalesOrder fields) ─────────────────────
  carrier?: string;
  fulfilmentNotes?: string;
  fulfilmentLabels?: string[];
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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Parse a single-line Australian shipping address into structured parts.
 * Tolerant of missing fields. Real implementation will use the Customer
 * record's structured address (street/city/state/postcode/country) once
 * the backend exposes it.
 *
 *   "12 Tech Park Dr, Macquarie Park NSW 2113"
 *   → { street: "12 Tech Park Dr", city: "Macquarie Park", state: "NSW", postcode: "2113", country: "Australia" }
 */
function parseAddress(raw: string): {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
} {
  const empty = { street: '', city: '', state: '', postcode: '', country: 'Australia' };
  if (!raw) return empty;
  const segments = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const [streetSeg, ...rest] = segments;
  const tail = rest.join(' ');
  // Match "{City} {STATE} {postcode}" — STATE is 2–3 uppercase letters, postcode is 4 digits.
  const m = tail.match(/^(.+?)\s+([A-Z]{2,3})\s+(\d{4})\s*(.*)$/);
  if (m) {
    return {
      street: streetSeg ?? '',
      city: m[1].trim(),
      state: m[2],
      postcode: m[3],
      country: m[4]?.trim() || 'Australia',
    };
  }
  return { ...empty, street: streetSeg ?? raw };
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

// Blank-form factory for create-mode rendering at `/sell/orders/new`.
const createBlankOrder = (defaults?: Partial<SellOrder>): SellOrder => ({
  id: `new-${Date.now()}`,
  soNumber: 'SO-NEW',
  title: '',
  customer: '',
  value: 0,
  status: 'Draft',
  orderDate: new Date().toISOString().slice(0, 10),
  expectedDelivery: '',
  paymentTerms: 'Net 30',
  subtotal: 0,
  tax: 0,
  total: 0,
  paid: 0,
  shippingAddress: '',
  shippingMethod: 'Standard Freight',
  itemsShipped: 0,
  itemsTotal: 0,
  ...defaults,
});

// Note: soNumber aligned with central salesOrders mock (SO-2026-####) so the
// lineage strip can resolve real Quote/Invoice/WO refs by suffix.
// TODO(backend): Backend should call `share(quote.ref, 'SO')` when converting
// a quote to a sales order so the SO inherits the numeric suffix from the quote
// — e.g. Q-2026-0085 → SO-2026-0085. Pre-existing seed data (so-001/qt-001)
// doesn't share suffixes; that's fine for the mock and is rectified server-side.
const MOCK_ORDERS: Record<string, SellOrder> = {
  "so-001": {
    id: "so-001",
    soNumber: "SO-2026-0085",
    title: "Server Rack Fabrication",
    customer: "TechCorp Industries",
    value: 45000,
    status: "Confirmed",
    opportunityId: "opp-001",
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
    carrier: "DHL",
    fulfilmentNotes: "Inside delivery requested. Call site 30 mins prior.",
    fulfilmentLabels: ["Fragile", "Inside delivery"],
  },
  "so-002": {
    id: "so-002",
    soNumber: "SO-2026-0086",
    title: "Structural Steel Package",
    customer: "BHP Contractors",
    value: 128000,
    status: "In Production",
    opportunityId: "opp-002",
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
  "so-003": {
    id: "so-003",
    soNumber: "SO-2026-0087",
    title: "Custom Brackets (50 units)",
    customer: "Pacific Fab",
    value: 8500,
    status: "Shipped",
    opportunityId: "opp-003",
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
  "so-004": {
    id: "so-004",
    soNumber: "SO-2026-0088",
    title: "Rail Platform Components",
    customer: "Sydney Rail Corp",
    value: 67000,
    status: "Draft",
    opportunityId: "opp-004",
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
  "In Production": "border-0 bg-[var(--mw-yellow-400)]/25 text-foreground",
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

const CARRIER_OPTIONS = ['DHL', 'StarTrack', 'Toll', 'TNT', 'Pickup'] as const;

const SALES_ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

/**
 * Map a UI OrderStatus → the SalesOrderStatus enum slug used in
 * the editable form. Keeps the legacy display strings working while
 * binding to the contract enum on save.
 */
const ORDER_STATUS_TO_SLUG: Record<OrderStatus, string> = {
  Draft: 'pending',
  Confirmed: 'confirmed',
  'In Production': 'in_production',
  Shipped: 'shipped',
  Delivered: 'delivered',
};

const SLUG_TO_ORDER_STATUS: Record<string, OrderStatus> = {
  pending: 'Draft',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

/**
 * Resolve a lineage chip to a navigation target. Looks up the ref against
 * central mock data; falls back to `null` (caller toasts "not found").
 */
function resolveLineageHref(prefix: DocumentPrefix, ref: string): string | null {
  switch (prefix) {
    case 'Q': {
      const q = quotes.find((x) => x.ref === ref);
      return q ? `/sell/quotes/${q.id}` : null;
    }
    case 'SO': {
      const so = salesOrders.find((x) => x.orderNumber === ref);
      return so ? `/sell/orders/${so.id}` : null;
    }
    case 'INV': {
      const inv = sellInvoices.find((x) => x.invoiceNumber === ref);
      return inv ? `/sell/invoices/${inv.id}` : null;
    }
    case 'WO':
      // WO refs are managed in Make; route by number is acceptable.
      return `/make/work-orders`;
    case 'DO':
      return `/ship/orders`;
    default:
      return null;
  }
}

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const editParam = searchParams.get('edit') === '1';

  const isNew = !id || id === 'new';
  const order = isNew
    ? createBlankOrder({
        // Prefill from related entity when launched from a quote/opportunity
        opportunityId: searchParams.get('opportunityId') ?? undefined,
        customer: searchParams.get('customer') ?? '',
      })
    : (id ? MOCK_ORDERS[id] : undefined);
  const editMode = isNew || editParam;

  const handleSave = () => {
    // TODO(backend): isNew ? salesOrders.create(order) : salesOrders.update(order.id, order)
    if (isNew) {
      toast.success('Sales order created');
      navigate(`/sell/orders/${order!.id}`, { replace: true });
    } else {
      toast.success('Sales order saved');
    }
  };

  // Local-state mirrors so Add Line Item / Upload behave like real edits in mock mode.
  const [lineItems, setLineItems] = useState<LineItem[]>(isNew ? [] : MOCK_LINE_ITEMS);
  const [documents, setDocuments] = useState<DocFile[]>(isNew ? [] : MOCK_DOCUMENTS);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Fulfilment editable state (mirrors SalesOrder fields) ─────────
  const [carrier, setCarrier] = useState<string>(order?.carrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState<string>(order?.trackingNumber ?? '');
  const [fulfilmentStatus, setFulfilmentStatus] = useState<string>(
    order ? ORDER_STATUS_TO_SLUG[order.status as OrderStatus] ?? 'pending' : 'pending',
  );
  const [fulfilmentNotes, setFulfilmentNotes] = useState<string>(order?.fulfilmentNotes ?? '');
  const [fulfilmentLabels, setFulfilmentLabels] = useState<string[]>(order?.fulfilmentLabels ?? []);
  // Draft copies — committed on Save, rolled back on Cancel.
  const [carrierDraft, setCarrierDraft] = useState(carrier);
  const [trackingDraft, setTrackingDraft] = useState(trackingNumber);
  const [statusDraft, setStatusDraft] = useState(fulfilmentStatus);
  const [notesDraft, setNotesDraft] = useState(fulfilmentNotes);
  const [labelsDraft, setLabelsDraft] = useState(fulfilmentLabels.join(', '));

  const beginFulfilmentEdit = () => {
    setCarrierDraft(carrier);
    setTrackingDraft(trackingNumber);
    setStatusDraft(fulfilmentStatus);
    setNotesDraft(fulfilmentNotes);
    setLabelsDraft(fulfilmentLabels.join(', '));
  };

  const handleSaveFulfilment = () => {
    // TODO(backend): salesOrders.update(order.id, { carrier, trackingNumber, status, fulfilmentNotes, fulfilmentLabels })
    setCarrier(carrierDraft);
    setTrackingNumber(trackingDraft);
    setFulfilmentStatus(statusDraft);
    setFulfilmentNotes(notesDraft);
    setFulfilmentLabels(
      labelsDraft
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  };

  const handleAddLineItem = () => {
    // Open product picker — replaces the legacy blank-row insert.
    setPickerOpen(true);
  };

  const handleProductsSelected = (ids: string[]) => {
    if (!ids.length) return;
    const picked = ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is (typeof products)[number] => Boolean(p));
    // TODO(backend): salesOrders.addLineItem(order.id, { productId, qty: 1 })
    setLineItems((prev) => [
      ...prev,
      ...picked.map((p) => ({
        id: `li-${Date.now()}-${p.id}`,
        product: p.partNumber,
        description: p.description,
        qty: 1,
        unitPrice: p.unitPrice,
        total: p.unitPrice,
        status: 'Pending',
      })),
    ]);
    toast.success(`${picked.length} item${picked.length === 1 ? '' : 's'} added`);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const handleUploadDocument = (file: File) => {
    // TODO(backend): documents.upload(order.id, file) — returns the persisted DocFile.
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    setDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`,
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    toast.success(`Uploaded ${file.name}`);
  };

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === "line-items") return { ...t, count: lineItems.length };
      if (t.id === "documents") return { ...t, count: documents.length };
      return { ...t };
    });
  }, [lineItems.length, documents.length]);

  if (!order) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/sell/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sales orders
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Sales order not found. Open one from the sales orders list.
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
              <Card className="p-6">
                <h2 className="mb-1 text-base font-medium text-foreground">
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
                      {order.opportunityId ? (
                        <Link
                          to={`/sell/opportunities/${order.opportunityId}`}
                          className="inline-flex h-12 w-full items-center rounded-[var(--shape-md)] border border-[var(--border)] bg-background px-3 text-sm text-[var(--mw-info)] hover:underline tabular-nums"
                        >
                          {order.opportunityId.toUpperCase()}
                        </Link>
                      ) : (
                        <Input readOnly className="h-12 border-[var(--border)] text-[var(--neutral-400)]" value="No opportunity linked" />
                      )}
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
              <Card className="p-6">
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
                <MwDataTable<typeof lineItems[number]>
                  columns={[
                    { key: "product", header: "Product", className: "text-sm", cell: (li) => li.product },
                    {
                      key: "qty",
                      header: "Qty",
                      headerClassName: "text-right",
                      className: "text-right text-sm tabular-nums",
                      cell: (li) => li.qty,
                    },
                    {
                      key: "total",
                      header: "Price",
                      headerClassName: "text-right",
                      className: "text-right text-sm font-medium tabular-nums",
                      cell: (li) => fmt(li.total),
                    },
                  ]}
                  data={lineItems.slice(0, 3)}
                  keyExtractor={(li) => li.id}
                  className="border-0 shadow-none rounded-none"
                />
              </Card>
            </div>

            {/* Right column (sticky) */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Order value card */}
              <Card className="p-6">
                <h2 className="mb-4 text-base font-medium text-foreground">Order value</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Subtotal</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Tax (GST)</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(order.tax)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-3">
                    <dt className="font-medium text-foreground">Total</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(order.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Paid</dt>
                    <dd className="font-medium tabular-nums text-[var(--mw-success)]">{fmt(order.paid)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Balance due</dt>
                    <dd className={cn("font-medium tabular-nums", balance > 0 ? "text-[var(--mw-error)]" : "text-foreground")}>
                      {fmt(balance)}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Status timeline */}
              <Card className="p-6">
                <h2 className="mb-4 text-base font-medium text-foreground">Status timeline</h2>
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
                <strong className="text-foreground">14 Apr</strong>.
              </AIInsightCard>
            </div>
          </div>
        );

      /* ============================================================ */
      /*  LINE ITEMS                                                   */
      /* ============================================================ */
      case "line-items": {
        const columns: MwColumnDef<LineItem>[] = [
          {
            key: "product",
            header: "Product",
            tooltip: "Product SKU",
            cell: (li) => <span className="font-medium tabular-nums">{li.product}</span>,
          },
          {
            key: "description",
            header: "Description",
            cell: (li) => <span className="text-[var(--neutral-600)]">{li.description}</span>,
          },
          {
            key: "qty",
            header: "Qty",
            headerClassName: "text-right",
            cell: (li) => <span className="tabular-nums">{li.qty}</span>,
            className: "text-right",
          },
          {
            key: "unitPrice",
            header: "Unit Price",
            tooltip: "Price per unit excl. GST",
            headerClassName: "text-right",
            cell: (li) => <span className="tabular-nums">{fmt(li.unitPrice)}</span>,
            className: "text-right",
          },
          {
            key: "total",
            header: "Total",
            tooltip: "Line total excl. GST",
            headerClassName: "text-right",
            cell: (li) => <span className="font-medium tabular-nums">{fmt(li.total)}</span>,
            className: "text-right",
          },
          {
            key: "status",
            header: "Status",
            cell: (li) => (
              <Badge className="border-0 bg-[var(--neutral-100)] text-foreground text-xs">
                {li.status}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "",
            headerClassName: "w-12",
            className: "w-12 text-right",
            cell: (li) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLineItem(li.id);
                }}
                aria-label="Remove line item"
                className="rounded p-1 text-[var(--neutral-500)] transition-colors hover:bg-[var(--neutral-100)] hover:text-[var(--mw-error)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          },
        ];

        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-foreground">Line items</h2>
              <Button
                className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12"
                onClick={handleAddLineItem}
              >
                <Package className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </div>
            <MwDataTable<LineItem>
              columns={columns}
              data={lineItems}
              keyExtractor={(li) => li.id}
              striped
            />
          </div>
        );
      }

      /* ============================================================ */
      /*  FULFILMENT                                                   */
      /* ============================================================ */
      case "fulfilment":
        return (
          <div className="space-y-6">
            {/* Advisory: detailed shipping lives in Ship */}
            <div className="flex items-start gap-3 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--mw-info)]/8 px-4 py-3 text-sm text-[var(--neutral-700)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-info)]" />
              <p>
                Detailed shipping (label printing, dimensions, route) is managed in{' '}
                <strong className="text-foreground">Ship</strong> — see{' '}
                <Link to="/ship/orders" className="text-[var(--mw-info)] underline hover:no-underline">
                  Ship orders
                </Link>
                .
              </p>
            </div>

            {/* Fulfilment (carrier, tracking, status, labels, notes) */}
            <EditableCard
              title="Fulfilment"
              subtitle="Carrier, tracking and delivery notes for this order"
              onSave={handleSaveFulfilment}
              onCancel={beginFulfilmentEdit}
            >
              {({ mode }) => {
                if (mode === 'edit') {
                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <EditSelect
                        label="Carrier"
                        value={carrierDraft}
                        onChange={setCarrierDraft}
                        options={CARRIER_OPTIONS.map((c) => ({ value: c, label: c }))}
                        placeholder="Select carrier…"
                      />
                      <EditField
                        label="Tracking number"
                        value={trackingDraft}
                        onChange={setTrackingDraft}
                        placeholder="e.g. STR984756123"
                        mono
                      />
                      <EditSelect
                        label="Status"
                        value={statusDraft}
                        onChange={setStatusDraft}
                        options={SALES_ORDER_STATUS_OPTIONS}
                      />
                      <EditField
                        label="Labels (comma-separated)"
                        value={labelsDraft}
                        onChange={setLabelsDraft}
                        placeholder="Fragile, Inside delivery"
                      />
                      <EditTextarea
                        label="Delivery notes"
                        value={notesDraft}
                        onChange={setNotesDraft}
                        placeholder="Free-form delivery / fulfilment notes"
                        className="sm:col-span-2"
                        rows={3}
                      />
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Carrier" value={carrier || '—'} />
                    <Field label="Tracking number" value={trackingNumber || 'Not yet assigned'} mono />
                    <Field
                      label="Status"
                      value={SLUG_TO_ORDER_STATUS[fulfilmentStatus] ?? fulfilmentStatus}
                    />
                    <div>
                      <span className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
                        Labels
                      </span>
                      {fulfilmentLabels.length === 0 ? (
                        <p className="text-sm text-foreground">—</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {fulfilmentLabels.map((l) => (
                            <Badge
                              key={l}
                              variant="outline"
                              className="rounded-full border-[var(--border)] text-xs"
                            >
                              {l}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Field
                      label="Delivery notes"
                      value={fulfilmentNotes || '—'}
                      className="sm:col-span-2"
                    />
                  </div>
                );
              }}
            </EditableCard>

            {/* Shipping address — split into structured fields so the carrier
                manifest can read each component cleanly. Read-only here; the
                source of truth is the Customer record. */}
            <Card className="p-6">
              <h2 className="mb-1 text-base font-medium text-foreground">Shipping details</h2>
              <p className="mb-6 text-xs text-[var(--neutral-500)]">Delivery address and method</p>
              {(() => {
                const parts = parseAddress(order.shippingAddress);
                return (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <Label className="text-xs text-[var(--neutral-500)]">Street</Label>
                      <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={parts.street} />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs text-[var(--neutral-500)]">City / suburb</Label>
                      <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={parts.city} />
                    </div>
                    <div className="sm:col-span-1">
                      <Label className="text-xs text-[var(--neutral-500)]">State</Label>
                      <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={parts.state} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-[var(--neutral-500)]">Postcode</Label>
                      <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={parts.postcode} />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs text-[var(--neutral-500)]">Country</Label>
                      <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={parts.country} />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs text-[var(--neutral-500)]">Shipping method</Label>
                      <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={order.shippingMethod} />
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* Fulfilment progress */}
            <Card className="p-6">
              <h2 className="mb-4 text-base font-medium text-foreground">Fulfilment progress</h2>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-[var(--neutral-600)]">
                  Items shipped
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
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
            <Card className="p-6">
              <h2 className="mb-4 text-base font-medium text-foreground">Production job</h2>
              {order.jobId ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground tabular-nums">{order.jobId}</p>
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
                  <Button className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" asChild>
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
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-foreground">Documents</h2>
              <label className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12 inline-flex items-center px-4 rounded-md cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadDocument(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[var(--neutral-500)]" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
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

  // ── D1: Lineage strip — Q → SO → INV → WO → DO chips ───────────────
  const lineageChips = useMemo(() => {
    if (isNew || !parseRef(order.soNumber)) return null;
    const items = lineage(order.soNumber, ['Q', 'SO', 'INV', 'WO', 'DO'] as DocumentPrefix[]);
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {items.map(({ prefix, ref }, i) => {
          const href = resolveLineageHref(prefix, ref);
          const isCurrent = ref === order.soNumber;
          const exists = href !== null;
          const tooltip = isCurrent
            ? `${ref} — this order`
            : exists
              ? `Open ${ref}`
              : `${ref} — not yet generated`;
          const chip = (
            <span
              title={tooltip}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs tabular-nums transition-all',
                isCurrent
                  ? 'border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-400)]/15 text-foreground'
                  : exists
                    ? 'cursor-pointer border-[var(--border)] bg-card text-[var(--neutral-600)] hover:-translate-y-0.5 hover:border-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-400)]/10 hover:text-foreground hover:shadow-sm'
                    : 'cursor-not-allowed border-dashed border-[var(--border)] bg-card text-[var(--neutral-400)] opacity-70',
              )}
            >
              <strong className="font-semibold">{prefix}</strong>
              <span className="text-[var(--neutral-500)]">-</span>
              <span>{ref.slice(prefix.length + 1)}</span>
            </span>
          );
          return (
            <React.Fragment key={prefix}>
              {i > 0 && <span className="text-[var(--neutral-400)]">→</span>}
              {isCurrent ? (
                chip
              ) : exists ? (
                <Link to={href} aria-label={`Open ${ref}`}>
                  {chip}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    toast(`${ref} not yet generated`, {
                      description:
                        prefix === 'WO'
                          ? 'Work order will be created when this order enters production.'
                          : prefix === 'DO'
                            ? 'Delivery order will be created at dispatch.'
                            : prefix === 'INV'
                              ? 'Invoice will be created when items ship.'
                              : 'Linked document not yet created.',
                    })
                  }
                  aria-label={`${ref} — not yet generated`}
                >
                  {chip}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }, [isNew, order.soNumber]);

  const layout = (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: "Sell", href: "/sell" },
        { label: "Sales Orders", href: "/sell/orders" },
        { label: order.soNumber },
      ]}
      title={isNew ? 'New Sales Order' : order.title}
      subtitle={
        isNew ? (
          <span>Fill out the details below and click Save to create.</span>
        ) : (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">{order.soNumber}</span>
              <span>{order.customer}</span>
              <span className="tabular-nums">${order.value.toLocaleString()}</span>
            </div>
            {lineageChips}
          </div>
        )
      }
      metaRow={
        isNew ? null : (
          <>
            <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs", STATUS_BADGE[order.status])}>
              {order.status}
            </Badge>
            {order.opportunityId && (
              <Badge variant="outline" className="rounded-full border-[var(--border)]">
                <Link to={`/sell/opportunities/${order.opportunityId}`} className="hover:underline">
                  Opportunity
                </Link>
              </Badge>
            )}
          </>
        )
      }
      headerActions={
        <>
          <Button variant="outline" className="h-12 border-[var(--border)]" asChild>
            <Link to="/sell/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {editMode ? (
            <Button className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" onClick={handleSave}>
              Save
            </Button>
          ) : (
            <>
              <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => {
                // TODO(backend): salesOrders.sendEmail(order.id)
                toast.success('Email sent to customer');
              }}>
                <Mail className="mr-2 h-4 w-4" />
                Email Customer
              </Button>
              <Button className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" onClick={() => { toast('Printing\u2026'); window.print(); }}>
                <Printer className="mr-2 h-4 w-4" />
                Print Order
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

  return (
    <>
      {layout}
      {/* D2: Product picker — opens from Line Items tab "Add item" button. */}
      <EntityPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        kind="product"
        multiSelect
        items={products.map((p) => ({
          id: p.id,
          label: p.partNumber,
          sub: p.description,
          right: `$${p.unitPrice.toFixed(2)}`,
        }))}
        onSelect={handleProductsSelected}
        title="Add products"
      />
    </>
  );
}
