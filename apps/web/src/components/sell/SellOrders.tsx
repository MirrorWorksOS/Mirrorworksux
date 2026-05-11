/**
 * Sell Orders — sales orders list with the schema-driven filter bar.
 *
 * Replaces the generic toolbar with real status options (the 6-state SalesOrderStatus
 * enum) plus customer, value range, has-job-link facets and a persistent
 * delivery-date chip. Adds a kanban view by status.
 */

import { useMemo } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import {
  CalendarDays,
  Clock,
  Columns3,
  DollarSign,
  ExternalLink,
  Link as LinkIcon,
  List as ListIcon,
  MoreVertical,
  Plus,
  Receipt,
  Unlink,
  User as UserIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

import { salesOrders, customers as centralCustomers, employees as centralEmployees } from '@/services';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { staggerItem } from '@/components/shared/motion/motion-variants';

import {
  ModuleFilterBar,
  applyFilters,
  getViewer,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AnimatedDownload } from '../ui/animated-icons';

type OrderStatus = 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'invoiced' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  deliveryDate: string;
  status: OrderStatus;
  total: number;
  repId?: string;
  jobReference?: string;
}

const mockOrders: Order[] = salesOrders.map((so) => ({
  id: so.id,
  orderNumber: so.orderNumber,
  customer: so.customerName,
  date: so.date,
  deliveryDate: so.deliveryDate,
  status: so.status as OrderStatus,
  total: so.total,
  repId: so.repId,
  jobReference: so.jobId,
}));

const ORDER_STATUS_LABEL: Record<OrderStatus, { status: StatusKey; label: string; color: string }> = {
  draft:         { status: 'draft',       label: 'Draft',         color: 'var(--neutral-200)' },
  confirmed:     { status: 'approved',    label: 'Confirmed',     color: 'var(--neutral-300)' },
  in_production: { status: 'in_progress', label: 'In Production', color: 'var(--neutral-400)' },
  shipped:       { status: 'shipped',     label: 'Shipped',       color: 'var(--mw-mirage)' },
  invoiced:      { status: 'sent',        label: 'Invoiced',      color: 'var(--mw-yellow-400)' },
  cancelled:     { status: 'cancelled',   label: 'Cancelled',     color: 'var(--mw-error)' },
};

const MODULE_ID = 'sell.orders';
const customerOptions = centralCustomers.map((c) => ({ value: c.company, label: c.company }));
const repOptions = centralEmployees.map((e) => ({ value: e.id, label: e.name }));

const ordersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Sales Orders',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: (Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => ({
        value: s,
        label: ORDER_STATUS_LABEL[s].label,
        color: ORDER_STATUS_LABEL[s].color,
      })),
    },
    { id: 'rep', label: 'Rep', kind: 'user', icon: UserIcon, pinned: true, options: repOptions },
    { id: 'customer', label: 'Customer', kind: 'select', icon: UserIcon, options: customerOptions },
    { id: 'value', label: 'Value', kind: 'range', icon: DollarSign },
    { id: 'hasJob', label: 'Linked to job', kind: 'boolean', icon: LinkIcon },
    { id: 'deliveryDate', label: 'Delivery', kind: 'date', icon: CalendarDays, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'kanban', label: 'Kanban by status', icon: Columns3, groupBy: 'status' },
  ],
  defaultView: 'list',
  dateFacetId: 'deliveryDate',
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'My orders',
    icon: UserIcon,
    iconTone: 'yellow',
    state: { values: { rep: '__me__' }, search: '', view: 'list' },
  },
  {
    name: 'Awaiting confirmation',
    icon: Clock,
    iconTone: 'warning',
    state: { values: { status: ['draft'] }, search: '', view: 'list' },
  },
  {
    name: 'Ready to invoice',
    icon: Receipt,
    iconTone: 'success',
    state: { values: { status: ['shipped'] }, search: '', view: 'list' },
  },
  {
    name: 'Unlinked to a job',
    icon: Unlink,
    iconTone: 'neutral',
    state: { values: { hasJob: false }, search: '', view: 'list' },
  },
]);

const orderColumns: MwColumnDef<Order>[] = [
  {
    key: 'orderNumber',
    header: 'Order #',
    cell: (order) => (
      <a
        href={`/sell/orders/${order.id}`}
        className="text-foreground font-medium tabular-nums hover:underline flex items-center gap-1"
      >
        {order.orderNumber}
        <ExternalLink className="w-4 h-4" />
      </a>
    ),
  },
  { key: 'customer', header: 'Customer', cell: (order) => <span className="text-foreground">{order.customer}</span> },
  {
    key: 'date',
    header: 'Order date',
    cell: (order) => (
      <span className="text-[var(--neutral-600)]">
        {new Date(order.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'deliveryDate',
    header: 'Delivery',
    cell: (order) => (
      <span className="text-[var(--neutral-600)]">
        {new Date(order.deliveryDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    headerClassName: 'text-center',
    cell: (order) => {
      const sp = ORDER_STATUS_LABEL[order.status];
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
    headerClassName: 'text-right',
    cell: (order) => <span className="font-medium tabular-nums">${order.total.toLocaleString()}</span>,
    className: 'text-right',
  },
  {
    key: 'jobReference',
    header: 'Job ref',
    cell: (order) => order.jobReference ? (
      <a href={`/plan/jobs/${order.jobReference}`} className="text-foreground text-xs tabular-nums hover:underline">
        {order.jobReference}
      </a>
    ) : (
      <span className="text-xs text-[var(--neutral-400)]">{'—'}</span>
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
            <DropdownMenuItem onClick={() => window.location.assign(`/sell/orders/${order.id}`)}>View details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success('Order duplicated')}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast('Order deleted')} className="text-[var(--mw-error)]">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    className: 'w-12',
  },
];

export function SellOrders() {
  const navigate = useNavigate();
  const filters = useModuleFilters(ordersFilterSchema);
  const { state } = filters;

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: ordersFilterSchema,
        state,
        rows: mockOrders,
        resolveMe: getViewer().userId,
        getSearchText: (o) => `${o.orderNumber} ${o.customer}`,
        getFacetValue: (o, id) => {
          switch (id) {
            case 'status': return o.status;
            case 'rep': return o.repId ?? '';
            case 'customer': return o.customer;
            case 'value': return o.total;
            case 'hasJob': return Boolean(o.jobReference);
            case 'deliveryDate': return o.deliveryDate;
            default: return undefined;
          }
        },
      }),
    [state],
  );

  const totalValue = filtered.reduce((sum, order) => sum + order.total, 0);

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle={`${filtered.length} of ${mockOrders.length} orders • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => ({
          key: s,
          label: ORDER_STATUS_LABEL[s].label,
          value: filtered.filter((o) => o.status === s).reduce((sum, o) => sum + o.total, 0),
          color: ORDER_STATUS_LABEL[s].color,
        }))}
      />

      <ModuleFilterBar
        schema={ordersFilterSchema}
        filters={filters}
        searchPlaceholder="Search orders…"
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-full border-[var(--neutral-200)] px-4"
              onClick={() => toast.success('Orders exported')}
            >
              <AnimatedDownload className="w-4 h-4" />
              Export
            </Button>
            <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/orders/new')}>
              New Sales Order
            </ToolbarPrimaryButton>
          </>
        }
      />

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable<Order>
            columns={orderColumns}
            data={filtered}
            keyExtractor={(order) => order.id}
            onRowClick={(order) => navigate(`/sell/orders/${order.id}`)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            striped
          />
        </motion.div>
      )}

      {state.view === 'kanban' && (
        <motion.div variants={staggerItem}>
          <KanbanBoard className="gap-4">
            {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => {
              const colOrders = filtered.filter((o) => o.status === s);
              const colValue = colOrders.reduce((sum, o) => sum + o.total, 0);
              return (
                <KanbanColumn
                  key={s}
                  id={s}
                  title={ORDER_STATUS_LABEL[s].label}
                  count={colOrders.length}
                  accept="order-kanban"
                  onDrop={() => undefined}
                  className="min-w-[280px] w-[280px] flex-shrink-0"
                >
                  <div className="flex items-center justify-between px-0.5 pb-1 text-xs text-[var(--neutral-500)]">
                    <span className="tabular-nums">${colValue.toLocaleString()}</span>
                  </div>
                  {colOrders.map((o) => (
                    <KanbanCard key={o.id} id={o.id} type="order-kanban" className="p-0">
                      <div
                        role="button"
                        tabIndex={0}
                        className="p-4 cursor-pointer"
                        onClick={() => navigate(`/sell/orders/${o.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/sell/orders/${o.id}`); }}
                      >
                        <div className="text-sm font-medium tabular-nums">{o.orderNumber}</div>
                        <div className="mt-1 text-xs text-[var(--neutral-500)]">{o.customer}</div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-medium tabular-nums text-foreground">${o.total.toLocaleString()}</span>
                          <span className="text-[var(--neutral-500)]">Δ {o.deliveryDate}</span>
                        </div>
                      </div>
                    </KanbanCard>
                  ))}
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
        </motion.div>
      )}

      {filtered.length === 0 && state.view === 'list' && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Plus}
            title="No orders match"
            description="Adjust your filters or create a new sales order."
            action={{ label: 'Create Sales Order', onClick: () => navigate('/sell/orders/new'), icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
