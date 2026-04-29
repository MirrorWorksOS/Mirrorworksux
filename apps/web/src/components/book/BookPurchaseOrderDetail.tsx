/**
 * BookPurchaseOrderDetail — Purchase Order create + view/edit screen for the Book module.
 * Route: /book/purchases/new  (create mode, no :id param)
 *        /book/purchases/:id   (view/edit mode)
 *
 * Modelled on BuyNewOrder.tsx but finance-module-native:
 *  - Returns to /book/purchases after save
 *  - Dual mode: create (empty form) vs view (read-only + editable toggle)
 *  - No tabs / Delivery / Xero panels — Book needs the finance lens only
 */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, FileText, Plus, Trash2, AlertTriangle, Pencil,
  Download, XCircle, Send, CheckCircle2, AlertCircle, Circle,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

import { products, suppliers, jobs, purchaseOrders } from '@/services';
import { auditService } from '@/services/auditService';

// ── Constants ──────────────────────────────────────────────────────────────

const TAX_OPTIONS = [
  { key: 'gst',      label: 'GST 10%',  rate: 0.10 },
  { key: 'gst_free', label: 'GST-free', rate: 0 },
  { key: 'export',   label: 'Export',   rate: 0 },
] as const;
type TaxKey = typeof TAX_OPTIONS[number]['key'];

const PAYMENT_TERMS = ['COD', 'Net 7', 'Net 14', 'Net 30', 'Net 45', 'Net 60'];
const SHIPPING_METHODS = ['Road Freight', 'Pickup', 'Courier', 'Freight Forwarder'];

type POStatus = 'Draft' | 'Sent' | 'Acknowledged' | 'Partial' | 'Received' | 'Cancelled';

const STATUS_KEY_MAP: Record<POStatus, StatusKey> = {
  Draft: 'draft',
  Sent: 'sent',
  Acknowledged: 'approved',
  Partial: 'partiallyPaid',
  Received: 'delivered',
  Cancelled: 'cancelled',
};

// ── Book module PO list data (mirrored from PurchaseOrders.tsx) ─────────────

interface BookPO {
  id: string;
  vendor: string;
  orderDate: string;
  expectedDelivery: string;
  status: POStatus;
  total: number;
  jobRef: string;
  match: 'green' | 'yellow' | 'grey';
  paymentTerms: string;
  shippingMethod: string;
  supplierNotes: string;
  internalNotes: string;
}

const BOOK_POS: BookPO[] = [
  { id: 'PO-2026-034', vendor: 'Blackwoods Steel', orderDate: '22 Feb 2026', expectedDelivery: '01 Mar 2026', status: 'Sent', total: 4850, jobRef: 'JOB-2026-0012', match: 'grey', paymentTerms: 'Net 30', shippingMethod: 'Road Freight', supplierNotes: '', internalNotes: 'Steel for mounting bracket job.' },
  { id: 'PO-2026-033', vendor: 'BOC Gas', orderDate: '20 Feb 2026', expectedDelivery: '25 Feb 2026', status: 'Received', total: 670, jobRef: '—', match: 'green', paymentTerms: 'Net 14', shippingMethod: 'Courier', supplierNotes: '', internalNotes: '' },
  { id: 'PO-2026-032', vendor: 'OneSteel', orderDate: '18 Feb 2026', expectedDelivery: '28 Feb 2026', status: 'Partial', total: 12300, jobRef: 'JOB-2026-0010', match: 'yellow', paymentTerms: 'Net 30', shippingMethod: 'Road Freight', supplierNotes: 'Please palletise orders over 500kg.', internalNotes: 'Awaiting 2nd delivery.' },
  { id: 'PO-2026-031', vendor: 'Kemppi', orderDate: '15 Feb 2026', expectedDelivery: '22 Feb 2026', status: 'Received', total: 2100, jobRef: '—', match: 'green', paymentTerms: 'Net 30', shippingMethod: 'Courier', supplierNotes: '', internalNotes: '' },
  { id: 'PO-2026-030', vendor: 'Dulux Powder Coats', orderDate: '12 Feb 2026', expectedDelivery: '19 Feb 2026', status: 'Received', total: 1450, jobRef: 'JOB-2026-0012', match: 'green', paymentTerms: 'Net 14', shippingMethod: 'Pickup', supplierNotes: '', internalNotes: 'Colour: Ironstone Satin.' },
  { id: 'PO-2026-029', vendor: 'Bolt & Nut', orderDate: '10 Feb 2026', expectedDelivery: '15 Feb 2026', status: 'Received', total: 340, jobRef: '—', match: 'green', paymentTerms: 'COD', shippingMethod: 'Courier', supplierNotes: '', internalNotes: '' },
  { id: 'PO-2026-028', vendor: 'Lincoln Electric', orderDate: '08 Feb 2026', expectedDelivery: '14 Feb 2026', status: 'Draft', total: 2800, jobRef: 'JOB-2026-0008', match: 'grey', paymentTerms: 'Net 30', shippingMethod: 'Road Freight', supplierNotes: '', internalNotes: 'Pending manager sign-off.' },
  { id: 'PO-2026-027', vendor: 'Freight Corp', orderDate: '05 Feb 2026', expectedDelivery: '12 Feb 2026', status: 'Cancelled', total: 450, jobRef: '—', match: 'grey', paymentTerms: 'Net 7', shippingMethod: 'Road Freight', supplierNotes: '', internalNotes: 'Supplier unable to fulfil. Cancelled 10 Feb.' },
];

// ── Mock line items for view mode ─────────────────────────────────────────

interface ViewLine {
  num: number;
  product: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxLabel: string;
  taxRate: number;
}

const MOCK_PO_LINES: Record<string, ViewLine[]> = {
  'PO-2026-034': [
    { num: 1, product: 'MS-3MM-2400', description: 'Mild Steel 3mm Sheet 2400×1200', qty: 10, unitPrice: 285, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'MS-5MM-2400', description: 'Mild Steel 5mm Sheet 2400×1200', qty: 5, unitPrice: 390, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 3, product: 'SHS-50X50', description: '50×50×3 SHS — 6m length', qty: 12, unitPrice: 68, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-033': [
    { num: 1, product: 'BOC-AR75', description: 'Argon 75 / CO₂ 25 Mix — 50L', qty: 4, unitPrice: 148, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'BOC-O2', description: 'Oxygen Industrial — 50L', qty: 1, unitPrice: 82, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-032': [
    { num: 1, product: 'OS-HR3', description: 'HR Steel Plate 3mm — 2400×1200', qty: 20, unitPrice: 260, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'OS-HR6', description: 'HR Steel Plate 6mm — 2400×1200', qty: 8, unitPrice: 485, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 3, product: 'OS-FLAT30', description: 'Flat Bar 30×5 — 6m', qty: 15, unitPrice: 32, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-031': [
    { num: 1, product: 'KMP-MIG350', description: 'Kemppi MinarcMig 350 Welder', qty: 1, unitPrice: 1800, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'KMP-ACC', description: 'Welding Accessories Kit', qty: 1, unitPrice: 300, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-030': [
    { num: 1, product: 'DPC-IS-SATIN', description: 'Powder Coat — Ironstone Satin per kg', qty: 20, unitPrice: 48, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'DPC-LABOUR', description: 'Application Labour', qty: 4, unitPrice: 85, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-029': [
    { num: 1, product: 'BN-M10HEX', description: 'M10 Hex Bolt Gr 8.8 — 100pk', qty: 5, unitPrice: 28, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'BN-M8NUT', description: 'M8 Nyloc Nut — 100pk', qty: 4, unitPrice: 14, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 3, product: 'BN-WASH', description: 'M10 Flat Washer — 200pk', qty: 2, unitPrice: 18, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-028': [
    { num: 1, product: 'LE-MIG350', description: 'Lincoln Electric Invertec MIG 350', qty: 1, unitPrice: 2300, taxLabel: 'GST 10%', taxRate: 0.1 },
    { num: 2, product: 'LE-WIRE', description: 'MIG Wire 0.9mm 15kg — 2pk', qty: 2, unitPrice: 125, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
  'PO-2026-027': [
    { num: 1, product: 'FC-PALL', description: 'Pallet Freight — Metro', qty: 2, unitPrice: 225, taxLabel: 'GST 10%', taxRate: 0.1 },
  ],
};

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

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

const ANOMALY_PCT = 0.10;
function priceAnomaly(line: LineItem): { deltaPct: number; historical: number } | null {
  if (!line.productId || line.unitPrice <= 0) return null;
  const p = products.find(x => x.id === line.productId);
  if (!p || p.unitPrice <= 0) return null;
  const deltaPct = (line.unitPrice - p.unitPrice) / p.unitPrice;
  return deltaPct > ANOMALY_PCT ? { deltaPct, historical: p.unitPrice } : null;
}

// ── Match icon (for view mode) ─────────────────────────────────────────────

function MatchIcon({ match }: { match: string }) {
  if (match === 'green') return <CheckCircle2 className="w-4 h-4 text-[var(--mw-success)]" />;
  if (match === 'yellow') return <AlertCircle className="w-4 h-4 text-[var(--mw-yellow-400)]" />;
  return <Circle className="w-4 h-4 text-[var(--neutral-300)]" />;
}

// ── Field display (view mode) ──────────────────────────────────────────────

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[var(--neutral-500)] mb-0.5">{label}</p>
      <p className={cn('text-sm font-medium text-foreground', mono && 'tabular-nums font-mono')}>{value || <span className="text-[var(--neutral-400)] font-normal">—</span>}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function BookPurchaseOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreate = !id;

  // ── View mode state ──────────────────────────────────────────────────────
  const po = id ? BOOK_POS.find(p => p.id === id) : null;
  const [isEditing, setIsEditing] = useState(false);
  const viewLines = id ? (MOCK_PO_LINES[id] ?? []) : [];

  // ── Create mode state ────────────────────────────────────────────────────
  const poNumber = useMemo(nextPoNumber, []);
  const today = '2026-04-29';

  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate]   = useState(today);
  const [deliveryDate, setDeliveryDate] = useState(addDays(today, 7));
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [shippingMethod, setShippingMethod] = useState('Road Freight');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [jobId, setJobId] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([newLine()]);

  // Edit mode state (view mode when editing)
  const [editPaymentTerms, setEditPaymentTerms] = useState(po?.paymentTerms ?? 'Net 30');
  const [editSupplierNotes, setEditSupplierNotes] = useState(po?.supplierNotes ?? '');
  const [editInternalNotes, setEditInternalNotes] = useState(po?.internalNotes ?? '');

  const supplier = suppliers.find(s => s.id === supplierId);

  // Create-mode totals
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const tax      = lines.reduce((s, l) => {
    const rate = TAX_OPTIONS.find(o => o.key === l.taxKey)?.rate ?? 0;
    return s + l.qty * l.unitPrice * rate;
  }, 0);
  const total = subtotal + tax;

  // View-mode totals
  const viewSubtotal = viewLines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const viewTax      = viewLines.reduce((s, l) => s + l.qty * l.unitPrice * l.taxRate, 0);

  // ── Line item ops (create mode) ──────────────────────────────────────────
  const updateLine = (lid: string, patch: Partial<LineItem>) =>
    setLines(prev => prev.map(l => (l.id === lid ? { ...l, ...patch } : l)));

  const addProductLine = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    setLines(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      productId: p.id,
      description: p.description,
      qty: 1,
      unitPrice: p.unitPrice,
      taxKey: 'gst',
    }]);
  };

  const removeLine = (lid: string) =>
    setLines(prev => prev.filter(l => l.id !== lid));

  // ── Supplier change ──────────────────────────────────────────────────────
  const onSupplierChange = (newId: string) => {
    setSupplierId(newId);
    const sup = suppliers.find(s => s.id === newId);
    if (sup?.paymentTerms) setPaymentTerms(sup.paymentTerms);
  };

  // ── AI hooks ─────────────────────────────────────────────────────────────
  const nonEmptyLines = lines.filter(l => l.productId);
  const topSupplierRec = useMemo(() => {
    if (supplierId || nonEmptyLines.length < 1) return null;
    return [...suppliers].sort(
      (a, b) => b.rating - a.rating || b.onTimePercent - a.onTimePercent,
    )[0];
  }, [supplierId, nonEmptyLines.length]);

  const anomalies = lines
    .map(l => ({ line: l, anomaly: priceAnomaly(l) }))
    .filter((x): x is { line: LineItem; anomaly: NonNullable<ReturnType<typeof priceAnomaly>> } => x.anomaly !== null);

  // ── Create mode actions ───────────────────────────────────────────────────
  const poDraftId = useMemo(() => `po-book-${Math.random().toString(36).slice(2, 8)}`, []);
  const canSubmit = supplierId && nonEmptyLines.length > 0;

  const saveDraft = () => {
    auditService.record({
      actorId: 'emp-001',
      actorType: 'user',
      entityType: 'purchase_order',
      entityId: poDraftId,
      action: 'created',
      description: `Created purchase order ${poNumber} (draft)`,
      metadata: { poNumber, supplierId, lineCount: nonEmptyLines.length, total },
    });
    toast.success('Draft saved');
    navigate('/book/purchases');
  };

  const sendToSupplier = () => {
    if (!canSubmit) {
      toast.error('Add a supplier and at least one line item before sending.');
      return;
    }
    const sup = suppliers.find(s => s.id === supplierId);
    auditService.record({
      actorId: 'emp-001',
      actorType: 'user',
      entityType: 'purchase_order',
      entityId: poDraftId,
      action: 'sent',
      description: `Sent ${poNumber} to ${sup?.company ?? 'supplier'}`,
      metadata: { recipient: sup?.email },
    });
    toast.success(`Purchase order sent to ${sup?.company ?? 'supplier'}`);
    navigate('/book/purchases');
  };

  // ── Create mode columns ──────────────────────────────────────────────────
  const createColumns: MwColumnDef<LineItem>[] = [
    {
      key: 'product',
      header: 'Product',
      className: 'w-[32%] px-3 py-2',
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
        <Select value={row.taxKey} onValueChange={(v) => updateLine(row.id, { taxKey: v as TaxKey })}>
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

  // ── View mode columns ─────────────────────────────────────────────────────
  interface ViewLineRow extends ViewLine { _id: string }
  const viewLineRows: ViewLineRow[] = viewLines.map(l => ({ ...l, _id: String(l.num) }));

  const viewColumns: MwColumnDef<ViewLineRow>[] = [
    {
      key: 'num',
      header: '#',
      className: 'w-8 px-3 py-2 text-[var(--neutral-400)] tabular-nums text-xs',
      cell: (row) => row.num,
    },
    {
      key: 'product',
      header: 'Product',
      className: 'px-3 py-2',
      cell: (row) => (
        <div>
          <p className="text-xs tabular-nums text-[var(--neutral-500)] font-medium">{row.product}</p>
          <p className="text-sm text-foreground">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'qty',
      header: 'Qty',
      headerClassName: 'text-right',
      className: 'w-16 px-3 py-2 text-right tabular-nums text-sm',
      cell: (row) => row.qty,
    },
    {
      key: 'unitPrice',
      header: 'Unit price',
      headerClassName: 'text-right',
      className: 'w-28 px-3 py-2 text-right tabular-nums text-sm',
      cell: (row) => `$${fmtCurrency(row.unitPrice)}`,
    },
    {
      key: 'tax',
      header: 'Tax',
      className: 'w-24 px-3 py-2',
      cell: (row) => <span className="text-xs text-[var(--neutral-500)]">{row.taxLabel}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      headerClassName: 'text-right',
      className: 'w-28 px-3 py-2 text-right font-medium tabular-nums whitespace-nowrap text-sm',
      cell: (row) => `$${fmtCurrency(row.qty * row.unitPrice)}`,
    },
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // VIEW MODE — existing PO detail
  // ═════════════════════════════════════════════════════════════════════════
  if (!isCreate) {
    if (!po) {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="bg-card border-b border-[var(--border)] px-6 py-4 flex items-center gap-4 shrink-0">
            <button onClick={() => navigate('/book/purchases')} className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors" aria-label="Back">
              <ArrowLeft className="w-4 h-4 text-[var(--neutral-500)]" />
            </button>
            <p className="text-sm text-[var(--neutral-500)]">Purchase order not found.</p>
          </div>
        </div>
      );
    }

    const statusKey = STATUS_KEY_MAP[po.status];
    const isReadOnly = ['Received', 'Cancelled'].includes(po.status);
    const isSent     = ['Sent', 'Acknowledged', 'Partial'].includes(po.status);

    return (
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="bg-card border-b border-[var(--border)] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/book/purchases')}
              className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--neutral-500)]" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[var(--neutral-500)]" />
                <span className="text-sm font-semibold tabular-nums text-foreground">{po.id}</span>
                <StatusBadge status={statusKey}>{po.status}</StatusBadge>
                {po.match !== 'grey' && (
                  <div className="flex items-center gap-1">
                    <MatchIcon match={po.match} />
                    <span className="text-xs text-[var(--neutral-500)]">3-way match</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{po.vendor} · {po.orderDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && !isEditing && (
              <Button
                variant="outline"
                className="border-[var(--border)] h-10 gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="outline" className="border-[var(--border)] h-10" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-10"
                  onClick={() => { toast.success('Changes saved'); setIsEditing(false); }}
                >
                  Save changes
                </Button>
              </>
            )}
            {po.status === 'Draft' && !isEditing && (
              <Button
                className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-10 gap-2"
                onClick={() => toast.success(`Purchase order sent to ${po.vendor}`)}
              >
                <Send className="w-3.5 h-3.5" /> Send to supplier
              </Button>
            )}
            <Button variant="outline" className="border-[var(--border)] h-10 gap-2" onClick={() => toast('Generating PDF…')}>
              <Download className="w-3.5 h-3.5" /> PDF
            </Button>
            {!isReadOnly && !isEditing && (
              <ConfirmDialog
                trigger={
                  <Button variant="outline" className="border-[var(--border)] h-10 gap-2 text-[var(--mw-error)] hover:text-[var(--mw-error)]">
                    <XCircle className="w-3.5 h-3.5" /> Cancel PO
                  </Button>
                }
                title="Cancel this purchase order?"
                description="The supplier will be notified. This cannot be undone."
                confirmLabel="Cancel PO"
                variant="warning"
                onConfirm={() => { toast.success('Purchase order cancelled'); navigate('/book/purchases'); }}
              />
            )}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {isSent && po.match === 'yellow' && (
              <div className="flex items-start gap-2 rounded-lg bg-[var(--mw-amber-50)] border border-[var(--mw-warning)]/20 px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--mw-warning)] mt-0.5" />
                <span className="text-[var(--neutral-700)]">
                  <strong className="text-foreground">Three-way match variance detected.</strong>{' '}
                  Received quantities differ from ordered quantities on one or more lines. Review before approving the vendor bill.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Order details card */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Order details</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label className="text-sm mb-2 block font-medium">Supplier</Label>
                        <Input value={po.vendor} readOnly className="h-12 border-[var(--border)] rounded bg-[var(--neutral-50)] text-[var(--neutral-600)] cursor-not-allowed" />
                        <p className="text-xs text-[var(--neutral-400)] mt-1">Supplier cannot be changed on a sent order.</p>
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block font-medium">Order date</Label>
                        <Input value={po.orderDate} readOnly className="h-12 border-[var(--border)] rounded bg-[var(--neutral-50)] text-[var(--neutral-600)] cursor-not-allowed" />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block font-medium">Expected delivery</Label>
                        <Input value={po.expectedDelivery} readOnly className="h-12 border-[var(--border)] rounded bg-[var(--neutral-50)] text-[var(--neutral-600)] cursor-not-allowed" />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block font-medium">Payment terms</Label>
                        <Select value={editPaymentTerms} onValueChange={setEditPaymentTerms}>
                          <SelectTrigger className="h-12 border-[var(--border)] rounded"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block font-medium">Job reference</Label>
                        <Input value={po.jobRef === '—' ? '' : po.jobRef} readOnly className="h-12 border-[var(--border)] rounded bg-[var(--neutral-50)] text-[var(--neutral-600)] cursor-not-allowed" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm mb-2 block font-medium">Supplier notes</Label>
                        <Textarea value={editSupplierNotes} onChange={e => setEditSupplierNotes(e.target.value)} rows={2} className="border-[var(--border)] rounded text-sm resize-none" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm mb-2 block font-medium">Internal notes</Label>
                        <Textarea value={editInternalNotes} onChange={e => setEditInternalNotes(e.target.value)} rows={2} className="border-[var(--border)] rounded text-sm resize-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div className="col-span-2">
                        <Field label="Supplier" value={po.vendor} />
                      </div>
                      <Field label="Order date" value={po.orderDate} mono />
                      <Field label="Expected delivery" value={po.expectedDelivery} mono />
                      <Field label="Payment terms" value={po.paymentTerms} />
                      <Field label="Shipping method" value={po.shippingMethod} />
                      <Field label="Job reference" value={po.jobRef !== '—' ? (
                        <span style={{ color: 'var(--mw-info)' }}>{po.jobRef}</span>
                      ) : undefined} />
                      <Field label="3-way match" value={
                        <span className="flex items-center gap-1.5">
                          <MatchIcon match={po.match} />
                          <span className="text-sm text-[var(--neutral-600)]">
                            {po.match === 'green' ? 'Fully matched' : po.match === 'yellow' ? 'Minor variance' : 'Pending'}
                          </span>
                        </span>
                      } />
                      {po.supplierNotes && (
                        <div className="col-span-2">
                          <Field label="Supplier notes" value={po.supplierNotes} />
                        </div>
                      )}
                      {po.internalNotes && (
                        <div className="col-span-2">
                          <Field label="Internal notes" value={<span className="text-[var(--neutral-600)]">{po.internalNotes}</span>} />
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                {/* Line items */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Line items</h3>
                    <span className="text-xs text-[var(--neutral-400)]">{viewLines.length} item{viewLines.length !== 1 ? 's' : ''}</span>
                  </div>
                  <MwDataTable<ViewLineRow>
                    columns={viewColumns}
                    data={viewLineRows}
                    keyExtractor={(row) => row._id}
                    className="rounded-none border-0 shadow-none"
                    striped
                  />
                  {/* Totals footer */}
                  <div className="border-t border-[var(--border)] px-4 py-4 flex justify-end">
                    <dl className="space-y-1.5 text-sm w-56">
                      <div className="flex justify-between">
                        <dt className="text-[var(--neutral-500)]">Subtotal</dt>
                        <dd className="tabular-nums font-medium">${fmtCurrency(viewSubtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[var(--neutral-500)]">GST</dt>
                        <dd className="tabular-nums font-medium">${fmtCurrency(viewTax)}</dd>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-base font-semibold">
                        <dt>Total (inc. GST)</dt>
                        <dd className="tabular-nums">${fmtCurrency(viewSubtotal + viewTax)}</dd>
                      </div>
                    </dl>
                  </div>
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Order summary</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-[var(--neutral-500)]">Subtotal</dt>
                      <dd className="font-medium tabular-nums">${fmtCurrency(viewSubtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--neutral-500)]">GST</dt>
                      <dd className="font-medium tabular-nums">${fmtCurrency(viewTax)}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-semibold">
                      <dt>Total (inc. GST)</dt>
                      <dd className="tabular-nums">${fmtCurrency(viewSubtotal + viewTax)}</dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Details</h3>
                  <Field label="PO number" value={po.id} mono />
                  <Field label="Status" value={<StatusBadge status={statusKey}>{po.status}</StatusBadge>} />
                  <Field label="Payment terms" value={isEditing ? editPaymentTerms : po.paymentTerms} />
                  <Field label="Order date" value={po.orderDate} mono />
                  <Field label="Expected delivery" value={po.expectedDelivery} mono />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CREATE MODE — new purchase order form
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
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
              <span className="text-sm font-semibold tabular-nums text-foreground">{poNumber}</span>
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
            onConfirm={() => navigate('/book/purchases')}
          />
          <Button variant="outline" className="border-[var(--border)] h-10" onClick={saveDraft}>
            Save draft
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-10 gap-2"
            onClick={sendToSupplier}
          >
            <Send className="w-4 h-4" />
            Send to supplier
          </Button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Order details */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Order details</h3>
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
                    <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="h-12 border-[var(--border)] rounded" />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Expected delivery *</Label>
                    <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="h-12 border-[var(--border)] rounded" />
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

              {/* AI supplier recommendation */}
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
                  <strong className="text-foreground">{topSupplierRec.company}</strong> is recommended
                  for {nonEmptyLines.length} line item{nonEmptyLines.length !== 1 ? 's' : ''}.
                  Rated {topSupplierRec.rating}/5 with{' '}
                  <strong className="text-foreground">{topSupplierRec.onTimePercent}% on-time</strong> delivery.
                </AIInsightCard>
              )}

              {/* Line items */}
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Line items</h3>
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
                </div>

                <MwDataTable<LineItem>
                  columns={createColumns}
                  data={lines}
                  keyExtractor={(row) => row.id}
                  className="rounded-none border-0 shadow-none"
                />

                {/* Price anomaly banner */}
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
              <Card className="p-6 space-y-4">
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
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Order summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Subtotal</span>
                    <span className="font-medium tabular-nums">${fmtCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">GST</span>
                    <span className="font-medium tabular-nums">${fmtCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total (inc. GST)</span>
                    <span className="tabular-nums">${fmtCurrency(total)}</span>
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

              <Card className="p-6 space-y-4">
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
              </Card>

              <Button
                className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground h-12 gap-2"
                onClick={sendToSupplier}
              >
                <Send className="w-4 h-4" /> Send to supplier
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
