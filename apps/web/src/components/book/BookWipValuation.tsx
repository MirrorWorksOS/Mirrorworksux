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
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/components/ui/utils";

function fmtAud(v: number): string {
  return v.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

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
        <Card variant="flat" className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>% Complete</TableHead>
                <TableHead className="text-right">Costs Incurred</TableHead>
                <TableHead className="text-right">Value Earned</TableHead>
                <TableHead className="text-right">WIP Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono font-medium">
                    {row.jobNumber}
                  </TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmtAud(row.costsIncurred)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmtAud(row.valueEarned)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono font-medium",
                      row.wipBalance > 0
                        ? "text-foreground"
                        : "text-[var(--neutral-500)]",
                    )}
                  >
                    {fmtAud(row.wipBalance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </PageShell>
  );
}
