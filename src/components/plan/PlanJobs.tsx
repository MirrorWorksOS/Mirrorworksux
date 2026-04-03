import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LayoutGrid, List, KanbanSquare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { toast } from 'sonner';
import { jobs, employees, quotes } from '@/services/mock';

const KANBAN_ITEM_TYPE = 'plan-job';

type ViewMode = 'kanban' | 'list' | 'card';

interface Job {
  id: string;
  name: string;
  description: string;
  quoteCount: number;
  value: number;
  assignedUser: {
    name: string;
    avatar?: string;
  };
  customer?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  progress?: number;
}

const STATUS_TO_STAGE: Record<string, string> = {
  draft: 'backlog',
  planned: 'scheduled',
  in_progress: 'inProduction',
  completed: 'reviewClose',
};

const EXTRA_KANBAN_JOBS: { stage: string; job: Job }[] = [
  { stage: 'backlog', job: { id: 'MW-EXT-01', name: 'Laser Cut Panels', description: 'Precision aluminum panels for aerospace application', quoteCount: 0, value: 12500, assignedUser: { name: 'Sarah Chen' }, customer: 'AeroSpace Ltd', priority: 'medium', dueDate: '2026-04-20', progress: 0 } },
  { stage: 'planning', job: { id: 'MW-EXT-02', name: 'Press Brake Assembly', description: 'Multi-bend bracket assembly with powder coating', quoteCount: 1, value: 24800, assignedUser: { name: 'James Murray' }, customer: 'Industrial Solutions', priority: 'urgent', dueDate: '2026-04-10', progress: 15 } },
  { stage: 'materials', job: { id: 'MW-EXT-03', name: 'Turret Punch Parts', description: 'High-volume punched components for HVAC units', quoteCount: 1, value: 45200, assignedUser: { name: 'Emma Wilson' }, customer: 'Climate Systems', priority: 'medium', dueDate: '2026-04-25', progress: 30 } },
];

const buildKanbanJobs = (): Record<string, Job[]> => {
  const stages: Record<string, Job[]> = { backlog: [], planning: [], materials: [], scheduled: [], inProduction: [], reviewClose: [] };
  jobs.forEach((j) => {
    const emp = employees.find((e) => e.id === j.assignedTo);
    const quoteCount = quotes.filter((q) => q.customerId === j.customerId).length;
    stages[STATUS_TO_STAGE[j.status] ?? 'backlog'].push({
      id: j.jobNumber,
      name: j.title,
      description: `${j.customerName} — ${j.title}`,
      quoteCount,
      value: j.value,
      assignedUser: { name: emp?.name ?? 'Unassigned' },
      customer: j.customerName,
      priority: j.priority as Job['priority'],
      dueDate: j.dueDate,
      progress: j.progress,
    });
  });
  EXTRA_KANBAN_JOBS.forEach(({ stage, job }) => stages[stage].push(job));
  return stages;
};

const MOCK_JOBS: Record<string, Job[]> = buildKanbanJobs();

const STAGES = [
  { id: 'backlog', label: 'Backlog', description: 'Jobs created but not yet planned' },
  { id: 'planning', label: 'Planning', description: 'BOM review, routing definition, resource allocation' },
  { id: 'materials', label: 'Materials', description: 'Waiting for materials' },
  { id: 'scheduled', label: 'Scheduled', description: 'Fully planned and scheduled' },
  { id: 'inProduction', label: 'In Production', description: 'Active on the shop floor' },
  { id: 'reviewClose', label: 'Review & Close', description: 'Production complete, awaiting QC sign-off' }
];


export function PlanJobs() {
  const navigate = useNavigate();
  const [viewMode, setViewMode]         = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery]   = useState('');
  const [jobsByStage, setJobsByStage]   = useState<Record<string, Job[]>>(MOCK_JOBS);

  const handleKanbanDrop = useCallback((item: KanbanDragItem, columnId: string) => {
    setJobsByStage(prev => {
      let moved: Job | undefined;
      const without: Record<string, Job[]> = {};
      for (const [key, jobs] of Object.entries(prev)) {
        without[key] = jobs.filter(j => {
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
          <AvatarFallback>{job.assignedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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

  return (
    <PageShell className="p-0 space-y-0 flex flex-col h-full bg-[var(--neutral-100)]">
      {/* Toolbar */}
      <div className="bg-card border-b border-[var(--border)] px-6 py-4 space-y-4">
        <PageHeader title="Jobs" />
        <PageToolbar>
          <ToolbarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search jobs…" />
          <ToolbarSpacer />
          <ToolbarFilterButton />
          <IconViewToggle
            value={viewMode}
            onChange={(k) => setViewMode(k as ViewMode)}
            options={[
              { key: 'kanban', icon: KanbanSquare, label: 'Kanban view' },
              { key: 'list', icon: List, label: 'List view' },
              { key: 'card', icon: LayoutGrid, label: 'Card view' },
            ]}
          />
          <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New job form coming soon')}>
            Create Job
          </ToolbarPrimaryButton>
        </PageToolbar>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard className="h-full">
            {STAGES.map((stage) => {
              const jobs = jobsByStage[stage.id] || [];
              return (
                <KanbanColumn
                  key={stage.id}
                  id={stage.id}
                  title={stage.label}
                  description={stage.description}
                  count={jobs.length}
                  accept={KANBAN_ITEM_TYPE}
                  onDrop={handleKanbanDrop}
                  className="min-w-[320px] w-[320px] flex-shrink-0"
                >
                  {jobs.map((job) => (
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

      {/* List View */}
      {viewMode === 'list' && (() => {
        const flatJobs = Object.entries(jobsByStage).flatMap(([stageId, jobs]) =>
          jobs.map((job) => ({ ...job, _stageId: stageId })),
        );
        const listColumns: MwColumnDef<Job & { _stageId: string }>[] = [
          { key: 'id', header: 'Job ID', tooltip: 'Unique job identifier', className: 'tabular-nums text-xs font-medium text-foreground', cell: (job) => job.id },
          { key: 'name', header: 'Job Name', tooltip: 'Job description', className: 'text-xs font-medium text-foreground', cell: (job) => job.name },
          { key: 'customer', header: 'Customer', tooltip: 'Assigned customer', className: 'text-xs text-[var(--neutral-500)]', cell: (job) => job.customer },
          {
            key: 'stage',
            header: 'Stage',
            tooltip: 'Current production stage',
            cell: (job) => {
              const stage = STAGES.find(s => s.id === job._stageId);
              return <StatusBadge variant="neutral">{stage?.label}</StatusBadge>;
            },
          },
          { key: 'priority', header: 'Priority', tooltip: 'Job priority level', cell: (job) => job.priority ? <StatusBadge priority={job.priority} /> : null },
          { key: 'value', header: 'Value', tooltip: 'Estimated job value', headerClassName: 'text-right', className: 'text-right tabular-nums text-xs text-foreground', cell: (job) => `$${job.value.toLocaleString()}` },
          { key: 'dueDate', header: 'Due Date', tooltip: 'Expected completion date', className: 'text-xs tabular-nums text-[var(--neutral-500)]', cell: (job) => job.dueDate },
          {
            key: 'assigned',
            header: 'Assigned',
            tooltip: 'Assigned team member',
            cell: (job) => (
              <Avatar className="w-6 h-6 border border-[var(--border)]">
                <AvatarImage src={job.assignedUser.avatar} />
                <AvatarFallback className="text-xs">{job.assignedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            ),
          },
          {
            key: 'progress',
            header: 'Progress',
            tooltip: 'Completion percentage',
            cell: (job) => (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--mw-yellow-400)] transition-all duration-200 ease-[var(--ease-standard)]" style={{ width: `${job.progress}%` }} />
                </div>
                <span className="text-xs tabular-nums text-[var(--neutral-500)] w-10 text-right">{job.progress}%</span>
              </div>
            ),
          },
        ];
        const countInProduction = flatJobs.filter(j => j._stageId === 'inProduction').length;
        const countScheduled = flatJobs.filter(j => j._stageId === 'scheduled').length;
        const countBacklog = flatJobs.filter(j => j._stageId === 'backlog').length;
        const countOther = flatJobs.length - countInProduction - countScheduled - countBacklog;
        return (
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <ToolbarSummaryBar
              segments={[
                { key: 'inProduction', label: 'In Production', value: countInProduction, color: 'var(--mw-yellow-400)' },
                { key: 'scheduled', label: 'Scheduled', value: countScheduled, color: 'var(--mw-mirage)' },
                { key: 'backlog', label: 'Backlog', value: countBacklog, color: 'var(--neutral-400)' },
                { key: 'other', label: 'Other', value: countOther, color: 'var(--neutral-200)' },
              ]}
              formatValue={(v) => String(v)}
            />
            <MwDataTable
              columns={listColumns}
              data={flatJobs}
              keyExtractor={(job) => job.id}
              onRowClick={(job) => navigate(`/plan/jobs/${job.id}`)}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            />
          </div>
        );
      })()}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(jobsByStage).flat().map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}