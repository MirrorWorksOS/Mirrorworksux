/**
 * Buy Reports — procurement analytics dashboard.
 * KPIs, spend mix, supplier performance, payables ageing, lead-time trend.
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { motion } from 'motion/react';
import { Calendar, Download, DollarSign, Package, Users, Clock, AlertTriangle } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Button } from '@/components/ui/button';
import { MirrorWorksAgentCard } from '@/components/shared/ai/MirrorWorksAgentCard';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_V,
  MW_BAR_RADIUS_H,
  MW_FILL,
  getChartScaleColour,
  getChartScalePattern,
} from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import { suppliers, purchaseOrders, bills } from '@/services';
import { toast } from 'sonner';

const LINE_STROKE = 'var(--chart-scale-mid)';

const fmtCurrencyShort = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v.toFixed(0)}`;

const monthlySpend = [
  { month: 'Oct', spend: 95000, orders: 14 },
  { month: 'Nov', spend: 88000, orders: 12 },
  { month: 'Dec', spend: 92000, orders: 13 },
  { month: 'Jan', spend: 102000, orders: 16 },
  { month: 'Feb', spend: 89000, orders: 11 },
  { month: 'Mar', spend: 105000, orders: 17 },
];

const spendByCategory = [
  { category: 'Sheet & Plate', spend: 245000 },
  { category: 'Structural', spend: 128000 },
  { category: 'Consumables', spend: 45000 },
  { category: 'Fasteners', spend: 18000 },
  { category: 'Services', spend: 22000 },
];

const leadTimeTrend = [
  { month: 'Oct', days: 12.4 },
  { month: 'Nov', days: 11.8 },
  { month: 'Dec', days: 13.2 },
  { month: 'Jan', days: 10.9 },
  { month: 'Feb', days: 11.2 },
  { month: 'Mar', days: 9.8 },
];

const billsAgeingBuckets = [
  { bucket: 'Current', amount: 28400 },
  { bucket: '1-30d', amount: 15600 },
  { bucket: '31-60d', amount: 4200 },
  { bucket: '60d+', amount: 1300 },
];

const poStatusDistribution = [
  { name: 'Acknowledged', value: 12 },
  { name: 'Sent', value: 8 },
  { name: 'Partial', value: 4 },
  { name: 'Received', value: 22 },
  { name: 'Draft', value: 3 },
];

export function BuyReports() {
  /* ------------------------------------------------------------------ */
  /*  Derived metrics from centralised data                              */
  /* ------------------------------------------------------------------ */

  const spendBySupplier = useMemo(
    () =>
      suppliers
        .map((s) => ({
          name: s.company,
          spend: purchaseOrders
            .filter((po) => po.supplierId === s.id)
            .reduce((sum, po) => sum + po.total, 0),
        }))
        .filter((s) => s.spend > 0)
        .sort((a, b) => b.spend - a.spend),
    [],
  );

  const spendTotal = useMemo(
    () => spendBySupplier.reduce((s, x) => s + x.spend, 0),
    [spendBySupplier],
  );

  const spendSlices = useMemo(
    () =>
      spendBySupplier.map((s) => ({
        ...s,
        fill: getChartScaleColour((s.spend / Math.max(spendTotal, 1)) * 100),
      })),
    [spendBySupplier, spendTotal],
  );

  const supplierPerformance = useMemo(
    () =>
      suppliers.map((s) => {
        const supplierSpend = purchaseOrders
          .filter((po) => po.supplierId === s.id)
          .reduce((sum, po) => sum + po.total, 0);
        return {
          name: s.company,
          onTime: s.onTimePercent,
          rating: s.rating,
          spend: supplierSpend,
        };
      }),
    [],
  );

  const activeSuppliers = useMemo(
    () => new Set(purchaseOrders.map((po) => po.supplierId)).size,
    [],
  );

  const openPOValue = useMemo(
    () =>
      purchaseOrders
        .filter((po) => po.status !== 'received')
        .reduce((s, po) => s + (po.total - po.received), 0),
    [],
  );

  const avgOnTime = useMemo(() => {
    if (suppliers.length === 0) return 0;
    return Math.round(suppliers.reduce((s, x) => s + x.onTimePercent, 0) / suppliers.length);
  }, []);

  const overdueAmount = useMemo(
    () =>
      bills
        .filter((b) => b.status === 'overdue')
        .reduce((s, b) => s + (b.amount - b.paidAmount), 0),
    [],
  );

  const categoryMax = Math.max(...spendByCategory.map((c) => c.spend), 1);
  const ageingMax = Math.max(...billsAgeingBuckets.map((b) => b.amount), 1);
  const pieColours = [...MW_CHART_COLOURS];

  return (
    <PageShell className="overflow-y-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        <PageHeader
          title="Procurement Reports"
          subtitle="Spend mix, supplier performance, and payables analytics"
          actions={
            <>
              <Button variant="outline" className="border-[var(--border)]">
                <Calendar className="h-4 w-4 mr-2" /> Last 6 months
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border)]"
                onClick={() => toast.success('Exporting report…')}
              >
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </>
          }
        />

        {/* AI Agent insight */}
        <MirrorWorksAgentCard
          title="Spend concentration risk in Sheet & Plate"
          suggestion={
            <>
              <strong>43%</strong> of last-quarter spend went to Hunter Steel Co.
              Diversifying ~15% to Pacific Metals would reduce single-supplier exposure
              while keeping on-time delivery above 95%.
            </>
          }
          tone="opportunity"
          statusText="Updated 30 min ago"
          primaryAction={{
            label: 'Open vendor comparison',
            onClick: () => toast.success('Opening vendor comparison…'),
          }}
          secondaryAction={{ label: 'Dismiss', onClick: () => toast('Dismissed') }}
          detailContent={
            <div className="space-y-1.5">
              <p>• Pacific Metals: 95% on-time, $89k YTD spend, capacity available.</p>
              <p>• Hunter Steel: 98% on-time but absorbing 43% of category spend.</p>
              <p>• Recommended next PO: split 60/40 between the two for the upcoming structural batch.</p>
            </div>
          }
          evidenceLevel="expandable"
          detailLabel="Evidence"
        />

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Total Spend (6mo)"
              value={fmtCurrencyShort(monthlySpend.reduce((s, m) => s + m.spend, 0))}
              icon={DollarSign}
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard label="Active Suppliers" value={activeSuppliers} icon={Users} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard label="Open PO Value" value={fmtCurrencyShort(openPOValue)} icon={Package} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard label="Avg On-Time" value={`${avgOnTime}%`} icon={Clock} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Overdue Bills"
              value={fmtCurrencyShort(overdueAmount)}
              icon={AlertTriangle}
            />
          </motion.div>
        </div>

        {/* Row 1 — Spend mix + Monthly trend */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={staggerItem}>
            <ChartCard title="Spend by Supplier">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={250}>
                  <PieChart>
                    <Pie
                      data={spendSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="spend"
                      {...MW_RECHARTS_ANIMATION}
                    >
                      {spendSlices.map((entry, i) => (
                        <Cell key={`spend-cell-${i}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={MW_TOOLTIP_STYLE}
                      formatter={(v: number) => `$${v.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {spendSlices.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: s.fill }}
                      />
                      <span className="text-[var(--neutral-500)] flex-1 truncate">{s.name}</span>
                      <span className="text-foreground font-medium tabular-nums">
                        {fmtCurrencyShort(s.spend)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <ChartCard title="Monthly Spend Trend">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlySpend}>
                  {mwChartPatternDefs()}
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="month" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `$${v / 1000}k`}
                    tick={MW_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    cursor={MW_BAR_TOOLTIP_CURSOR}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="spend"
                    fill={MW_FILL.HATCH_YELLOW}
                    radius={MW_BAR_RADIUS_V}
                    {...MW_RECHARTS_ANIMATION_BAR}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>

        {/* Row 2 — Category + Lead-time + PO status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={staggerItem}>
            <ChartCard title="Spend by Category">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={spendByCategory} layout="vertical" margin={{ left: 5 }}>
                  {mwChartPatternDefs()}
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${v / 1000}k`}
                    tick={MW_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ ...MW_AXIS_TICK, fill: 'var(--mw-mirage)', fontWeight: 500 }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    cursor={MW_BAR_TOOLTIP_CURSOR}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="spend"
                    radius={MW_BAR_RADIUS_H}
                    barSize={14}
                    {...MW_RECHARTS_ANIMATION_BAR}
                  >
                    {spendByCategory.map((c) => (
                      <Cell
                        key={`cat-${c.category}`}
                        fill={getChartScalePattern((c.spend / categoryMax) * 100)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <ChartCard title="Avg Lead Time (days)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={leadTimeTrend}>
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="month" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={MW_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}d`}
                  />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    formatter={(v: number) => `${v} days`}
                  />
                  <ReferenceLine y={10} stroke="var(--mw-yellow-400)" strokeWidth={2} strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="days"
                    stroke={LINE_STROKE}
                    strokeWidth={2}
                    dot={{ r: 3, fill: LINE_STROKE }}
                    {...MW_RECHARTS_ANIMATION}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <ChartCard title="PO Status Mix">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie
                      data={poStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      {...MW_RECHARTS_ANIMATION}
                    >
                      {poStatusDistribution.map((s, i) => (
                        <Cell
                          key={`po-status-${s.name}-${i}`}
                          fill={pieColours[i % pieColours.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={MW_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {poStatusDistribution.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: pieColours[i % pieColours.length] }}
                      />
                      <span className="text-[var(--neutral-500)] w-20 truncate">{s.name}</span>
                      <span className="text-foreground font-medium tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </motion.div>
        </div>

        {/* Row 3 — Performance scatter + Bills ageing + Top suppliers table */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={staggerItem}>
            <ChartCard title="Supplier Performance — Spend vs On-Time">
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis
                    type="number"
                    dataKey="spend"
                    name="Spend"
                    tickFormatter={(v) => `$${v / 1000}k`}
                    tick={MW_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="onTime"
                    name="On-Time %"
                    domain={[60, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={MW_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ZAxis type="number" dataKey="rating" range={[80, 320]} />
                  <ReferenceLine y={90} stroke="var(--mw-yellow-400)" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'On-Time %') return `${value}%`;
                      if (name === 'Spend') return `$${value.toLocaleString()}`;
                      return `${value}/5`;
                    }}
                    labelFormatter={(_, payload) => {
                      const point = payload && payload[0]?.payload;
                      return point ? point.name : '';
                    }}
                  />
                  <Scatter
                    data={supplierPerformance}
                    fill="var(--chart-scale-mid)"
                    {...MW_RECHARTS_ANIMATION}
                  >
                    {supplierPerformance.map((p, i) => (
                      <Cell
                        key={`scatter-${i}`}
                        fill={getChartScaleColour(p.onTime)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <ChartCard title="Payables Ageing">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={billsAgeingBuckets}>
                  {mwChartPatternDefs()}
                  <CartesianGrid {...MW_CARTESIAN_GRID} />
                  <XAxis dataKey="bucket" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `$${v / 1000}k`}
                    tick={MW_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={MW_TOOLTIP_STYLE}
                    cursor={MW_BAR_TOOLTIP_CURSOR}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="amount"
                    radius={MW_BAR_RADIUS_V}
                    {...MW_RECHARTS_ANIMATION_BAR}
                  >
                    {billsAgeingBuckets.map((b) => (
                      <Cell
                        key={`age-${b.bucket}`}
                        fill={getChartScalePattern(
                          b.bucket === 'Current'
                            ? 20
                            : b.bucket === '1-30d'
                              ? 50
                              : b.bucket === '31-60d'
                                ? 80
                                : 100,
                        )}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <ChartCard title="Top Suppliers by Spend">
              <div className="space-y-3">
                {spendBySupplier.slice(0, 6).map((s, i) => {
                  const pct = (s.spend / Math.max(spendTotal, 1)) * 100;
                  return (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-medium text-[var(--neutral-500)] tabular-nums w-4">
                            {i + 1}
                          </span>
                          <span className="text-foreground font-medium truncate">{s.name}</span>
                        </div>
                        <span className="text-foreground tabular-nums font-medium">
                          {fmtCurrencyShort(s.spend)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--neutral-100)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: getChartScaleColour(pct * 2),
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-[var(--neutral-500)] tabular-nums">
                        {pct.toFixed(1)}% of spend
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}
