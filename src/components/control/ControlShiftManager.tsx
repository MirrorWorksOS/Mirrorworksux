/**
 * ControlShiftManager — Weekly shift calendar grid.
 * Rows = work centres, columns = weekdays (Mon-Fri).
 * Colour-coded shift blocks with click-to-toggle.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Plus, Minus } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { controlService } from "@/services/controlService";
import type { ShiftAssignment } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

const WEEKDAYS = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
] as const;

const SHIFTS: ShiftAssignment["shift"][] = ["day", "afternoon", "night"];

const SHIFT_COLOURS: Record<ShiftAssignment["shift"], string> = {
  day: "bg-[var(--chart-scale-mid)] text-white",
  afternoon: "bg-[var(--chart-scale-high)] text-foreground",
  night: "bg-[var(--chart-scale-low)] text-white",
};

const SHIFT_LABELS: Record<ShiftAssignment["shift"], string> = {
  day: "Day",
  afternoon: "Arvo",
  night: "Night",
};

function shiftKey(
  workCentreId: string,
  dayOfWeek: number,
  shift: ShiftAssignment["shift"],
): string {
  return `${workCentreId}:${dayOfWeek}:${shift}`;
}

export function ControlShiftManager() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);

  useEffect(() => {
    controlService.getShiftAssignments().then(setAssignments);
  }, []);

  // Unique work centres
  const workCentres = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of assignments) {
      if (!seen.has(a.workCentreId)) {
        seen.set(a.workCentreId, a.workCentreName);
      }
    }
    // Ensure at least 5 work centres for a full grid
    const defaults: [string, string][] = [
      ["wc-001", "Cutting"],
      ["wc-002", "Forming"],
      ["wc-003", "Welding"],
      ["wc-004", "Machining"],
      ["wc-005", "Finishing"],
    ];
    for (const [id, name] of defaults) {
      if (!seen.has(id)) seen.set(id, name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  // Active shift set for quick lookups
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    for (const a of assignments) {
      set.add(shiftKey(a.workCentreId, a.dayOfWeek, a.shift));
    }
    return set;
  }, [assignments]);

  const toggleShift = useCallback(
    (
      workCentreId: string,
      workCentreName: string,
      dayOfWeek: number,
      shift: ShiftAssignment["shift"],
    ) => {
      const key = shiftKey(workCentreId, dayOfWeek, shift);
      const isActive = activeSet.has(key);

      if (isActive) {
        setAssignments((prev) =>
          prev.filter(
            (a) =>
              !(
                a.workCentreId === workCentreId &&
                a.dayOfWeek === dayOfWeek &&
                a.shift === shift
              ),
          ),
        );
        toast.info("Shift removed", {
          description: `${workCentreName} — ${SHIFT_LABELS[shift]} shift removed for ${WEEKDAYS.find((w) => w.day === dayOfWeek)?.label}`,
        });
      } else {
        const newAssignment: ShiftAssignment = {
          id: `shift-new-${Date.now()}`,
          workCentreId,
          workCentreName,
          dayOfWeek,
          shift,
          startTime:
            shift === "day"
              ? "06:00"
              : shift === "afternoon"
                ? "14:00"
                : "22:00",
          endTime:
            shift === "day"
              ? "14:00"
              : shift === "afternoon"
                ? "22:00"
                : "06:00",
        };
        setAssignments((prev) => [...prev, newAssignment]);
        toast.success("Shift added", {
          description: `${workCentreName} — ${SHIFT_LABELS[shift]} shift added for ${WEEKDAYS.find((w) => w.day === dayOfWeek)?.label}`,
        });
      }
    },
    [activeSet],
  );

  return (
    <PageShell>
      <PageHeader
        title="Shift Manager"
        subtitle="Weekly shift assignments by work centre"
        breadcrumbs={[
          { label: "Control", href: "/control" },
          { label: "Shifts" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              This Week
            </Badge>
          </div>
        }
      />

      {/* Legend */}
      <motion.div
        variants={staggerItem}
        className="flex flex-wrap items-center gap-4"
      >
        {SHIFTS.map((s) => (
          <div key={s} className="flex items-center gap-2 text-xs">
            <span
              className={cn("h-3 w-3 rounded", SHIFT_COLOURS[s])}
            />
            <span className="text-[var(--neutral-500)]">
              {SHIFT_LABELS[s]}
            </span>
          </div>
        ))}
        <span className="text-xs text-[var(--neutral-400)]">
          Click cells to toggle shifts
        </span>
      </motion.div>

      {/* Calendar grid */}
      <motion.div variants={staggerItem}>
        <Card variant="flat" className="overflow-x-auto p-6">
          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="grid grid-cols-[160px_repeat(5,1fr)] gap-1">
              <div className="p-2 text-xs font-medium text-[var(--neutral-500)]">
                Work Centre
              </div>
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd.day}
                  className="p-2 text-center text-xs font-medium text-[var(--neutral-500)]"
                >
                  {wd.label}
                </div>
              ))}
            </div>

            {/* Work centre rows */}
            {workCentres.map((wc) => (
              <div
                key={wc.id}
                className="grid grid-cols-[160px_repeat(5,1fr)] gap-1 border-t border-[var(--neutral-200)]"
              >
                <div className="flex items-center p-2 text-sm font-medium text-foreground">
                  {wc.name}
                </div>
                {WEEKDAYS.map((wd) => {
                  const cellShifts = SHIFTS.filter((s) =>
                    activeSet.has(shiftKey(wc.id, wd.day, s)),
                  );
                  return (
                    <div
                      key={wd.day}
                      className="flex flex-col gap-1 p-1"
                    >
                      {SHIFTS.map((s) => {
                        const isActive = activeSet.has(
                          shiftKey(wc.id, wd.day, s),
                        );
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              toggleShift(wc.id, wc.name, wd.day, s)
                            }
                            className={cn(
                              "flex items-center justify-center rounded px-2 py-1.5 text-xs font-medium transition-all",
                              isActive
                                ? SHIFT_COLOURS[s]
                                : "border border-dashed border-[var(--neutral-300)] text-[var(--neutral-400)] hover:border-[var(--neutral-400)] hover:bg-[var(--neutral-50)]",
                            )}
                          >
                            {isActive ? (
                              <>
                                {SHIFT_LABELS[s]}
                                <Minus
                                  className="ml-1 h-3 w-3 opacity-60"
                                  strokeWidth={1.5}
                                />
                              </>
                            ) : (
                              <Plus
                                className="h-3 w-3"
                                strokeWidth={1.5}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </PageShell>
  );
}
