/**
 * PlanScheduleEngine — Gantt-style work-centre schedule view.
 *
 * Each row = work centre; blocks = job operations colour-coded by job.
 * Capacity utilisation progress bar per centre + "Auto-Schedule" re-sequence animation.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarClock, Shuffle, Factory } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { planService } from "@/services";
import type { ScheduleBlock, WorkCentre } from "@/types/entities";

/* ── helpers ─────────────────────────────────────────────────────── */

const HOUR_PX = 60;
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const HOURS_IN_VIEW = DAY_END_HOUR - DAY_START_HOUR;

function minuteOffset(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() - DAY_START_HOUR) * 60 + d.getMinutes();
}

function pxLeft(iso: string): number {
  return (minuteOffset(iso) / 60) * HOUR_PX;
}

function pxWidth(start: string, end: string): number {
  const diff = minuteOffset(end) - minuteOffset(start);
  return Math.max((diff / 60) * HOUR_PX, 24);
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanScheduleEngine() {
  const [workCentres, setWorkCentres] = useState<WorkCentre[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    planService.getWorkCentres().then(setWorkCentres);
    planService.getScheduleBlocks().then(setBlocks);
  }, []);

  /* group blocks by work-centre */
  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleBlock[]>();
    for (const wc of workCentres) map.set(wc.id, []);
    for (const b of blocks) {
      const arr = map.get(b.workCenterId);
      if (arr) arr.push(b);
    }
    return map;
  }, [workCentres, blocks]);

  /* auto-schedule mock — shuffle blocks with staggered animation */
  const autoSchedule = useCallback(() => {
    setScheduling(true);
    const shuffled = [...blocks].sort(() => Math.random() - 0.5);
    const batched: ScheduleBlock[] = [];
    let i = 0;
    const tick = setInterval(() => {
      if (i >= shuffled.length) {
        clearInterval(tick);
        setScheduling(false);
        return;
      }
      batched.push(shuffled[i]);
      setBlocks([...batched, ...blocks.filter((b) => !batched.find((s) => s.id === b.id))]);
      i++;
    }, 500);
  }, [blocks]);

  /* KPIs */
  const avgUtil = workCentres.length
    ? Math.round(workCentres.reduce((s, w) => s + w.utilizationPercent, 0) / workCentres.length)
    : 0;

  const totalJobs = new Set(blocks.map((b) => b.jobId)).size;

  /* hour labels */
  const hourLabels = Array.from({ length: HOURS_IN_VIEW }, (_, i) => {
    const h = DAY_START_HOUR + i;
    return `${h.toString().padStart(2, "0")}:00`;
  });

  return (
    <PageShell>
      <PageHeader
        title="Schedule Engine"
        subtitle="Work-centre Gantt schedule with auto-sequencing"
        breadcrumbs={[
          { label: "Plan", href: "/plan" },
          { label: "Schedule Engine" },
        ]}
        actions={
          <Button onClick={autoSchedule} disabled={scheduling}>
            <Shuffle className="mr-2 h-4 w-4" strokeWidth={1.5} />
            {scheduling ? "Scheduling..." : "Auto-Schedule"}
          </Button>
        }
      />

      {/* KPI row */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg Utilisation"
            value={`${avgUtil}%`}
            icon={Factory}
            hint="Across all work centres"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Active Jobs"
            value={totalJobs}
            icon={CalendarClock}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Work Centres"
            value={workCentres.length}
            icon={Factory}
          />
        </motion.div>
      </motion.div>

      {/* Gantt chart */}
      <Card variant="flat" className="overflow-x-auto p-6">
        <div style={{ minWidth: HOURS_IN_VIEW * HOUR_PX + 160 }}>
          {/* hour header */}
          <div className="flex border-b border-[var(--neutral-200)] pb-2">
            <div className="w-40 shrink-0 text-xs font-medium text-[var(--neutral-500)]">
              Work Centre
            </div>
            <div className="relative flex-1">
              <div className="flex">
                {hourLabels.map((h) => (
                  <div
                    key={h}
                    className="text-xs text-[var(--neutral-400)] font-mono"
                    style={{ width: HOUR_PX }}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* rows */}
          {workCentres.map((wc) => {
            const wcBlocks = grouped.get(wc.id) ?? [];
            return (
              <div key={wc.id} className="flex items-center border-b border-[var(--neutral-100)] py-3">
                <div className="w-40 shrink-0 space-y-1 pr-4">
                  <p className="text-sm font-medium text-foreground">{wc.name}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={wc.utilizationPercent} className="h-1.5 flex-1" />
                    <span className="text-xs font-mono text-[var(--neutral-500)]">
                      {wc.utilizationPercent}%
                    </span>
                  </div>
                </div>
                <div className="relative flex-1" style={{ height: 40 }}>
                  {wcBlocks.map((block) => (
                    <motion.div
                      key={block.id}
                      layout
                      className="absolute top-1 flex items-center rounded-md px-2 text-xs font-medium text-white shadow-sm"
                      style={{
                        left: pxLeft(block.startTime),
                        width: pxWidth(block.startTime, block.endTime),
                        height: 32,
                        backgroundColor: block.color,
                      }}
                      initial={{ opacity: 0, scaleX: 0.8 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.35 }}
                      title={`${block.jobNumber} — ${block.operationName}`}
                    >
                      <span className="truncate font-mono text-[11px]">
                        {block.jobNumber}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* legend */}
      <Card variant="flat" className="p-6">
        <p className="mb-2 text-sm font-medium text-foreground">Legend</p>
        <div className="flex flex-wrap gap-4">
          {Array.from(new Set(blocks.map((b) => b.jobNumber))).map((jn) => {
            const block = blocks.find((b) => b.jobNumber === jn);
            return (
              <div key={jn} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: block?.color }}
                />
                <span className="text-xs font-mono text-[var(--neutral-600)]">{jn}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}
