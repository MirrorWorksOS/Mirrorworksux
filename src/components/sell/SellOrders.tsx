/**
 * Sell Orders - Sales Orders DataTable
 * Columns: Order #, Customer, Date, Status, Total, Actions
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

type OrderStatus = 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'invoiced' | 'complete';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: OrderStatus;
  total: number;
  jobReference?: string;
}

const mockOrders: Order[] = [
  { id: '1', orderNumber: 'SO-2026-0089', customer: 'TechCorp Industries', date: '2026-03-15', status: 'in_production', total: 45000, jobReference: 'JOB-2026-0012' },
  { id: '2', orderNumber: 'SO-2026-0088', customer: 'BHP Contractors', date: '2026-03-12', status: 'confirmed', total: 128000, jobReference: 'JOB-2026-0011' },
  { id: '3', orderNumber: 'SO-2026-0087', customer: 'Pacific Fabrication', date: '2026-03-10', status: 'shipped', total: 8500, jobReference: 'JOB-2026-0010' },
  { id: '4', orderNumber: 'SO-2026-0086', customer: 'Sydney Rail Corp', date: '2026-03-08', status: 'invoiced', total: 67000, jobReference: 'JOB-2026-0009' },
  { id: '5', orderNumber: 'SO-2026-0085', customer: 'Hunter Steel Co', date: '2026-03-05', status: 'complete', total: 22000, jobReference: 'JOB-2026-0008' },
  { id: '6', orderNumber: 'SO-2026-0084', customer: 'Kemppi Australia', date: '2026-03-03', status: 'draft', total: 12000 },
];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Draft', dot: '#737373' };
    case 'confirmed': return { bg: 'bg-[#F5F5F5]', text: 'text-[#0A0A0A]', label: 'Confirmed', dot: '#1A2732' };
    case 'in_production': return { bg: 'bg-[#FFCF4B]/20', text: 'text-[#0A0A0A]', label: 'In Production', dot: '#FFCF4B' };
    case 'shipped': return { bg: 'bg-[#F5F5F5]', text: 'text-[#0A0A0A]', label: 'Shipped', dot: '#1A2732' };
    case 'invoiced': return { bg: 'bg-[#F5F5F5]', text: 'text-[#0A0A0A]', label: 'Invoiced', dot: '#1A2732' };
    case 'complete': return { bg: 'bg-[#F5F5F5]', text: 'text-[#0A0A0A]', label: 'Complete', dot: '#1A2732' };
  }
};

export function SellOrders() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const totalValue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Sales Orders</h1>
          <p className="text-sm text-[#737373] mt-1">
            {mockOrders.length} orders • ${totalValue.toLocaleString()} total value
          </p>
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
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#0A0A0A] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Table */}
      <motion.div variants={animationVariants.listItem}>
        <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" className="rounded border-[var(--border)]" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">ORDER #</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">CUSTOMER</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DATE</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">TOTAL</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">JOB REF</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order, idx) => {
                  const statusBadge = getStatusBadge(order.status);
                  return (
                    <tr key={order.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[#F5F5F5]")}>
                      <td className="px-4">
                        <input type="checkbox" className="rounded border-[var(--border)]" />
                      </td>
                      <td className="px-4">
                        <a href={`/sell/orders/${order.id}`} className="text-[#0A0A0A]  text-sm font-medium hover:underline flex items-center gap-1">
                          {order.orderNumber}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 text-sm text-[#0A0A0A]">{order.customer}</td>
                      <td className="px-4 text-sm text-[#525252]">
                        {new Date(order.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5", statusBadge.bg, statusBadge.text)}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusBadge.dot }} />
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 text-right text-sm  font-medium">${order.total.toLocaleString()}</td>
                      <td className="px-4">
                        {order.jobReference ? (
                          <a href={`/plan/jobs/${order.jobReference}`} className="text-[#0A0A0A]  text-xs hover:underline">
                            {order.jobReference}
                          </a>
                        ) : (
                          <span className="text-xs text-[#A3A3A3]">—</span>
                        )}
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

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <p className="text-xs text-[#737373]">Showing 1-{mockOrders.length} of {mockOrders.length}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[#F5F5F5] disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[#F5F5F5] disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Empty State (hidden when data exists) */}
      {mockOrders.length === 0 && (
        <Card className="bg-white border border-[var(--border)] rounded-2xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[#737373]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-2">No orders yet</h3>
            <p className="text-sm text-[#737373] mb-4">Create your first sales order to get started</p>
            <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#0A0A0A]">
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
