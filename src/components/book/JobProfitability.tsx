import { Calendar, ChevronDown, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_RECHARTS_ANIMATION_BAR,
  MW_RECHARTS_ANIMATION,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_H,
  getChartScalePattern,
  marginToScalePercent,
} from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';

const marginData = [
  { job: 'JOB-0012', margin: 23.1 },
  { job: 'JOB-0010', margin: 15.1 },
  { job: 'JOB-0008', margin: 18.4 },
  { job: 'JOB-0007', margin: 21.2 },
  { job: 'JOB-0006', margin: 12.8 },
  { job: 'JOB-0003', margin: 16.5 },
  { job: 'JOB-0011', margin: 6.5 },
  { job: 'JOB-0005', margin: 3.2 },
  { job: 'JOB-0004', margin: 8.9 },
  { job: 'JOB-0009', margin: -7.8 },
];

const scatterData = [
  { x: 18500, y: 23.1, z: 5, name: 'Con-form' },
  { x: 45000, y: 15.1, z: 8, name: 'Pacific Fab' },
  { x: 12400, y: 6.5, z: 3, name: 'Acme Steel' },
  { x: 3200, y: -7.8, z: 2, name: 'Hunter Steel' },
  { x: 28000, y: 19.2, z: 6, name: 'BHP' },
  { x: 9800, y: 11.4, z: 4, name: 'Sydney Rail' },
];

interface JobRow {
  id: string; customer: string; product: string; quoted: number; actual: number; margin: number; marginDollar: number; status: string;
  breakdown?: { type: string; quoted: number; actual: number; variance: number }[];
}

const JOBS: JobRow[] = [
  { id: 'JOB-2026-0012', customer: 'Con-form Group', product: 'Custom Handrail', quoted: 18500, actual: 14230, margin: 23.1, marginDollar: 4270, status: 'Complete',
    breakdown: [
      { type: 'Materials', quoted: 8200, actual: 7450, variance: -750 },
      { type: 'Labour', quoted: 6100, actual: 4890, variance: -1210 },
      { type: 'Overhead', quoted: 2500, actual: 1490, variance: -1010 },
      { type: 'Subcontract', quoted: 1200, actual: 400, variance: -800 },
    ]
  },
  { id: 'JOB-2026-0011', customer: 'Acme Steel', product: 'Structural Beam', quoted: 12400, actual: 11600, margin: 6.5, marginDollar: 800, status: 'Complete' },
  { id: 'JOB-2026-0010', customer: 'Pacific Fab', product: 'Tank Assembly', quoted: 45000, actual: 38200, margin: 15.1, marginDollar: 6800, status: 'Complete' },
  { id: 'JOB-2026-0009', customer: 'Hunter Steel', product: 'Bracket Set', quoted: 3200, actual: 3450, margin: -7.8, marginDollar: -250, status: 'Complete' },
  { id: 'JOB-2026-0008', customer: 'BHP Contractors', product: 'Support Frame', quoted: 28000, actual: 22848, margin: 18.4, marginDollar: 5152, status: 'Complete' },
  { id: 'JOB-2026-0007', customer: 'Sydney Rail Corp', product: 'Platform Rail', quoted: 15600, actual: 12293, margin: 21.2, marginDollar: 3307, status: 'In Production' },
  { id: 'JOB-2026-0006', customer: 'Kemppi', product: 'Welding Jig', quoted: 9800, actual: 8546, margin: 12.8, marginDollar: 1254, status: 'Complete' },
  { id: 'JOB-2026-0005', customer: 'Oberon Eng', product: 'Mounting Plate', quoted: 4100, actual: 3969, margin: 3.2, marginDollar: 131, status: 'On Hold' },
];

const getBarPattern = (m: number) => getChartScalePattern(marginToScalePercent(m));

const jobTableColumns: FinancialColumn<JobRow>[] = [
  { key: 'id', header: 'JOB #', accessor: (r) => r.id, format: 'text', align: 'left' },
  { key: 'customer', header: 'CUSTOMER', accessor: (r) => r.customer, format: 'text', align: 'left' },
  { key: 'product', header: 'PRODUCT', accessor: (r) => r.product, format: 'text', align: 'left' },
  { key: 'quoted', header: 'QUOTED', accessor: (r) => r.quoted, format: 'currency' },
  { key: 'actual', header: 'ACTUAL COST', accessor: (r) => r.actual, format: 'currency' },
  { key: 'margin', header: 'MARGIN %', accessor: (r) => r.margin, format: 'percentage' },
  { key: 'marginDollar', header: 'MARGIN $', accessor: (r) => r.marginDollar, format: 'currency' },
  { key: 'status', header: 'STATUS', accessor: (r) => r.status, format: 'text', align: 'left' },
];

export function JobProfitability({ onSelectJob }: { onSelectJob?: (id: string) => void }) {

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Job profitability"
        subtitle="Actual costs vs quoted amounts across all jobs"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]">
              <Calendar className="h-4 w-4" /> Date range
            </Button>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]">
              Export <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-[var(--border)]">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Total Revenue"
          value="$456,780"
          hint="34 completed jobs"
        />
        <KpiStatCard
          label="Total Costs"
          value="$312,450"
          hint="materials, labour, overhead"
        />
        <KpiStatCard
          label="Average Margin"
          value="31.6%"
          footer={
            <Badge className={cn("rounded-full text-xs mt-2 border-0", "bg-[var(--neutral-100)] text-foreground")}>+2.3% vs last month</Badge>
          }
        />
        <KpiStatCard
          label="Loss-Making Jobs"
          value="3"
          hint="$4,200 total loss"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top 10 Jobs by Profit Margin">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={marginData} layout="vertical" margin={{ left: 20 }}>
              {mwChartPatternDefs()}
              <CartesianGrid {...MW_CARTESIAN_GRID} horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <YAxis dataKey="job" type="category" tick={MW_AXIS_TICK} width={80} />
              <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `${v}%`} contentStyle={MW_TOOLTIP_STYLE} />
              <Bar dataKey="margin" radius={MW_BAR_RADIUS_H} barSize={20} {...MW_RECHARTS_ANIMATION_BAR}>
                {marginData.map((e, i) => <Cell key={`margin-${e.job}-${i}`} fill={getBarPattern(e.margin)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Customer Profitability">
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ left: 10 }}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="x" name="Revenue" tickFormatter={v => `$${v / 1000}k`} tick={MW_AXIS_TICK} />
              <YAxis dataKey="y" name="Margin" tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <ZAxis dataKey="z" range={[100, 600]} />
              <Tooltip formatter={(v: number, name: string) => name === 'Revenue' ? `$${v.toLocaleString()}` : `${v}%`} contentStyle={MW_TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="var(--mw-yellow-400)" stroke="var(--mw-mirage)" strokeWidth={1} {...MW_RECHARTS_ANIMATION} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Data Table */}
      <FinancialTable
        columns={jobTableColumns}
        data={JOBS}
        keyExtractor={(r) => r.id}
      />
    </PageShell>
  );
}
