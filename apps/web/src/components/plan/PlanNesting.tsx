/**
 * PlanNesting — Visual part nesting viewer.
 *
 * Shows sheet outlines with nested parts as coloured rectangles.
 * Displays yield %, waste %, and parts per sheet for each nest.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Layers, Scissors, BarChart3 } from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { planService } from "@/services";
import type { NestingSheet, NestingPart } from "@/types/entities";

/* ── colours for parts by job ────────────────────────────────────── */

const PART_COLOURS = [
  "var(--chart-scale-high)",
  "var(--chart-scale-mid)",
  "var(--chart-scale-low)",
  "var(--neutral-400)",
  "var(--neutral-500)",
];

function getPartColour(index: number): string {
  return PART_COLOURS[index % PART_COLOURS.length];
}

/* ── SVG nesting view ────────────────────────────────────────────── */

function NestSvg({ sheet }: { sheet: NestingSheet }) {
  const viewW = sheet.sheetWidthMm;
  const viewH = sheet.sheetHeightMm;
  const jobColourMap = new Map<string, string>();
  let colIdx = 0;

  /* Lay out parts in a grid within the sheet */
  const renderedParts: Array<NestingPart & { cx: number; cy: number; colour: string }> = [];

  for (const part of sheet.parts) {
    if (!jobColourMap.has(part.jobNumber)) {
      jobColourMap.set(part.jobNumber, getPartColour(colIdx++));
    }
    const colour = jobColourMap.get(part.jobNumber)!;
    const gap = 8;
    const cols = Math.floor((viewW - gap) / (part.widthMm + gap));
    for (let i = 0; i < part.qty; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const cx = gap + col * (part.widthMm + gap);
      const cy = gap + row * (part.heightMm + gap);
      if (cx + part.widthMm > viewW || cy + part.heightMm > viewH) break;
      renderedParts.push({ ...part, cx, cy, colour });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full rounded-md border border-[var(--neutral-200)]"
      style={{ maxHeight: 240, backgroundColor: "var(--neutral-100)" }}
    >
      {/* sheet outline */}
      <rect
        x={0}
        y={0}
        width={viewW}
        height={viewH}
        fill="var(--neutral-100)"
        stroke="var(--neutral-300)"
        strokeWidth={4}
      />
      {/* parts */}
      {renderedParts.map((p, i) => (
        <rect
          key={`${p.partId}-${i}`}
          x={p.cx}
          y={p.cy}
          width={p.widthMm}
          height={p.heightMm}
          rx={4}
          fill={p.colour}
          opacity={0.85}
          stroke="var(--neutral-100)"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanNesting() {
  const [sheets, setSheets] = useState<NestingSheet[]>([]);

  useEffect(() => {
    planService.getNestingSheets().then(setSheets);
  }, []);

  const avgYield = sheets.length
    ? Math.round(sheets.reduce((s, n) => s + n.yieldPercent, 0) / sheets.length)
    : 0;
  const totalParts = sheets.reduce(
    (s, n) => s + n.parts.reduce((ps, p) => ps + p.qty, 0),
    0,
  );

  return (
    <PageShell>
      <PageHeader
        title="Nesting"
        subtitle="Sheet metal part nesting and material optimisation"
        breadcrumbs={[
          { label: "Plan", href: "/plan" },
          { label: "Nesting" },
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
          <KpiStatCard label="Avg Yield" value={`${avgYield}%`} icon={BarChart3} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Sheets" value={sheets.length} icon={Layers} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Total Parts" value={totalParts} icon={Scissors} />
        </motion.div>
      </motion.div>

      {/* Nest cards */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {sheets.map((sheet) => (
          <motion.div key={sheet.id} variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {sheet.material} — {sheet.gauge}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {sheet.sheetWidthMm} &times; {sheet.sheetHeightMm} mm
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Yield {sheet.yieldPercent}%</Badge>
                  <Badge variant="outline">Waste {sheet.wastePercent}%</Badge>
                </div>
              </div>

              <NestSvg sheet={sheet} />

              {/* parts legend */}
              <div className="mt-3 flex flex-wrap gap-3">
                {sheet.parts.map((p, i) => (
                  <div key={`${p.partId}-${i}`} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: getPartColour(i) }}
                    />
                    <span className="text-xs text-[var(--neutral-600)]">
                      <span className="font-mono">{p.partNumber}</span> &times;{p.qty}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </PageShell>
  );
}
