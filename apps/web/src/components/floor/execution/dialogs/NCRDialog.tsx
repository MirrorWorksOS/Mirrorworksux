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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const DEFECT_TYPES = ['Dimensional', 'Surface finish', 'Material', 'Tooling', 'Program', 'Other'];

interface NCRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    defectType: string;
    affectedQty: number;
    measurement: string;
    notes: string;
  }) => void;
}

export function NCRDialog({ open, onOpenChange, onSubmit }: NCRDialogProps) {
  const [defectType, setDefectType] = useState('Dimensional');
  const [affectedQty, setAffectedQty] = useState(1);
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementSpec, setMeasurementSpec] = useState('');
  const [notes, setNotes] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setDefectType('Dimensional');
      setAffectedQty(1);
      setMeasurementValue('');
      setMeasurementSpec('');
      setNotes('');
      setPhotoName(null);
    }
  }, [open]);

  const submit = () => {
    const measurement =
      measurementValue || measurementSpec
        ? `${measurementValue} vs ${measurementSpec}`.trim()
        : '';
    onSubmit({ defectType, affectedQty, measurement, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Raise NCR</DialogTitle>
          <DialogDescription>
            Capture the non-conformance. The cycle timer will pause and a supervisor will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Defect type
              </Label>
              <Select value={defectType} onValueChange={setDefectType}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFECT_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Affected qty
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 p-0"
                  onClick={() => setAffectedQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2.5rem] text-center text-2xl font-medium tabular-nums text-[var(--neutral-900)]">
                  {affectedQty}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 p-0"
                  onClick={() => setAffectedQty((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Measured
              </Label>
              <Input
                value={measurementValue}
                onChange={(event) => setMeasurementValue(event.target.value)}
                placeholder="e.g. 78.4 mm"
                className="mt-2 h-12"
              />
            </div>
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Spec
              </Label>
              <Input
                value={measurementSpec}
                onChange={(event) => setMeasurementSpec(event.target.value)}
                placeholder="e.g. 80.0 mm ±0.2"
                className="mt-2 h-12"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Photo
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
              Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What did you see? What did you try?"
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
            className="bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90"
            onClick={submit}
          >
            Raise NCR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
