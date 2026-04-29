/**
 * PlanSubcontracting — Subcontract tracking table card.
 *
 * Filters operations where isSubcontracted === true and displays
 * supplier, send/return dates, and cost.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Truck, Calendar, DollarSign } from "lucide-react";

import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { planService } from "@/services";
import type { Operation } from "@/types/entities";

/* ── mock dates for subcontracted operations ─────────────────────── */

interface SubcontractRow {
  id: string;
  operationName: string;
  supplierName: string;
  sendDate: string;
  expectedReturn: string;
  actualReturn: string | null;
  cost: number;
  status: "sent" | "returned" | "overdue";
}

function buildSubcontractRows(ops: Operation[]): SubcontractRow[] {
  return ops
    .filter((op) => op.isSubcontracted)
    .map((op) => {
      const sendDate = "2026-04-02";
      const expectedReturn = "2026-04-09";
      const actualReturn = Math.random() > 0.5 ? "2026-04-08" : null;
      const isOverdue = !actualReturn && new Date(expectedReturn) < new Date("2026-04-07");

      return {
        id: op.id,
        operationName: op.name,
        supplierName: op.subcontractorName ?? "Unknown",
        sendDate,
        expectedReturn,
        actualReturn,
        cost: op.subcontractCost ?? 0,
        status: actualReturn ? "returned" : isOverdue ? "overdue" : "sent",
      };
    });
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanSubcontracting() {
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    planService.getOperations().then(setOperations);
  }, []);

  const rows = useMemo(() => buildSubcontractRows(operations), [operations]);

  const totalCost = rows.reduce((s, r) => s + r.cost, 0);

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-foreground">Subcontracting</h3>
        </div>
        {rows.length > 0 && (
          <Badge variant="secondary">
            <DollarSign className="mr-0.5 h-3 w-3" strokeWidth={1.5} />
            ${totalCost.toLocaleString()}
          </Badge>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Truck className="mb-3 h-8 w-8 text-[var(--neutral-300)]" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            No subcontracted operations on this job.
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem} className="overflow-x-auto">
            <MwDataTable<SubcontractRow>
              columns={[
                {
                  key: "operation",
                  header: "Operation",
                  className: "text-sm font-medium text-foreground",
                  cell: (row) => row.operationName,
                },
                {
                  key: "supplier",
                  header: "Supplier",
                  className: "text-sm text-muted-foreground",
                  cell: (row) => row.supplierName,
                },
                {
                  key: "sent",
                  header: "Sent",
                  className: "font-mono text-xs",
                  cell: (row) => row.sendDate,
                },
                {
                  key: "expected",
                  header: "Expected Return",
                  className: "font-mono text-xs",
                  cell: (row) => row.expectedReturn,
                },
                {
                  key: "actual",
                  header: "Actual Return",
                  className: "font-mono text-xs",
                  cell: (row) =>
                    row.actualReturn ?? (
                      <span className="text-[var(--neutral-400)]">—</span>
                    ),
                },
                {
                  key: "cost",
                  header: "Cost",
                  headerClassName: "text-right",
                  className: "text-right font-mono text-xs",
                  cell: (row) => `$${row.cost.toLocaleString()}`,
                },
                {
                  key: "status",
                  header: "Status",
                  headerClassName: "text-center",
                  className: "text-center",
                  cell: (row) => {
                    if (row.status === "returned")
                      return (
                        <Badge className="bg-[var(--chart-scale-high)] text-white">
                          Returned
                        </Badge>
                      );
                    if (row.status === "sent")
                      return (
                        <Badge className="bg-[var(--chart-scale-mid)] text-white">
                          In Transit
                        </Badge>
                      );
                    if (row.status === "overdue")
                      return <Badge variant="destructive">Overdue</Badge>;
                    return null;
                  },
                },
              ]}
              data={rows}
              keyExtractor={(row) => row.id}
              className="border-0 shadow-none"
            />
          </motion.div>
        </motion.div>
      )}
    </Card>
  );
}
