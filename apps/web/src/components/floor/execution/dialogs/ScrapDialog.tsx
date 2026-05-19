import { useEffect, useRef, useState } from 'react';
import { Camera, Minus, Plus } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';

interface ScrapDialogProps {
  open: boolean;
  reasons: string[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { qty: number; reason: string; notes: string }) => void;
}

export function ScrapDialog({ open, reasons, onOpenChange, onSubmit }: ScrapDialogProps) {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<string>(reasons[0] ?? 'Material defect');
  const [notes, setNotes] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQty(1);
      setReason(reasons[0] ?? 'Material defect');
      setNotes('');
      setPhotoName(null);
    }
  }, [open, reasons]);

  const submit = () => {
    onSubmit({ qty, reason, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Report scrap</DialogTitle>
          <DialogDescription>
            Capture qty and reason. Inventory will be adjusted automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div>
            <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Quantity scrapped
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
              Reason
            </Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {reasons.map((r) => {
                const active = r === reason;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`h-12 rounded-md border text-sm font-medium transition-colors ${
                      active
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-mirage)]'
                        : 'border-[var(--neutral-200)] bg-card text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Photo (optional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                const f = event.target.files?.[0];
                if (f) setPhotoName(f.name);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-2 h-12 w-full justify-start gap-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {photoName ?? 'Capture photo'}
            </Button>
          </div>

          <div>
            <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any context the next operator should know."
              className="mt-2 min-h-[88px]"
            />
          </div>
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
            Record scrap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
