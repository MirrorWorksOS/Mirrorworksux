import { useState } from 'react';
import { Package, Wrench, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { MW_AXIS_TICK, MW_CARTESIAN_GRID, MW_CHART_COLOURS, MW_RECHARTS_ANIMATION, MW_TOOLTIP_STYLE } from '@/components/shared/charts/chart-theme';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { DarkAccentCard } from '@/components/shared/cards/DarkAccentCard';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { PillNav } from '@/components/shared/navigation/PillNav';

const trendData = [
  { month: 'Mar', raw: 120000, wip: 65000, finished: 45000 },
  { month: 'Apr', raw: 125000, wip: 70000, finished: 48000 },
  { month: 'May', raw: 130000, wip: 75000, finished: 50000 },
  { month: 'Jun', raw: 128000, wip: 72000, finished: 55000 },
  { month: 'Jul', raw: 132000, wip: 78000, finished: 52000 },
  { month: 'Aug', raw: 135000, wip: 80000, finished: 58000 },
  { month: 'Sep', raw: 138000, wip: 82000, finished: 60000 },
  { month: 'Oct', raw: 140000, wip: 85000, finished: 62000 },
  { month: 'Nov', raw: 142000, wip: 87000, finished: 64000 },
  { month: 'Dec', raw: 143000, wip: 88000, finished: 65000 },
  { month: 'Jan', raw: 144000, wip: 88500, finished: 66500 },
  { month: 'Feb', raw: 145600, wip: 89200, finished: 67800 },
];

const donutData = [
  { name: 'Raw Materials', value: 145600, color: MW_CHART_COLOURS[0] },
  { name: 'Work in Progress', value: 89200, color: MW_CHART_COLOURS[1] },
  { name: 'Finished Goods', value: 67800, color: MW_CHART_COLOURS[2] },
];

type AgeCategory = 'Fresh' | 'Active' | 'Slow' | 'Stale';

interface StockRow {
  item: string;
  sku: string;
  qty: number;
  unit: string;
  total: number;
  location: string;
  lastMove: string;
  age: AgeCategory;
}

const rawMaterials: StockRow[] = [
  { item: '10mm MS Plate', sku: 'MS-10-3678', qty: 120, unit: '$85.00', total: 10200, location: 'Bay A1', lastMove: '25 Feb', age: 'Fresh' as AgeCategory },
  { item: '5052 Aluminum Sheet', sku: 'AL-5052-12G', qty: 85, unit: '$92.00', total: 7820, location: 'Bay A3', lastMove: '22 Feb', age: 'Fresh' as AgeCategory },
  { item: 'RHS 50x25x2.5', sku: 'RHS-50252', qty: 200, unit: '$18.50', total: 3700, location: 'Rack B2', lastMove: '15 Feb', age: 'Active' as AgeCategory },
  { item: 'Welding Wire ER70S-6', sku: 'WW-ER70S6', qty: 50, unit: '$32.00', total: 1600, location: 'Store C1', lastMove: '20 Feb', age: 'Fresh' as AgeCategory },
  { item: '3mm SS 304 Sheet', sku: 'SS-304-3MM', qty: 30, unit: '$185.00', total: 5550, location: 'Bay A2', lastMove: '10 Jan', age: 'Slow' as AgeCategory },
  { item: 'Paint — Dulux RAL 7035', sku: 'PNT-RAL7035', qty: 15, unit: '$89.00', total: 1335, location: 'Paint Room', lastMove: '05 Nov', age: 'Stale' as AgeCategory },
  { item: 'SS Fasteners M10 A4', sku: 'FST-M10A4', qty: 500, unit: '$0.85', total: 425, location: 'Store C2', lastMove: '18 Feb', age: 'Active' as AgeCategory },
  { item: '6mm MS Plate', sku: 'MS-06-3678', qty: 45, unit: '$65.00', total: 2925, location: 'Bay A1', lastMove: '12 Feb', age: 'Active' as AgeCategory },
];

const workInProgress: StockRow[] = [
  { item: 'Switchroom enclosure frames', sku: 'JOB-2026-0012', qty: 4, unit: '$2,850.00', total: 11400, location: 'Bay 2 — Welding', lastMove: '24 Feb', age: 'Active' },
  { item: 'Conveyor guard panels', sku: 'JOB-2026-0010', qty: 12, unit: '$640.00', total: 7680, location: 'Bay 1 — Cutting', lastMove: '23 Feb', age: 'Fresh' },
  { item: 'Stair stringer assemblies', sku: 'JOB-2026-0013', qty: 2, unit: '$3,150.00', total: 6300, location: 'Bay 3 — Fab', lastMove: '21 Feb', age: 'Active' },
  { item: 'Pump skid base frame', sku: 'JOB-2026-0008', qty: 1, unit: '$5,200.00', total: 5200, location: 'Paint Room', lastMove: '12 Feb', age: 'Slow' },
];

const finishedGoods: StockRow[] = [
  { item: 'Cable ladder 600mm — galv', sku: 'FG-CL600-G', qty: 30, unit: '$185.00', total: 5550, location: 'FG Rack 1', lastMove: '25 Feb', age: 'Fresh' },
  { item: 'Access platform kit', sku: 'FG-APK-12', qty: 2, unit: '$4,400.00', total: 8800, location: 'Dispatch', lastMove: '18 Feb', age: 'Active' },
  { item: 'Handrail stanchions', sku: 'FG-HRS-90', qty: 48, unit: '$72.00', total: 3456, location: 'FG Rack 2', lastMove: '20 Feb', age: 'Active' },
  { item: 'Guard mesh panels 2.4m', sku: 'FG-GMP-24', qty: 16, unit: '$210.00', total: 3360, location: 'FG Rack 3', lastMove: '02 Dec', age: 'Stale' },
];

const adjustments: StockRow[] = [
  { item: 'Stocktake variance — MS plate', sku: 'ADJ-2026-014', qty: -3, unit: '$85.00', total: -255, location: 'Bay A1', lastMove: '28 Feb', age: 'Fresh' },
  { item: 'Damaged stock write-off — SS sheet', sku: 'ADJ-2026-013', qty: -2, unit: '$185.00', total: -370, location: 'Bay A2', lastMove: '21 Feb', age: 'Active' },
  { item: 'Found stock — welding wire', sku: 'ADJ-2026-012', qty: 4, unit: '$32.00', total: 128, location: 'Store C1', lastMove: '14 Feb', age: 'Active' },
];

const stockColumns: FinancialColumn<StockRow>[] = [
  { key: 'item', header: 'ITEM', accessor: (r) => r.item, format: 'text', align: 'left' },
  { key: 'sku', header: 'SKU', accessor: (r) => r.sku, format: 'text', align: 'left' },
  { key: 'qty', header: 'QTY', accessor: (r) => r.qty, format: 'number' },
  { key: 'unit', header: 'UNIT COST', accessor: (r) => r.unit, format: 'text', align: 'right' },
  { key: 'total', header: 'TOTAL VALUE', accessor: (r) => r.total, format: 'currency' },
  { key: 'location', header: 'LOCATION', accessor: (r) => r.location, format: 'text', align: 'left' },
  { key: 'lastMove', header: 'LAST MOVEMENT', accessor: (r) => r.lastMove, format: 'text', align: 'left' },
  { key: 'age', header: 'AGE', accessor: (r) => r.age, format: 'text', align: 'left' },
];

const TABS = ['Raw Materials', 'Work in Progress', 'Finished Goods', 'Adjustments'] as const;

const STOCK_BY_TAB: Record<(typeof TABS)[number], StockRow[]> = {
  'Raw Materials': rawMaterials,
  'Work in Progress': workInProgress,
  'Finished Goods': finishedGoods,
  Adjustments: adjustments,
};

export function StockValuation() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Raw Materials');

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Stock valuation"
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="fifo">
              <SelectTrigger className="h-10 w-48 border-[var(--border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">FIFO</SelectItem>
                <SelectItem value="lifo">LIFO</SelectItem>
                <SelectItem value="wavg">Weighted Average (AVCO)</SelectItem>
                <SelectItem value="actual">Actual Cost</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="h-10 rounded-full bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={() => toast('Generating stock valuation report…')}
            >
              Generate report
            </Button>
          </div>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="RAW MATERIALS"
          value="$145,600"
          icon={Package}
          iconSurface="key"
          hint="342 items"
        />
        <KpiStatCard
          label="WORK IN PROGRESS"
          value="$89,200"
          icon={Wrench}
          iconSurface="key"
          hint="12 jobs"
        />
        <KpiStatCard
          label="FINISHED GOODS"
          value="$67,800"
          icon={CheckCircle}
          iconSurface="key"
          hint="45 items"
        />
        <DarkAccentCard
          label="TOTAL INVENTORY VALUE"
          value="$302,600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Valuation Trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="month" tick={MW_AXIS_TICK} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={MW_AXIS_TICK} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={MW_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="finished" stackId="1" stroke={MW_CHART_COLOURS[0]} fill={MW_CHART_COLOURS[0]} fillOpacity={0.2} {...MW_RECHARTS_ANIMATION} />
              <Area type="monotone" dataKey="wip" stackId="1" stroke={MW_CHART_COLOURS[1]} fill={MW_CHART_COLOURS[1]} fillOpacity={0.2} {...MW_RECHARTS_ANIMATION} />
              <Area type="monotone" dataKey="raw" stackId="1" stroke={MW_CHART_COLOURS[2]} fill={MW_CHART_COLOURS[2]} fillOpacity={0.2} {...MW_RECHARTS_ANIMATION} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Current Split">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" {...MW_RECHARTS_ANIMATION}>
                  {donutData.map((e, i) => <Cell key={`stock-${e.name}-${i}`} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={MW_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-2">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[var(--neutral-600)]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Tabs + Table */}
      <Card className="bg-card rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="px-4 pt-4">
          <PillNav
            tabs={TABS.map(t => ({ key: t, label: t, count: STOCK_BY_TAB[t].length }))}
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as (typeof TABS)[number])}
            listClassName="w-fit"
            aria-label="Stock category"
          />
        </div>

        <FinancialTable
          columns={stockColumns}
          data={STOCK_BY_TAB[activeTab]}
          keyExtractor={(r) => r.sku}
        />
      </Card>
    </PageShell>
  );
}
