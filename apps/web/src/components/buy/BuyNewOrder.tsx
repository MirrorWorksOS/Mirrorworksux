/**
 * Buy New Order — full purchase order builder.
 * Route: /buy/orders/new
 *
 * Mirrors the structure of SellNewQuote (header fields · inline-editable
 * line items · right-hand totals · agent recommendation bar) and includes
 * two AI feature hooks (supplier recommendation + price anomaly) as
 * static affordances per the approved plan.
 */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft, FileText, Plus, Trash2, AlertTriangle, FileInput, Sparkles,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

import { products, suppliers, jobs, purchaseOrders } from '@/services';
import { auditService } from '@/services/auditService';

// ── Constants ─────────────────────────────────────────────
const TAX_OPTIONS = [
  { key: 'gst',      label: 'GST 10%',  rate: 0.10 },
  { key: 'gst_free', label: 'GST-free', rate: 0 },
  { key: 'export',   label: 'Export',   rate: 0 },
] as const;
type TaxKey = typeof TAX_OPTIONS[number]['key'];

const PAYMENT_TERMS = ['COD', 'Net 7', 'Net 14', 'Net 30', 'Net 45', 'Net 60'];
const SHIPPING_METHODS = ['Road Freight', 'Pickup', 'Courier', 'Freight Forwarder'];

// ── Types ─────────────────────────────────────────────────
interface LineItem {
  id: string;
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxKey: TaxKey;
}

const newLine = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  productId: '',
  description: '',
  qty: 1,
  unitPrice: 0,
  taxKey: 'gst',
});

// ── Helpers ───────────────────────────────────────────────
const fmtCurrency = (n: number) =>
  n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function nextPoNumber(): string {
  const thisYear = 2026;
  const max = purchaseOrders
    .map(p => p.poNumber.match(new RegExp(`^PO-${thisYear}-(\\d{4})$`)))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map(m => parseInt(m[1], 10))
    .reduce((a, b) => Math.max(a, b), 0);
  return `PO-${thisYear}-${String(max + 1).padStart(4, '0')}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Price anomaly threshold (spec §8.3) — 10% above catalogue unitPrice
const ANOMALY_PCT = 0.10;
function priceAnomaly(line: LineItem): { deltaPct: number; historical: number } | null {
  if (!line.productId || line.unitPrice <= 0) return null;
  const p = products.find(x => x.id === line.productId);
  if (!p || p.unitPrice <= 0) return null;
  const deltaPct = (line.unitPrice - p.unitPrice) / p.unitPrice;
  return deltaPct > ANOMALY_PCT ? { deltaPct, historical: p.unitPrice } : null;
}

// ── Component ─────────────────────────────────────────────
export function BuyNewOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poNumber = useMemo(nextPoNumber, []);
  const today = '2026-04-22';

  // Optional context from launches: Supplier → New PO, Requisition → Convert to PO.
  const linkedSupplierId    = searchParams.get('supplierId') ?? '';
  const linkedRequisitionId = searchParams.get('requisitionId') ?? '';

  const [supplierId, setSupplierId] = useState<string>(linkedSupplierId);
  const [orderDate, setOrderDate] = useState(today);
  const [deliveryDate, setDeliveryDate] = useState(addDays(today, 7));
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [shippingMethod, setShippingMethod] = useState('Road Freight');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [jobId, setJobId] = useState<string>(linkedRequisitionId);
  const [supplierNotes, setSupplierNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([newLine()]);

  const supplier = suppliers.find(s => s.id === supplierId);

  // Totals
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const tax = lines.reduce((s, l) => {
    const rate = TAX_OPTIONS.find(o => o.key === l.taxKey)?.rate ?? 0;
    return s + l.qty * l.unitPrice * rate;
  }, 0);
  const total = subtotal + tax;

  // ── Line ops ─────────────────────────────────────────────
  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setLines(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));

  const addProductLine = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    setLines(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        productId: p.id,
        description: p.description,
        qty: 1,
        unitPrice: p.unitPrice,
        taxKey: 'gst',
      },
    ]);
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  // ── Supplier change → auto-populate payment terms + unit prices ────
  const onSupplierChange = (newId: string) => {
    setSupplierId(newId);
    const sup = suppliers.find(s => s.id === newId);
    if (sup?.paymentTerms) setPaymentTerms(sup.paymentTerms);
    // MVP: no supplier-specific price list — line prices stay at catalogue default.
  };

  // ── AI hooks ────────────────────────────────────────────
  const nonEmptyLines = lines.filter(l => l.productId);
  const topSupplierRec = useMemo(() => {
    if (supplierId || nonEmptyLines.length < 1) return null;
    // Pick highest-rated supplier — hook §8.2. Real impl: score by product history + OTD.
    return [...suppliers].sort(
      (a, b) => b.rating - a.rating || b.onTimePercent - a.onTimePercent,
    )[0];
  }, [supplierId, nonEmptyLines.length]);

  const anomalies = lines
    .map(l => ({ line: l, anomaly: priceAnomaly(l) }))
    .filter((x): x is { line: LineItem; anomaly: NonNullable<ReturnType<typeof priceAnomaly>> } => x.anomaly !== null);

  // ── Actions ────────────────────────────────────────────
  const poDraftId = useMemo(() => `po-draft-${Math.random().toString(36).slice(2, 8)}`, []);

  const canSubmit = supplierId && nonEmptyLines.length > 0;

  const saveDraft = () => {
    auditService.record({
      actorId: 'emp-005', // Priya Sharma (procurement)
      actorType: 'user',
      entityType: 'purchase_order',
      entityId: poDraftId,
      action: 'created',
      description: `Created purchase order ${poNumber} (draft)`,
      metadata: { poNumber, supplierId, lineCount: nonEmptyLines.length, total },
    });
    toast.success('PO saved as draft');
    navigate('/buy/orders');
  };

  const sendToSupplier = () => {
    if (!canSubmit) {
      toast.error('Add a supplier and at least one line item before sending.');
      return;
    }
    auditService.record({
      actorId: 'emp-005',
      actorType: 'user',
      entityType: 'purchase_order',
      entityId: poDraftId,
      action: 'created',
      description: `Created purchase order ${poNumber}`,
      metadata: { poNumber, supplierId, lineCount: nonEmptyLines.length, total },
    });
    auditService.record({
      actorId: 'emp-005',
      actorType: 'user',
      entityType: 'purchase_order',
      entityId: poDraftId,
      action: 'sent',
      description: `Sent to ${supplier?.company ?? 'supplier'}`,
      metadata: { recipient: supplier?.email },
    });
    toast.success(`PO sent to ${supplier?.company ?? 'supplier'}`);
    navigate('/buy/orders');
  };

  // ── Columns ────────────────────────────────────────────
  const columns: MwColumnDef<LineItem>[] = [
    {
      key: 'product',
      header: 'Product',
      className: 'w-[34%] px-3 py-2',
      cell: (row) => (
        <Select
          value={row.productId}
          onValueChange={(v) => {
            const p = products.find(x => x.id === v);
            if (!p) return;
            updateLine(row.id, {
              productId: p.id,
              description: p.description,
              unitPrice: row.unitPrice > 0 ? row.unitPrice : p.unitPrice,
            });
          }}
        >
          <SelectTrigger className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm">
            <SelectValue placeholder="Select product…" />
          </SelectTrigger>
          <SelectContent>
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <span className="tabular-nums text-xs text-[var(--neutral-500)] mr-2">{p.partNumber}</span>
                {p.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      className: 'w-[26%] px-3 py-2',
      cell: (row) => (
        <Input
          value={row.description}
          onChange={e => updateLine(row.id, { description: e.target.value })}
          placeholder="Description"
          className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm"
        />
      ),
    },
    {
      key: 'qty',
      header: 'Qty',
      headerClassName: 'text-right',
      className: 'w-[8%] px-3 py-2',
      cell: (row) => (
        <Input
          type="number"
          value={row.qty}
          onChange={e => updateLine(row.id, { qty: parseFloat(e.target.value) || 0 })}
          className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm text-right tabular-nums"
        />
      ),
    },
    {
      key: 'unitPrice',
      header: 'Unit price',
      headerClassName: 'text-right',
      className: 'w-[12%] px-3 py-2',
      cell: (row) => {
        const anomaly = priceAnomaly(row);
        return (
          <Input
            type="number"
            value={row.unitPrice}
            onChange={e => updateLine(row.id, { unitPrice: parseFloat(e.target.value) || 0 })}
            className={cn(
              'h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm text-right tabular-nums',
              anomaly && 'text-[var(--mw-warning)] font-medium',
            )}
          />
        );
      },
    },
    {
      key: 'tax',
      header: 'Tax',
      className: 'w-[10%] px-3 py-2',
      cell: (row) => (
        <Select
          value={row.taxKey}
          onValueChange={(v) => updateLine(row.id, { taxKey: v as TaxKey })}
        >
          <SelectTrigger className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAX_OPTIONS.map(o => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headerClassName: 'text-right',
      className: 'w-[10%] px-3 py-2 text-right font-medium tabular-nums whitespace-nowrap',
      cell: (row) => `$${fmtCurrency(row.qty * row.unitPrice)}`,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-8 px-2 py-2',
      cell: (row) => (
        <button
          onClick={() => removeLine(row.id)}
          aria-label="Remove line"
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[var(--neutral-100)] rounded transition-all"
        >
          <Trash2 className="w-4 h-4 text-[var(--mw-error)]" />
        </button>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--neutral-100)]">
      {/* Top bar */}
      <div className="bg-card border-b border-[var(--border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--neutral-500)]" />
              <span className="text-sm font-medium tabular-nums text-foreground">{poNumber}</span>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs rounded-full px-2">Draft</Badge>
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">New purchase order</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConfirmDialog
            trigger={
              <Button variant="outline" className="border-[var(--border)] h-10">Discard</Button>
            }
            title="Discard this purchase order?"
            description="All unsaved changes will be lost. This cannot be undone."
            confirmLabel="Discard"
            variant="warning"
            onConfirm={() => navigate(-1)}
          />
          <Button variant="outline" className="border-[var(--border)] h-10" onClick={saveDraft}>
            Save draft
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-10 gap-2"
            onClick={sendToSupplier}
          >
            <FileText className="w-4 h-4" />
            Send to supplier
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* PO details */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Order details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-sm mb-2 block font-medium">Supplier *</Label>
                    <Select value={supplierId} onValueChange={onSupplierChange}>
                      <SelectTrigger className="h-12 border-[var(--border)] rounded">
                        <SelectValue placeholder="Select supplier…" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            <span>{s.company}</span>
                            <span className="ml-2 text-xs text-[var(--neutral-500)]">
                              · {s.category} · {s.onTimePercent}% OTD
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Order date *</Label>
                    <Input
                      type="date"
                      value={orderDate}
                      onChange={e => setOrderDate(e.target.value)}
                      className="h-12 border-[var(--border)] rounded"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Expected delivery *</Label>
                    <Input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="h-12 border-[var(--border)] rounded"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Payment terms</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger className="h-12 border-[var(--border)] rounded"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Shipping method</Label>
                    <Select value={shippingMethod} onValueChange={setShippingMethod}>
                      <SelectTrigger className="h-12 border-[var(--border)] rounded"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SHIPPING_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm mb-2 block font-medium">Delivery address</Label>
                    <Textarea
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      rows={2}
                      placeholder="Defaults to your warehouse address if left blank"
                      className="border-[var(--border)] rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm mb-2 block font-medium">Job reference</Label>
                    <Select value={jobId} onValueChange={setJobId}>
                      <SelectTrigger className="h-12 border-[var(--border)] rounded">
                        <SelectValue placeholder="Link to a job (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map(j => (
                          <SelectItem key={j.id} value={j.id}>
                            <span className="tabular-nums mr-2">{j.jobNumber}</span>
                            {j.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Supplier recommendation (hook §8.2) */}
              {topSupplierRec && (
                <AIInsightCard
                  title="Supplier recommendation"
                  actionLabel={`Apply ${topSupplierRec.company}`}
                  onAction={() => {
                    onSupplierChange(topSupplierRec.id);
                    toast.success(`Supplier set to ${topSupplierRec.company}`);
                  }}
                  updatedAt="just now"
                >
                  Based on rating and on-time delivery,{' '}
                  <strong className="text-foreground">{topSupplierRec.company}</strong> is recommended for{' '}
                  {nonEmptyLines.length} of your line item{nonEmptyLines.length !== 1 ? 's' : ''}.
                  Rated {topSupplierRec.rating}/5 with{' '}
                  <strong className="text-foreground">{topSupplierRec.onTimePercent}% on-time</strong>{' '}
                  delivery.
                </AIInsightCard>
              )}

              {/* Line items */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-foreground">Line items</h3>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(v) => { if (v) addProductLine(v); }}>
                      <SelectTrigger className="h-9 border-[var(--border)] w-56 text-sm">
                        <SelectValue placeholder="Add from catalogue…" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="tabular-nums text-xs text-[var(--neutral-500)] mr-2">{p.partNumber}</span>
                            {p.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 border-[var(--border)]"
                      onClick={() => navigate('/buy/requisitions')}
                    >
                      <FileInput className="w-3.5 h-3.5" />
                      Import from Requisition
                    </Button>
                  </div>
                </div>

                <MwDataTable<LineItem>
                  columns={columns}
                  data={lines}
                  keyExtractor={(row) => row.id}
                  className="rounded-none border-0 shadow-none"
                />

                {/* Price anomaly banner(s) — hook §8.3 */}
                {anomalies.length > 0 && (
                  <div className="border-t border-[var(--border)] bg-[var(--mw-amber-50)] px-4 py-3 space-y-1.5">
                    {anomalies.map(({ line, anomaly }) => {
                      const p = products.find(x => x.id === line.productId);
                      return (
                        <div key={line.id} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[var(--mw-warning)] mt-0.5" />
                          <span className="text-[var(--neutral-700)]">
                            <strong className="text-foreground">{p?.partNumber ?? 'Line'}</strong>{' '}
                            unit price {(anomaly.deltaPct * 100).toFixed(0)}% above catalogue average
                            (${fmtCurrency(anomaly.historical)}). Typical range ±10%.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => setLines(prev => [...prev, newLine()])}
                    className="flex items-center gap-2 text-sm text-[var(--neutral-500)] hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add line item
                  </button>
                </div>
              </Card>

              {/* Notes */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6 space-y-4">
                <div>
                  <Label className="text-sm mb-2 block font-medium">Supplier notes</Label>
                  <Textarea
                    value={supplierNotes}
                    onChange={e => setSupplierNotes(e.target.value)}
                    rows={2}
                    placeholder="Instructions visible to the supplier (e.g. delivery hours, marking)"
                    className="bg-[var(--neutral-100)] border-transparent rounded-lg text-sm resize-none focus:bg-background focus:border-[var(--mw-mirage)]"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block font-medium">Internal notes</Label>
                  <Textarea
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    rows={2}
                    placeholder="Only visible to your team"
                    className="bg-[var(--neutral-100)] border-transparent rounded-lg text-sm resize-none focus:bg-background focus:border-[var(--mw-mirage)]"
                  />
                </div>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Order summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Subtotal</span>
                    <span className="font-medium tabular-nums">${fmtCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">GST</span>
                    <span className="font-medium tabular-nums">${fmtCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-foreground">Total (inc. GST)</span>
                    <span className="tabular-nums text-foreground">${fmtCurrency(total)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Line items</dt>
                    <dd className="font-medium tabular-nums">{nonEmptyLines.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--neutral-500)]">Expected delivery</dt>
                    <dd className="font-medium">
                      {new Date(deliveryDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Quick info */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6 space-y-4">
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">PO number</p>
                  <p className="text-sm font-medium tabular-nums">{poNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">Payment terms</p>
                  <p className="text-sm font-medium">{paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">Supplier contact</p>
                  {supplier ? (
                    <div>
                      <p className="text-sm font-medium">{supplier.contact}</p>
                      <p className="text-xs text-[var(--neutral-500)]">{supplier.email}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--neutral-400)]">Select a supplier</p>
                  )}
                </div>
                {supplier && (
                  <div className="flex items-center gap-2 rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--mw-mirage)] shrink-0" />
                    <p className="text-xs text-[var(--neutral-600)]">
                      {supplier.onTimePercent}% on-time · rated {supplier.rating}/5
                    </p>
                  </div>
                )}
              </Card>

              <Button
                className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-12 gap-2"
                onClick={sendToSupplier}
              >
                <FileText className="w-4 h-4" /> Send to supplier
              </Button>
              <Button
                variant="outline"
                className="w-full border-[var(--border)] h-10"
                onClick={() => toast('Generating PDF preview…')}
              >
                Preview PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
