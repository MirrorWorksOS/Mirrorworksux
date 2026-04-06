/**
 * MakeJobTraveler — Mobile-optimised job packet view at /make/job-traveler/:id.
 *
 * Job header, operations checklist (56px tap targets), attachments,
 * quality checkpoints, notes field. All 56px touch targets.
 */

import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Image,
  Paperclip,
  ShieldCheck,
  StickyNote,
  ClipboardList,
} from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { manufacturingOrders } from "@/services/mock";

/* ------------------------------------------------------------------ */
/* Mock inline data                                                    */
/* ------------------------------------------------------------------ */

interface Operation {
  id: string;
  sequence: number;
  name: string;
  description: string;
  estimatedMinutes: number;
}

interface Attachment {
  id: string;
  name: string;
  type: "pdf" | "image" | "dwg";
}

interface QualityCheckpoint {
  id: string;
  description: string;
  tolerance: string;
}

const MOCK_OPERATIONS: Operation[] = [
  { id: "op-1", sequence: 1, name: "Laser Cut", description: "Cut blanks from 3mm MS sheet", estimatedMinutes: 120 },
  { id: "op-2", sequence: 2, name: "Deburr", description: "Remove burrs and slag from cut edges", estimatedMinutes: 30 },
  { id: "op-3", sequence: 3, name: "Bend", description: "Press brake — bend to spec per DWG-001", estimatedMinutes: 90 },
  { id: "op-4", sequence: 4, name: "Weld Assembly", description: "MIG weld bracket assembly per WPS-004", estimatedMinutes: 180 },
  { id: "op-5", sequence: 5, name: "Grind & Finish", description: "Grind welds flush, prep for coating", estimatedMinutes: 45 },
  { id: "op-6", sequence: 6, name: "Powder Coat", description: "Satin black powder coat — 60-80 micron", estimatedMinutes: 60 },
  { id: "op-7", sequence: 7, name: "Final QC", description: "Dimensional check and visual inspection", estimatedMinutes: 20 },
];

const MOCK_ATTACHMENTS: Attachment[] = [
  { id: "att-1", name: "DWG-001-bracket-assembly.pdf", type: "pdf" },
  { id: "att-2", name: "WPS-004-MIG-weld-spec.pdf", type: "pdf" },
  { id: "att-3", name: "reference-photo-01.jpg", type: "image" },
  { id: "att-4", name: "bend-layout.dwg", type: "dwg" },
];

const MOCK_QC_CHECKS: QualityCheckpoint[] = [
  { id: "qc-1", description: "Overall length", tolerance: "150mm +/- 0.5mm" },
  { id: "qc-2", description: "Bend angle", tolerance: "90 deg +/- 1 deg" },
  { id: "qc-3", description: "Weld throat size", tolerance: "min 3mm fillet" },
  { id: "qc-4", description: "Coating thickness", tolerance: "60-80 micron" },
];

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-[var(--neutral-200)] text-[var(--neutral-600)] border-transparent" },
  confirmed: { label: "Confirmed", className: "bg-[var(--chart-scale-mid)]/15 text-[var(--chart-scale-mid)] border-[var(--chart-scale-mid)]/30" },
  in_progress: { label: "In Progress", className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30" },
  done: { label: "Done", className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30" },
};

const ATTACHMENT_ICON: Record<Attachment["type"], typeof FileText> = {
  pdf: FileText,
  image: Image,
  dwg: Paperclip,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MakeJobTraveler() {
  const { id } = useParams<{ id: string }>();
  const [completedOps, setCompletedOps] = useState<Set<string>>(new Set());
  const [completedQC, setCompletedQC] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");

  const mo = useMemo(
    () => manufacturingOrders.find((m) => m.id === id || m.jobNumber === id),
    [id],
  );

  const toggleOp = (opId: string) => {
    setCompletedOps((prev) => {
      const next = new Set(prev);
      if (next.has(opId)) next.delete(opId);
      else next.add(opId);
      return next;
    });
  };

  const toggleQC = (qcId: string) => {
    setCompletedQC((prev) => {
      const next = new Set(prev);
      if (next.has(qcId)) next.delete(qcId);
      else next.add(qcId);
      return next;
    });
  };

  const statusCfg = mo ? STATUS_CONFIG[mo.status] : null;

  return (
    <PageShell>
      <PageHeader
        title={mo?.productName ?? "Job Traveler"}
        subtitle={
          mo ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{mo.moNumber}</span>
              {statusCfg && (
                <Badge variant="outline" className={statusCfg.className}>
                  {statusCfg.label}
                </Badge>
              )}
            </span>
          ) : (
            "Job not found"
          )
        }
        breadcrumbs={[
          { label: "Make", href: "/make" },
          { label: "Job Traveler" },
        ]}
        actions={
          <Button variant="outline" asChild className="min-h-[56px]">
            <Link to="/make">
              <ArrowLeft className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
              Back
            </Link>
          </Button>
        }
      />

      {!mo ? (
        <Card variant="flat" className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No manufacturing order found for ID{" "}
            <span className="font-mono font-medium">{id}</span>
          </p>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Job header card */}
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Job Number</p>
                  <p className="font-mono font-medium text-foreground">{mo.jobNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{mo.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Operator</p>
                  <p className="font-medium text-foreground">{mo.operatorName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium text-foreground">{mo.dueDate}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Operations checklist */}
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-foreground">
                  Operations
                </h3>
                <Badge variant="outline" className="ml-auto font-mono text-xs">
                  {completedOps.size}/{MOCK_OPERATIONS.length}
                </Badge>
              </div>

              <div className="space-y-1">
                {MOCK_OPERATIONS.map((op) => {
                  const done = completedOps.has(op.id);
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => toggleOp(op.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--shape-md)] px-3 min-h-[56px] text-left transition-colors",
                        done
                          ? "bg-[var(--chart-scale-high)]/5"
                          : "hover:bg-[var(--neutral-100)]",
                      )}
                    >
                      {done ? (
                        <CheckCircle2
                          className="h-5 w-5 shrink-0 text-[var(--chart-scale-high)]"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Circle
                          className="h-5 w-5 shrink-0 text-[var(--neutral-400)]"
                          strokeWidth={1.5}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            done
                              ? "text-[var(--chart-scale-high)] line-through"
                              : "text-foreground",
                          )}
                        >
                          {op.sequence}. {op.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {op.description}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {op.estimatedMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Attachments */}
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Paperclip className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-foreground">
                  Attachments
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MOCK_ATTACHMENTS.map((att) => {
                  const AttIcon = ATTACHMENT_ICON[att.type];
                  return (
                    <button
                      key={att.id}
                      type="button"
                      className="flex flex-col items-center gap-2 rounded-[var(--shape-md)] border border-[var(--neutral-200)] p-4 min-h-[56px] text-center transition-colors hover:bg-[var(--neutral-100)]"
                    >
                      <AttIcon
                        className="h-8 w-8 text-[var(--neutral-400)]"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {att.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Quality checkpoints */}
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-foreground">
                  Quality Checkpoints
                </h3>
                <Badge variant="outline" className="ml-auto font-mono text-xs">
                  {completedQC.size}/{MOCK_QC_CHECKS.length}
                </Badge>
              </div>

              <div className="space-y-1">
                {MOCK_QC_CHECKS.map((qc) => {
                  const done = completedQC.has(qc.id);
                  return (
                    <button
                      key={qc.id}
                      type="button"
                      onClick={() => toggleQC(qc.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--shape-md)] px-3 min-h-[56px] text-left transition-colors",
                        done
                          ? "bg-[var(--chart-scale-high)]/5"
                          : "hover:bg-[var(--neutral-100)]",
                      )}
                    >
                      {done ? (
                        <CheckCircle2
                          className="h-5 w-5 shrink-0 text-[var(--chart-scale-high)]"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Circle
                          className="h-5 w-5 shrink-0 text-[var(--neutral-400)]"
                          strokeWidth={1.5}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            done
                              ? "text-[var(--chart-scale-high)] line-through"
                              : "text-foreground",
                          )}
                        >
                          {qc.description}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {qc.tolerance}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-foreground">
                  Notes
                </h3>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add job notes..."
                rows={4}
                className="w-full min-h-[56px] rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Card>
          </motion.div>
        </motion.div>
      )}
    </PageShell>
  );
}
