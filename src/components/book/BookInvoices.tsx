import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { 
  AnimatedSearch, 
  AnimatedFilter, 
  AnimatedDownload, 
  AnimatedPlus,
  AnimatedSend,
  AnimatedEye
} from '../ui/animated-icons';

const { animationVariants } = designSystem;

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
  draft: { label: 'Draft', className: 'bg-[#F5F5F5] text-[#737373]' },
  sent: { label: 'Sent', className: 'bg-[#DBEAFE] text-[#0A7AFF]' },
  viewed: { label: 'Viewed', className: 'bg-[#DBEAFE] text-[#0A7AFF]' },
  partiallyPaid: { label: 'Partially Paid', className: 'bg-[#FFEDD5] text-[#FF8B00]' },
  paid: { label: 'Paid', className: 'bg-[#F5F5F5] text-[#1A2732]' },
  overdue: { label: 'Overdue', className: 'bg-[#FEE2E2] text-[#EF4444]' },
  cancelled: { label: 'Cancelled', className: 'bg-[#F5F5F5] text-[#737373]' },
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
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice # or customer..."
                className="pl-9 bg-[#F5F5F5] border-transparent focus:bg-white"
              />
            </div>
            <Button variant="outline" className="border-[var(--border)] text-[#1A2732]">
              <AnimatedFilter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[var(--border)]">
              <AnimatedDownload className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] font-medium">
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
              'px-4 py-2 font-[\'Geist:Regular\',sans-serif] text-[13px] rounded-lg transition-colors whitespace-nowrap',
              activeTab === 'all'
                ? 'bg-[#F5F5F5] text-[#1A2732] font-medium'
                : 'text-[#737373] hover:bg-[#F5F5F5]'
            )}
          >
            All <span className="ml-1">({MOCK_INVOICES.length})</span>
          </button>
          {(['draft', 'sent', 'viewed', 'paid', 'overdue'] as InvoiceStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                'px-4 py-2 font-[\'Geist:Regular\',sans-serif] text-[13px] rounded-lg transition-colors whitespace-nowrap',
                activeTab === status
                  ? 'bg-[#F5F5F5] text-[#1A2732] font-medium'
                  : 'text-[#737373] hover:bg-[#F5F5F5]'
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
        variants={animationVariants.stagger}
        className="flex-1 overflow-auto p-6"
      >
        <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F5F5F5] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Invoice #
                </th>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Issue Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Due Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Balance Due
                </th>
                <th className="text-center px-4 py-3 font-medium text-[13px] font-medium text-[#1A2732]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  variants={animationVariants.listItem}
                  custom={index}
                  onClick={() => onSelectInvoice?.(invoice.id)}
                  className="border-b border-[var(--border)] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className=" text-[13px] text-[#1A2732] font-medium">
                        {invoice.id}
                      </span>
                      {invoice.jobReference && (
                        <span className="font-normal text-[11px] text-[#737373]">
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
                      <span className="font-normal text-[13px] text-[#1A2732]">
                        {invoice.customer}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-normal text-[13px] text-[#737373]">
                    {new Date(invoice.issueDate).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'font-[\'Geist:Regular\',sans-serif] text-[13px]',
                        invoice.status === 'overdue' ? 'text-[#EF4444] font-medium' : 'text-[#737373]'
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
                  <td className="px-4 py-3  text-[13px] text-[#1A2732] font-medium">
                    ${invoice.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'font-[\'Roboto_Mono\',monospace] text-[13px] font-medium',
                        invoice.balanceDue === 0 ? 'text-[#1A2732]' : 'text-[#1A2732]'
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
                        <AnimatedSend className="w-4 h-4 text-[#737373]" />
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
                        <AnimatedDownload className="w-4 h-4 text-[#737373]" />
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
                        <MoreVertical className="w-4 h-4 text-[#737373]" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-[#E5E5E5] mb-3" />
              <p className="font-medium text-[14px] font-medium text-[#737373]">
                No invoices found
              </p>
              <p className="font-normal text-[13px] text-[#737373] mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="font-normal text-[13px] text-[#737373]">
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