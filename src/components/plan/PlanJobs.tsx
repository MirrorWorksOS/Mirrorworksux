import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, LayoutGrid, List, KanbanSquare, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { toast } from 'sonner';

// remove unused PlanJobsProps interface
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

  const JobCard = ({ job }: { job: Job }) => (
    <div
      onClick={() => navigate(`/plan/jobs/${job.id}`)}
      className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-4 cursor-pointer hover:shadow-md transition-shadow"
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
      
      <h3 className=" text-sm font-medium text-[var(--mw-mirage)] mb-1">
        {job.name}
      </h3>
      
      <p className=" text-xs text-[var(--neutral-500)] mb-3 line-clamp-2">
        {job.description}
      </p>
      
      {job.priority && (
        <StatusBadge priority={job.priority} className="mb-2" />
      )}
      
      <div className="flex items-center justify-between text-xs">
        <span className=" text-[var(--neutral-500)]">
          {job.quoteCount} {job.quoteCount === 1 ? 'Quote' : 'Quotes'}
        </span>
        <span className=" font-medium tabular-nums text-[var(--mw-mirage)]">
          ${job.value.toLocaleString()}
        </span>
      </div>
    </div>
  );

  return (
    <PageShell className="p-0 space-y-0 flex flex-col h-full bg-[var(--neutral-100)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4 space-y-4">
        <PageHeader
          title="Jobs"
          actions={
            <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] font-medium" onClick={() => toast('New job form coming soon')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          }
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by ID, name, customer..."
                className="pl-9 bg-[var(--neutral-100)] border-transparent focus:bg-white"
              />
            </div>
            <Button variant="outline" className="border-[var(--border)] text-[var(--mw-mirage)]" onClick={() => toast('Filter panel coming soon')}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <IconViewToggle
            value={viewMode}
            onChange={(k) => setViewMode(k as ViewMode)}
            options={[
              { key: 'kanban', icon: KanbanSquare, label: 'Kanban view' },
              { key: 'list', icon: List, label: 'List view' },
              { key: 'card', icon: LayoutGrid, label: 'Card view' },
            ]}
          />
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-4 h-full min-w-max">
            {STAGES.map((stage) => {
              const jobs = MOCK_JOBS[stage.id] || [];
              return (
                <div key={stage.id} className="flex flex-col w-[320px] flex-shrink-0">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className=" text-sm font-medium text-[var(--mw-mirage)]">
                        {stage.label}
                      </h3>
                      <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                        {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                      </Badge>
                    </div>
                    <p className=" text-xs text-[var(--neutral-500)]">
                      {stage.description}
                    </p>
                  </div>
                  
                  <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Job ID</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Job Name</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Customer</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Stage</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Priority</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Value</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Due Date</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Assigned</th>
                  <th className="text-left px-4 py-3  text-xs font-medium text-[var(--mw-mirage)]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MOCK_JOBS).flatMap(([stageId, jobs]) =>
                  jobs.map((job) => {
                    const stage = STAGES.find(s => s.id === stageId);
                    return (
                      <tr
                        key={job.id}
                        onClick={() => navigate(`/plan/jobs/${job.id}`)}
                        className="border-b border-[var(--border)] hover:bg-[var(--accent)] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 tabular-nums text-xs font-medium text-[var(--mw-mirage)]">
                          {job.id}
                        </td>
                        <td className="px-4 py-3  text-xs text-[var(--mw-mirage)]">
                          {job.name}
                        </td>
                        <td className="px-4 py-3  text-xs text-[var(--neutral-500)]">
                          {job.customer}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--mw-mirage)] text-xs">
                            {stage?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {job.priority && (
                            <StatusBadge priority={job.priority} />
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-xs text-[var(--mw-mirage)]">
                          ${job.value.toLocaleString()}
                        </td>
                        <td className="px-4 py-3  text-xs text-[var(--neutral-500)]">
                          {job.dueDate}
                        </td>
                        <td className="px-4 py-3">
                          <Avatar className="w-6 h-6 border border-[var(--border)]">
                            <AvatarImage src={job.assignedUser.avatar} />
                            <AvatarFallback className="text-xs">
                              {job.assignedUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--mw-yellow-400)] transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className=" text-xs tabular-nums text-[var(--neutral-500)] w-10 text-right">
                              {job.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(MOCK_JOBS).flat().map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}