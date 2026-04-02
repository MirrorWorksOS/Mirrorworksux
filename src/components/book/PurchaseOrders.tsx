import React, { useState } from 'react';
import { PlusCircle, Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { toast } from 'sonner';

type POStatus = 'Draft' | 'Sent' | 'Acknowledged' | 'Partial' | 'Received' | 'Cancelled';

const STATUS_KEY_MAP: Record<POStatus, StatusKey> = {
  Draft: 'draft',
  Sent: 'sent',
  Acknowledged: 'approved',
  Partial: 'partiallyPaid',
  Received: 'delivered',
  Cancelled: 'cancelled',
};

interface PO {
  id: string; vendor: string; orderDate: string; expectedDelivery: string; status: POStatus; total: number; jobRef: string; match: 'green' | 'yellow' | 'grey';
}

const POS: PO[] = [
  { id: 'PO-2026-034', vendor: 'Blackwoods Steel', orderDate: '22 Feb', expectedDelivery: '01 Mar', status: 'Sent', total: 4850, jobRef: 'JOB-2026-0012', match: 'grey' },
  { id: 'PO-2026-033', vendor: 'BOC Gas', orderDate: '20 Feb', expectedDelivery: '25 Feb', status: 'Received', total: 670, jobRef: '\u2014', match: 'green' },
  { id: 'PO-2026-032', vendor: 'OneSteel', orderDate: '18 Feb', expectedDelivery: '28 Feb', status: 'Partial', total: 12300, jobRef: 'JOB-2026-0010', match: 'yellow' },
  { id: 'PO-2026-031', vendor: 'Kemppi', orderDate: '15 Feb', expectedDelivery: '22 Feb', status: 'Received', total: 2100, jobRef: '\u2014', match: 'green' },
  { id: 'PO-2026-030', vendor: 'Dulux Powder Coats', orderDate: '12 Feb', expectedDelivery: '19 Feb', status: 'Received', total: 1450, jobRef: 'JOB-2026-0012', match: 'green' },
  { id: 'PO-2026-029', vendor: 'Bolt & Nut', orderDate: '10 Feb', expectedDelivery: '15 Feb', status: 'Received', total: 340, jobRef: '\u2014', match: 'green' },
  { id: 'PO-2026-028', vendor: 'Lincoln Electric', orderDate: '08 Feb', expectedDelivery: '14 Feb', status: 'Draft', total: 2800, jobRef: 'JOB-2026-0008', match: 'grey' },
  { id: 'PO-2026-027', vendor: 'Freight Corp', orderDate: '05 Feb', expectedDelivery: '12 Feb', status: 'Cancelled', total: 450, jobRef: '\u2014', match: 'grey' },
];

const TABS = [
  { label: 'All', count: 89 }, { label: 'Draft', count: 12 }, { label: 'Sent', count: 23 },
  { label: 'Partial', count: 8 }, { label: 'Received', count: 41 }, { label: 'Cancelled', count: 5 },
];

const MatchIcon = ({ match }: { match: string }) => {
  if (match === 'green') return <CheckCircle className="w-4 h-4 text-[var(--mw-mirage)]" />;
  if (match === 'yellow') return <AlertCircle className="w-4 h-4 text-[var(--mw-yellow-400)]" />;
  return <Circle className="w-4 h-4 text-[var(--neutral-300)]" />;
};

export function PurchaseOrders() {
  const [activeTab, setActiveTab] = useState('All');

  const columns: MwColumnDef<PO>[] = [
    {
      key: 'checkbox',
      header: <Checkbox className="w-[18px] h-[18px]" />,
      cell: () => <Checkbox className="w-[18px] h-[18px]" />,
      className: 'w-10',
    },
    {
      key: 'id',
      header: 'PO #',
      cell: (po) => <span className="text-xs text-[var(--mw-mirage)] tabular-nums">{po.id}</span>,
    },
    {
      key: 'vendor',
      header: 'VENDOR',
      cell: (po) => <span className="text-sm text-[var(--mw-mirage)]">{po.vendor}</span>,
    },
    {
      key: 'orderDate',
      header: 'ORDER DATE',
      cell: (po) => <span className="text-sm text-[var(--neutral-600)]">{po.orderDate}</span>,
    },
    {
      key: 'expectedDelivery',
      header: 'EXPECTED DELIVERY',
      cell: (po) => <span className="text-sm text-[var(--neutral-600)]">{po.expectedDelivery}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (po) => (
        <StatusBadge status={STATUS_KEY_MAP[po.status]}>
          {po.status}
        </StatusBadge>
      ),
    },
    {
      key: 'total',
      header: 'TOTAL',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (po) => <span className="text-sm tabular-nums font-medium">${po.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'jobRef',
      header: 'JOB REF',
      cell: (po) => <span className="text-xs tabular-nums" style={{ color: po.jobRef === '\u2014' ? 'var(--neutral-400)' : 'var(--mw-info)' }}>{po.jobRef}</span>,
    },
    {
      key: 'match',
      header: 'MATCH',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (po) => <MatchIcon match={po.match} />,
    },
    {
      key: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="icon" className="w-9 h-9"><MoreHorizontal className="w-4 h-4 text-[var(--neutral-500)]" /></Button>,
    },
  ];

  return (
    <PageShell className="mx-auto max-w-[1200px] overflow-y-auto">
      <PageHeader
        title="Purchase orders"
        actions={
          <Button className="h-12 gap-2 rounded-md bg-[var(--mw-yellow-400)] px-5 text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]">
            <PlusCircle className="h-5 w-5" /> New PO
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
          <Input placeholder="Search purchase orders..." className="pl-9 h-10 bg-white border-[var(--border)] rounded text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-md border-[var(--border)]" onClick={() => toast('Filter panel coming soon')}><SlidersHorizontal className="w-4 h-4" /> Filter</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-md border-[var(--border)]" onClick={() => toast.success('Exporting purchase orders…')}>Export <ChevronDown className="w-4 h-4" /></Button>
      </div>

      <div className="flex gap-0 border-b border-[var(--border)]">
        {TABS.map(tab => (
          <button key={tab.label} onClick={() => setActiveTab(tab.label)}
            className={cn("px-4 py-3 text-sm relative transition-colors", activeTab === tab.label ? "text-[var(--mw-mirage)] font-medium" : "text-[var(--neutral-500)]")}>
            {tab.label} <span className="text-xs">({tab.count})</span>
            {activeTab === tab.label && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--mw-yellow-400)] rounded-t" />}
          </button>
        ))}
      </div>

      <MwDataTable
        columns={columns}
        data={POS}
        keyExtractor={(po) => po.id}
        striped
      />

      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-[var(--neutral-500)]">Showing 1-8 of 89 purchase orders</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
          {[1, 2, 3].map(p => (
            <Button key={p} variant={p === 1 ? "default" : "ghost"} size="icon"
              className={cn("w-8 h-8 text-xs", p === 1 ? "bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-600)]" : "text-[var(--neutral-500)]")}>{p}</Button>
          ))}
          <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </PageShell>
  );
}
