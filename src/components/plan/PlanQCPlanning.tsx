/**
 * Plan QC Planning — Inspection points, quality checklists, and NCR history
 */
import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronRight,
  ClipboardCheck,
  UserCheck,
  XCircle,
  Eye,
  Calendar,
  FileWarning,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { toast } from 'sonner';

// ── Inspection Points ───────────────────────────────────────────────

interface InspectionPoint {
  id: string;
  operation: string;
  workCenter: string;
  inspectionType: 'visual' | 'dimensional' | 'destructive' | 'ndt' | 'functional';
  criteria: string;
  frequency: string;
  mandatory: boolean;
  duration: number;
  inspector: string;
  lastPerformed: string;
  passRate: number;
}

const INSPECTION_POINTS: InspectionPoint[] = [
  { id: 'ip-001', operation: 'Incoming Material', workCenter: 'Receiving', inspectionType: 'visual', criteria: 'Surface finish, dimensions, material cert', frequency: 'Every delivery', mandatory: true, duration: 15, inspector: 'Anh Nguyen', lastPerformed: '2026-04-02', passRate: 98 },
  { id: 'ip-002', operation: 'Laser Cut Blanks', workCenter: 'Cutting', inspectionType: 'dimensional', criteria: 'Tolerances +/-0.1mm, burr height <0.05mm', frequency: 'First-off + 1 per 20', mandatory: true, duration: 20, inspector: 'Anh Nguyen', lastPerformed: '2026-04-03', passRate: 96 },
  { id: 'ip-003', operation: 'Press Brake Forming', workCenter: 'Forming', inspectionType: 'dimensional', criteria: 'Bend angle +/-0.5deg, springback check', frequency: 'First-off + 1 per 10', mandatory: true, duration: 15, inspector: 'Anh Nguyen', lastPerformed: '2026-04-03', passRate: 94 },
  { id: 'ip-004', operation: 'MIG Weld Assembly', workCenter: 'Welding', inspectionType: 'visual', criteria: 'Weld bead consistency, undercut, porosity', frequency: 'Every joint', mandatory: true, duration: 30, inspector: 'James Murray', lastPerformed: '2026-04-03', passRate: 91 },
  { id: 'ip-005', operation: 'Structural Weld', workCenter: 'Welding', inspectionType: 'ndt', criteria: 'UT weld penetration, AS 1554.1 compliance', frequency: 'Per structural joint', mandatory: true, duration: 60, inspector: 'External', lastPerformed: '2026-03-28', passRate: 88 },
  { id: 'ip-006', operation: 'CNC Machining', workCenter: 'Machining', inspectionType: 'dimensional', criteria: 'CMM report, hole pattern +/-0.05mm', frequency: 'First-off + 1 per 5', mandatory: true, duration: 25, inspector: 'David Lee', lastPerformed: '2026-04-02', passRate: 99 },
  { id: 'ip-007', operation: 'Surface Preparation', workCenter: 'Finishing', inspectionType: 'visual', criteria: 'Cleanliness, surface profile Sa 2.5', frequency: 'Before coating', mandatory: true, duration: 10, inspector: 'Anh Nguyen', lastPerformed: '2026-04-01', passRate: 97 },
  { id: 'ip-008', operation: 'Powder Coat Application', workCenter: 'Finishing', inspectionType: 'functional', criteria: 'DFT 60-80 micron, adhesion cross-hatch', frequency: 'Per batch', mandatory: true, duration: 15, inspector: 'Anh Nguyen', lastPerformed: '2026-03-30', passRate: 95 },
  { id: 'ip-009', operation: 'Final Assembly', workCenter: 'Assembly', inspectionType: 'visual', criteria: 'Fit-up, fastener torque, visual cosmetics', frequency: 'Per job', mandatory: true, duration: 45, inspector: 'Anh Nguyen', lastPerformed: '2026-04-03', passRate: 99 },
  { id: 'ip-010', operation: 'Dimensional Report', workCenter: 'Assembly', inspectionType: 'dimensional', criteria: 'Customer-specified critical dims, GD&T', frequency: 'As required', mandatory: false, duration: 90, inspector: 'Anh Nguyen', lastPerformed: '2026-03-20', passRate: 100 },
  { id: 'ip-011', operation: 'IP Rating Test', workCenter: 'Assembly', inspectionType: 'functional', criteria: 'IP65 ingress protection verification', frequency: 'Per batch', mandatory: false, duration: 30, inspector: 'External', lastPerformed: '2026-03-15', passRate: 100 },
  { id: 'ip-012', operation: 'Packing Inspection', workCenter: 'Dispatch', inspectionType: 'visual', criteria: 'Protection, labelling, documentation', frequency: 'Per shipment', mandatory: true, duration: 5, inspector: 'Tom Bradshaw', lastPerformed: '2026-04-03', passRate: 100 },
];

// ── Quality Checklists ──────────────────────────────────────────────

interface QualityChecklist {
  id: string;
  name: string;
  job: string;
  operation: string;
  itemCount: number;
  completedCount: number;
  assignee: string;
  status: 'draft' | 'active' | 'completed' | 'failed';
  dueDate: string;
}

const CHECKLISTS: QualityChecklist[] = [
  { id: 'cl-001', name: 'Mounting Bracket ITP', job: 'JOB-2026-0012', operation: 'Full ITP', itemCount: 12, completedCount: 8, assignee: 'Anh Nguyen', status: 'active', dueDate: '2026-04-05' },
  { id: 'cl-002', name: 'Weld Quality — Structural', job: 'JOB-2026-0013', operation: 'Welding', itemCount: 8, completedCount: 0, assignee: 'James Murray', status: 'draft', dueDate: '2026-04-15' },
  { id: 'cl-003', name: 'Powder Coat Batch QC', job: 'JOB-2026-0012', operation: 'Finishing', itemCount: 6, completedCount: 6, assignee: 'Anh Nguyen', status: 'completed', dueDate: '2026-04-01' },
  { id: 'cl-004', name: 'CNC Machining First-Off', job: 'JOB-2026-0011', operation: 'Machining', itemCount: 10, completedCount: 10, assignee: 'David Lee', status: 'completed', dueDate: '2026-03-28' },
  { id: 'cl-005', name: 'Panel Enclosure IP65 Test', job: 'JOB-2026-0015', operation: 'Assembly', itemCount: 5, completedCount: 0, assignee: 'Anh Nguyen', status: 'draft', dueDate: '2026-04-22' },
  { id: 'cl-006', name: 'Incoming Material — CRS', job: 'JOB-2026-0015', operation: 'Receiving', itemCount: 4, completedCount: 2, assignee: 'Anh Nguyen', status: 'active', dueDate: '2026-04-08' },
];

// ── Non-Conformance Reports ─────────────────────────────────────────

interface NCR {
  id: string;
  ncrNumber: string;
  job: string;
  operation: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  raisedBy: string;
  raisedDate: string;
  rootCause?: string;
}

const NCR_HISTORY: NCR[] = [
  { id: 'ncr-001', ncrNumber: 'NCR-2026-0018', job: 'JOB-2026-0012', operation: 'Welding', description: 'Undercut detected on bracket weld joint B3 — exceeded 0.5mm limit', severity: 'major', status: 'resolved', raisedBy: 'Anh Nguyen', raisedDate: '2026-03-28', rootCause: 'Wire feed speed too high — adjusted from 12m/min to 9m/min' },
  { id: 'ncr-002', ncrNumber: 'NCR-2026-0017', job: 'JOB-2026-0011', operation: 'Laser Cutting', description: 'Burr height on 5 parts exceeded 0.05mm specification', severity: 'minor', status: 'closed', raisedBy: 'David Lee', raisedDate: '2026-03-25', rootCause: 'Nozzle wear — replaced and re-qualified' },
  { id: 'ncr-003', ncrNumber: 'NCR-2026-0019', job: 'JOB-2026-0012', operation: 'Powder Coating', description: 'DFT measured 45 micron on 3 panels (spec: 60-80 micron)', severity: 'major', status: 'under_review', raisedBy: 'Anh Nguyen', raisedDate: '2026-04-01' },
  { id: 'ncr-004', ncrNumber: 'NCR-2026-0016', job: 'JOB-2026-0010', operation: 'Assembly', description: 'M10 bolt torque below spec on guard mounting points', severity: 'critical', status: 'resolved', raisedBy: 'Anh Nguyen', raisedDate: '2026-03-18', rootCause: 'Torque wrench out of calibration — recalibrated' },
  { id: 'ncr-005', ncrNumber: 'NCR-2026-0020', job: 'JOB-2026-0013', operation: 'Incoming Material', description: 'Material certificate missing for SS 316 batch — hold placed', severity: 'minor', status: 'open', raisedBy: 'Tom Bradshaw', raisedDate: '2026-04-03' },
];

// ── Filter options ──────────────────────────────────────────────────

const WORK_CENTERS = ['All', 'Receiving', 'Cutting', 'Forming', 'Welding', 'Machining', 'Finishing', 'Assembly', 'Dispatch'];

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  visual: 'Visual',
  dimensional: 'Dimensional',
  destructive: 'Destructive',
  ndt: 'NDT',
  functional: 'Functional',
};

// ── Columns ─────────────────────────────────────────────────────────

const inspectionColumns: MwColumnDef<InspectionPoint>[] = [
  {
    key: 'operation',
    header: 'Operation',
    tooltip: 'Manufacturing operation',
    cell: (row) => <span className="font-medium text-foreground">{row.operation}</span>,
  },
  {
    key: 'workCenter',
    header: 'Work Centre',
    tooltip: 'Work centre location',
    cell: (row) => <StatusBadge variant="neutral">{row.workCenter}</StatusBadge>,
  },
  {
    key: 'inspectionType',
    header: 'Type',
    tooltip: 'Inspection type',
    cell: (row) => (
      <StatusBadge variant="info">{INSPECTION_TYPE_LABELS[row.inspectionType]}</StatusBadge>
    ),
  },
  {
    key: 'criteria',
    header: 'Criteria',
    tooltip: 'Acceptance criteria',
    className: 'max-w-[240px] text-xs text-[var(--neutral-500)]',
    cell: (row) => <span className="line-clamp-2">{row.criteria}</span>,
  },
  {
    key: 'frequency',
    header: 'Frequency',
    tooltip: 'Inspection frequency',
    className: 'text-xs text-foreground',
    cell: (row) => row.frequency,
  },
  {
    key: 'mandatory',
    header: 'Required',
    tooltip: 'Mandatory inspection',
    cell: (row) =>
      row.mandatory ? (
        <StatusBadge variant="info">Required</StatusBadge>
      ) : (
        <StatusBadge variant="neutral">Optional</StatusBadge>
      ),
  },
  {
    key: 'passRate',
    header: 'Pass Rate',
    tooltip: 'Historical pass rate',
    headerClassName: 'text-right',
    className: 'text-right',
    cell: (row) => (
      <span
        className="tabular-nums font-medium text-sm"
        style={{
          color: row.passRate >= 95 ? 'var(--mw-success)' : row.passRate >= 90 ? 'var(--mw-yellow-800)' : 'var(--mw-error)',
        }}
      >
        {row.passRate}%
      </span>
    ),
  },
  {
    key: 'inspector',
    header: 'Inspector',
    tooltip: 'Assigned inspector',
    className: 'text-xs text-foreground',
    cell: (row) => row.inspector,
  },
];

const ncrColumns: MwColumnDef<NCR>[] = [
  {
    key: 'ncrNumber',
    header: 'NCR #',
    tooltip: 'Non-conformance report number',
    cell: (row) => <span className="tabular-nums font-medium text-foreground text-xs">{row.ncrNumber}</span>,
  },
  {
    key: 'job',
    header: 'Job',
    tooltip: 'Associated job',
    cell: (row) => <span className="tabular-nums text-xs text-foreground">{row.job}</span>,
  },
  {
    key: 'operation',
    header: 'Operation',
    tooltip: 'Operation where NCR was raised',
    className: 'text-foreground text-xs',
    cell: (row) => row.operation,
  },
  {
    key: 'description',
    header: 'Description',
    tooltip: 'Issue description',
    className: 'max-w-[280px] text-xs text-[var(--neutral-500)]',
    cell: (row) => <span className="line-clamp-2">{row.description}</span>,
  },
  {
    key: 'severity',
    header: 'Severity',
    tooltip: 'Issue severity',
    cell: (row) => {
      if (row.severity === 'critical') return <StatusBadge variant="error">Critical</StatusBadge>;
      if (row.severity === 'major') return <StatusBadge variant="warning">Major</StatusBadge>;
      return <StatusBadge variant="neutral">Minor</StatusBadge>;
    },
  },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'NCR status',
    cell: (row) => {
      const map: Record<string, { variant: 'neutral' | 'info' | 'warning' | 'error'; label: string }> = {
        open: { variant: 'error', label: 'Open' },
        under_review: { variant: 'warning', label: 'Under Review' },
        resolved: { variant: 'info', label: 'Resolved' },
        closed: { variant: 'neutral', label: 'Closed' },
      };
      const m = map[row.status];
      return <StatusBadge variant={m.variant} withDot>{m.label}</StatusBadge>;
    },
  },
  {
    key: 'raisedDate',
    header: 'Date',
    tooltip: 'Date NCR was raised',
    className: 'tabular-nums text-xs text-[var(--neutral-500)]',
    cell: (row) => {
      const d = new Date(row.raisedDate);
      return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    },
  },
];

// ── Component ───────────────────────────────────────────────────────

export function PlanQCPlanning() {
  const [search, setSearch] = useState('');
  const [workCenterTab, setWorkCenterTab] = useState('All');
  const [activeSection, setActiveSection] = useState<'inspections' | 'checklists' | 'ncr'>('inspections');

  const filteredInspections = useMemo(() => {
    return INSPECTION_POINTS.filter((ip) => {
      const matchSearch = ip.operation.toLowerCase().includes(search.toLowerCase()) || ip.criteria.toLowerCase().includes(search.toLowerCase());
      const matchWC = workCenterTab === 'All' || ip.workCenter === workCenterTab;
      return matchSearch && matchWC;
    });
  }, [search, workCenterTab]);

  const mandatoryCount = INSPECTION_POINTS.filter((ip) => ip.mandatory).length;
  const optionalCount = INSPECTION_POINTS.filter((ip) => !ip.mandatory).length;
  const avgPassRate = Math.round(INSPECTION_POINTS.reduce((s, ip) => s + ip.passRate, 0) / INSPECTION_POINTS.length);
  const openNcrs = NCR_HISTORY.filter((n) => n.status === 'open' || n.status === 'under_review').length;

  return (
    <PageShell>
      <PageHeader
        title="Quality Planning"
        subtitle={`${mandatoryCount} mandatory checkpoints \u00B7 ${optionalCount} optional \u00B7 ${avgPassRate}% avg pass rate`}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-[var(--border)] gap-2 h-12"
              onClick={() => toast('Assigning inspector...')}
            >
              <UserCheck className="w-4 h-4" /> Assign Inspector
            </Button>
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2 h-12"
              onClick={() => toast('Creating checklist...')}
            >
              <Plus className="w-4 h-4" /> Create Checklist
            </Button>
          </div>
        }
      />

      {/* KPI cards */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Inspection Points', count: INSPECTION_POINTS.length, icon: Eye, bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-foreground' },
          { label: 'Active Checklists', count: CHECKLISTS.filter((c) => c.status === 'active').length, icon: ClipboardCheck, bg: 'bg-[var(--mw-amber-100)] dark:bg-[var(--mw-warning)]/10', text: 'text-[var(--mw-yellow-800)] dark:text-[var(--mw-warning)]' },
          { label: 'Avg Pass Rate', count: avgPassRate, icon: CheckCircle2, bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-[var(--mw-success)]', suffix: '%' },
          { label: 'Open NCRs', count: openNcrs, icon: FileWarning, bg: openNcrs > 0 ? 'bg-[var(--mw-error-100)] dark:bg-[var(--mw-error)]/10' : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: openNcrs > 0 ? 'text-[var(--mw-error)]' : 'text-foreground' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={staggerItem}>
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <div className={cn('w-8 h-8 rounded-[var(--shape-md)] flex items-center justify-center mb-4', s.bg)}>
                  <Icon className={cn('w-4 h-4', s.text)} />
                </div>
                <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
                <p className={cn('text-2xl tabular-nums font-medium', s.text)}>
                  {s.count}{(s as { suffix?: string }).suffix || ''}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-lg)] p-1 w-fit">
        {[
          { id: 'inspections' as const, label: 'Inspection Points', count: INSPECTION_POINTS.length },
          { id: 'checklists' as const, label: 'Quality Checklists', count: CHECKLISTS.length },
          { id: 'ncr' as const, label: 'Non-Conformances', count: NCR_HISTORY.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm transition-colors font-medium flex items-center gap-2',
              activeSection === tab.id
                ? 'bg-card dark:bg-[var(--neutral-700)] text-foreground shadow-sm'
                : 'text-[var(--neutral-500)] hover:text-foreground',
            )}
          >
            {tab.label}
            <span className={cn(
              'text-xs tabular-nums rounded-full px-1.5 py-0.5',
              activeSection === tab.id ? 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-600)] text-foreground' : 'text-[var(--neutral-400)]',
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SECTION: Inspection Points */}
      {activeSection === 'inspections' && (
        <>
          <PageToolbar>
            <ToolbarSearch value={search} onChange={setSearch} placeholder="Search inspection points..." />
            <ToolbarSpacer />
            {/* Work centre filter */}
            <div className="flex gap-1 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-lg)] p-1 flex-wrap">
              {WORK_CENTERS.map((wc) => (
                <button
                  key={wc}
                  onClick={() => setWorkCenterTab(wc)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs transition-colors font-medium whitespace-nowrap',
                    workCenterTab === wc
                      ? 'bg-card dark:bg-[var(--neutral-700)] text-foreground shadow-sm'
                      : 'text-[var(--neutral-500)] hover:text-foreground',
                  )}
                >
                  {wc}
                </button>
              ))}
            </div>
            <ToolbarFilterButton />
          </PageToolbar>

          <MwDataTable<InspectionPoint>
            columns={inspectionColumns}
            data={filteredInspections}
            keyExtractor={(row) => row.id}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items...`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items...`)}
          />
        </>
      )}

      {/* SECTION: Quality Checklists */}
      {activeSection === 'checklists' && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CHECKLISTS.map((cl) => {
            const progress = cl.itemCount > 0 ? Math.round((cl.completedCount / cl.itemCount) * 100) : 0;
            return (
              <motion.div key={cl.id} variants={staggerItem} className="h-full min-h-0">
                <SpotlightCard radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
                  <Card
                    variant="flat"
                    className="group h-full cursor-pointer border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                  >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck
                        className={cn(
                          'w-5 h-5 shrink-0',
                          cl.status === 'completed' ? 'text-[var(--mw-success)]' : cl.status === 'failed' ? 'text-[var(--mw-error)]' : 'text-foreground',
                        )}
                      />
                      <h3 className="text-sm font-medium text-foreground leading-tight transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
                        {cl.name}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <StatusBadge variant="neutral">{cl.job}</StatusBadge>
                    {cl.status === 'active' && <StatusBadge variant="info" withDot>Active</StatusBadge>}
                    {cl.status === 'draft' && <StatusBadge variant="neutral" withDot>Draft</StatusBadge>}
                    {cl.status === 'completed' && <StatusBadge variant="neutral" withDot>Completed</StatusBadge>}
                    {cl.status === 'failed' && <StatusBadge variant="error" withDot>Failed</StatusBadge>}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--neutral-500)]">Progress</span>
                      <span className="text-xs tabular-nums font-medium text-foreground">
                        {cl.completedCount}/{cl.itemCount} items
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? 'var(--mw-success)' : 'var(--mw-yellow-400)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--neutral-500)]">Operation</span>
                      <span className="text-foreground">{cl.operation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--neutral-500)]">Assignee</span>
                      <span className="text-foreground font-medium">{cl.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--neutral-500)]">Due</span>
                      <span className="tabular-nums text-foreground">
                        {new Date(cl.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  </Card>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* SECTION: Non-Conformance History */}
      {activeSection === 'ncr' && (
        <>
          <ToolbarSummaryBar
            segments={[
              { key: 'open', label: 'Open', value: NCR_HISTORY.filter((n) => n.status === 'open').length, color: 'var(--mw-error)' },
              { key: 'review', label: 'Under Review', value: NCR_HISTORY.filter((n) => n.status === 'under_review').length, color: 'var(--mw-warning)' },
              { key: 'resolved', label: 'Resolved', value: NCR_HISTORY.filter((n) => n.status === 'resolved').length, color: 'var(--mw-mirage)' },
              { key: 'closed', label: 'Closed', value: NCR_HISTORY.filter((n) => n.status === 'closed').length, color: 'var(--neutral-400)' },
            ]}
            formatValue={(v) => String(v)}
          />

          <MwDataTable<NCR>
            columns={ncrColumns}
            data={NCR_HISTORY}
            keyExtractor={(row) => row.id}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} NCRs...`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} NCRs...`)}
          />
        </>
      )}
    </PageShell>
  );
}
