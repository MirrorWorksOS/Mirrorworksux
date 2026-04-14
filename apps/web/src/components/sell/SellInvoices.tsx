/**
 * Sell Invoices - Invoices DataTable with status tabs
 * Uses shared PageToolbar pattern
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Plus, Download, MoreVertical, ExternalLink } from 'lucide-react';
import { sellInvoices } from '@/services';
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

/** Bridge centralized SellInvoice data to the local Invoice shape */
const mockInvoices: Invoice[] = sellInvoices.map((si) => ({
  id: si.id,
  invoiceNumber: si.invoiceNumber,
  customer: si.customerName,
  issueDate: si.date,
  dueDate: si.dueDate,
  status: si.status as InvoiceStatus,
  total: si.amount,
  balanceDue: si.amount - si.paidAmount,
}));

export function SellInvoices() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
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
      key: 'invoiceNumber',
      header: 'Invoice #',
      tooltip: 'Unique invoice reference number',
      cell: (inv) => (
        <span className="text-foreground text-sm font-medium tabular-nums hover:underline flex items-center gap-1">
          {inv.invoiceNumber}
          <ExternalLink className="w-4 h-4" />
        </span>
      ),
    },
    { key: 'customer', header: 'Customer', tooltip: 'Billing customer name', cell: (inv) => inv.customer },
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
      tooltip: 'Total invoice amount incl. tax',
      headerClassName: 'text-right',
      className: 'text-right font-medium tabular-nums',
      cell: (inv) => `$${inv.total.toLocaleString()}`,
    },
    {
      key: 'balanceDue',
      header: 'Balance due',
      tooltip: 'Remaining unpaid balance',
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
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          striped
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-card rounded-b-[var(--shape-lg)]">
          <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filteredInvoices.length} of {filteredInvoices.length}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
