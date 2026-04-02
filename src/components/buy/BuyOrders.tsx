/**
 * Buy Orders - Purchase Orders DataTable with tabs
 * Tabs: All, Draft, Sent, Acknowledged, Partial, Received, Cancelled
 */

import React, { useState } from 'react';
import { Plus, Download, MoreVertical, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedDownload } from '../ui/animated-icons';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';


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

const mockPOs: PurchaseOrder[] = [
  { id: '1', poNumber: 'PO-2026-0089', supplier: 'Hunter Steel Co', date: '2026-03-15', deliveryDate: '2026-03-25', status: 'acknowledged', total: 12400, received: 0 },
  { id: '2', poNumber: 'PO-2026-0088', supplier: 'Pacific Metals', date: '2026-03-12', deliveryDate: '2026-03-22', status: 'partial', total: 8500, received: 4200 },
  { id: '3', poNumber: 'PO-2026-0087', supplier: 'Sydney Welding Supply', date: '2026-03-10', deliveryDate: '2026-03-20', status: 'received', total: 3200, received: 3200 },
  { id: '4', poNumber: 'PO-2026-0086', supplier: 'BHP Suppliers', date: '2026-03-08', deliveryDate: '2026-03-18', status: 'sent', total: 28000, received: 0 },
  { id: '5', poNumber: 'PO-2026-DRAFT-01', supplier: 'Generic Parts Co', date: '2026-03-19', deliveryDate: '2026-03-29', status: 'draft', total: 4500, received: 0 },
];

const getStatusBadge = (status: POStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Draft', dot: 'var(--neutral-500)' };
    case 'sent': return { bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', label: 'Sent', dot: 'var(--mw-blue)' };
    case 'acknowledged': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Acknowledged', dot: 'var(--mw-mirage)' };
    case 'partial': return { bg: 'bg-[var(--mw-amber-50)]', text: 'text-[var(--mw-yellow-900)]', label: 'Partial', dot: 'var(--mw-warning)' };
    case 'received': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Received', dot: 'var(--mw-mirage)' };
    case 'cancelled': return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Cancelled', dot: 'var(--mw-error)' };
  }
};

export function BuyOrders() {
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
        <Button variant="outline" className="h-12 gap-2 rounded-full border-[var(--neutral-200)] px-5 group" onClick={() => toast.success('Exporting purchase orders...')}>
          <AnimatedDownload className="w-4 h-4" />
          Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New purchase order coming soon')}>
          New PO
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 w-12"><input type="checkbox" className="rounded border-[var(--border)]" /></th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">PO #</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">SUPPLIER</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">DATE</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">DELIVERY DATE</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">TOTAL</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">RECEIVED</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po, idx) => {
                  const statusBadge = getStatusBadge(po.status);
                  const receivedPct = (po.received / po.total) * 100;
                  return (
                    <tr key={po.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[var(--neutral-100)]")}>
                      <td className="px-4"><input type="checkbox" className="rounded border-[var(--border)]" /></td>
                      <td className="px-4">
                        <a href={`/buy/orders/${po.id}`} className="text-[var(--mw-mirage)]  text-sm font-medium hover:underline flex items-center gap-1">
                          {po.poNumber}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="px-4 text-sm text-[var(--mw-mirage)]">{po.supplier}</td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">{new Date(po.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">{new Date(po.deliveryDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5", statusBadge.bg, statusBadge.text)}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusBadge.dot }} />
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 text-right text-sm  font-medium">${po.total.toLocaleString()}</td>
                      <td className="px-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm  font-medium">${po.received.toLocaleString()}</span>
                          {po.received > 0 && (
                            <div className="w-16 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--mw-yellow-400)]" style={{ width: `${receivedPct}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors" onClick={() => toast('PO actions coming soon')}>
                          <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--neutral-500)]">Showing 1-{filteredPOs.length} of {filteredPOs.length}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Previous</button>
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Next</button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </PageShell>
  );
}
