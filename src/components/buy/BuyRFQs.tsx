/**
 * Buy RFQs — Request for Quotation management
 * Full list with supplier comparison modal
 */
import React, { useState } from 'react';
import { Plus, Search, ChevronRight, X, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus } from '../ui/animated-icons';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';


interface SupplierQuote {
  supplier: string; unitPrice: number; leadTime: number; validUntil: string; notes: string; aiPick: boolean;
}
interface RFQ {
  id: string; rfqNumber: string; title: string; sku: string; qty: number; unit: string;
  suppliers: number; responses: number; dueDate: string; status: 'open' | 'closed' | 'awarded' | 'draft';
  quotes: SupplierQuote[];
}

const RFQS: RFQ[] = [
  {
    id: '1', rfqNumber: 'RFQ-2026-0015', title: 'Mild Steel Sheet 3mm — 50 sheets',
    sku: 'MAT-MS-001', qty: 50, unit: 'sheets', suppliers: 4, responses: 3, dueDate: 'Mar 25', status: 'open',
    quotes: [
      { supplier: 'Hunter Steel Co',    unitPrice: 185.00, leadTime: 7,  validUntil: 'Apr 10', notes: '',                      aiPick: true },
      { supplier: 'Pacific Metals',     unitPrice: 192.50, leadTime: 5,  validUntil: 'Apr 05', notes: 'Min order 30 sheets',   aiPick: false },
      { supplier: 'BHP Steel Direct',   unitPrice: 178.00, leadTime: 14, validUntil: 'Apr 08', notes: 'Longer lead time',      aiPick: false },
    ],
  },
  {
    id: '2', rfqNumber: 'RFQ-2026-0014', title: 'RHS 50x25x2.5 — 80 lengths',
    sku: 'MAT-RHS-001', qty: 80, unit: 'lengths', suppliers: 3, responses: 3, dueDate: 'Mar 22', status: 'closed',
    quotes: [
      { supplier: 'Hunter Steel Co',    unitPrice: 12.80, leadTime: 5,  validUntil: 'Apr 01', notes: '',         aiPick: true },
      { supplier: 'Sydney Steel',       unitPrice: 13.20, leadTime: 3,  validUntil: 'Mar 28', notes: '',         aiPick: false },
      { supplier: 'Steel Nation',       unitPrice: 14.00, leadTime: 7,  validUntil: 'Apr 05', notes: '',         aiPick: false },
    ],
  },
  {
    id: '3', rfqNumber: 'RFQ-2026-0013', title: 'Powder Coat RAL 7035 — 20kg',
    sku: 'CONS-PC-001', qty: 20, unit: 'kg', suppliers: 3, responses: 2, dueDate: 'Mar 28', status: 'open',
    quotes: [
      { supplier: 'Dulux Industrial',   unitPrice: 11.00, leadTime: 3,  validUntil: 'Apr 15', notes: '',         aiPick: true },
      { supplier: 'Haymes Powder',      unitPrice: 9.80,  leadTime: 7,  validUntil: 'Apr 10', notes: 'Min 25kg', aiPick: false },
    ],
  },
  {
    id: '4', rfqNumber: 'RFQ-2026-0012', title: 'Hardware Kit M10 SS — 50 kits',
    sku: 'CONS-HW-001', qty: 50, unit: 'kits', suppliers: 3, responses: 3, dueDate: 'Mar 20', status: 'awarded',
    quotes: [
      { supplier: 'Bossard Fasteners', unitPrice: 8.40, leadTime: 5,  validUntil: 'Mar 31', notes: '', aiPick: false },
      { supplier: 'Fasteners Plus',    unitPrice: 9.00, leadTime: 3,  validUntil: 'Mar 28', notes: '', aiPick: true },
      { supplier: 'NBS Hardware',      unitPrice: 8.80, leadTime: 7,  validUntil: 'Apr 02', notes: '', aiPick: false },
    ],
  },
  {
    id: '5', rfqNumber: 'RFQ-2026-0011', title: 'SS Fasteners M10 Grade A4 — 500',
    sku: 'FST-M10A4', qty: 500, unit: 'units', suppliers: 2, responses: 0, dueDate: 'Apr 02', status: 'draft',
    quotes: [],
  },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  open:    { bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', label: 'Open' },
  closed:  { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Closed' },
  awarded: { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Awarded' },
  draft:   { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Draft' },
};

function RFQDetail({ rfq, onClose }: { rfq: RFQ; onClose: () => void }) {
  const cfg = STATUS_CONFIG[rfq.status];
  const sorted = [...rfq.quotes].sort((a, b) => a.unitPrice - b.unitPrice);
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-[520px] sm:max-w-[520px] p-0 overflow-y-auto border-l border-[var(--border)]">
        <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm  font-medium text-foreground">{rfq.rfqNumber}</span>
            <StatusBadge variant={rfq.status === 'open' ? 'info' : rfq.status === 'awarded' ? 'success' : 'neutral'}>{cfg.label}</StatusBadge>
          </div>
          <SheetTitle className="text-base font-medium text-foreground">{rfq.title}</SheetTitle>
          <SheetDescription className="text-[var(--neutral-500)]  text-xs">{rfq.sku} · Qty: {rfq.qty} {rfq.unit}</SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {rfq.quotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No quotes received yet.</p>
              <p className="text-xs text-[var(--neutral-400)] mt-1">Due {rfq.dueDate}</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--neutral-500)] font-medium uppercase tracking-wider">
                {rfq.responses}/{rfq.suppliers} suppliers responded
              </p>
              <div className="space-y-3">
                {sorted.map((q, i) => (
                  <div key={q.supplier} className={cn('rounded-lg p-4 border', q.aiPick ? 'border-2 border-[var(--mw-yellow-400)] bg-[var(--accent)]' : 'border-[var(--border)] bg-card')}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{q.supplier}</span>
                        {q.aiPick && (
                          <span className="text-[10px] bg-[var(--mw-purple)]/15 text-[var(--mw-purple)] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI pick
                          </span>
                        )}
                        {i === 0 && !q.aiPick && (
                          <Badge className="bg-[var(--neutral-100)] text-foreground border-0 text-[10px] rounded-full px-1.5">Lowest</Badge>
                        )}
                      </div>
                      <span className="text-xl font-medium tabular-nums text-foreground">
                        ${q.unitPrice.toFixed(2)}<span className="text-xs text-[var(--neutral-500)] font-normal">/{rfq.unit.replace(/s$/, '')}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[var(--neutral-500)]">
                      <span>Lead: <strong className="text-foreground">{q.leadTime}d</strong></span>
                      <span>Total: <strong className="text-foreground tabular-nums">${(q.unitPrice * rfq.qty).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</strong></span>
                      <span>Valid to: {q.validUntil}</span>
                    </div>
                    {q.notes && <p className="text-xs text-[var(--mw-amber)] mt-1">⚠ {q.notes}</p>}
                    {rfq.status === 'open' && (
                      <Button size="sm" className={cn('w-full mt-3 h-12 text-xs gap-1', q.aiPick
                        ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground'
                        : 'bg-[var(--mw-mirage)] hover:bg-[var(--neutral-800)] text-white'
                      )} onClick={() => toast.success(`Awarded to ${q.supplier}`)}>
                        <Check className="w-4 h-4" /> Award to {q.supplier.split(' ')[0]}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function BuyRFQs() {
  const [search,      setSearch]      = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

  const filtered = RFQS.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.rfqNumber.toLowerCase().includes(search.toLowerCase())
  );

  const countOpen = RFQS.filter(r => r.status === 'open').length;
  const countAwarded = RFQS.filter(r => r.status === 'awarded').length;
  const countDraft = RFQS.filter(r => r.status === 'draft').length;
  const countClosed = RFQS.filter(r => r.status === 'closed').length;

  const columns: MwColumnDef<RFQ>[] = [
    { key: 'rfqNumber', header: 'RFQ #', tooltip: 'Request for quotation number', cell: (rfq) => <span className="font-medium text-foreground">{rfq.rfqNumber}</span> },
    { key: 'title', header: 'Title', tooltip: 'RFQ description', cell: (rfq) => <span className="font-medium text-foreground">{rfq.title}</span> },
    { key: 'sku', header: 'SKU', tooltip: 'Stock keeping unit', cell: (rfq) => <span className="text-xs tabular-nums text-[var(--neutral-500)]">{rfq.sku}</span> },
    { key: 'qty', header: 'Qty', tooltip: 'Requested quantity', cell: (rfq) => <span className="tabular-nums">{rfq.qty}</span> },
    { key: 'suppliers', header: 'Suppliers', tooltip: 'Number of invited suppliers', cell: (rfq) => <span className="tabular-nums">{rfq.suppliers}</span> },
    { key: 'responses', header: 'Responses', tooltip: 'Quotes received from suppliers', cell: (rfq) => {
      const responseRate = rfq.suppliers > 0 ? (rfq.responses / rfq.suppliers) * 100 : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--mw-yellow-400)] rounded-full transition-all duration-200 ease-[var(--ease-standard)]" style={{ width: `${responseRate}%` }} />
          </div>
          <span className="text-xs text-[var(--neutral-500)] tabular-nums">{rfq.responses}/{rfq.suppliers}</span>
        </div>
      );
    }},
    { key: 'dueDate', header: 'Due', tooltip: 'Response deadline', cell: (rfq) => <span className="tabular-nums text-[var(--neutral-500)]">{rfq.dueDate}</span> },
    { key: 'status', header: 'Status', tooltip: 'Current RFQ status', cell: (rfq) => {
      const variantMap: Record<string, 'info' | 'neutral' | 'success'> = {
        open: 'info', closed: 'neutral', awarded: 'success', draft: 'neutral',
      };
      return <StatusBadge variant={variantMap[rfq.status]}>{STATUS_CONFIG[rfq.status].label}</StatusBadge>;
    }},
    { key: 'arrow', header: '', cell: () => <ChevronRight className="w-4 h-4 text-[var(--neutral-400)]" /> },
  ];

  return (
    <PageShell>
      <PageHeader
        title="RFQs"
        subtitle={`${RFQS.filter(r => r.status === 'open').length} open · ${RFQS.filter(r => r.status === 'awarded').length} awarded`}
        actions={
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2 h-10" onClick={() => toast('New RFQ coming soon')}>
            <AnimatedPlus className="w-4 h-4" /> New RFQ
          </Button>
        }
      />

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input placeholder="Search RFQs…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-xl text-sm" />
      </div>

      <ToolbarSummaryBar
        segments={[
          { key: 'open', label: 'Open', value: countOpen, color: 'var(--mw-yellow-400)' },
          { key: 'awarded', label: 'Awarded', value: countAwarded, color: 'var(--mw-mirage)' },
          { key: 'closed', label: 'Closed', value: countClosed, color: 'var(--neutral-400)' },
          { key: 'draft', label: 'Draft', value: countDraft, color: 'var(--neutral-200)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <MwDataTable
        columns={columns}
        data={filtered}
        keyExtractor={(rfq) => rfq.id}
        onRowClick={(rfq) => setSelectedRFQ(rfq)}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
      />

      {selectedRFQ && <RFQDetail rfq={selectedRFQ} onClose={() => setSelectedRFQ(null)} />}
    </PageShell>
  );
}
