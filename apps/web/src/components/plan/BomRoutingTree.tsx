/**
 * BomRoutingTree — Integrated BOM + routing view for Plan → Job and Make → MO.
 *
 * Inspired by Fulcrum Pro / Global Shop Solutions' "Routing BOM" screens:
 * a single tree where every part shows its material inputs AND the sequence
 * of operations that produce it — no more tab-hopping between BOM and routing.
 *
 * Plan mode lets the planner add/edit/reorder rows; Make mode is read-only and
 * shows live op status. Drag-and-drop reorder uses react-dnd; the "Add op"
 * picker reads from the Control → Operations Library service.
 */

import { useMemo, useState } from 'react';
import {
  ChevronRight, Cog, ShoppingCart, FileText, Search,
  Plus, Rows3, ListTree, Download, GripVertical, Route,
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { IconWell } from '@/components/shared/icons/IconWell';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PartThumbnail } from '@/components/shared/product/PartThumbnail';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/components/ui/utils';
import {
  operationsLibraryService,
  routesLibraryService,
  type StandardOperation,
  type StandardRoute,
} from '@/services';
import type {
  AssemblyNode, OperationNode, OperationStatus, PartNode,
} from './BomRoutingTree.types';

type Mode = 'plan' | 'make';
type Density = 'tree' | 'table';
type KindFilter = 'all' | 'make' | 'buy';

interface BomRoutingTreeProps {
  assembly: AssemblyNode;
  mode?: Mode;
  defaultExpandedPartIds?: string[];
  className?: string;
}

const formatCurrency = (n: number) =>
  n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

const statusDot: Record<OperationStatus, string> = {
  done: 'bg-[var(--mw-green)]',
  in_progress: 'bg-[var(--mw-yellow-400)]',
  pending: 'bg-[var(--neutral-300)]',
};

const statusText: Record<OperationStatus, string> = {
  done: 'Done',
  in_progress: 'In progress',
  pending: 'Pending',
};

const OP_DND_TYPE = 'bom-routing-op';

/** Shape carried by react-dnd while dragging an op chip. */
interface OpDragItem {
  partId: string;
  index: number;
}

export function BomRoutingTree(props: BomRoutingTreeProps) {
  // Wrap in a feature-local DndProvider so the tree works regardless of host page.
  return (
    <DndProvider backend={HTML5Backend}>
      <BomRoutingTreeInner {...props} />
    </DndProvider>
  );
}

function BomRoutingTreeInner({
  assembly,
  mode = 'plan',
  defaultExpandedPartIds,
  className,
}: BomRoutingTreeProps) {
  const [density, setDensity] = useState<Density>('tree');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedOp, setSelectedOp] = useState<{ op: OperationNode; part: PartNode } | null>(null);

  // Local mutable copy of parts so reorder / add-op survive within the session.
  // Production wiring would push back through planService.
  const [parts, setParts] = useState<PartNode[]>(assembly.parts);

  const firstMakeId = parts.find((p) => p.kind === 'make')?.id;
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const defaults = defaultExpandedPartIds ?? (firstMakeId ? [firstMakeId] : []);
    return defaults.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  const filteredParts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parts.filter((p) => {
      if (kindFilter !== 'all' && p.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.operations?.some((o) => o.name.toLowerCase().includes(q) || o.workCentre.toLowerCase().includes(q))
      );
    });
  }, [parts, kindFilter, search]);

  const totals = useMemo(() => {
    const makeParts = parts.filter((p) => p.kind === 'make');
    const buyParts = parts.filter((p) => p.kind === 'buy');
    const ops = makeParts.flatMap((p) => p.operations ?? []);
    const totalMinutes = ops.reduce((s, o) => s + o.minutes, 0);
    const opsDone = ops.filter((o) => o.status === 'done').length;
    return {
      makeCount: makeParts.length,
      buyCount: buyParts.length,
      opCount: ops.length,
      totalMinutes,
      opsDone,
    };
  }, [parts]);

  const readonly = mode === 'make';

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /** Re-sequence ops 1..n after a reorder / add. */
  const renumber = (ops: OperationNode[]): OperationNode[] =>
    ops.map((op, i) => ({ ...op, sequence: i + 1 }));

  const reorderOps = (partId: string, from: number, to: number) => {
    if (from === to) return;
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId || !p.operations) return p;
        const next = [...p.operations];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...p, operations: renumber(next) };
      }),
    );
  };

  const addOpFromLibrary = (partId: string, std: StandardOperation) => {
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        const ops = p.operations ?? [];
        const newOp: OperationNode = {
          id: `op-${partId}-${Date.now()}`,
          sequence: ops.length + 1,
          name: std.name,
          workCentre: std.defaultWorkCentre,
          minutes: std.defaultMinutes,
          status: 'pending',
          subcontract: std.isSubcontract,
        };
        return { ...p, operations: [...ops, newOp] };
      }),
    );
  };

  const applyRoute = (partId: string, route: StandardRoute) => {
    const resolved = routesLibraryService.resolve(route);
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        const existing = p.operations ?? [];
        const startSeq = existing.length;
        const additions: OperationNode[] = resolved.map((step, i) => ({
          id: `op-${partId}-${Date.now()}-${i}`,
          sequence: startSeq + i + 1,
          name: step.operation.name,
          workCentre: step.operation.defaultWorkCentre,
          minutes: step.minutesOverride ?? step.operation.defaultMinutes,
          status: 'pending',
          subcontract: step.operation.isSubcontract,
        }));
        return { ...p, operations: [...existing, ...additions] };
      }),
    );
  };

  return (
    <>
      <Card className={cn('border border-[var(--neutral-200)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden', className)}>
        {/* ---------------------------------------------- Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <IconWell icon={ListTree} surface="onLight" size="sm" />
            <div>
              <h2 className="text-base font-medium text-foreground leading-tight">
                {readonly ? 'Routing & inputs' : 'Assembly structure & routing'}
              </h2>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                {totals.makeCount} made · {totals.buyCount} bought ·{' '}
                {totals.opCount} operations ·{' '}
                {(totals.totalMinutes / 60).toFixed(1)}h total{readonly && ` · ${totals.opsDone}/${totals.opCount} ops done`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Kind filter */}
            <div className="inline-flex rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-0.5">
              {(['all', 'make', 'buy'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKindFilter(k)}
                  className={cn(
                    'px-2.5 py-1 rounded-[var(--shape-sm)] text-xs font-medium capitalize transition-colors',
                    kindFilter === k
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-[var(--neutral-500)] hover:text-foreground',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <Input
                placeholder="Find part or operation…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-10 w-56 border-[var(--border)] text-xs"
              />
            </div>

            {/* Density toggle (plan only) */}
            {!readonly && (
              <div className="inline-flex rounded-[var(--shape-md)] bg-[var(--neutral-100)] p-0.5">
                <button
                  type="button"
                  onClick={() => setDensity('tree')}
                  aria-label="Tree view"
                  className={cn(
                    'px-2 py-1 rounded-[var(--shape-sm)] transition-colors',
                    density === 'tree' ? 'bg-card shadow-xs' : 'text-[var(--neutral-500)] hover:text-foreground',
                  )}
                >
                  <ListTree className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('table')}
                  aria-label="Table view"
                  className={cn(
                    'px-2 py-1 rounded-[var(--shape-sm)] transition-colors',
                    density === 'table' ? 'bg-card shadow-xs' : 'text-[var(--neutral-500)] hover:text-foreground',
                  )}
                >
                  <Rows3 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------- Assembly summary (light) */}
        <div className="px-6 py-4 bg-[var(--neutral-50)] border-b border-[var(--border)] flex items-center gap-4">
          <PartThumbnail
            imageUrl={assembly.imageUrl}
            alt={assembly.name}
            size="lg"
            fallbackIcon={Cog}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{assembly.name}</p>
            <p className="text-xs text-[var(--neutral-500)] tabular-nums">{assembly.partNumber}</p>
          </div>
          <div className="flex items-center gap-6 text-xs tabular-nums">
            <div className="text-right">
              <p className="text-[var(--neutral-500)]">Qty</p>
              <p className="text-sm font-medium text-foreground">{assembly.qty}</p>
            </div>
            <div className="text-right">
              <p className="text-[var(--neutral-500)]">Value</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(assembly.cost)}</p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------- Body */}
        {density === 'table' ? (
          <PartsTable parts={filteredParts} />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredParts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                open={Boolean(expanded[part.id])}
                onToggle={() => toggle(part.id)}
                onOpClick={(op) => setSelectedOp({ op, part })}
                onReorderOp={(from, to) => reorderOps(part.id, from, to)}
                onAddOp={(std) => addOpFromLibrary(part.id, std)}
                onApplyRoute={(route) => applyRoute(part.id, route)}
                readonly={readonly}
              />
            ))}
            {filteredParts.length === 0 && (
              <div className="px-6 py-8 text-center text-xs text-[var(--neutral-500)]">
                No parts match this filter.
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------- Footer */}
        {!readonly && density === 'tree' && (
          <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--neutral-50)] flex items-center justify-between">
            <p className="text-xs text-[var(--neutral-500)]">
              {totals.opCount} operations · {(totals.totalMinutes / 60).toFixed(1)}h scheduled across {totals.makeCount} made parts
            </p>
            <Button size="sm" className="h-10 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add part
            </Button>
          </div>
        )}
      </Card>

      {/* ---------------------------------------------- Op side-drawer */}
      <Sheet open={Boolean(selectedOp)} onOpenChange={(v) => !v && setSelectedOp(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          {selectedOp && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-white text-xs font-medium tabular-nums">
                    {selectedOp.op.sequence}
                  </span>
                  {selectedOp.op.name}
                </SheetTitle>
                <SheetDescription>
                  {selectedOp.part.name} · {selectedOp.part.partNumber}
                </SheetDescription>
              </SheetHeader>

              <div className="p-6 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    variant={
                      selectedOp.op.status === 'done'
                        ? 'success'
                        : selectedOp.op.status === 'in_progress'
                          ? 'accent'
                          : 'neutral'
                    }
                    withDot
                  >
                    {statusText[selectedOp.op.status]}
                  </StatusBadge>
                  {selectedOp.op.subcontract && (
                    <Badge variant="outline" className="border-[var(--border)]">Subcontract</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[var(--neutral-500)]">Work centre</p>
                    <p className="font-medium text-foreground">{selectedOp.op.workCentre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)]">Operator</p>
                    <p className="font-medium text-foreground">{selectedOp.op.operator ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)]">Planned minutes</p>
                    <p className="font-medium text-foreground tabular-nums">{selectedOp.op.minutes} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)]">Sequence</p>
                    <p className="font-medium text-foreground tabular-nums">Op {selectedOp.op.sequence} of {selectedOp.part.operations?.length ?? 0}</p>
                  </div>
                </div>

                {selectedOp.op.instructionsFile && (
                  <div className="rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-4">
                    <p className="text-xs text-[var(--neutral-500)] mb-2">Instruction file</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-[var(--mw-blue)] shrink-0" />
                        <span className="text-sm font-medium truncate">{selectedOp.op.instructionsFile}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-10 border-[var(--border)]">
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                      </Button>
                    </div>
                  </div>
                )}

                {readonly ? (
                  <Button className="w-full h-12 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground">
                    Log time / update status
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-10 border-[var(--border)]">Edit op</Button>
                    <Button variant="outline" className="flex-1 h-10 border-[var(--border)] text-[var(--mw-error)]">Remove</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ---------------------------------------------- Subcomponents */

interface PartRowProps {
  part: PartNode;
  open: boolean;
  onToggle: () => void;
  onOpClick: (op: OperationNode) => void;
  onReorderOp: (from: number, to: number) => void;
  onAddOp: (std: StandardOperation) => void;
  onApplyRoute: (route: StandardRoute) => void;
  readonly: boolean;
}

function PartRow({
  part, open, onToggle, onOpClick, onReorderOp, onAddOp, onApplyRoute, readonly,
}: PartRowProps) {
  const isBuy = part.kind === 'buy';
  const opsDone = part.operations?.filter((o) => o.status === 'done').length ?? 0;
  const opsTotal = part.operations?.length ?? 0;
  const progressPct = opsTotal ? Math.round((opsDone / opsTotal) * 100) : 0;

  const content = (
    <>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full px-6 py-3.5 flex items-center gap-3 hover:bg-[var(--neutral-50)] transition-colors text-left group"
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 text-[var(--neutral-400)] transition-transform shrink-0',
              open && 'rotate-90',
              isBuy && 'opacity-0',
            )}
          />
          <PartThumbnail
            imageUrl={part.imageUrl}
            alt={part.name}
            size="md"
            fallbackIcon={isBuy ? ShoppingCart : undefined}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{part.name}</span>
              <span className="text-xs text-[var(--neutral-500)] tabular-nums">{part.partNumber}</span>
              {part.material && (
                <span className="text-xs text-[var(--neutral-500)]">· {part.material}</span>
              )}
              {part.supplier && (
                <span className="text-xs text-[var(--neutral-500)]">· from {part.supplier}</span>
              )}
            </div>
            {!isBuy && opsTotal > 0 && (
              <div className="flex items-center gap-3 mt-1.5">
                <div className="h-1 bg-[var(--neutral-100)] rounded-full overflow-hidden w-40">
                  <div
                    className="h-full bg-[var(--mw-green)] transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--neutral-500)] tabular-nums">
                  {opsDone}/{opsTotal} ops
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs tabular-nums text-[var(--neutral-600)]">
              Qty {part.qty}
            </span>
            <StatusBadge
              variant={isBuy ? 'info' : 'accent'}
              className="uppercase tracking-wide text-[10px]"
            >
              {isBuy ? 'Buy' : 'Make'}
            </StatusBadge>
            {!readonly && !isBuy && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full',
                  part.ncReady
                    ? 'bg-[var(--mw-success-light)] text-[var(--mw-success)]'
                    : 'bg-[var(--mw-error-light)] text-[var(--mw-error)]',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', part.ncReady ? 'bg-[var(--mw-success)]' : 'bg-[var(--mw-error)]')} />
                NC {part.ncReady ? 'ready' : 'missing'}
              </span>
            )}
            <span className="text-sm tabular-nums font-medium text-foreground w-20 text-right">
              {formatCurrency(part.cost)}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-5 pt-1 pl-[3.75rem] space-y-3">
          {/* Material inputs */}
          {part.inputs && part.inputs.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)] mb-1.5">
                Material inputs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {part.inputs.map((input) => (
                  <span
                    key={input.id}
                    className="inline-flex items-center gap-1.5 rounded-[var(--shape-sm)] border border-[var(--border)] bg-[var(--neutral-50)] px-2.5 py-1 text-xs"
                  >
                    <span className="text-foreground">{input.name}</span>
                    {input.spec && <span className="text-[var(--neutral-500)]">· {input.spec}</span>}
                    <span className="text-[var(--neutral-500)] tabular-nums">· {input.qty} {input.uom}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operation strip */}
          {part.operations && part.operations.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)] mb-1.5">
                Operations
              </p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {part.operations.map((op, idx) => (
                  <OpChip
                    key={op.id}
                    op={op}
                    index={idx}
                    partId={part.id}
                    isLast={idx === (part.operations?.length ?? 0) - 1}
                    readonly={readonly}
                    onClick={() => onOpClick(op)}
                    onReorder={onReorderOp}
                  />
                ))}
                {!readonly && (
                  <>
                    <AddOpButton onAdd={onAddOp} />
                    <ApplyRouteButton onApply={onApplyRoute} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* No-ops state — first-time planners need an obvious entry point */}
          {!readonly && (!part.operations || part.operations.length === 0) && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)] mb-1.5">
                Operations
              </p>
              <div className="flex flex-wrap gap-1.5 items-center">
                <AddOpButton onAdd={onAddOp} />
                <ApplyRouteButton onApply={onApplyRoute} />
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </>
  );

  if (isBuy) {
    // Buy parts: no collapsible body — render a static row
    return (
      <div className="w-full px-6 py-3.5 flex items-center gap-3 hover:bg-[var(--neutral-50)] transition-colors">
        <span className="w-4 shrink-0" aria-hidden />
        <PartThumbnail imageUrl={part.imageUrl} alt={part.name} size="md" fallbackIcon={ShoppingCart} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{part.name}</span>
            <span className="text-xs text-[var(--neutral-500)] tabular-nums">{part.partNumber}</span>
            {part.supplier && (
              <span className="text-xs text-[var(--neutral-500)]">· from {part.supplier}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs tabular-nums text-[var(--neutral-600)]">Qty {part.qty}</span>
          <StatusBadge variant="info" className="uppercase tracking-wide text-[10px]">Buy</StatusBadge>
          <span className="text-sm tabular-nums font-medium text-foreground w-20 text-right">
            {formatCurrency(part.cost)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      {content}
    </Collapsible>
  );
}

/* ---------------------------------------------- Op chip (draggable) */

interface OpChipProps {
  op: OperationNode;
  index: number;
  partId: string;
  isLast: boolean;
  readonly: boolean;
  onClick: () => void;
  onReorder: (from: number, to: number) => void;
}

function OpChip({ op, index, partId, isLast, readonly, onClick, onReorder }: OpChipProps) {
  const [, drop] = useDrop<OpDragItem>(
    () => ({
      accept: OP_DND_TYPE,
      canDrop: (dragged) => dragged.partId === partId,
      hover(dragged) {
        if (readonly || dragged.partId !== partId || dragged.index === index) return;
        onReorder(dragged.index, index);
        dragged.index = index;
      },
    }),
    [index, partId, onReorder, readonly],
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: OP_DND_TYPE,
      item: { partId, index },
      canDrag: !readonly,
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [partId, index, readonly],
  );

  return (
    <>
      <div
        ref={readonly ? undefined : drop}
        className={cn(
          'inline-flex items-center group/op',
          isDragging && 'opacity-40',
        )}
      >
        <button
          ref={readonly ? undefined : drag}
          type="button"
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-2 rounded-[var(--shape-sm)] border px-2.5 py-1.5 text-xs transition-colors',
            op.status === 'in_progress'
              ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/10'
              : op.status === 'done'
                ? 'border-[var(--mw-green)]/30 bg-[var(--mw-green)]/5'
                : 'border-[var(--border)] bg-card hover:bg-[var(--neutral-50)]',
            !readonly && 'cursor-grab active:cursor-grabbing',
          )}
        >
          {!readonly && (
            <GripVertical
              className="h-3 w-3 text-[var(--neutral-300)] opacity-0 group-hover/op:opacity-100 transition-opacity -ml-0.5"
              aria-hidden
            />
          )}
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-white text-[10px] font-medium tabular-nums">
            {op.sequence}
          </span>
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot[op.status])} />
          <span className="font-medium text-foreground">{op.name}</span>
          <span className="text-[var(--neutral-500)]">· {op.workCentre}</span>
          <span className="text-[var(--neutral-500)] tabular-nums">· {op.minutes}m</span>
          {op.subcontract && (
            <span className="text-[10px] uppercase tracking-wider text-[var(--mw-amber)]">· sub</span>
          )}
        </button>
      </div>
      {!isLast && (
        <ChevronRight className="h-3 w-3 text-[var(--neutral-300)] -mx-0.5 shrink-0" aria-hidden />
      )}
    </>
  );
}

/* ---------------------------------------------- Add op picker */

function AddOpButton({ onAdd }: { onAdd: (std: StandardOperation) => void }) {
  const [open, setOpen] = useState(false);
  const library = useMemo(() => operationsLibraryService.list(), []);
  const grouped = useMemo(() => {
    const byCategory: Record<string, StandardOperation[]> = {};
    library.forEach((op) => {
      const key = op.category ?? 'Other';
      (byCategory[key] ??= []).push(op);
    });
    return byCategory;
  }, [library]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--shape-sm)] border border-dashed border-[var(--border)] bg-transparent px-2.5 py-1.5 text-xs text-[var(--neutral-500)] hover:border-[var(--mw-yellow-400)] hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" /> Add op
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-72">
        <Command>
          <CommandInput placeholder="Search operations…" className="h-9" />
          <CommandList className="max-h-80">
            <CommandEmpty>No operations found.</CommandEmpty>
            {Object.entries(grouped).map(([category, ops]) => (
              <CommandGroup key={category} heading={category}>
                {ops.map((op) => (
                  <CommandItem
                    key={op.id}
                    value={`${op.name} ${op.defaultWorkCentre}`}
                    onSelect={() => {
                      onAdd(op);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{op.name}</p>
                      <p className="text-[10px] text-[var(--neutral-500)] truncate">
                        {op.defaultWorkCentre} · {op.defaultMinutes}m
                        {op.isSubcontract && ' · subcontract'}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        <div className="border-t border-[var(--border)] px-3 py-2 text-[10px] text-[var(--neutral-500)] flex items-center justify-between">
          <span>From Control → Operations</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------------------------- Apply route */

function ApplyRouteButton({ onApply }: { onApply: (route: StandardRoute) => void }) {
  const [open, setOpen] = useState(false);
  const routes = useMemo(() => routesLibraryService.list(), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--shape-sm)] border border-dashed border-[var(--border)] bg-transparent px-2.5 py-1.5 text-xs text-[var(--neutral-500)] hover:border-[var(--mw-blue)] hover:text-foreground transition-colors"
        >
          <Route className="h-3 w-3" /> Apply route…
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-80">
        <Command>
          <CommandInput placeholder="Search routes…" className="h-9" />
          <CommandList className="max-h-80">
            <CommandEmpty>No routes found.</CommandEmpty>
            <CommandGroup heading="Standard routes">
              {routes.map((route) => (
                <CommandItem
                  key={route.id}
                  value={`${route.name} ${route.category ?? ''}`}
                  onSelect={() => {
                    onApply(route);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start gap-0.5"
                >
                  <p className="text-sm font-medium">{route.name}</p>
                  {route.description && (
                    <p className="text-[10px] text-[var(--neutral-500)]">{route.description}</p>
                  )}
                  <p className="text-[10px] text-[var(--neutral-400)] tabular-nums">{route.steps.length} ops</p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="border-t border-[var(--border)] px-3 py-2 text-[10px] text-[var(--neutral-500)] flex items-center justify-between">
          <span>From Control → Routes</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PartsTable({ parts }: { parts: PartNode[] }) {
  const allOps = parts.flatMap((p) =>
    (p.operations ?? []).map((op) => ({ part: p, op })),
  );

  return (
    <div>
      <div className="px-6 py-3 bg-[var(--neutral-100)] border-b border-[var(--border)]">
        <div className="grid grid-cols-12 gap-3 items-center text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
          <div className="col-span-3">Part</div>
          <div className="col-span-1">#</div>
          <div className="col-span-3">Operation</div>
          <div className="col-span-2">Work centre</div>
          <div className="col-span-1">Minutes</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Instructions</div>
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {allOps.map(({ part, op }) => (
          <div key={`${part.id}-${op.id}`} className="px-6 py-3 grid grid-cols-12 gap-3 items-center text-xs">
            <div className="col-span-3 truncate font-medium text-foreground">{part.name}</div>
            <div className="col-span-1 tabular-nums text-[var(--neutral-500)]">{op.sequence}</div>
            <div className="col-span-3 text-foreground">{op.name}</div>
            <div className="col-span-2 text-[var(--neutral-600)]">{op.workCentre}</div>
            <div className="col-span-1 tabular-nums">{op.minutes}</div>
            <div className="col-span-1">
              <StatusBadge
                variant={
                  op.status === 'done'
                    ? 'success'
                    : op.status === 'in_progress'
                      ? 'accent'
                      : 'neutral'
                }
                withDot
              >
                {statusText[op.status]}
              </StatusBadge>
            </div>
            <div className="col-span-1 text-right">
              {op.instructionsFile ? (
                <button className="inline-flex items-center gap-1 text-[var(--mw-blue)] hover:underline">
                  <FileText className="h-3.5 w-3.5" /> Open
                </button>
              ) : (
                <span className="text-[var(--neutral-400)]">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
