/**
 * MakeCapa — CAPA Kanban board at /make/capa.
 *
 * Columns: Identified → Root Cause → Containment → Corrective Action → Verification → Closed.
 * Drag cards between columns to update status (local state; mock data).
 */

import { useCallback, useEffect, useState } from "react";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { Calendar, User } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { InlineEmpty } from "@/components/shared/feedback/EmptyState";
import { KanbanBoard } from "@/components/shared/kanban/KanbanBoard";
import { KanbanColumn, type KanbanDragItem } from "@/components/shared/kanban/KanbanColumn";
import { KanbanCard } from "@/components/shared/kanban/KanbanCard";
import { cn } from "@/components/ui/utils";
import { makeService } from "@/services";
import type { CapaRecord } from "@/types/entities";
import type { CapaStatus, CapaSeverity } from "@/types/common";

const KANBAN_ITEM_TYPE = "capa-record";

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
/* Card body (inner — KanbanCard supplies outer Card + drag)           */
/* ------------------------------------------------------------------ */

function CapaCardContent({ record }: { record: CapaRecord }) {
  const sevCfg = SEVERITY_CONFIG[record.severity];
  const due = parseISO(record.dueDate);
  const isOverdue = isBefore(due, startOfDay(new Date()));
  const dueLabel = format(due, "MMM d");

  return (
    <div className="space-y-3 p-4">
      <div className="space-y-2">
        <Badge variant="outline" className={sevCfg.className}>
          {sevCfg.label}
        </Badge>
        <p className="text-sm font-medium text-foreground leading-snug">
          {record.title}
        </p>
      </div>

      {record.jobNumber && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {record.jobNumber}
        </p>
      )}

      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{record.assignedToName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span
            className={cn(
              "tabular-nums",
              isOverdue && "text-[var(--mw-red,#dc2626)] font-medium",
            )}
          >
            Due {dueLabel}
          </span>
        </div>
      </div>
    </div>
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

  const handleKanbanDrop = useCallback((item: KanbanDragItem, columnId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, status: columnId as CapaStatus } : r,
      ),
    );
  }, []);

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

      <KanbanBoard className="gap-4 min-h-[min(70vh,520px)]">
        {COLUMNS.map((col) => {
          const items = byStatus(col.status);
          return (
            <KanbanColumn
              key={col.status}
              id={col.status}
              title={col.label}
              count={items.length}
              accept={KANBAN_ITEM_TYPE}
              onDrop={handleKanbanDrop}
              className="min-w-[260px] w-[260px] flex-shrink-0"
            >
              {items.map((record) => (
                <KanbanCard
                  key={record.id}
                  id={record.id}
                  type={KANBAN_ITEM_TYPE}
                  className="p-0"
                >
                  <CapaCardContent record={record} />
                </KanbanCard>
              ))}

              {items.length === 0 && <InlineEmpty message="No items" />}
            </KanbanColumn>
          );
        })}
      </KanbanBoard>
    </PageShell>
  );
}
