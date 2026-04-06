/**
 * MakeScanStation — Mock barcode scanning interface at /make/scan.
 *
 * Large scan input (56px), look up job by number, display job traveler info.
 * All touch targets 56px minimum for shop floor use.
 */

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ScanBarcode, Search, Package, Clock, User, CheckCircle2 } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { manufacturingOrders } from "@/services/mock";
import type { ManufacturingOrder } from "@/types/entities";

/* ------------------------------------------------------------------ */
/* Status display                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-[var(--neutral-200)] text-[var(--neutral-600)] border-transparent",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-[var(--chart-scale-mid)]/15 text-[var(--chart-scale-mid)] border-[var(--chart-scale-mid)]/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30",
  },
  done: {
    label: "Done",
    className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MakeScanStation() {
  const [query, setQuery] = useState("");
  const [scannedMO, setScannedMO] = useState<ManufacturingOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    const found = manufacturingOrders.find(
      (mo) =>
        mo.moNumber.toUpperCase() === trimmed ||
        mo.jobNumber.toUpperCase() === trimmed,
    );

    if (found) {
      setScannedMO(found);
      setNotFound(false);
    } else {
      setScannedMO(null);
      setNotFound(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  const handleClear = () => {
    setQuery("");
    setScannedMO(null);
    setNotFound(false);
    inputRef.current?.focus();
  };

  const statusCfg = scannedMO ? STATUS_CONFIG[scannedMO.status] : null;

  return (
    <PageShell>
      <PageHeader
        title="Scan Station"
        subtitle="Scan or enter a job/MO number to view traveler info"
        breadcrumbs={[
          { label: "Make", href: "/make" },
          { label: "Scan Station" },
        ]}
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Scan input */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ScanBarcode className="h-6 w-6 text-[var(--neutral-500)]" strokeWidth={1.5} />
              <h2 className="text-lg font-medium text-foreground">
                Scan Barcode
              </h2>
            </div>

            <div className="flex gap-3">
              <Input
                ref={inputRef}
                placeholder="Scan or type MO / Job number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[56px] text-lg font-mono"
                autoFocus
              />
              <Button
                className="min-h-[56px] min-w-[56px] px-6"
                onClick={handleScan}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Try: MO-2026-0001, MO-2026-0002, JOB-2026-0012
            </p>
          </Card>
        </motion.div>

        {/* Not found */}
        {notFound && (
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No job or MO found for{" "}
                <span className="font-mono font-medium text-foreground">
                  {query}
                </span>
              </p>
              <Button
                variant="outline"
                className="mt-3 min-h-[56px]"
                onClick={handleClear}
              >
                Clear & Scan Again
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Scanned entity display */}
        {scannedMO && statusCfg && (
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-sm text-muted-foreground">
                    {scannedMO.moNumber}
                  </p>
                  <h3 className="text-xl font-medium text-foreground">
                    {scannedMO.productName}
                  </h3>
                </div>
                <Badge variant="outline" className={statusCfg.className}>
                  {statusCfg.label}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  icon={Package}
                  label="Job Number"
                  value={scannedMO.jobNumber}
                  mono
                />
                <InfoRow
                  icon={User}
                  label="Customer"
                  value={scannedMO.customerName}
                />
                <InfoRow
                  icon={Clock}
                  label="Due Date"
                  value={scannedMO.dueDate}
                />
                <InfoRow
                  icon={User}
                  label="Operator"
                  value={scannedMO.operatorName}
                />
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-medium text-foreground">
                    {scannedMO.progress}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-[var(--neutral-200)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--chart-scale-high)] transition-all"
                    style={{ width: `${scannedMO.progress}%` }}
                  />
                </div>
              </div>

              {/* Work orders summary */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                <span>{scannedMO.workOrders} work orders</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[56px]"
                  onClick={handleClear}
                >
                  Scan Another
                </Button>
                <Button className="flex-1 min-h-[56px]">
                  Open Job Traveler
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component                                                       */
/* ------------------------------------------------------------------ */

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {label}
      </div>
      <p className={cn("text-sm font-medium text-foreground", mono && "font-mono")}>
        {value}
      </p>
    </div>
  );
}
