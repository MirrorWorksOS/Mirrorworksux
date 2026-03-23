import React, { useState } from 'react';
import { Search, Plus, LayoutGrid, List, KanbanSquare, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { PlanJobDetail } from './PlanJobDetail';

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

const priorityColors = {
  low: 'bg-[#FFCF4B] text-white',
  medium: 'bg-[#FFCF4B] text-[#2C2C2C]',
  high: 'bg-[#FF8B00] text-white',
  urgent: 'bg-[#EF4444] text-white'
};

export function PlanJobs() {
  const [viewMode, setViewMode]         = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Show job detail when a job is selected
  if (selectedJobId) {
    return <PlanJobDetail onBack={() => setSelectedJobId(null)} />;
  }

  const JobCard = ({ job }: { job: Job }) => (
    <div
      onClick={() => setSelectedJobId(job.id)}
      className="bg-white border border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-['Roboto_Mono',monospace] text-[14px] font-bold text-[#1A2732]">
          {job.id}
        </span>
        <Avatar className="w-8 h-8 border border-[var(--border)]">
          <AvatarImage src={job.assignedUser.avatar} />
          <AvatarFallback>{job.assignedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </div>
      
      <h3 className=" text-[15px] font-medium text-[#1A2732] mb-1">
        {job.name}
      </h3>
      
      <p className=" text-[13px] text-[#737373] mb-3 line-clamp-2">
        {job.description}
      </p>
      
      {job.priority && (
        <Badge className={cn('mb-2 text-xs rounded px-2 py-0.5', priorityColors[job.priority])}>
          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
        </Badge>
      )}
      
      <div className="flex items-center justify-between text-[13px]">
        <span className=" text-[#737373]">
          {job.quoteCount} {job.quoteCount === 1 ? 'Quote' : 'Quotes'}
        </span>
        <span className=" font-medium text-[#1A2732]">
          ${job.value.toLocaleString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by ID, name, customer..."
                className="pl-9 bg-[#F5F5F5] border-transparent focus:bg-white"
              />
            </div>
            <Button variant="outline" className="border-[var(--border)] text-[#1A2732]">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[var(--border)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'kanban' ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'
                )}
              >
                <KanbanSquare className="w-4 h-4 text-[#1A2732]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'list' ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'
                )}
              >
                <List className="w-4 h-4 text-[#1A2732]" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'card' ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'
                )}
              >
                <LayoutGrid className="w-4 h-4 text-[#1A2732]" />
              </button>
            </div>
            
            <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </div>
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
                      <h3 className=" text-[14px] font-medium text-[#1A2732]">
                        {stage.label}
                      </h3>
                      <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                        {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                      </Badge>
                    </div>
                    <p className=" text-[12px] text-[#737373]">
                      {stage.description}
                    </p>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pb-4">
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
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F5F5F5] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Job ID</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Job Name</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Customer</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Stage</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Priority</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Value</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Due Date</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Assigned</th>
                  <th className="text-left px-4 py-3  text-[13px] font-medium text-[#1A2732]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MOCK_JOBS).flatMap(([stageId, jobs]) =>
                  jobs.map((job) => {
                    const stage = STAGES.find(s => s.id === stageId);
                    return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className="border-b border-[var(--border)] hover:bg-[var(--accent)] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-['Roboto_Mono',monospace] text-[13px] text-[#1A2732]">
                          {job.id}
                        </td>
                        <td className="px-4 py-3  text-[13px] text-[#1A2732]">
                          {job.name}
                        </td>
                        <td className="px-4 py-3  text-[13px] text-[#737373]">
                          {job.customer}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#1A2732] text-xs">
                            {stage?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {job.priority && (
                            <Badge className={cn('text-xs rounded px-2 py-0.5', priorityColors[job.priority])}>
                              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3  text-[13px] text-[#1A2732]">
                          ${job.value.toLocaleString()}
                        </td>
                        <td className="px-4 py-3  text-[13px] text-[#737373]">
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
                            <div className="flex-1 h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#FFCF4B] transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className=" text-[12px] text-[#737373] w-10 text-right">
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
    </div>
  );
}