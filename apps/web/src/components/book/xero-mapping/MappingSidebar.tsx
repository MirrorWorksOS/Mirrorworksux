/**
 * Left rail used to switch between mapping sections. Each item shows a
 * status indicator (green dot, amber warning, grey) plus mapped/total
 * count. Collapses to a horizontal tab strip below the lg breakpoint.
 */
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import type { MappingSectionId, SectionStatus } from '@/types/xero';

export interface MappingSidebarItem {
  id: MappingSectionId;
  label: string;
  hint?: string;
}

export interface MappingSidebarProps {
  items: MappingSidebarItem[];
  activeId: MappingSectionId;
  onSelect: (id: MappingSectionId) => void;
  status: Record<MappingSectionId, SectionStatus>;
}

function StatusGlyph({ s }: { s: SectionStatus }) {
  if (s.requiredUnmapped > 0) {
    return (
      <AlertTriangle
        className="size-3.5 text-[var(--mw-warning)]"
        aria-label="Required unmapped"
      />
    );
  }
  if (s.mapped === s.total && s.total > 0) {
    return (
      <span
        className="h-2 w-2 rounded-full bg-[var(--mw-success)]"
        aria-label="All mapped"
      />
    );
  }
  return (
    <span
      className="h-2 w-2 rounded-full bg-[var(--neutral-300)]"
      aria-label="Partial"
    />
  );
}

export function MappingSidebar({
  items,
  activeId,
  onSelect,
  status,
}: MappingSidebarProps) {
  return (
    <Card className="p-2 lg:sticky lg:top-4 lg:w-56">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const s = status[item.id];
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex shrink-0 items-center gap-2 rounded-[var(--shape-md)] px-3 py-2 text-left text-sm transition-colors lg:shrink',
                isActive
                  ? 'bg-[var(--mw-yellow-400)]/20 text-foreground'
                  : 'text-muted-foreground hover:bg-[var(--neutral-100)] hover:text-foreground',
              )}
            >
              <StatusGlyph s={s} />
              <span className="flex-1 truncate">{item.label}</span>
              <span className="hidden text-[11px] tabular-nums text-muted-foreground lg:inline">
                {s.mapped}/{s.total}
              </span>
            </button>
          );
        })}
      </nav>
    </Card>
  );
}
