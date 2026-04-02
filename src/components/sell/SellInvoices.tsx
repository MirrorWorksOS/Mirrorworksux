/**
 * Sell Invoices - Invoices DataTable with status tabs
 * Uses shared PageToolbar pattern
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Plus, Download, MoreVertical, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedDownload } from '../ui/animated-icons';


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

export function SellInvoices() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredInvoices = (activeTab === 'all'
    ? mockInvoices
    : mockInvoices.filter(inv => inv.status === activeTab)
  ).filter(inv =>
    !search || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.customer.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const tabCounts = {
    all: mockInvoices.length,
    draft: mockInvoices.filter(i => i.status === 'draft').length,
    sent: mockInvoices.filter(i => i.status === 'sent').length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
    overdue: mockInvoices.filter(i => i.status === 'overdue').length,
  };

  const invoiceColumns: MwColumnDef<Invoice>[] = [
    {
      key: 'checkbox',
      header: (
        <input
          type="checkbox"
          className="rounded border-[var(--border)]"
          checked={selectedRows.size === filteredInvoices.length && filteredInvoices.length > 0}
          onChange={(e) => {
            if (e.target.checked) setSelectedRows(new Set(filteredInvoices.map(i => i.id)));
            else setSelectedRows(new Set());
          }}
        />
      ),
      headerClassName: 'w-12',
      className: 'w-12',
      cell: (inv) => (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="rounded border-[var(--border)]"
            checked={selectedRows.has(inv.id)}
            onChange={() => setSelectedRows(prev => {
              const next = new Set(prev);
              if (next.has(inv.id)) next.delete(inv.id);
              else next.add(inv.id);
              return next;
            })}
          />
        </div>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      cell: (inv) => (
        <span className="text-[var(--neutral-900)] text-sm font-medium tabular-nums hover:underline flex items-center gap-1">
          {inv.invoiceNumber}
          <ExternalLink className="w-4 h-4" />
        </span>
      ),
    },
    { key: 'customer', header: 'Customer', cell: (inv) => inv.customer },
    {
      key: 'issueDate',
      header: 'Issue date',
      cell: (inv) => (
        <span className="text-[var(--neutral-600)]">
          {new Date(inv.issueDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due date',
      cell: (inv) => {
        const daysOverdue = inv.status === 'overdue'
          ? Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return (
          <span className="text-[var(--neutral-600)]">
            {new Date(inv.dueDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
            {inv.status === 'overdue' && (
              <span className="ml-2 text-xs text-[var(--mw-error)] tabular-nums">({daysOverdue}d overdue)</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (inv) => (
        <div className="flex items-center justify-center">
          <StatusBadge status={inv.status} withDot />
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headerClassName: 'text-right',
      className: 'text-right font-medium tabular-nums',
      cell: (inv) => `$${inv.total.toLocaleString()}`,
    },
    {
      key: 'balanceDue',
      header: 'Balance due',
      headerClassName: 'text-right',
      className: 'text-right font-medium tabular-nums',
      cell: (inv) => (
        <span style={{ color: inv.balanceDue > 0 ? 'var(--mw-error)' : 'var(--mw-success)' }}>
          ${inv.balanceDue.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-12',
      className: 'w-12',
      cell: (inv) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
                <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/sell/invoices/${inv.id}`)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast('Edit invoice coming soon')}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success('Invoice duplicated')}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast('Invoice deleted')} className="text-[var(--mw-error)]">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const summaryByStatus = {
    paid: mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    sent: mockInvoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0),
    overdue: mockInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    draft: mockInvoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.total, 0),
  };

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${filteredInvoices.length} invoices • $${totalValue.toLocaleString()} total • $${totalOutstanding.toLocaleString()} outstanding`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'paid', label: 'Paid', value: summaryByStatus.paid, color: 'var(--mw-yellow-400)' },
          { key: 'sent', label: 'Sent', value: summaryByStatus.sent, color: 'var(--mw-mirage)' },
          { key: 'overdue', label: 'Overdue', value: summaryByStatus.overdue, color: 'var(--neutral-300)' },
          { key: 'draft', label: 'Draft', value: summaryByStatus.draft, color: 'var(--neutral-200)' },
        ]}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search invoices…" />
        <ToolbarFilterPills
          value={activeTab}
          onChange={(k) => setActiveTab(k as TabFilter)}
          options={[
            { key: 'all', label: 'All', count: tabCounts.all },
            { key: 'draft', label: 'Draft', count: tabCounts.draft },
            { key: 'sent', label: 'Sent', count: tabCounts.sent },
            { key: 'paid', label: 'Paid', count: tabCounts.paid },
            { key: 'overdue', label: 'Overdue', count: tabCounts.overdue },
          ]}
        />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <Button variant="outline" className="h-12 gap-2 rounded-full border-[var(--neutral-200)] px-5 group" onClick={() => toast.success('Invoices exported')}>
          <AnimatedDownload className="w-4 h-4" />
          Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/invoices/new')}>
          New Invoice
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <motion.div variants={staggerItem}>
        <MwDataTable<Invoice>
          columns={invoiceColumns}
          data={filteredInvoices}
          keyExtractor={(inv) => inv.id}
          onRowClick={(inv) => navigate(`/sell/invoices/${inv.id}`)}
          striped
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-white rounded-b-[var(--shape-lg)]">
          <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filteredInvoices.length} of {filteredInvoices.length}</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Next</button>
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
