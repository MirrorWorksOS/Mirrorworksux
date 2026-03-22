/**
 * Buy Bills — Supplier bills with three-way matching
 * PO · GRN · Invoice matching with detail sheet
 */
import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

interface Bill {
  id: string; billNumber: string; supplier: string; invoiceDate: string; dueDate: string;
  poNumber: string; grnNumber: string; amount: number; status: 'matched' | 'pending' | 'mismatch' | 'overdue';
  matchStatus: { po: boolean; receipt: boolean; bill: boolean; amountOk: boolean };
  notes?: string;
}

const BILLS: Bill[] = [
  { id: '1', billNumber: 'BILL-2026-093', supplier: 'Hunter Steel Co',     invoiceDate: 'Mar 18', dueDate: 'Apr 17', poNumber: 'PO-0089', grnNumber: 'GRN-0112', amount: 12400.00, status: 'matched',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true } },
  { id: '2', billNumber: 'BILL-2026-092', supplier: 'Pacific Metals',      invoiceDate: 'Mar 15', dueDate: 'Apr 14', poNumber: 'PO-0088', grnNumber: 'GRN-0110', amount: 8500.00,  status: 'pending',  matchStatus: { po: true, receipt: false, bill: true, amountOk: true }, notes: 'GRN not confirmed yet' },
  { id: '3', billNumber: 'BILL-2026-091', supplier: 'Sydney Welding Supply',invoiceDate: 'Mar 12', dueDate: 'Apr 11', poNumber: 'PO-0087', grnNumber: 'GRN-0109', amount: 3420.00,  status: 'mismatch', matchStatus: { po: true, receipt: true, bill: true, amountOk: false }, notes: 'Invoice $220 higher than PO' },
  { id: '4', billNumber: 'BILL-2026-090', supplier: 'Dulux Coatings',       invoiceDate: 'Mar 10', dueDate: 'Mar 25', poNumber: 'PO-0086', grnNumber: 'GRN-0108', amount: 2200.00,  status: 'overdue',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true }, notes: 'Payment overdue by 5 days' },
  { id: '5', billNumber: 'BILL-2026-089', supplier: 'BHP Suppliers',        invoiceDate: 'Mar 08', dueDate: 'Apr 07', poNumber: 'PO-0085', grnNumber: 'GRN-0107', amount: 28000.00, status: 'matched',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true } },
  { id: '6', billNumber: 'BILL-2026-088', supplier: 'Fasteners Plus',       invoiceDate: 'Mar 05', dueDate: 'Apr 04', poNumber: 'PO-0084', grnNumber: 'GRN-0106', amount: 450.00,   status: 'matched',  matchStatus: { po: true, receipt: true, bill: true, amountOk: true } },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  matched:  { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', label: 'Matched',  icon: CheckCircle2 },
  pending:  { bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]', label: 'Pending',  icon: AlertTriangle },
  mismatch: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Mismatch', icon: AlertTriangle },
  overdue:  { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Overdue',  icon: AlertTriangle },
};

function MatchDots({ ms }: { ms: Bill['matchStatus'] }) {
  const dots = [
    { label: 'PO',     ok: ms.po },
    { label: 'GRN',    ok: ms.receipt },
    { label: 'Inv',    ok: ms.bill },
    { label: '$',      ok: ms.amountOk },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {dots.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-0.5" title={d.label}>
          <div className={cn('w-2 h-2 rounded-full', d.ok ? 'bg-[#36B37E]' : 'bg-[#EF4444]')} />
          <span className="text-[8px] text-[#A3A3A3]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function BuyBills() {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<Bill | null>(null);

  const filtered = BILLS.filter(b =>
    b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    matched:  BILLS.filter(b => b.status === 'matched').reduce((s, b) => s + b.amount, 0),
    pending:  BILLS.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0),
    issues:   BILLS.filter(b => ['mismatch', 'overdue'].includes(b.status)).length,
  };

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Bills</h1>
          <p className="text-sm text-[#737373] mt-1">
            ${totals.matched.toLocaleString()} matched
            {totals.issues > 0 && <span className="text-[#EF4444] ml-2">· {totals.issues} require attention</span>}
          </p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2 h-10">
          <Plus className="w-4 h-4" /> New bill
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Matched',         value: BILLS.filter(b => b.status === 'matched').length,  sub: `$${totals.matched.toLocaleString()}`, bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]' },
          { label: 'Pending GRN',     value: BILLS.filter(b => b.status === 'pending').length,  sub: `$${totals.pending.toLocaleString()}`, bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]' },
          { label: 'Amount mismatch', value: BILLS.filter(b => b.status === 'mismatch').length, sub: 'Needs review',                        bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
          { label: 'Overdue',         value: BILLS.filter(b => b.status === 'overdue').length,  sub: 'Past due date',                       bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
        ].map(s => (
          <Card key={s.label} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <p className="text-xs text-[#737373] font-medium mb-1">{s.label}</p>
            <p className={cn('text-[24px] font-[\'Roboto_Mono\',monospace] font-semibold', s.text)}>{s.value}</p>
            <p className="text-xs text-[#737373] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <Input placeholder="Search bills…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm" />
      </div>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              {['Bill #', 'Supplier', 'Invoice date', 'Due', 'PO #', '3-way match', 'Amount', 'Status'].map(h => (
                <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[#737373] uppercase font-medium', h === 'Amount' ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(bill => {
              const cfg = STATUS_CONFIG[bill.status];
              const Icon = cfg.icon;
              return (
                <tr key={bill.id} onClick={() => setSelected(bill)}
                  className={cn('border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors',
                    bill.status === 'overdue' && 'bg-[#FFF5F5]',
                    bill.status === 'mismatch' && 'bg-[#FFF5F5]'
                  )}>
                  <td className="px-4 text-sm font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{bill.billNumber}</td>
                  <td className="px-4 text-sm text-[#0A0A0A] font-medium">{bill.supplier}</td>
                  <td className="px-4 text-sm text-[#737373]">{bill.invoiceDate}</td>
                  <td className="px-4 text-sm" style={{ color: bill.status === 'overdue' ? '#EF4444' : '#737373', fontWeight: bill.status === 'overdue' ? 600 : 400 }}>
                    {bill.dueDate}
                  </td>
                  <td className="px-4 text-sm font-['Roboto_Mono',monospace] text-[#0052CC]">{bill.poNumber}</td>
                  <td className="px-4">
                    <MatchDots ms={bill.matchStatus} />
                  </td>
                  <td className="px-4 text-right text-sm font-['Roboto_Mono',monospace] font-semibold">${bill.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-1.5">
                      <Icon className={cn('w-3.5 h-3.5', cfg.text)} />
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>{cfg.label}</Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Detail Sheet */}
      {selected && (
        <Sheet open onOpenChange={() => setSelected(null)}>
          <SheetContent className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto border-l border-[#E5E5E5]">
            <SheetHeader className="p-6 pb-4 border-b border-[#E5E5E5]">
              <SheetTitle className="text-[18px] font-medium font-['Roboto_Mono',monospace] text-[#0A0A0A]">{selected.billNumber}</SheetTitle>
              <SheetDescription className="text-[#737373]">{selected.supplier}</SheetDescription>
            </SheetHeader>
            <div className="p-6 space-y-6">
              {selected.notes && (
                <div className={cn('rounded-lg p-4 flex items-start gap-3', selected.status === 'mismatch' ? 'bg-[#FEE2E2]' : 'bg-[#FFEDD5]')}>
                  <AlertTriangle className={cn('w-4 h-4 shrink-0 mt-0.5', selected.status === 'mismatch' ? 'text-[#EF4444]' : 'text-[#FF8B00]')} />
                  <p className="text-sm font-medium" style={{ color: selected.status === 'mismatch' ? '#EF4444' : '#FF8B00' }}>{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-[#737373] uppercase tracking-wider font-medium mb-3">Three-way match</p>
                <div className="space-y-3">
                  {[
                    { label: 'Purchase Order',    ref: selected.poNumber,  ok: selected.matchStatus.po },
                    { label: 'Goods Receipt',     ref: selected.grnNumber, ok: selected.matchStatus.receipt },
                    { label: 'Supplier Invoice',  ref: selected.billNumber,ok: selected.matchStatus.bill },
                    { label: 'Amount matches',    ref: `$${selected.amount.toLocaleString()}`, ok: selected.matchStatus.amountOk },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', row.ok ? 'bg-[#E3FCEF]' : 'bg-[#FEE2E2]')}>
                          {row.ok
                            ? <CheckCircle2 className="w-4 h-4 text-[#36B37E]" />
                            : <X className="w-4 h-4 text-[#EF4444]" />
                          }
                        </div>
                        <span className="text-sm text-[#0A0A0A] font-medium">{row.label}</span>
                      </div>
                      <span className="text-sm font-['Roboto_Mono',monospace] text-[#737373]">{row.ref}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: 'Invoice date', v: selected.invoiceDate },
                  { l: 'Due date',     v: selected.dueDate },
                  { l: 'PO number',    v: selected.poNumber },
                  { l: 'GRN',          v: selected.grnNumber },
                ].map(f => (
                  <div key={f.l}>
                    <p className="text-xs text-[#737373] mb-0.5">{f.l}</p>
                    <p className="text-sm font-medium font-['Roboto_Mono',monospace]">{f.v}</p>
                  </div>
                ))}
              </div>

              {selected.status === 'matched' && (
                <Button className="w-full bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] h-11">
                  Approve for payment
                </Button>
              )}
              {selected.status === 'mismatch' && (
                <div className="flex gap-3">
                  <Button className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white h-11 text-sm">Reject</Button>
                  <Button variant="outline" className="flex-1 border-[#E5E5E5] h-11 text-sm">Query supplier</Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </motion.div>
  );
}
