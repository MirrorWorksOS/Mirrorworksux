/**
 * Buy Receipts - Touch-optimized goods receipt logging
 * Large touch targets for shop floor use with gloved hands
 */

import { useRef, useState } from 'react';
import { CheckCircle2, Scan, Camera } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';


interface POForReceipt {
  id: string;
  poNumber: string;
  supplier: string;
  expectedDate: string;
  items: { name: string; ordered: number; received: number; unit: string }[];
}

import { purchaseOrders } from '@/services';

const mockPOs: POForReceipt[] = purchaseOrders
  .filter((po) => po.status !== 'received' && po.status !== 'cancelled' && po.status !== 'draft')
  .slice(0, 2)
  .map((po) => ({
    id: po.id,
    poNumber: po.poNumber,
    supplier: po.supplierName,
    expectedDate: po.deliveryDate,
    items: [
      { name: 'Mild Steel Sheet 1200x2400x3mm', ordered: 50, received: po.received > 0 ? 10 : 0, unit: 'sheets' },
      ...(po.total > 10000 ? [{ name: 'Aluminium Angle 50x50x5mm', ordered: 20, received: 0, unit: 'lengths' }] : []),
    ],
  }));

export function BuyReceipts() {
  const [selectedPO, setSelectedPO] = useState<POForReceipt | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleBarcodeSubmit = () => {
    // TODO(backend): receipts.scanBarcode(selectedPO.id, barcodeInput) — match SKU and increment received qty.
    if (!barcodeInput.trim()) return;
    toast.success(`Scanned ${barcodeInput.trim()}`);
    setBarcodeInput('');
    setScannerOpen(false);
  };

  const handlePhotoChosen = (file: File) => {
    // TODO(backend): receipts.uploadPhoto(selectedPO.id, file) — attach to receipt record.
    toast.success(`Photo "${file.name}" attached to receipt`);
  };

  const handleReceive = () => {
    toast.success('Goods receipt confirmed');
    setSelectedPO(null);
    setQuantities({});
  };

  return (
    <PageShell>
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Goods Receipt"
        subtitle={`${mockPOs.length} POs awaiting receipt`}
      />

      {!selectedPO ? (
        /* PO Selection */
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {mockPOs.map((po) => (
            <motion.div key={po.id} variants={staggerItem} className="h-full min-h-0">
              <SpotlightCard radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
                <Card
                  variant="flat"
                  className="h-full cursor-pointer border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                  onClick={() => setSelectedPO(po)}
                >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium tabular-nums text-foreground">{po.poNumber}</h3>
                    <p className="text-sm text-[var(--neutral-500)]">{po.supplier}</p>
                  </div>
                  <Badge variant="softAccent">Pending</Badge>
                </div>
                <p className="text-xs text-[var(--neutral-600)] mb-3">Expected: {new Date(po.expectedDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="text-sm text-[var(--neutral-500)]">{po.items.length} items</span>
                  <Button size="sm" className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-primary-foreground h-10 px-5">
                    Start Receipt →
                  </Button>
                </div>
                </Card>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Receipt Entry Form - TOUCH OPTIMIZED */
        <Card className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-medium tabular-nums text-foreground">{selectedPO.poNumber}</h2>
              <p className="text-sm text-[var(--neutral-500)]">{selectedPO.supplier}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedPO(null)} className="h-12 px-6 text-base">
              Cancel
            </Button>
          </div>

          {/* Barcode Scanner (placeholder) */}
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1 h-20 text-base border-[var(--border)] hover:bg-[var(--neutral-100)]" onClick={() => setScannerOpen(true)}>
              <Scan className="w-6 h-6 mr-3" />
              Scan Barcode
            </Button>
            <Button variant="outline" className="flex-1 h-20 text-base border-[var(--border)] hover:bg-[var(--neutral-100)]" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-6 h-6 mr-3" />
              Take Photo
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoChosen(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Items to Receive */}
          <div className="space-y-4">
            {selectedPO.items.map((item, idx) => (
              <div key={idx} className="p-6 bg-[var(--neutral-100)] rounded-lg border border-[var(--border)]">
                <h3 className="text-base font-medium text-foreground mb-2">{item.name}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Ordered</p>
                    <p className="text-lg font-medium tabular-nums text-foreground">
                      {item.ordered} {item.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Already Received</p>
                    <p className="text-lg font-medium tabular-nums text-[var(--neutral-500)]">
                      {item.received} {item.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Outstanding</p>
                    <p className="text-lg font-medium tabular-nums text-[var(--mw-yellow-400)]">
                      {item.ordered - item.received} {item.unit}
                    </p>
                  </div>
                </div>

                {/* Touch-optimized quantity input */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground min-w-[120px]">Receiving now:</label>
                  <Input
                    type="number"
                    min="0"
                    max={item.ordered - item.received}
                    value={quantities[idx] || ''}
                    onChange={(e) => setQuantities({ ...quantities, [idx]: parseInt(e.target.value) || 0 })}
                    className="h-16 text-2xl  font-medium text-center border-[var(--border)] w-32"
                    placeholder="0"
                  />
                  <span className="text-sm text-[var(--neutral-500)]">{item.unit}</span>
                  <Button
                    onClick={() => setQuantities({ ...quantities, [idx]: item.ordered - item.received })}
                    className="ml-auto h-12 bg-[var(--border)] hover:bg-[var(--neutral-300)] text-foreground"
                  >
                    Receive All
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleReceive}
              disabled={Object.values(quantities).every(q => q === 0)}
              className="flex-1 h-16 text-lg bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-primary-foreground disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-foreground/[0.38]"
            >
              <CheckCircle2 className="w-6 h-6 mr-3" />
              Confirm Receipt
            </Button>
          </div>
        </Card>
      )}
    </motion.div>

    <Sheet open={scannerOpen} onOpenChange={setScannerOpen}>
      <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]">
        <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
          <SheetTitle className="text-base font-medium text-foreground">Scan barcode</SheetTitle>
          <SheetDescription className="text-[var(--neutral-500)] text-xs">
            Type or scan a barcode. Will match against this PO's expected items.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 space-y-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Barcode</label>
            <Input
              autoFocus
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeSubmit(); }}
              placeholder="e.g. 0123456789012"
            />
          </div>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setScannerOpen(false)}>Cancel</Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleBarcodeSubmit}
            disabled={!barcodeInput.trim()}
          >
            Scan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
    </PageShell>
  );
}
