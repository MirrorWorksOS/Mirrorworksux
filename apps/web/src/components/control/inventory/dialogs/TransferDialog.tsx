/**
 * Transfer dialog — move stock between bins. Bound to real
 * StockLocations (the old dialog used free-text inputs) with
 * available-quantity validation. Disabled entirely when storage
 * locations are switched off in Inventory settings.
 */
import { useEffect, useMemo, useState } from 'react';
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
import type { LedgerRow } from '@/services/inventoryService';
import type { Product, StockLocation } from '@/types/entities';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  locations: StockLocation[];
  onDone: () => void;
  initialProductId?: string;
  initialFromLocationId?: string;
}

export function TransferDialog({
  open, onOpenChange, products, locations, onDone,
  initialProductId, initialFromLocationId,
}: TransferDialogProps) {
  const [productId, setProductId] = useState(initialProductId ?? '');
  const [fromLocationId, setFromLocationId] = useState(initialFromLocationId ?? '');
  const [toLocationId, setToLocationId] = useState('');
  const [qty, setQty] = useState('');
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

  const availableAtSource = useMemo(() => {
    if (!productId || !fromLocationId) return undefined;
    const row = ledger.find(
      (r) => r.product.id === productId && r.location?.id === fromLocationId,
    );
    return row ? row.qtyAvailable : 0;
  }, [ledger, productId, fromLocationId]);

  const handleSubmit = async () => {
    const parsedQty = Number(qty);
    if (!productId) { toast.error('Select a product.'); return; }
    if (!fromLocationId || !toLocationId) { toast.error('Select both locations.'); return; }
    if (fromLocationId === toLocationId) { toast.error('Source and destination must differ.'); return; }
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) { toast.error('Enter a positive quantity.'); return; }
    setBusy(true);
    try {
      await inventoryService.transfer({
        productId, fromLocationId, toLocationId, qty: parsedQty,
      });
      toast.success('Transfer recorded');
      onOpenChange(false);
      setQty('');
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transfer failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stock transfer</DialogTitle>
          <DialogDescription>Move stock between locations.</DialogDescription>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">From</Label>
              <Select value={fromLocationId} onValueChange={setFromLocationId}>
                <SelectTrigger className="mt-1.5 h-10 w-full"><SelectValue placeholder="Source…" /></SelectTrigger>
                <SelectContent>
                  {stockLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">To</Label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger className="mt-1.5 h-10 w-full"><SelectValue placeholder="Destination…" /></SelectTrigger>
                <SelectContent>
                  {stockLocations
                    .filter((l) => l.id !== fromLocationId)
                    .map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="trf-qty" className="text-sm font-medium">Quantity</Label>
            <Input
              id="trf-qty" type="number" min={1} className="mt-1.5 h-10"
              placeholder="Qty to transfer" value={qty} onChange={(e) => setQty(e.target.value)}
            />
            {availableAtSource !== undefined && (
              <p className="text-xs text-[var(--neutral-500)] mt-1.5">
                Available at source: <span className="font-medium tabular-nums">{availableAtSource}</span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleSubmit}
            disabled={busy}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
