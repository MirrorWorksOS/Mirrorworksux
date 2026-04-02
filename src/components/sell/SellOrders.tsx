/**
 * Sell Orders - Sales Orders DataTable
 * Columns: Order #, Customer, Date, Status, Total, Actions
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Plus, Download, MoreVertical, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedDownload } from '../ui/animated-icons';


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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const totalValue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle={`${mockOrders.length} orders • $${totalValue.toLocaleString()} total value`}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search orders…" />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <Button variant="outline" className="h-12 gap-2 rounded-full border-[var(--neutral-200)] px-5 group" onClick={() => toast.success('Orders exported')}>
          <AnimatedDownload className="w-4 h-4" />
          Export
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New order form coming soon')}>
          New Order
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <motion.div variants={staggerItem}>
        <MwDataTable<Order>
          columns={[
            {
              key: 'checkbox',
              header: (
                <input type="checkbox" className="rounded border-[var(--border)]" checked={selectedRows.size === mockOrders.length && mockOrders.length > 0} onChange={(e) => { if (e.target.checked) { setSelectedRows(new Set(mockOrders.map(o => o.id))); } else { setSelectedRows(new Set()); } }} />
              ),
              cell: (order) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-[var(--border)]" checked={selectedRows.has(order.id)} onChange={() => { setSelectedRows(prev => { const next = new Set(prev); if (next.has(order.id)) next.delete(order.id); else next.add(order.id); return next; }); }} />
                </div>
              ),
              className: 'w-12',
            },
            {
              key: 'orderNumber',
              header: 'ORDER #',
              cell: (order) => (
                <a href={`/sell/orders/${order.id}`} className="text-[var(--neutral-900)] font-medium tabular-nums hover:underline flex items-center gap-1">
                  {order.orderNumber}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ),
            },
            {
              key: 'customer',
              header: 'CUSTOMER',
              cell: (order) => <span className="text-[var(--neutral-900)]">{order.customer}</span>,
            },
            {
              key: 'date',
              header: 'DATE',
              cell: (order) => (
                <span className="text-[var(--neutral-600)]">
                  {new Date(order.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'STATUS',
              headerClassName: 'text-center',
              cell: (order) => {
                const sp = ORDER_STATUS_MAP[order.status];
                return (
                  <div className="flex items-center justify-center">
                    <StatusBadge status={sp.status} withDot>{sp.label}</StatusBadge>
                  </div>
                );
              },
              className: 'text-center',
            },
            {
              key: 'total',
              header: 'TOTAL',
              headerClassName: 'text-right',
              cell: (order) => <span className="font-medium tabular-nums">${order.total.toLocaleString()}</span>,
              className: 'text-right',
            },
            {
              key: 'jobReference',
              header: 'JOB REF',
              cell: (order) => order.jobReference ? (
                <a href={`/plan/jobs/${order.jobReference}`} className="text-[var(--neutral-900)] text-xs tabular-nums hover:underline">
                  {order.jobReference}
                </a>
              ) : (
                <span className="text-xs text-[var(--neutral-400)]">{'\u2014'}</span>
              ),
            },
            {
              key: 'actions',
              header: '',
              cell: (order) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/sell/orders/${order.id}`)}>View details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast('Edit order coming soon')}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success('Order duplicated')}>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast('Order deleted')} className="text-[var(--mw-error)]">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
              className: 'w-12',
            },
          ]}
          data={mockOrders}
          keyExtractor={(order) => order.id}
          onRowClick={(order) => navigate(`/sell/orders/${order.id}`)}
          selectedKeys={selectedRows}
          striped
        />
      </motion.div>

      {mockOrders.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Plus}
            title="No orders yet"
            description="Create your first sales order to get started"
            action={{ label: "Create Order", onClick: () => toast('New order form coming soon'), icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
