import { CheckCircle2, Loader2, ScanLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { PickListRow } from './types';

interface MaterialsPickListCardProps {
  rows: PickListRow[];
  scanningRowId: string | null;
  onPick: (rowId: string) => void;
  onIssueAll: () => void;
}

export function MaterialsPickListCard({
  rows,
  scanningRowId,
  onPick,
  onIssueAll,
}: MaterialsPickListCardProps) {
  const pickedCount = rows.filter((row) => row.picked).length;
  const allPicked = rows.length > 0 && pickedCount === rows.length;

  if (allPicked) {
    return (
      <Card className="flex items-center justify-between gap-3 rounded-[var(--shape-lg)] border-[var(--mw-success)] bg-[var(--mw-success)]/8 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-[var(--mw-success)]" />
          <div>
            <div className="text-base font-medium text-[var(--neutral-900)]">All materials picked.</div>
            <div className="text-sm text-[var(--neutral-600)]">Ready to run.</div>
          </div>
        </div>
        <span className="text-sm font-medium tabular-nums text-[var(--mw-success)]">
          {rows.length} of {rows.length}
        </span>
      </Card>
    );
  }

  return (
    <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium text-[var(--neutral-900)]">Pick list</h3>
          <p className="text-sm text-[var(--neutral-600)]">
            Issue materials for {rows.length} BOM lines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[var(--neutral-100)] px-3 py-1 text-sm font-medium tabular-nums text-[var(--neutral-700)]">
            {pickedCount} of {rows.length} picked
          </span>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-100)]"
            onClick={onIssueAll}
          >
            Issue all
          </Button>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 py-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--neutral-900)]">
                {row.partNumber}
              </div>
              <div className="truncate text-sm text-[var(--neutral-600)]">
                {row.description}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                {row.requiredQty} {row.unit}
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                {row.binLocation}
              </div>
            </div>
            {row.picked ? (
              <span className="inline-flex h-11 items-center gap-2 rounded-[var(--shape-md)] bg-[var(--mw-success)]/8 px-3 text-sm font-medium text-[var(--mw-success)]">
                <CheckCircle2 className="h-4 w-4" />
                {row.pickedAtLabel ?? 'Picked'}
              </span>
            ) : scanningRowId === row.id ? (
              <span className="inline-flex h-11 items-center gap-2 rounded-[var(--shape-md)] bg-[var(--mw-yellow-50)] px-3 text-sm font-medium text-[var(--mw-mirage)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning…
              </span>
            ) : (
              <Button
                type="button"
                size="lg"
                className="h-11 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
                onClick={() => onPick(row.id)}
              >
                <ScanLine className="h-4 w-4" />
                Scan to pick
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
