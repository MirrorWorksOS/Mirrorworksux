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
import { useFinishLibraryStore } from '@/store/finishLibraryStore';
import { FINISH_TYPE_LABELS, type FinishType } from '@/lib/finish-library/types';

const TYPE_FILTER_OPTIONS: { value: 'all' | FinishType; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'powder_coat', label: 'Powder coat' },
  { value: 'galv', label: 'Galvanise' },
  { value: 'paint', label: 'Paint' },
  { value: 'anodise', label: 'Anodise' },
  { value: 'polish', label: 'Polish' },
  { value: 'passivate', label: 'Passivate' },
];

function formatCurrency(amount: number): string {
  return `AUD ${amount.toFixed(2)}`;
}

export function FinishLibrary() {
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--mw-yellow-500)]" />
            <h1 className="text-2xl font-bold text-foreground">Finish Library</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Source-of-truth for powder coat, galv, paint, anodise, polish, and passivate finishes
            referenced by Product Studio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToSeed} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to seed
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" disabled title="Inline editing in v2">
            <Plus className="h-3.5 w-3.5" />
            New finish
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or colour…"
            className="h-9 pl-8 text-xs"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | FinishType)}>
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
          {filtered.length} of {finishes.length}
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
              <TableHead className="text-[10px] uppercase tracking-wider">Colour</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Cost / m²</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Setup</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Lead</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Source</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Compat.</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center">
                  <Sparkles className="mx-auto mb-2 h-10 w-10 text-[var(--neutral-400)]" />
                  <p className="text-sm text-muted-foreground">No finishes match your filters.</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((f) => (
                <TableRow key={f.id} className="hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-900)]">
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{f.code}</TableCell>
                  <TableCell className="text-xs font-medium">{f.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {FINISH_TYPE_LABELS[f.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {f.colour ? (
                      <div className="flex items-center gap-1">
                        <span>{f.colour.name}</span>
                        <span className="text-[10px] opacity-60">({f.colour.ral})</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-[11px]">{formatCurrency(f.costPerM2)}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {f.setupCost > 0 ? formatCurrency(f.setupCost) : '—'}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{f.leadTimeDays} d</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {f.source === 'in_house' ? (
                        <>
                          <Building2 className="h-3 w-3" />
                          <span>In-house</span>
                        </>
                      ) : (
                        <>
                          <Truck className="h-3 w-3" />
                          <span>{f.subcontractor?.name ?? 'Subcontract'}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {f.compatibleMaterials.length} mat{f.compatibleMaterials.length === 1 ? '' : 's'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFinish(f.id)}
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
        Inline editing and "New finish" form land in the next pass. The store and types are
        already wired to support full CRUD — see <code className="rounded bg-[var(--neutral-100)] px-1 dark:bg-[var(--neutral-800)]">useFinishLibraryStore</code>.
      </p>
    </div>
  );
}
