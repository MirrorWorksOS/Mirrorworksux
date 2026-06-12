/**
 * Stock location (bin) create / edit form.
 */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { inventoryService } from '@/services';
import type { StockLocation } from '@/types/entities';

const KIND_OPTIONS: { value: Exclude<StockLocation['kind'], 'scrap'>; label: string }[] = [
  { value: 'raw', label: 'Raw materials' },
  { value: 'wip', label: 'Work in progress' },
  { value: 'finished', label: 'Finished goods' },
  { value: 'subcontract', label: 'Subcontract' },
];

interface StockLocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null = create. */
  location: StockLocation | null;
  onDone: () => void;
}

export function StockLocationFormDialog({
  open, onOpenChange, location, onDone,
}: StockLocationFormDialogProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<StockLocation['kind']>('raw');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setCode(location?.code ?? '');
      setName(location?.name ?? '');
      setKind(location?.kind ?? 'raw');
    }
  }, [open, location]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error('Code and name are required.');
      return;
    }
    setBusy(true);
    try {
      if (location) {
        await inventoryService.updateLocation(location.id, {
          code: code.trim().toUpperCase(), name: name.trim(), kind,
        });
        toast.success('Location updated');
      } else {
        await inventoryService.createLocation({
          code: code.trim().toUpperCase(), name: name.trim(), kind,
        });
        toast.success('Location created');
      }
      onOpenChange(false);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{location ? 'Edit location' : 'New stock location'}</DialogTitle>
          <DialogDescription>
            A bin or zone within your facility where stock is held.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="loc-code" className="text-sm font-medium">Code</Label>
              <Input
                id="loc-code" className="mt-1.5 h-10 uppercase" placeholder="e.g. RAW-A1"
                value={code} onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as StockLocation['kind'])} disabled={location?.kind === 'scrap'}>
                <SelectTrigger className="mt-1.5 h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="loc-name" className="text-sm font-medium">Name</Label>
            <Input
              id="loc-name" className="mt-1.5 h-10" placeholder="e.g. Raw rack A, bay 1"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleSubmit}
            disabled={busy}
          >
            {location ? 'Save changes' : 'Create location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
