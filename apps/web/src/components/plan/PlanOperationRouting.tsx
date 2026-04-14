/**
 * PlanOperationRouting — Operation routing table card.
 *
 * Shows sequence, operation, work centre, setup/run/queue/move times,
 * with a total lead time calculation at the bottom.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Route, Clock } from "lucide-react";

import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { planService } from "@/services";
import type { Operation } from "@/types/entities";

/* ── helpers ─────────────────────────────────────────────────────── */

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function opTotal(op: Operation): number {
  return op.setupMinutes + op.runMinutes + op.queueMinutes + op.moveMinutes;
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanOperationRouting() {
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    planService.getOperations().then(setOperations);
  }, []);

  const totalLeadMinutes = useMemo(
    () => operations.reduce((s, op) => s + opTotal(op), 0),
    [operations],
  );

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Route className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
        <h3 className="text-base font-medium text-foreground">Operation Routing</h3>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem} className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Work Centre</TableHead>
                <TableHead className="text-right">Setup</TableHead>
                <TableHead className="text-right">Run</TableHead>
                <TableHead className="text-right">Queue</TableHead>
                <TableHead className="text-right">Move</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-mono text-xs text-[var(--neutral-500)]">
                    {op.sequence}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {op.name}
                    {op.isSubcontracted && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Subcontracted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {op.workCenterName}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatMinutes(op.setupMinutes)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatMinutes(op.runMinutes)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatMinutes(op.queueMinutes)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatMinutes(op.moveMinutes)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-medium">
                    {formatMinutes(opTotal(op))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4" strokeWidth={1.5} />
                    Total Lead Time
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-medium text-foreground">
                  {formatMinutes(totalLeadMinutes)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </motion.div>
      </motion.div>
    </Card>
  );
}
