/**
 * Sheet Stock tab — read-mostly view of raw sheets / remnants
 * (planService.getSheetStocks). SheetStock is deliberately NOT merged
 * into the product × location ledger: sheets carry grade / thickness /
 * dimensions / grain that the ledger has no columns for, and nesting
 * owns their lifecycle. This tab is the cross-reference.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import {
  PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer,
} from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import type { SheetStock } from '@/types/entities';

const STATUS_BADGE: Record<SheetStock['status'], 'success' | 'info' | 'neutral' | 'warning'> = {
  available: 'success',
  reserved: 'info',
  consumed: 'neutral',
  on_order: 'warning',
};

const STATUS_LABELS: Record<SheetStock['status'], string> = {
  available: 'Available',
  reserved: 'Reserved',
  consumed: 'Consumed',
  on_order: 'On order',
};

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const sheetColumns: MwColumnDef<SheetStock>[] = [
  {
    key: 'sku', header: 'SKU', tooltip: 'Sheet stock-keeping unit',
    cell: (s) => s.sku,
    className: 'text-xs font-medium text-[var(--neutral-500)]',
  },
  {
    key: 'material', header: 'Material', tooltip: 'Material, grade and thickness',
    cell: (s) => (
      <div>
        <p className="text-sm font-medium text-foreground">{s.material} {s.grade}</p>
        <p className="text-xs text-[var(--neutral-500)]">{s.thicknessMm}mm</p>
      </div>
    ),
  },
  {
    key: 'dims', header: 'Dimensions', tooltip: 'Sheet width × height',
    cell: (s) => <span className="text-sm tabular-nums">{s.widthMm} × {s.heightMm} mm</span>,
  },
  {
    key: 'onHand', header: 'On Hand', tooltip: 'Sheets on hand',
    headerClassName: 'text-right', className: 'text-right font-medium tabular-nums',
    cell: (s) => s.qtyOnHand,
  },
  {
    key: 'reserved', header: 'Reserved', tooltip: 'Sheets reserved for nests',
    headerClassName: 'text-right', className: 'text-right text-[var(--neutral-500)] tabular-nums',
    cell: (s) => s.qtyReserved,
  },
  {
    key: 'location', header: 'Location', tooltip: 'Storage location',
    cell: (s) => s.location,
    className: 'text-xs font-medium text-[var(--neutral-500)]',
  },
  {
    key: 'cost', header: 'Cost / Sheet', tooltip: 'Cost per sheet (AUD)',
    headerClassName: 'text-right', className: 'text-right tabular-nums',
    cell: (s) => formatCurrency(s.costPerSheetAud),
  },
  {
    key: 'remnant', header: 'Remnant', tooltip: 'Offcut from a previously cut sheet', headerClassName: 'text-center',
    cell: (s) => (
      <div className="flex justify-center">
        {s.isRemnant
          ? <StatusBadge variant="warning">Remnant</StatusBadge>
          : <span className="text-xs text-[var(--neutral-400)]">—</span>}
      </div>
    ),
  },
  {
    key: 'status', header: 'Status', tooltip: 'Sheet availability', headerClassName: 'text-center',
    cell: (s) => (
      <div className="flex justify-center">
        <StatusBadge variant={STATUS_BADGE[s.status]} withDot>{STATUS_LABELS[s.status]}</StatusBadge>
      </div>
    ),
  },
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'remnants', label: 'Remnants' },
];

export function SheetStockTab({ sheets }: { sheets: SheetStock[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let rows = sheets;
    if (filter === 'available') rows = rows.filter((s) => s.status === 'available');
    if (filter === 'remnants') rows = rows.filter((s) => s.isRemnant);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.sku.toLowerCase().includes(q) ||
          s.material.toLowerCase().includes(q) ||
          s.grade.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [sheets, search, filter]);

  return (
    <div className="space-y-6">
      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search by SKU, material or grade..." />
        <ToolbarFilterPills value={filter} onChange={setFilter} options={FILTERS} />
        <ToolbarSpacer />
        <Button asChild variant="outline" className="h-12 gap-2 border-[var(--neutral-200)] dark:border-[var(--border)] px-5 rounded-full">
          <Link to="/plan/machine-io?tab=nesting-studio">
            <ExternalLink className="w-4 h-4" /> Open Nesting Studio
          </Link>
        </Button>
      </PageToolbar>

      <MwDataTable
        columns={sheetColumns}
        data={filtered}
        keyExtractor={(s) => s.id}
        emptyState={
          <EmptyState
            variant="inline"
            title="No sheet stock matches."
            description="Sheets and remnants are managed by nesting — this view is the cross-reference."
          />
        }
      />
    </div>
  );
}
