/**
 * ControlMaintenance — Equipment maintenance management with Schedule and History tabs.
 * KPI cards: Overdue count, Avg MTTR, Equipment Availability %.
 */
import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Clock, Activity } from "lucide-react";
import { motion } from "motion/react";

import { controlService } from "@/services";
import type { MaintenanceRecord } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { StatusBadge } from "@/components/shared/data/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";

function fmtAud(v: number): string {
  return v.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const scheduledColumns: MwColumnDef<MaintenanceRecord>[] = [
  { key: "machine", header: "Machine", className: "font-medium", cell: (r) => r.machineName },
  {
    key: "type",
    header: "Type",
    cell: (r) => (
      <Badge variant="outline" className="capitalize">
        {r.type}
      </Badge>
    ),
  },
  {
    key: "description",
    header: "Description",
    className: "max-w-[260px] truncate text-sm text-[var(--neutral-500)]",
    cell: (r) => r.description,
  },
  {
    key: "scheduled",
    header: "Scheduled",
    className: "font-mono text-sm",
    cell: (r) => r.scheduledDate,
  },
  { key: "assignee", header: "Assigned To", className: "text-sm", cell: (r) => r.assignedTo },
  {
    key: "cost",
    header: "Est. Cost",
    headerClassName: "text-right",
    className: "text-right font-mono text-sm",
    cell: (r) => (r.cost ? fmtAud(r.cost) : "—"),
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <StatusBadge
        status={r.status as "scheduled" | "in_progress" | "overdue"}
        withDot
      />
    ),
  },
];

const historyColumns: MwColumnDef<MaintenanceRecord>[] = [
  { key: "machine", header: "Machine", className: "font-medium", cell: (r) => r.machineName },
  {
    key: "type",
    header: "Type",
    cell: (r) => (
      <Badge variant="outline" className="capitalize">
        {r.type}
      </Badge>
    ),
  },
  {
    key: "description",
    header: "Description",
    className: "max-w-[260px] truncate text-sm text-[var(--neutral-500)]",
    cell: (r) => r.description,
  },
  {
    key: "completed",
    header: "Completed",
    className: "font-mono text-sm",
    cell: (r) => r.completedDate ?? "—",
  },
  {
    key: "duration",
    header: "Duration",
    headerClassName: "text-right",
    className: "text-right font-mono text-sm",
    cell: (r) => (r.durationMinutes ? `${r.durationMinutes} min` : "—"),
  },
  {
    key: "cost",
    header: "Cost",
    headerClassName: "text-right",
    className: "text-right font-mono text-sm",
    cell: (r) => (r.cost ? fmtAud(r.cost) : "—"),
  },
  {
    key: "status",
    header: "Status",
    cell: () => <StatusBadge status="completed" withDot />,
  },
];

export function ControlMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    controlService.getMaintenanceRecords().then(setRecords);
  }, []);

  // Split records
  const scheduled = useMemo(
    () =>
      records.filter(
        (r) =>
          r.status === "scheduled" ||
          r.status === "in_progress" ||
          r.status === "overdue",
      ),
    [records],
  );

  const history = useMemo(
    () => records.filter((r) => r.status === "completed"),
    [records],
  );

  // KPI computations
  const overdueCount = useMemo(
    () => records.filter((r) => r.status === "overdue").length,
    [records],
  );

  const avgMttr = useMemo(() => {
    const completed = records.filter(
      (r) => r.status === "completed" && r.durationMinutes,
    );
    if (completed.length === 0) return 0;
    const total = completed.reduce(
      (s, r) => s + (r.durationMinutes ?? 0),
      0,
    );
    return Math.round(total / completed.length);
  }, [records]);

  // Equipment availability: % of machines NOT currently in maintenance or overdue
  const availability = useMemo(() => {
    const uniqueMachines = new Set(records.map((r) => r.machineId));
    const downMachines = new Set(
      records
        .filter(
          (r) => r.status === "in_progress" || r.status === "overdue",
        )
        .map((r) => r.machineId),
    );
    if (uniqueMachines.size === 0) return 100;
    return Math.round(
      ((uniqueMachines.size - downMachines.size) / uniqueMachines.size) * 100,
    );
  }, [records]);

  return (
    <PageShell>
      <PageHeader
        title="Maintenance"
        subtitle="Equipment maintenance scheduling and history"
        breadcrumbs={[
          { label: "Control", href: "/control" },
          { label: "Maintenance" },
        ]}
      />

      {/* KPI cards */}
      <motion.div
        variants={staggerItem}
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiStatCard
          label="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          iconSurface={overdueCount > 0 ? "onLight" : "key"}
          hint={overdueCount > 0 ? "Requires attention" : "All on schedule"}
        />
        <KpiStatCard
          label="Avg MTTR"
          value={
            <span className="font-mono">{avgMttr} min</span>
          }
          icon={Clock}
          iconSurface="onLight"
          hint="Mean time to repair"
        />
        <KpiStatCard
          label="Equipment Availability"
          value={
            <span className="font-mono">{availability}%</span>
          }
          icon={Activity}
          iconSurface="key"
          hint={`${records.filter((r) => r.status === "in_progress").length} machine(s) in maintenance`}
        />
      </motion.div>

      {/* Tabs: Schedule / History */}
      <motion.div variants={staggerItem}>
        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">
              Schedule ({scheduled.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <MwDataTable<MaintenanceRecord>
              columns={scheduledColumns}
              data={scheduled}
              keyExtractor={(r) => r.id}
              emptyState={
                <div className="py-8 text-center text-sm text-[var(--neutral-400)]">
                  No upcoming maintenance scheduled
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="history">
            <MwDataTable<MaintenanceRecord>
              columns={historyColumns}
              data={history}
              keyExtractor={(r) => r.id}
              emptyState={
                <div className="py-8 text-center text-sm text-[var(--neutral-400)]">
                  No maintenance history recorded
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageShell>
  );
}
