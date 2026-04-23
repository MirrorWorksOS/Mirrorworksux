/**
 * ControlShiftManager — Weekly shift calendar grid.
 *
 * Rows = employees (grouped by department), columns = Mon–Sun.
 * Each cell shows zero or more shift chips with start/end time and
 * (optional) work centre, colour-coded by shift type (day/arvo/night).
 *
 * Features:
 * - Department grouping with collapsible sections
 * - Search by employee name / role
 * - Department filter dropdown
 * - Week navigation (This week / prev / next — display only in mock)
 * - Click a filled cell to toggle it off; click an empty cell to add a day shift
 *
 * Data model: `EmployeeShift` (see types/entities.ts). The legacy
 * work-centre-only `ShiftAssignment` is still exposed via controlService
 * for back-compat but is not used by this view.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight, Search, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { controlService } from "@/services";
import type { EmployeeShift } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";

// ── Constants ────────────────────────────────────────────────────────

const WEEKDAYS = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
] as const;

const SHIFT_STYLES: Record<
  EmployeeShift["shift"],
  { bg: string; border: string; dot: string; text: string; label: string }
> = {
  day: {
    bg: "bg-[var(--mw-yellow-50)]",
    border: "border-[var(--mw-yellow-300)]",
    dot: "bg-[var(--mw-yellow-500)]",
    text: "text-[var(--mw-yellow-900)] dark:text-[var(--mw-yellow-100)]",
    label: "Day",
  },
  afternoon: {
    bg: "bg-[color-mix(in_srgb,var(--mw-info)_12%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--mw-info)_40%,transparent)]",
    dot: "bg-[var(--mw-info)]",
    text: "text-[var(--mw-info)]",
    label: "Arvo",
  },
  night: {
    bg: "bg-[color-mix(in_srgb,var(--mw-mirage)_10%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--mw-mirage)_30%,transparent)]",
    dot: "bg-[var(--mw-mirage)]",
    text: "text-[var(--mw-mirage)] dark:text-[var(--neutral-300)]",
    label: "Night",
  },
};

const DEPARTMENT_ORDER = [
  "Sales",
  "Planning",
  "Purchasing",
  "Production",
  "QC",
  "Logistics",
];

// ── Helpers ──────────────────────────────────────────────────────────

type EmployeeRow = {
  id: string;
  name: string;
  initials: string;
  department: string;
  role: string;
};

function formatCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// ── Sub-components ───────────────────────────────────────────────────

function ShiftChip({ shift }: { shift: EmployeeShift }) {
  const style = SHIFT_STYLES[shift.shift];
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1 text-[11px] leading-tight",
        style.bg,
        style.border,
      )}
      title={`${style.label} shift — ${shift.startTime}–${shift.endTime}${shift.workCentreName ? ` • ${shift.workCentreName}` : ""}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
        <span className={cn("font-medium tabular-nums", style.text)}>
          {shift.startTime}–{shift.endTime}
        </span>
      </div>
      {shift.workCentreName && (
        <div className="mt-0.5 truncate text-[10px] text-[var(--neutral-500)]">
          {shift.workCentreName}
        </div>
      )}
    </div>
  );
}

function EmployeeCell({ emp }: { emp: EmployeeRow }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-xs font-semibold text-white">
        {emp.initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {emp.name}
        </p>
        <p className="truncate text-[11px] text-[var(--neutral-500)]">
          {emp.role}
        </p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function ControlShiftManager() {
  const [shifts, setShifts] = useState<EmployeeShift[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    controlService.getEmployeeShifts().then(setShifts);
  }, []);

  // Derive unique employees from the shift list
  const employees = useMemo<EmployeeRow[]>(() => {
    const seen = new Map<string, EmployeeRow>();
    for (const s of shifts) {
      if (!seen.has(s.employeeId)) {
        seen.set(s.employeeId, {
          id: s.employeeId,
          name: s.employeeName,
          initials: s.employeeInitials,
          department: s.department,
          role: s.role,
        });
      }
    }
    return Array.from(seen.values());
  }, [shifts]);

  // Filter employees by search + department
  const visibleEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (departmentFilter !== "all" && e.department !== departmentFilter)
        return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    });
  }, [employees, search, departmentFilter]);

  // Group visible employees by department
  const groupedByDept = useMemo(() => {
    const groups = new Map<string, EmployeeRow[]>();
    for (const emp of visibleEmployees) {
      const list = groups.get(emp.department) ?? [];
      list.push(emp);
      groups.set(emp.department, list);
    }
    // Sort by canonical order, then any remaining alphabetically
    const ordered: { department: string; employees: EmployeeRow[] }[] = [];
    for (const name of DEPARTMENT_ORDER) {
      if (groups.has(name)) {
        ordered.push({ department: name, employees: groups.get(name)! });
        groups.delete(name);
      }
    }
    for (const [name, list] of Array.from(groups.entries()).sort()) {
      ordered.push({ department: name, employees: list });
    }
    return ordered;
  }, [visibleEmployees]);

  // Lookup: employeeId + dayOfWeek → EmployeeShift[]
  const shiftsByCell = useMemo(() => {
    const map = new Map<string, EmployeeShift[]>();
    for (const s of shifts) {
      const key = `${s.employeeId}:${s.dayOfWeek}`;
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return map;
  }, [shifts]);

  // Unique department list (for filter dropdown)
  const allDepartments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department));
    const ordered = DEPARTMENT_ORDER.filter((d) => set.has(d));
    for (const d of Array.from(set).sort()) {
      if (!ordered.includes(d)) ordered.push(d);
    }
    return ordered;
  }, [employees]);

  const handleCellClick = useCallback(
    (emp: EmployeeRow, dayOfWeek: number) => {
      const key = `${emp.id}:${dayOfWeek}`;
      const existing = shiftsByCell.get(key) ?? [];
      if (existing.length > 0) {
        // Remove all shifts in this cell
        setShifts((prev) =>
          prev.filter(
            (s) => !(s.employeeId === emp.id && s.dayOfWeek === dayOfWeek),
          ),
        );
        toast.info("Shift cleared", {
          description: `${emp.name} — ${WEEKDAYS.find((w) => w.day === dayOfWeek)?.label}`,
        });
      } else {
        // Add a default day shift
        const newShift: EmployeeShift = {
          id: `es-new-${Date.now()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeInitials: emp.initials,
          department: emp.department,
          role: emp.role,
          dayOfWeek,
          shift: "day",
          startTime: "09:00",
          endTime: "17:00",
        };
        setShifts((prev) => [...prev, newShift]);
        toast.success("Shift added", {
          description: `${emp.name} — ${WEEKDAYS.find((w) => w.day === dayOfWeek)?.label} 09:00–17:00`,
        });
      }
    },
    [shiftsByCell],
  );

  const totalShiftCount = shifts.length;
  const weekLabel = useMemo(() => formatCurrentWeek(), []);

  return (
    <PageShell>
      <PageHeader
        title="Shift Manager"
        subtitle="Weekly shift calendar by employee and department"
        breadcrumbs={[
          { label: "Control", href: "/control" },
          { label: "Shifts" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full"
              onClick={() => toast.info("Previous week")}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Badge
              variant="outline"
              className="h-9 gap-1.5 px-3 text-xs font-medium"
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              {weekLabel}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full"
              onClick={() => toast.info("Next week")}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2 rounded-full bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={() => toast.info("Add shift form coming soon")}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              New shift
            </Button>
          </div>
        }
      />

      {/* Summary + Filters */}
      <motion.div variants={staggerItem} className="grid gap-3 sm:grid-cols-4">
        <Card variant="flat" className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)]">
              <Users
                className="h-4 w-4 text-[var(--neutral-600)]"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-xs text-[var(--neutral-500)]">Active staff</p>
              <p className="text-lg font-semibold text-foreground">
                {employees.length}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="flat" className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-yellow-50)]">
              <Calendar
                className="h-4 w-4 text-[var(--mw-yellow-700)]"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-xs text-[var(--neutral-500)]">Shifts this week</p>
              <p className="text-lg font-semibold text-foreground">
                {totalShiftCount}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="flat" className="p-4 sm:col-span-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-400)]"
                strokeWidth={1.5}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, role, or department…"
                className="h-10 rounded-full border-[var(--border)] bg-transparent pl-9"
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="h-10 w-[180px] rounded-full border-[var(--border)]">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {allDepartments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div
        variants={staggerItem}
        className="flex flex-wrap items-center gap-4"
      >
        {(["day", "afternoon", "night"] as const).map((s) => {
          const st = SHIFT_STYLES[s];
          return (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className={cn("h-2.5 w-2.5 rounded-full", st.dot)} />
              <span className="text-[var(--neutral-500)]">{st.label}</span>
            </div>
          );
        })}
        <span className="text-xs text-[var(--neutral-400)]">
          Click a cell to toggle a shift
        </span>
      </motion.div>

      {/* Calendar grid */}
      <motion.div variants={staggerItem}>
        <Card variant="flat" className="overflow-x-auto p-0">
          <div className="min-w-[920px]">
            {/* Column header */}
            <div className="grid grid-cols-[240px_repeat(7,1fr)] border-b border-[var(--neutral-200)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)]">
              <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--neutral-500)]">
                Employee
              </div>
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd.day}
                  className="border-l border-[var(--neutral-200)] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--neutral-500)]"
                >
                  {wd.label}
                </div>
              ))}
            </div>

            {/* Department-grouped rows */}
            {groupedByDept.map((group) => (
              <div key={group.department}>
                <div className="grid grid-cols-[240px_repeat(7,1fr)] bg-[var(--neutral-100)]/60 dark:bg-[var(--neutral-900)]/40 border-b border-[var(--neutral-200)]">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--neutral-600)]">
                    {group.department}
                  </div>
                  <div className="col-span-7 px-3 py-2 text-[11px] text-[var(--neutral-400)]">
                    {group.employees.length} staff
                  </div>
                </div>

                {group.employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[240px_repeat(7,1fr)] border-b border-[var(--neutral-100)] last:border-b-0 hover:bg-[var(--neutral-50)]/60 dark:hover:bg-[var(--neutral-900)]/20"
                  >
                    <EmployeeCell emp={emp} />
                    {WEEKDAYS.map((wd) => {
                      const cellShifts =
                        shiftsByCell.get(`${emp.id}:${wd.day}`) ?? [];
                      const hasAny = cellShifts.length > 0;
                      return (
                        <button
                          key={wd.day}
                          type="button"
                          onClick={() => handleCellClick(emp, wd.day)}
                          className={cn(
                            "group flex flex-col gap-1 border-l border-[var(--neutral-100)] p-2 text-left transition-colors",
                            hasAny
                              ? "hover:bg-[var(--neutral-100)]/50"
                              : "hover:bg-[var(--mw-yellow-50)]/60",
                          )}
                          aria-label={`${emp.name} — ${WEEKDAYS.find((w) => w.day === wd.day)?.label} ${hasAny ? "toggle off" : "add shift"}`}
                        >
                          {hasAny ? (
                            cellShifts.map((s) => (
                              <ShiftChip key={s.id} shift={s} />
                            ))
                          ) : (
                            <div className="flex h-full min-h-[40px] items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <Plus
                                className="h-4 w-4 text-[var(--neutral-400)]"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}

            {visibleEmployees.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-[var(--neutral-400)]">
                No staff match the current filters.
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageShell>
  );
}
