/**
 * MakeWorkOrders — list of work orders with click-through to detail.
 * Surfaces the WO records previously only reachable from inside an MO.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Wrench } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { MwDataTable } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';
import { workOrders } from '@/services';

export function MakeWorkOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = workOrders.filter(
    (wo) =>
      wo.woNumber.toLowerCase().includes(search.toLowerCase()) ||
      wo.operation.toLowerCase().includes(search.toLowerCase()) ||
      wo.machineName.toLowerCase().includes(search.toLowerCase()),
  );

  const inProgressCount = workOrders.filter((w) => w.status === 'in_progress').length;
  const pendingCount = workOrders.filter((w) => w.status === 'pending').length;
  const completedCount = workOrders.filter((w) => w.status === 'completed').length;

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Work orders"
        subtitle={`${workOrders.length} work orders across ${new Set(workOrders.map((w) => w.manufacturingOrderId)).size} MOs`}
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Progress', value: inProgressCount, sub: 'Active on the floor', text: 'text-foreground' },
          { label: 'Pending', value: pendingCount, sub: 'Awaiting start', text: 'text-foreground' },
          { label: 'Completed', value: completedCount, sub: 'Finished', text: 'text-foreground' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search work orders…" />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/make/work-orders/new')}>
          New WO
        </ToolbarPrimaryButton>
      </PageToolbar>

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
                {wo.status}
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
    </PageShell>
  );
}
