/**
 * BomEditorSheet — create or edit a Bill of Materials, including
 * multi-tier (nested) sub-assembly references.
 *
 * A BOM line can be:
 *   - material   (raw stock, e.g. "10mm MS Plate")
 *   - purchased  (off-the-shelf component, e.g. "M10 fastener kit")
 *   - labour     (time-based, e.g. "Welding — MIG · 3 hrs")
 *   - subAssembly (a reference to another BOM by id; renders nested)
 *
 * Multi-tier nesting is supported via line.kind === 'subAssembly'. The list
 * here is shallow — when a sub-assembly is added, the user picks an existing
 * BOM by id and sees its product name; expanding to view children is done
 * by re-opening that BOM.
 */

import { useEffect, useState } from 'react';
import { Plus, Trash2, Layers, Component } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { MwFormField } from '@/components/shared/forms/MwFormField';

export type BomLineKind = 'material' | 'purchased' | 'labour' | 'subAssembly';

export interface BomLineDraft {
  /** Local-only key for stable list rendering. */
  key: string;
  kind: BomLineKind;
  /** SKU for material/purchased/labour, or sub-assembly id for subAssembly. */
  sku: string;
  description: string;
  qty: number;
  unit: string;
}

export interface BomDraft {
  id?: string;
  product: string;
  sku: string;
  version: string;
  status: 'active' | 'draft' | 'obsolete';
  lines: BomLineDraft[];
}

const KIND_META: Record<
  BomLineKind,
  { label: string; badge: string }
> = {
  material: { label: 'Material', badge: 'bg-[var(--mw-yellow-100)] text-[var(--mw-yellow-900)]' },
  purchased: { label: 'Purchased', badge: 'bg-[var(--mw-info-light)] text-[var(--mw-info)]' },
  labour: { label: 'Labour', badge: 'bg-[var(--neutral-100)] text-foreground' },
  subAssembly: { label: 'Sub-assembly', badge: 'bg-[var(--mw-blue-50)] text-[var(--mw-blue)]' },
};

const EMPTY: BomDraft = {
  product: '',
  sku: '',
  version: 'v1.0',
  status: 'draft',
  lines: [],
};

function newKey() {
  return Math.random().toString(36).slice(2, 9);
}

interface BomEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bom?: BomDraft;
  /** Other BOMs available as sub-assemblies. */
  availableSubAssemblies?: { id: string; product: string; sku: string }[];
  onSave?: (bom: BomDraft) => void;
}

export function BomEditorSheet({
  open,
  onOpenChange,
  bom,
  availableSubAssemblies = [],
  onSave,
}: BomEditorSheetProps) {
  const isEdit = Boolean(bom?.id);
  const [form, setForm] = useState<BomDraft>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      bom
        ? { ...bom, lines: bom.lines.map((l) => ({ ...l, key: l.key || newKey() })) }
        : { ...EMPTY, lines: [] },
    );
  }, [open, bom]);

  const set = <K extends keyof BomDraft>(key: K, value: BomDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addLine = (kind: BomLineKind) => {
    setForm((f) => ({
      ...f,
      lines: [
        ...f.lines,
        {
          key: newKey(),
          kind,
          sku: '',
          description: '',
          qty: 1,
          unit: kind === 'labour' ? 'hrs' : 'each',
        },
      ],
    }));
  };

  const updateLine = (key: string, patch: Partial<BomLineDraft>) => {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    }));
  };

  const removeLine = (key: string) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((l) => l.key !== key) }));

  const valid =
    form.product.trim().length > 0 &&
    form.sku.trim().length > 0 &&
    form.lines.length > 0;

  const handleSave = () => {
    if (!valid) {
      toast.error('Product, SKU, and at least one line are required.');
      return;
    }
    onSave?.({
      ...form,
      id: bom?.id ?? `bom-${Date.now()}`,
      product: form.product.trim(),
      sku: form.sku.trim(),
    });
    toast.success(isEdit ? 'BOM saved' : 'BOM created');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl overflow-y-auto flex flex-col"
      >
        <SheetHeader className="pb-4 border-b border-[var(--border)]">
          <SheetTitle>{isEdit ? 'Edit BOM' : 'New BOM'}</SheetTitle>
          <SheetDescription>
            Multi-tier supported — add a Sub-assembly line to nest another BOM.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <MwFormField label="Product" required>
              <Input
                value={form.product}
                onChange={(e) => set('product', e.target.value)}
                placeholder="e.g. Server Rack Chassis"
                autoFocus
              />
            </MwFormField>
            <MwFormField label="SKU" required>
              <Input
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="PROD-SR-001"
              />
            </MwFormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MwFormField label="Version">
              <Input
                value={form.version}
                onChange={(e) => set('version', e.target.value)}
                placeholder="v1.0"
              />
            </MwFormField>
            <MwFormField label="Status">
              <Select
                value={form.status}
                onValueChange={(v) =>
                  set('status', v as BomDraft['status'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="obsolete">Obsolete</SelectItem>
                </SelectContent>
              </Select>
            </MwFormField>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Lines ({form.lines.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addLine('material')}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Material
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addLine('purchased')}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Purchased
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addLine('labour')}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Labour
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addLine('subAssembly')}
                  className="h-8 text-xs gap-1"
                  disabled={availableSubAssemblies.length === 0}
                  title={
                    availableSubAssemblies.length === 0
                      ? 'Save another BOM first to nest it as a sub-assembly'
                      : 'Add nested sub-assembly'
                  }
                >
                  <Layers className="h-3 w-3" /> Sub-assembly
                </Button>
              </div>
            </div>

            {form.lines.length === 0 ? (
              <div className="rounded-[var(--shape-md)] border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--neutral-500)]">
                No lines yet — add a Material, Purchased, Labour, or
                Sub-assembly line above.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {form.lines.map((line) => (
                  <BomLineRow
                    key={line.key}
                    line={line}
                    availableSubAssemblies={availableSubAssemblies}
                    onChange={(patch) => updateLine(line.key, patch)}
                    onRemove={() => removeLine(line.key)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <SheetFooter className="border-t border-[var(--border)] pt-4 flex flex-row justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!valid}
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
          >
            {isEdit ? 'Save BOM' : 'Create BOM'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface BomLineRowProps {
  line: BomLineDraft;
  availableSubAssemblies: { id: string; product: string; sku: string }[];
  onChange: (patch: Partial<BomLineDraft>) => void;
  onRemove: () => void;
}

function BomLineRow({
  line,
  availableSubAssemblies,
  onChange,
  onRemove,
}: BomLineRowProps) {
  const meta = KIND_META[line.kind];
  const isSub = line.kind === 'subAssembly';

  return (
    <li className="grid grid-cols-12 gap-2 items-center rounded-[var(--shape-md)] border border-[var(--border)] px-2 py-1.5">
      <div className="col-span-2 flex items-center gap-1.5">
        {isSub ? (
          <Layers className="h-3.5 w-3.5 text-[var(--mw-blue)]" />
        ) : (
          <Component className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
        )}
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', meta.badge)}>
          {meta.label}
        </span>
      </div>

      {isSub ? (
        <div className="col-span-6">
          <Select
            value={line.sku}
            onValueChange={(id) => {
              const sub = availableSubAssemblies.find((s) => s.id === id);
              onChange({
                sku: id,
                description: sub ? `${sub.product} (${sub.sku})` : line.description,
              });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Pick a sub-assembly BOM…" />
            </SelectTrigger>
            <SelectContent>
              {availableSubAssemblies.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.product} — {s.sku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <>
          <div className="col-span-2">
            <Input
              value={line.sku}
              onChange={(e) => onChange({ sku: e.target.value })}
              placeholder="SKU"
              className="h-8 text-xs"
            />
          </div>
          <div className="col-span-4">
            <Input
              value={line.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Description"
              className="h-8 text-xs"
            />
          </div>
        </>
      )}

      <div className="col-span-1">
        <Input
          type="number"
          min={0}
          step="any"
          value={line.qty}
          onChange={(e) => onChange({ qty: Number(e.target.value) || 0 })}
          className="h-8 text-xs text-right tabular-nums"
        />
      </div>
      <div className="col-span-2">
        <Input
          value={line.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="unit"
          className="h-8 text-xs"
        />
      </div>
      <div className="col-span-1 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[var(--neutral-500)] hover:text-[var(--mw-error)]"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

/** Convenience: render a non-empty <Textarea> if a future caller wants notes. */
export const _bomNotesTextarea = Textarea;
