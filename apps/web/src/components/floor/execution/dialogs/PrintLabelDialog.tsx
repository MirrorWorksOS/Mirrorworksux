import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Printer } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkOrderExecutionSnapshot } from '../types';
import { Barcode } from './Barcode';

const TEMPLATES = [
  'WIP to Finished Goods',
  'Finished Goods to Dispatch',
  'Material Move',
];

const PRINTERS = ['Zebra ZD420 — Bay 1', 'Zebra ZD420 — Dispatch'];

interface PrintLabelDialogProps {
  open: boolean;
  snapshot: WorkOrderExecutionSnapshot;
  defaultQty: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { template: string; qty: number; printer: string }) => void;
}

export function PrintLabelDialog({
  open,
  snapshot,
  defaultQty,
  onOpenChange,
  onSubmit,
}: PrintLabelDialogProps) {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [qty, setQty] = useState(Math.max(1, defaultQty));
  const [printer, setPrinter] = useState(PRINTERS[0]);

  useEffect(() => {
    if (!open) {
      setTemplate(TEMPLATES[0]);
      setQty(Math.max(1, defaultQty));
      setPrinter(PRINTERS[0]);
    }
  }, [open, defaultQty]);

  const stageCaption = useMemo(() => template.toUpperCase(), [template]);

  const submit = () => {
    onSubmit({ template, qty, printer });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Print labels</DialogTitle>
          <DialogDescription>
            Pre-filled from this work order. Preview shown below the inputs.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-5">
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Template
              </Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Quantity of labels
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 p-0"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="min-w-[3rem] text-center text-3xl font-medium tabular-nums text-[var(--neutral-900)]">
                  {qty}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 p-0"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Printer
              </Label>
              <Select value={printer} onValueChange={setPrinter}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINTERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <LabelPreview
            stageCaption={stageCaption}
            snapshot={snapshot}
            qty={qty}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="lg"
            className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
            onClick={submit}
          >
            <Printer className="h-4 w-4" />
            Print {qty} label{qty === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LabelPreview({
  stageCaption,
  snapshot,
  qty,
}: {
  stageCaption: string;
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
            {snapshot.customerInitial && snapshot.woCreatedAtLabel
              ? snapshot.woCreatedAtLabel
              : 'Issued today'}
          </div>
        </div>
        <span className="rounded-full border border-[var(--mw-mirage)] bg-[var(--mw-mirage)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--mw-yellow-400)]">
          {stageCaption}
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
        <LabelCell label="PO" value="PO-2026-1198" />
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
