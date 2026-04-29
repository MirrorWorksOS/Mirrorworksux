/**
 * Visual rule workspace — palette (react-dnd) + nested block tree + variable definitions.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  GitBranch,
  Layers,
  Variable,
  Table2,
  Package,
  Pencil,
  Cog,
  DollarSign,
  AlertTriangle,
  Trash2,
  Plus,
  GripVertical,
  Info,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/utils';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { createEmptyEngine } from '@/lib/product-studio/evaluate';
import type { Product } from '@/components/plan/product-studio/product-studio-types';
import type {
  EngineBlock,
  EngineCompareOp,
  EngineVariableDef,
  LookupTableDef,
  ProductDefinitionEngine,
} from '@/lib/product-studio/types';
import {
  appendToBranchChildren,
  createStubBlock,
  deepRegenerateIds,
  removeBlockByIdAnywhere,
  replaceBlockById,
  RULE_PALETTE_DND_TYPE,
  type PaletteKind,
} from './rule-workspace-utils';

type PaletteCategory = 'logic' | 'variables' | 'outputs';

const PALETTE_GROUPS: {
  id: PaletteCategory;
  label: string;
  items: { kind: PaletteKind; label: string; hint: string; icon: React.ElementType }[];
}[] = [
  {
    id: 'logic',
    label: 'Logic',
    items: [
      { kind: 'if_chain', label: 'When / otherwise', hint: 'If this is true, run the blocks inside; otherwise try the next branch or the final “otherwise” branch.', icon: GitBranch },
      { kind: 'sequence', label: 'Group (run in order)', hint: 'Runs nested blocks one after another.', icon: Layers },
    ],
  },
  {
    id: 'variables',
    label: 'Variables',
    items: [
      { kind: 'set_literal', label: 'Set value', hint: 'Store a fixed text or number in a derived variable.', icon: Variable },
      { kind: 'set_lookup', label: 'Look up in table', hint: 'Set a variable from a key → value table (e.g. load rating → sheet thickness).', icon: Table2 },
    ],
  },
  {
    id: 'outputs',
    label: 'Outputs',
    items: [
      { kind: 'bom_phantom', label: 'Add BOM line', hint: 'Add a part that is not on the canvas (phantom line).', icon: Package },
      { kind: 'bom_override', label: 'Change canvas line', hint: 'Hide a node or change quantity from the canvas BOM.', icon: Pencil },
      { kind: 'operation', label: 'Add operation', hint: 'Add a routing step with setup and run time.', icon: Cog },
      { kind: 'cost_adjust', label: 'Adjust cost', hint: 'Add material, labour, machine, overhead, or margin.', icon: DollarSign },
      { kind: 'warning', label: 'Show warning', hint: 'Show a message in the configuration preview.', icon: AlertTriangle },
    ],
  },
];

function PaletteDraggable({
  kind,
  label,
  hint,
  icon: Icon,
  disabled,
}: {
  kind: PaletteKind;
  label: string;
  hint: string;
  icon: React.ElementType;
  disabled?: boolean;
}) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RULE_PALETTE_DND_TYPE,
      item: { kind },
      canDrag: !disabled,
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [kind, disabled],
  );

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      title={hint}
      className={cn(
        'flex min-h-12 w-full cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left shadow-[var(--elevation-0)] transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
        'hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-[var(--neutral-100)] hover:shadow-[var(--elevation-2)] active:cursor-grabbing',
        disabled && 'pointer-events-none cursor-not-allowed opacity-40',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--neutral-100)] text-[var(--neutral-600)] dark:bg-neutral-800 dark:text-neutral-300">
        <Icon className="h-4 w-4 text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{label}</p>
        <p className="line-clamp-2 text-[10px] text-[var(--neutral-500)]">{hint}</p>
      </div>
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]" aria-hidden />
    </div>
  );
}

function BranchDropZone({
  blockId,
  branchId,
  onDropKind,
  disabled,
}: {
  blockId: string;
  branchId: string;
  onDropKind: (kind: PaletteKind, path: { blockId: string; branchId: string }) => void;
  disabled?: boolean;
}) {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: RULE_PALETTE_DND_TYPE,
      drop: (item: { kind?: PaletteKind }) => {
        if (disabled || !item.kind) return;
        onDropKind(item.kind, { blockId, branchId });
      },
      canDrop: () => !disabled,
      collect: (m) => ({ isOver: m.isOver() && m.canDrop() }),
    }),
    [blockId, branchId, onDropKind, disabled],
  );

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        'min-h-[40px] rounded-lg border border-dashed text-[10px] text-muted-foreground flex items-center justify-center py-2',
        isOver ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/5' : 'border-[var(--neutral-200)]',
      )}
    >
      Drop blocks inside this branch
    </div>
  );
}

function BlockEditor({
  block,
  engine,
  product,
  onChange,
  onDelete,
  depth,
  onDropInBranch,
}: {
  block: EngineBlock;
  engine: ProductDefinitionEngine;
  product: Product;
  onChange: (b: EngineBlock) => void;
  onDelete: () => void;
  depth: number;
  onDropInBranch: (kind: PaletteKind, path: { blockId: string; branchId: string }) => void;
}) {
  const varOpts = engine.variables.map((v) => ({ id: v.id, label: v.label }));
  const tableOpts = engine.lookupTables.map((t) => ({ id: t.id, label: t.label }));
  const nodeOpts = product.nodes.map((n) => ({ id: n.id, label: n.name }));

  const row = (children: React.ReactNode) => (
    <div
      className={cn(
        'rounded-lg border border-[var(--neutral-200)] bg-[var(--neutral-50)]/80 p-2 space-y-2',
        depth > 0 && 'ml-3 border-l-2 border-l-[var(--mw-yellow-400)]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <GripVertical className="w-3 h-3 opacity-40" />
          {block.type.replace(/_/g, ' ')}
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>
      {children}
    </div>
  );

  if (block.type === 'sequence') {
    return row(
      <div className="space-y-2">
        {block.children.map((ch) => (
          <BlockEditor
            key={ch.id}
            block={ch}
            engine={engine}
            product={product}
            onChange={(next) =>
              onChange({ ...block, children: replaceBlockById(block.children, ch.id, next) })
            }
            onDelete={() => onChange({ ...block, children: removeBlockByIdAnywhere(block.children, ch.id) })}
            depth={depth + 1}
            onDropInBranch={onDropInBranch}
          />
        ))}
        <p className="text-[10px] text-muted-foreground">Add blocks inside via a When / otherwise block branch, or nest a group.</p>
      </div>,
    );
  }

  if (block.type === 'if_chain') {
    return row(
      <div className="space-y-3">
        {block.branches.map((br, idx) => (
          <div key={br.id} className="rounded-md bg-card border border-[var(--neutral-200)] p-2 space-y-2">
            <div className="text-[10px] font-medium text-[var(--mw-mirage)]">
              {br.condition === null ? 'Otherwise (when nothing above matched)' : idx === 0 ? 'When' : 'Else when'}
            </div>
            {br.condition && (
              <div className="flex flex-wrap gap-1 items-center">
                <Select
                  value={br.condition.leftVariableId}
                  onValueChange={(v) =>
                    onChange({
                      ...block,
                      branches: block.branches.map((b) =>
                        b.id === br.id ? { ...b, condition: b.condition ? { ...b.condition, leftVariableId: v } : null } : b,
                      ),
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-[10px] w-[120px]">
                    <SelectValue placeholder="Variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {varOpts.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={br.condition.operator}
                  onValueChange={(v) =>
                    onChange({
                      ...block,
                      branches: block.branches.map((b) =>
                        b.id === br.id
                          ? { ...b, condition: b.condition ? { ...b.condition, operator: v as EngineCompareOp } : null }
                          : b,
                      ),
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-[10px] w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals" className="text-xs">
                      equals
                    </SelectItem>
                    <SelectItem value="not_equals" className="text-xs">
                      does not equal
                    </SelectItem>
                    <SelectItem value="greater_than" className="text-xs">
                      is greater than
                    </SelectItem>
                    <SelectItem value="less_than" className="text-xs">
                      is less than
                    </SelectItem>
                    <SelectItem value="contains" className="text-xs">
                      contains
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="h-7 text-xs flex-1 min-w-[80px]"
                  value={br.condition.rightValue}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      branches: block.branches.map((b) =>
                        b.id === br.id
                          ? { ...b, condition: b.condition ? { ...b.condition, rightValue: e.target.value } : null }
                          : b,
                      ),
                    })
                  }
                  placeholder="Value"
                />
              </div>
            )}
            <BranchDropZone
              blockId={block.id}
              branchId={br.id}
              onDropKind={onDropInBranch}
            />
            {br.children.map((ch) => (
              <BlockEditor
                key={ch.id}
                block={ch}
                engine={engine}
                product={product}
                onChange={(next) =>
                  onChange({
                    ...block,
                    branches: block.branches.map((b) =>
                      b.id === br.id ? { ...b, children: replaceBlockById(b.children, ch.id, next) } : b,
                    ),
                  })
                }
                onDelete={() =>
                  onChange({
                    ...block,
                    branches: block.branches.map((b) =>
                      b.id === br.id ? { ...b, children: removeBlockByIdAnywhere(b.children, ch.id) } : b,
                    ),
                  })
                }
                depth={depth + 1}
                onDropInBranch={onDropInBranch}
              />
            ))}
          </div>
        ))}
      </div>,
    );
  }

  if (block.type === 'set_variable' && block.mode === 'literal') {
    return row(
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={block.variableId}
          onValueChange={(v) => onChange({ ...block, variableId: v })}
        >
          <SelectTrigger className="h-7 text-xs w-[140px]">
            <SelectValue placeholder="Variable" />
          </SelectTrigger>
          <SelectContent>
            {varOpts.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs">to</span>
        <Input
          className="h-7 text-xs flex-1"
          value={block.value}
          onChange={(e) => onChange({ ...block, value: e.target.value })}
        />
      </div>,
    );
  }

  if (block.type === 'set_variable' && block.mode === 'lookup') {
    return row(
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={block.variableId} onValueChange={(v) => onChange({ ...block, variableId: v })}>
          <SelectTrigger className="h-7 text-xs w-[120px]">
            <SelectValue placeholder="Set" />
          </SelectTrigger>
          <SelectContent>
            {varOpts.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs">from table</span>
        <Select value={block.tableId} onValueChange={(v) => onChange({ ...block, tableId: v })}>
          <SelectTrigger className="h-7 text-xs w-[140px]">
            <SelectValue placeholder="Table" />
          </SelectTrigger>
          <SelectContent>
            {tableOpts.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs">key</span>
        <Select value={block.keyVariableId} onValueChange={(v) => onChange({ ...block, keyVariableId: v })}>
          <SelectTrigger className="h-7 text-xs w-[120px]">
            <SelectValue placeholder="Key var" />
          </SelectTrigger>
          <SelectContent>
            {varOpts.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>,
    );
  }

  if (block.type === 'bom_phantom') {
    return row(
      <div className="grid grid-cols-2 gap-2">
        <Input className="h-7 text-xs" value={block.name} onChange={(e) => onChange({ ...block, name: e.target.value })} placeholder="Name" />
        <Input className="h-7 text-xs" value={block.sku} onChange={(e) => onChange({ ...block, sku: e.target.value })} placeholder="SKU" />
        <Input
          className="h-7 text-xs"
          type="number"
          value={block.quantity}
          onChange={(e) => onChange({ ...block, quantity: Number(e.target.value) || 0 })}
          placeholder="Qty"
        />
        <Input className="h-7 text-xs" value={block.unit ?? 'ea'} onChange={(e) => onChange({ ...block, unit: e.target.value })} placeholder="Unit" />
      </div>,
    );
  }

  if (block.type === 'bom_override') {
    return row(
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={block.nodeId} onValueChange={(v) => onChange({ ...block, nodeId: v })}>
          <SelectTrigger className="h-7 text-xs flex-1 min-w-[140px]">
            <SelectValue placeholder="Canvas node" />
          </SelectTrigger>
          <SelectContent>
            {nodeOpts.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="h-7 text-xs w-20"
          type="number"
          placeholder="Qty"
          value={block.quantity ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              quantity: e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />
        <div className="flex items-center gap-1">
          <Switch checked={block.hidden === true} onCheckedChange={(c) => onChange({ ...block, hidden: c })} id={`h-${block.id}`} />
          <Label htmlFor={`h-${block.id}`} className="text-[10px]">
            Hide
          </Label>
        </div>
      </div>,
    );
  }

  if (block.type === 'operation') {
    return row(
      <div className="grid grid-cols-2 gap-2">
        <Input className="h-7 text-xs" value={block.name} onChange={(e) => onChange({ ...block, name: e.target.value })} />
        <Input className="h-7 text-xs" value={block.workCentre} onChange={(e) => onChange({ ...block, workCentre: e.target.value })} />
        <Input
          className="h-7 text-xs"
          type="number"
          value={block.setupMinutes}
          onChange={(e) => onChange({ ...block, setupMinutes: Number(e.target.value) || 0 })}
          placeholder="Setup min"
        />
        <Input
          className="h-7 text-xs"
          type="number"
          value={block.runMinutesPerUnit}
          onChange={(e) => onChange({ ...block, runMinutesPerUnit: Number(e.target.value) || 0 })}
          placeholder="Run min / unit"
        />
      </div>,
    );
  }

  if (block.type === 'cost_adjust') {
    return row(
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={block.category}
          onValueChange={(v) =>
            onChange({
              ...block,
              category: v as 'material' | 'labour' | 'machine' | 'overhead' | 'margin',
            })
          }
        >
          <SelectTrigger className="h-7 text-xs w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="material" className="text-xs">
              Material
            </SelectItem>
            <SelectItem value="labour" className="text-xs">
              Labour
            </SelectItem>
            <SelectItem value="machine" className="text-xs">
              Machine
            </SelectItem>
            <SelectItem value="overhead" className="text-xs">
              Overhead
            </SelectItem>
            <SelectItem value="margin" className="text-xs">
              Margin
            </SelectItem>
          </SelectContent>
        </Select>
        <Input className="h-7 text-xs flex-1" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} />
        <Input
          className="h-7 text-xs w-24"
          type="number"
          value={block.amount}
          onChange={(e) => onChange({ ...block, amount: Number(e.target.value) || 0 })}
        />
      </div>,
    );
  }

  if (block.type === 'warning') {
    return row(
      <Input className="h-7 text-xs" value={block.message} onChange={(e) => onChange({ ...block, message: e.target.value })} />,
    );
  }

  return row(<p className="text-xs text-muted-foreground">Unknown block</p>);
}

function VisualRuleWorkspaceInner() {
  const [paletteTab, setPaletteTab] = useState<PaletteCategory>('logic');
  const { getActiveProduct, setDefinitionEngine } = useProductBuilderStore();
  const product = getActiveProduct();
  const locked = product?.locked === true;

  const engine = useMemo(
    () => product?.definitionEngine ?? createEmptyEngine(),
    [product?.definitionEngine, product?.id],
  );

  const firstVarId = engine.variables[0]?.id ?? '';

  const commit = useCallback(
    (next: ProductDefinitionEngine) => {
      if (!product || locked) return;
      setDefinitionEngine(next);
    },
    [product, locked, setDefinitionEngine],
  );

  const onDropBranch = useCallback(
    (kind: PaletteKind, path: { blockId: string; branchId: string }) => {
      const stub = deepRegenerateIds(createStubBlock(kind, firstVarId));
      commit(appendToBranchChildren(engine, path, stub));
    },
    [engine, firstVarId, commit],
  );

  const addVariable = (nodeId: string, optionId: string) => {
    const node = product?.nodes.find((n) => n.id === nodeId);
    const opt = node?.options.find((o) => o.id === optionId);
    if (!node || !opt) return;
    const id = `v-${Math.random().toString(36).slice(2, 8)}`;
    const v: EngineVariableDef = {
      id,
      label: `${node.name}: ${opt.name}`,
      kind: 'selection',
      source: { nodeId, optionId },
    };
    commit({ ...engine, variables: [...engine.variables, v] });
  };

  const addDerivedVariable = () => {
    const id = `v-${Math.random().toString(36).slice(2, 8)}`;
    commit({
      ...engine,
      variables: [...engine.variables, { id, label: 'Derived value', kind: 'derived' }],
    });
  };

  const removeVariable = (id: string) => {
    commit({ ...engine, variables: engine.variables.filter((v) => v.id !== id) });
  };

  const addLookupTable = () => {
    const t: LookupTableDef = {
      id: `tbl-${Math.random().toString(36).slice(2, 8)}`,
      label: 'New table',
      rows: [{ key: '', value: '' }],
    };
    commit({ ...engine, lookupTables: [...engine.lookupTables, t] });
  };

  if (!product) return null;

  const activePaletteGroup = PALETTE_GROUPS.find((g) => g.id === paletteTab) ?? PALETTE_GROUPS[0];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full min-h-0 flex-col bg-white dark:bg-card">
        <div className="shrink-0 border-b border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Rules</p>
            {locked && <span className="text-[10px] text-amber-600">Locked</span>}
          </div>
        </div>

        <div className="shrink-0 border-b border-[var(--border)] p-2">
          <ToggleGroup
            type="single"
            value={paletteTab}
            onValueChange={(val) => val && setPaletteTab(val as PaletteCategory)}
            className="flex w-full flex-wrap"
            variant="outline"
          >
            <ToggleGroupItem
              value="logic"
              className="h-7 flex-1 px-1.5 text-[10px] data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]"
            >
              Logic
            </ToggleGroupItem>
            <ToggleGroupItem
              value="variables"
              className="h-7 flex-1 px-1.5 text-[10px] data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]"
            >
              Variables
            </ToggleGroupItem>
            <ToggleGroupItem
              value="outputs"
              className="h-7 flex-1 px-1.5 text-[10px] data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]"
            >
              Outputs
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Drag a block from the list below and <strong>drop it on the product canvas</strong> (or into a branch drop zone here). Use{' '}
              <strong>When / otherwise</strong> for if-then-else rules. Define variables first so conditions know what to compare.
            </p>
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Variables</span>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={addDerivedVariable} disabled={locked}>
                  <Plus className="w-3 h-3 mr-1" />
                  Derived
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {engine.variables.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 text-xs bg-card border border-[var(--neutral-200)] rounded-lg px-2 py-1.5">
                  <span className="truncate">{v.label}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{v.kind}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeVariable(v.id)} disabled={locked}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Select
              disabled={locked}
              onValueChange={(val) => {
                const i = val.indexOf('::');
                if (i === -1) return;
                addVariable(val.slice(0, i), val.slice(i + 2));
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[min(100%,280px)]">
                <SelectValue placeholder="Add variable from canvas…" />
              </SelectTrigger>
              <SelectContent>
                {product.nodes.flatMap((n) =>
                  n.options.map((o) => (
                    <SelectItem key={`${n.id}-${o.id}`} value={`${n.id}::${o.id}`} className="text-xs">
                      {n.name} — {o.name}
                    </SelectItem>
                  )),
                )}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Open “Add from canvas” and pick a configuration option to bind as a variable.</p>
          </div>

          {/* Lookup tables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lookup tables</span>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={addLookupTable} disabled={locked}>
                <Plus className="w-3 h-3 mr-1" />
                Table
              </Button>
            </div>
            {engine.lookupTables.map((t) => (
              <div key={t.id} className="border border-[var(--neutral-200)] rounded-lg p-2 space-y-2 bg-card">
                <Input
                  className="h-7 text-xs"
                  value={t.label}
                  onChange={(e) =>
                    commit({
                      ...engine,
                      lookupTables: engine.lookupTables.map((x) => (x.id === t.id ? { ...x, label: e.target.value } : x)),
                    })
                  }
                  disabled={locked}
                />
                {t.rows.map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    <Input
                      className="h-7 text-xs flex-1"
                      placeholder="When key is…"
                      value={row.key}
                      onChange={(e) => {
                        const rows = t.rows.map((r, i) => (i === ri ? { ...r, key: e.target.value } : r));
                        commit({
                          ...engine,
                          lookupTables: engine.lookupTables.map((x) => (x.id === t.id ? { ...x, rows } : x)),
                        });
                      }}
                      disabled={locked}
                    />
                    <Input
                      className="h-7 text-xs flex-1"
                      placeholder="Use value…"
                      value={row.value}
                      onChange={(e) => {
                        const rows = t.rows.map((r, i) => (i === ri ? { ...r, value: e.target.value } : r));
                        commit({
                          ...engine,
                          lookupTables: engine.lookupTables.map((x) => (x.id === t.id ? { ...x, rows } : x)),
                        });
                      }}
                      disabled={locked}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px]"
                  disabled={locked}
                  onClick={() =>
                    commit({
                      ...engine,
                      lookupTables: engine.lookupTables.map((x) =>
                        x.id === t.id ? { ...x, rows: [...x.rows, { key: '', value: '' }] } : x,
                      ),
                    })
                  }
                >
                  Add row
                </Button>
              </div>
            ))}
          </div>

          {/* Palette — Factory Designer–style rows; whole row is draggable */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{activePaletteGroup.label}</span>
            <div className="space-y-1">
              {activePaletteGroup.items.map((it) => (
                <PaletteDraggable key={it.kind} {...it} disabled={locked} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your logic</span>
            {engine.rootBlocks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No blocks yet — drag a block onto the canvas or add one from the list above.</p>
            ) : (
              engine.rootBlocks.map((b) => (
                <BlockEditor
                  key={b.id}
                  block={b}
                  engine={engine}
                  product={product}
                  onChange={(next) =>
                    commit({ ...engine, rootBlocks: replaceBlockById(engine.rootBlocks, b.id, next) })
                  }
                  onDelete={() => commit({ ...engine, rootBlocks: removeBlockByIdAnywhere(engine.rootBlocks, b.id) })}
                  depth={0}
                  onDropInBranch={onDropBranch}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/** Rules rail — must render under a parent `DndProvider` (see ProductStudio). */
export function VisualRuleWorkspace() {
  return <VisualRuleWorkspaceInner />;
}
