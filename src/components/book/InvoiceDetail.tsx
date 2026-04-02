import React from 'react';
import { ArrowLeft, Send, Download, DollarSign, MoreVertical, Mail, Eye, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';

interface LineItem {
  num: number;
  product: string;
  desc: string;
  qty: string;
  unit: number;
  disc: number;
  tax: string;
  total: number;
}

const lineItems: LineItem[] = [
  { num: 1, product: '10mm MS Plate', desc: 'AS/NZS 3678-250', qty: '50', unit: 85.00, disc: 5, tax: 'GST 10%', total: 4037.50 },
  { num: 2, product: 'Laser Cutting', desc: 'Profile cutting per metre', qty: '120m', unit: 12.50, disc: 0, tax: 'GST 10%', total: 1650.00 },
  { num: 3, product: 'Assembly Labour', desc: 'Fabrication and welding', qty: '16hr', unit: 95.00, disc: 0, tax: 'GST 10%', total: 1672.00 },
  { num: 4, product: 'Paint Finish', desc: 'Dulux powder coat, custom RAL', qty: '1', unit: 890.00, disc: 0, tax: 'GST 10%', total: 979.00 },
];

const financialColumns: FinancialColumn<LineItem>[] = [
  { key: 'num', header: '#', accessor: (row) => row.num, format: 'number', align: 'left' },
  { key: 'product', header: 'Product', accessor: (row) => row.product, format: 'text', align: 'left' },
  { key: 'desc', header: 'Description', accessor: (row) => row.desc, format: 'text', align: 'left' },
  { key: 'qty', header: 'Qty', accessor: (row) => row.qty, format: 'text', align: 'right' },
  { key: 'unit', header: 'Unit Price', accessor: (row) => row.unit, format: 'currency', align: 'right' },
  { key: 'disc', header: 'Disc', accessor: (row) => row.disc === 0 ? '\u2014' : `${row.disc}%`, format: 'text', align: 'right' },
  { key: 'tax', header: 'Tax', accessor: (row) => row.tax, format: 'text', align: 'left' },
  { key: 'total', header: 'Total', accessor: (row) => row.total, format: 'currency', align: 'right' },
];

export function InvoiceDetail({ onBack }: { onBack: () => void }) {
  return (
    <PageShell className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      {/* Header */}
      <PageHeader
        title="INV-2026-0045"
        breadcrumbs={[
          { label: 'Book', href: '/book' },
          { label: 'Invoices', href: '/book/invoices' },
          { label: 'INV-2026-0045' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status="sent">Sent</StatusBadge>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Send className="w-4 h-4" /> Send</Button>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Download className="w-4 h-4" /> Download PDF</Button>
            <Button size="sm" className="h-10 gap-2 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)]" onClick={() => toast('Payment recording form coming soon')}><DollarSign className="w-4 h-4" /> Record Payment</Button>
            <Button variant="ghost" size="icon" className="w-11 h-11"><MoreVertical className="w-5 h-5 text-[var(--neutral-500)]" /></Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left - Invoice Preview */}
        <Card className="lg:col-span-3 bg-white shadow-xs border border-[var(--border)] p-8">
          {/* Company & Invoice Title */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="w-12 h-12 bg-[var(--neutral-100)] rounded-[var(--shape-lg)] mb-2" />
              <div className="text-[var(--mw-mirage)] font-medium">MirrorWorks Pty Ltd</div>
              <div className="text-xs text-[var(--neutral-500)]">123 Factory Road, Oberon NSW 2787</div>
              <div className="text-xs text-[var(--neutral-500)] mt-0.5 tabular-nums">ABN: 12 345 678 901</div>
            </div>
            <div className="text-4xl tracking-tight text-[var(--mw-mirage)] font-normal">INVOICE</div>
          </div>

          <Separator className="bg-[var(--neutral-200)]" />

          {/* Bill To & Details */}
          <div className="grid grid-cols-2 gap-8 py-5">
            <div>
              <div className="text-xs text-[var(--neutral-500)] mb-1 font-medium">Bill To</div>
              <div className="text-[var(--mw-mirage)] font-medium">Con-form Group</div>
              <div className="text-xs text-[var(--neutral-600)]">45 Industrial Drive<br />Silverwater NSW 2128</div>
            </div>
            <div className="space-y-2 text-right">
              {[
                ['Invoice Number', 'INV-2026-0045'],
                ['Issue Date', '24 February 2026'],
                ['Due Date', '26 March 2026'],
                ['PO Reference', 'PO-CF-2026-089'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-end gap-4">
                  <span className="text-xs text-[var(--neutral-500)]">{label}</span>
                  <span className={cn("text-xs text-[var(--mw-mirage)]", (label.includes('Reference') || label.includes('Number')) && "tabular-nums")}>{value}</span>
                </div>
              ))}
              <div className="flex justify-end gap-4">
                <span className="text-xs text-[var(--neutral-500)]">Job Reference</span>
                <span className="text-xs text-[var(--mw-mirage)] cursor-pointer tabular-nums">JOB-2026-0012</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <FinancialTable
            columns={financialColumns}
            data={lineItems}
            keyExtractor={(item) => item.num}
            totals={{ total: 8338.50 }}
            className="mt-4"
          />

          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[var(--neutral-500)]">Subtotal</span><span className="tabular-nums">$8,338.50</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--neutral-500)]">GST (10%)</span><span className="tabular-nums">$833.85</span></div>
              <Separator className="bg-[var(--neutral-200)]" />
              <div className="flex justify-between"><span className="text-[var(--mw-mirage)] font-medium">Total</span><span className="text-lg tabular-nums font-bold">$9,172.35</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--neutral-500)]">Amount Paid</span><span className="text-[var(--neutral-500)] tabular-nums">$0.00</span></div>
              <div className="flex justify-between"><span className="font-medium">Balance Due</span><span className="text-[var(--mw-error)] text-lg tabular-nums font-bold">$9,172.35</span></div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--border)] text-xs text-[var(--neutral-500)] space-y-1">
            <p>Payment Terms: Net 30</p>
            <p>Notes: Please reference INV-2026-0045 on all remittances.</p>
          </div>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Payments */}
          <Card className="bg-white shadow-xs border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[var(--neutral-500)]" />
              <span className="text-sm text-[var(--mw-mirage)] font-medium">Payments</span>
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet</p>
            <Button variant="ghost" className="w-full text-[var(--mw-yellow-400)] hover:text-[var(--mw-yellow-600)]" onClick={() => toast('Payment recording form coming soon')}>Record Payment</Button>
          </Card>

          {/* Email History */}
          <Card className="bg-white shadow-xs border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-[var(--neutral-500)]" />
              <span className="text-sm text-[var(--mw-mirage)] font-medium">Email History</span>
            </div>
            <div className="space-y-4 border-l-2 border-[var(--border)] pl-4 ml-2">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[var(--mw-mirage)]" />
                  <span className="text-sm text-[var(--mw-mirage)]">Invoice sent to accounts@conform.com.au</span>
                </div>
                <span className="text-xs text-[var(--neutral-500)] ml-6">24 Feb 2026, 10:32 AM</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[var(--mw-mirage)]" />
                  <span className="text-sm text-[var(--mw-mirage)]">Email opened</span>
                </div>
                <span className="text-xs text-[var(--neutral-500)] ml-6">24 Feb 2026, 11:15 AM</span>
              </div>
            </div>
          </Card>

          {/* Activity */}
          <Card className="bg-white shadow-xs border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[var(--neutral-500)]" />
              <span className="text-sm text-[var(--mw-mirage)] font-medium">Activity</span>
            </div>
            <div className="space-y-4 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[var(--neutral-200)]" />
              {[
                { text: 'Invoice created by Matt', time: '24 Feb, 10:30 AM' },
                { text: 'Sent to customer', time: '24 Feb, 10:32 AM' },
                { text: 'Pushed to Xero', time: '24 Feb, 10:33 AM', mono: 'XeroID: abc123...' },
              ].map((evt, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-[var(--neutral-200)] border-2 border-white shrink-0 z-10" />
                  <div>
                    <p className="text-sm text-[var(--mw-mirage)]">{evt.text}</p>
                    {evt.mono && <p className="text-xs text-[var(--neutral-500)] tabular-nums">{evt.mono}</p>}
                    <p className="text-xs text-[var(--neutral-500)]">{evt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Xero */}
          <Card className="bg-white shadow-xs border border-[var(--border)] p-6">
            <Button variant="ghost" className="text-[var(--mw-mirage)] p-0 h-auto gap-1 text-sm">
              View in Xero <ExternalLink className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-[var(--mw-mirage)]" />
              <span className="text-xs text-[var(--neutral-500)]">Sync Status: Synced</span>
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-1">Last synced: 24 Feb 2026, 10:33 AM</p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
