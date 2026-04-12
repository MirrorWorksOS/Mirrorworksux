/**
 * Buy Orders - Purchase Orders DataTable with tabs
 * Tabs: All, Draft, Sent, Acknowledged, Partial, Received, Cancelled
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedDownload } from '../ui/animated-icons';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { toast } from 'sonner';
import { purchaseOrders } from '@/services/mock';

type POStatus = 'draft' | 'sent' | 'acknowledged' | 'partial' | 'received' | 'cancelled';
type TabFilter = 'all' | POStatus;

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  date: string;
  deliveryDate: string;
  status: POStatus;
  total: number;
  received: number;
}

const mockPOs: PurchaseOrder[] = purchaseOrders.map((po) => ({
  id: po.id,
  poNumber: po.poNumber,
  supplier: po.supplierName,
  date: po.date,
  deliveryDate: po.deliveryDate,
  status: po.status,
  total: po.total,
  received: po.received,
}));

const getStatusBadge = (status: POStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Draft', dot: 'var(--neutral-500)' };
    case 'sent': return { bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', label: 'Sent', dot: 'var(--mw-blue)' };
    case 'acknowledged': return { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Acknowledged', dot: 'var(--mw-mirage)' };
    case 'partial': return { bg: 'bg-[var(--mw-amber-50)]', text: 'text-[var(--mw-yellow-900)]', label: 'Partial', dot: 'var(--mw-warning)' };
    case 'received': return { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Received', dot: 'var(--mw-mirage)' };
    case 'cancelled': return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Cancelled', dot: 'var(--mw-error)' };
  }
};

const poColumns: MwColumnDef<PurchaseOrder>[] = [
  { key: 'poNumber', header: 'PO #', tooltip: 'Purchase order number', cell: (row) => <span className="font-medium text-foreground">{row.poNumber}</span> },
  { key: 'supplier', header: 'Supplier', tooltip: 'Supplier company name', cell: (row) => <span className="text-foreground">{row.supplier}</span> },
  { key: 'date', header: 'Date', tooltip: 'Order creation date', cell: (row) => {
    const d = new Date(row.date);
    return <span className="tabular-nums text-[var(--neutral-500)]">{d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>;
  }},
  { key: 'deliveryDate', header: 'Delivery', tooltip: 'Expected delivery date', cell: (row) => {
    const d = new Date(row.deliveryDate);
    return <span className="tabular-nums text-[var(--neutral-500)]">{d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>;
  }},
  { key: 'status', header: 'Status', tooltip: 'Current order status', cell: (row) => {
    const s = getStatusBadge(row.status);
    return (
      <StatusBadge variant={row.status === 'draft' ? 'neutral' : row.status === 'sent' ? 'info' : row.status === 'cancelled' ? 'error' : row.status === 'partial' ? 'warning' : 'neutral'} withDot>
        {s.label}
      </StatusBadge>
    );
  }},
  { key: 'total', header: 'Total', tooltip: 'Total order value', headerClassName: 'text-right', className: 'text-right', cell: (row) => (
    <span className="font-medium tabular-nums">${row.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
  )},
  { key: 'received', header: 'Received', tooltip: 'Value of goods received', headerClassName: 'text-right', className: 'text-right', cell: (row) => (
    <span className="tabular-nums text-[var(--neutral-500)]">${row.received.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
  )},
];

export function BuyOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');

  const filteredPOs = (activeTab === 'all' ? mockPOs : mockPOs.filter(po => po.status === activeTab))
    .filter(po => !search || po.poNumber.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase()));
  const totalValue = filteredPOs.reduce((sum, po) => sum + po.total, 0);

  const tabCounts = {
    all: mockPOs.length,
    draft: mockPOs.filter(p => p.status === 'draft').length,
    sent: mockPOs.filter(p => p.status === 'sent').length,
    acknowledged: mockPOs.filter(p => p.status === 'acknowledged').length,
    partial: mockPOs.filter(p => p.status === 'partial').length,
    received: mockPOs.filter(p => p.status === 'received').length,
    cancelled: mockPOs.filter(p => p.status === 'cancelled').length,
  };

  const summaryByStatus = {
    received: mockPOs.filter(p => p.status === 'received').reduce((s, p) => s + p.total, 0),
    partial: mockPOs.filter(p => p.status === 'partial').reduce((s, p) => s + p.total, 0),
    sent: mockPOs.filter(p => p.status === 'sent').reduce((s, p) => s + p.total, 0),
    draft: mockPOs.filter(p => p.status === 'draft').reduce((s, p) => s + p.total, 0),
  };

  return (
    <PageShell className="p-6 space-y-6">
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle={`${filteredPOs.length} orders • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'received', label: 'Received', value: summaryByStatus.received, color: 'var(--mw-yellow-400)' },
          { key: 'partial', label: 'Partial', value: summaryByStatus.partial, color: 'var(--mw-mirage)' },
          { key: 'sent', label: 'Sent', value: summaryByStatus.sent, color: 'var(--neutral-400)' },
          { key: 'draft', label: 'Draft', value: summaryByStatus.draft, color: 'var(--neutral-200)' },
        ]}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search orders…" />
        <ToolbarFilterPills
          value={activeTab}
          onChange={(k) => setActiveTab(k as TabFilter)}
          options={[
            { key: 'all', label: 'All', count: tabCounts.all },
            { key: 'draft', label: 'Draft', count: tabCounts.draft },
            { key: 'sent', label: 'Sent', count: tabCounts.sent },
            { key: 'acknowledged', label: 'Acknowledged', count: tabCounts.acknowledged },
            { key: 'partial', label: 'Partial', count: tabCounts.partial },
            { key: 'received', label: 'Received', count: tabCounts.received },
            { key: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
          ]}
        />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <Button variant="outline" className="h-12 gap-2 border-[var(--neutral-200)] px-5 group" onClick={() => toast.success('Exporting purchase orders...')}>
          <AnimatedDownload className="w-4 h-4" />
          Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New purchase order coming soon')}>
          New PO
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <motion.div variants={staggerItem}>
        <MwDataTable<PurchaseOrder>
          columns={poColumns}
          data={filteredPOs}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => navigate(`/buy/orders/${row.id}`)}
          striped
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--neutral-100)]">
          <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filteredPOs.length} of {filteredPOs.length}</p>
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
