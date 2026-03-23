import React, { useState } from 'react';
import { PlusCircle, Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';

type InvoiceStatus = 'Draft' | 'Sent' | 'Viewed' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

interface Invoice {
  id: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  balanceDue: number;
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-0045', customer: 'Con-form Group', issueDate: '24 Feb 2026', dueDate: '26 Mar 2026', status: 'Sent', total: 18450, balanceDue: 18450 },
  { id: 'INV-2026-0044', customer: 'Acme Steel Works', issueDate: '22 Feb 2026', dueDate: '24 Mar 2026', status: 'Paid', total: 7230, balanceDue: 0 },
  { id: 'INV-2026-0043', customer: 'Pacific Fabrication', issueDate: '20 Feb 2026', dueDate: '22 Mar 2026', status: 'Overdue', total: 12680, balanceDue: 12680 },
  { id: 'INV-2026-0042', customer: 'Hunter Steel', issueDate: '18 Feb 2026', dueDate: '20 Mar 2026', status: 'Partially Paid', total: 5400, balanceDue: 2700 },
  { id: 'INV-2026-0041', customer: 'BHP Contractors', issueDate: '15 Feb 2026', dueDate: '17 Mar 2026', status: 'Paid', total: 23100, balanceDue: 0 },
  { id: 'INV-2026-0040', customer: 'Sydney Rail Corp', issueDate: '12 Feb 2026', dueDate: '14 Mar 2026', status: 'Sent', total: 9870, balanceDue: 9870 },
  { id: 'INV-2026-0039', customer: 'Kemppi Welding Supplies', issueDate: '10 Feb 2026', dueDate: '12 Mar 2026', status: 'Draft', total: 4560, balanceDue: 4560 },
  { id: 'INV-2026-0038', customer: 'Oberon Engineering', issueDate: '08 Feb 2026', dueDate: '10 Mar 2026', status: 'Cancelled', total: 1200, balanceDue: 0 },
];

const statusStyles: Record<InvoiceStatus, string> = {
  Draft: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
  Sent: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Viewed: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  'Partially Paid': 'bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]',
  Paid: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Overdue: 'bg-[var(--mw-error)]/10 text-[var(--mw-error)]',
  Cancelled: 'bg-[var(--neutral-100)] text-[var(--neutral-400)]',
};

const TABS = [
  { label: 'All', count: 147 },
  { label: 'Draft', count: 23 },
  { label: 'Sent', count: 45 },
  { label: 'Paid', count: 56 },
  { label: 'Overdue', count: 12 },
  { label: 'Cancelled', count: 11 },
];

export function InvoiceList({ onSelectInvoice }: { onSelectInvoice?: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? INVOICES : INVOICES.filter(inv => inv.status === activeTab || (activeTab === 'Partially Paid' && inv.status === 'Partially Paid'));

  return (
    <div className="p-6 space-y-5 overflow-y-auto max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Invoices</h1>
          <p className="text-sm text-[var(--neutral-500)]">Manage customer invoices and track payments</p>
        </div>
        <Button className="h-12 px-6 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] rounded shadow-sm gap-2">
          <PlusCircle className="w-5 h-5" /> New Invoice
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
          <Input placeholder="Search invoices..." className="pl-9 h-10 bg-white border-[var(--border)] rounded text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] text-[var(--mw-mirage)]">
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] text-[var(--mw-mirage)]">
          Export <ChevronDown className="w-4 h-4" />
        </Button>
        <span className="ml-auto text-xs text-[var(--neutral-500)]">1-25 of 147</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border)]">
        {TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              "px-4 py-3 text-sm transition-colors relative",
              activeTab === tab.label
                ? "text-[var(--mw-mirage)] font-medium"
                : "text-[var(--neutral-500)] hover:text-[var(--mw-mirage)]"
            )}
          >
            {tab.label} <span className="text-xs">({tab.count})</span>
            {activeTab === tab.label && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--mw-yellow-400)] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white shadow-xs border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                <th className="w-12 px-4 py-3"><Checkbox className="w-[18px] h-[18px]" /></th>
                <th className="text-left px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">INVOICE #</th>
                <th className="text-left px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">CUSTOMER</th>
                <th className="text-left px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">ISSUE DATE</th>
                <th className="text-left px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">DUE DATE</th>
                <th className="text-left px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
                <th className="text-right px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">TOTAL</th>
                <th className="text-right px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium">BALANCE DUE</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr
                  key={inv.id}
                  className={cn(
                    "border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors",
                    i % 2 === 1 ? "bg-[var(--neutral-100)]" : "bg-white"
                  )}
                  onClick={() => onSelectInvoice?.(inv.id)}
                >
                  <td className="px-4" onClick={e => e.stopPropagation()}><Checkbox className="w-[18px] h-[18px]" /></td>
                  <td className="px-4 text-xs text-[var(--mw-mirage)] tabular-nums">{inv.id}</td>
                  <td className="px-4 text-sm text-[var(--mw-mirage)]">{inv.customer}</td>
                  <td className="px-4 text-sm text-[var(--neutral-600)]">{inv.issueDate}</td>
                  <td className="px-4 text-sm text-[var(--neutral-600)]">{inv.dueDate}</td>
                  <td className="px-4">
                    <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", statusStyles[inv.status])}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 text-right text-sm tabular-nums font-medium">
                    ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 text-right text-sm tabular-nums font-medium">
                    ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="w-9 h-9"><MoreHorizontal className="w-4 h-4 text-[var(--neutral-500)]" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--neutral-500)]">Showing 1-8 of 147 invoices</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
            {[1, 2, 3, 4, 5].map(p => (
              <Button key={p} variant={p === 1 ? "default" : "ghost"} size="icon"
                className={cn("w-8 h-8 text-xs", p === 1 ? "bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-600)]" : "text-[var(--neutral-500)]")}
              >{p}</Button>
            ))}
            <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}