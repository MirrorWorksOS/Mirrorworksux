import { useEffect, useState } from 'react';
import { CheckCircle2, Printer } from 'lucide-react';
import operatorImage from 'figma:asset/ba6178de4b6be80c019e44df2f99d355a1af18f9.png';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkOrderExecutionSnapshot } from '../types';
import { Barcode } from './Barcode';

const PRINTERS = ['Zebra ZD420 — Bay 1', 'Zebra ZD420 — Dispatch'];

interface CloseWODialogProps {
  open: boolean;
  snapshot: WorkOrderExecutionSnapshot;
  unitsCompleted: number;
  unitsTarget: number;
  onOpenChange: (open: boolean) => void;
  onPrintAndClose: (payload: { qty: number; printer: string }) => void;
  onCloseOnly: () => void;
}

export function CloseWODialog({
  open,
  snapshot,
  unitsCompleted,
  unitsTarget,
  onOpenChange,
  onPrintAndClose,
  onCloseOnly,
}: CloseWODialogProps) {
  const [printer, setPrinter] = useState(PRINTERS[0]);

  useEffect(() => {
    if (!open) setPrinter(PRINTERS[0]);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Close work order</DialogTitle>
          <DialogDescription>
            Confirm the batch is complete. Labels can be printed during close-out, or skipped if labels were printed earlier in the run.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Units complete
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-medium tabular-nums text-[var(--neutral-900)]">
                  {unitsCompleted}
                </span>
                <span className="pb-1 text-base tabular-nums text-[var(--neutral-500)]">
                  / {unitsTarget}
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--mw-success)]/12 px-2 py-0.5 text-[11px] font-medium text-[var(--mw-success)]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Target reached
              </div>
            </div>

            <div className="rounded-md border border-[var(--neutral-200)] bg-card p-4 text-sm">
              <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[var(--neutral-700)]">
                <span className="text-[var(--neutral-500)]">Job</span>
                <span className="text-[var(--neutral-900)]">{snapshot.moNumber}</span>
                <span className="text-[var(--neutral-500)]">Work order</span>
                <span className="text-[var(--neutral-900)]">{snapshot.woNumber}</span>
                <span className="text-[var(--neutral-500)]">Operator</span>
                <span className="text-[var(--neutral-900)]">{snapshot.operatorName}</span>
                <span className="text-[var(--neutral-500)]">Machine</span>
                <span className="text-[var(--neutral-900)]">{snapshot.machineName}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Printer (only used if printing)
              </label>
              <Select value={printer} onValueChange={setPrinter}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINTERS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <LabelPreview snapshot={snapshot} qty={unitsCompleted} />
        </div>

        <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="lg" className="sm:order-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="sm:order-2 border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
            onClick={() => {
              onCloseOnly();
              onOpenChange(false);
            }}
          >
            Close without printing
          </Button>
          <Button
            size="lg"
            className="sm:order-3 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
            onClick={() => {
              onPrintAndClose({ qty: unitsCompleted, printer });
              onOpenChange(false);
            }}
          >
            <Printer className="h-4 w-4" />
            Print labels and close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LabelPreview({
  snapshot,
  qty,
}: {
  snapshot: WorkOrderExecutionSnapshot;
  qty: number;
}) {
  const timestamp = new Date().toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-md border border-[var(--neutral-300)] bg-white p-5 text-[var(--mw-mirage)] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            MirrorWorks
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-700)]">
            Issued today
          </div>
        </div>
        <span className="rounded-full border border-[var(--mw-mirage)] bg-[var(--mw-mirage)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--mw-yellow-400)]">
          WIP → FINISHED GOODS
        </span>
      </div>

      <h4 className="mt-4 text-lg font-medium leading-tight">
        {snapshot.productName}
      </h4>
      <div className="mt-1 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-600)]">
        <span>Rev C</span>
        <span className="text-[var(--neutral-400)]">·</span>
        <span>{snapshot.moNumber}</span>
      </div>

      <div className="mt-4 rounded-sm border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-3">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
          <span>Part barcode</span>
          <span>{snapshot.moNumber}</span>
        </div>
        <Barcode value={snapshot.moNumber} height={42} className="mt-2" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
        <LabelCell label="Qty" value={String(qty)} />
        <LabelCell label="Work order" value={snapshot.woNumber} />
        <LabelCell label="Lot" value="LOT-2026-005" />
        <LabelCell label="Bin" value="WIP-A12" />
        <LabelCell label="Heat" value="H-08145" />
        <LabelCell label="Sales order" value="SO-2026-0233" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--neutral-200)] pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={operatorImage} alt={snapshot.operatorName} className="object-cover" />
            <AvatarFallback className="bg-[var(--mw-mirage)] text-[10px] font-medium text-[var(--mw-yellow-400)]">
              {snapshot.operatorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-700)]">
            {snapshot.operatorInitials}
          </div>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
          {timestamp}
        </span>
      </div>
    </div>
  );
}

function LabelCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-[var(--neutral-100)] px-2.5 py-2">
      <div>{label}</div>
      <div className="mt-0.5 text-sm font-medium normal-case tracking-normal text-[var(--mw-mirage)]">
        {value}
      </div>
    </div>
  );
}
