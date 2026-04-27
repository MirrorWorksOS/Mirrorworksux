/**
 * Buy Requisitions - DataTable with status workflow
 * Status: Draft, Submitted, Approved, Rejected, Converted to PO
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, MoreVertical, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedDownload } from '../ui/animated-icons';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';


type ReqStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';

interface Requisition {
  id: string;
  reqNumber: string;
  requestor: string;
  department: string;
  date: string;
  status: ReqStatus;
  total: number;
  items: number;
}

import { requisitions as centralReqs, employees } from '@/services';

const DEPT_LOOKUP: Record<string, string> = { Sales: 'Sales', Planning: 'Planning', Production: 'Fabrication', QC: 'QC', Purchasing: 'Purchasing', Logistics: 'Logistics' };
const EXTRA_REQS: Requisition[] = [
  { id: 'req-extra-1', reqNumber: 'REQ-2026-0087', requestor: 'Emma Wilson', department: 'Finishing', date: '2026-03-15', status: 'converted', total: 12400, items: 5 },
  { id: 'req-extra-2', reqNumber: 'REQ-2026-0086', requestor: 'David Lee', department: 'Fabrication', date: '2026-03-14', status: 'rejected', total: 28000, items: 1 },
  { id: 'req-extra-3', reqNumber: 'REQ-2026-DRAFT-01', requestor: 'Sarah Chen', department: 'Fabrication', date: '2026-03-19', status: 'draft', total: 1500, items: 2 },
];
const mockRequisitions: Requisition[] = [
  ...centralReqs.map((r) => {
    const emp = employees.find((e) => e.id === r.requestorId);
    return {
      id: r.id,
      reqNumber: r.reqNumber,
      requestor: r.requestorName,
      department: DEPT_LOOKUP[emp?.department ?? ''] ?? emp?.department ?? 'General',
      date: r.date,
      status: (r.status === 'pending_approval' ? 'submitted' : r.status === 'ordered' ? 'converted' : r.status) as ReqStatus,
      total: r.total,
      items: r.items.length,
    };
  }),
  ...EXTRA_REQS,
];

const getStatusBadge = (status: ReqStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Draft', dot: 'var(--neutral-500)' };
    case 'submitted': return { bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', label: 'Submitted', dot: 'var(--mw-blue)' };
    case 'approved': return { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Approved', dot: 'var(--mw-mirage)' };
    case 'rejected': return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Rejected', dot: 'var(--mw-error)' };
    case 'converted': return { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Converted', dot: 'var(--mw-mirage)' };
  }
};

export function BuyRequisitions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | ReqStatus>('all');
  const [search, setSearch] = useState('');

  const filteredReqs = (activeTab === 'all' ? mockRequisitions : mockRequisitions.filter(r => r.status === activeTab))
    .filter(r => !search || r.reqNumber.toLowerCase().includes(search.toLowerCase()) || r.requestor.toLowerCase().includes(search.toLowerCase()));
  const totalValue = filteredReqs.reduce((sum, r) => sum + r.total, 0);

  const tabCounts = {
    all: mockRequisitions.length,
    draft: mockRequisitions.filter(r => r.status === 'draft').length,
    submitted: mockRequisitions.filter(r => r.status === 'submitted').length,
    approved: mockRequisitions.filter(r => r.status === 'approved').length,
    rejected: mockRequisitions.filter(r => r.status === 'rejected').length,
    converted: mockRequisitions.filter(r => r.status === 'converted').length,
  };

  const summaryByStatus = {
    submitted: mockRequisitions.filter(r => r.status === 'submitted').reduce((s, r) => s + r.total, 0),
    approved: mockRequisitions.filter(r => r.status === 'approved').reduce((s, r) => s + r.total, 0),
    draft: mockRequisitions.filter(r => r.status === 'draft').reduce((s, r) => s + r.total, 0),
    other: mockRequisitions.filter(r => !['submitted', 'approved', 'draft'].includes(r.status)).reduce((s, r) => s + r.total, 0),
  };

  const columns: MwColumnDef<Requisition>[] = [
    { key: 'reqNumber', header: 'REQ #', tooltip: 'Requisition number', cell: (req) => (
      <a href={`/buy/requisitions/${req.id}`} className="text-foreground font-medium hover:underline flex items-center gap-1">
        {req.reqNumber}
        <ExternalLink className="w-4 h-4" />
      </a>
    )},
    { key: 'requestor', header: 'Requestor', tooltip: 'Person who raised the requisition', cell: (req) => <span className="text-foreground">{req.requestor}</span> },
    { key: 'department', header: 'Department', tooltip: 'Requesting department', cell: (req) => <span className="text-[var(--neutral-500)]">{req.department}</span> },
    { key: 'date', header: 'Date', tooltip: 'Requisition date', cell: (req) => {
      const d = new Date(req.date);
      return <span className="tabular-nums text-[var(--neutral-500)]">{d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>;
    }},
    { key: 'status', header: 'Status', tooltip: 'Approval status', cell: (req) => {
      const variantMap: Record<ReqStatus, 'neutral' | 'info' | 'success' | 'error'> = {
        draft: 'neutral', submitted: 'info', approved: 'success', rejected: 'error', converted: 'neutral',
      };
      return (
        <StatusBadge variant={variantMap[req.status]} withDot>
          {getStatusBadge(req.status).label}
        </StatusBadge>
      );
    }},
    { key: 'items', header: 'Items', tooltip: 'Number of line items', headerClassName: 'text-right', className: 'text-right', cell: (req) => <span className="tabular-nums">{req.items}</span> },
    { key: 'total', header: 'Total', tooltip: 'Requisition total value', headerClassName: 'text-right', className: 'text-right', cell: (req) => (
      <span className="font-medium tabular-nums">${req.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
    )},
    { key: 'actions', header: '', cell: (req) => (
      <>
        {req.status === 'submitted' && (
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-all duration-200 ease-[var(--ease-standard)]" title="Approve" onClick={(e) => { e.stopPropagation(); toast.success(`Requisition ${req.reqNumber} approved`); }}>
              <CheckCircle2 className="w-4 h-4 text-foreground" />
            </button>
            <button className="p-1 hover:bg-[var(--mw-error-100)] rounded transition-all duration-200 ease-[var(--ease-standard)]" title="Reject" onClick={(e) => { e.stopPropagation(); toast.success(`Requisition ${req.reqNumber} rejected`); }}>
              <XCircle className="w-4 h-4 text-[var(--mw-error)]" />
            </button>
          </div>
        )}
        {req.status !== 'submitted' && (
          <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-all duration-200 ease-[var(--ease-standard)]" onClick={(e) => { e.stopPropagation(); navigate(`/buy/requisitions/${req.id}`); }}>
            <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
          </button>
        )}
      </>
    )},
  ];

  return (
    <PageShell className="p-6 space-y-6">
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Purchase Requisitions"
        subtitle={`${filteredReqs.length} requisitions • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'submitted', label: 'Submitted', value: summaryByStatus.submitted, color: 'var(--mw-yellow-400)' },
          { key: 'approved', label: 'Approved', value: summaryByStatus.approved, color: 'var(--mw-mirage)' },
          { key: 'draft', label: 'Draft', value: summaryByStatus.draft, color: 'var(--neutral-400)' },
          { key: 'other', label: 'Other', value: summaryByStatus.other, color: 'var(--neutral-200)' },
        ]}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search requisitions…" />
        <ToolbarFilterPills
          value={activeTab}
          onChange={(k) => setActiveTab(k as 'all' | ReqStatus)}
          options={[
            { key: 'all', label: 'All', count: tabCounts.all },
            { key: 'draft', label: 'Draft', count: tabCounts.draft },
            { key: 'submitted', label: 'Submitted', count: tabCounts.submitted },
            { key: 'approved', label: 'Approved', count: tabCounts.approved },
            { key: 'rejected', label: 'Rejected', count: tabCounts.rejected },
            { key: 'converted', label: 'Converted', count: tabCounts.converted },
          ]}
        />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <Button variant="outline" className="h-12 gap-2 border-[var(--neutral-200)] px-5 group" onClick={() => toast.success('Exporting requisitions...')}>
          <AnimatedDownload className="w-4 h-4" />
          Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/buy/requisitions/new')}>
          New Requisition
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <motion.div variants={staggerItem}>
        <MwDataTable
          columns={columns}
          data={filteredReqs}
          keyExtractor={(req) => req.id}
          striped
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--neutral-100)]">
          <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filteredReqs.length} of {filteredReqs.length}</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-foreground/[0.38]" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-foreground/[0.38]" disabled>Next</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </PageShell>
  );
}
