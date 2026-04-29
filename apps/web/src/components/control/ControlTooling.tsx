/**
 * ControlTooling — Tooling inventory data table with life % colour bars,
 * calibration tracking, and status badges.
 */
import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { motion } from "motion/react";

import { controlService } from "@/services";
import type { ToolingItem } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { StatusBadge } from "@/components/shared/data/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { cn } from "@/components/ui/utils";

function lifeBarColour(percent: number): string {
  if (percent > 50) return "bg-[var(--mw-success)]";
  if (percent >= 20) return "bg-[var(--mw-warning)]";
  return "bg-[var(--mw-error)]";
}

function statusToKey(
  status: ToolingItem["status"],
): "active" | "scheduled" | "in_progress" | "inactive" {
  switch (status) {
    case "available":
      return "active";
    case "in_use":
      return "in_progress";
    case "maintenance":
      return "scheduled";
    case "retired":
      return "inactive";
    default:
      return "active";
  }
}

function statusLabel(status: ToolingItem["status"]): string {
  switch (status) {
    case "available":
      return "Available";
    case "in_use":
      return "In Use";
    case "maintenance":
      return "Maintenance";
    case "retired":
      return "Retired";
    default:
      return status;
  }
}

export function ControlTooling() {
  const [items, setItems] = useState<ToolingItem[]>([]);

  useEffect(() => {
    controlService.getToolingItems().then(setItems);
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Tooling"
        subtitle="Tool inventory, life tracking, and calibration management"
        breadcrumbs={[
          { label: "Control", href: "/control" },
          { label: "Tooling" },
        ]}
        actions={
          <Badge variant="outline" className="gap-1.5">
            <Wrench className="h-3.5 w-3.5" strokeWidth={1.5} />
            {items.length} tools
          </Badge>
        }
      />

      <motion.div variants={staggerItem}>
        <MwDataTable<ToolingItem>
          columns={[
            {
              key: "toolId",
              header: "Tool ID",
              className: "font-mono font-medium",
              cell: (item) => item.toolId,
            },
            {
              key: "type",
              header: "Type",
              cell: (item) => <Badge variant="outline">{item.type}</Badge>,
            },
            {
              key: "description",
              header: "Description",
              className: "max-w-[240px] truncate text-sm text-[var(--neutral-500)]",
              cell: (item) => item.description,
            },
            {
              key: "location",
              header: "Location",
              className: "text-sm",
              cell: (item) => item.location,
            },
            {
              key: "life",
              header: "Life %",
              cell: (item) => (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--neutral-200)]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        lifeBarColour(item.lifePercent),
                      )}
                      style={{ width: `${item.lifePercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[var(--neutral-500)]">
                    {item.lifePercent}%
                  </span>
                </div>
              ),
            },
            {
              key: "calibration",
              header: "Calibration Due",
              className: "font-mono text-sm",
              cell: (item) => item.calibrationDueDate,
            },
            {
              key: "status",
              header: "Status",
              cell: (item) => (
                <StatusBadge status={statusToKey(item.status)} withDot>
                  {statusLabel(item.status)}
                </StatusBadge>
              ),
            },
          ]}
          data={items}
          keyExtractor={(item) => item.id}
        />
      </motion.div>
    </PageShell>
  );
}
