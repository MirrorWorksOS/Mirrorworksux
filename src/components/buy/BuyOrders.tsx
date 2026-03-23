/**
 * Buy Orders - Purchase Orders DataTable with tabs
 * Tabs: All, Draft, Sent, Acknowledged, Partial, Received, Cancelled
 */

import React, { useState } from 'react';
import { Plus, Download, Filter, MoreVertical, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus, AnimatedFilter, AnimatedDownload } from '../ui/animated-icons';

const { animationVariants } = designSystem;

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
    case 'draft': return { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Draft', dot: '#737373' };
    case 'sent': return { bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', label: 'Sent', dot: '#0A7AFF' };
    case 'acknowledged': return { bg: 'bg-[#F5F5F5]', text: 'text-[#1A2732]', label: 'Acknowledged', dot: '#1A2732' };
    case 'partial': return { bg: 'bg-[#FFF4CC]', text: 'text-[#805900]', label: 'Partial', dot: '#FACC15' };
    case 'received': return { bg: 'bg-[#F5F5F5]', text: 'text-[#1A2732]', label: 'Received', dot: '#1A2732' };
    case 'cancelled': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Cancelled', dot: '#EF4444' };
  }
};

export function BuyOrders() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredPOs = activeTab === 'all' ? mockPOs : mockPOs.filter(po => po.status === activeTab);
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

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Purchase Orders</h1>
          <p className="text-sm text-[#737373] mt-1">{filteredPOs.length} orders • ${totalValue.toLocaleString()} total value</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
            <AnimatedFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
            <AnimatedDownload className="w-4 h-4" />
            Export
          </Button>
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded-xl group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New PO
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto">
        {(['all', 'draft', 'sent', 'acknowledged', 'partial', 'received', 'cancelled'] as TabFilter[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 text-[14px] border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab ? 'border-[#FFCF4B] text-[#1A2732] font-medium' : 'border-transparent text-[#737373] hover:text-[#1A2732]')}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <Badge className="ml-2 bg-[#F5F5F5] text-[#525252] border-0 text-xs">{tabCounts[tab]}</Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div variants={animationVariants.listItem}>
        <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
                  <th className="px-4 py-3 w-12"><input type="checkbox" className="rounded border-[var(--border)]" /></th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PO #</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">SUPPLIER</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DATE</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DELIVERY DATE</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">TOTAL</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">RECEIVED</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po, idx) => {
                  const statusBadge = getStatusBadge(po.status);
                  const receivedPct = (po.received / po.total) * 100;
                  return (
                    <tr key={po.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[#F5F5F5]")}>
                      <td className="px-4"><input type="checkbox" className="rounded border-[var(--border)]" /></td>
                      <td className="px-4">
                        <a href={`/buy/orders/${po.id}`} className="text-[#1A2732]  text-sm font-medium hover:underline flex items-center gap-1">
                          {po.poNumber}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 text-sm text-[#1A2732]">{po.supplier}</td>
                      <td className="px-4 text-sm text-[#525252]">{new Date(po.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 text-sm text-[#525252]">{new Date(po.deliveryDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
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
                              <div className="h-full bg-[#FFCF4B]" style={{ width: `${receivedPct}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        <button className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-[#737373]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <p className="text-xs text-[#737373]">Showing 1-{filteredPOs.length} of {filteredPOs.length}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[#F5F5F5] disabled:bg-[#0A0A0A]/[0.12] disabled:text-[#0A0A0A]/[0.38]" disabled>Previous</button>
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[#F5F5F5] disabled:bg-[#0A0A0A]/[0.12] disabled:text-[#0A0A0A]/[0.38]" disabled>Next</button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
