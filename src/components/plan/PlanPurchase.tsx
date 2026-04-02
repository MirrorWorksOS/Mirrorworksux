/**
 * Plan Purchase — Material Requirements Planning (MRP)
 * Shows shortfalls per job, lets user create PRs for shortfalls in bulk
 */
import React, { useState } from 'react';
import { ShoppingCart, AlertTriangle, CheckCircle, RefreshCw, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


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

function buildMrpColumns(
  selected: Set<string>,
  toggleRow: (id: string) => void,
  toggleAll: () => void,
  shortages: MrpRow[],
): MwColumnDef<MrpRow>[] {
  return [
    {
      key: 'select',
      header: (
        <input type="checkbox"
          checked={selected.size === shortages.length && shortages.length > 0}
          onChange={toggleAll}
          className="accent-[var(--mw-yellow-400)] w-4 h-4"
        />
      ),
      headerClassName: 'w-10',
      cell: (row) =>
        row.status !== 'ok' ? (
          <input type="checkbox"
            checked={selected.has(row.id)}
            onChange={() => toggleRow(row.id)}
            className="accent-[var(--mw-yellow-400)] w-4 h-4"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null,
    },
    { key: 'product', header: 'Material', cell: (row) => <span className="text-[var(--mw-mirage)] font-medium">{row.product}</span> },
    { key: 'sku', header: 'SKU', className: 'text-xs text-[var(--neutral-500)]', cell: (row) => row.sku },
    { key: 'job', header: 'Job', cell: (row) => <span className="tabular-nums text-[var(--mw-mirage)]">{row.job}</span> },
    { key: 'due', header: 'Due', className: 'text-[var(--neutral-500)]', cell: (row) => row.due },
    { key: 'required', header: 'Required', headerClassName: 'text-right', className: 'text-right tabular-nums font-medium', cell: (row) => row.required },
    { key: 'available', header: 'Available', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (row) => row.available },
    { key: 'onOrder', header: 'On Order', headerClassName: 'text-right', className: 'text-right tabular-nums text-[var(--neutral-500)]', cell: (row) => row.onOrder > 0 ? row.onOrder : '—' },
    {
      key: 'net',
      header: 'Net Shortfall',
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
      cell: (row) =>
        row.status === 'ok'
          ? <StatusBadge variant="neutral">OK</StatusBadge>
          : row.status === 'critical'
            ? <StatusBadge variant="error">Critical</StatusBadge>
            : <StatusBadge variant="warning">Shortage</StatusBadge>,
    },
  ];
}

export function PlanPurchase() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const shortages  = MRP_ROWS.filter(r => r.status !== 'ok');
  const toggleRow  = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll  = () => setSelected(prev => prev.size === shortages.length ? new Set() : new Set(shortages.map(r => r.id)));

  return (
    <PageShell>
      <PageHeader
        title="Material requirements"
        subtitle={`${shortages.filter(s => s.status === 'critical').length > 0 ? `${shortages.filter(s => s.status === 'critical').length} critical shortage · ` : ''}${shortages.filter(s => s.status === 'shortage').length} shortages · ${MRP_ROWS.filter(r => r.status === 'ok').length} items available`}
        actions={
          <div className="flex gap-4">
            <Button variant="outline" className="border-[var(--border)] gap-2 h-10">
              <RefreshCw className="w-4 h-4" /> Recalculate MRP
            </Button>
            <Button variant="outline" className="border-[var(--border)] gap-2 h-10">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button
              className={cn('gap-2 h-10', selected.size > 0
                ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)]'
                : 'bg-[var(--neutral-100)] text-[var(--neutral-400)] cursor-not-allowed'
              )}
              disabled={selected.size === 0}
            >
              <ShoppingCart className="w-4 h-4" /> Create {selected.size > 0 ? `${selected.size} PRs` : 'PRs'}
            </Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical shortages', count: shortages.filter(s => s.status === 'critical').length, bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', icon: AlertTriangle },
          { label: 'Active shortages',   count: shortages.filter(s => s.status === 'shortage').length, bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', icon: AlertTriangle },
          { label: 'Items available',    count: MRP_ROWS.filter(r => r.status === 'ok').length,        bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', icon: CheckCircle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
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
        columns={buildMrpColumns(selected, toggleRow, toggleAll, shortages)}
        data={MRP_ROWS}
        keyExtractor={(row) => row.id}
      />
    </PageShell>
  );
}
