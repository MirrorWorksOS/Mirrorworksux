/**
 * MakeManufacturingOrders — List view of all manufacturing orders.
 * Navigates to MakeManufacturingOrderDetail on row click.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';

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

  return (
    <PageShell>
      <PageHeader
        title="Manufacturing Orders"
        subtitle={`${MO_DATA.length} manufacturing orders`}
        actions={
          <ToolbarPrimaryButton label="New MO" onClick={() => {}} />
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 pb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
          <Input
            placeholder="Search manufacturing orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-[var(--border)]"
          />
        </div>
        <ToolbarFilterButton />
      </div>

      {/* Table */}
      <div className="px-6">
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">MO #</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Job</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Due</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)] w-32">Progress</th>
                <th className="text-center px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">WOs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mo) => (
                <tr
                  key={mo.id}
                  onClick={() => navigate(`/make/manufacturing-orders/${mo.id}`)}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--mw-mirage)] tabular-nums">{mo.moNumber}</td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-700)]">{mo.product}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-[var(--border)] text-xs tabular-nums">{mo.jobNumber}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-600)]">{mo.customer}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={mo.status === 'in_progress' ? 'progress' : mo.status === 'done' ? 'completed' : mo.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge priority={mo.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--neutral-600)] tabular-nums">{mo.dueDate}</td>
                  <td className="px-4 py-3">
                    <ProgressBar value={mo.progress} size="sm" showLabel />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="secondary" className="border-0 bg-[var(--neutral-100)] text-xs tabular-nums">{mo.workOrders}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
