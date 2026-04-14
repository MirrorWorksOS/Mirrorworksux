/**
 * PlanSheetCalculator — Interactive sheet nesting calculator.
 *
 * Input: sheet dims, part dims, border gap.
 * Live SVG preview + yield/waste metrics.
 * All calculated client-side — no service calls.
 */

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, Maximize2, Grid3X3, Percent } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";

/* ── calculator logic ────────────────────────────────────────────── */

interface CalcResult {
  cols: number;
  rows: number;
  partsPerSheet: number;
  yieldPercent: number;
  wastePercent: number;
  partArea: number;
  sheetArea: number;
  usedArea: number;
}

function calculate(
  sheetW: number,
  sheetH: number,
  partW: number,
  partH: number,
  gap: number,
): CalcResult {
  if (sheetW <= 0 || sheetH <= 0 || partW <= 0 || partH <= 0 || gap < 0) {
    return { cols: 0, rows: 0, partsPerSheet: 0, yieldPercent: 0, wastePercent: 100, partArea: 0, sheetArea: 0, usedArea: 0 };
  }

  const cols = Math.floor((sheetW - gap) / (partW + gap));
  const rows = Math.floor((sheetH - gap) / (partH + gap));
  const partsPerSheet = cols * rows;
  const partArea = partW * partH;
  const sheetArea = sheetW * sheetH;
  const usedArea = partsPerSheet * partArea;
  const yieldPercent = sheetArea > 0 ? Math.round((usedArea / sheetArea) * 100) : 0;
  const wastePercent = 100 - yieldPercent;

  return { cols, rows, partsPerSheet, yieldPercent, wastePercent, partArea, sheetArea, usedArea };
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanSheetCalculator() {
  const [sheetW, setSheetW] = useState(2400);
  const [sheetH, setSheetH] = useState(1200);
  const [partW, setPartW] = useState(150);
  const [partH, setPartH] = useState(100);
  const [gap, setGap] = useState(8);

  const result = useMemo(
    () => calculate(sheetW, sheetH, partW, partH, gap),
    [sheetW, sheetH, partW, partH, gap],
  );

  /* SVG scaling */
  const svgViewW = sheetW || 1;
  const svgViewH = sheetH || 1;

  return (
    <PageShell>
      <PageHeader
        title="Sheet Calculator"
        subtitle="Calculate part nesting efficiency for any sheet and part dimensions"
        breadcrumbs={[
          { label: "Plan", href: "/plan" },
          { label: "Sheet Calculator" },
        ]}
      />

      {/* KPIs */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Parts per Sheet"
            value={result.partsPerSheet}
            icon={Grid3X3}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Yield"
            value={`${result.yieldPercent}%`}
            icon={Percent}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Waste"
            value={`${result.wastePercent}%`}
            icon={Maximize2}
            hint={`${(result.sheetArea - result.usedArea).toLocaleString()} mm\u00b2`}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Input form */}
        <motion.div variants={staggerItem} initial="initial" animate="animate">
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">Parameters</h3>
            </div>

            <div className="space-y-4">
              <fieldset className="space-y-3">
                <legend className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                  Sheet Dimensions
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sheetW">Width (mm)</Label>
                    <Input
                      id="sheetW"
                      type="number"
                      min={1}
                      value={sheetW}
                      onChange={(e) => setSheetW(Number(e.target.value))}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sheetH">Height (mm)</Label>
                    <Input
                      id="sheetH"
                      type="number"
                      min={1}
                      value={sheetH}
                      onChange={(e) => setSheetH(Number(e.target.value))}
                      className="font-mono"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                  Part Dimensions
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="partW">Width (mm)</Label>
                    <Input
                      id="partW"
                      type="number"
                      min={1}
                      value={partW}
                      onChange={(e) => setPartW(Number(e.target.value))}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partH">Height (mm)</Label>
                    <Input
                      id="partH"
                      type="number"
                      min={1}
                      value={partH}
                      onChange={(e) => setPartH(Number(e.target.value))}
                      className="font-mono"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="space-y-1.5">
                <Label htmlFor="gap">Border Gap (mm)</Label>
                <Input
                  id="gap"
                  type="number"
                  min={0}
                  value={gap}
                  onChange={(e) => setGap(Number(e.target.value))}
                  className="font-mono"
                />
              </div>

              <div className="rounded-lg bg-[var(--neutral-50)] p-3 text-xs text-muted-foreground">
                <p>
                  <span className="font-mono font-medium text-foreground">{result.cols}</span> cols
                  &times;{" "}
                  <span className="font-mono font-medium text-foreground">{result.rows}</span> rows
                  ={" "}
                  <span className="font-mono font-medium text-foreground">{result.partsPerSheet}</span>{" "}
                  parts
                </p>
                <p className="mt-1">
                  Sheet: <span className="font-mono">{sheetW} &times; {sheetH} mm</span> &middot;
                  Part: <span className="font-mono">{partW} &times; {partH} mm</span>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SVG preview */}
        <motion.div
          className="lg:col-span-2"
          variants={staggerItem}
          initial="initial"
          animate="animate"
        >
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">Live Preview</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">Yield {result.yieldPercent}%</Badge>
                <Badge variant="outline">Waste {result.wastePercent}%</Badge>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${svgViewW} ${svgViewH}`}
              className="w-full rounded-md border border-[var(--neutral-200)]"
              style={{ maxHeight: 400, backgroundColor: "var(--neutral-100)" }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* sheet outline */}
              <rect
                x={0}
                y={0}
                width={svgViewW}
                height={svgViewH}
                fill="var(--neutral-100)"
                stroke="var(--neutral-300)"
                strokeWidth={Math.max(svgViewW, svgViewH) * 0.002}
              />

              {/* parts grid */}
              {Array.from({ length: result.partsPerSheet }, (_, i) => {
                const col = i % result.cols;
                const row = Math.floor(i / result.cols);
                const x = gap + col * (partW + gap);
                const y = gap + row * (partH + gap);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={partW}
                    height={partH}
                    rx={Math.min(partW, partH) * 0.04}
                    fill="var(--chart-scale-high)"
                    opacity={0.8}
                    stroke="var(--neutral-100)"
                    strokeWidth={Math.max(partW, partH) * 0.02}
                  />
                );
              })}
            </svg>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
}
