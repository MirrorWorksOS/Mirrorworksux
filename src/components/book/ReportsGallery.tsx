import { BarChart3, PieChart, FileText, Clock, Scale, TrendingUp, Users, DollarSign, Target, Wrench, Receipt, Sparkles, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';

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
  { name: 'Job Profitability', schedule: 'Weekly', scheduleBg: 'bg-[var(--neutral-100)] text-foreground', recipients: ['matt@mirrorworks.io'], lastRun: '19 Feb', nextRun: '26 Feb', active: true },
  { name: 'Expense Report', schedule: 'Monthly', scheduleBg: 'bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]', recipients: ['cormac@mirrorworks.io', 'matt@mirrorworks.io'], lastRun: '01 Feb', nextRun: '01 Mar', active: true },
  { name: 'Budget vs Actual', schedule: 'Daily', scheduleBg: 'bg-[var(--neutral-100)] text-foreground', recipients: ['matt@mirrorworks.io'], lastRun: '01 Mar', nextRun: '02 Mar', active: false },
];

type ScheduledReport = (typeof scheduled)[number];

const scheduledColumns: MwColumnDef<ScheduledReport>[] = [
  { key: 'name', header: 'Report Name', tooltip: 'Scheduled report name', cell: (s) => <span className="font-medium text-foreground">{s.name}</span> },
  {
    key: 'schedule',
    header: 'Schedule',
    tooltip: 'How often this report runs',
    cell: (s) => <Badge className={cn('rounded-full text-xs px-2 py-0.5 border-0', s.scheduleBg)}>{s.schedule}</Badge>,
  },
  {
    key: 'recipients',
    header: 'Recipients',
    tooltip: 'Email recipients for the report',
    cell: (s) => (
      <div className="flex gap-1 flex-wrap">
        {s.recipients.map(r => (
          <Badge key={r} className="rounded-full text-xs px-2 py-0.5 border-0 bg-[var(--neutral-100)] text-[var(--neutral-500)]">{r}</Badge>
        ))}
      </div>
    ),
  },
  { key: 'lastRun', header: 'Last Run', className: 'text-[var(--neutral-600)] tabular-nums', cell: (s) => <span className="tabular-nums">{s.lastRun}</span> },
  { key: 'nextRun', header: 'Next Run', className: 'text-[var(--neutral-600)] tabular-nums', cell: (s) => <span className="tabular-nums">{s.nextRun}</span> },
  { key: 'active', header: 'Active', cell: (s) => <Switch defaultChecked={s.active} /> },
];

const ReportCard = ({ icon: Icon, title, desc, borderColor, badge, ai }: any) => (
  <Card variant="flat" className={cn("rounded-[var(--shape-lg)] border border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]", borderColor && `border-l-[3px] ${borderColor}`)}>
    <Icon className="w-8 h-8 text-foreground mb-3" />
    <div className="flex items-center gap-2 mb-1">
      <h3 className="text-sm text-foreground font-medium">{title}</h3>
      {ai && <Badge className="rounded-full text-[10px] px-2 py-0 border-0 bg-[var(--mw-purple)]/15 text-[var(--mw-purple)]">AI</Badge>}
    </div>
    <p className="text-xs text-[var(--neutral-500)] mb-4">{desc}</p>
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" className="h-10 border-[var(--border)] text-foreground rounded-full" onClick={() => toast('Generating report…')}>Generate</Button>
      {badge && <span className="text-xs text-[var(--neutral-400)]">{badge}</span>}
    </div>
  </Card>
);

export function ReportsGallery() {
  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Financial reports and manufacturing analytics"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]">
              <Calendar className="h-4 w-4" /> Schedule report
            </Button>
            <Button className="h-10 gap-2 rounded-full bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
              <Sparkles className="h-4 w-4" /> Custom report
            </Button>
          </div>
        }
      />

      {/* Xero Reports */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-foreground">From Xero</h2>
          {/* Xero brand blue */}
          <div className="h-4 w-4 rounded-full bg-[#13B5EA]" aria-hidden />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {xeroReports.map(r => (
            <ReportCard key={r.title} {...r} borderColor="border-l-[#13B5EA]" badge="Powered by Xero" />
          ))}
        </div>
      </div>

      {/* MW Reports */}
      <div className="space-y-4">
        <h2 className="font-medium text-foreground">MirrorWorks reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mwReports.map(r => (
            <ReportCard key={r.title} {...r} borderColor="border-l-[var(--mw-yellow-400)]" />
          ))}
        </div>
      </div>

      {/* Scheduled */}
      <div className="space-y-4">
        <h2 className="font-medium text-foreground">Scheduled reports</h2>
        <ToolbarSummaryBar
          segments={[
            { key: 'active', label: 'Active', value: scheduled.filter(s => s.active).length, color: 'var(--mw-yellow-400)' },
            { key: 'inactive', label: 'Inactive', value: scheduled.filter(s => !s.active).length, color: 'var(--neutral-400)' },
          ]}
          formatValue={(v) => String(v)}
        />
        <MwDataTable
          columns={scheduledColumns}
          data={scheduled}
          keyExtractor={(s) => s.name}
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        />
      </div>
    </PageShell>
  );
}
