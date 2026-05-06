/**
 * ShipScanToShip — Mock scanning interface for warehouse pick-pack-ship workflow.
 * Large touch targets (56px), scan input, matched items list, and packing list generation.
 */
import { useMemo, useState } from "react";
import { Check, PackagePlus, Trash2, Package, Truck, Printer, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { ScanInput } from "@/components/shared/barcode/ScanInput";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/components/ui/utils";

interface ScannedItem {
  id: string;
  barcode: string;
  description: string;
  qty: number;
  matched: boolean;
  unitWeightKg?: number;
}

const EXPECTED_ITEMS = [
  { barcode: "BKT-001-001", description: "Mounting Bracket 90deg x50", qty: 50, unitWeightKg: 0.42 },
  { barcode: "PLT-042-001", description: "Base Plate 200x200 x30", qty: 30, unitWeightKg: 1.85 },
  { barcode: "FST-010-001", description: "M10 Hex Bolt Kit x16", qty: 16, unitWeightKg: 0.18 },
  { barcode: "HW-KIT-001", description: "Hardware Kit M10 SS x4", qty: 4, unitWeightKg: 0.65 },
];

/** Items per carton — ops rule of thumb for typical sheet-metal shipments */
const ITEMS_PER_CARTON = 30;

const DEMO_SCANNED: ScannedItem[] = [
  {
    id: "scan-demo-1",
    barcode: "BKT-001-001",
    description: "Mounting Bracket 90deg x50",
    qty: 50,
    matched: true,
    unitWeightKg: 0.42,
  },
  {
    id: "scan-demo-2",
    barcode: "PLT-042-001",
    description: "Base Plate 200x200 x30",
    qty: 30,
    matched: true,
    unitWeightKg: 1.85,
  },
  {
    id: "scan-demo-3",
    barcode: "FST-010-001",
    description: "M10 Hex Bolt Kit x16",
    qty: 16,
    matched: true,
    unitWeightKg: 0.18,
  },
  {
    id: "scan-demo-4",
    barcode: "MISC-9921",
    description: "Unknown item (MISC-9921)",
    qty: 1,
    matched: false,
  },
];

const DEMO_SHIPMENT = {
  ref: "SH-2026-0142",
  customer: "TechCorp Industries",
  destination: "12 Industrial Drive, Smithfield NSW 2164",
  carrier: "StarTrack Premium",
  service: "Next-day road",
  poRef: "PO-2026-0089",
};

export function ShipScanToShip() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>(DEMO_SCANNED);
  const [packingListOpen, setPackingListOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleScan = (value: string) => {
    const match = EXPECTED_ITEMS.find(
      (item) => item.barcode.toUpperCase() === value,
    );
    const already = scannedItems.find(
      (s) => s.barcode.toUpperCase() === value,
    );

    if (already) {
      toast.info("Item already scanned", {
        description: already.description,
      });
    } else {
      const newItem: ScannedItem = {
        id: `scan-${Date.now()}`,
        barcode: value,
        description: match?.description ?? `Unknown item (${value})`,
        qty: match?.qty ?? 1,
        matched: !!match,
        unitWeightKg: match?.unitWeightKg,
      };
      setScannedItems((prev) => [...prev, newItem]);
      toast.success(match ? "Item matched" : "Unknown barcode scanned", {
        description: newItem.description,
      });
    }
  };

  const removeItem = (id: string) => {
    setScannedItems((prev) => prev.filter((s) => s.id !== id));
  };

  const matchedCount = scannedItems.filter((s) => s.matched).length;
  const totalExpected = EXPECTED_ITEMS.length;
  const allMatched = matchedCount === totalExpected;

  /* ----------------------- Packing list summary ----------------------- */
  const matchedItems = useMemo(
    () => scannedItems.filter((s) => s.matched),
    [scannedItems],
  );
  const unmatchedCount = scannedItems.length - matchedItems.length;

  const totalUnits = useMemo(
    () => matchedItems.reduce((sum, item) => sum + item.qty, 0),
    [matchedItems],
  );

  const totalWeightKg = useMemo(
    () =>
      matchedItems.reduce(
        (sum, item) => sum + item.qty * (item.unitWeightKg ?? 0),
        0,
      ),
    [matchedItems],
  );

  const cartonCount = Math.max(1, Math.ceil(totalUnits / ITEMS_PER_CARTON));

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  const handleGeneratePackingList = () => {
    setPackingListOpen(true);
  };

  const handleConfirmDispatch = () => {
    setConfirming(true);
    // TODO(backend): shipments.confirmDispatch({ ref, items, cartons, weightKg })
    setTimeout(() => {
      setConfirming(false);
      setPackingListOpen(false);
      setScannedItems([]);
      toast.success(`Shipment ${DEMO_SHIPMENT.ref} dispatched`, {
        description: `${cartonCount} carton(s) · ${totalWeightKg.toFixed(1)} kg · ${DEMO_SHIPMENT.carrier}`,
      });
    }, 600);
  };

  return (
    <PageShell>
      <PageHeader
        title="Scan to Ship"
        subtitle="Scan barcodes to verify and pack shipment items"
        breadcrumbs={[
          { label: "Ship", href: "/ship" },
          { label: "Scan to Ship" },
        ]}
      />

      {/* Scan input */}
      <motion.div variants={staggerItem}>
        <Card variant="flat" className="p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--neutral-500)]">
              Scan Barcode
            </label>
            <ScanInput
              onScan={(value) => handleScan(value)}
              placeholder="Scan or type barcode..."
              showCamera
            />
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-[var(--neutral-500)]">
            <span>
              Progress:{" "}
              <span className="font-mono font-medium text-foreground">
                {matchedCount}/{totalExpected}
              </span>{" "}
              items matched
            </span>
            {allMatched && (
              <Badge
                variant="outline"
                className="border-[var(--mw-success)] text-[var(--mw-success)]"
              >
                <Check className="mr-1 h-3 w-3" strokeWidth={1.5} />
                All items matched
              </Badge>
            )}
          </div>

          {/* Expected items hint */}
          <p className="mt-2 text-xs text-[var(--neutral-400)]">
            Try scanning:{" "}
            {EXPECTED_ITEMS.map((e) => (
              <code
                key={e.barcode}
                className="mx-0.5 rounded bg-[var(--neutral-100)] px-1.5 py-0.5 font-mono text-xs"
              >
                {e.barcode}
              </code>
            ))}
          </p>
        </Card>
      </motion.div>

      {/* Scanned items list */}
      <motion.div variants={staggerItem}>
        <Card variant="flat" className="p-6">
          <h3 className="mb-4 text-base font-medium text-foreground">
            Scanned Items ({scannedItems.length})
          </h3>

          {scannedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--neutral-400)]">
              <Package className="mb-3 h-10 w-10" strokeWidth={1.5} />
              <p className="text-sm">No items scanned yet</p>
              <p className="text-xs">
                Scan a barcode above to begin
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--neutral-200)]">
              {scannedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 py-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      item.matched
                        ? "bg-[var(--mw-success-light)] text-[var(--mw-success)]"
                        : "bg-[var(--neutral-100)] text-[var(--neutral-500)]",
                    )}
                  >
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.description}
                    </p>
                    <p className="font-mono text-xs text-[var(--neutral-500)]">
                      {item.barcode} &middot; Qty {item.qty}
                    </p>
                  </div>
                  <Badge variant={item.matched ? "default" : "outline"}>
                    {item.matched ? "Matched" : "Unmatched"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-[56px] min-w-[56px]"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2
                      className="h-4 w-4 text-[var(--neutral-500)]"
                      strokeWidth={1.5}
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {scannedItems.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleGeneratePackingList}
                disabled={matchedItems.length === 0}
                className="min-h-[56px] px-8"
              >
                <PackagePlus className="mr-2 h-5 w-5" strokeWidth={1.5} />
                Generate Packing List
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Packing list preview + dispatch confirmation */}
      <Dialog open={packingListOpen} onOpenChange={setPackingListOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Packing list — {DEMO_SHIPMENT.ref}</DialogTitle>
            <DialogDescription>
              Review carton summary and confirm dispatch. A carrier label and
              packing list PDF will be generated automatically.
            </DialogDescription>
          </DialogHeader>

          {/* Shipment header */}
          <div className="grid grid-cols-2 gap-4 rounded-md border border-[var(--border)] bg-[var(--neutral-50)] p-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[var(--neutral-500)]">
                Customer
              </p>
              <p className="font-medium text-foreground">{DEMO_SHIPMENT.customer}</p>
              <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                {DEMO_SHIPMENT.destination}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[var(--neutral-500)]">
                Carrier
              </p>
              <p className="font-medium text-foreground">{DEMO_SHIPMENT.carrier}</p>
              <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                {DEMO_SHIPMENT.service} · Ref {DEMO_SHIPMENT.poRef} · {today}
              </p>
            </div>
          </div>

          {/* Carton / weight summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-[var(--border)] p-3">
              <p className="text-[11px] uppercase tracking-wider text-[var(--neutral-500)]">
                Cartons
              </p>
              <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
                {cartonCount}
              </p>
              <p className="text-xs text-[var(--neutral-500)]">
                {ITEMS_PER_CARTON}/carton max
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] p-3">
              <p className="text-[11px] uppercase tracking-wider text-[var(--neutral-500)]">
                Total units
              </p>
              <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
                {totalUnits}
              </p>
              <p className="text-xs text-[var(--neutral-500)]">
                Across {matchedItems.length} SKUs
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] p-3">
              <p className="text-[11px] uppercase tracking-wider text-[var(--neutral-500)]">
                Gross weight
              </p>
              <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
                {totalWeightKg.toFixed(1)}
                <span className="ml-1 text-sm text-[var(--neutral-500)]">kg</span>
              </p>
              <p className="text-xs text-[var(--neutral-500)]">
                Includes packaging
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
              Line items ({matchedItems.length})
            </p>
            <div className="overflow-hidden rounded-md border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--neutral-50)] text-[11px] uppercase tracking-wider text-[var(--neutral-500)]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">SKU</th>
                    <th className="px-3 py-2 text-left font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--neutral-200)]">
                  {matchedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-mono text-xs text-foreground">
                        {item.barcode}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {item.description}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">
                        {item.qty}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[var(--neutral-500)]">
                        {((item.unitWeightKg ?? 0) * item.qty).toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {unmatchedCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-[var(--mw-warning)]/30 bg-[var(--mw-warning)]/5 p-3 text-xs text-[var(--mw-yellow-700)] dark:text-[var(--mw-yellow-400)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>
                {unmatchedCount} unmatched scan{unmatchedCount === 1 ? "" : "s"}{" "}
                excluded from this packing list. Resolve or remove before dispatch
                if required.
              </span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="border-[var(--border)]"
              onClick={() => toast.success("Packing list PDF queued for printer")}
            >
              <Printer className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Print
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border)]"
              onClick={() => setPackingListOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDispatch}
              disabled={confirming}
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            >
              <Truck className="mr-2 h-4 w-4" strokeWidth={1.5} />
              {confirming ? "Dispatching…" : "Confirm dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
