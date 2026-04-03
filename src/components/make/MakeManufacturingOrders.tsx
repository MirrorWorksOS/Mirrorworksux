/**
 * MakeManufacturingOrders — List view of all manufacturing orders.
 * Navigates to MakeManufacturingOrderDetail on row click.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Factory } from 'lucide-react';
import { Badge } from '../ui/badge';
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

const MO_DATA: ManufacturingOrder[] = [
  { id: '1', moNumber: 'MO-2026-001', product: 'Mounting Bracket Assembly', jobNumber: 'JOB-1210', customer: 'TechCorp Industries', status: 'in_progress', priority: 'high', dueDate: '15 Apr 2026', progress: 45, workOrders: 4, operator: 'M. Johnson' },
  { id: '2', moNumber: 'MO-2026-002', product: 'Server Rack Chassis', jobNumber: 'JOB-1211', customer: 'Pacific Fab', status: 'in_progress', priority: 'urgent', dueDate: '20 Apr 2026', progress: 22, workOrders: 6, operator: 'D. Lee' },
  { id: '3', moNumber: 'MO-2026-003', product: 'Cable Tray Support', jobNumber: 'JOB-1212', customer: 'Sydney Rail Corp', status: 'confirmed', priority: 'medium', dueDate: '28 Apr 2026', progress: 0, workOrders: 3, operator: 'E. Williams' },
  { id: '4', moNumber: 'MO-2026-004', product: 'Machine Guard Assembly', jobNumber: 'JOB-1213', customer: 'Kemppi Australia', status: 'done', priority: 'low', dueDate: '10 Apr 2026', progress: 100, workOrders: 2, operator: 'M. Thompson' },
  { id: '5', moNumber: 'MO-2026-005', product: 'Aluminium Enclosure Panel', jobNumber: 'JOB-1214', customer: 'Hunter Steel Co', status: 'draft', priority: 'medium', dueDate: '05 May 2026', progress: 0, workOrders: 5, operator: 'S. Chen' },
];

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
          { label: 'In Progress', value: inProgressCount, sub: 'Active orders', bg: 'bg-[var(--mw-yellow-50)]', text: 'text-[var(--mw-mirage)]' },
          { label: 'Confirmed', value: confirmedCount, sub: 'Ready to start', bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]' },
          { label: 'Draft', value: draftCount, sub: 'Needs confirmation', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
          { label: 'Completed', value: doneCount, sub: `${MO_DATA.length} total orders`, bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]' },
        ].map(s => (
          <Card key={s.label} className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
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
            <span className="font-medium text-[var(--mw-mirage)] tabular-nums inline-flex items-center gap-1.5">
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
