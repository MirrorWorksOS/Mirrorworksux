/**
 * ShipScanToShip — Mock scanning interface for warehouse pick-pack-ship workflow.
 * Large touch targets (56px), scan input, matched items list, and packing list generation.
 */
import { useState, useRef } from "react";
import { ScanBarcode, Check, PackagePlus, Trash2, Package } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

interface ScannedItem {
  id: string;
  barcode: string;
  description: string;
  qty: number;
  matched: boolean;
}

const EXPECTED_ITEMS = [
  { barcode: "BKT-001-001", description: "Mounting Bracket 90deg x50", qty: 50 },
  { barcode: "PLT-042-001", description: "Base Plate 200x200 x30", qty: 30 },
  { barcode: "FST-010-001", description: "M10 Hex Bolt Kit x16", qty: 16 },
  { barcode: "HW-KIT-001", description: "Hardware Kit M10 SS x4", qty: 4 },
];

export function ShipScanToShip() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [scanInput, setScanInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    const trimmed = scanInput.trim().toUpperCase();
    if (!trimmed) return;

    const match = EXPECTED_ITEMS.find(
      (item) => item.barcode.toUpperCase() === trimmed,
    );
    const already = scannedItems.find(
      (s) => s.barcode.toUpperCase() === trimmed,
    );

    if (already) {
      toast.info("Item already scanned", {
        description: already.description,
      });
    } else {
      const newItem: ScannedItem = {
        id: `scan-${Date.now()}`,
        barcode: trimmed,
        description: match?.description ?? `Unknown item (${trimmed})`,
        qty: match?.qty ?? 1,
        matched: !!match,
      };
      setScannedItems((prev) => [...prev, newItem]);
      toast.success(match ? "Item matched" : "Unknown barcode scanned", {
        description: newItem.description,
      });
    }

    setScanInput("");
    inputRef.current?.focus();
  };

  const removeItem = (id: string) => {
    setScannedItems((prev) => prev.filter((s) => s.id !== id));
  };

  const matchedCount = scannedItems.filter((s) => s.matched).length;
  const totalExpected = EXPECTED_ITEMS.length;
  const allMatched = matchedCount === totalExpected;

  const handleGeneratePackingList = () => {
    toast.success("Packing list generated", {
      description: `${scannedItems.length} item(s) included in packing list PDF.`,
    });
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label
                htmlFor="scan-input"
                className="text-sm font-medium text-[var(--neutral-500)]"
              >
                Scan Barcode
              </label>
              <div className="relative">
                <ScanBarcode
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--neutral-400)]"
                  strokeWidth={1.5}
                />
                <Input
                  ref={inputRef}
                  id="scan-input"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  placeholder="Scan or type barcode..."
                  className="min-h-[56px] pl-11 text-lg font-mono"
                  autoFocus
                />
              </div>
            </div>
            <Button
              onClick={handleScan}
              className="min-h-[56px] px-8"
              disabled={!scanInput.trim()}
            >
              <ScanBarcode className="mr-2 h-5 w-5" strokeWidth={1.5} />
              Scan
            </Button>
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
                className="min-h-[56px] px-8"
              >
                <PackagePlus className="mr-2 h-5 w-5" strokeWidth={1.5} />
                Generate Packing List
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </PageShell>
  );
}
