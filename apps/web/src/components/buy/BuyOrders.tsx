/**
 * Buy Orders — Purchase Orders with schema-driven filter bar.
 *
 * Replaces the legacy status-pill toolbar + generic `ToolbarFilterButton`
 * with `ModuleFilterBar`. Adds kanban-by-status and calendar-by-delivery
 * view modes, plus a persistent delivery-date chip and seeded system presets.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Columns3,
  DollarSign,
  Flag,
  Hourglass,
  Link2,
  List as ListIcon,
  Plus,
  Truck,
  User,
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedDownload } from '../ui/animated-icons';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { toast } from 'sonner';
import { purchaseOrders, suppliers as centralSuppliers } from '@/services';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

type POStatus = 'draft' | 'sent' | 'acknowledged' | 'partial' | 'received' | 'cancelled';

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

const STATUS_LABEL: Record<POStatus, { label: string; color: string }> = {
  draft:        { label: 'Draft',        color: 'var(--neutral-400)' },
  sent:         { label: 'Sent',         color: 'var(--mw-blue)' },
  acknowledged: { label: 'Acknowledged', color: 'var(--mw-mirage)' },
  partial:      { label: 'Partial',      color: 'var(--mw-warning)' },
  received:     { label: 'Received',     color: 'var(--mw-mirage)' },
  cancelled:    { label: 'Cancelled',    color: 'var(--mw-error)' },
};

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

const MODULE_ID = 'buy.orders';

const supplierOptions = centralSuppliers.map((s) => ({ value: s.company, label: s.company }));

const ordersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Purchase Orders',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      icon: Flag,
      options: [
        { value: 'draft',     label: 'Draft',     color: 'var(--neutral-400)' },
        { value: 'sent',      label: 'Sent',      color: 'var(--mw-blue)' },
        { value: 'partial',   label: 'Partial',   color: 'var(--mw-warning)' },
        { value: 'received',  label: 'Received',  color: 'var(--mw-mirage)' },
        { value: 'cancelled', label: 'Cancelled', color: 'var(--mw-error)' },
      ],
    },
    { id: 'supplier', label: 'Supplier', kind: 'multi', icon: Building2, pinned: true, options: supplierOptions },
    { id: 'value',    label: 'Value',    kind: 'range', icon: DollarSign },
    { id: 'hasShortage', label: 'Partial receipt', kind: 'boolean', icon: AlertTriangle },
    {
      id: 'deliveryDate',
      label: 'Delivery',
      kind: 'date',
      icon: Truck,
      placeholder: 'Any date',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter'],
    },
    // TODO(filters): needs PurchaseOrder.buyerId/buyerName — plan §1 buyer facet.
    // TODO(filters): needs PurchaseOrder.approvalState — plan §1 approval facet.
    // TODO(filters): needs PurchaseOrder.currency — plan §1 currency facet.
    // TODO(filters): needs PurchaseOrder.linkedAgreementId — plan §1 BPA link facet.
  ],
  viewModes: [
    { id: 'list',     label: 'List',                 icon: ListIcon },
    { id: 'kanban',   label: 'Kanban by status',     icon: Columns3,  groupBy: 'status' },
    { id: 'calendar', label: 'Calendar by delivery', icon: Calendar },
  ],
  defaultView: 'list',
  dateFacetId: 'deliveryDate',
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
function thisWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - (day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

registerSystemPresets(MODULE_ID, [
  {
    name: 'Overdue receipts',
    icon: AlertTriangle,
    iconTone: 'error',
    state: {
      values: { status: ['sent', 'partial'], deliveryDate: { to: todayIso() } },
      search: '', view: 'list',
    },
  },
  {
    name: 'Due this week',
    icon: Truck,
    iconTone: 'warning',
    state: { values: { status: ['sent', 'partial'], deliveryDate: thisWeekRange() }, search: '', view: 'calendar' },
  },
  {
    // TODO(filters): preset depends on approval facet — re-enable when approvalState lands.
    name: 'Awaiting approval',
    icon: Hourglass,
    iconTone: 'info',
    state: { values: {}, search: '', view: 'list' },
  },
  {
    name: 'High value (>$10k)',
    icon: DollarSign,
    iconTone: 'yellow',
    state: { values: { value: { from: 10000 } }, search: '', view: 'list' },
  },
  {
    // TODO(filters): preset depends on linkedAgreement facet — re-enable when linkedAgreementId lands.
    name: 'Against near-limit BPAs',
    icon: Link2,
    iconTone: 'warning',
    state: { values: {}, search: '', view: 'list' },
  },
]);

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
  { key: 'status', header: 'Status', tooltip: 'Current order status', cell: (row) => (
    <StatusBadge variant={row.status === 'draft' ? 'neutral' : row.status === 'sent' ? 'info' : row.status === 'cancelled' ? 'error' : row.status === 'partial' ? 'warning' : 'neutral'} withDot>
      {STATUS_LABEL[row.status].label}
    </StatusBadge>
  )},
  { key: 'total', header: 'Total', tooltip: 'Total order value', headerClassName: 'text-right', className: 'text-right', cell: (row) => (
    <span className="font-medium tabular-nums">${row.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
  )},
  { key: 'received', header: 'Received', tooltip: 'Value of goods received', headerClassName: 'text-right', className: 'text-right', cell: (row) => (
    <span className="tabular-nums text-[var(--neutral-500)]">${row.received.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
  )},
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BuyOrders() {
  const navigate = useNavigate();
  const filters = useModuleFilters(ordersFilterSchema);
  const { state } = filters;

  const filteredPOs = useMemo(
    () =>
      applyFilters({
        schema: ordersFilterSchema,
        state,
        rows: mockPOs,
        getSearchText: (po) => `${po.poNumber} ${po.supplier}`,
        getFacetValue: (po, id) => {
          switch (id) {
            case 'status': return po.status;
            case 'supplier': return po.supplier;
            case 'value': return po.total;
            case 'hasShortage':
              return po.status === 'partial' || (po.received > 0 && po.received < po.total);
            case 'deliveryDate': return po.deliveryDate;
            default: return undefined;
          }
        },
      }),
    [state],
  );

  const totalValue = filteredPOs.reduce((sum, po) => sum + po.total, 0);

  const summaryByStatus = {
    received: filteredPOs.filter(p => p.status === 'received').reduce((s, p) => s + p.total, 0),
    partial:  filteredPOs.filter(p => p.status === 'partial').reduce((s, p) => s + p.total, 0),
    sent:     filteredPOs.filter(p => p.status === 'sent').reduce((s, p) => s + p.total, 0),
    draft:    filteredPOs.filter(p => p.status === 'draft').reduce((s, p) => s + p.total, 0),
  };

  const kanbanStatuses: POStatus[] = ['draft', 'sent', 'acknowledged', 'partial', 'received', 'cancelled'];

  return (
    <PageShell className="p-6 space-y-6">
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle={`${filteredPOs.length} of ${mockPOs.length} orders • $${totalValue.toLocaleString()} total value`}
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'received', label: 'Received', value: summaryByStatus.received, color: 'var(--mw-yellow-400)' },
          { key: 'partial', label: 'Partial', value: summaryByStatus.partial, color: 'var(--mw-mirage)' },
          { key: 'sent', label: 'Sent', value: summaryByStatus.sent, color: 'var(--neutral-400)' },
          { key: 'draft', label: 'Draft', value: summaryByStatus.draft, color: 'var(--neutral-200)' },
        ]}
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
              onClick={() => toast.success('Exporting purchase orders...')}
            >
              <AnimatedDownload className="w-4 h-4" />
              Export
            </Button>
            <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/buy/orders/new')}>
              New PO
            </ToolbarPrimaryButton>
          </>
        }
      />

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable<PurchaseOrder>
            columns={poColumns}
            data={filteredPOs}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => navigate(`/buy/orders/${row.id}`)}
            striped
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </motion.div>
      )}

      {state.view === 'kanban' && (
        <motion.div variants={staggerItem}>
          <KanbanBoard className="gap-4">
            {kanbanStatuses.map((s) => {
              const colPOs = filteredPOs.filter((po) => po.status === s);
              const colValue = colPOs.reduce((sum, po) => sum + po.total, 0);
              return (
                <KanbanColumn
                  key={s}
                  id={s}
                  title={STATUS_LABEL[s].label}
                  count={colPOs.length}
                  accept="po-kanban"
                  onDrop={() => undefined}
                  className="min-w-[280px] w-[280px] flex-shrink-0"
                >
                  <div className="flex items-center justify-between px-0.5 pb-1 text-xs text-[var(--neutral-500)]">
                    <span className="tabular-nums">${colValue.toLocaleString()}</span>
                  </div>
                  {colPOs.map((po) => (
                    <KanbanCard key={po.id} id={po.id} type="po-kanban" className="p-0">
                      <div
                        role="button"
                        tabIndex={0}
                        className="p-4 cursor-pointer"
                        onClick={() => navigate(`/buy/orders/${po.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/buy/orders/${po.id}`); }}
                      >
                        <div className="text-sm font-medium tabular-nums">{po.poNumber}</div>
                        <div className="mt-1 text-xs text-[var(--neutral-500)]">{po.supplier}</div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-medium tabular-nums text-foreground">${po.total.toLocaleString()}</span>
                          <span className="text-[var(--neutral-500)]">
                            {new Date(po.deliveryDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                          </span>
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

      {state.view === 'calendar' && (
        <motion.div variants={staggerItem}>
          <div className="rounded-lg border border-[var(--border)] bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4" />
              Delivery schedule
            </div>
            <div className="space-y-3">
              {(() => {
                const grouped = new Map<string, PurchaseOrder[]>();
                for (const po of filteredPOs) {
                  const key = po.deliveryDate.slice(0, 10);
                  if (!grouped.has(key)) grouped.set(key, []);
                  grouped.get(key)!.push(po);
                }
                const sorted = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
                if (sorted.length === 0) {
                  return <p className="text-sm text-[var(--neutral-500)]">No deliveries match the current filters.</p>;
                }
                return sorted.map(([day, pos]) => (
                  <div key={day} className="flex gap-4 border-b border-[var(--border)] pb-2 last:border-0">
                    <div className="w-28 shrink-0 text-xs tabular-nums text-[var(--neutral-500)]">
                      {new Date(day).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {pos.map((po) => (
                        <button
                          key={po.id}
                          type="button"
                          onClick={() => navigate(`/buy/orders/${po.id}`)}
                          className="block w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--neutral-50)]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium tabular-nums text-foreground">{po.poNumber}</span>
                            <span className="tabular-nums text-foreground">${po.total.toLocaleString()}</span>
                          </div>
                          <div className="text-[var(--neutral-500)]">{po.supplier} · {STATUS_LABEL[po.status].label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
    </PageShell>
  );
}
