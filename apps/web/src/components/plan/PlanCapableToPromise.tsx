/**
 * PlanCapableToPromise — Capable-to-Promise card for Plan context.
 *
 * Per-work-centre capacity bars, earliest completion date,
 * confidence score, and bottleneck identification.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CalendarCheck, Gauge, Factory, AlertTriangle } from "lucide-react";

import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { planService } from "@/services";
import type { CapableToPromiseResult, WorkCentre } from "@/types/entities";

/* ── component ───────────────────────────────────────────────────── */

export function PlanCapableToPromise() {
  const [ctp, setCtp] = useState<CapableToPromiseResult | null>(null);
  const [centres, setCentres] = useState<WorkCentre[]>([]);

  useEffect(() => {
    planService.getCapableToPromise().then(setCtp);
    planService.getWorkCentres().then(setCentres);
  }, []);

  if (!ctp) return null;

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-5 flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 text-[var(--chart-scale-high)]" strokeWidth={1.5} />
        <h3 className="text-base font-medium text-foreground">Capable-to-Promise</h3>
      </div>

      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Summary row */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[var(--chart-scale-high)]/10 p-4">
            <p className="text-xs text-muted-foreground">Earliest Completion</p>
            <p className="mt-1 text-xl font-light tabular-nums text-foreground font-mono">
              {ctp.earliestDate}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--chart-scale-mid)]/10 p-4">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="mt-1 text-xl font-light tabular-nums text-foreground">
              {ctp.confidencePercent}%
            </p>
          </div>
        </motion.div>

        {/* Overall utilisation */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-[var(--neutral-600)]">
              <Gauge className="h-4 w-4" strokeWidth={1.5} />
              Overall Capacity Utilisation
            </span>
            <span className="font-mono text-foreground">{ctp.capacityUtilization}%</span>
          </div>
          <Progress value={ctp.capacityUtilization} className="mt-2 h-2" />
        </motion.div>

        {/* Bottleneck */}
        {ctp.bottleneckWorkCenter && (
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" strokeWidth={1.5} />
              <p className="text-sm text-foreground">
                Bottleneck: <span className="font-medium">{ctp.bottleneckWorkCenter}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Per-centre capacity */}
        <motion.div variants={staggerItem}>
          <p className="mb-3 text-sm font-medium text-[var(--neutral-600)]">
            <Factory className="mr-1 inline h-4 w-4" strokeWidth={1.5} />
            Work Centre Capacity
          </p>
          <div className="space-y-3">
            {centres.map((wc) => {
              const isBottleneck = wc.name === ctp.bottleneckWorkCenter;
              return (
                <div key={wc.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{wc.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--neutral-500)]">
                        {wc.utilizationPercent}%
                      </span>
                      {isBottleneck && (
                        <Badge variant="destructive" className="text-[10px]">
                          Bottleneck
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={wc.utilizationPercent}
                    className={`mt-1 h-1.5 ${isBottleneck ? "[&>div]:bg-destructive" : ""}`}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
}
