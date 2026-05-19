/**
 * MakeWorkOrders — list of work orders with the schema-driven filter bar.
 *
 * Replaces the generic `ToolbarFilterButton` with real WO status options
 * (`pending | in_progress | completed | blocked`), machine + operator + parent-MO
 * facets, and a kanban-by-status board view. Many of the richer facets
 * (`workCentre`, `shift`, `priority`, `variance`, signal booleans) require a
 * data-model extension and are deferred — see TODOs.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Boxes,
  CircleDot,
  Columns3,
  Cpu,
  List as ListIcon,
  PauseCircle,
  Plus,
  User,
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { MwDataTable } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { workOrders, manufacturingOrders, machines, employees } from '@/services';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

type WOStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

const STATUS_LABEL: Record<WOStatus, { label: string; color: string }> = {
  pending:     { label: 'Released',    color: 'var(--neutral-300)' },
  in_progress: { label: 'In progress', color: 'var(--mw-yellow-400)' },
  blocked:     { label: 'On hold',     color: 'var(--mw-yellow-600)' },
  completed:   { label: 'Done',        color: 'var(--mw-mirage)' },
};

const MODULE_ID = 'make.workOrders';

const machineOptions = machines.map((m) => ({ value: m.id, label: m.name }));
const operatorOptions = employees.map((e) => ({ value: e.id, label: e.name }));
const moOptions = manufacturingOrders.map((mo) => ({ value: mo.id, label: mo.moNumber }));

const woFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Work Orders',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: (Object.keys(STATUS_LABEL) as WOStatus[]).map((s) => ({
        value: s,
        label: STATUS_LABEL[s].label,
        color: STATUS_LABEL[s].color,
      })),
    },
    { id: 'machine', label: 'Machine', kind: 'multi', icon: Cpu, pinned: true, options: machineOptions },
    { id: 'operator', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'parentMo', label: 'Parent MO', kind: 'select', icon: Boxes, options: moOptions },
    // TODO(filters): needs workCentreId on WorkOrder
    // TODO(filters): needs shift on WorkOrder
    // TODO(filters): needs jobId on WorkOrder
    // TODO(filters): needs priority on WorkOrder
    // TODO(filters): variance derived from estimatedMinutes / actualMinutes — pinned out for now
    // TODO(filters): needs atRisk / awaitingMaterial / hasScrap / qualityHold / promised flags
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban by status', icon: Columns3, groupBy: 'status' },
    { id: 'board', label: 'Machine swimlanes', icon: Cpu, groupBy: 'machine' },
    { id: 'list', label: 'List', icon: ListIcon },
    // TODO(filters): gantt + shift calendar views require schedule data
  ],
  defaultView: 'kanban',
  // dateFacetId: 'promised' — needs WO.promised date; deferred
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'My queue today',
    icon: User,
    iconTone: 'yellow',
    state: { values: { operator: '__me__' }, search: '', view: 'list' },
  },
  {
    name: 'In progress now',
    icon: CircleDot,
    iconTone: 'info',
    state: { values: { status: ['in_progress'] }, search: '', view: 'kanban' },
  },
  {
    name: 'On hold',
    icon: PauseCircle,
    iconTone: 'warning',
    state: { values: { status: ['blocked'] }, search: '', view: 'kanban' },
  },
  {
    name: 'Pending release',
    icon: AlertTriangle,
    iconTone: 'warning',
    state: { values: { status: ['pending'] }, search: '', view: 'list' },
  },
]);

export function MakeWorkOrders() {
  const navigate = useNavigate();
  const filters = useModuleFilters(woFilterSchema);
  const { state } = filters;

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: woFilterSchema,
        state,
        rows: workOrders,
        getSearchText: (wo) =>
          `${wo.woNumber} ${wo.operation} ${wo.machineName} ${wo.operatorName ?? ''} ${wo.manufacturingOrderId}`,
        getFacetValue: (wo, id) => {
          switch (id) {
            case 'status': return wo.status;
            case 'machine': return wo.machineId;
            case 'operator': return wo.operatorId ?? '';
            case 'parentMo': return wo.manufacturingOrderId;
            default: return undefined;
          }
        },
      }),
    [state],
  );

  const inProgressCount = workOrders.filter((w) => w.status === 'in_progress').length;
  const pendingCount = workOrders.filter((w) => w.status === 'pending').length;
  const completedCount = workOrders.filter((w) => w.status === 'completed').length;

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Work orders"
        subtitle={`${filtered.length} of ${workOrders.length} work orders across ${new Set(workOrders.map((w) => w.manufacturingOrderId)).size} MOs`}
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Progress', value: inProgressCount, sub: 'Active on the floor', text: 'text-foreground' },
          { label: 'Pending', value: pendingCount, sub: 'Awaiting start', text: 'text-foreground' },
          { label: 'Completed', value: completedCount, sub: 'Finished', text: 'text-foreground' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-lg p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <ModuleFilterBar
        schema={woFilterSchema}
        filters={filters}
        searchPlaceholder="Search work orders…"
        actions={
          <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/make/work-orders/new')}>
            New WO
          </ToolbarPrimaryButton>
        }
      />

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable
            columns={[
              {
                key: 'woNumber',
                header: 'WO #',
                tooltip: 'Work order number',
                cell: (wo) => (
                  <span className="font-medium text-foreground tabular-nums inline-flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
                    {wo.woNumber}
                  </span>
                ),
              },
              { key: 'operation', header: 'Operation', cell: (wo) => <span className="text-[var(--neutral-700)]">{wo.operation}</span> },
              { key: 'machineName', header: 'Machine', cell: (wo) => <span className="text-[var(--neutral-600)]">{wo.machineName}</span> },
              { key: 'mo', header: 'MO', tooltip: 'Parent manufacturing order', cell: (wo) => <Badge variant="outline" className="border-[var(--border)] text-xs tabular-nums">{wo.manufacturingOrderId}</Badge> },
              { key: 'sequence', header: 'Seq', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (wo) => wo.sequence },
              { key: 'estimated', header: 'Est. min', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (wo) => wo.estimatedMinutes },
              { key: 'actual', header: 'Actual min', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (wo) => wo.actualMinutes },
              {
                key: 'status',
                header: 'Status',
                cell: (wo) => (
                  <StatusBadge status={wo.status === 'in_progress' ? 'progress' : wo.status === 'completed' ? 'completed' : 'draft'}>
                    {STATUS_LABEL[wo.status as WOStatus]?.label ?? wo.status}
                  </StatusBadge>
                ),
              },
              { key: 'operator', header: 'Operator', cell: (wo) => <span className="text-[var(--neutral-600)]">{wo.operatorName ?? '—'}</span> },
            ]}
            data={filtered}
            keyExtractor={(wo) => wo.id}
            onRowClick={(wo) => navigate(`/make/work-orders/${wo.id}`)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </motion.div>
      )}

      {state.view === 'kanban' && (
        <motion.div variants={staggerItem}>
          <KanbanBoard className="gap-4">
            {(Object.keys(STATUS_LABEL) as WOStatus[]).map((s) => {
              const colRows = filtered.filter((w) => w.status === s);
              return (
                <KanbanColumn
                  key={s}
                  id={s}
                  title={STATUS_LABEL[s].label}
                  count={colRows.length}
                  accept="wo-kanban"
                  onDrop={() => undefined}
                  className="min-w-[280px] w-[280px] flex-shrink-0"
                >
                  {colRows.map((w) => (
                    <KanbanCard key={w.id} id={w.id} type="wo-kanban" className="p-0">
                      <div
                        role="button"
                        tabIndex={0}
                        className="p-4 cursor-pointer"
                        onClick={() => navigate(`/make/work-orders/${w.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/make/work-orders/${w.id}`); }}
                      >
                        <div className="text-sm font-medium tabular-nums">{w.woNumber}</div>
                        <div className="mt-1 text-xs text-[var(--neutral-500)]">{w.operation}</div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-[var(--neutral-500)]">{w.machineName}</span>
                          <span className="text-[var(--neutral-500)]">{w.operatorName ?? '—'}</span>
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

      {state.view === 'board' && (
        <motion.div variants={staggerItem}>
          <KanbanBoard className="gap-4">
            {machines.filter((m) => filtered.some((w) => w.machineId === m.id)).map((m) => {
              const colRows = filtered.filter((w) => w.machineId === m.id);
              return (
                <KanbanColumn
                  key={m.id}
                  id={m.id}
                  title={m.name}
                  count={colRows.length}
                  accept="wo-machine"
                  onDrop={() => undefined}
                  className="min-w-[280px] w-[280px] flex-shrink-0"
                >
                  {colRows.map((w) => (
                    <KanbanCard key={w.id} id={w.id} type="wo-machine" className="p-0">
                      <div
                        role="button"
                        tabIndex={0}
                        className="p-4 cursor-pointer"
                        onClick={() => navigate(`/make/work-orders/${w.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/make/work-orders/${w.id}`); }}
                      >
                        <div className="text-sm font-medium tabular-nums">{w.woNumber}</div>
                        <div className="mt-1 text-xs text-[var(--neutral-500)]">{w.operation}</div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <StatusBadge status={w.status === 'in_progress' ? 'progress' : w.status === 'completed' ? 'completed' : 'draft'}>
                            {STATUS_LABEL[w.status as WOStatus]?.label ?? w.status}
                          </StatusBadge>
                          <span className="text-[var(--neutral-500)]">{w.operatorName ?? '—'}</span>
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
    </PageShell>
  );
}
