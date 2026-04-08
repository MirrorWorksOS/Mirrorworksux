/**
 * WorkOrderSequencing — "Next WO" display card.
 *
 * Shows next work order in queue: job name, operation, priority badge,
 * estimated duration. "Start Next" button.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Play, Timer, ListOrdered } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { makeService } from "@/services/makeService";
import type { WorkOrder } from "@/types/entities";

/* ------------------------------------------------------------------ */
/* Priority badge colours                                              */
/* ------------------------------------------------------------------ */

const PRIORITY_CLASS: Record<string, string> = {
  low: "bg-[var(--neutral-200)] text-[var(--neutral-600)] border-transparent",
  medium: "bg-[var(--chart-scale-mid)]/15 text-[var(--chart-scale-mid)] border-[var(--chart-scale-mid)]/30",
  high: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30",
  urgent: "bg-[var(--mw-red,#dc2626)]/15 text-[var(--mw-red,#dc2626)] border-[var(--mw-red,#dc2626)]/30",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function WorkOrderSequencing() {
  const [nextWO, setNextWO] = useState<WorkOrder | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    makeService.getWorkOrders().then((orders) => {
      const pending = orders.find((wo) => wo.status === "pending");
      setNextWO(pending ?? null);
    });
  }, []);

  // Launch the next work order into Shop Floor Mode. We intentionally
  // navigate to /floor/run/:id rather than firing a toast — the previous
  // implementation pretended to start a job but the operator had nowhere
  // to actually run it. Routing into Floor Mode puts them on the proper
  // execution screen (WorkOrderFullScreen) with timer, parts counter,
  // checklist, and emergency stop.
  const handleStart = () => {
    if (!nextWO) return;
    navigate(`/floor/run/${nextWO.id}`);
  };

  if (!nextWO) {
    return (
      <Card variant="flat" className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ListOrdered className="h-5 w-5" strokeWidth={1.5} />
          <span>No pending work orders in queue.</span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <Card variant="flat" className="p-6">
        <motion.div variants={staggerItem} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">
                Next Work Order
              </h3>
            </div>
            <Badge variant="outline" className={PRIORITY_CLASS["high"]}>
              Up Next
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{nextWO.woNumber}</span>
              {" "}on{" "}
              <span className="font-medium text-foreground">{nextWO.machineName}</span>
            </p>
            <p className="text-lg font-medium text-foreground">
              {nextWO.operation}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Timer className="h-4 w-4" strokeWidth={1.5} />
                Est. {nextWO.estimatedMinutes} min
              </span>
              <span>Seq. #{nextWO.sequence}</span>
            </div>
          </div>

          <Button className="w-full" onClick={handleStart}>
            <Play className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
            Start Next
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
}
