import React from 'react';
import { ArrowLeft, Send, Download, DollarSign, MoreVertical, Mail, Eye, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

const lineItems = [
  { num: 1, product: '10mm MS Plate', desc: 'AS/NZS 3678-250', qty: '50', unit: '$85.00', disc: '5%', tax: 'GST 10%', total: '$4,037.50' },
  { num: 2, product: 'Laser Cutting', desc: 'Profile cutting per metre', qty: '120m', unit: '$12.50', disc: '—', tax: 'GST 10%', total: '$1,650.00' },
  { num: 3, product: 'Assembly Labour', desc: 'Fabrication and welding', qty: '16hr', unit: '$95.00', disc: '—', tax: 'GST 10%', total: '$1,672.00' },
  { num: 4, product: 'Paint Finish', desc: 'Dulux powder coat, custom RAL', qty: '1', unit: '$890.00', disc: '—', tax: 'GST 10%', total: '$979.00' },
];

export function InvoiceDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A2732]" />
          </button>
          <h1 className="text-2xl tracking-tight text-[#1A2732]" style={{ fontFamily: 'Roboto Mono, monospace' }}>INV-2026-0045</h1>
          <Badge className="rounded-full text-[11px] px-2 py-0.5 border-0 bg-[#F5F5F5] text-[#1A2732]">Sent</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Send className="w-4 h-4" /> Send</Button>
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Download className="w-4 h-4" /> Download PDF</Button>
          <Button size="sm" className="h-10 gap-2 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]"><DollarSign className="w-4 h-4" /> Record Payment</Button>
          <Button variant="ghost" size="icon" className="w-11 h-11"><MoreVertical className="w-5 h-5 text-[#737373]" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left - Invoice Preview */}
        <Card className="lg:col-span-3 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-8">
          {/* Company & Invoice Title */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="w-12 h-12 bg-[#F5F5F5] rounded-lg mb-2" />
              <div className="text-[#1A2732]" style={{ fontWeight: 500 }}>MirrorWorks Pty Ltd</div>
              <div className="text-xs text-[#737373]">123 Factory Road, Oberon NSW 2787</div>
              <div className="text-xs text-[#737373] mt-0.5" style={{ fontFamily: 'Roboto Mono, monospace' }}>ABN: 12 345 678 901</div>
            </div>
            <div className="text-[36px] tracking-tight text-[#1A2732]" style={{ fontWeight: 400 }}>INVOICE</div>
          </div>

          <Separator className="bg-[#E5E5E5]" />

          {/* Bill To & Details */}
          <div className="grid grid-cols-2 gap-8 py-5">
            <div>
              <div className="text-xs text-[#737373] mb-1" style={{ fontWeight: 500 }}>Bill To</div>
              <div className="text-[#1A2732]" style={{ fontWeight: 500 }}>Con-form Group</div>
              <div className="text-xs text-[#525252]">45 Industrial Drive<br />Silverwater NSW 2128</div>
            </div>
            <div className="space-y-2 text-right">
              {[
                ['Invoice Number', 'INV-2026-0045'],
                ['Issue Date', '24 February 2026'],
                ['Due Date', '26 March 2026'],
                ['PO Reference', 'PO-CF-2026-089'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-end gap-4">
                  <span className="text-xs text-[#737373]">{label}</span>
                  <span className="text-xs text-[#1A2732]" style={{ fontFamily: label.includes('Reference') || label.includes('Number') ? 'Roboto Mono, monospace' : 'inherit' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-end gap-4">
                <span className="text-xs text-[#737373]">Job Reference</span>
                <span className="text-xs text-[#1A2732] cursor-pointer" style={{ fontFamily: 'Roboto Mono, monospace' }}>JOB-2026-0012</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mt-4">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {['#', 'Product', 'Description', 'Qty', 'Unit Price', 'Disc', 'Tax', 'Total'].map(h => (
                  <th key={h} className={`px-3 py-2 text-xs tracking-wider text-[#737373] ${['Qty', 'Unit Price', 'Disc', 'Total'].includes(h) ? 'text-right' : 'text-left'}`} style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map(item => (
                <tr key={item.num} className="border-b border-[var(--border)]">
                  <td className="px-3 py-3 text-sm text-[#525252]">{item.num}</td>
                  <td className="px-3 py-3 text-sm text-[#1A2732]" style={{ fontWeight: 500 }}>{item.product}</td>
                  <td className="px-3 py-3 text-xs text-[#737373]">{item.desc}</td>
                  <td className="px-3 py-3 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{item.qty}</td>
                  <td className="px-3 py-3 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{item.unit}</td>
                  <td className="px-3 py-3 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{item.disc}</td>
                  <td className="px-3 py-3 text-xs text-[#737373]">{item.tax}</td>
                  <td className="px-3 py-3 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[#737373]">Subtotal</span><span style={{ fontFamily: 'Roboto Mono, monospace' }}>$8,338.50</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#737373]">GST (10%)</span><span style={{ fontFamily: 'Roboto Mono, monospace' }}>$833.85</span></div>
              <Separator className="bg-[#E5E5E5]" />
              <div className="flex justify-between"><span className="text-[#1A2732]" style={{ fontWeight: 500 }}>Total</span><span className="text-lg" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>$9,172.35</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#737373]">Amount Paid</span><span className="text-[#737373]" style={{ fontFamily: 'Roboto Mono, monospace' }}>$0.00</span></div>
              <div className="flex justify-between"><span style={{ fontWeight: 500 }}>Balance Due</span><span className="text-[#DE350B] text-lg" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>$9,172.35</span></div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--border)] text-xs text-[#737373] space-y-1">
            <p>Payment Terms: Net 30</p>
            <p>Notes: Please reference INV-2026-0045 on all remittances.</p>
          </div>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Payments */}
          <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#737373]" />
              <span className="text-sm text-[#1A2732]" style={{ fontWeight: 500 }}>Payments</span>
            </div>
            <p className="text-sm text-[#A3A3A3] text-center py-4">No payments recorded yet</p>
            <Button variant="ghost" className="w-full text-[#FFCF4B] hover:text-[#E6A600]">Record Payment</Button>
          </Card>

          {/* Email History */}
          <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-[#737373]" />
              <span className="text-sm text-[#1A2732]" style={{ fontWeight: 500 }}>Email History</span>
            </div>
            <div className="space-y-4 border-l-2 border-[var(--border)] pl-4 ml-2">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#1A2732]" />
                  <span className="text-sm text-[#1A2732]">Invoice sent to accounts@conform.com.au</span>
                </div>
                <span className="text-xs text-[#737373] ml-6">24 Feb 2026, 10:32 AM</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#1A2732]" />
                  <span className="text-sm text-[#1A2732]">Email opened</span>
                </div>
                <span className="text-xs text-[#737373] ml-6">24 Feb 2026, 11:15 AM</span>
              </div>
            </div>
          </Card>

          {/* Activity */}
          <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#737373]" />
              <span className="text-sm text-[#1A2732]" style={{ fontWeight: 500 }}>Activity</span>
            </div>
            <div className="space-y-4 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#E5E5E5]" />
              {[
                { text: 'Invoice created by Matt', time: '24 Feb, 10:30 AM' },
                { text: 'Sent to customer', time: '24 Feb, 10:32 AM' },
                { text: 'Pushed to Xero', time: '24 Feb, 10:33 AM', mono: 'XeroID: abc123...' },
              ].map((evt, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-[#E5E5E5] border-2 border-white shrink-0 z-10" />
                  <div>
                    <p className="text-sm text-[#1A2732]">{evt.text}</p>
                    {evt.mono && <p className="text-[11px] text-[#737373]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{evt.mono}</p>}
                    <p className="text-xs text-[#737373]">{evt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Xero */}
          <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-4">
            <Button variant="ghost" className="text-[#1A2732] p-0 h-auto gap-1 text-sm">
              View in Xero <ExternalLink className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#1A2732]" />
              <span className="text-xs text-[#737373]">Sync Status: Synced</span>
            </div>
            <p className="text-xs text-[#737373] mt-1">Last synced: 24 Feb 2026, 10:33 AM</p>
          </Card>
        </div>
      </div>
    </div>
  );
}