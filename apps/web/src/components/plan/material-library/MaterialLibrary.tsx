/**
 * MaterialLibrary — list/table view of the material library entity.
 *
 * MVP scope: read seeded materials, search/filter, see key properties at a glance,
 * and trash/restore. Editing inline is v2; the goal here is for Product Studio's
 * Materials toolbox category to have something real to bind against.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Search, Plus, Trash2, RotateCcw, Layers, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--neutral-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--neutral-600)] dark:bg-[var(--neutral-50)] dark:text-[var(--muted-foreground)]">
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

/** Minimal create form — name/code/type/grade/cost map straight onto the store's addMaterial API. */
function NewMaterialDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addMaterial = useMaterialLibraryStore((s) => s.addMaterial);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<MaterialType>('sheet');
  const [grade, setGrade] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costUnit, setCostUnit] = useState<'per_kg' | 'per_m' | 'per_sheet'>('per_kg');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const gradeRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName('');
    setCode('');
    setType('sheet');
    setGrade('');
    setCostAmount('');
    setCostUnit('per_kg');
    setErrors({});
  };

  const handleCreate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!code.trim()) next.code = 'Code is required';
    if (!grade.trim()) next.grade = 'Grade is required';
    const amount = Number(costAmount);
    if (!costAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
      next.cost = 'Enter a cost greater than 0';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error('Please fix the highlighted fields');
      if (next.name) nameRef.current?.focus();
      else if (next.code) codeRef.current?.focus();
      else if (next.grade) gradeRef.current?.focus();
      else if (next.cost) costRef.current?.focus();
      return;
    }
    const created = addMaterial({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      grade: grade.trim(),
      densityKgM3: 7850,
      cost: { unit: costUnit, amount, currency: 'AUD' },
      stockSizes: [],
      thicknesses: [],
      compatibleFinishes: [],
      suppliers: [],
    });
    toast.success(`Material ${created.code} added`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New material</DialogTitle>
          <DialogDescription>
            Add a stock material to the master library. Stock sizes and suppliers can be added later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="new-material-name" className="text-xs text-[var(--neutral-500)]">Name</Label>
            <Input
              id="new-material-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mild Steel Sheet"
              aria-invalid={!!errors.name}
              className="mt-1 h-10"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="new-material-code" className="text-xs text-[var(--neutral-500)]">Code</Label>
            <Input
              id="new-material-code"
              ref={codeRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MS-SHT-3"
              aria-invalid={!!errors.code}
              className="mt-1 h-10 font-mono"
            />
            {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
          </div>
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as MaterialType)}>
              <SelectTrigger className="mt-1 h-10 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIAL_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-material-grade" className="text-xs text-[var(--neutral-500)]">Grade</Label>
            <Input
              id="new-material-grade"
              ref={gradeRef}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 304, 250MPa"
              aria-invalid={!!errors.grade}
              className="mt-1 h-10"
            />
            {errors.grade && <p className="mt-1 text-xs text-destructive">{errors.grade}</p>}
          </div>
          <div>
            <Label htmlFor="new-material-cost" className="text-xs text-[var(--neutral-500)]">Cost (AUD)</Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="new-material-cost"
                ref={costRef}
                type="number"
                min="0"
                step="0.01"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                placeholder="0.00"
                aria-invalid={!!errors.cost}
                className="h-10 tabular-nums"
              />
              <Select value={costUnit} onValueChange={(v) => setCostUnit(v as 'per_kg' | 'per_m' | 'per_sheet')}>
                <SelectTrigger className="h-10 w-28 shrink-0 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_kg">/kg</SelectItem>
                  <SelectItem value="per_m">/m</SelectItem>
                  <SelectItem value="per_sheet">/sheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.cost && <p className="mt-1 text-xs text-destructive">{errors.cost}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-10" onClick={handleCreate}>
            <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            Add material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MaterialLibrary({ headerExtras }: { headerExtras?: React.ReactNode } = {}) {
  const { materials, removeMaterial, resetToSeed } = useMaterialLibraryStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MaterialType>('all');
  const [newMaterialOpen, setNewMaterialOpen] = useState(false);

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
            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 border-[var(--border)]"
                onClick={resetToSeed}
              >
                <RotateCcw className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                Reset to seed
              </Button>
            )}
            <Button type="button" className="h-10 gap-2" onClick={() => setNewMaterialOpen(true)}>
              <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              New material
            </Button>
            <p className="max-w-md rounded-lg bg-[var(--neutral-100)] px-3 py-2 text-xs text-[var(--neutral-500)]">
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
            className="h-10 rounded-lg border-transparent bg-[var(--neutral-100)] pl-10 text-sm"
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

      <NewMaterialDialog open={newMaterialOpen} onOpenChange={setNewMaterialOpen} />
    </PageShell>
  );
}
