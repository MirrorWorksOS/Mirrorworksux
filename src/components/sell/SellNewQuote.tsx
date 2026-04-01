/**
 * Sell New Quote — full quote builder with line items table
 * Customer selection, dates, terms, BOM-linked line items, margin calculation, totals
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronDown, FileText, X, Sparkles, ArrowLeft } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { useNavigate } from 'react-router';

import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';

// ── Types ─────────────────────────────────────────────────
interface LineItem {
  id: string;
  description: string;
  sku: string;
  qty: number;
  unit: string;
  unitCost: number;
  margin: number;
  unitPrice: number;
}

const CUSTOMERS = [
  'TechCorp Industries', 'BHP Contractors', 'Pacific Fab', 'Sydney Rail Corp',
  'Kemppi Australia', 'Hunter Steel Co', 'Con-form Group', 'Oberon Engineering',
];

const PRODUCTS = [
  { sku: 'PROD-SR-001', name: 'Server Rack Chassis',           unit: 'each', cost: 820.00,  price: 1280.00 },
  { sku: 'PROD-BP-002', name: 'Structural Bracket Type A',      unit: 'each', cost: 145.00,  price: 210.00 },
  { sku: 'PROD-AE-003', name: 'Aluminium Enclosure 600x400',    unit: 'each', cost: 420.00,  price: 680.00 },
  { sku: 'LABOUR-FAB',  name: 'Fabrication Labour',             unit: 'hr',   cost: 55.00,   price: 95.00 },
  { sku: 'LABOUR-WLD',  name: 'Welding Labour',                 unit: 'hr',   cost: 60.00,   price: 105.00 },
  { sku: 'CUSTOM',      name: 'Custom line item',               unit: 'each', cost: 0,       price: 0 },
];

const TAX_RATE = 0.10;

const newLine = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: '',
  sku: '',
  qty: 1,
  unit: 'each',
  unitCost: 0,
  margin: 20,
  unitPrice: 0,
});

// ── Helpers ───────────────────────────────────────────────
const calcPrice = (cost: number, margin: number) =>
  margin >= 100 ? cost : cost / (1 - margin / 100);

const fmtCurrency = (n: number) =>
  n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Component ─────────────────────────────────────────────
export function SellNewQuote() {
  const navigate = useNavigate();
  const quoteNumber = 'MW-Q-0048';

  const [customer, setCustomer] = useState('');
  const [quoteDate, setQuoteDate] = useState('2026-03-20');
  const [expiryDate, setExpiryDate] = useState('2026-04-19');
  const [terms, setTerms] = useState('net30');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([newLine()]);
  const [aiSuggestion] = useState(true);

  // Totals
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const tax      = subtotal * TAX_RATE;
  const total    = subtotal + tax;
  const cost     = lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
  const margin   = subtotal > 0 ? ((subtotal - cost) / subtotal) * 100 : 0;

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, ...patch };
      // Recalc price if cost or margin changed
      if ('unitCost' in patch || 'margin' in patch) {
        updated.unitPrice = parseFloat(calcPrice(updated.unitCost, updated.margin).toFixed(2));
      }
      if ('unitPrice' in patch && !('unitCost' in patch)) {
        // If user edits price directly, recalculate margin
        if (updated.unitCost > 0) {
          updated.margin = parseFloat((((updated.unitPrice - updated.unitCost) / updated.unitPrice) * 100).toFixed(1));
        }
      }
      return updated;
    }));
  };

  const addProductLine = (sku: string) => {
    const prod = PRODUCTS.find(p => p.sku === sku);
    if (!prod) return;
    const margin20 = prod.cost > 0 ? parseFloat((((prod.price - prod.cost) / prod.price) * 100).toFixed(1)) : 20;
    setLines(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      description: prod.name,
      sku: prod.sku,
      qty: 1,
      unit: prod.unit,
      unitCost: prod.cost,
      margin: margin20,
      unitPrice: prod.price,
    }]);
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--neutral-100)]">
      {/* Top bar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--neutral-500)]" />
              <span className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">{quoteNumber}</span>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs rounded-full px-2">Draft</Badge>
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">New quote</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ConfirmDialog
            trigger={
              <Button variant="outline" className="border-[var(--border)] h-10">
                Discard
              </Button>
            }
            title="Discard this quote?"
            description="All unsaved changes will be lost. This cannot be undone."
            confirmLabel="Discard"
            variant="warning"
            onConfirm={() => navigate(-1)}
          />
          <Button variant="outline" className="border-[var(--border)] h-10" onClick={() => toast.success('Quote saved as draft')}>
            Save draft
          </Button>
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-900)] h-10 gap-2" onClick={() => toast.success('Quote sent successfully')}>
            <FileText className="w-4 h-4" /> Send quote
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">

          {/* AI insight */}
          {aiSuggestion && customer && (
            <AIInsightCard title="AI suggestion">
              Based on previous quotes for {customer}, standard margin is 22–28%. Last accepted quote was $45,000 in Jan 2026. Consider a 14-day expiry for faster close.
            </AIInsightCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Quote details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header details */}
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h3 className="text-sm font-medium text-[var(--neutral-900)] mb-4">Quote details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-sm mb-2 block font-medium">Customer *</Label>
                    <Select value={customer} onValueChange={setCustomer}>
                      <SelectTrigger className="h-12 border-[var(--border)] rounded"><SelectValue placeholder="Select customer…" /></SelectTrigger>
                      <SelectContent>
                        {CUSTOMERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Quote date</Label>
                    <Input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} className="h-12 border-[var(--border)] rounded" />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Expiry date</Label>
                    <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="h-12 border-[var(--border)] rounded" />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Payment terms</Label>
                    <Select value={terms} onValueChange={setTerms}>
                      <SelectTrigger className="h-12 border-[var(--border)] rounded"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">COD</SelectItem>
                        <SelectItem value="net14">Net 14</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block font-medium">Customer reference</Label>
                    <Input value={ref} onChange={e => setRef(e.target.value)} placeholder="PO number or reference" className="h-12 border-[var(--border)] rounded" />
                  </div>
                </div>
              </Card>

              {/* Line items */}
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--neutral-900)]">Line items</h3>
                  <Select onValueChange={v => { if (v) addProductLine(v); }}>
                    <SelectTrigger className="h-9 border-[var(--border)] w-52 text-sm">
                      <SelectValue placeholder="Add from catalogue…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map(p => (
                        <SelectItem key={p.sku} value={p.sku}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                      <th className="px-4 py-2 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[28%]">Description</th>
                      <th className="px-3 py-2 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[12%]">SKU</th>
                      <th className="px-3 py-2 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[8%]">Qty</th>
                      <th className="px-3 py-2 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[6%]">Unit</th>
                      <th className="px-3 py-2 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[12%]">Cost</th>
                      <th className="px-3 py-2 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[10%]">Margin %</th>
                      <th className="px-3 py-2 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[12%]">Unit price</th>
                      <th className="px-3 py-2 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-[10%]">Total</th>
                      <th className="px-2 py-2 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={line.id} className="border-b border-[var(--border)] hover:bg-[var(--neutral-100)] group">
                        <td className="px-4 py-2">
                          <Input
                            value={line.description}
                            onChange={e => updateLine(line.id, { description: e.target.value })}
                            placeholder="Item description"
                            className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={line.sku}
                            onChange={e => updateLine(line.id, { sku: e.target.value })}
                            placeholder="SKU"
                            className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-xs "
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            value={line.qty}
                            onChange={e => updateLine(line.id, { qty: parseFloat(e.target.value) || 1 })}
                            className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm text-right "
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={line.unit}
                            onChange={e => updateLine(line.id, { unit: e.target.value })}
                            className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            value={line.unitCost}
                            onChange={e => updateLine(line.id, { unitCost: parseFloat(e.target.value) || 0 })}
                            className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm text-right  text-[var(--neutral-500)]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative">
                            <Input
                              type="number"
                              value={line.margin}
                              onChange={e => updateLine(line.id, { margin: parseFloat(e.target.value) || 0 })}
                              className={cn(
                                'h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm text-right  pr-5',
                                line.margin < 15 && 'text-[var(--mw-error)]',
                                line.margin >= 25 && 'text-[var(--neutral-900)]',
                              )}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            value={line.unitPrice}
                            onChange={e => updateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="h-9 border-transparent bg-transparent hover:border-[var(--border)] focus:border-[var(--mw-mirage)] text-sm text-right  font-medium"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium tabular-nums text-[var(--neutral-900)] whitespace-nowrap">
                          ${fmtCurrency(line.qty * line.unitPrice)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => removeLine(line.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[var(--neutral-100)] rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-[var(--mw-error)]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => setLines(prev => [...prev, newLine()])}
                    className="flex items-center gap-2 text-sm text-[var(--neutral-500)] hover:text-[var(--neutral-900)] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add line item
                  </button>
                </div>
              </Card>

              {/* Notes */}
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <Label className="text-sm mb-2 block font-medium">Notes to customer</Label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-[var(--neutral-100)] border-transparent rounded-lg text-sm text-[var(--neutral-900)] resize-none focus:outline-none focus:bg-white focus:border-[var(--mw-mirage)] focus:ring-1 focus:ring-[var(--mw-mirage)] transition-all"
                  placeholder="Add notes, special instructions, or delivery requirements…"
                />
              </Card>
            </div>

            {/* Right — Summary */}
            <div className="space-y-4">
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h3 className="text-sm font-medium text-[var(--neutral-900)] mb-4">Quote summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Subtotal</span>
                    <span className="font-medium tabular-nums">${fmtCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">GST (10%)</span>
                    <span className="font-medium tabular-nums">${fmtCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-[var(--neutral-900)]">Total (inc. GST)</span>
                    <span className="tabular-nums text-[var(--neutral-900)]">${fmtCurrency(total)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Margin summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Est. cost</span>
                    <span className="tabular-nums text-[var(--neutral-500)]">${fmtCurrency(cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Gross profit</span>
                    <span className="font-medium tabular-nums text-[var(--neutral-900)]">${fmtCurrency(subtotal - cost)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--neutral-500)]">Margin</span>
                    <span className={cn('font-semibold tabular-nums text-base',
                      margin < 15 ? 'text-[var(--mw-error)]' : margin >= 25 ? 'text-[var(--neutral-900)]' : 'text-[var(--mw-yellow-400)]'
                    )}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, margin * 2)}%`,
                        backgroundColor: margin < 15 ? 'var(--mw-error)' : margin >= 25 ? 'var(--mw-success)' : 'var(--mw-warning)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--neutral-500)]">Target: 20–30%</p>
                </div>
              </Card>

              {/* Quick info */}
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 space-y-4">
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">Quote number</p>
                  <p className="text-sm font-medium tabular-nums">{quoteNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">Valid until</p>
                  <p className="text-sm font-medium">{expiryDate ? new Date(expiryDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">Payment terms</p>
                  <p className="text-sm font-medium capitalize">{terms.replace('net', 'Net ')}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-1">Line items</p>
                  <p className="text-sm font-medium tabular-nums">{lines.length}</p>
                </div>
              </Card>

              <Button className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-900)] h-12 gap-2" onClick={() => toast.success('Quote sent successfully')}>
                <FileText className="w-4 h-4" /> Send quote
              </Button>
              <Button variant="outline" className="w-full border-[var(--border)] h-10" onClick={() => toast('Generating PDF preview\u2026')}>
                Preview PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}