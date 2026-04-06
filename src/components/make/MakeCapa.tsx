/**
 * MakeCapa — CAPA Kanban board at /make/capa.
 *
 * Columns: Identified -> Root Cause -> Containment -> Corrective Action -> Verification -> Closed.
 * Cards: issue title, severity badge, assigned to, due date.
 * Simple CSS grid (no drag-and-drop).
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Calendar, User } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { makeService } from "@/services/makeService";
import type { CapaRecord } from "@/types/entities";
import type { CapaStatus, CapaSeverity } from "@/types/common";

/* ------------------------------------------------------------------ */
/* Column config                                                       */
/* ------------------------------------------------------------------ */

interface ColumnDef {
  status: CapaStatus;
  label: string;
}

const COLUMNS: ColumnDef[] = [
  { status: "identified", label: "Identified" },
  { status: "root_cause", label: "Root Cause" },
  { status: "containment", label: "Containment" },
  { status: "corrective_action", label: "Corrective Action" },
  { status: "verification", label: "Verification" },
  { status: "closed", label: "Closed" },
];

/* ------------------------------------------------------------------ */
/* Severity badge config                                               */
/* ------------------------------------------------------------------ */

const SEVERITY_CONFIG: Record<CapaSeverity, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-[var(--neutral-200)] text-[var(--neutral-600)] border-transparent",
  },
  medium: {
    label: "Medium",
    className: "bg-[var(--chart-scale-mid)]/15 text-[var(--chart-scale-mid)] border-[var(--chart-scale-mid)]/30",
  },
  high: {
    label: "High",
    className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30",
  },
  critical: {
    label: "Critical",
    className: "bg-[var(--mw-red,#dc2626)]/15 text-[var(--mw-red,#dc2626)] border-[var(--mw-red,#dc2626)]/30",
  },
};

/* ------------------------------------------------------------------ */
/* CAPA Card sub-component                                             */
/* ------------------------------------------------------------------ */

function CapaCard({ record }: { record: CapaRecord }) {
  const sevCfg = SEVERITY_CONFIG[record.severity];
  const isOverdue = new Date(record.dueDate) < new Date();

  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat" className="p-4 space-y-3">
        {/* Title + severity */}
        <div className="space-y-2">
          <Badge variant="outline" className={sevCfg.className}>
            {sevCfg.label}
          </Badge>
          <p className="text-sm font-medium text-foreground leading-snug">
            {record.title}
          </p>
        </div>

        {/* Job ref */}
        {record.jobNumber && (
          <p className="font-mono text-xs text-muted-foreground">
            {record.jobNumber}
          </p>
        )}

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>{record.assignedToName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className={cn(isOverdue && "text-[var(--mw-red,#dc2626)] font-medium")}>
              Due {record.dueDate}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MakeCapa() {
  const [records, setRecords] = useState<CapaRecord[]>([]);

  useEffect(() => {
    makeService.getCapaRecords().then(setRecords);
  }, []);

  const byStatus = (status: CapaStatus) =>
    records.filter((r) => r.status === status);

  return (
    <PageShell className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="CAPA Board"
        subtitle="Corrective and Preventive Actions — track issues from identification to closure"
        breadcrumbs={[
          { label: "Make", href: "/make" },
          { label: "CAPA" },
        ]}
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[960px] grid-cols-6 gap-4">
            {COLUMNS.map((col) => {
              const items = byStatus(col.status);
              return (
                <motion.div key={col.status} variants={staggerItem}>
                  <div className="space-y-3">
                    {/* Column header */}
                    <div className="flex items-center justify-between gap-2 rounded-[var(--shape-md)] bg-[var(--neutral-100)] px-3 py-2">
                      <h3 className="text-sm font-medium text-foreground">
                        {col.label}
                      </h3>
                      <Badge variant="outline" className="font-mono text-xs">
                        {items.length}
                      </Badge>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {items.map((record) => (
                        <CapaCard key={record.id} record={record} />
                      ))}

                      {items.length === 0 && (
                        <div className="rounded-[var(--shape-md)] border border-dashed border-[var(--neutral-200)] p-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            No items
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
