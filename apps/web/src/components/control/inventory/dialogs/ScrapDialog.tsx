/**
 * Scrap dialog — first-class stock write-off, distinct from count
 * corrections. Moves stock to the virtual Scrap location with an
 * operator-selected reason code from Inventory settings.
 */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { inventoryService } from '@/services';
import type { InventorySettings, Product, StockLocation } from '@/types/entities';

interface ScrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  locations: StockLocation[];
  settings: InventorySettings;
  onDone: () => void;
  /** Pre-select a product (row action). */
  initialProductId?: string;
  initialLocationId?: string;
}

export function ScrapDialog({
  open, onOpenChange, products, locations, settings, onDone,
  initialProductId, initialLocationId,
}: ScrapDialogProps) {
  const [productId, setProductId] = useState(initialProductId ?? '');
  const [locationId, setLocationId] = useState(initialLocationId ?? '');
  const [qty, setQty] = useState('');
  const [reasonCode, setReasonCode] = useState(settings.scrapReasonCodes[0] ?? 'Damaged');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const stockLocations = useMemo(
    () => locations.filter((l) => l.kind !== 'scrap'),
    [locations],
  );

  const reset = () => {
    setProductId(initialProductId ?? '');
    setLocationId(initialLocationId ?? '');
    setQty('');
    setNote('');
  };

  const handleSubmit = async () => {
    const parsedQty = Number(qty);
    if (!productId) { toast.error('Select a product to scrap.'); return; }
    if (settings.storageLocationsEnabled && !locationId) { toast.error('Select a location.'); return; }
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) { toast.error('Enter a positive quantity.'); return; }
    setBusy(true);
    try {
      await inventoryService.scrap({
        productId,
        locationId: settings.storageLocationsEnabled ? locationId : undefined,
        qty: parsedQty,
        reasonCode,
        note: note || undefined,
      });
      toast.success(`Scrapped ${parsedQty} × ${products.find((p) => p.id === productId)?.partNumber ?? ''}`);
      onOpenChange(false);
      reset();
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Scrap failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scrap stock</DialogTitle>
          <DialogDescription>
            Write off material to the scrap location. Use an Adjustment for count corrections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="mt-1.5 h-10 w-full"><SelectValue placeholder="Select product…" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {(p.sku ?? p.partNumber)} — {p.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn('grid gap-3', settings.storageLocationsEnabled ? 'grid-cols-2' : 'grid-cols-1')}>
            {settings.storageLocationsEnabled && (
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="mt-1.5 h-10 w-full"><SelectValue placeholder="From…" /></SelectTrigger>
                  <SelectContent>
                    {stockLocations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="scrap-qty" className="text-sm font-medium">Quantity</Label>
              <Input
                id="scrap-qty" type="number" min={1} className="mt-1.5 h-10"
                placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Reason</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {settings.scrapReasonCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setReasonCode(code)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    reasonCode === code
                      ? 'bg-[var(--mw-mirage)] text-white'
                      : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]',
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="scrap-note" className="text-sm font-medium">Notes (optional)</Label>
            <Textarea
              id="scrap-note" className="mt-1.5" rows={2}
              placeholder="What happened?" value={note} onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="rounded-full bg-[var(--mw-error)] hover:bg-[var(--mw-error)]/90 text-white"
            onClick={handleSubmit}
            disabled={busy}
          >
            Scrap stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
