import React, { useState } from 'react';
import { ArrowLeft, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AIInsightCard } from '../shared/AIInsightCard';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ReferenceLine
} from 'recharts';

const costBreakdown = [
  { type: 'Materials', budgeted: 8200, actual: 7450, variance: -750, pct: 52, color: '#0052CC' },
  { type: 'Labour', budgeted: 6100, actual: 4890, variance: -1210, pct: 34, color: '#36B37E' },
  { type: 'Overhead', budgeted: 2500, actual: 1490, variance: -1010, pct: 10, color: '#FACC15' },
  { type: 'Subcontract', budgeted: 1200, actual: 400, variance: -800, pct: 3, color: '#7C3AED' },
  { type: 'Other', budgeted: 500, actual: 0, variance: -500, pct: 0, color: '#A3A3A3' },
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

export function JobCostDetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('Materials');
  const detailTabs = ['Materials', 'Labour', 'Overhead', 'Subcontract'];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A2732]" />
          </button>
          <h1 className="text-2xl tracking-tight text-[#1A2732]" style={{ fontFamily: 'Roboto Mono, monospace' }}>JOB-2026-0012</h1>
        </div>
        <div className="flex items-center gap-2 ml-11">
          <span className="text-[#525252]">Con-form Group</span>
          <span className="text-[#D4D4D4]">&#8226;</span>
          <span className="text-[#525252]">Custom Handrail Assembly — Level 4</span>
          <Badge className="rounded-full text-[11px] px-2 py-0.5 border-0 bg-[#E6F0FF] text-[#0052CC]">In Production</Badge>
        </div>
      </div>

      {/* Hero Metrics */}
      <Card className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-8">
        <div className="grid grid-cols-3 items-center">
          <div className="text-center">
            <div className="text-sm text-[#737373] mb-2" style={{ fontWeight: 500 }}>Quoted</div>
            <div className="text-[36px] tracking-tight text-[#1A2732]" style={{ fontFamily: 'Roboto Mono, monospace' }}>$18,500</div>
          </div>
          <div className="text-center">
            <div className="relative w-[120px] h-[120px] mx-auto mb-2">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E5E5" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#36B37E" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 52 * 0.231} ${2 * Math.PI * 52}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>23.1%</span>
              </div>
            </div>
            <div className="text-xs text-[#737373]" style={{ fontWeight: 500 }}>Profit Margin</div>
            <div className="text-sm text-[#36B37E] mt-1">Under budget by $4,270</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-[#737373] mb-2" style={{ fontWeight: 500 }}>Actual to Date</div>
            <div className="text-[36px] tracking-tight text-[#36B37E]" style={{ fontFamily: 'Roboto Mono, monospace' }}>$14,230</div>
          </div>
        </div>
      </Card>

      {/* Cost Breakdown Table */}
      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-[#1A2732]" style={{ fontWeight: 500 }}>Cost Breakdown</h3>
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4]">
              {['Cost Type', 'Budgeted', 'Actual', 'Variance', '% of Total'].map(h => (
                <th key={h} className={cn("px-4 py-2 text-xs tracking-wider text-[#737373]", ['Budgeted', 'Actual', 'Variance', '% of Total'].includes(h) ? 'text-right' : 'text-left')} style={{ fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costBreakdown.map(row => (
              <tr key={row.type} className="border-b border-[#F5F5F5] h-14">
                <td className="px-4 text-sm text-[#1A2732]">{row.type}</td>
                <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>${row.budgeted.toLocaleString()}</td>
                <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>${row.actual.toLocaleString()}</td>
                <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500, color: row.variance < 0 ? '#36B37E' : '#DE350B' }}>
                  <span className="flex items-center justify-end gap-1">
                    <ArrowDown className="w-3 h-3" />-${Math.abs(row.variance).toLocaleString()}
                  </span>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-24 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                    </div>
                    <span className="text-xs text-[#737373] w-8 text-right">{row.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-[#1A2732] h-14">
              <td className="px-4 text-sm" style={{ fontWeight: 700 }}>TOTAL</td>
              <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>$18,500</td>
              <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>$14,230</td>
              <td className="px-4 text-sm text-right text-[#36B37E]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>-$4,270</td>
              <td className="px-4 text-sm text-right text-[#737373]">100%</td>
            </tr>
          </tbody>
        </table>
      </Card>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
          <h3 className="text-sm text-[#1A2732] mb-4" style={{ fontWeight: 500 }}>Cost Breakdown</h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {donutData.map((e, i) => <Cell key={`donut-${e.name}-${i}`} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[#525252]">{d.name}</span>
                  <span className="ml-auto" style={{ fontFamily: 'Roboto Mono, monospace' }}>${d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
          <h3 className="text-sm text-[#1A2732] mb-4" style={{ fontWeight: 500 }}>Cost Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={costOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="budget" stroke="#A3A3A3" strokeWidth={2} strokeDasharray="6 4" fill="none" />
              <Area type="monotone" dataKey="actual" stroke="#FFCF4B" strokeWidth={2} fill="#FFCF4B" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] overflow-hidden">
        <div className="flex border-b border-[#E5E5E5]">
          {detailTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-3 text-sm relative transition-colors", activeTab === tab ? "text-[#1A2732]" : "text-[#737373] hover:text-[#1A2732]")}
              style={{ fontWeight: activeTab === tab ? 500 : 400 }}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FFCF4B] rounded-t" />}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'Materials' && (
            <table className="w-full">
              <thead><tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                {['Date', 'Item', 'Qty', 'Unit Cost', 'Total', 'PO Ref', 'Source'].map(h => (
                  <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[#737373]", ['Qty', 'Unit Cost', 'Total'].includes(h) ? 'text-right' : 'text-left')} style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {materialsData.map((r, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0]">
                    <td className="px-4 text-sm text-[#525252]">{r.date}</td>
                    <td className="px-4 text-sm text-[#1A2732]">{r.item}</td>
                    <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{r.qty}</td>
                    <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{r.unitCost}</td>
                    <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{r.total}</td>
                    <td className="px-4 text-[13px] text-[#0052CC]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{r.po}</td>
                    <td className="px-4 text-sm text-[#525252]">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'Labour' && (
            <table className="w-full">
              <thead><tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                {['Date', 'Operator', 'Operation', 'Hours', 'Rate', 'Total', 'Status'].map(h => (
                  <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[#737373]", ['Hours', 'Rate', 'Total'].includes(h) ? 'text-right' : 'text-left')} style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {labourData.map((r, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0]">
                    <td className="px-4 text-sm text-[#525252]">{r.date}</td>
                    <td className="px-4 text-sm text-[#1A2732]">{r.operator}</td>
                    <td className="px-4 text-sm text-[#525252]">{r.operation}</td>
                    <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{r.hours}</td>
                    <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace' }}>{r.rate}</td>
                    <td className="px-4 text-sm text-right" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{r.total}</td>
                    <td className="px-4"><Badge className="rounded-full text-[11px] px-2 py-0.5 border-0 bg-[#E6F7EF] text-[#36B37E]">{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(activeTab === 'Overhead' || activeTab === 'Subcontract') && (
            <div className="p-8 text-center text-sm text-[#A3A3A3]">No detailed {activeTab.toLowerCase()} records to display.</div>
          )}
        </div>
      </Card>
    </div>
  );
}