/**
 * ChatterChainFilter — toggleable chain pill row for filtering chatter messages.
 *
 * Each chain doc renders as a chip. Selected chips are yellow with mirage text;
 * deselected chips are neutral. The currently-opened-from doc gets a thin
 * yellow ring to keep its "anchor" identity visible even when deselected.
 * Includes an "All" reset action that re-enables every chip.
 */

import { useMemo } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import type { ChatterDocRef } from '@/services/chatterService';

export interface ChatterChainFilterProps {
  chain: ChatterDocRef[];
  /** Labels of docs that are currently included. */
  selected: Set<string>;
  /** Label of the doc the Sheet was opened from — gets the anchor ring. */
  anchorLabel?: string;
  onToggle: (label: string) => void;
  onReset: () => void;
  className?: string;
}

export function ChatterChainFilter({
  chain,
  selected,
  anchorLabel,
  onToggle,
  onReset,
  className,
}: ChatterChainFilterProps) {
  const allSelected = useMemo(
    () => chain.every((c) => selected.has(c.label)),
    [chain, selected],
  );

  return (
    <div className={cn('flex items-center gap-1.5 overflow-x-auto', className)}>
      <button
        type="button"
        onClick={onReset}
        disabled={allSelected}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors',
          allSelected
            ? 'border-[var(--border)] bg-transparent text-[var(--neutral-400)]'
            : 'border-[var(--border)] bg-[var(--neutral-100)] text-foreground hover:bg-[var(--neutral-200)]',
        )}
        aria-label="Show all chain documents"
        title="Show all"
      >
        <Filter className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        All
      </button>

      <span className="h-4 w-px shrink-0 bg-[var(--border)]" aria-hidden />

      {chain.map((doc) => {
        const isSelected = selected.has(doc.label);
        const isAnchor = doc.label === anchorLabel;
        return (
          <button
            key={doc.label}
            type="button"
            onClick={() => onToggle(doc.label)}
            aria-pressed={isSelected}
            title={`${isSelected ? 'Hide' : 'Show'} messages posted on ${doc.label}`}
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors',
              isSelected
                ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]'
                : 'border-[var(--border)] bg-transparent text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-100)]',
              isAnchor && !isSelected && 'ring-1 ring-[var(--mw-yellow-400)]/40',
            )}
          >
            {doc.label}
          </button>
        );
      })}
    </div>
  );
}
