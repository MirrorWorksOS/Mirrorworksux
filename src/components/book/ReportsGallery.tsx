import React from 'react';
import { BarChart3, PieChart, FileText, Clock, Scale, TrendingUp, Users, DollarSign, Target, Wrench, Receipt, Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';

const xeroReports = [
  { icon: BarChart3, title: 'Profit & Loss', desc: 'Income statement with job-level tracking via Xero' },
  { icon: PieChart, title: 'Balance Sheet', desc: 'Financial position snapshot at any date' },
  { icon: FileText, title: 'BAS Report', desc: 'Business Activity Statement (AU only)' },
  { icon: Clock, title: 'Aged Receivables', desc: 'Outstanding invoices by customer age' },
  { icon: Clock, title: 'Aged Payables', desc: 'Outstanding bills by supplier age' },
  { icon: Scale, title: 'Trial Balance', desc: 'Account balances from Xero' },
];

const mwReports = [
  { icon: TrendingUp, title: 'Job Profitability', desc: 'Revenue vs costs per job with margin drill-down' },
  { icon: Users, title: 'Customer Profitability', desc: 'Aggregated profitability by customer' },
  { icon: DollarSign, title: 'Cost Analysis', desc: 'Material, labour, overhead trends over time' },
  { icon: Target, title: 'Budget vs Actual', desc: 'Variance analysis by job, department, or period' },
  { icon: Wrench, title: 'WIP Report', desc: 'Current work-in-progress valuation with aging', ai: true },
  { icon: Receipt, title: 'Expense Report', desc: 'Expenses by category, employee, job, or period' },
];

const scheduled = [
  { name: 'Job Profitability', schedule: 'Weekly', scheduleBg: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]', recipients: ['matt@mirrorworks.io'], lastRun: '19 Feb', nextRun: '26 Feb', active: true },
  { name: 'Expense Report', schedule: 'Monthly', scheduleBg: 'bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]', recipients: ['cormac@mirrorworks.io', 'matt@mirrorworks.io'], lastRun: '01 Feb', nextRun: '01 Mar', active: true },
  { name: 'Budget vs Actual', schedule: 'Daily', scheduleBg: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]', recipients: ['matt@mirrorworks.io'], lastRun: '01 Mar', nextRun: '02 Mar', active: false },
];

const ReportCard = ({ icon: Icon, title, desc, borderColor, badge, ai }: any) => (
  <Card className={cn("bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6 hover:shadow-md transition-shadow", borderColor && `border-l-[3px] ${borderColor}`)}>
    <Icon className="w-8 h-8 text-[var(--mw-mirage)] mb-3" />
    <div className="flex items-center gap-2 mb-1">
      <h3 className="text-sm text-[var(--mw-mirage)] font-medium">{title}</h3>
      {ai && <Badge className="rounded-full text-[10px] px-2 py-0 border-0 bg-[var(--mw-purple-100)] text-[var(--mw-purple)]">AI</Badge>}
    </div>
    <p className="text-xs text-[var(--neutral-500)] mb-4">{desc}</p>
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" className="h-10 border-[var(--border)] text-[var(--mw-mirage)] rounded">Generate</Button>
      {badge && <span className="text-xs text-[var(--neutral-400)]">{badge}</span>}
    </div>
  </Card>
);

export function ReportsGallery() {
  return (
    <div className="p-6 space-y-8 overflow-y-auto max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Reports</h1>
          <p className="text-sm text-[var(--neutral-500)]">Financial reports and manufacturing analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Calendar className="w-4 h-4" /> Schedule Report</Button>
          <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] rounded gap-2"><Sparkles className="w-4 h-4" /> Custom Report</Button>
        </div>
      </div>

      {/* Xero Reports */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[var(--mw-mirage)] font-medium">From Xero</h2>
          <div className="w-4 h-4 rounded-full bg-[#13B5EA]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {xeroReports.map(r => (
            <ReportCard key={r.title} {...r} borderColor="border-l-[#13B5EA]" badge="Powered by Xero" />
          ))}
        </div>
      </div>

      {/* MW Reports */}
      <div>
        <h2 className="text-[var(--mw-mirage)] mb-4 font-medium">MirrorWorks Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mwReports.map(r => (
            <ReportCard key={r.title} {...r} borderColor="border-l-[var(--mw-yellow-400)]" />
          ))}
        </div>
      </div>

      {/* Scheduled */}
      <div>
        <h2 className="text-[var(--mw-mirage)] mb-4 font-medium">Scheduled Reports</h2>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  {['REPORT NAME', 'SCHEDULE', 'RECIPIENTS', 'LAST RUN', 'NEXT RUN', 'ACTIVE'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduled.map(s => (
                  <tr key={s.name} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)]">
                    <td className="px-4 text-sm text-[var(--mw-mirage)] font-medium">{s.name}</td>
                    <td className="px-4"><Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", s.scheduleBg)}>{s.schedule}</Badge></td>
                    <td className="px-4">
                      <div className="flex gap-1 flex-wrap">
                        {s.recipients.map(r => (
                          <Badge key={r} className="rounded-full text-xs px-2 py-0.5 border-0 bg-[var(--neutral-100)] text-[var(--neutral-500)]">{r}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 text-sm text-[var(--neutral-600)]">{s.lastRun}</td>
                    <td className="px-4 text-sm text-[var(--neutral-600)]">{s.nextRun}</td>
                    <td className="px-4"><Switch defaultChecked={s.active} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
