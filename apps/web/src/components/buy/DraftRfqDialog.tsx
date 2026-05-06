/**
 * Draft RFQ dialog — opened from the Vendor Comparison agent insight card.
 * Lets the user assemble line items (product, qty, supplier) and "send" the
 * RFQ to the selected vendors.
 */

import { useEffect, useState } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** RFQs only target purchased materials & consumables — manufactured/finished
 *  goods are produced in-house and never need a quote. Mirrors the "Purchased"
 *  rows on Control → Products. */
const PURCHASED_MATERIALS = [
  { sku: "MAT-MS-001", name: "Mild Steel Sheet 10mm", category: "Raw Materials" },
  { sku: "MAT-RHS-001", name: "RHS 50x25x2.5 Section", category: "Raw Materials" },
  { sku: "MAT-AL-001", name: "Aluminium Plate 5052", category: "Raw Materials" },
  { sku: "MAT-SS-304", name: "Stainless 304 Sheet 5mm", category: "Raw Materials" },
  { sku: "MAT-CR-016", name: "Cold Rolled Steel 1.6mm", category: "Raw Materials" },
  { sku: "MAT-GAL-2", name: "Galvanised Steel 2mm", category: "Raw Materials" },
  { sku: "CONS-WR-001", name: "Welding Wire ER70S-6", category: "Consumables" },
  { sku: "CONS-HW-001", name: "Hardware Kit M10 SS", category: "Consumables" },
  { sku: "CONS-PC-001", name: "Powder Coat Paint RAL 7035", category: "Consumables" },
] as const;

export interface DraftRfqVendorOption {
  supplierId: string;
  supplierName: string;
}

export interface DraftRfqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Vendors that are currently selected on the comparison page. */
  vendorOptions: DraftRfqVendorOption[];
  /** Active product / part scope from the comparison page (label only). */
  productScopeLabel?: string;
}

interface RfqLine {
  id: string;
  productId: string;
  qty: number;
  supplierId: string; // "all" routes the line to every selected vendor
}

const ALL_VENDORS = "all";

const newLine = (): RfqLine => ({
  id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  productId: PURCHASED_MATERIALS[0]?.sku ?? "",
  qty: 1,
  supplierId: ALL_VENDORS,
});

export function DraftRfqDialog({
  open,
  onOpenChange,
  vendorOptions,
  productScopeLabel,
}: DraftRfqDialogProps) {
  const [lines, setLines] = useState<RfqLine[]>([newLine()]);

  // Reset lines whenever the dialog reopens so each draft starts fresh.
  useEffect(() => {
    if (open) setLines([newLine()]);
  }, [open]);

  const addLine = () => setLines((prev) => [...prev, newLine()]);

  const removeLine = (id: string) =>
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((l) => l.id !== id),
    );

  const updateLine = (id: string, patch: Partial<RfqLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const handleSend = () => {
    const total = lines.reduce((s, l) => s + (Number.isFinite(l.qty) ? l.qty : 0), 0);
    const recipients = lines.flatMap((l) =>
      l.supplierId === ALL_VENDORS
        ? vendorOptions.map((v) => v.supplierName)
        : [
            vendorOptions.find((v) => v.supplierId === l.supplierId)
              ?.supplierName ?? "Unknown",
          ],
    );
    const uniqueRecipients = Array.from(new Set(recipients));
    // TODO(backend): rfqs.create({ lines, vendorIds: uniqueRecipients })
    toast.success(
      `RFQ drafted — ${lines.length} line item${lines.length === 1 ? "" : "s"} to ${uniqueRecipients.length} vendor${uniqueRecipients.length === 1 ? "" : "s"} (${total} units total)`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Draft Request for Quotation</DialogTitle>
          <DialogDescription>
            {productScopeLabel
              ? `Scope: ${productScopeLabel}. Add line items and assign each to a vendor.`
              : "Add line items and assign each to a vendor."}
          </DialogDescription>
        </DialogHeader>

        {/* Header row — keep aligned with the line grid below */}
        <div className="grid grid-cols-[minmax(0,1fr)_110px_minmax(0,200px)_36px] gap-3 px-1 pt-2 text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
          <span>Product</span>
          <span>Quantity</span>
          <span>Supplier</span>
          <span className="sr-only">Remove</span>
        </div>

        <div className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.id}
              className="grid grid-cols-[minmax(0,1fr)_110px_minmax(0,200px)_36px] items-center gap-3 rounded-lg border border-[var(--border)] p-2"
            >
              <Select
                value={line.productId}
                onValueChange={(v) => updateLine(line.id, { productId: v })}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="z-[1200]">
                  {PURCHASED_MATERIALS.map((p) => (
                    <SelectItem key={p.sku} value={p.sku}>
                      <span className="font-medium">{p.sku}</span>{" "}
                      <span className="text-[var(--neutral-500)]">
                        — {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min={1}
                step={1}
                value={line.qty}
                onChange={(e) =>
                  updateLine(line.id, {
                    qty: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="h-9 tabular-nums"
              />

              <Select
                value={line.supplierId}
                onValueChange={(v) => updateLine(line.id, { supplierId: v })}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="z-[1200]">
                  <SelectItem value={ALL_VENDORS}>
                    All selected vendors ({vendorOptions.length})
                  </SelectItem>
                  {vendorOptions.map((v) => (
                    <SelectItem key={v.supplierId} value={v.supplierId}>
                      {v.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[var(--neutral-500)]"
                onClick={() => removeLine(line.id)}
                disabled={lines.length === 1}
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            className="border-[var(--border)]"
            onClick={addLine}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add line item
          </Button>
          <span className="text-xs text-[var(--neutral-500)]">
            {lines.length} line item{lines.length === 1 ? "" : "s"} ·{" "}
            {vendorOptions.length} vendor
            {vendorOptions.length === 1 ? "" : "s"} on quote
          </span>
        </div>

        {vendorOptions.length === 0 && (
          <p className="rounded-md bg-[var(--mw-warning)]/10 px-3 py-2 text-xs text-[var(--mw-yellow-700)] dark:text-[var(--mw-yellow-400)]">
            Select at least one supplier on the comparison page before sending
            the RFQ.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="border-[var(--border)]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={handleSend}
            disabled={vendorOptions.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Send RFQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
