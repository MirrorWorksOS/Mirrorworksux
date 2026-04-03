import React, { useState } from 'react';
import { ArrowLeft, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AIInsightCard } from '../shared/ai/AIInsightCard';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { MW_CHART_COLOURS, MW_RECHARTS_ANIMATION, MW_TOOLTIP_STYLE } from '@/components/shared/charts/chart-theme';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

const costBreakdown = [
  { type: 'Materials', budgeted: 8200, actual: 7450, variance: -750, pct: 52, color: MW_CHART_COLOURS[0] },
  { type: 'Labour', budgeted: 6100, actual: 4890, variance: -1210, pct: 34, color: MW_CHART_COLOURS[1] },
  { type: 'Overhead', budgeted: 2500, actual: 1490, variance: -1010, pct: 10, color: MW_CHART_COLOURS[2] },
  { type: 'Subcontract', budgeted: 1200, actual: 400, variance: -800, pct: 3, color: MW_CHART_COLOURS[3] },
  { type: 'Other', budgeted: 500, actual: 0, variance: -500, pct: 0, color: MW_CHART_COLOURS[4] },
];

const donutData = costBreakdown.filter(c => c.actual > 0).map(c => ({ name: c.type, value: c.actual, color: c.color }));

const costOverTime = [
  { week: 'Wk 1', budget: 3700, actual: 2800 },
  { week: 'Wk 2', budget: 7400, actual: 6200 },
  { week: 'Wk 3', budget: 11100, actual: 9100 },
  { week: 'Wk 4', budget: 14800, actual: 11500 },
  { week: 'Wk 5', budget: 18500, actual: 14230 },
];

const materialsData = [
  { date: '15 Feb', item: '10mm MS Plate AS3678-250', qty: '50', unitCost: '$85.00', total: '$4,250.00', po: 'PO-2026-023', source: 'Blackwoods' },
  { date: '17 Feb', item: 'Welding Wire ER70S-6 1.2mm', qty: '10kg', unitCost: '$32.00', total: '$320.00', po: 'PO-2026-025', source: 'BOC Gas' },
  { date: '19 Feb', item: 'Primer — zinc phosphate', qty: '5L', unitCost: '$45.00', total: '$225.00', po: 'PO-2026-027', source: 'Dulux' },
  { date: '21 Feb', item: 'SS Fasteners M10x30 A4', qty: '200', unitCost: '$0.85', total: '$170.00', po: 'PO-2026-029', source: 'Bolt & Nut' },
];

const labourData = [
  { date: '15 Feb', operator: 'David M.', operation: 'Setup & Programming', hours: '4.0', rate: '$95.00', total: '$380.00', status: 'Auto-captured' },
  { date: '16 Feb', operator: 'David M.', operation: 'Cutting', hours: '8.0', rate: '$95.00', total: '$760.00', status: 'Auto-captured' },
  { date: '17 Feb', operator: 'Elena R.', operation: 'Welding', hours: '8.0', rate: '$105.00', total: '$840.00', status: 'Auto-captured' },
  { date: '18 Feb', operator: 'Elena R.', operation: 'Assembly', hours: '6.0', rate: '$105.00', total: '$630.00', status: 'Auto-captured' },
];

type CostBreakdownRow = typeof costBreakdown[number];

const costBreakdownColumns: FinancialColumn<CostBreakdownRow>[] = [
  { key: 'type', header: 'Cost Type', accessor: (r) => r.type, format: 'text', align: 'left' },
  { key: 'budgeted', header: 'Budgeted', accessor: (r) => r.budgeted, format: 'currency' },
  { key: 'actual', header: 'Actual', accessor: (r) => r.actual, format: 'currency' },
  {
    key: 'variance',
    header: 'Variance',
    accessor: (r) => r.variance,
    format: 'currency',
  },
  {
    key: 'pct',
    header: '% of Total',
    accessor: (r) => r.pct,
    format: 'percentage',
  },
];

type MaterialRow = typeof materialsData[number];

const materialColumns: FinancialColumn<MaterialRow>[] = [
  { key: 'date', header: 'Date', accessor: (r) => r.date, format: 'text', align: 'left' },
  { key: 'item', header: 'Item', accessor: (r) => r.item, format: 'text', align: 'left' },
  { key: 'qty', header: 'Qty', accessor: (r) => r.qty, format: 'text', align: 'right' },
  { key: 'unitCost', header: 'Unit Cost', accessor: (r) => r.unitCost, format: 'text', align: 'right' },
  { key: 'total', header: 'Total', accessor: (r) => r.total, format: 'text', align: 'right' },
  { key: 'po', header: 'PO Ref', accessor: (r) => r.po, format: 'text', align: 'left' },
  { key: 'source', header: 'Source', accessor: (r) => r.source, format: 'text', align: 'left' },
];

type LabourRow = typeof labourData[number];

const labourColumns: FinancialColumn<LabourRow>[] = [
  { key: 'date', header: 'Date', accessor: (r) => r.date, format: 'text', align: 'left' },
  { key: 'operator', header: 'Operator', accessor: (r) => r.operator, format: 'text', align: 'left' },
  { key: 'operation', header: 'Operation', accessor: (r) => r.operation, format: 'text', align: 'left' },
  { key: 'hours', header: 'Hours', accessor: (r) => r.hours, format: 'text', align: 'right' },
  { key: 'rate', header: 'Rate', accessor: (r) => r.rate, format: 'text', align: 'right' },
  { key: 'total', header: 'Total', accessor: (r) => r.total, format: 'text', align: 'right' },
  {
    key: 'status',
    header: 'Status',
    accessor: (r) => r.status,
    format: 'text',
    align: 'left',
  },
];

export function JobCostDetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('Materials');
  const detailTabs = ['Materials', 'Labour', 'Overhead', 'Subcontract'];

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="JOB-2026-0012"
        subtitle={
          <>
            <span>Con-form Group</span>
            <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white">Custom Handrail Assembly</span>
            <span>Level 4</span>
          </>
        }
        breadcrumbs={[
          { label: 'Book', href: '/book' },
          { label: 'Job Costs', href: '/book/job-costs' },
          { label: 'JOB-2026-0012' },
        ]}
        actions={
          <Badge className="rounded-full text-xs px-2 py-0.5 border-0 bg-[var(--neutral-100)] text-foreground">In Production</Badge>
        }
      />

      {/* Hero Metrics */}
      <Card className="bg-card rounded-xl border border-[var(--border)] p-8">
        <div className="grid grid-cols-3 items-center">
          <div className="text-center">
            <div className="text-sm text-[var(--neutral-500)] mb-2 font-medium">Quoted</div>
            <div className="text-4xl tracking-tight text-foreground tabular-nums">$18,500</div>
          </div>
          <div className="text-center">
            <div className="relative w-[120px] h-[120px] mx-auto mb-2">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--chart-scale-high)" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 52 * 0.231} ${2 * Math.PI * 52}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl tabular-nums font-medium">23.1%</span>
              </div>
            </div>
            <div className="text-xs text-[var(--neutral-500)] font-medium">Profit Margin</div>
            <div className="text-sm text-foreground mt-1">Under budget by $4,270</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-[var(--neutral-500)] mb-2 font-medium">Actual to Date</div>
            <div className="text-4xl tracking-tight text-foreground tabular-nums">$14,230</div>
          </div>
        </div>
      </Card>

      {/* Cost Breakdown Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-foreground font-medium">Cost Breakdown</h3>
          <Sparkles className="w-4 h-4 text-[var(--neutral-500)]" />
        </div>
        <FinancialTable
          columns={costBreakdownColumns}
          data={costBreakdown}
          keyExtractor={(r) => r.type}
          totals={{ type: 'TOTAL' as any, budgeted: 18500, actual: 14230, variance: -4270, pct: 100 }}
        />
      </div>

      {/* AI Insight */}
      <AIInsightCard
        title="AI insight"
        updatedAt="just now"
        actionLabel="Apply to quoting"
        onAction={() => {}}
      >
        Labour costs are 20% under budget. Consider re-quoting similar jobs — your welding team has improved productivity by ~15% this quarter.
      </AIInsightCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cost Breakdown">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" {...MW_RECHARTS_ANIMATION}>
                  {donutData.map((e, i) => <Cell key={`donut-${e.name}-${i}`} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={MW_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[var(--neutral-600)]">{d.name}</span>
                  <span className="ml-auto tabular-nums">${d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Cost Over Time">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={costOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={MW_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="budget" stroke="var(--neutral-400)" strokeWidth={2} strokeDasharray="6 4" fill="none" {...MW_RECHARTS_ANIMATION} />
              <Area type="monotone" dataKey="actual" stroke="var(--mw-yellow-400)" strokeWidth={2} fill="var(--mw-yellow-400)" fillOpacity={0.15} {...MW_RECHARTS_ANIMATION} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detail Tabs */}
      <Card className="bg-card rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {detailTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm relative transition-colors",
                activeTab === tab ? "text-foreground font-medium" : "text-[var(--neutral-500)] hover:text-foreground font-normal"
              )}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--mw-yellow-400)] rounded-t" />}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'Materials' && (
            <FinancialTable
              columns={materialColumns}
              data={materialsData}
              keyExtractor={(_, i) => i}
            />
          )}
          {activeTab === 'Labour' && (
            <FinancialTable
              columns={labourColumns}
              data={labourData}
              keyExtractor={(_, i) => i}
            />
          )}
          {(activeTab === 'Overhead' || activeTab === 'Subcontract') && (
            <div className="p-8 text-center text-sm text-muted-foreground">No detailed {activeTab.toLowerCase()} records to display.</div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}
