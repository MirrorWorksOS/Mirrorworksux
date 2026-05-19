/**
 * EntityPickerModal — generic searchable picker used to pick one or many
 * entities of a kind (product, contact, tag, customer). Renders a Dialog
 * with a search box and a virtualised-feeling result list.
 *
 *   <EntityPickerModal kind="product" open multiSelect
 *     items={products.map(p => ({ id: p.id, label: p.partNumber, sub: p.description }))}
 *     onSelect={ids => …}
 *     onOpenChange={setOpen} />
 */

import * as React from 'react';
import { Search, Check, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';

export type EntityPickerKind = 'product' | 'contact' | 'tag' | 'customer';

export interface PickerItem {
  id: string;
  label: string;
  /** Optional secondary line (description, role, email, etc.) */
  sub?: string;
  /** Optional right-aligned content (price, status, etc.) */
  right?: React.ReactNode;
  /** Optional avatar/icon on the left */
  leading?: React.ReactNode;
}

export interface EntityPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: EntityPickerKind;
  /** Items to choose from. */
  items: PickerItem[];
  /** Allow multiple selections. */
  multiSelect?: boolean;
  /** Pre-selected ids. */
  selectedIds?: string[];
  /** Title override — defaults to "Select {kind}". */
  title?: string;
  /** Description override. */
  description?: string;
  /** Confirm button label — defaults to "Select" (or "Add" if `creatable`). */
  confirmLabel?: string;
  /** Show a "+ Create new {kind}" affordance at the bottom of the list. */
  creatable?: boolean;
  onCreateNew?: (query: string) => void;
  onSelect: (ids: string[]) => void;
}

const KIND_LABEL: Record<EntityPickerKind, string> = {
  product: 'product',
  contact: 'contact',
  tag: 'tag',
  customer: 'customer',
};

export function EntityPickerModal({
  open,
  onOpenChange,
  kind,
  items,
  multiSelect = false,
  selectedIds: initialSelectedIds = [],
  title,
  description,
  confirmLabel,
  creatable = false,
  onCreateNew,
  onSelect,
}: EntityPickerModalProps) {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set(initialSelectedIds));

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(new Set(initialSelectedIds));
    }
  }, [open, initialSelectedIds]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.sub ? i.sub.toLowerCase().includes(q) : false) ||
        i.id.toLowerCase().includes(q),
    );
  }, [items, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiSelect) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    onOpenChange(false);
  };

  const handleCreate = () => {
    onCreateNew?.(query.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[600px] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-[var(--neutral-200)] px-6 py-4 text-left">
          <DialogTitle>{title ?? `Select ${KIND_LABEL[kind]}`}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="border-b border-[var(--neutral-200)] px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-500)]" />
            <Input
              autoFocus
              placeholder={`Search ${KIND_LABEL[kind]}s…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--neutral-500)]">
              {creatable ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center gap-1.5 text-foreground hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Create &ldquo;{query.trim()}&rdquo;
                </button>
              ) : (
                'No matches.'
              )}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-[var(--mw-yellow-400)]/15 text-foreground'
                          : 'hover:bg-[var(--neutral-100)]',
                      )}
                    >
                      {item.leading && <div className="shrink-0">{item.leading}</div>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        {item.sub && (
                          <p className="truncate text-xs text-[var(--neutral-500)]">{item.sub}</p>
                        )}
                      </div>
                      {item.right && (
                        <div className="shrink-0 text-xs text-[var(--neutral-600)]">
                          {item.right}
                        </div>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-[var(--mw-yellow-600)]" />
                      )}
                    </button>
                  </li>
                );
              })}
              {creatable && query.trim() && (
                <li>
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-foreground hover:bg-[var(--neutral-100)]"
                  >
                    <Plus className="h-4 w-4" />
                    Create &ldquo;{query.trim()}&rdquo;
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        <DialogFooter className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--neutral-200)] px-6 py-3 sm:flex-row">
          <div className="text-xs text-[var(--neutral-500)]">
            {multiSelect && selected.size > 0 && (
              <Badge variant="outline" className="border-[var(--border)] tabular-nums">
                {selected.size} selected
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="h-10 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={handleConfirm}
              disabled={selected.size === 0}
            >
              {confirmLabel ?? (creatable ? 'Add' : 'Select')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
