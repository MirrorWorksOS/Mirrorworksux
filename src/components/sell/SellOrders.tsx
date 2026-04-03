/**
 * Sell Orders - Sales Orders DataTable
 * Columns: Order #, Customer, Date, Status, Total, Actions
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Plus, Download, MoreVertical, ExternalLink } from 'lucide-react';
import { salesOrders } from '@/services/mock';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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

const mockOrders: Order[] = salesOrders.map((so) => ({
  id: so.id,
  orderNumber: so.orderNumber,
  customer: so.customerName,
  date: so.date,
  status: so.status as OrderStatus,
  total: so.total,
  jobReference: so.jobId,
}));

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

  const totalValue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle={`${mockOrders.length} orders • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'complete', label: 'Complete', value: mockOrders.filter(o => o.status === 'complete').reduce((s, o) => s + o.total, 0), color: 'var(--mw-yellow-400)' },
          { key: 'shipped', label: 'Shipped', value: mockOrders.filter(o => o.status === 'shipped').reduce((s, o) => s + o.total, 0), color: 'var(--mw-mirage)' },
          { key: 'in_production', label: 'In Production', value: mockOrders.filter(o => o.status === 'in_production').reduce((s, o) => s + o.total, 0), color: 'var(--neutral-400)' },
          { key: 'confirmed', label: 'Confirmed', value: mockOrders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.total, 0), color: 'var(--neutral-300)' },
          { key: 'draft', label: 'Draft', value: mockOrders.filter(o => o.status === 'draft').reduce((s, o) => s + o.total, 0), color: 'var(--neutral-200)' },
        ]}
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
              key: 'orderNumber',
              header: 'Order #',
              tooltip: 'Unique sales order reference',
              cell: (order) => (
                <a href={`/sell/orders/${order.id}`} className="text-foreground font-medium tabular-nums hover:underline flex items-center gap-1">
                  {order.orderNumber}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ),
            },
            {
              key: 'customer',
              header: 'Customer',
              tooltip: 'Customer company name',
              cell: (order) => <span className="text-foreground">{order.customer}</span>,
            },
            {
              key: 'date',
              header: 'Date',
              cell: (order) => (
                <span className="text-[var(--neutral-600)]">
                  {new Date(order.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              tooltip: 'Current order fulfilment status',
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
              header: 'Total',
              tooltip: 'Total order value incl. tax',
              headerClassName: 'text-right',
              cell: (order) => <span className="font-medium tabular-nums">${order.total.toLocaleString()}</span>,
              className: 'text-right',
            },
            {
              key: 'jobReference',
              header: 'Job Ref',
              tooltip: 'Linked production job reference',
              cell: (order) => order.jobReference ? (
                <a href={`/plan/jobs/${order.jobReference}`} className="text-foreground text-xs tabular-nums hover:underline">
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
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
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
