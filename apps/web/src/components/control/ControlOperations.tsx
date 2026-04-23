/**
 * ControlOperations — atomic Standard Operations library.
 *
 * Source of truth for the operations a planner can pick from when authoring
 * a part's routing in Plan → Job → Production. The "Add op" picker on the
 * BomRoutingTree reads this list. Routes (Control → Routes) bundle these
 * operations into named templates.
 */

import { useMemo, useState } from 'react';
import { Layers, Search, Plus } from 'lucide-react';
import { motion } from 'motion/react';

import { operationsLibraryService, type StandardOperation } from '@/services';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export function ControlOperations() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

  const all = useMemo(() => operationsLibraryService.list(), []);
  const categories = useMemo(() => operationsLibraryService.categories(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((op) => {
      if (activeCategory !== 'all' && op.category !== activeCategory) return false;
      if (!q) return true;
      return (
        op.name.toLowerCase().includes(q) ||
        op.defaultWorkCentre.toLowerCase().includes(q) ||
        op.category?.toLowerCase().includes(q)
      );
    });
  }, [all, search, activeCategory]);

  const subcontractCount = all.filter((o) => o.isSubcontract).length;

  return (
    <PageShell>
      <PageHeader
        title="Operations"
        subtitle="Standard operation library — atomic units used in routings and routes"
        breadcrumbs={[
          { label: 'Control', href: '/control' },
          { label: 'Operations' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
              {all.length} operations
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              {subcontractCount} subcontract
            </Badge>
            <Button
              size="sm"
              className="h-9 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={() => toast('New operation form coming soon')}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New operation
            </Button>
          </div>
        }
      />

      <motion.div variants={staggerItem} className="space-y-4">
        {/* Filter bar */}
        <Card variant="flat" className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <Input
              placeholder="Search operations or work centres…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <div className="inline-flex flex-wrap rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-0.5 gap-0.5">
            <CategoryPill label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </Card>

        <Card variant="flat" className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Default work centre</TableHead>
                <TableHead className="text-right">Default minutes</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((op) => (
                <OperationRow key={op.id} op={op} />
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-[var(--neutral-500)] py-8">
                    No operations match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </PageShell>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-2.5 py-1 rounded-[var(--shape-sm)] text-xs font-medium transition-colors ' +
        (active
          ? 'bg-card text-foreground shadow-xs'
          : 'text-[var(--neutral-500)] hover:text-foreground')
      }
    >
      {label}
    </button>
  );
}

function OperationRow({ op }: { op: StandardOperation }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-foreground text-sm">{op.name}</div>
        {op.description && (
          <div className="text-xs text-[var(--neutral-500)]">{op.description}</div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{op.category ?? '—'}</Badge>
      </TableCell>
      <TableCell className="text-sm text-[var(--neutral-600)]">{op.defaultWorkCentre}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{op.defaultMinutes}m</TableCell>
      <TableCell>
        {op.isSubcontract ? (
          <StatusBadge variant="info">Subcontract</StatusBadge>
        ) : (
          <StatusBadge variant="neutral">In-house</StatusBadge>
        )}
      </TableCell>
    </TableRow>
  );
}
