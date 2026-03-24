/**
 * Sell Orders - Sales Orders DataTable
 * Columns: Order #, Customer, Date, Status, Total, Actions
 */

import React, { useState } from 'react';
import { Plus, Download, Filter, MoreVertical, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus, AnimatedFilter, AnimatedDownload } from '../ui/animated-icons';


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

const ORDER_STATUS_MAP: Record<OrderStatus, { status: StatusKey; label?: string }> = {
  draft:         { status: 'draft' },
  confirmed:     { status: 'approved', label: 'Confirmed' },
  in_production: { status: 'in_progress', label: 'In Production' },
  shipped:       { status: 'shipped' },
  invoiced:      { status: 'sent', label: 'Invoiced' },
  complete:      { status: 'completed', label: 'Complete' },
};

export function SellOrders() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const totalValue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <PageShell>
      <PageHeader
        title="Sales Orders"
        subtitle={`${mockOrders.length} orders • $${totalValue.toLocaleString()} total value`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
              <AnimatedFilter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
              <AnimatedDownload className="w-4 h-4" />
              Export
            </Button>
            <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--neutral-900)] rounded group">
              <AnimatedPlus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </>
        }
      />

      {/* Table */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" className="rounded border-[var(--border)]" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">ORDER #</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">CUSTOMER</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">DATE</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">TOTAL</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">JOB REF</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order, idx) => {
                  const sp = ORDER_STATUS_MAP[order.status];
                  return (
                    <tr key={order.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[var(--neutral-100)]")}>
                      <td className="px-4">
                        <input type="checkbox" className="rounded border-[var(--border)]" />
                      </td>
                      <td className="px-4">
                        <a href={`/sell/orders/${order.id}`} className="text-[var(--neutral-900)] text-sm font-medium tabular-nums hover:underline flex items-center gap-1">
                          {order.orderNumber}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="px-4 text-sm text-[var(--neutral-900)]">{order.customer}</td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">
                        {new Date(order.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <StatusBadge status={sp.status} withDot>{sp.label}</StatusBadge>
                        </div>
                      </td>
                      <td className="px-4 text-right text-sm font-medium tabular-nums">${order.total.toLocaleString()}</td>
                      <td className="px-4">
                        {order.jobReference ? (
                          <a href={`/plan/jobs/${order.jobReference}`} className="text-[var(--neutral-900)] text-xs tabular-nums hover:underline">
                            {order.jobReference}
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--neutral-400)]">—</span>
                        )}
                      </td>
                      <td className="px-4">
                        <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
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
            <p className="text-xs text-[var(--neutral-500)]">Showing 1-{mockOrders.length} of {mockOrders.length}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Previous</button>
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Next</button>
            </div>
          </div>
        </Card>
      </motion.div>

      {mockOrders.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Plus}
            title="No orders yet"
            description="Create your first sales order to get started"
            action={{ label: "Create Order", onClick: () => {}, icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
