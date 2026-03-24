import React, { useState } from 'react';
import { MoreVertical, FileText } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
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

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]' },
  sent: { label: 'Sent', className: 'bg-[var(--mw-blue-100)] text-[var(--mw-blue)]' },
  viewed: { label: 'Viewed', className: 'bg-[var(--mw-blue-100)] text-[var(--mw-blue)]' },
  partiallyPaid: { label: 'Partially Paid', className: 'bg-[var(--mw-amber-100)] text-[var(--mw-amber)]' },
  paid: { label: 'Paid', className: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]' },
  overdue: { label: 'Overdue', className: 'bg-[var(--mw-error-100)] text-[var(--mw-error)]' },
  cancelled: { label: 'Cancelled', className: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]' },
};

interface BookInvoicesProps {
  onSelectInvoice?: (invoiceId: string) => void;
}

export function BookInvoices({ onSelectInvoice }: BookInvoicesProps) {
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

  return (
    <div className="flex flex-col h-full bg-[var(--neutral-100)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice # or customer..."
                className="pl-9 bg-[var(--neutral-100)] border-transparent focus:bg-white"
              />
            </div>
            <Button variant="outline" className="border-[var(--border)] text-[var(--mw-mirage)]">
              <AnimatedFilter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[var(--border)]">
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
                ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium'
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
                  ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium'
                  : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
              )}
            >
              {statusConfig[status].label}
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
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Invoice #
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Issue Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Due Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Balance Due
                </th>
                <th className="text-center px-4 py-3 font-medium text-xs font-medium text-[var(--mw-mirage)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  variants={staggerItem}
                  custom={index}
                  onClick={() => onSelectInvoice?.(invoice.id)}
                  className="border-b border-[var(--border)] hover:bg-[var(--neutral-100)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-[var(--mw-mirage)] font-medium tabular-nums">
                        {invoice.id}
                      </span>
                      {invoice.jobReference && (
                        <span className="font-normal text-xs text-[var(--neutral-500)]">
                          Job: {invoice.jobReference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-[var(--border)]">
                        <AvatarImage src={invoice.customerLogo} />
                        <AvatarFallback className="text-xs">
                          {invoice.customer.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-normal text-xs text-[var(--mw-mirage)]">
                        {invoice.customer}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-normal text-xs text-[var(--neutral-500)]">
                    {new Date(invoice.issueDate).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs',
                        invoice.status === 'overdue' ? 'text-[var(--mw-error)] font-medium' : 'text-[var(--neutral-500)]'
                      )}
                    >
                      {new Date(invoice.dueDate).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-xs rounded px-2 py-0.5 border-transparent', statusConfig[invoice.status].className)}>
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--mw-mirage)] font-medium tabular-nums">
                    ${invoice.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'tabular-nums text-xs font-medium',
                        invoice.balanceDue === 0 ? 'text-[var(--mw-mirage)]' : 'text-[var(--mw-mirage)]'
                      )}
                    >
                      {invoice.balanceDue === 0 ? 'Paid' : `$${invoice.balanceDue.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Send action
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
                          // Download action
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
                          // More actions
                        }}
                      >
                        <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <EmptyState
              variant="compact"
              icon={FileText}
              title="No invoices found"
              description="Try adjusting your search or filter criteria"
            />
          )}
        </div>

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