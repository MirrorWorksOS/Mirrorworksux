import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { MoreVertical, FileText } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import {
  AnimatedSearch,
  AnimatedFilter,
  AnimatedDownload,
  AnimatedPlus,
  AnimatedSend,
  AnimatedEye
} from '../ui/animated-icons';


type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partiallyPaid' | 'paid' | 'overdue' | 'cancelled';
type ViewMode = 'list' | 'detail';

interface Invoice {
  id: string;
  customer: string;
  customerLogo?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  balanceDue: number;
  jobReference?: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0234',
    customer: 'TechCorp Industries',
    customerLogo: 'https://i.pravatar.cc/150?img=1',
    issueDate: '2026-03-01',
    dueDate: '2026-03-15',
    status: 'overdue',
    total: 12400,
    balanceDue: 12400,
    jobReference: 'MW-001',
  },
  {
    id: 'INV-2026-0235',
    customer: 'AeroSpace Ltd',
    customerLogo: 'https://i.pravatar.cc/150?img=2',
    issueDate: '2026-03-10',
    dueDate: '2026-04-10',
    status: 'sent',
    total: 24800,
    balanceDue: 24800,
    jobReference: 'MW-003',
  },
  {
    id: 'INV-2026-0236',
    customer: 'Industrial Solutions',
    customerLogo: 'https://i.pravatar.cc/150?img=3',
    issueDate: '2026-03-12',
    dueDate: '2026-04-12',
    status: 'paid',
    total: 18900,
    balanceDue: 0,
    jobReference: 'MW-006',
  },
  {
    id: 'INV-2026-0237',
    customer: 'Climate Systems',
    customerLogo: 'https://i.pravatar.cc/150?img=4',
    issueDate: '2026-03-15',
    dueDate: '2026-04-15',
    status: 'viewed',
    total: 45200,
    balanceDue: 45200,
    jobReference: 'MW-004',
  },
  {
    id: 'INV-2026-0238',
    customer: 'Construction Pro',
    customerLogo: 'https://i.pravatar.cc/150?img=5',
    issueDate: '2026-03-18',
    dueDate: '2026-04-18',
    status: 'partiallyPaid',
    total: 89500,
    balanceDue: 44750,
    jobReference: 'MW-005',
  },
];

const STATUS_LABEL_MAP: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partiallyPaid: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

interface BookInvoicesProps {
  onSelectInvoice?: (invoiceId: string) => void;
}

export function BookInvoices({ onSelectInvoice }: BookInvoicesProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | InvoiceStatus>('all');

  const filteredInvoices = MOCK_INVOICES.filter(invoice => {
    if (activeTab !== 'all' && invoice.status !== activeTab) return false;
    if (searchQuery) {
      return (
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const statusCounts = MOCK_INVOICES.reduce((acc, invoice) => {
    acc[invoice.status] = (acc[invoice.status] || 0) + 1;
    return acc;
  }, {} as Record<InvoiceStatus, number>);

  // Compute summary totals by status
  const paidTotal = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pendingTotal = MOCK_INVOICES.filter(i => ['sent', 'viewed', 'partiallyPaid', 'draft'].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const overdueTotal = MOCK_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const columns: MwColumnDef<Invoice>[] = [
    {
      key: 'id',
      header: 'Invoice #',
      tooltip: 'Unique invoice identifier',
      cell: (invoice) => (
        <div className="flex flex-col">
          <span className="text-xs text-foreground font-medium tabular-nums">
            {invoice.id}
          </span>
          {invoice.jobReference && (
            <span className="font-normal text-xs text-[var(--neutral-500)]">
              Job: {invoice.jobReference}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (invoice) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border border-[var(--border)]">
            <AvatarImage src={invoice.customerLogo} />
            <AvatarFallback className="text-xs">
              {invoice.customer.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-xs text-foreground">
            {invoice.customer}
          </span>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      cell: (invoice) => (
        <span className="font-normal text-xs text-[var(--neutral-500)] tabular-nums">
          {new Date(invoice.issueDate).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      tooltip: 'Payment due date',
      cell: (invoice) => (
        <span
          className={cn(
            'text-xs tabular-nums',
            invoice.status === 'overdue' ? 'text-[var(--mw-error)] font-medium' : 'text-[var(--neutral-500)]'
          )}
        >
          {new Date(invoice.dueDate).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (invoice) => (
        <StatusBadge status={invoice.status as StatusKey}>
          {STATUS_LABEL_MAP[invoice.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (invoice) => (
        <span className="text-xs text-foreground font-medium tabular-nums">
          ${invoice.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      tooltip: 'Outstanding amount remaining',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (invoice) => (
        <span
          className={cn(
            'tabular-nums text-xs font-medium',
            invoice.balanceDue === 0 ? 'text-foreground' : 'text-foreground'
          )}
        >
          {invoice.balanceDue === 0 ? 'Paid' : `$${invoice.balanceDue.toLocaleString()}`}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (invoice) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <AnimatedSend className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <AnimatedDownload className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--neutral-100)]">
      {/* Toolbar */}
      <div className="bg-card border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice # or customer..."
                className="pl-9 bg-[var(--neutral-100)] border-transparent focus:bg-card"
              />
            </div>
            <Button variant="outline" className="border-[var(--border)] text-foreground" onClick={() => toast('Filter panel coming soon')}>
              <AnimatedFilter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[var(--border)]" onClick={() => toast.success('Exporting invoices…')}>
              <AnimatedDownload className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] font-medium">
              <AnimatedPlus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-2 text-xs rounded-[var(--shape-lg)] transition-colors whitespace-nowrap',
              activeTab === 'all'
                ? 'bg-[var(--neutral-100)] text-foreground font-medium'
                : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
            )}
          >
            All <span className="ml-1">({MOCK_INVOICES.length})</span>
          </button>
          {(['draft', 'sent', 'viewed', 'paid', 'overdue'] as InvoiceStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                'px-4 py-2 text-xs rounded-[var(--shape-lg)] transition-colors whitespace-nowrap',
                activeTab === status
                  ? 'bg-[var(--neutral-100)] text-foreground font-medium'
                  : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
              )}
            >
              {STATUS_LABEL_MAP[status]}
              {statusCounts[status] && <span className="ml-1">({statusCounts[status]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="flex-1 overflow-auto p-6"
      >
        <ToolbarSummaryBar
          segments={[
            { key: 'paid', label: 'Paid', value: paidTotal, color: 'var(--mw-yellow-400)' },
            { key: 'pending', label: 'Pending', value: pendingTotal, color: 'var(--mw-mirage)' },
            { key: 'overdue', label: 'Overdue', value: overdueTotal, color: 'var(--neutral-400)' },
          ]}
        />
        <MwDataTable
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(invoice) => invoice.id}
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          onRowClick={(invoice) => onSelectInvoice ? onSelectInvoice(invoice.id) : navigate(`/book/invoices/${invoice.id}`)}
          emptyState={
            <EmptyState
              variant="compact"
              icon={FileText}
              title="No invoices found"
              description="Try adjusting your search or filter criteria"
            />
          }
        />

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="font-normal text-xs text-[var(--neutral-500)]">
              Showing {filteredInvoices.length} of {MOCK_INVOICES.length} invoices
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[var(--border)]">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="border-[var(--border)]">
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
