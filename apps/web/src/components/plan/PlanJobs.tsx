/**
 * Plan Jobs — kanban / list / gantt views driven by `ModuleFilterBar`.
 *
 * Replaces the previous stub `ToolbarFilterButton` + dead search query with the
 * schema-driven filter bar. Facets: stage, priority, owner, customer, value,
 * dueDate, plus derived materialReadiness / promiseRisk / routeStatus pills
 * (mock-derived for now). Card view dropped in favour of Gantt per the plan;
 * Gantt itself is a TODO placeholder.
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Columns3,
  DollarSign,
  Flag,
  Flame,
  GanttChart,
  List as ListIcon,
  Package,
  Pencil,
  Plus,
  Route,
  User,
  UserCheck,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { GanttChart as GanttChartViz, type GanttTask } from '@/components/shared/schedule/GanttChart';
import { addDays, parseISO } from 'date-fns';
import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';
import { toast } from 'sonner';
import { jobs, employees, quotes, customers as centralCustomers } from '@/services';

const KANBAN_ITEM_TYPE = 'plan-job';

interface Job {
  id: string;
  name: string;
  description: string;
  quoteCount: number;
  value: number;
  assignedUser: {
    name: string;
    initials: string;
    avatar?: string;
  };
  customer?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  progress?: number;
  notes?: string;
  /** Derived: material readiness state. */
  materialReadiness?: 'ready' | 'short' | 'awaiting-po' | 'no-bom';
  /** Derived: routing status state. */
  routeStatus?: 'routed' | 'partial' | 'missing';
  /** Derived: promise-risk vs due date. */
  promiseRisk?: 'on-track' | 'at-risk' | 'will-miss';
}

/** Editable fields for inline row editing */
interface EditingState {
  priority: string;
  assignedUser: string;
  dueDate: string;
  notes: string;
}

const STATUS_TO_STAGE: Record<string, string> = {
  draft: 'draft',
  planned: 'scheduled',
  in_progress: 'in-progress',
  completed: 'complete',
};

const STAGES = [
  { id: 'draft', label: 'Draft' },
  { id: 'planning', label: 'Planning' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'on-hold', label: 'On hold' },
  { id: 'complete', label: 'Complete' },
];

/** Cycle through derived states so kanban + filters have meaningful spread. */
const MATERIAL_CYCLE: Job['materialReadiness'][] = ['ready', 'short', 'awaiting-po', 'no-bom'];
const ROUTE_CYCLE: Job['routeStatus'][] = ['routed', 'partial', 'missing'];
const RISK_CYCLE: Job['promiseRisk'][] = ['on-track', 'at-risk', 'will-miss'];

const EXTRA_KANBAN_JOBS: { stage: string; job: Job }[] = [
  { stage: 'draft', job: { id: 'JOB-2026-0016', name: 'Laser Cut Panels', description: 'Precision aluminum panels for aerospace application', quoteCount: 0, value: 12500, assignedUser: { name: 'Sarah Chen', initials: 'SC' }, customer: 'AeroSpace Ltd', priority: 'medium', dueDate: '2026-04-20', progress: 0, materialReadiness: 'ready', routeStatus: 'routed', promiseRisk: 'on-track' } },
  { stage: 'planning', job: { id: 'JOB-2026-0017', name: 'Press Brake Assembly', description: 'Multi-bend bracket assembly with powder coating', quoteCount: 1, value: 24800, assignedUser: { name: 'James Murray', initials: 'JM' }, customer: 'Industrial Solutions', priority: 'urgent', dueDate: '2026-04-10', progress: 15, materialReadiness: 'short', routeStatus: 'partial', promiseRisk: 'at-risk' } },
  { stage: 'planning', job: { id: 'JOB-2026-0018', name: 'Turret Punch Parts', description: 'High-volume punched components for HVAC units', quoteCount: 1, value: 45200, assignedUser: { name: 'Emma Wilson', initials: 'EW' }, customer: 'Climate Systems', priority: 'medium', dueDate: '2026-04-25', progress: 30, materialReadiness: 'awaiting-po', routeStatus: 'routed', promiseRisk: 'on-track' } },
];

const buildKanbanJobs = (): Record<string, Job[]> => {
  const stages: Record<string, Job[]> = {
    draft: [], planning: [], scheduled: [], 'in-progress': [], 'on-hold': [], complete: [],
  };
  jobs.forEach((j, idx) => {
    const emp = employees.find((e) => e.id === j.assignedTo);
    const quoteCount = quotes.filter((q) => q.customerId === j.customerId).length;
    const stageKey = STATUS_TO_STAGE[j.status] ?? 'draft';
    stages[stageKey].push({
      id: j.jobNumber,
      name: j.title,
      description: `${j.customerName} — ${j.title}`,
      quoteCount,
      value: j.value,
      assignedUser: {
        name: emp?.name ?? 'Unassigned',
        initials: emp?.initials ?? '—',
      },
      customer: j.customerName,
      priority: j.priority as Job['priority'],
      dueDate: j.dueDate,
      progress: j.progress,
      materialReadiness: MATERIAL_CYCLE[idx % MATERIAL_CYCLE.length],
      routeStatus: ROUTE_CYCLE[idx % ROUTE_CYCLE.length],
      promiseRisk: RISK_CYCLE[idx % RISK_CYCLE.length],
    });
  });
  EXTRA_KANBAN_JOBS.forEach(({ stage, job }) => stages[stage].push(job));
  return stages;
};

const MOCK_JOBS: Record<string, Job[]> = buildKanbanJobs();

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

const MODULE_ID = 'plan.jobs';

const ownerOptions = employees.map((e) => ({ value: e.initials, label: e.name }));
const customerOptions = centralCustomers.map((c) => ({ value: c.company, label: c.company }));

const jobsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Jobs',
  facets: [
    {
      id: 'stage', label: 'Stage', kind: 'multi', icon: Workflow, pinned: true,
      options: STAGES.map((s) => ({ value: s.id, label: s.label })),
    },
    {
      id: 'priority', label: 'Priority', kind: 'multi', icon: Flag, pinned: true,
      options: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
    { id: 'owner', label: 'Planner', kind: 'user', icon: User, options: ownerOptions },
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2, options: customerOptions },
    {
      id: 'materialReadiness', label: 'Material', kind: 'multi', icon: Package,
      options: [
        { value: 'ready', label: 'Ready', color: 'var(--mw-success)' },
        { value: 'short', label: 'Short', color: 'var(--mw-warning)' },
        { value: 'awaiting-po', label: 'Awaiting PO', color: 'var(--mw-info)' },
        { value: 'no-bom', label: 'No BOM', color: 'var(--mw-error)' },
      ],
    },
    {
      id: 'routeStatus', label: 'Routing', kind: 'multi', icon: Route,
      options: [
        { value: 'routed', label: 'Routed' },
        { value: 'partial', label: 'Partial' },
        { value: 'missing', label: 'Missing' },
      ],
    },
    {
      id: 'promiseRisk', label: 'Promise', kind: 'multi', icon: AlertTriangle,
      options: [
        { value: 'on-track', label: 'On track', color: 'var(--mw-success)' },
        { value: 'at-risk', label: 'At risk', color: 'var(--mw-warning)' },
        { value: 'will-miss', label: 'Will miss', color: 'var(--mw-error)' },
      ],
    },
    { id: 'value', label: 'Job value', kind: 'range', icon: DollarSign },
    {
      id: 'dueDate', label: 'Due', kind: 'date', icon: Calendar,
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter'],
    },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: Columns3, groupBy: 'stage' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'gantt', label: 'Gantt', icon: GanttChart },
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueDate',
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'Mine this week',
    icon: UserCheck,
    iconTone: 'yellow',
    state: { values: { dueDate: thisWeekRange() }, search: '', view: 'list' },
  },
  {
    name: 'Hot-list',
    icon: Flame,
    iconTone: 'error',
    state: {
      values: { priority: ['urgent', 'high'], promiseRisk: ['at-risk', 'will-miss'] },
      search: '',
      view: 'kanban',
    },
  },
  {
    name: 'Awaiting material',
    icon: Package,
    iconTone: 'warning',
    state: {
      values: { materialReadiness: ['short', 'awaiting-po', 'no-bom'] },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Routing TODO',
    icon: Route,
    iconTone: 'info',
    state: { values: { routeStatus: ['partial', 'missing'] }, search: '', view: 'list' },
  },
  {
    name: 'Planning standup',
    icon: Users,
    iconTone: 'yellow',
    state: {
      values: { dueDate: thisWeekRange(), promiseRisk: ['at-risk', 'will-miss'] },
      search: '',
      view: 'kanban',
    },
  },
]);

function thisWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - (day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanJobs() {
  const navigate = useNavigate();
  const filters = useModuleFilters(jobsFilterSchema);
  const { state } = filters;

  const [jobsByStage, setJobsByStage]   = useState<Record<string, Job[]>>(MOCK_JOBS);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editState, setEditState]       = useState<EditingState>({ priority: '', assignedUser: '', dueDate: '', notes: '' });

  // Flat list with stage embedded — used by filter pipeline and list/gantt views.
  const flatWithStage = useMemo(
    () => Object.entries(jobsByStage).flatMap(([stageId, list]) =>
      list.map((j) => ({ ...j, _stageId: stageId })),
    ),
    [jobsByStage],
  );

  type FlatJob = Job & { _stageId: string };

  const filtered = useMemo(
    () =>
      applyFilters<FlatJob>({
        schema: jobsFilterSchema,
        state,
        rows: flatWithStage,
        getSearchText: (j) => `${j.id} ${j.name} ${j.customer ?? ''} ${j.description}`,
        getFacetValue: (j, id) => {
          switch (id) {
            case 'stage': return j._stageId;
            case 'priority': return j.priority;
            case 'owner': return j.assignedUser.initials;
            case 'customer': return j.customer;
            case 'materialReadiness': return j.materialReadiness;
            case 'routeStatus': return j.routeStatus;
            case 'promiseRisk': return j.promiseRisk;
            case 'value': return j.value;
            case 'dueDate': return j.dueDate;
            default: return undefined;
          }
        },
      }),
    [flatWithStage, state],
  );

  const filteredByStage = useMemo(() => {
    const acc: Record<string, FlatJob[]> = {};
    STAGES.forEach((s) => { acc[s.id] = []; });
    filtered.forEach((j) => {
      (acc[j._stageId] ??= []).push(j);
    });
    return acc;
  }, [filtered]);

  const startEditing = (job: FlatJob) => {
    setEditingRowId(job.id);
    setEditState({
      priority: job.priority ?? 'medium',
      assignedUser: job.assignedUser.name,
      dueDate: job.dueDate ?? '',
      notes: job.notes ?? '',
    });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
  };

  const saveEditing = (jobId: string, stageId: string) => {
    setJobsByStage((prev) => {
      const next = { ...prev };
      next[stageId] = (next[stageId] ?? []).map((j) =>
        j.id === jobId
          ? {
              ...j,
              priority: editState.priority as Job['priority'],
              assignedUser: { ...j.assignedUser, name: editState.assignedUser },
              dueDate: editState.dueDate,
              notes: editState.notes,
            }
          : j,
      );
      return next;
    });
    setEditingRowId(null);
    toast.success('Job updated successfully');
  };

  const handleKanbanDrop = useCallback((item: KanbanDragItem, columnId: string) => {
    setJobsByStage(prev => {
      let moved: Job | undefined;
      const without: Record<string, Job[]> = {};
      for (const [key, list] of Object.entries(prev)) {
        without[key] = list.filter(j => {
          if (j.id === item.id) { moved = j; return false; }
          return true;
        });
      }
      if (!moved) return prev;
      return { ...without, [columnId]: [...(without[columnId] || []), moved] };
    });
  }, []);

  const JobCard = ({ job }: { job: Job }) => (
    <div
      onClick={() => navigate(`/plan/jobs/${job.id}`)}
      className="p-4 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="tabular-nums text-sm font-medium text-foreground">
          {job.id}
        </span>
        <Avatar className="w-8 h-8 border border-[var(--border)]">
          <AvatarImage src={job.assignedUser.avatar} />
          <AvatarFallback>{job.assignedUser.initials}</AvatarFallback>
        </Avatar>
      </div>

      <h3 className="text-sm font-medium text-foreground mb-1">
        {job.name}
      </h3>

      <p className="text-xs text-[var(--neutral-500)] mb-3 line-clamp-2">
        {job.description}
      </p>

      {job.priority && (
        <StatusBadge priority={job.priority} className="mb-2" />
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--neutral-500)]">
          {job.quoteCount} {job.quoteCount === 1 ? 'Quote' : 'Quotes'}
        </span>
        <span className="font-medium tabular-nums text-foreground">
          ${job.value.toLocaleString()}
        </span>
      </div>
    </div>
  );

  const listColumns: MwColumnDef<FlatJob>[] = [
    {
      key: 'id',
      header: 'Job ID',
      tooltip: 'Unique job identifier',
      className: 'w-[110px] tabular-nums text-xs font-medium text-foreground text-left',
      headerClassName: 'w-[110px] text-left',
      cell: (job) => job.id,
    },
    {
      key: 'name',
      header: 'Job Name',
      tooltip: 'Job description',
      className: 'min-w-[140px] text-xs font-medium text-foreground text-left',
      headerClassName: 'text-left',
      cell: (job) => job.name,
    },
    {
      key: 'customer',
      header: 'Customer',
      tooltip: 'Assigned customer',
      className: 'min-w-[120px] text-xs text-[var(--neutral-500)] text-left',
      headerClassName: 'text-left',
      cell: (job) => job.customer,
    },
    {
      key: 'stage',
      header: 'Stage',
      tooltip: 'Current production stage',
      className: 'w-[130px] text-center',
      headerClassName: 'w-[130px] text-center',
      cell: (job) => {
        const stage = STAGES.find(s => s.id === job._stageId);
        return <StatusBadge variant="neutral">{stage?.label}</StatusBadge>;
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      tooltip: 'Job priority level',
      className: 'w-[100px] text-center',
      headerClassName: 'w-[100px] text-center',
      cell: (job) => {
        if (editingRowId === job.id) {
          return (
            <Select
              value={editState.priority}
              onValueChange={(v) => setEditState((s) => ({ ...s, priority: v }))}
            >
              <SelectTrigger className="h-8 w-[90px] text-xs" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        return job.priority ? <StatusBadge priority={job.priority} /> : null;
      },
    },
    {
      key: 'value',
      header: 'Value',
      tooltip: 'Estimated job value',
      headerClassName: 'w-[100px] text-right',
      className: 'w-[100px] text-right tabular-nums text-xs text-foreground',
      cell: (job) => `$${job.value.toLocaleString()}`,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      tooltip: 'Expected completion date',
      className: 'w-[120px] text-xs tabular-nums text-[var(--neutral-500)] text-left',
      headerClassName: 'w-[120px] text-left',
      cell: (job) => {
        if (editingRowId === job.id) {
          return (
            <Input
              type="date"
              value={editState.dueDate}
              onChange={(e) => setEditState((s) => ({ ...s, dueDate: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-[130px] text-xs"
            />
          );
        }
        return job.dueDate;
      },
    },
    {
      key: 'assigned',
      header: 'Assigned',
      tooltip: 'Assigned team member',
      className: 'w-[120px] text-left',
      headerClassName: 'w-[120px] text-left',
      cell: (job) => {
        if (editingRowId === job.id) {
          return (
            <Input
              value={editState.assignedUser}
              onChange={(e) => setEditState((s) => ({ ...s, assignedUser: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-[110px] text-xs"
            />
          );
        }
        return (
          <Avatar className="w-6 h-6 border border-[var(--border)]">
            <AvatarImage src={job.assignedUser.avatar} />
            <AvatarFallback className="text-xs">{job.assignedUser.initials}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: 'progress',
      header: 'Progress',
      tooltip: 'Completion percentage',
      className: 'w-[130px]',
      headerClassName: 'w-[130px] text-right',
      cell: (job) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--mw-yellow-400)] transition-all duration-200 ease-[var(--ease-standard)]" style={{ width: `${job.progress}%` }} />
          </div>
          <span className="text-xs tabular-nums text-[var(--neutral-500)] w-10 text-right">{job.progress}%</span>
        </div>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      tooltip: 'Job notes',
      className: 'min-w-[100px] text-xs text-[var(--neutral-500)] text-left',
      headerClassName: 'text-left',
      cell: (job) => {
        if (editingRowId === job.id) {
          return (
            <Input
              value={editState.notes}
              onChange={(e) => setEditState((s) => ({ ...s, notes: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add notes..."
              className="h-8 w-full text-xs"
            />
          );
        }
        return job.notes || <span className="text-[var(--neutral-400)]">--</span>;
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[100px] text-right',
      headerClassName: 'w-[100px]',
      cell: (job) => {
        if (editingRowId === job.id) {
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[var(--mw-green)] hover:bg-[var(--mw-green)]/10"
                onClick={() => saveEditing(job.id, job._stageId)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[var(--neutral-400)] hover:text-foreground"
              onClick={() => startEditing(job)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const countInProduction = filtered.filter(j => j._stageId === 'in-progress').length;
  const countScheduled = filtered.filter(j => j._stageId === 'scheduled').length;
  const countDraft = filtered.filter(j => j._stageId === 'draft').length;
  const countOther = filtered.length - countInProduction - countScheduled - countDraft;

  return (
    <PageShell className="p-0 space-y-0 flex flex-col h-full bg-[var(--app-canvas)]">
      <div className="bg-[var(--app-canvas)] border-b border-[var(--border)] px-6 py-4 space-y-4">
        <PageHeader title="Jobs" />
        <ModuleFilterBar
          schema={jobsFilterSchema}
          filters={filters}
          searchPlaceholder="Search jobs…"
          actions={
            <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/plan/jobs/new')}>
              Create Job
            </ToolbarPrimaryButton>
          }
        />
      </div>

      {/* Kanban */}
      {state.view === 'kanban' && (
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard className="h-full">
            {STAGES.map((stage) => {
              const stageJobs = filteredByStage[stage.id] ?? [];
              return (
                <KanbanColumn
                  key={stage.id}
                  id={stage.id}
                  title={stage.label}
                  count={stageJobs.length}
                  accept={KANBAN_ITEM_TYPE}
                  onDrop={handleKanbanDrop}
                  className="min-w-[320px] w-[320px] flex-shrink-0"
                >
                  {stageJobs.map((job) => (
                    <KanbanCard key={job.id} id={job.id} type={KANBAN_ITEM_TYPE} className="p-0">
                      <JobCard job={job} />
                    </KanbanCard>
                  ))}
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
        </div>
      )}

      {/* List */}
      {state.view === 'list' && (
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <ToolbarSummaryBar
            segments={[
              { key: 'inProduction', label: 'In Production', value: countInProduction, color: 'var(--mw-yellow-400)' },
              { key: 'scheduled', label: 'Scheduled', value: countScheduled, color: 'var(--mw-mirage)' },
              { key: 'draft', label: 'Draft', value: countDraft, color: 'var(--neutral-400)' },
              { key: 'other', label: 'Other', value: countOther, color: 'var(--neutral-200)' },
            ]}
            formatValue={(v) => String(v)}
          />
          <MwDataTable
            columns={listColumns}
            data={filtered}
            keyExtractor={(job) => job.id}
            onRowClick={(job) => {
              if (editingRowId !== job.id) navigate(`/plan/jobs/${job.id}`);
            }}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </div>
      )}

      {/* Gantt */}
      {state.view === 'gantt' && (
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <ToolbarSummaryBar
            segments={[
              { key: 'inProduction', label: 'In Production', value: countInProduction, color: 'var(--mw-yellow-400)' },
              { key: 'scheduled', label: 'Scheduled', value: countScheduled, color: 'var(--mw-mirage)' },
              { key: 'draft', label: 'Draft', value: countDraft, color: 'var(--neutral-400)' },
              { key: 'other', label: 'Other', value: countOther, color: 'var(--neutral-200)' },
            ]}
            formatValue={(v) => String(v)}
          />
          {filtered.length === 0 ? (
            <div className="rounded-[var(--shape-lg)] border border-dashed border-[var(--border)] bg-card p-12 text-center">
              <GanttChart className="mx-auto h-10 w-10 text-[var(--neutral-400)]" />
              <p className="mt-3 text-sm text-foreground">No jobs to plot</p>
              <p className="mt-1 text-xs text-[var(--neutral-500)]">Adjust filters to see jobs on the Gantt.</p>
            </div>
          ) : (
            <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-4">
              {(() => {
                // Build Gantt tasks from filtered jobs. Duration is anchored to the
                // due date, walking back a stage-derived working span; this gives
                // each job a visible block without requiring schedule wiring yet.
                const STAGE_DAYS: Record<string, number> = {
                  draft: 3, planning: 5, scheduled: 7, 'in-progress': 10, 'on-hold': 4, complete: 2,
                };
                const STAGE_COLOR: Record<string, string> = {
                  draft: 'var(--neutral-400)',
                  planning: 'var(--mw-mirage)',
                  scheduled: 'var(--mw-info)',
                  'in-progress': 'var(--mw-yellow-400)',
                  'on-hold': 'var(--mw-warning)',
                  complete: 'var(--mw-success)',
                };
                const today = new Date();
                let minStart = today;
                let maxEnd = today;
                const tasks: GanttTask[] = filtered.map((j) => {
                  const due = j.dueDate ? parseISO(j.dueDate) : addDays(today, 14);
                  const span = STAGE_DAYS[j._stageId] ?? 5;
                  const start = addDays(due, -span);
                  if (start < minStart) minStart = start;
                  if (due > maxEnd) maxEnd = due;
                  return {
                    id: j.id,
                    label: `${j.id} · ${j.name}`,
                    start,
                    end: due,
                    progress: j.progress ?? 0,
                    color: STAGE_COLOR[j._stageId] ?? 'var(--mw-mirage)',
                    meta: { customer: j.customer, stage: j._stageId, value: j.value },
                  };
                });
                const startDate = addDays(minStart, -1);
                const endDate = addDays(maxEnd, 2);
                return (
                  <GanttChartViz
                    tasks={tasks}
                    startDate={startDate}
                    endDate={endDate}
                    today={today}
                    onTaskClick={(t) => navigate(`/plan/jobs/${t.id}`)}
                  />
                );
              })()}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
