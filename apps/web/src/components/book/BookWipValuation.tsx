/**
 * BookWipValuation — WIP balance sheet view with KPI summary and data table.
 * Displays job-level work-in-progress valuation with progress bars.
 */
import { useState, useEffect, useMemo } from "react";
import { DollarSign } from "lucide-react";
import { motion } from "motion/react";

import { bookService } from "@/services";
import type { WipValuation } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { cn } from "@/components/ui/utils";

function fmtAud(v: number): string {
  return v.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const wipColumns: MwColumnDef<WipValuation>[] = [
  {
    key: "jobNumber",
    header: "Job #",
    className: "font-mono font-medium",
    cell: (row) => row.jobNumber,
  },
  { key: "customer", header: "Customer", cell: (row) => row.customerName },
  {
    key: "percent",
    header: "% Complete",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--neutral-200)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              row.percentComplete >= 75
                ? "bg-[var(--mw-success)]"
                : row.percentComplete >= 40
                  ? "bg-[var(--chart-scale-mid)]"
                  : "bg-[var(--chart-scale-low)]",
            )}
            style={{ width: `${row.percentComplete}%` }}
          />
        </div>
        <span className="font-mono text-xs text-[var(--neutral-500)]">
          {row.percentComplete}%
        </span>
      </div>
    ),
  },
  {
    key: "costs",
    header: "Costs Incurred",
    headerClassName: "text-right",
    className: "text-right font-mono",
    cell: (row) => fmtAud(row.costsIncurred),
  },
  {
    key: "earned",
    header: "Value Earned",
    headerClassName: "text-right",
    className: "text-right font-mono",
    cell: (row) => fmtAud(row.valueEarned),
  },
  {
    key: "balance",
    header: "WIP Balance",
    headerClassName: "text-right",
    cell: (row) => (
      <span
        className={cn(
          "text-right font-mono font-medium",
          row.wipBalance > 0
            ? "text-foreground"
            : "text-[var(--neutral-500)]",
        )}
      >
        {fmtAud(row.wipBalance)}
      </span>
    ),
    className: "text-right",
  },
];

export function BookWipValuation() {
  const [data, setData] = useState<WipValuation[]>([]);

  useEffect(() => {
    bookService.getWipValuations().then(setData);
  }, []);

  const totalWip = useMemo(
    () => data.reduce((sum, d) => sum + d.wipBalance, 0),
    [data],
  );

  return (
    <PageShell>
      <PageHeader
        title="WIP Valuation"
        subtitle="Work-in-progress balance sheet by job"
        breadcrumbs={[
          { label: "Book", href: "/book" },
          { label: "WIP Valuation" },
        ]}
      />

      {/* KPI */}
      <motion.div variants={staggerItem}>
        <KpiStatCard
          label="Total WIP Value"
          value={
            <span className="font-mono">{fmtAud(totalWip)}</span>
          }
          icon={DollarSign}
          iconSurface="key"
          hint={`Across ${data.length} active jobs`}
        />
      </motion.div>

      {/* Data table */}
      <motion.div variants={staggerItem}>
        <MwDataTable<WipValuation>
          columns={wipColumns}
          data={data}
          keyExtractor={(row) => row.id}
        />
      </motion.div>
    </PageShell>
  );
}
