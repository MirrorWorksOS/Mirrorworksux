/**
 * RouteEditorSheet — create or edit a Standard Route
 * (Control → Routes).
 *
 * A route is a named, ordered template of standard operations. The editor
 * lets the user set name/category/description, then add/reorder/remove
 * operations and (optionally) override the standard minutes per step.
 *
 * Backend is mocked — onSave fires a toast for now.
 */

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  operationsLibraryService,
  routesLibraryService,
  type StandardOperation,
  type StandardRoute,
  type RouteStep,
} from '@/services';

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { MwFormField } from '@/components/shared/forms/MwFormField';
import { getCategoryColors } from '@/lib/operation-category-colors';

interface RouteEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing route to edit. Omit for create. */
  route?: StandardRoute;
  onSave?: (route: StandardRoute) => void;
}

interface DraftStep {
  /** Local-only id for stable keys when reordering. */
  key: string;
  operationId: string;
  minutesOverride?: number;
}

function newKey() {
  return Math.random().toString(36).slice(2, 9);
}

export function RouteEditorSheet({
  open,
  onOpenChange,
  route,
  onSave,
}: RouteEditorSheetProps) {
  const isEdit = Boolean(route);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(route?.name ?? '');
    setCategory(route?.category ?? '');
    setDescription(route?.description ?? '');
    setSteps(
      (route?.steps ?? []).map((s) => ({
        key: newKey(),
        operationId: s.operationId,
        minutesOverride: s.minutesOverride,
      })),
    );
  }, [open, route]);

  const totalMinutes = useMemo(
    () =>
      steps.reduce((sum, s) => {
        const op = operationsLibraryService.byId(s.operationId);
        if (!op) return sum;
        return sum + (s.minutesOverride ?? op.defaultMinutes);
      }, 0),
    [steps],
  );

  const valid = name.trim().length > 0 && steps.length > 0;

  const addStep = (op: StandardOperation) => {
    setSteps((prev) => [...prev, { key: newKey(), operationId: op.id }]);
  };

  const removeStep = (key: string) =>
    setSteps((prev) => prev.filter((s) => s.key !== key));

  const moveStep = (fromKey: string, toIdx: number) => {
    setSteps((prev) => {
      const fromIdx = prev.findIndex((s) => s.key === fromKey);
      if (fromIdx === -1 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const setMinutesOverride = (key: string, value: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.key === key
          ? {
              ...s,
              minutesOverride:
                value === '' ? undefined : Math.max(0, Number(value) || 0),
            }
          : s,
      ),
    );
  };

  const handleSave = () => {
    if (!valid) {
      toast.error('Route needs a name and at least one step.');
      return;
    }
    const out: StandardRoute = {
      id: route?.id ?? `route-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || undefined,
      description: description.trim() || undefined,
      steps: steps.map<RouteStep>((s) => ({
        operationId: s.operationId,
        ...(s.minutesOverride !== undefined
          ? { minutesOverride: s.minutesOverride }
          : {}),
      })),
    };
    onSave?.(out);
    toast.success(isEdit ? 'Route saved' : 'Route created');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto flex flex-col"
      >
        <SheetHeader className="pb-4 border-b border-[var(--border)]">
          <SheetTitle>{isEdit ? 'Edit route' : 'New route'}</SheetTitle>
          <SheetDescription>
            Reusable operation sequence — apply to a part with one click.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 py-5">
          <MwFormField label="Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard sheet-metal"
              autoFocus
            />
          </MwFormField>

          <MwFormField label="Category">
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Sheet metal"
            />
          </MwFormField>

          <MwFormField label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary that shows below the route name"
              rows={2}
            />
          </MwFormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Steps ({steps.length})
                {steps.length > 0 && (
                  <span className="text-xs font-normal text-[var(--neutral-500)] ml-2 tabular-nums">
                    · {(totalMinutes / 60).toFixed(1)}h planned
                  </span>
                )}
              </div>
              <AddOpPicker onAdd={addStep} />
            </div>

            {steps.length === 0 ? (
              <div className="rounded-[var(--shape-md)] border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--neutral-500)]">
                No steps yet. Click <span className="font-medium">Add op</span>{' '}
                to insert one.
              </div>
            ) : (
              <ol className="space-y-1">
                {steps.map((s, idx) => (
                  <StepRow
                    key={s.key}
                    step={s}
                    index={idx}
                    isDragging={draggingKey === s.key}
                    onDragStart={() => setDraggingKey(s.key)}
                    onDragEnd={() => setDraggingKey(null)}
                    onDropAt={(toIdx) =>
                      draggingKey && moveStep(draggingKey, toIdx)
                    }
                    onMinutesOverride={(v) => setMinutesOverride(s.key, v)}
                    onRemove={() => removeStep(s.key)}
                  />
                ))}
              </ol>
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
            {isEdit ? 'Save route' : 'Create route'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface StepRowProps {
  step: DraftStep;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropAt: (toIndex: number) => void;
  onMinutesOverride: (value: string) => void;
  onRemove: () => void;
}

function StepRow({
  step,
  index,
  isDragging,
  onDragStart,
  onDragEnd,
  onDropAt,
  onMinutesOverride,
  onRemove,
}: StepRowProps) {
  const op = operationsLibraryService.byId(step.operationId);
  const colour = getCategoryColors(op?.category ?? '');
  const defaultMinutes = op?.defaultMinutes ?? 0;

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropAt(index);
      }}
      className={cn(
        'flex items-center gap-2 rounded-[var(--shape-md)] border px-2 py-1.5 transition-colors',
        colour.border,
        colour.bg,
        isDragging && 'opacity-40',
      )}
    >
      <GripVertical className="h-4 w-4 text-[var(--neutral-400)] shrink-0 cursor-grab" />
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-white text-[10px] font-medium tabular-nums">
        {index + 1}
      </span>
      <span className={cn('flex-1 truncate text-sm font-medium', colour.text)}>
        {op?.name ?? 'Unknown operation'}
      </span>
      <span className="text-xs text-[var(--neutral-500)] hidden sm:inline">
        {op?.defaultWorkCentre}
      </span>
      <Input
        type="number"
        min={0}
        value={step.minutesOverride ?? ''}
        onChange={(e) => onMinutesOverride(e.target.value)}
        placeholder={`${defaultMinutes}m`}
        className="h-7 w-20 text-xs text-right tabular-nums"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-[var(--neutral-500)] hover:text-[var(--mw-error)]"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      {index < 99 && (
        <ChevronRight
          className="h-3 w-3 text-[var(--neutral-300)]"
          aria-hidden
        />
      )}
    </li>
  );
}

function AddOpPicker({ onAdd }: { onAdd: (op: StandardOperation) => void }) {
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
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Plus className="h-3 w-3" />
          Add op
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-72">
        <Command>
          <CommandInput placeholder="Search operations…" className="h-9" />
          <CommandList className="max-h-80">
            <CommandEmpty>No operations found.</CommandEmpty>
            {Object.entries(grouped).map(([cat, ops]) => (
              <CommandGroup key={cat} heading={cat}>
                {ops.map((op) => (
                  <CommandItem
                    key={op.id}
                    value={`${op.name} ${op.defaultWorkCentre} ${op.category ?? ''}`}
                    onSelect={() => {
                      onAdd(op);
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium text-foreground">
                      {op.name}
                    </span>
                    <span className="ml-auto text-xs text-[var(--neutral-500)] tabular-nums">
                      {op.defaultMinutes}m
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Keep tree-shaker happy by surfacing the helper in case future callers need it.
export const __routesLibraryServiceRef = routesLibraryService;
