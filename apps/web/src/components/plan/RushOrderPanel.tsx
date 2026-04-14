/**
 * RushOrderPanel — "What happens if?" rush-order simulation.
 *
 * Select a job to rush; shows cascade impact on delayed jobs
 * with red highlights on breached due dates.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Zap, Calendar } from "lucide-react";

import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planService } from "@/services";
import type { Job } from "@/types/entities";

/* ── cascade mock ────────────────────────────────────────────────── */

interface CascadeImpact {
  jobNumber: string;
  title: string;
  originalDate: string;
  newDate: string;
  breached: boolean;
  delayDays: number;
}

function buildCascade(rushedJob: Job, allJobs: Job[]): CascadeImpact[] {
  const others = allJobs.filter(
    (j) => j.id !== rushedJob.id && j.status !== "completed" && j.status !== "draft",
  );
  return others.slice(0, 3).map((j, i) => {
    const delayDays = 3 + i * 2;
    const orig = new Date(j.dueDate);
    const shifted = new Date(orig);
    shifted.setDate(shifted.getDate() + delayDays);
    return {
      jobNumber: j.jobNumber,
      title: j.title,
      originalDate: j.dueDate,
      newDate: shifted.toISOString().slice(0, 10),
      breached: shifted > orig,
      delayDays,
    };
  });
}

/* ── component ───────────────────────────────────────────────────── */

export function RushOrderPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    planService.getJobs().then(setJobs);
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const cascade = useMemo(
    () => (selectedJob ? buildCascade(selectedJob, jobs) : []),
    [selectedJob, jobs],
  );

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-[var(--mw-yellow-400)]" strokeWidth={1.5} />
        <h3 className="text-base font-medium text-foreground">Rush Order Simulation</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Select a job to rush — see the cascade impact on other scheduled work.
      </p>

      <Select value={selectedJobId} onValueChange={setSelectedJobId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a job to rush..." />
        </SelectTrigger>
        <SelectContent>
          {jobs
            .filter((j) => j.status !== "completed")
            .map((j) => (
              <SelectItem key={j.id} value={j.id}>
                <span className="font-mono text-xs">{j.jobNumber}</span>
                <span className="ml-2 text-muted-foreground">{j.title}</span>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedJob && (
        <motion.div
          className="mt-6 space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="rounded-lg bg-[var(--mw-yellow-400)]/10 p-3">
            <p className="text-sm font-medium text-foreground">
              <Zap className="mr-1 inline h-4 w-4" strokeWidth={1.5} />
              Rushing{" "}
              <span className="font-mono">{selectedJob.jobNumber}</span> —{" "}
              {selectedJob.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Current due: {selectedJob.dueDate} &middot; Priority elevated to Urgent
            </p>
          </div>

          {cascade.length > 0 && (
            <>
              <p className="text-sm font-medium text-[var(--neutral-600)]">
                <AlertTriangle className="mr-1 inline h-4 w-4 text-destructive" strokeWidth={1.5} />
                Cascade Impact — {cascade.length} jobs affected
              </p>

              {cascade.map((item) => (
                <motion.div
                  key={item.jobNumber}
                  variants={staggerItem}
                  className={`rounded-lg border p-3 ${
                    item.breached
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-[var(--neutral-200)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-mono">{item.jobNumber}</span> — {item.title}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" strokeWidth={1.5} />
                          Was: {item.originalDate}
                        </span>
                        <span className="font-medium text-foreground">
                          Now: {item.newDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={item.breached ? "destructive" : "secondary"}>
                        +{item.delayDays}d
                      </Badge>
                      {item.breached && (
                        <span className="text-[10px] font-medium text-destructive">
                          Due date breached
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </Card>
  );
}
