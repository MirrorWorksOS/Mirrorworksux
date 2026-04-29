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
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
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
          <MwDataTable<Operation>
            columns={[
              {
                key: "seq",
                header: "#",
                headerClassName: "w-16",
                className: "font-mono text-xs text-[var(--neutral-500)]",
                cell: (op) => op.sequence,
              },
              {
                key: "operation",
                header: "Operation",
                cell: (op) => (
                  <div className="text-sm font-medium text-foreground">
                    {op.name}
                    {op.isSubcontracted && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Subcontracted
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                key: "workCentre",
                header: "Work Centre",
                className: "text-sm text-muted-foreground",
                cell: (op) => op.workCenterName,
              },
              {
                key: "setup",
                header: "Setup",
                headerClassName: "text-right",
                className: "text-right font-mono text-xs",
                cell: (op) => formatMinutes(op.setupMinutes),
              },
              {
                key: "run",
                header: "Run",
                headerClassName: "text-right",
                className: "text-right font-mono text-xs",
                cell: (op) => formatMinutes(op.runMinutes),
              },
              {
                key: "queue",
                header: "Queue",
                headerClassName: "text-right",
                className: "text-right font-mono text-xs",
                cell: (op) => formatMinutes(op.queueMinutes),
              },
              {
                key: "move",
                header: "Move",
                headerClassName: "text-right",
                className: "text-right font-mono text-xs",
                cell: (op) => formatMinutes(op.moveMinutes),
              },
              {
                key: "total",
                header: "Total",
                headerClassName: "text-right",
                className: "text-right font-mono text-xs font-medium",
                cell: (op) => formatMinutes(opTotal(op)),
              },
            ]}
            data={operations}
            keyExtractor={(op) => op.id}
            className="border-0 shadow-none"
          />

          <div className="mt-4 flex items-center justify-between border-t border-[var(--neutral-200)] pt-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4" strokeWidth={1.5} />
              Total Lead Time
            </div>
            <span className="font-mono text-sm font-medium text-foreground">
              {formatMinutes(totalLeadMinutes)}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
}
