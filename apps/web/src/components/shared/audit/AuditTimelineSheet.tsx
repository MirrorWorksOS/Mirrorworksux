/**
 * AuditTimelineSheet — Side-drawer wrapper for <AuditTimeline variant="full">.
 * Used on document detail screens for the "View full history" deep dive.
 */

import { useState } from 'react';
import { Download, History } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { AuditTimeline } from './AuditTimeline';
import type { AuditAction, AuditEntityType } from '@/services/auditService';

const FILTERS: { key: 'all' | 'changes' | 'approvals' | 'comms'; label: string; actions?: AuditAction[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'changes', label: 'Changes', actions: ['created', 'updated', 'amended', 'status_changed'] },
  { key: 'approvals', label: 'Approvals', actions: ['approved', 'rejected', 'submitted'] },
  { key: 'comms', label: 'Activity', actions: ['sent', 'received', 'cancelled', 'commented'] },
];

interface Props {
  entityType: AuditEntityType;
  entityId: string;
  /** Document number for the drawer title, e.g. "PO-2026-0089" */
  entityLabel: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function AuditTimelineSheet({
  entityType, entityId, entityLabel, open, onOpenChange, children,
}: Props) {
  const [filter, setFilter] = useState<typeof FILTERS[number]['key']>('all');
  const activeFilter = FILTERS.find(f => f.key === filter);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side="right" className="sm:max-w-lg md:max-w-xl">
        <SheetHeader className="pr-8">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--neutral-500)]" />
            <SheetTitle className="text-base">History — {entityLabel}</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-[var(--neutral-500)]">
            Append-only record of every change. Retained for audit and compliance.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter history">
            {FILTERS.map(f => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? 'rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background'
                    : 'rounded-full border border-[var(--neutral-200)] px-3 py-1 text-xs text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-[var(--neutral-500)]"
            onClick={() => toast.success(`Exporting ${entityLabel} history…`)}
            aria-label="Export history"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        <ScrollArea className="-mr-6 flex-1 pr-6">
          <AuditTimeline
            entityType={entityType}
            entityId={entityId}
            variant="full"
            actions={activeFilter?.actions}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
