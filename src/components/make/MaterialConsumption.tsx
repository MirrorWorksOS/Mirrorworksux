/**
 * MaterialConsumption — BOM material tracking panel for MO detail.
 *
 * Table: Material, Planned Qty, Consumed Qty, Variance, Status badge.
 * "Record Consumption" action triggers toast.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Package, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { makeService } from "@/services/makeService";
import type { MaterialConsumptionLine } from "@/types/entities";

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  MaterialConsumptionLine["status"],
  { label: string; className: string }
> = {
  ok: {
    label: "OK",
    className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30",
  },
  under: {
    label: "Under",
    className: "bg-[var(--chart-scale-mid)]/15 text-[var(--chart-scale-mid)] border-[var(--chart-scale-mid)]/30",
  },
  over: {
    label: "Over",
    className: "bg-[var(--mw-red,#dc2626)]/15 text-[var(--mw-red,#dc2626)] border-[var(--mw-red,#dc2626)]/30",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MaterialConsumption() {
  const [lines, setLines] = useState<MaterialConsumptionLine[]>([]);

  useEffect(() => {
    makeService.getMaterialConsumption().then(setLines);
  }, []);

  const handleRecordConsumption = () => {
    toast.success("Consumption recorded", {
      description: "Material consumption has been updated for this MO.",
    });
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <Card variant="flat" className="p-6">
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">
                Material Consumption
              </h3>
            </div>
            <Button size="sm" onClick={handleRecordConsumption}>
              <PlusCircle className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
              Record Consumption
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Consumed</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const cfg = STATUS_CONFIG[line.status];
                  return (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">
                        {line.material}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.plannedQty} {line.uom}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.consumedQty} {line.uom}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.variance > 0 ? "+" : ""}
                        {line.variance} {line.uom}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={cfg.className}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
