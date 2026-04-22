/**
 * MaterialLibrary — list/table view of the material library entity.
 *
 * MVP scope: read seeded materials, search/filter, see key properties at a glance,
 * and trash/restore. Editing inline is v2; the goal here is for Product Studio's
 * Materials toolbox category to have something real to bind against.
 */

import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, RotateCcw, Layers, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMaterialLibraryStore } from '@/store/materialLibraryStore';
import { MATERIAL_TYPE_LABELS, type Material, type MaterialType } from '@/lib/material-library/types';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';

const TYPE_FILTER_OPTIONS: { value: 'all' | MaterialType; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'plate', label: 'Plate' },
  { value: 'tube', label: 'Tube' },
  { value: 'rhs', label: 'RHS' },
  { value: 'shs', label: 'SHS' },
  { value: 'angle', label: 'Angle' },
  { value: 'flat_bar', label: 'Flat bar' },
  { value: 'round_bar', label: 'Round bar' },
];

const SUMMARY_COLORS = [
  'var(--mw-yellow-400)',
  'var(--mw-mirage)',
  'var(--neutral-400)',
  'var(--mw-yellow-600)',
  'var(--neutral-300)',
];

function formatCost(amount: number, currency: string, unit: string): string {
  const u = unit === 'per_kg' ? '/kg' : unit === 'per_m' ? '/m' : '/sheet';
  return `${currency} ${amount.toFixed(2)}${u}`;
}

function formatStockSizes(sizes: { width?: number; length?: number; thickness?: number; profile?: string }[]): string {
  if (sizes.length === 0) return '—';
  return sizes
    .map((s) => {
      if (s.profile) return `${s.profile} @ ${s.length}mm`;
      if (s.width && s.length && s.thickness) return `${s.width}×${s.length}×${s.thickness}`;
      if (s.length) return `${s.length}mm`;
      return '—';
    })
    .join(', ');
}

function buildColumns(removeMaterial: (id: string) => void): MwColumnDef<Material>[] {
  return [
    {
      key: 'code',
      header: 'Code',
      tooltip: 'Material code',
      className: 'font-mono text-xs tabular-nums text-[var(--neutral-500)]',
      cell: (m) => m.code,
    },
    {
      key: 'name',
      header: 'Name',
      tooltip: 'Material name',
      cell: (m) => (
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" strokeWidth={1.5} />
          <span className="font-medium text-foreground">{m.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      tooltip: 'Stock form factor',
      cell: (m) => (
        <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--neutral-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--neutral-600)] dark:bg-[var(--neutral-900)] dark:text-[var(--neutral-400)]">
          {MATERIAL_TYPE_LABELS[m.type]}
        </span>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      tooltip: 'Material grade',
      className: 'text-[var(--neutral-500)]',
      cell: (m) => m.grade,
    },
    {
      key: 'density',
      header: 'Density',
      tooltip: 'Density kg/m³',
      headerClassName: 'text-right',
      className: 'text-right tabular-nums text-[var(--neutral-500)]',
      cell: (m) => `${m.densityKgM3} kg/m³`,
    },
    {
      key: 'cost',
      header: 'Cost',
      tooltip: 'Unit cost',
      cell: (m) => formatCost(m.cost.amount, m.cost.currency, m.cost.unit),
    },
    {
      key: 'stockSizes',
      header: 'Stock sizes',
      tooltip: 'Available stock dimensions',
      className: 'max-w-[220px] truncate text-[var(--neutral-500)]',
      cell: (m) => formatStockSizes(m.stockSizes),
    },
    {
      key: 'suppliers',
      header: 'Suppliers',
      tooltip: 'Preferred suppliers',
      className: 'text-[var(--neutral-500)]',
      cell: (m) => m.suppliers.map((s) => s.name).join(', ') || '—',
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-[1%] whitespace-nowrap',
      className: 'w-[1%] whitespace-nowrap',
      cell: (m) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeMaterial(m.id)}
            title="Remove"
          >
            <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ];
}

export function MaterialLibrary({ headerExtras }: { headerExtras?: React.ReactNode } = {}) {
  const { materials, removeMaterial, resetToSeed } = useMaterialLibraryStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MaterialType>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials.filter((m) => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.grade.toLowerCase().includes(q)
      );
    });
  }, [materials, search, typeFilter]);

  const columns = useMemo(() => buildColumns(removeMaterial), [removeMaterial]);

  const summarySegments = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of filtered) {
      const label = MATERIAL_TYPE_LABELS[m.type];
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        key: label,
        label,
        value,
        color: SUMMARY_COLORS[i % SUMMARY_COLORS.length],
      }));
  }, [filtered]);

  const subtitle =
    filtered.length === materials.length
      ? `${materials.length} materials`
      : `${filtered.length} of ${materials.length} materials · filter active`;

  return (
    <PageShell>
      <PageHeader
        title="Material Library"
        subtitle={subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 border-[var(--border)]"
              onClick={resetToSeed}
            >
              <RotateCcw className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              Reset to seed
            </Button>
            <Button type="button" className="h-10 gap-2" disabled title="Inline editing in v2">
              <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              New material
            </Button>
            <p className="max-w-md rounded-[var(--shape-lg)] bg-[var(--neutral-100)] px-3 py-2 text-xs text-[var(--neutral-500)]">
              Source-of-truth for sheet, tube, RHS, angle, and bar stock used by{' '}
              <span className="font-medium">Product Studio</span>. Master data may also be managed in
              Control when connected.
            </p>
          </div>
        }
      />

      {headerExtras}

      <PageToolbar className="items-end">
        <div className="relative w-full sm:w-80 shrink-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-400)]"
            strokeWidth={1.5}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or grade…"
            className="h-10 rounded-[var(--shape-lg)] border-transparent bg-[var(--neutral-100)] pl-10 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | MaterialType)}>
          <SelectTrigger className="h-10 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToolbarSpacer />
        <span className="text-xs tabular-nums text-[var(--neutral-500)]">
          {filtered.length} of {materials.length}
        </span>
      </PageToolbar>

      {summarySegments.length > 0 ? (
        <ToolbarSummaryBar segments={summarySegments} formatValue={(v) => String(v)} />
      ) : null}

      <MwDataTable
        columns={columns}
        data={filtered}
        keyExtractor={(m) => m.id}
        emptyState={
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Package className="h-10 w-10 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">No materials match your filters.</p>
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">
        Inline editing and &quot;New material&quot; form land in the next pass. The store and types are
        already wired to support full CRUD — see{' '}
        <code className="rounded bg-[var(--neutral-100)] px-1 dark:bg-[var(--neutral-800)]">useMaterialLibraryStore</code>.
      </p>
    </PageShell>
  );
}
