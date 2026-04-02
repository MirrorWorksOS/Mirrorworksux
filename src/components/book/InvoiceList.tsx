import React, { useState } from 'react';
import { Plus, Download, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';

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

const STATUS_KEY_MAP: Record<InvoiceStatus, StatusKey> = {
  Draft: 'draft',
  Sent: 'sent',
  Viewed: 'viewed',
  'Partially Paid': 'partiallyPaid',
  Paid: 'paid',
  Overdue: 'overdue',
  Cancelled: 'cancelled',
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
  const [search, setSearch] = useState('');

  const filtered = (activeTab === 'All' ? INVOICES : INVOICES.filter(inv => inv.status === activeTab || (activeTab === 'Partially Paid' && inv.status === 'Partially Paid')))
    .filter(inv => !search || inv.id.toLowerCase().includes(search.toLowerCase()) || inv.customer.toLowerCase().includes(search.toLowerCase()));

  const summaryByStatus = {
    paid: INVOICES.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0),
    sent: INVOICES.filter(i => i.status === 'Sent').reduce((s, i) => s + i.total, 0),
    overdue: INVOICES.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0),
    draft: INVOICES.filter(i => i.status === 'Draft').reduce((s, i) => s + i.total, 0),
  };

  const columns: MwColumnDef<Invoice>[] = [
    {
      key: 'checkbox',
      header: <Checkbox className="w-[18px] h-[18px]" />,
      cell: () => (
        <span onClick={e => e.stopPropagation()}>
          <Checkbox className="w-[18px] h-[18px]" />
        </span>
      ),
      className: 'w-12',
    },
    {
      key: 'id',
      header: 'INVOICE #',
      cell: (inv) => <span className="text-xs text-[var(--mw-mirage)] tabular-nums">{inv.id}</span>,
    },
    {
      key: 'customer',
      header: 'CUSTOMER',
      cell: (inv) => <span className="text-sm text-[var(--mw-mirage)]">{inv.customer}</span>,
    },
    {
      key: 'issueDate',
      header: 'ISSUE DATE',
      cell: (inv) => <span className="text-sm text-[var(--neutral-600)]">{inv.issueDate}</span>,
    },
    {
      key: 'dueDate',
      header: 'DUE DATE',
      cell: (inv) => <span className="text-sm text-[var(--neutral-600)]">{inv.dueDate}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (inv) => (
        <StatusBadge status={STATUS_KEY_MAP[inv.status]}>
          {inv.status}
        </StatusBadge>
      ),
    },
    {
      key: 'total',
      header: 'TOTAL',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (inv) => (
        <span className="text-sm tabular-nums font-medium">
          ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'balanceDue',
      header: 'BALANCE DUE',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (inv) => (
        <span className="text-sm tabular-nums font-medium">
          ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: () => (
        <span onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="w-9 h-9"><MoreHorizontal className="w-4 h-4 text-[var(--neutral-500)]" /></Button>
        </span>
      ),
    },
  ];

  return (
    <PageShell className="p-6 space-y-6 mx-auto max-w-[1200px] overflow-y-auto">
      <PageHeader
        title="Invoices"
        subtitle="Manage customer invoices and track payments"
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
          onChange={setActiveTab}
          options={TABS.map(t => ({ key: t.label, label: t.label, count: t.count }))}
        />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <Button variant="outline" className="h-12 gap-2 rounded-full border-[var(--neutral-200)] px-5" onClick={() => {}}>
          <Download className="w-4 h-4" /> Export
        </Button>
        <ToolbarPrimaryButton icon={Plus}>
          New Invoice
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <MwDataTable
        columns={columns}
        data={filtered}
        keyExtractor={(inv) => inv.id}
        striped
        onRowClick={(inv) => onSelectInvoice?.(inv.id)}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3">
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
    </PageShell>
  );
}
