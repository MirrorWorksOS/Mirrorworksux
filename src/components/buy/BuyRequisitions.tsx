/**
 * Buy Requisitions - DataTable with status workflow
 * Status: Draft, Submitted, Approved, Rejected, Converted to PO
 */

import React, { useState } from 'react';
import { Plus, Filter, MoreVertical, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus, AnimatedFilter } from '../ui/animated-icons';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';


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

const mockRequisitions: Requisition[] = [
  { id: '1', reqNumber: 'REQ-2026-0089', requestor: 'Sarah Chen', department: 'Fabrication', date: '2026-03-18', status: 'submitted', total: 8500, items: 3 },
  { id: '2', reqNumber: 'REQ-2026-0088', requestor: 'Mike Thompson', department: 'Welding', date: '2026-03-17', status: 'approved', total: 3200, items: 2 },
  { id: '3', reqNumber: 'REQ-2026-0087', requestor: 'Emma Wilson', department: 'Finishing', date: '2026-03-15', status: 'converted', total: 12400, items: 5 },
  { id: '4', reqNumber: 'REQ-2026-0086', requestor: 'David Lee', department: 'Fabrication', date: '2026-03-14', status: 'rejected', total: 28000, items: 1 },
  { id: '5', reqNumber: 'REQ-2026-DRAFT-01', requestor: 'Sarah Chen', department: 'Fabrication', date: '2026-03-19', status: 'draft', total: 1500, items: 2 },
];

const getStatusBadge = (status: ReqStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Draft', dot: 'var(--neutral-500)' };
    case 'submitted': return { bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', label: 'Submitted', dot: 'var(--mw-blue)' };
    case 'approved': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Approved', dot: 'var(--mw-mirage)' };
    case 'rejected': return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Rejected', dot: 'var(--mw-error)' };
    case 'converted': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Converted', dot: 'var(--mw-mirage)' };
  }
};

export function BuyRequisitions() {
  const [activeTab, setActiveTab] = useState<'all' | ReqStatus>('all');

  const filteredReqs = activeTab === 'all' ? mockRequisitions : mockRequisitions.filter(r => r.status === activeTab);

  const columns: MwColumnDef<Requisition>[] = [
    { key: 'reqNumber', header: 'REQ #', cell: (req) => (
      <a href={`/buy/requisitions/${req.id}`} className="text-[var(--mw-mirage)] text-sm font-medium hover:underline flex items-center gap-1">
        {req.reqNumber}
        <ExternalLink className="w-4 h-4" />
      </a>
    )},
    { key: 'requestor', header: 'Requestor', cell: (req) => <span className="text-[var(--mw-mirage)]">{req.requestor}</span> },
    { key: 'department', header: 'Department', cell: (req) => <span className="text-[var(--neutral-600)]">{req.department}</span> },
    { key: 'date', header: 'Date', cell: (req) => <span className="text-[var(--neutral-600)]">{new Date(req.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</span> },
    { key: 'status', header: 'Status', headerClassName: 'text-center', className: 'text-center', cell: (req) => {
      const statusBadge = getStatusBadge(req.status);
      return (
        <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5 w-fit mx-auto", statusBadge.bg, statusBadge.text)}>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusBadge.dot }} />
          {statusBadge.label}
        </Badge>
      );
    }},
    { key: 'items', header: 'Items', headerClassName: 'text-right', className: 'text-right', cell: (req) => <span className="tabular-nums">{req.items}</span> },
    { key: 'total', header: 'Total', headerClassName: 'text-right', className: 'text-right', cell: (req) => <span className="font-medium tabular-nums">${req.total.toLocaleString()}</span> },
    { key: 'actions', header: '', cell: (req) => (
      <>
        {req.status === 'submitted' && (
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors" title="Approve" onClick={(e) => { e.stopPropagation(); toast.success(`Requisition ${req.reqNumber} approved`); }}>
              <CheckCircle2 className="w-4 h-4 text-[var(--mw-mirage)]" />
            </button>
            <button className="p-1 hover:bg-[var(--mw-error-100)] rounded transition-colors" title="Reject" onClick={(e) => { e.stopPropagation(); toast.success(`Requisition ${req.reqNumber} rejected`); }}>
              <XCircle className="w-4 h-4 text-[var(--mw-error)]" />
            </button>
          </div>
        )}
        {req.status !== 'submitted' && (
          <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors" onClick={(e) => { e.stopPropagation(); toast('Requisition actions coming soon'); }}>
            <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
          </button>
        )}
      </>
    )},
  ];

  return (
    <PageShell>
      <PageHeader
        title="Purchase Requisitions"
        subtitle={`${filteredReqs.length} requisitions`}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group" onClick={() => toast('Filter options coming soon')}>
              <AnimatedFilter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] rounded-xl group" onClick={() => toast('New requisition coming soon')}>
              <AnimatedPlus className="w-4 h-4 mr-2" />
              New Requisition
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)]">
        {(['all', 'draft', 'submitted', 'approved', 'rejected', 'converted'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 text-sm border-b-2 transition-colors",
              activeTab === tab ? 'border-[var(--mw-yellow-400)] text-[var(--mw-mirage)] font-medium' : 'border-transparent text-[var(--neutral-500)] hover:text-[var(--mw-mirage)]')}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <MwDataTable
        columns={columns}
        data={filteredReqs}
        keyExtractor={(req) => req.id}
        striped
      />
    </PageShell>
  );
}
