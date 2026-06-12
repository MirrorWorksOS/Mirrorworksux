/**
 * Adjustment dialog — strictly count corrections. The operator enters
 * the counted quantity; the delta against current on-hand is computed
 * live. Write-offs belong in the Scrap dialog.
 */
import { useEffect, useMemo, useState } from 'react';
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
import type { LedgerRow } from '@/services/inventoryService';
import type { InventorySettings, Product, StockLocation } from '@/types/entities';

interface AdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  locations: StockLocation[];
  settings: InventorySettings;
  onDone: () => void;
  initialProductId?: string;
  initialLocationId?: string;
}

export function AdjustmentDialog({
  open, onOpenChange, products, locations, settings, onDone,
  initialProductId, initialLocationId,
}: AdjustmentDialogProps) {
  const [productId, setProductId] = useState(initialProductId ?? '');
  const [locationId, setLocationId] = useState(initialLocationId ?? '');
  const [countedQty, setCountedQty] = useState('');
  const [reasonCode, setReasonCode] = useState(settings.adjustmentReasonCodes[0] ?? 'Count error');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    inventoryService.listLedger().then((rows) => {
      if (!cancelled) setLedger(rows);
    });
    return () => { cancelled = true; };
  }, [open]);

  const stockLocations = useMemo(
    () => locations.filter((l) => l.kind !== 'scrap'),
    [locations],
  );

  const currentOnHand = useMemo(() => {
    if (!productId) return undefined;
    const row = ledger.find(
      (r) => r.product.id === productId &&
        (!settings.storageLocationsEnabled || r.location?.id === locationId),
    );
    return row?.qtyOnHand ?? 0;
  }, [ledger, productId, locationId, settings.storageLocationsEnabled]);

  const parsedCount = Number(countedQty);
  const delta =
    countedQty !== '' && Number.isFinite(parsedCount) && currentOnHand !== undefined
      ? parsedCount - currentOnHand
      : undefined;

  const handleSubmit = async () => {
    if (!productId) { toast.error('Select a product.'); return; }
    if (settings.storageLocationsEnabled && !locationId) { toast.error('Select a location.'); return; }
    if (!Number.isFinite(parsedCount) || parsedCount < 0) { toast.error('Enter the counted quantity (zero or more).'); return; }
    setBusy(true);
    try {
      await inventoryService.adjust({
        productId,
        locationId: settings.storageLocationsEnabled ? locationId : undefined,
        countedQty: parsedCount,
        reasonCode,
        note: note || undefined,
      });
      toast.success('Adjustment recorded');
      onOpenChange(false);
      setCountedQty('');
      setNote('');
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Adjustment failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inventory adjustment</DialogTitle>
          <DialogDescription>
            Correct on-hand after a count. To write off damaged material, use Scrap instead.
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
                  <SelectTrigger className="mt-1.5 h-10 w-full"><SelectValue placeholder="Location…" /></SelectTrigger>
                  <SelectContent>
                    {stockLocations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="adj-counted" className="text-sm font-medium">Counted quantity</Label>
              <Input
                id="adj-counted" type="number" min={0} className="mt-1.5 h-10"
                placeholder="Counted" value={countedQty}
                onChange={(e) => setCountedQty(e.target.value)}
              />
            </div>
          </div>

          {currentOnHand !== undefined && (
            <p className="text-sm text-[var(--neutral-500)]">
              On hand: <span className="font-medium text-foreground tabular-nums">{currentOnHand}</span>
              {delta !== undefined && delta !== 0 && (
                <>
                  {' · '}Delta:{' '}
                  <span
                    className={cn(
                      'font-medium tabular-nums',
                      delta > 0 ? 'text-[var(--mw-success)]' : 'text-[var(--mw-error)]',
                    )}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </>
              )}
            </p>
          )}

          <div>
            <Label className="text-sm font-medium">Reason</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {settings.adjustmentReasonCodes.map((code) => (
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
            <Label htmlFor="adj-note" className="text-sm font-medium">Notes (optional)</Label>
            <Textarea
              id="adj-note" className="mt-1.5" rows={2}
              placeholder="Additional details…" value={note} onChange={(e) => setNote(e.target.value)}
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
            Record adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
