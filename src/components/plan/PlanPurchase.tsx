/**
 * Plan Purchase — Material Requirements Planning (MRP)
 * Shows shortfalls per job, lets user create PRs for shortfalls in bulk
 */
import React from 'react';
import { ShoppingCart, AlertTriangle, CheckCircle, RefreshCw, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { toast } from 'sonner';


const MRP_ROWS = [
  { id: '1',  product: 'Mild Steel Sheet 3mm',       sku: 'MAT-MS-001', required: 50, available: 15, onOrder: 20, net: 15,  job: 'MW-089', due: 'Mar 25', status: 'shortage'  as const },
  { id: '2',  product: 'Aluminium Angle 50x50x5',    sku: 'MAT-AL-042', required: 20, available: 8,  onOrder: 0,  net: 12,  job: 'MW-089', due: 'Mar 25', status: 'shortage'  as const },
  { id: '3',  product: 'Welding Rod ER70S-6 4mm',    sku: 'CONS-WR-001',required: 100,available: 150,onOrder: 0,  net: -50, job: 'MW-088', due: 'Mar 28', status: 'ok'        as const },
  { id: '4',  product: 'RHS 50x25x2.5 Steel',        sku: 'MAT-RHS-001',required: 80, available: 0,  onOrder: 40, net: 40,  job: 'MW-088', due: 'Mar 28', status: 'shortage'  as const },
  { id: '5',  product: 'Hardware Kit M10 SS',         sku: 'CONS-HW-001',required: 12, available: 15, onOrder: 0,  net: -3,  job: 'MW-091', due: 'Apr 02', status: 'ok'        as const },
  { id: '6',  product: 'Powder Coat Paint RAL 7035',  sku: 'CONS-PC-001',required: 6,  available: 8,  onOrder: 0,  net: -2,  job: 'MW-091', due: 'Apr 02', status: 'ok'        as const },
  { id: '7',  product: '10mm Mild Steel Plate',       sku: 'MS-10-3678', required: 20, available: 45, onOrder: 0,  net: -25, job: 'MW-090', due: 'Apr 05', status: 'ok'        as const },
  { id: '8',  product: 'Aluminium Base Plate 5052',   sku: 'AL-5052-BP', required: 40, available: 120,onOrder: 0,  net: -80, job: 'MW-090', due: 'Apr 05', status: 'ok'        as const },
  { id: '9',  product: 'SS Fasteners M10 Grade A4',   sku: 'FST-M10A4',  required: 30, available: 0,  onOrder: 0,  net: 30,  job: 'MW-089', due: 'Mar 25', status: 'critical'  as const },
];

type MrpRow = (typeof MRP_ROWS)[number];

const mrpColumns: MwColumnDef<MrpRow>[] = [
  { key: 'product', header: 'Material', tooltip: 'Material name', cell: (row) => <span className="text-foreground font-medium">{row.product}</span> },
  { key: 'sku', header: 'SKU', tooltip: 'Stock keeping unit', className: 'text-xs tabular-nums text-[var(--neutral-500)]', cell: (row) => row.sku },
  { key: 'job', header: 'Job', tooltip: 'Associated job number', cell: (row) => <span className="tabular-nums font-medium text-foreground">{row.job}</span> },
  { key: 'due', header: 'Due', tooltip: 'Required by date', className: 'tabular-nums text-[var(--neutral-500)]', cell: (row) => row.due },
  { key: 'required', header: 'Required', tooltip: 'Total quantity required', headerClassName: 'text-right', className: 'text-right tabular-nums font-medium', cell: (row) => row.required },
  { key: 'available', header: 'Available', tooltip: 'Current stock on hand', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (row) => row.available },
  { key: 'onOrder', header: 'On Order', tooltip: 'Quantity already on order', headerClassName: 'text-right', className: 'text-right tabular-nums text-[var(--neutral-500)]', cell: (row) => row.onOrder > 0 ? row.onOrder : '\u2014' },
  {
    key: 'net',
    header: 'Net Shortfall',
    tooltip: 'Remaining shortfall after stock and orders',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums font-medium',
    cell: (row) => (
      <span style={{ color: row.net > 0 ? 'var(--mw-error)' : 'var(--mw-success)' }}>
        {row.net > 0 ? `+${row.net}` : row.net}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Material availability status',
    cell: (row) =>
      row.status === 'ok'
        ? <StatusBadge variant="neutral">OK</StatusBadge>
        : row.status === 'critical'
          ? <StatusBadge variant="error">Critical</StatusBadge>
          : <StatusBadge variant="warning">Shortage</StatusBadge>,
  },
];

export function PlanPurchase() {
  const shortages  = MRP_ROWS.filter(r => r.status !== 'ok');
  const countCritical = shortages.filter(s => s.status === 'critical').length;
  const countShortage = shortages.filter(s => s.status === 'shortage').length;
  const countOk = MRP_ROWS.filter(r => r.status === 'ok').length;

  return (
    <PageShell>
      <PageHeader
        title="Material requirements"
        subtitle={`${countCritical > 0 ? `${countCritical} critical shortage \u00B7 ` : ''}${countShortage} shortages \u00B7 ${countOk} items available`}
        actions={
          <div className="flex gap-4">
            <Button variant="outline" className="border-[var(--border)] gap-2 h-12">
              <RefreshCw className="w-4 h-4" /> Recalculate MRP
            </Button>
            <Button variant="outline" className="border-[var(--border)] gap-2 h-12">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        }
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'critical', label: 'Critical', value: countCritical, color: 'var(--mw-yellow-400)' },
          { key: 'shortage', label: 'Shortage', value: countShortage, color: 'var(--mw-mirage)' },
          { key: 'ok', label: 'OK', value: countOk, color: 'var(--neutral-400)' },
        ]}
        formatValue={(v) => String(v)}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical shortages', count: countCritical, bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', icon: AlertTriangle },
          { label: 'Active shortages',   count: countShortage, bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', icon: AlertTriangle },
          { label: 'Items available',    count: countOk,        bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', icon: CheckCircle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
              <div className={cn('w-8 h-8 rounded-[var(--shape-md)] flex items-center justify-center mb-4', s.bg)}>
                <Icon className={cn('w-4 h-4', s.text)} />
              </div>
              <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
              <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.count}</p>
            </Card>
          );
        })}
      </div>

      <MwDataTable
        columns={mrpColumns}
        data={MRP_ROWS}
        keyExtractor={(row) => row.id}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
      />
    </PageShell>
  );
}
