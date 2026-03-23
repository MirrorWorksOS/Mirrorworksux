/**
 * Sell Invoices - Invoices DataTable with status tabs
 * Matches BookInvoices pattern
 */

import React, { useState } from 'react';
import { Plus, Download, Filter, MoreVertical, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus, AnimatedFilter, AnimatedDownload } from '../ui/animated-icons';


type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
type TabFilter = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  balanceDue: number;
}

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2026-0234', customer: 'TechCorp Industries', issueDate: '2026-03-15', dueDate: '2026-04-14', status: 'sent', total: 45000, balanceDue: 45000 },
  { id: '2', invoiceNumber: 'INV-2026-0233', customer: 'Pacific Fabrication', issueDate: '2026-03-12', dueDate: '2026-04-11', status: 'paid', total: 8500, balanceDue: 0 },
  { id: '3', invoiceNumber: 'INV-2026-0232', customer: 'Sydney Rail Corp', issueDate: '2026-03-08', dueDate: '2026-04-07', status: 'sent', total: 67000, balanceDue: 67000 },
  { id: '4', invoiceNumber: 'INV-2026-0231', customer: 'Hunter Steel Co', issueDate: '2026-03-05', dueDate: '2026-04-04', status: 'paid', total: 22000, balanceDue: 0 },
  { id: '5', invoiceNumber: 'INV-2026-0230', customer: 'BHP Contractors', issueDate: '2026-02-28', dueDate: '2026-03-30', status: 'overdue', total: 128000, balanceDue: 128000 },
  { id: '6', invoiceNumber: 'INV-2026-0229', customer: 'Kemppi Australia', issueDate: '2026-02-25', dueDate: '2026-03-25', status: 'overdue', total: 12000, balanceDue: 12000 },
  { id: '7', invoiceNumber: 'INV-2026-DRAFT-01', customer: 'TechCorp Industries', issueDate: '2026-03-19', dueDate: '2026-04-18', status: 'draft', total: 15500, balanceDue: 15500 },
];

const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Draft', dot: 'var(--neutral-500)' };
    case 'sent': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-900)]', label: 'Sent', dot: 'var(--mw-mirage)' };
    case 'paid': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-900)]', label: 'Paid', dot: 'var(--mw-mirage)' };
    case 'overdue': return { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]', label: 'Overdue', dot: 'var(--mw-error)' };
  }
};

export function SellInvoices() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredInvoices = activeTab === 'all'
    ? mockInvoices
    : mockInvoices.filter(inv => inv.status === activeTab);

  const totalValue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const tabCounts = {
    all: mockInvoices.length,
    draft: mockInvoices.filter(i => i.status === 'draft').length,
    sent: mockInvoices.filter(i => i.status === 'sent').length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
    overdue: mockInvoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--neutral-900)]">Invoices</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {filteredInvoices.length} invoices • ${totalValue.toLocaleString()} total • ${totalOutstanding.toLocaleString()} outstanding
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
            <AnimatedFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
            <AnimatedDownload className="w-4 h-4" />
            Export
          </Button>
          <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--neutral-900)] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)]">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as TabFilter[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors relative",
              activeTab === tab
                ? 'border-[var(--mw-yellow-400)] text-[var(--neutral-900)] font-medium'
                : 'border-transparent text-[var(--neutral-500)] hover:text-[var(--neutral-900)]'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <Badge className="ml-2 bg-[var(--neutral-100)] text-[var(--neutral-600)] border-0 text-xs">{tabCounts[tab]}</Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" className="rounded border-[var(--border)]" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">INVOICE #</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">CUSTOMER</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">ISSUE DATE</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">DUE DATE</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">TOTAL</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">BALANCE DUE</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, idx) => {
                  const statusBadge = getStatusBadge(invoice.status);
                  const daysOverdue = invoice.status === 'overdue'
                    ? Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <tr key={invoice.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[var(--neutral-100)]")}>
                      <td className="px-4">
                        <input type="checkbox" className="rounded border-[var(--border)]" />
                      </td>
                      <td className="px-4">
                        <a href={`/sell/invoices/${invoice.id}`} className="text-[var(--neutral-900)]  text-sm font-medium hover:underline flex items-center gap-1">
                          {invoice.invoiceNumber}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="px-4 text-sm text-[var(--neutral-900)]">{invoice.customer}</td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">
                        {new Date(invoice.issueDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">
                        {new Date(invoice.dueDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {invoice.status === 'overdue' && (
                          <span className="ml-2 text-xs text-[var(--mw-error)]">({daysOverdue}d overdue)</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5", statusBadge.bg, statusBadge.text)}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusBadge.dot }} />
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 text-right text-sm  font-medium">${invoice.total.toLocaleString()}</td>
                      <td className="px-4 text-right text-sm  font-medium" style={{ color: invoice.balanceDue > 0 ? 'var(--mw-error)' : 'var(--mw-success)' }}>
                        ${invoice.balanceDue.toLocaleString()}
                      </td>
                      <td className="px-4">
                        <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filteredInvoices.length} of {filteredInvoices.length}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Previous</button>
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Next</button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
