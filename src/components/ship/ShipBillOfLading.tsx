/**
 * ShipBillOfLading — Mock BOL document preview component.
 * Designed for use inside a Dialog; fetches data from shipService.
 */
import { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { shipService } from "@/services/shipService";
import type { BillOfLading } from "@/types/entities";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ShipBillOfLading() {
  const [bol, setBol] = useState<BillOfLading | null>(null);

  useEffect(() => {
    shipService.getBillOfLading().then(setBol);
  }, []);

  if (!bol) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[var(--neutral-500)]">
        Loading...
      </div>
    );
  }

  const handleDownload = () => {
    toast.success("PDF downloaded", {
      description: `Bill of Lading ${bol.id} saved to Downloads.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Document header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--neutral-100)]">
            <FileText
              className="h-5 w-5 text-[var(--neutral-600)]"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground">
              Bill of Lading
            </h3>
            <p className="font-mono text-xs text-[var(--neutral-500)]">
              {bol.id}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Download PDF
        </Button>
      </div>

      {/* Shipper / Consignee / Carrier */}
      <Card variant="flat" className="p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
              Shipper
            </p>
            <p className="text-sm font-medium text-foreground">
              {bol.shipperName}
            </p>
            <p className="text-xs text-[var(--neutral-500)]">
              {bol.shipperAddress}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
              Consignee
            </p>
            <p className="text-sm font-medium text-foreground">
              {bol.consigneeName}
            </p>
            <p className="text-xs text-[var(--neutral-500)]">
              {bol.consigneeAddress}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
              Carrier
            </p>
            <p className="text-sm font-medium text-foreground">
              {bol.carrierName}
            </p>
            <p className="mt-1 font-mono text-xs text-[var(--neutral-500)]">
              Date: {bol.date}
            </p>
          </div>
        </div>
      </Card>

      {/* Items table */}
      <Card variant="flat" className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Weight (kg)</TableHead>
              <TableHead>Freight Class</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bol.items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right font-mono">
                  {item.qty}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.weightKg.toFixed(1)}
                </TableCell>
                <TableCell className="text-[var(--neutral-500)]">
                  {item.freightClass}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="mt-4 flex justify-end border-t border-[var(--neutral-200)] pt-4">
          <div className="text-right">
            <p className="text-xs text-[var(--neutral-500)]">Total Weight</p>
            <p className="font-mono text-lg font-medium text-foreground">
              {bol.totalWeightKg.toFixed(1)} kg
            </p>
          </div>
        </div>
      </Card>

      {/* Shipment ref */}
      <p className="text-right font-mono text-xs text-[var(--neutral-400)]">
        Shipment: {bol.shipmentId}
      </p>
    </div>
  );
}
