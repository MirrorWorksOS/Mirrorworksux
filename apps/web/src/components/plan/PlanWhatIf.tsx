/**
 * PlanWhatIf — Two-panel "What-If" scenario planner.
 *
 * Left panel: input form (product, qty, due date).
 * Right panel: impact analysis — projected delivery date + affected jobs.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { FlaskConical, CalendarCheck, AlertCircle, Package } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planService } from "@/services";
import type { Job } from "@/types/entities";
import { RushOrderPanel } from "@/components/plan/RushOrderPanel";

/* ── products mock ───────────────────────────────────────────────── */

const PRODUCTS = [
  { id: "prod-001", name: "Mounting Bracket 90\u00b0" },
  { id: "prod-002", name: "Base Plate 200\u00d7200" },
  { id: "prod-003", name: "Cable Tray Support 600mm" },
  { id: "prod-004", name: "Server Rack Chassis" },
  { id: "prod-005", name: "Machine Guard Assembly" },
];

/* ── component ───────────────────────────────────────────────────── */

export function PlanWhatIf() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("100");
  const [dueDate, setDueDate] = useState("2026-05-15");
  const [simulated, setSimulated] = useState(false);

  useEffect(() => {
    planService.getJobs().then(setJobs);
  }, []);

  /* mock calculation — 3 weeks from input date */
  const projectedDate = useMemo(() => {
    if (!dueDate) return "";
    const d = new Date(dueDate);
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  }, [dueDate]);

  const selectedProduct = PRODUCTS.find((p) => p.id === productId);

  /* affected jobs = active/planned jobs */
  const affectedJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "in_progress" || j.status === "planned")
        .slice(0, 3)
        .map((j, i) => {
          const orig = new Date(j.dueDate);
          const shifted = new Date(orig);
          shifted.setDate(shifted.getDate() + 2 + i);
          return {
            ...j,
            shiftedDate: shifted.toISOString().slice(0, 10),
            delayDays: 2 + i,
          };
        }),
    [jobs],
  );

  const handleSimulate = () => {
    if (!productId || !qty || !dueDate) return;
    setSimulated(true);
  };

  return (
    <PageShell>
      <PageHeader
        title="What-If Scenario"
        subtitle="Model new demand and see the impact on existing schedules"
        breadcrumbs={[
          { label: "Plan", href: "/plan" },
          { label: "What-If" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — Input */}
        <motion.div variants={staggerItem} initial="initial" animate="animate">
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">Scenario Input</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Requested Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setSimulated(false);
                  }}
                  className="font-mono"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSimulate}
                disabled={!productId || !qty || !dueDate}
              >
                <FlaskConical className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Run Simulation
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Right — Impact */}
        <motion.div variants={staggerItem} initial="initial" animate="animate">
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[var(--chart-scale-high)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">Impact Analysis</h3>
            </div>

            {!simulated ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-3 h-10 w-10 text-[var(--neutral-300)]" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">
                  Configure a scenario and run the simulation to see results.
                </p>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* Projected delivery */}
                <motion.div variants={staggerItem}>
                  <div className="rounded-lg bg-[var(--chart-scale-high)]/10 p-4">
                    <p className="text-sm text-muted-foreground">Projected Delivery Date</p>
                    <p className="mt-1 text-2xl font-light tabular-nums text-foreground font-mono">
                      {projectedDate}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedProduct?.name} &times; {qty} units
                    </p>
                  </div>
                </motion.div>

                {/* Feasibility */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <AlertCircle className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                    <p className="text-sm text-foreground">
                      Requested date <span className="font-mono">{dueDate}</span> is not feasible.
                      Earliest completion is <span className="font-mono font-medium">{projectedDate}</span>.
                    </p>
                  </div>
                </motion.div>

                {/* Affected jobs */}
                <motion.div variants={staggerItem}>
                  <p className="mb-2 text-sm font-medium text-[var(--neutral-600)]">
                    Affected Existing Jobs
                  </p>
                  <div className="space-y-2">
                    {affectedJobs.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--neutral-200)] p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            <span className="font-mono">{j.jobNumber}</span> — {j.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {j.dueDate} &rarr; {j.shiftedDate}
                          </p>
                        </div>
                        <Badge variant="secondary">+{j.delayDays}d</Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>

      <div className="mt-6">
        <RushOrderPanel />
      </div>
    </PageShell>
  );
}
