/**
 * FinishLibrary — list/table view of the finish library entity.
 *
 * MVP scope: read seeded finishes, search/filter, see key properties at a glance,
 * and trash/restore. Editing inline is v2; the goal here is for Product Studio's
 * Finishes toolbox category to have something real to bind against.
 */

import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, RotateCcw, Sparkles, Truck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinishLibraryStore } from '@/store/finishLibraryStore';
import { FINISH_TYPE_LABELS, type Finish, type FinishType } from '@/lib/finish-library/types';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';

const TYPE_FILTER_OPTIONS: { value: 'all' | FinishType; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'powder_coat', label: 'Powder coat' },
  { value: 'galv', label: 'Galvanise' },
  { value: 'paint', label: 'Paint' },
  { value: 'anodise', label: 'Anodise' },
  { value: 'polish', label: 'Polish' },
  { value: 'passivate', label: 'Passivate' },
];

const SUMMARY_COLORS = [
  'var(--mw-yellow-400)',
  'var(--mw-mirage)',
  'var(--neutral-400)',
  'var(--mw-yellow-600)',
  'var(--neutral-300)',
];

function formatCurrency(amount: number): string {
  return `AUD ${amount.toFixed(2)}`;
}

function buildColumns(removeFinish: (id: string) => void): MwColumnDef<Finish>[] {
  return [
    {
      key: 'code',
      header: 'Code',
      tooltip: 'Finish code',
      className: 'font-mono text-xs tabular-nums text-[var(--neutral-500)]',
      cell: (f) => f.code,
    },
    {
      key: 'name',
      header: 'Name',
      tooltip: 'Finish name',
      cell: (f) => (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" strokeWidth={1.5} />
          <span className="font-medium text-foreground">{f.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      tooltip: 'Finish process',
      cell: (f) => (
        <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--neutral-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--neutral-600)] dark:bg-[var(--neutral-900)] dark:text-[var(--neutral-400)]">
          {FINISH_TYPE_LABELS[f.type]}
        </span>
      ),
    },
    {
      key: 'colour',
      header: 'Colour',
      tooltip: 'Colour name and RAL',
      className: 'text-[var(--neutral-500)]',
      cell: (f) =>
        f.colour ? (
          <div className="flex items-center gap-1">
            <span>{f.colour.name}</span>
            <span className="text-xs opacity-60">({f.colour.ral})</span>
          </div>
        ) : (
          '—'
        ),
    },
    {
      key: 'cost',
      header: 'Cost / m²',
      tooltip: 'Cost per square metre',
      headerClassName: 'text-right',
      className: 'text-right tabular-nums',
      cell: (f) => formatCurrency(f.costPerM2),
    },
    {
      key: 'setup',
      header: 'Setup',
      tooltip: 'Setup charge',
      headerClassName: 'text-right',
      className: 'text-right tabular-nums text-[var(--neutral-500)]',
      cell: (f) => (f.setupCost > 0 ? formatCurrency(f.setupCost) : '—'),
    },
    {
      key: 'lead',
      header: 'Lead',
      tooltip: 'Lead time (days)',
      headerClassName: 'text-right',
      className: 'text-right tabular-nums text-[var(--neutral-500)]',
      cell: (f) => `${f.leadTimeDays} d`,
    },
    {
      key: 'source',
      header: 'Source',
      tooltip: 'In-house or subcontract',
      className: 'text-[var(--neutral-500)]',
      cell: (f) => (
        <div className="flex items-center gap-1.5 text-sm">
          {f.source === 'in_house' ? (
            <>
              <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>In-house</span>
            </>
          ) : (
            <>
              <Truck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>{f.subcontractor?.name ?? 'Subcontract'}</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'compat',
      header: 'Compat.',
      tooltip: 'Compatible materials',
      headerClassName: 'text-right',
      className: 'text-right tabular-nums text-[var(--neutral-500)]',
      cell: (f) => `${f.compatibleMaterials.length} mat${f.compatibleMaterials.length === 1 ? '' : 's'}`,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-[1%] whitespace-nowrap',
      className: 'w-[1%] whitespace-nowrap',
      cell: (f) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeFinish(f.id)}
            title="Remove"
          >
            <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ];
}

export function FinishLibrary({ headerExtras }: { headerExtras?: React.ReactNode } = {}) {
  const { finishes, removeFinish, resetToSeed } = useFinishLibraryStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | FinishType>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return finishes.filter((f) => {
      if (typeFilter !== 'all' && f.type !== typeFilter) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        (f.colour?.name?.toLowerCase().includes(q) ?? false) ||
        (f.colour?.ral?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [finishes, search, typeFilter]);

  const columns = useMemo(() => buildColumns(removeFinish), [removeFinish]);

  const summarySegments = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of filtered) {
      const label = FINISH_TYPE_LABELS[f.type];
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
    filtered.length === finishes.length
      ? `${finishes.length} finishes`
      : `${filtered.length} of ${finishes.length} finishes · filter active`;

  return (
    <PageShell>
      <PageHeader
        title="Finish Library"
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
              New finish
            </Button>
            <p className="max-w-md rounded-[var(--shape-lg)] bg-[var(--neutral-100)] px-3 py-2 text-xs text-[var(--neutral-500)]">
              Powder coat, galv, paint, anodise, polish, and passivate definitions for{' '}
              <span className="font-medium">Product Studio</span>. Tie-ins to Control when connected.
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
            placeholder="Search by name, code, or colour…"
            className="h-10 rounded-[var(--shape-lg)] border-transparent bg-[var(--neutral-100)] pl-10 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | FinishType)}>
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
          {filtered.length} of {finishes.length}
        </span>
      </PageToolbar>

      {summarySegments.length > 0 ? (
        <ToolbarSummaryBar segments={summarySegments} formatValue={(v) => String(v)} />
      ) : null}

      <MwDataTable
        columns={columns}
        data={filtered}
        keyExtractor={(f) => f.id}
        emptyState={
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Sparkles className="h-10 w-10 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">No finishes match your filters.</p>
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">
        Inline editing and &quot;New finish&quot; form land in the next pass. The store and types are
        already wired to support full CRUD — see{' '}
        <code className="rounded bg-[var(--neutral-100)] px-1 dark:bg-[var(--neutral-800)]">useFinishLibraryStore</code>.
      </p>
    </PageShell>
  );
}
