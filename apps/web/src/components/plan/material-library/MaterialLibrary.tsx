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
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMaterialLibraryStore } from '@/store/materialLibraryStore';
import { MATERIAL_TYPE_LABELS, type MaterialType } from '@/lib/material-library/types';

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--mw-yellow-500)]" />
            <h1 className="text-2xl font-bold text-foreground">Material Library</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Source-of-truth for sheet, tube, RHS, angle, and bar stock used by Product Studio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToSeed} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to seed
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" disabled title="Inline editing in v2">
            <Plus className="h-3.5 w-3.5" />
            New material
          </Button>
        </div>
      </div>

      {headerExtras}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or grade…"
            className="h-9 pl-8 text-xs"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | MaterialType)}>
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px]">
          {filtered.length} of {materials.length}
        </Badge>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] uppercase tracking-wider">Code</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Grade</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Density</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Cost</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Stock sizes</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Suppliers</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <Package className="mx-auto mb-2 h-10 w-10 text-[var(--neutral-400)]" />
                  <p className="text-sm text-muted-foreground">No materials match your filters.</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id} className="hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-900)]">
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{m.code}</TableCell>
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {MATERIAL_TYPE_LABELS[m.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{m.grade}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{m.densityKgM3} kg/m³</TableCell>
                  <TableCell className="text-[11px]">{formatCost(m.cost.amount, m.cost.currency, m.cost.unit)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-[11px] text-muted-foreground" title={formatStockSizes(m.stockSizes)}>
                    {formatStockSizes(m.stockSizes)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {m.suppliers.map((s) => s.name).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeMaterial(m.id)}
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-[10px] text-muted-foreground">
        Inline editing and "New material" form land in the next pass. The store and types are
        already wired to support full CRUD — see <code className="rounded bg-[var(--neutral-100)] px-1 dark:bg-[var(--neutral-800)]">useMaterialLibraryStore</code>.
      </p>
    </div>
  );
}
