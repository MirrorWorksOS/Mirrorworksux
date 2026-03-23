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
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus } from '../ui/animated-icons';

const { animationVariants } = designSystem;

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
  open:    { bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', label: 'Open' },
  closed:  { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Closed' },
  awarded: { bg: 'bg-[#F5F5F5]', text: 'text-[#1A2732]', label: 'Awarded' },
  draft:   { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Draft' },
};

function RFQDetail({ rfq, onClose }: { rfq: RFQ; onClose: () => void }) {
  const cfg = STATUS_CONFIG[rfq.status];
  const sorted = [...rfq.quotes].sort((a, b) => a.unitPrice - b.unitPrice);
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-[520px] sm:max-w-[520px] p-0 overflow-y-auto border-l border-[var(--border)]">
        <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm  font-medium text-[#1A2732]">{rfq.rfqNumber}</span>
            <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>{cfg.label}</Badge>
          </div>
          <SheetTitle className="text-[16px] font-semibold text-[#1A2732]">{rfq.title}</SheetTitle>
          <SheetDescription className="text-[#737373]  text-xs">{rfq.sku} · Qty: {rfq.qty} {rfq.unit}</SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {rfq.quotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#737373]">No quotes received yet.</p>
              <p className="text-xs text-[#A3A3A3] mt-1">Due {rfq.dueDate}</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#737373] font-medium uppercase tracking-wider">
                {rfq.responses}/{rfq.suppliers} suppliers responded
              </p>
              <div className="space-y-3">
                {sorted.map((q, i) => (
                  <div key={q.supplier} className={cn('rounded-lg p-4 border', q.aiPick ? 'border-2 border-[#FFCF4B] bg-[var(--accent)]' : 'border-[var(--border)] bg-white')}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1A2732]">{q.supplier}</span>
                        {q.aiPick && (
                          <span className="text-[10px] bg-[#FFCF4B] text-[#1A2732] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI pick
                          </span>
                        )}
                        {i === 0 && !q.aiPick && (
                          <Badge className="bg-[#F5F5F5] text-[#1A2732] border-0 text-[10px] rounded-full px-1.5">Lowest</Badge>
                        )}
                      </div>
                      <span className="text-xl  font-semibold text-[#1A2732]">
                        ${q.unitPrice.toFixed(2)}<span className="text-xs text-[#737373] font-normal">/{rfq.unit.replace(/s$/, '')}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[#737373]">
                      <span>Lead: <strong className="text-[#1A2732]">{q.leadTime}d</strong></span>
                      <span>Total: <strong className="text-[#1A2732] ">${(q.unitPrice * rfq.qty).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</strong></span>
                      <span>Valid to: {q.validUntil}</span>
                    </div>
                    {q.notes && <p className="text-xs text-[#FF8B00] mt-1">⚠ {q.notes}</p>}
                    {rfq.status === 'open' && (
                      <Button size="sm" className={cn('w-full mt-3 h-9 text-xs gap-1', q.aiPick
                        ? 'bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732]'
                        : 'bg-[#1A2732] hover:bg-[#2C2C2C] text-white'
                      )}>
                        <Check className="w-3 h-3" /> Award to {q.supplier.split(' ')[0]}
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

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">RFQs</h1>
          <p className="text-sm text-[#737373] mt-1">
            {RFQS.filter(r => r.status === 'open').length} open · {RFQS.filter(r => r.status === 'awarded').length} awarded
          </p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2 h-10">
          <AnimatedPlus className="w-4 h-4" /> New RFQ
        </Button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <Input placeholder="Search RFQs…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-xl text-sm" />
      </div>

      <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
              {['RFQ #', 'Title', 'SKU', 'Qty', 'Suppliers', 'Responses', 'Due', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(rfq => {
              const cfg = STATUS_CONFIG[rfq.status];
              const responseRate = rfq.suppliers > 0 ? (rfq.responses / rfq.suppliers) * 100 : 0;
              return (
                <tr key={rfq.id} onClick={() => setSelectedRFQ(rfq)}
                  className="border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors">
                  <td className="px-4 text-sm  font-medium text-[#1A2732]">{rfq.rfqNumber}</td>
                  <td className="px-4 text-sm text-[#1A2732] font-medium">{rfq.title}</td>
                  <td className="px-4 text-xs  text-[#737373]">{rfq.sku}</td>
                  <td className="px-4 text-sm ">{rfq.qty}</td>
                  <td className="px-4 text-sm ">{rfq.suppliers}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFCF4B] rounded-full" style={{ width: `${responseRate}%` }} />
                      </div>
                      <span className="text-xs  text-[#737373]">{rfq.responses}/{rfq.suppliers}</span>
                    </div>
                  </td>
                  <td className="px-4 text-sm text-[#737373]">{rfq.dueDate}</td>
                  <td className="px-4">
                    <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>{cfg.label}</Badge>
                  </td>
                  <td className="px-4">
                    <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {selectedRFQ && <RFQDetail rfq={selectedRFQ} onClose={() => setSelectedRFQ(null)} />}
    </motion.div>
  );
}
