/**
 * PlanShiftCalendar — Weekly shift grid card.
 *
 * Rows = work centres, columns = days (Mon-Fri).
 * Colour-coded shift blocks: day / afternoon / night.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, Sun, Sunset, Moon } from "lucide-react";

import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { planService } from "@/services";
import type { ShiftAssignment } from "@/types/entities";

/* ── constants ───────────────────────────────────────────────────── */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_NUMBERS = [1, 2, 3, 4, 5];

const SHIFT_META: Record<
  ShiftAssignment["shift"],
  { label: string; bg: string; text: string; Icon: typeof Sun }
> = {
  day: {
    label: "Day",
    bg: "bg-[var(--chart-scale-high)]/15",
    text: "text-[var(--chart-scale-high)]",
    Icon: Sun,
  },
  afternoon: {
    label: "Arvo",
    bg: "bg-[var(--chart-scale-mid)]/15",
    text: "text-[var(--chart-scale-mid)]",
    Icon: Sunset,
  },
  night: {
    label: "Night",
    bg: "bg-[var(--neutral-400)]/15",
    text: "text-[var(--neutral-500)]",
    Icon: Moon,
  },
};

/* ── component ───────────────────────────────────────────────────── */

export function PlanShiftCalendar() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);

  useEffect(() => {
    planService.getShiftAssignments().then(setAssignments);
  }, []);

  /* unique work centres from assignments */
  const workCentres = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assignments) {
      if (!map.has(a.workCentreId)) map.set(a.workCentreId, a.workCentreName);
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [assignments]);

  /* lookup: wcId-day => shifts[] */
  const lookup = useMemo(() => {
    const m = new Map<string, ShiftAssignment[]>();
    for (const a of assignments) {
      const key = `${a.workCentreId}-${a.dayOfWeek}`;
      const arr = m.get(key) ?? [];
      arr.push(a);
      m.set(key, arr);
    }
    return m;
  }, [assignments]);

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
        <h3 className="text-base font-medium text-foreground">Shift Calendar</h3>
      </div>

      {/* legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {(["day", "afternoon", "night"] as const).map((s) => {
          const meta = SHIFT_META[s];
          const ShiftIcon = meta.Icon;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <ShiftIcon className={`h-3.5 w-3.5 ${meta.text}`} strokeWidth={1.5} />
              <span className="text-xs text-[var(--neutral-600)]">{meta.label}</span>
            </div>
          );
        })}
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="overflow-x-auto"
      >
        <motion.div variants={staggerItem}>
          <div className="min-w-[600px]">
            {/* header */}
            <div className="grid grid-cols-6 gap-2 border-b border-[var(--neutral-200)] pb-2">
              <div className="text-xs font-medium text-[var(--neutral-500)]">Work Centre</div>
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-[var(--neutral-500)]">
                  {d}
                </div>
              ))}
            </div>

            {/* rows */}
            {workCentres.map((wc) => (
              <div
                key={wc.id}
                className="grid grid-cols-6 gap-2 border-b border-[var(--neutral-100)] py-2"
              >
                <div className="flex items-center text-sm font-medium text-foreground">
                  {wc.name}
                </div>
                {DAY_NUMBERS.map((day) => {
                  const shifts = lookup.get(`${wc.id}-${day}`) ?? [];
                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                      {shifts.length === 0 && (
                        <span className="text-xs text-[var(--neutral-300)]">&mdash;</span>
                      )}
                      {shifts.map((shift) => {
                        const meta = SHIFT_META[shift.shift];
                        const ShiftIcon = meta.Icon;
                        return (
                          <div
                            key={shift.id}
                            className={`flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 ${meta.bg}`}
                          >
                            <ShiftIcon className={`h-3 w-3 ${meta.text}`} strokeWidth={1.5} />
                            <span className={`text-[11px] font-medium ${meta.text} font-mono`}>
                              {shift.startTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
}
