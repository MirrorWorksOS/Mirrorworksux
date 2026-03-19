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

const getBarColor = (m: number) => m > 15 ? '#36B37E' : m > 5 ? '#FACC15' : '#DE350B';
const getMarginBadge = (m: number) => m > 15 ? 'bg-[#E6F7EF] text-[#1B7D4F]' : m > 5 ? 'bg-[#FFF4CC] text-[#805900]' : 'bg-[#FFE5E5] text-[#DE350B]';
const statusBadge = (s: string) => s === 'Complete' ? 'text-[#36B37E]' : s === 'In Production' ? 'text-[#0052CC]' : 'text-[#FACC15]';

export function JobProfitability({ onSelectJob }: { onSelectJob?: (id: string) => void }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Job Profitability</h1>
          <p className="text-sm text-[#737373]">Actual costs vs quoted amounts across all jobs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5]"><Calendar className="w-4 h-4" /> Date Range</Button>
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5]">Export <ChevronDown className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="h-10 w-10 border-[#E5E5E5]"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$456,780', sub: '34 completed jobs' },
          { label: 'Total Costs', value: '$312,450', sub: 'materials, labour, overhead' },
          { label: 'Average Margin', value: '31.6%', color: '#36B37E', badge: '+2.3% vs last month', badgeStyle: 'bg-[#E6F7EF] text-[#36B37E]' },
          { label: 'Loss-Making Jobs', value: '3', color: '#DE350B', sub: '$4,200 total loss', subColor: '#DE350B' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
            <div className="text-xs tracking-wider text-[#737373] mb-2" style={{ fontWeight: 500 }}>{kpi.label}</div>
            <div className="text-[28px] tracking-tight" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500, color: kpi.color || '#1A2732' }}>{kpi.value}</div>
            {kpi.badge && <Badge className={cn("rounded-full text-[11px] mt-2 border-0", kpi.badgeStyle)}>{kpi.badge}</Badge>}
            {kpi.sub && <p className="text-xs mt-1" style={{ color: kpi.subColor || '#737373' }}>{kpi.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
          <h3 className="text-[#1A2732] mb-4" style={{ fontWeight: 500 }}>Top 10 Jobs by Profit Margin</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={marginData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis dataKey="job" type="category" tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} width={80} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20}>
                {marginData.map((e, i) => <Cell key={`margin-${e.job}-${i}`} fill={getBarColor(e.margin)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
          <h3 className="text-[#1A2732] mb-4" style={{ fontWeight: 500 }}>Customer Profitability</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="x" name="Revenue" tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis dataKey="y" name="Margin" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <ZAxis dataKey="z" range={[100, 600]} />
              <Tooltip formatter={(v: number, name: string) => name === 'Revenue' ? `$${v.toLocaleString()}` : `${v}%`} />
              <Scatter data={scatterData} fill="#FFCF4B" stroke="#1A2732" strokeWidth={1} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                <th className="w-10 px-4 py-3"><Checkbox className="w-[18px] h-[18px]" /></th>
                {['JOB #', 'CUSTOMER', 'PRODUCT', 'QUOTED', 'ACTUAL COST', 'MARGIN %', 'MARGIN $', 'STATUS', ''].map(h => (
                  <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[#737373]", ['QUOTED', 'ACTUAL COST', 'MARGIN %', 'MARGIN $'].includes(h) ? 'text-right' : 'text-left')} style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {JOBS.map((job, i) => (
                <React.Fragment key={job.id}>
                  <tr className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors", expandedRow === job.id && "border-l-4 border-l-[#FFCF4B]", i % 2 === 1 && "bg-[#FAFAFA]")}
                    onClick={() => onSelectJob ? onSelectJob(job.id) : setExpandedRow(expandedRow === job.id ? null : job.id)}>
                    <td className="px-4" onClick={e => e.stopPropagation()}><Checkbox className="w-[18px] h-[18px]" /></td>
                    <td className="px-4 text-[13px] text-[#0052CC]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{job.id}</td>
                    <td className="px-4 text-sm text-[#1A2732]">{job.customer}</td>
                    <td className="px-4 text-sm text-[#525252]">{job.product}</td>
                    <td className="px-4 text-right text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>${job.quoted.toLocaleString()}</td>
                    <td className="px-4 text-right text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>${job.actual.toLocaleString()}</td>
                    <td className="px-4 text-right">
                      <Badge className={cn("rounded-full text-[11px] px-2 py-0.5 border-0", getMarginBadge(job.margin))}>{job.margin}%</Badge>
                    </td>
                    <td className="px-4 text-right text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500, color: job.marginDollar < 0 ? '#DE350B' : '#1A2732' }}>
                      {job.marginDollar < 0 ? '-' : ''}${Math.abs(job.marginDollar).toLocaleString()}
                    </td>
                    <td className={cn("px-4 text-sm", statusBadge(job.status))} style={{ fontWeight: 500 }}>{job.status}</td>
                    <td className="px-4">{expandedRow === job.id ? <ChevronUp className="w-4 h-4 text-[#737373]" /> : <ChevronDown className="w-4 h-4 text-[#737373]" />}</td>
                  </tr>
                  {expandedRow === job.id && job.breakdown && (
                    <tr><td colSpan={10} className="bg-[#FAFAFA] px-8 py-4">
                      <table className="w-full">
                        <thead><tr className="text-xs text-[#737373]" style={{ fontWeight: 500 }}>
                          <th className="text-left py-1">Type</th><th className="text-right py-1">Quoted</th><th className="text-right py-1">Actual</th><th className="text-right py-1">Variance</th>
                        </tr></thead>
                        <tbody>{job.breakdown.map(b => (
                          <tr key={b.type} className="border-t border-[#E5E5E5]">
                            <td className="py-2 text-sm">{b.type}</td>
                            <td className="py-2 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>${b.quoted.toLocaleString()}</td>
                            <td className="py-2 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>${b.actual.toLocaleString()}</td>
                            <td className="py-2 text-sm text-right flex items-center justify-end gap-1" style={{ fontFamily: 'Roboto Mono, monospace', color: b.variance < 0 ? '#36B37E' : '#DE350B' }}>
                              {b.variance < 0 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
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
    </div>
  );
}