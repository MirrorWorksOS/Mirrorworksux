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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MirrorWorksAgentCard } from "@/components/shared/ai/MirrorWorksAgentCard";
import { DraftRfqDialog } from "@/components/buy/DraftRfqDialog";
import { toast } from "sonner";
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

/** Product / part filter — "all" leaves the dataset untouched, others apply
 *  a stable per-vendor variation so KPIs and the chart respond meaningfully. */
const PRODUCTS = [
  { id: "all", label: "All products" },
  { id: "mild-steel-plate", label: "Mild steel plate" },
  { id: "stainless-sheet", label: "Stainless sheet" },
  { id: "rhs-shs", label: "RHS / SHS" },
  { id: "welding-consumables", label: "Welding consumables" },
  { id: "fasteners", label: "Fasteners" },
] as const;

type ProductId = (typeof PRODUCTS)[number]["id"];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Returns a stable pseudo-random factor in [min, max] for a (vendor, product) pair. */
function seededFactor(vendorId: string, productId: string, min: number, max: number): number {
  const h = hashSeed(`${vendorId}:${productId}`);
  const t = (h % 1000) / 1000;
  return min + t * (max - min);
}

/** Apply the product filter by reshaping each vendor's metrics deterministically.
 *  When productId is "all" we return the input untouched. */
function applyProductFilter(
  vendors: VendorComparisonData[],
  productId: ProductId,
): VendorComparisonData[] {
  if (productId === "all") return vendors;
  return vendors.map((v) => {
    const priceFactor = seededFactor(v.supplierId, productId, 0.7, 1.3);
    const leadFactor = seededFactor(v.supplierId, `${productId}:lead`, 0.7, 1.4);
    const onTimeJitter = Math.round(
      seededFactor(v.supplierId, `${productId}:ot`, -6, 4),
    );
    const spendFactor = seededFactor(v.supplierId, `${productId}:spend`, 0.1, 0.45);
    const qualityJitter = Math.round(
      seededFactor(v.supplierId, `${productId}:q`, -1, 1),
    );
    return {
      ...v,
      avgLeadTimeDays: Math.max(1, Math.round(v.avgLeadTimeDays * leadFactor)),
      onTimeDeliveryPercent: Math.min(
        100,
        Math.max(0, v.onTimeDeliveryPercent + onTimeJitter),
      ),
      qualityRating: Math.min(5, Math.max(1, v.qualityRating + qualityJitter)),
      totalSpendAud: Math.round(v.totalSpendAud * spendFactor),
      priceHistory: v.priceHistory.map((p) => ({
        month: p.month,
        avgPrice: Math.round(p.avgPrice * priceFactor * 100) / 100,
      })),
    };
  });
}

const SELECTION_STORAGE_KEY = 'mw:buy:vendorComparison';

function loadStoredSelection(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SELECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : null;
  } catch {
    return null;
  }
}

export function BuyVendorComparison() {
  const [vendors, setVendors] = useState<VendorComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<ProductId>("all");
  const [rfqOpen, setRfqOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const stored = loadStoredSelection();
    return stored ? new Set(stored) : new Set();
  });
  const [hydratedFromStorage, setHydratedFromStorage] = useState(() => {
    return loadStoredSelection() !== null;
  });

  useEffect(() => {
    buyService.getVendorComparison().then((data) => {
      setVendors(data);
      // Honour persisted selection; only fall back to "first 3" when nothing was saved.
      if (!hydratedFromStorage) {
        setSelectedIds(new Set(data.slice(0, 3).map((v) => v.supplierId)));
        setHydratedFromStorage(true);
      }
      setLoading(false);
    });
  }, [hydratedFromStorage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // TODO(backend): vendorComparisons.update(currentUser, Array.from(selectedIds))
    try {
      window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
    } catch {
      // Storage write failures are non-fatal; selection still works in-session.
    }
  }, [selectedIds]);

  const filteredVendors = applyProductFilter(vendors, productId);
  const selectedVendors = filteredVendors.filter((v) =>
    selectedIds.has(v.supplierId),
  );
  const productLabel =
    PRODUCTS.find((p) => p.id === productId)?.label ?? "All products";

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

  // Compute insight from selected vendors — picks the most actionable angle
  // (price spread, reliability gap, or quality leader) for the agent card.
  const insight = (() => {
    if (selectedVendors.length < 2) return null;

    const withLatest = selectedVendors.map((v) => ({
      v,
      latestPrice: v.priceHistory[v.priceHistory.length - 1]?.avgPrice ?? 0,
    }));
    const cheapest = withLatest.reduce((a, b) =>
      a.latestPrice < b.latestPrice ? a : b,
    );
    const priciest = withLatest.reduce((a, b) =>
      a.latestPrice > b.latestPrice ? a : b,
    );
    const priceGapPct =
      priciest.latestPrice > 0
        ? Math.round(
            ((priciest.latestPrice - cheapest.latestPrice) /
              priciest.latestPrice) *
              100,
          )
        : 0;

    const bestOnTime = selectedVendors.reduce((best, v) =>
      v.onTimeDeliveryPercent > best.onTimeDeliveryPercent ? v : best,
    );
    const worstOnTime = selectedVendors.reduce((worst, v) =>
      v.onTimeDeliveryPercent < worst.onTimeDeliveryPercent ? v : worst,
    );
    const onTimeGap =
      bestOnTime.onTimeDeliveryPercent - worstOnTime.onTimeDeliveryPercent;

    const totalSpend = selectedVendors.reduce(
      (s, v) => s + v.totalSpendAud,
      0,
    );
    const topSpend = selectedVendors.reduce((top, v) =>
      v.totalSpendAud > top.totalSpendAud ? v : top,
    );
    const concentrationPct =
      totalSpend > 0 ? Math.round((topSpend.totalSpendAud / totalSpend) * 100) : 0;

    // 1) Concentration risk (one vendor > 50% of compared spend)
    if (concentrationPct >= 50 && selectedVendors.length >= 2) {
      const alt = selectedVendors
        .filter((v) => v.supplierId !== topSpend.supplierId)
        .reduce((best, v) =>
          v.onTimeDeliveryPercent > best.onTimeDeliveryPercent ? v : best,
        );
      return {
        tone: "risk" as const,
        title: `Spend concentrated with ${topSpend.supplierName}`,
        suggestion: (
          <>
            <strong>{concentrationPct}%</strong> of spend across the selected
            vendors is going to {topSpend.supplierName}. Shifting a portion to{" "}
            <strong>{alt.supplierName}</strong> ({alt.onTimeDeliveryPercent}%
            on-time, {alt.qualityRating}/5 quality) would reduce
            single-supplier exposure.
          </>
        ),
        detail: (
          <div className="space-y-1.5">
            <p>
              • {topSpend.supplierName}: ${topSpend.totalSpendAud.toLocaleString(
                "en-AU",
              )}{" "}
              ({concentrationPct}% of compared spend).
            </p>
            <p>
              • {alt.supplierName}: ${alt.totalSpendAud.toLocaleString("en-AU")},
              {" "}
              {alt.onTimeDeliveryPercent}% on-time, {alt.avgLeadTimeDays}-day
              lead time.
            </p>
            <p>
              • Recommended next PO: split 70/30 to dilute concentration without
              hurting reliability.
            </p>
          </div>
        ),
      };
    }

    // 2) Material price gap with a reliable cheaper vendor
    if (
      priceGapPct >= 8 &&
      cheapest.v.onTimeDeliveryPercent >= 90 &&
      cheapest.v.qualityRating >= 4
    ) {
      return {
        tone: "opportunity" as const,
        title: `${cheapest.v.supplierName} is ${priceGapPct}% cheaper on current pricing`,
        suggestion: (
          <>
            Latest unit price from <strong>{cheapest.v.supplierName}</strong> is
            $
            {cheapest.latestPrice.toLocaleString("en-AU", {
              maximumFractionDigits: 2,
            })}{" "}
            vs $
            {priciest.latestPrice.toLocaleString("en-AU", {
              maximumFractionDigits: 2,
            })}{" "}
            from {priciest.v.supplierName} — a{" "}
            <strong>{priceGapPct}% gap</strong> with on-time delivery still at{" "}
            {cheapest.v.onTimeDeliveryPercent}% and quality{" "}
            {cheapest.v.qualityRating}/5.
          </>
        ),
        detail: (
          <div className="space-y-1.5">
            <p>
              • {cheapest.v.supplierName}: $
              {cheapest.latestPrice.toLocaleString("en-AU", {
                maximumFractionDigits: 2,
              })}
              /unit, {cheapest.v.avgLeadTimeDays}-day lead time,{" "}
              {cheapest.v.onTimeDeliveryPercent}% on-time.
            </p>
            <p>
              • {priciest.v.supplierName}: $
              {priciest.latestPrice.toLocaleString("en-AU", {
                maximumFractionDigits: 2,
              })}
              /unit, {priciest.v.avgLeadTimeDays}-day lead time,{" "}
              {priciest.v.onTimeDeliveryPercent}% on-time.
            </p>
            <p>
              • At current volumes, shifting 25% of category spend would save
              roughly $
              {Math.round(
                (priciest.v.totalSpendAud * 0.25 * priceGapPct) / 100,
              ).toLocaleString("en-AU")}{" "}
              annually.
            </p>
          </div>
        ),
      };
    }

    // 3) Reliability gap (>= 5pp on-time spread)
    if (onTimeGap >= 5) {
      return {
        tone: "risk" as const,
        title: `${worstOnTime.supplierName} is dragging on-time delivery`,
        suggestion: (
          <>
            <strong>{worstOnTime.supplierName}</strong> is delivering on-time
            only {worstOnTime.onTimeDeliveryPercent}% of the time vs{" "}
            {bestOnTime.onTimeDeliveryPercent}% from {bestOnTime.supplierName}.
            Reroute time-critical lines to {bestOnTime.supplierName} until the
            gap closes.
          </>
        ),
        detail: (
          <div className="space-y-1.5">
            <p>
              • {bestOnTime.supplierName}: {bestOnTime.onTimeDeliveryPercent}%
              on-time, {bestOnTime.avgLeadTimeDays}-day lead time.
            </p>
            <p>
              • {worstOnTime.supplierName}: {worstOnTime.onTimeDeliveryPercent}%
              on-time, {worstOnTime.avgLeadTimeDays}-day lead time.
            </p>
            <p>
              • Open a corrective-action conversation with{" "}
              {worstOnTime.supplierName} before the next quarterly review.
            </p>
          </div>
        ),
      };
    }

    // 4) Default — celebrate the leader
    const topQuality = selectedVendors.reduce((best, v) =>
      v.qualityRating > best.qualityRating ? v : best,
    );
    return {
      tone: "success" as const,
      title: `${topQuality.supplierName} leads on quality and reliability`,
      suggestion: (
        <>
          Across the selected vendors, <strong>{topQuality.supplierName}</strong>{" "}
          is the most reliable partner — {topQuality.qualityRating}/5 quality,
          {" "}
          {topQuality.onTimeDeliveryPercent}% on-time, and{" "}
          {topQuality.avgLeadTimeDays}-day lead time. Consider expanding scope
          for high-spec lines.
        </>
      ),
      detail: null,
    };
  })();

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

        {/* Vendor + product selector */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
                  Product / Part
                </label>
                <Select
                  value={productId}
                  onValueChange={(v) => setProductId(v as ProductId)}
                >
                  <SelectTrigger className="h-9 w-full sm:w-[260px]">
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-[var(--neutral-500)] sm:self-end">
                Comparing on <strong>{productLabel}</strong>
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Select Suppliers (2-4)
              </h3>
              <span className="text-xs text-[var(--neutral-500)]">
                {selectedIds.size} of {vendors.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              {filteredVendors.map((v) => (
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

        {/* Agent insight */}
        {insight && (
          <motion.div variants={staggerItem}>
            <MirrorWorksAgentCard
              title={insight.title}
              suggestion={insight.suggestion}
              tone={insight.tone}
              statusText={`Scope: ${productLabel}`}
              primaryAction={{
                label: "Draft RFQ",
                onClick: () => setRfqOpen(true),
              }}
              secondaryAction={{
                label: "Dismiss",
                onClick: () => toast("Dismissed"),
              }}
              detailContent={insight.detail}
              evidenceLevel={insight.detail ? "expandable" : "hidden"}
              detailLabel="Evidence"
            />
          </motion.div>
        )}

        {/* Price History Chart */}
        {selectedVendors.length > 0 && (
          <motion.div variants={staggerItem}>
            <ChartCard
              title="Price History (Avg $/unit)"
              subtitle={`6-month comparison · ${productLabel}`}
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

      <DraftRfqDialog
        open={rfqOpen}
        onOpenChange={setRfqOpen}
        vendorOptions={selectedVendors.map((v) => ({
          supplierId: v.supplierId,
          supplierName: v.supplierName,
        }))}
        productScopeLabel={productLabel}
      />
    </PageShell>
  );
}
