import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
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
  getChartScaleColour,
  marginToScalePercent,
} from '@/components/shared/charts/chart-theme';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

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

const getBarColor = (m: number) => getChartScaleColour(marginToScalePercent(m));
const marginBadgeClass = 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]';
const statusBadge = (s: string) => s === 'Complete' ? 'text-[var(--mw-mirage)]' : s === 'In Production' ? 'text-[var(--mw-mirage)]' : 'text-[var(--mw-mirage)]';

export function JobProfitability({ onSelectJob }: { onSelectJob?: (id: string) => void }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <PageShell className="mx-auto max-w-[1200px] overflow-y-auto">
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
        {[
          { label: 'Total Revenue', value: '$456,780', sub: '34 completed jobs' },
          { label: 'Total Costs', value: '$312,450', sub: 'materials, labour, overhead' },
          { label: 'Average Margin', value: '31.6%', color: 'var(--mw-mirage)', badge: '+2.3% vs last month', badgeStyle: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]' },
          { label: 'Loss-Making Jobs', value: '3', color: 'var(--mw-mirage)', sub: '$4,200 total loss', subColor: 'var(--neutral-600)' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
            <div className="text-xs tracking-wider text-[var(--neutral-500)] mb-2 font-medium">{kpi.label}</div>
            <div className="text-2xl tracking-tight tabular-nums font-medium" style={{ color: kpi.color || 'var(--mw-mirage)' }}>{kpi.value}</div>
            {kpi.badge && <Badge className={cn("rounded-full text-xs mt-2 border-0", kpi.badgeStyle)}>{kpi.badge}</Badge>}
            {kpi.sub && <p className="text-xs mt-1" style={{ color: kpi.subColor || 'var(--neutral-500)' }}>{kpi.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <h3 className="text-[var(--mw-mirage)] mb-4 font-medium">Top 10 Jobs by Profit Margin</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={marginData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid {...MW_CARTESIAN_GRID} horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <YAxis dataKey="job" type="category" tick={MW_AXIS_TICK} width={80} />
              <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20} {...MW_RECHARTS_ANIMATION_BAR}>
                {marginData.map((e, i) => <Cell key={`margin-${e.job}-${i}`} fill={getBarColor(e.margin)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <h3 className="text-[var(--mw-mirage)] mb-4 font-medium">Customer Profitability</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ left: 10 }}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="x" name="Revenue" tickFormatter={v => `$${v / 1000}k`} tick={MW_AXIS_TICK} />
              <YAxis dataKey="y" name="Margin" tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} />
              <ZAxis dataKey="z" range={[100, 600]} />
              <Tooltip formatter={(v: number, name: string) => name === 'Revenue' ? `$${v.toLocaleString()}` : `${v}%`} />
              <Scatter data={scatterData} fill="var(--mw-yellow-400)" stroke="var(--mw-mirage)" strokeWidth={1} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                <th className="w-10 px-4 py-3"><Checkbox className="w-[18px] h-[18px]" /></th>
                {['JOB #', 'CUSTOMER', 'PRODUCT', 'QUOTED', 'ACTUAL COST', 'MARGIN %', 'MARGIN $', 'STATUS', ''].map(h => (
                  <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium", ['QUOTED', 'ACTUAL COST', 'MARGIN %', 'MARGIN $'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {JOBS.map((job, i) => (
                <React.Fragment key={job.id}>
                  <tr className={cn("border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors", expandedRow === job.id && "border-l-4 border-l-[var(--mw-yellow-400)]", i % 2 === 1 && "bg-[var(--neutral-100)]")}
                    onClick={() => onSelectJob ? onSelectJob(job.id) : setExpandedRow(expandedRow === job.id ? null : job.id)}>
                    <td className="px-4" onClick={e => e.stopPropagation()}><Checkbox className="w-[18px] h-[18px]" /></td>
                    <td className="px-4 text-xs text-[var(--mw-mirage)] tabular-nums">{job.id}</td>
                    <td className="px-4 text-sm text-[var(--mw-mirage)]">{job.customer}</td>
                    <td className="px-4 text-sm text-[var(--neutral-600)]">{job.product}</td>
                    <td className="px-4 text-right text-sm tabular-nums font-medium">${job.quoted.toLocaleString()}</td>
                    <td className="px-4 text-right text-sm tabular-nums font-medium">${job.actual.toLocaleString()}</td>
                    <td className="px-4 text-right">
                      <Badge className={cn('rounded-full border-0 px-2 py-0.5 text-xs', marginBadgeClass)}>{job.margin}%</Badge>
                    </td>
                    <td className="px-4 text-right text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                      {job.marginDollar < 0 ? '-' : ''}${Math.abs(job.marginDollar).toLocaleString()}
                    </td>
                    <td className={cn("px-4 text-sm font-medium", statusBadge(job.status))}>{job.status}</td>
                    <td className="px-4">{expandedRow === job.id ? <ChevronUp className="w-4 h-4 text-[var(--neutral-500)]" /> : <ChevronDown className="w-4 h-4 text-[var(--neutral-500)]" />}</td>
                  </tr>
                  {expandedRow === job.id && job.breakdown && (
                    <tr><td colSpan={10} className="bg-[var(--neutral-100)] px-8 py-4">
                      <table className="w-full">
                        <thead><tr className="text-xs text-[var(--neutral-500)] font-medium">
                          <th className="text-left py-1">Type</th><th className="text-right py-1">Quoted</th><th className="text-right py-1">Actual</th><th className="text-right py-1">Variance</th>
                        </tr></thead>
                        <tbody>{job.breakdown.map(b => (
                          <tr key={b.type} className="border-t border-[var(--border)]">
                            <td className="py-2 text-sm">{b.type}</td>
<td className="py-2 text-sm text-right tabular-nums">${b.quoted.toLocaleString()}</td>
                          <td className="py-2 text-sm text-right tabular-nums">${b.actual.toLocaleString()}</td>
                          <td className="flex items-center justify-end gap-1 py-2 text-right text-sm tabular-nums text-[var(--neutral-900)]">
                              {b.variance < 0 ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                              {b.variance < 0 ? '-' : '+'}${Math.abs(b.variance).toLocaleString()}
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}