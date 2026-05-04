import { useEffect, useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';

const HOLD_REASONS = [
  'Awaiting tooling',
  'Awaiting material',
  'Awaiting quality sign-off',
  'Machine fault',
  'Operator break',
  'Shift change',
];

interface HoldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { reason: string; notes: string }) => void;
}

export function HoldDialog({ open, onOpenChange, onSubmit }: HoldDialogProps) {
  const [reason, setReason] = useState(HOLD_REASONS[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) {
      setReason(HOLD_REASONS[0]);
      setNotes('');
    }
  }, [open]);

  const submit = () => {
    onSubmit({ reason, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Place job on hold</DialogTitle>
          <DialogDescription>
            The cycle timer will pause until the job is resumed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div>
            <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Reason
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-2 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOLD_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add context for the next operator."
              className="mt-2 min-h-[80px]"
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
            Place on hold
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
