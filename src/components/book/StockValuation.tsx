import React, { useState } from 'react';
import { Package, Wrench, CheckCircle, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MW_AXIS_TICK, MW_CARTESIAN_GRID, MW_CHART_COLOURS } from '@/components/shared/charts/chart-theme';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

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
const ageStyles: Record<AgeCategory, string> = {
  Fresh: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Active: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Slow: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  Stale: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
};

const rawMaterials = [
  { item: '10mm MS Plate', sku: 'MS-10-3678', qty: 120, unit: '$85.00', total: 10200, location: 'Bay A1', lastMove: '25 Feb', age: 'Fresh' as AgeCategory },
  { item: '5052 Aluminum Sheet', sku: 'AL-5052-12G', qty: 85, unit: '$92.00', total: 7820, location: 'Bay A3', lastMove: '22 Feb', age: 'Fresh' as AgeCategory },
  { item: 'RHS 50x25x2.5', sku: 'RHS-50252', qty: 200, unit: '$18.50', total: 3700, location: 'Rack B2', lastMove: '15 Feb', age: 'Active' as AgeCategory },
  { item: 'Welding Wire ER70S-6', sku: 'WW-ER70S6', qty: 50, unit: '$32.00', total: 1600, location: 'Store C1', lastMove: '20 Feb', age: 'Fresh' as AgeCategory },
  { item: '3mm SS 304 Sheet', sku: 'SS-304-3MM', qty: 30, unit: '$185.00', total: 5550, location: 'Bay A2', lastMove: '10 Jan', age: 'Slow' as AgeCategory },
  { item: 'Paint — Dulux RAL 7035', sku: 'PNT-RAL7035', qty: 15, unit: '$89.00', total: 1335, location: 'Paint Room', lastMove: '05 Nov', age: 'Stale' as AgeCategory },
  { item: 'SS Fasteners M10 A4', sku: 'FST-M10A4', qty: 500, unit: '$0.85', total: 425, location: 'Store C2', lastMove: '18 Feb', age: 'Active' as AgeCategory },
  { item: '6mm MS Plate', sku: 'MS-06-3678', qty: 45, unit: '$65.00', total: 2925, location: 'Bay A1', lastMove: '12 Feb', age: 'Active' as AgeCategory },
];

const TABS = ['Raw Materials', 'Work in Progress', 'Finished Goods', 'Adjustments'];

export function StockValuation() {
  const [activeTab, setActiveTab] = useState('Raw Materials');

  return (
    <PageShell className="mx-auto max-w-[1200px] overflow-y-auto">
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
                <SelectItem value="wavg">Weighted average</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]">
              <Calendar className="h-4 w-4" /> As at
            </Button>
            <Button className="h-10 rounded-[var(--shape-lg)] bg-[var(--mw-yellow-400)] px-5 text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]">
              Generate report
            </Button>
          </div>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-2"><Package className="w-6 h-6 text-[var(--mw-yellow-400)]" /><span className="text-xs tracking-wider text-[var(--neutral-500)] font-medium">RAW MATERIALS</span></div>
          <div className="text-2xl tracking-tight text-[var(--mw-mirage)] tabular-nums font-medium">$145,600</div>
          <p className="text-xs text-[var(--neutral-500)] mt-1">342 items</p>
        </Card>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-2"><Wrench className="w-6 h-6 text-[var(--mw-yellow-400)]" /><span className="text-xs tracking-wider text-[var(--neutral-500)] font-medium">WORK IN PROGRESS</span></div>
          <div className="text-2xl tracking-tight text-[var(--mw-mirage)] tabular-nums font-medium">$89,200</div>
          <p className="text-xs text-[var(--neutral-500)] mt-1">12 jobs</p>
        </Card>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-6 h-6 text-[var(--mw-yellow-400)]" /><span className="text-xs tracking-wider text-[var(--neutral-500)] font-medium">FINISHED GOODS</span></div>
          <div className="text-2xl tracking-tight text-[var(--mw-mirage)] tabular-nums font-medium">$67,800</div>
          <p className="text-xs text-[var(--neutral-500)] mt-1">45 items</p>
        </Card>
        <Card className="bg-[var(--mw-mirage)] rounded-[var(--shape-lg)] shadow-xs border border-[var(--mw-mirage)] p-6">
          <div className="text-xs tracking-wider text-white/70 mb-2 font-medium">TOTAL INVENTORY VALUE</div>
          <div className="text-2xl tracking-tight text-white tabular-nums font-medium">$302,600</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <h3 className="text-[var(--mw-mirage)] mb-4 font-medium">Valuation Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="month" tick={MW_AXIS_TICK} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={MW_AXIS_TICK} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="finished" stackId="1" stroke={MW_CHART_COLOURS[0]} fill={MW_CHART_COLOURS[0]} fillOpacity={0.2} />
              <Area type="monotone" dataKey="wip" stackId="1" stroke={MW_CHART_COLOURS[1]} fill={MW_CHART_COLOURS[1]} fillOpacity={0.2} />
              <Area type="monotone" dataKey="raw" stackId="1" stroke={MW_CHART_COLOURS[2]} fill={MW_CHART_COLOURS[2]} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <h3 className="text-[var(--mw-mirage)] mb-4 font-medium">Current Split</h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {donutData.map((e, i) => <Cell key={`stock-${e.name}-${i}`} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
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
        </Card>
      </div>

      {/* Tabs + Table */}
      <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm relative transition-colors",
                activeTab === tab ? "text-[var(--mw-mirage)] font-medium" : "text-[var(--neutral-500)] hover:text-[var(--mw-mirage)] font-normal"
              )}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--mw-yellow-400)] rounded-t" />}
            </button>
          ))}
        </div>

        {activeTab === 'Raw Materials' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  {['ITEM', 'SKU', 'QTY', 'UNIT COST', 'TOTAL VALUE', 'LOCATION', 'LAST MOVEMENT', 'AGE'].map(h => (
                    <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium", ['QTY', 'UNIT COST', 'TOTAL VALUE'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawMaterials.map((r, i) => (
                  <tr key={r.sku} className={cn("border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)]", i % 2 === 1 && "bg-[var(--neutral-100)]")}>
                    <td className="px-4 text-sm text-[var(--mw-mirage)]">{r.item}</td>
                    <td className="px-4 text-xs text-[var(--neutral-500)] tabular-nums">{r.sku}</td>
                    <td className="px-4 text-sm text-right tabular-nums">{r.qty}</td>
                    <td className="px-4 text-sm text-right tabular-nums">{r.unit}</td>
                    <td className="px-4 text-sm text-right tabular-nums font-medium">${r.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 text-sm text-[var(--neutral-600)]">{r.location}</td>
                    <td className="px-4 text-sm text-[var(--neutral-600)]">{r.lastMove}</td>
                    <td className="px-4"><Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", ageStyles[r.age])}>{r.age}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab !== 'Raw Materials' && (
          <div className="p-8 text-center text-sm text-[var(--neutral-400)]">No {activeTab.toLowerCase()} data to display.</div>
        )}
      </Card>
    </PageShell>
  );
}