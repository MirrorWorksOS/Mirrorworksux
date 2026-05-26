/**
 * RevDriftBanner — operator-facing nudge that fires when a Manufacturing
 * Order / work order is pinned to an older drawing revision than the latest
 * one engineering has released for the product.
 *
 * Mounts above the viewer on:
 *   - MakeManufacturingOrderDetail MirrorView tab
 *   - FloorExecution / ReferencePanel (shop floor)
 *
 * Reactive: subscribes to the product's latest revision via Convex, so the
 * moment engineering drops a new model the banner pops up on every open
 * operator screen — no client polling.
 *
 * NOTE: Phase 2e introduces an explicit `revisionStatus: 'released'` gate.
 * Until then we treat any successful translation as "released" so the banner
 * has something useful to compare against. Swap the predicate when 2e lands.
 */
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';

const REMOTE_MODE = import.meta.env.VITE_DATA_SOURCE === 'remote';

/** Parse "Rev X" → base-26 numeric for comparison. Returns 0 on no match. */
function revLabelToNum(label?: string): number {
  if (!label) return 0;
  const m = label.trim().match(/^Rev\s+([A-Z]+)$/i);
  if (!m) return 0;
  return m[1]
    .toUpperCase()
    .split('')
    .reduce((acc, c) => acc * 26 + (c.charCodeAt(0) - 64), 0);
}

/** Crude relative-time formatter. Avoids a date-fns dep for one banner. */
function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export interface RevDriftBannerProps {
  /** What the operator is currently running (from traveller pin or local MO upload). */
  pinnedRevisionLabel?: string;
  /** Product to compare against — "prod-001" etc. */
  productOwnerId: string;
  className?: string;
}

export function RevDriftBanner({
  pinnedRevisionLabel,
  productOwnerId,
  className,
}: RevDriftBannerProps) {
  const latest = useQuery(
    api.mirrorview.getActiveModel,
    REMOTE_MODE
      ? { ownerType: 'product' as const, ownerId: productOwnerId }
      : 'skip',
  );
  const [open, setOpen] = useState(false);

  // Nothing to compare yet — query still loading or no product uploads exist.
  if (!latest || !latest.revisionLabel) return null;
  // Suppress drift for in-flight or failed translations; only released-style
  // success matters until Phase 2e adds the explicit gate.
  if (latest.status !== 'success') return null;
  // Same rev → no drift.
  if (latest.revisionLabel === pinnedRevisionLabel) return null;
  // Only nudge when the product is *newer* than the pinned rev — running
  // ahead of the latest released is impossible by design but we guard anyway.
  if (revLabelToNum(latest.revisionLabel) <= revLabelToNum(pinnedRevisionLabel)) {
    return null;
  }

  const pinnedDisplay = pinnedRevisionLabel ?? 'an older rev';

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-md',
          'border border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-400)]/15 px-4 py-2.5',
          className,
        )}
        role="alert"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--mw-mirage)]" />
          <p className="text-sm text-foreground">
            Running <span className="font-medium">{pinnedDisplay}</span>.{' '}
            <span className="font-medium">{latest.revisionLabel}</span> released{' '}
            <span className="font-medium">{formatRelative(latest.createdAt)}</span>
            {' — review changes before continuing.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[var(--mw-yellow-500)] bg-card text-foreground hover:bg-[var(--mw-yellow-400)]/30"
          onClick={() => setOpen(true)}
        >
          Review {latest.revisionLabel}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>What changed in {latest.revisionLabel}</DialogTitle>
            <DialogDescription>
              Released {formatRelative(latest.createdAt)} · file:{' '}
              <span className="font-medium text-foreground">{latest.fileName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-[var(--border)] bg-[var(--neutral-50)] p-3 text-sm text-foreground">
            {latest.revisionNotes ? (
              <p className="italic">“{latest.revisionNotes}”</p>
            ) : (
              <p className="text-[var(--neutral-500)]">
                No change-note was attached when this revision was uploaded.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
