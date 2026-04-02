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
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { toast } from 'sonner';

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

const MOCK_JOBS: Record<string, Job[]> = {
  backlog: [
    {
      id: 'MW001',
      name: 'Server Rack Chassis',
      description: 'Custom sheet metal enclosure for data center deployment',
      quoteCount: 1,
      value: 77030,
      assignedUser: { name: 'David Miller', avatar: 'https://i.pravatar.cc/150?img=12' },
      customer: 'TechCorp Industries',
      priority: 'high',
      dueDate: '2026-04-15',
      progress: 0
    },
    {
      id: 'MW002',
      name: 'Laser Cut Panels',
      description: 'Precision aluminum panels for aerospace application',
      quoteCount: 0,
      value: 12500,
      assignedUser: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=5' },
      customer: 'AeroSpace Ltd',
      priority: 'medium',
      dueDate: '2026-04-20',
      progress: 0
    }
  ],
  planning: [
    {
      id: 'MW003',
      name: 'Press Brake Assembly',
      description: 'Multi-bend bracket assembly with powder coating',
      quoteCount: 1,
      value: 24800,
      assignedUser: { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=8' },
      customer: 'Industrial Solutions',
      priority: 'urgent',
      dueDate: '2026-04-10',
      progress: 15
    }
  ],
  materials: [
    {
      id: 'MW004',
      name: 'Turret Punch Parts',
      description: 'High-volume punched components for HVAC units',
      quoteCount: 1,
      value: 45200,
      assignedUser: { name: 'Elena Rodriguez', avatar: 'https://i.pravatar.cc/150?img=9' },
      customer: 'Climate Systems',
      priority: 'medium',
      dueDate: '2026-04-25',
      progress: 30
    }
  ],
  scheduled: [
    {
      id: 'MW005',
      name: 'Welded Frame Assembly',
      description: 'Structural steel frame with MIG welding',
      quoteCount: 1,
      value: 89500,
      assignedUser: { name: 'James Lee', avatar: 'https://i.pravatar.cc/150?img=11' },
      customer: 'Construction Pro',
      priority: 'high',
      dueDate: '2026-04-18',
      progress: 45
    },
    {
      id: 'MW006',
      name: 'CNC Machined Brackets',
      description: 'Precision machined mounting brackets',
      quoteCount: 2,
      value: 18900,
      assignedUser: { name: 'Lisa Wong', avatar: 'https://i.pravatar.cc/150?img=10' },
      customer: 'AutoTech',
      priority: 'low',
      dueDate: '2026-05-01',
      progress: 60
    }
  ],
  inProduction: [
    {
      id: 'MW007',
      name: 'Manifold Block',
      description: 'Complex hydraulic manifold with multiple ports',
      quoteCount: 1,
      value: 156000,
      assignedUser: { name: 'Robert Kim', avatar: 'https://i.pravatar.cc/150?img=13' },
      customer: 'Hydraulics Co',
      priority: 'urgent',
      dueDate: '2026-04-08',
      progress: 75
    }
  ],
  reviewClose: [
    {
      id: 'MW008',
      name: 'Sheet Metal Enclosure',
      description: 'Electrical cabinet with powder coat finish',
      quoteCount: 1,
      value: 32400,
      assignedUser: { name: 'Anna Martinez', avatar: 'https://i.pravatar.cc/150?img=6' },
      customer: 'ElectroCorp',
      priority: 'medium',
      dueDate: '2026-04-05',
      progress: 95
    }
  ]
};

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
        <span className="tabular-nums text-sm font-medium text-[var(--mw-mirage)]">
          {job.id}
        </span>
        <Avatar className="w-8 h-8 border border-[var(--border)]">
          <AvatarImage src={job.assignedUser.avatar} />
          <AvatarFallback>{job.assignedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </div>

      <h3 className="text-sm font-medium text-[var(--mw-mirage)] mb-1">
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
        <span className="font-medium tabular-nums text-[var(--mw-mirage)]">
          ${job.value.toLocaleString()}
        </span>
      </div>
    </div>
  );

  return (
    <PageShell className="p-0 space-y-0 flex flex-col h-full bg-[var(--neutral-100)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4 space-y-4">
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
          { key: 'id', header: 'Job ID', className: 'tabular-nums text-xs font-medium text-[var(--mw-mirage)]', cell: (job) => job.id },
          { key: 'name', header: 'Job Name', className: 'text-xs text-[var(--mw-mirage)]', cell: (job) => job.name },
          { key: 'customer', header: 'Customer', className: 'text-xs text-[var(--neutral-500)]', cell: (job) => job.customer },
          {
            key: 'stage',
            header: 'Stage',
            cell: (job) => {
              const stage = STAGES.find(s => s.id === job._stageId);
              return <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--mw-mirage)] text-xs">{stage?.label}</Badge>;
            },
          },
          { key: 'priority', header: 'Priority', cell: (job) => job.priority ? <StatusBadge priority={job.priority} /> : null },
          { key: 'value', header: 'Value', className: 'tabular-nums text-xs text-[var(--mw-mirage)]', cell: (job) => `$${job.value.toLocaleString()}` },
          { key: 'dueDate', header: 'Due Date', className: 'text-xs text-[var(--neutral-500)]', cell: (job) => job.dueDate },
          {
            key: 'assigned',
            header: 'Assigned',
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
            cell: (job) => (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--mw-yellow-400)] transition-all" style={{ width: `${job.progress}%` }} />
                </div>
                <span className="text-xs tabular-nums text-[var(--neutral-500)] w-10 text-right">{job.progress}%</span>
              </div>
            ),
          },
        ];
        return (
          <div className="flex-1 overflow-auto p-6">
            <MwDataTable
              columns={listColumns}
              data={flatJobs}
              keyExtractor={(job) => job.id}
              onRowClick={(job) => navigate(`/plan/jobs/${job.id}`)}
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