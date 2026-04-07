/**
 * MakeManufacturingOrders — List view of all manufacturing orders.
 * Navigates to MakeManufacturingOrderDetail on row click.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Factory } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';
import { manufacturingOrders } from '@/services/mock';

interface ManufacturingOrder {
  id: string;
  moNumber: string;
  product: string;
  jobNumber: string;
  customer: string;
  status: 'draft' | 'confirmed' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  progress: number;
  workOrders: number;
  operator: string;
}

const MO_DATA: ManufacturingOrder[] = manufacturingOrders.map((mo) => ({
  id: mo.id,
  moNumber: mo.moNumber,
  product: mo.productName,
  jobNumber: mo.jobNumber,
  customer: mo.customerName,
  status: mo.status as ManufacturingOrder['status'],
  priority: mo.priority as ManufacturingOrder['priority'],
  dueDate: new Date(mo.dueDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }),
  progress: mo.progress,
  workOrders: mo.workOrders,
  operator: mo.operatorName.split(' ').map((n, i) => i === 0 ? `${n[0]}.` : n).join(' '),
}));

const STATUS_MAP: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  done: 'Done',
};

export function MakeManufacturingOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = MO_DATA.filter(
    (mo) =>
      mo.moNumber.toLowerCase().includes(search.toLowerCase()) ||
      mo.product.toLowerCase().includes(search.toLowerCase()) ||
      mo.customer.toLowerCase().includes(search.toLowerCase()),
  );

  const inProgressCount = MO_DATA.filter((mo) => mo.status === 'in_progress').length;
  const confirmedCount = MO_DATA.filter((mo) => mo.status === 'confirmed').length;
  const doneCount = MO_DATA.filter((mo) => mo.status === 'done').length;
  const draftCount = MO_DATA.filter((mo) => mo.status === 'draft').length;

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Manufacturing Orders"
        subtitle={`${MO_DATA.length} manufacturing orders`}
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: inProgressCount, sub: 'Active orders', bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'Confirmed', value: confirmedCount, sub: 'Ready to start', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Draft', value: draftCount, sub: 'Needs confirmation', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
          { label: 'Completed', value: doneCount, sub: `${MO_DATA.length} total orders`, bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
        ].map(s => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search manufacturing orders…" />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New manufacturing order form coming soon')}>
          New MO
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Table */}
      <MwDataTable<ManufacturingOrder>
        columns={[
          { key: 'moNumber', header: 'MO #', tooltip: 'Manufacturing order number', cell: (mo) => (
            <span className="font-medium text-foreground tabular-nums inline-flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
              {mo.moNumber}
            </span>
          ) },
          { key: 'product', header: 'Product', cell: (mo) => <span className="text-[var(--neutral-700)]">{mo.product}</span> },
          { key: 'job', header: 'Job', tooltip: 'Associated job number', cell: (mo) => <Badge variant="outline" className="border-[var(--border)] text-xs tabular-nums">{mo.jobNumber}</Badge> },
          { key: 'customer', header: 'Customer', cell: (mo) => <span className="text-[var(--neutral-600)]">{mo.customer}</span> },
          { key: 'status', header: 'Status', tooltip: 'Current order status', cell: (mo) => <StatusBadge status={mo.status === 'in_progress' ? 'progress' : mo.status === 'done' ? 'completed' : mo.status} /> },
          { key: 'priority', header: 'Priority', cell: (mo) => <StatusBadge priority={mo.priority} /> },
          { key: 'due', header: 'Due', tooltip: 'Due date for completion', cell: (mo) => <span className="text-[var(--neutral-600)] tabular-nums">{mo.dueDate}</span> },
          { key: 'progress', header: 'Progress', tooltip: 'Manufacturing completion %', headerClassName: 'w-32', cell: (mo) => <ProgressBar value={mo.progress} size="sm" showLabel /> },
          { key: 'wos', header: 'WOs', tooltip: 'Number of work orders', headerClassName: 'text-center', cell: (mo) => <div className="text-center"><Badge variant="secondary" className="border-0 bg-[var(--neutral-100)] text-xs tabular-nums">{mo.workOrders}</Badge></div> },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-[200px]',
            cell: (mo) => (
              <div
                className="flex flex-wrap items-center gap-1"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => navigate(`/make/manufacturing-orders/${mo.id}`)}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => navigate(`/make/job-traveler/${mo.id}`)}
                >
                  Job traveler
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={(mo) => mo.id}
        onRowClick={(mo) => navigate(`/make/manufacturing-orders/${mo.id}`)}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
      />
    </PageShell>
  );
}
