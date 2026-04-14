/**
 * Vendor Comparison — Side-by-side supplier benchmarking with price history chart.
 * Route: /buy/vendor-comparison
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  DollarSign,
  Star,
  TruckIcon,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import {
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION,
  MW_TOOLTIP_STYLE,
  MW_CARTESIAN_GRID,
  MW_AXIS_TICK,
} from "@/components/shared/charts/chart-theme";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { buyService } from "@/services";
import type { VendorComparisonData } from "@/types/entities";

const breadcrumbs = [
  { label: "Buy", href: "/buy" },
  { label: "Vendor Comparison" },
];

/** Colour per selected vendor slot (up to 5) */
const VENDOR_LINE_COLOURS = [
  "var(--chart-scale-high)",
  "var(--chart-scale-mid)",
  "var(--chart-scale-low)",
  "var(--neutral-400)",
  "var(--neutral-500)",
];

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          strokeWidth={1.5}
          fill={i < rating ? "var(--mw-yellow-400)" : "none"}
          stroke={
            i < rating ? "var(--mw-yellow-400)" : "var(--neutral-300)"
          }
        />
      ))}
    </div>
  );
}

export function BuyVendorComparison() {
  const [vendors, setVendors] = useState<VendorComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    buyService.getVendorComparison().then((data) => {
      setVendors(data);
      // Pre-select first 3
      setSelectedIds(new Set(data.slice(0, 3).map((v) => v.supplierId)));
      setLoading(false);
    });
  }, []);

  const selectedVendors = vendors.filter((v) =>
    selectedIds.has(v.supplierId),
  );

  const toggleVendor = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  };

  // Build unified chart data: [{month, vendor1, vendor2, ...}]
  const chartData = selectedVendors.length > 0
    ? selectedVendors[0].priceHistory.map((point, i) => {
        const entry: Record<string, string | number> = {
          month: point.month,
        };
        selectedVendors.forEach((v) => {
          entry[v.supplierName] = v.priceHistory[i]?.avgPrice ?? 0;
        });
        return entry;
      })
    : [];

  return (
    <PageShell>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <PageHeader
          title="Vendor Comparison"
          subtitle="Benchmark suppliers on price, delivery, and quality"
          breadcrumbs={breadcrumbs}
        />

        {/* Vendor selector */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Select Suppliers (2-4)
              </h3>
              <span className="text-xs text-[var(--neutral-500)]">
                {selectedIds.size} of {vendors.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              {vendors.map((v) => (
                <label
                  key={v.supplierId}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--neutral-200)] px-3 py-2 transition-colors hover:bg-[var(--neutral-100)] dark:border-[var(--neutral-700)]"
                >
                  <Checkbox
                    checked={selectedIds.has(v.supplierId)}
                    onCheckedChange={() => toggleVendor(v.supplierId)}
                    disabled={
                      !selectedIds.has(v.supplierId) && selectedIds.size >= 4
                    }
                  />
                  <span className="text-sm text-foreground">
                    {v.supplierName}
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* KPI Comparison Cards */}
        {selectedVendors.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={staggerItem}>
              <KpiStatCard
                label="Best Lead Time"
                value={`${Math.min(...selectedVendors.map((v) => v.avgLeadTimeDays))} days`}
                icon={Clock}
                iconSurface="key"
                hint={
                  selectedVendors.reduce((best, v) =>
                    v.avgLeadTimeDays < best.avgLeadTimeDays ? v : best,
                  ).supplierName
                }
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard
                label="Best On-Time %"
                value={`${Math.max(...selectedVendors.map((v) => v.onTimeDeliveryPercent))}%`}
                icon={TruckIcon}
                hint={
                  selectedVendors.reduce((best, v) =>
                    v.onTimeDeliveryPercent > best.onTimeDeliveryPercent
                      ? v
                      : best,
                  ).supplierName
                }
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard
                label="Top Quality"
                value={`${Math.max(...selectedVendors.map((v) => v.qualityRating))} / 5`}
                icon={Star}
                hint={
                  selectedVendors.reduce((best, v) =>
                    v.qualityRating > best.qualityRating ? v : best,
                  ).supplierName
                }
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard
                label="Lowest Spend"
                value={`$${Math.min(...selectedVendors.map((v) => v.totalSpendAud)).toLocaleString("en-AU")}`}
                icon={DollarSign}
                hint={
                  selectedVendors.reduce((best, v) =>
                    v.totalSpendAud < best.totalSpendAud ? v : best,
                  ).supplierName
                }
              />
            </motion.div>
          </div>
        )}

        {/* Price History Chart */}
        {selectedVendors.length > 0 && (
          <motion.div variants={staggerItem}>
            <ChartCard
              title="Price History (Avg $/unit)"
              subtitle="6-month comparison of selected vendors"
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="month" tick={MW_AXIS_TICK} />
                  <YAxis
                    tick={MW_AXIS_TICK}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    formatter={(v: number) => `$${v}`}
                  />
                  <Legend />
                  {selectedVendors.map((v, i) => (
                    <Line
                      key={v.supplierId}
                      type="monotone"
                      dataKey={v.supplierName}
                      stroke={VENDOR_LINE_COLOURS[i % VENDOR_LINE_COLOURS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      {...MW_RECHARTS_ANIMATION}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        )}

        {/* Comparison Table */}
        {selectedVendors.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-medium text-foreground">
                  Detailed Comparison
                </h3>
                <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
                  <Users className="mr-1 h-3 w-3" strokeWidth={1.5} />
                  {selectedVendors.length} vendors
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4 text-left text-xs font-medium text-[var(--neutral-500)]">
                        Metric
                      </th>
                      {selectedVendors.map((v, i) => (
                        <th
                          key={v.supplierId}
                          className="py-2 px-4 text-center text-xs font-medium"
                          style={{
                            color:
                              VENDOR_LINE_COLOURS[
                                i % VENDOR_LINE_COLOURS.length
                              ],
                          }}
                        >
                          {v.supplierName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--neutral-100)]">
                      <td className="py-3 pr-4 text-[var(--neutral-600)]">
                        Avg Lead Time
                      </td>
                      {selectedVendors.map((v) => (
                        <td
                          key={v.supplierId}
                          className="py-3 px-4 text-center font-mono tabular-nums"
                        >
                          {v.avgLeadTimeDays} days
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[var(--neutral-100)]">
                      <td className="py-3 pr-4 text-[var(--neutral-600)]">
                        On-Time Delivery
                      </td>
                      {selectedVendors.map((v) => (
                        <td
                          key={v.supplierId}
                          className="py-3 px-4 text-center font-mono tabular-nums"
                        >
                          {v.onTimeDeliveryPercent}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[var(--neutral-100)]">
                      <td className="py-3 pr-4 text-[var(--neutral-600)]">
                        Quality Rating
                      </td>
                      {selectedVendors.map((v) => (
                        <td
                          key={v.supplierId}
                          className="py-3 px-4"
                        >
                          <div className="flex justify-center">
                            <StarRating rating={v.qualityRating} />
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-[var(--neutral-600)]">
                        Total Spend
                      </td>
                      {selectedVendors.map((v) => (
                        <td
                          key={v.supplierId}
                          className="py-3 px-4 text-center font-mono tabular-nums font-medium"
                        >
                          ${v.totalSpendAud.toLocaleString("en-AU")}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedVendors.length === 0 && !loading && (
          <motion.div variants={staggerItem}>
            <Card variant="flat" className="p-6">
              <p className="py-8 text-center text-sm text-[var(--neutral-500)]">
                Select at least one supplier above to see comparisons.
              </p>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
}
