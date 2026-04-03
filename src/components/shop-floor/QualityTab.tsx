import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  Search, 
  Filter, 
  Plus, 
  X, 
  ChevronRight, 
  Camera, 
  Barcode, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { StatusBadge } from '@/components/shared/data/StatusBadge';

// --- Types & Mock Data ---

type Tab = 'overview' | 'active-issues' | 'inspections' | 'reports';

const QUALITY_HOLDS = [
  {
    id: 'QH-2024-089',
    wo: 'MO-26-401',
    part: 'Chassis Side Panel L',
    issue: 'Dimensional Variance',
    time: 'Held 2 hours ago',
    severity: 'critical'
  },
  {
    id: 'QH-2024-090',
    wo: 'MO-26-402',
    part: 'Enclosure Frame A',
    issue: 'Surface Finish',
    time: 'Held 4 hours ago',
    severity: 'high'
  },
  {
    id: 'QH-2024-091',
    wo: 'MO-26-403',
    part: 'Bus Bar Connector',
    issue: 'Material Defect',
    time: 'Held 5 hours ago',
    severity: 'medium'
  }
];

const RECENT_INSPECTIONS = [
  {
    id: 'INSP-001',
    wo: 'MO-26-401',
    part: 'Chassis Base Plate',
    inspector: 'Elena Rodriguez',
    machine: 'Amada Ensis Laser',
    time: '10 min ago',
    status: 'passed'
  },
  {
    id: 'INSP-002',
    wo: 'MO-26-402',
    part: 'Frame Rail Top',
    inspector: 'Carlos Gomez',
    machine: 'Miller Tig Weld 3',
    time: '25 min ago',
    status: 'failed'
  },
  {
    id: 'INSP-003',
    wo: 'MO-26-401',
    part: 'Control Box Housing',
    inspector: 'Elena Rodriguez',
    machine: 'Amada Ensis Laser',
    time: '45 min ago',
    status: 'passed'
  },
  {
    id: 'INSP-004',
    wo: 'MO-26-402',
    part: 'Mounting Plate',
    inspector: 'David Miller',
    machine: 'Mitsubishi 3015',
    time: '1 hour ago',
    status: 'passed'
  }
];

const ACTIVE_ISSUES = [
  {
    id: 'QI-2024-047',
    title: 'Dimensional tolerance exceeded on laser cut parts',
    priority: 'critical',
    time: '2h ago',
    wo: 'MO-26-401',
    part: 'Chassis Side Panel L',
    machine: 'Amada Ensis Laser',
    reporter: 'David Miller',
    status: 'Under Investigation',
    assignee: 'Elena Rodriguez'
  },
  {
    id: 'QI-2024-046',
    title: 'Powder coat adhesion failure on batch #405',
    priority: 'high',
    time: '4h ago',
    wo: 'MO-26-405',
    part: 'Cover Panel',
    machine: 'Powder Coat Line 1',
    reporter: 'Carlos Gomez',
    status: 'Analysis Pending',
    assignee: 'Tom Wilson'
  },
  {
    id: 'QI-2024-045',
    title: 'Minor scratch on finished surface',
    priority: 'minor',
    time: '6h ago',
    wo: 'MO-26-403',
    part: 'Display Bezel',
    machine: 'Assembly Station 4',
    reporter: 'Lisa Ray',
    status: 'Monitoring',
    assignee: 'Unassigned'
  }
];

const INSPECTION_TEMPLATES = [
  { title: 'First Article Inspection (FAI)', desc: 'Verify first part meets specifications', icon: FileText },
  { title: 'In-Process Check', desc: 'Routine quality check during production', icon: ClipboardCheck },
  { title: 'Final Inspection', desc: 'Final verification before shipping', icon: CheckCircle2 },
  { title: 'Material Receiving', desc: 'Inspect incoming raw materials', icon: AlertCircle },
  { title: 'Dimensional Verification', desc: 'Detailed measurement log', icon: BarChart3 },
  { title: 'Visual Inspection', desc: 'Cosmetic surface finish check', icon: AlertTriangle },
];

const REPORTS = [
  { title: 'Scrap Analysis', desc: 'View scrap by machine, reason, and cost', updated: 'Updated 1 hour ago' },
  { title: 'Quality Metrics', desc: 'Pass/fail rates and first pass yield', updated: 'Updated 3 hours ago' },
  { title: 'NCR Summary', desc: 'Non-conformance reports by type', updated: 'Updated yesterday' },
  { title: 'Defect Pareto', desc: 'Most common defect types and costs', updated: 'Updated yesterday' },
  { title: 'Inspection History', desc: 'All inspections by date range', updated: 'Updated 2 days ago' },
  { title: 'Material Cert Tracking', desc: 'Material certifications on file', updated: 'Updated 1 week ago' },
];

// --- Components ---


const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    critical: "bg-[var(--mw-error-light)] text-[var(--mw-error)] border-[var(--mw-error)]/20",
    high: "bg-[var(--mw-warning-light)] text-[var(--mw-yellow-800)] border-[var(--mw-warning)]/20",
    medium: "bg-[var(--mw-warning-light)] text-[var(--mw-warning)] border-[var(--mw-warning)]/20",
    minor: "bg-[var(--neutral-100)] text-[var(--neutral-700)] border-[var(--neutral-200)]"
  };
  
  return (
    <Badge variant="outline" className={cn("border-0 font-medium capitalize", styles[priority as keyof typeof styles])}>
      {priority}
    </Badge>
  );
};

// --- Main Component ---

export function QualityTab() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showLogModal, setShowLogModal] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--neutral-100)] p-4 md:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-medium text-[var(--neutral-800)] tracking-tight">Quality</h1>
          <p className="text-[var(--neutral-500)] mt-1 text-sm">Track inspections, defects, and quality metrics</p>
        </div>
        <Button 
          onClick={() => setShowLogModal(true)}
          className="h-12 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] font-medium rounded-xl px-6 shadow-sm border border-[var(--mw-yellow-400)]/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Log Issue
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 border-b border-[var(--neutral-200)] mb-8 overflow-x-auto flex-shrink-0">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'active-issues', label: 'Active Issues' },
          { id: 'inspections', label: 'Inspections' },
          { id: 'reports', label: 'Reports' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "h-10 px-6 text-sm font-medium transition-all relative whitespace-nowrap",
              activeTab === tab.id 
                ? "text-[var(--neutral-800)]" 
                : "text-[var(--neutral-500)] hover:text-[var(--neutral-800)]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--mw-yellow-400)] rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in-50 duration-[250ms] pb-12">
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Card className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]">
              <div className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-3">Quality Score</div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[var(--neutral-800)] tracking-tight">98.2%</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[var(--mw-success)]">
                <ArrowUpRight className="w-4 h-4" />
                <span>1.2% this week</span>
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]">
              <div className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-3">Active Issues</div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[var(--neutral-800)] tracking-tight">7</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-[var(--mw-error)] font-medium">3 Critical</span>
                <span className="text-[var(--neutral-500)]">4 Minor</span>
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]">
              <div className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-3">This Week</div>
              <div className="space-y-1">
                <div className="text-base font-medium text-[var(--neutral-800)]">156 Inspections Passed</div>
                <div className="text-sm text-[var(--neutral-500)]">4 Failed</div>
                <div className="text-sm font-medium text-[var(--mw-success)] mt-1">97.5% Pass Rate</div>
              </div>
            </Card>
          </div>

          {/* Quality Holds */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-[var(--neutral-800)]">Quality Holds</h3>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 hide-scrollbar">
              {QUALITY_HOLDS.map((hold) => (
                <div key={hold.id} className="flex-shrink-0 w-[320px] bg-card rounded-[var(--shape-lg)] shadow-xs border border-[var(--neutral-200)] p-6">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-base font-bold text-[var(--neutral-800)]">{hold.wo}</span>
                     <span className="text-xs text-[var(--neutral-500)]">{hold.time}</span>
                   </div>
                   <div className="text-sm text-[var(--neutral-500)] mb-3">{hold.part}</div>
                   <Badge variant="secondary" className="bg-[var(--mw-error)]/10 text-[var(--mw-error)] hover:bg-[var(--mw-error)]/20 border-0 mb-4 font-medium">
                     {hold.issue}
                   </Badge>
                   <Button variant="outline" className="w-full h-10 border-[var(--neutral-200)] text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]">
                     Review Hold
                   </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Inspections & Scrap/Rework Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Recent Inspections */}
            <div className="xl:col-span-2">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-[var(--neutral-800)]">Recent Inspections</h3>
                  <div className="flex bg-[var(--neutral-200)]/30 p-1 rounded-[var(--shape-lg)]">
                    {['Today', 'This Week', 'Month'].map((filter, i) => (
                      <button key={filter} className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                        i === 0 ? "bg-card text-[var(--neutral-800)] shadow-sm" : "text-[var(--neutral-500)] hover:text-[var(--neutral-800)]"
                      )}>{filter}</button>
                    ))}
                  </div>
               </div>
               <div className="bg-card rounded-[var(--shape-lg)] border border-[var(--neutral-200)] shadow-sm overflow-hidden">
                 {RECENT_INSPECTIONS.map((insp, i) => (
                   <div key={insp.id} className={cn(
                     "flex items-center justify-between p-4 hover:bg-[var(--neutral-100)] transition-colors cursor-pointer",
                     i !== RECENT_INSPECTIONS.length - 1 && "border-b border-[var(--neutral-200)]"
                   )}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--neutral-800)]">{insp.wo}</span>
                          <span className="text-sm text-[var(--neutral-500)]">• {insp.part}</span>
                        </div>
                        <div className="text-xs text-[var(--neutral-500)] flex items-center gap-1">
                          <span className="font-medium">{insp.inspector}</span>
                          <span className="text-[var(--neutral-200)]">|</span>
                          <span>{insp.machine}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-[var(--neutral-500)]">{insp.time}</div>
                        {insp.status === 'passed' ? (
                          <StatusBadge variant="success" withDot>Passed</StatusBadge>
                        ) : (
                          <StatusBadge variant="error" withDot>Failed</StatusBadge>
                        )}
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Scrap & Rework */}
            <div className="space-y-6">
               {/* Scrap */}
               <Card className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]">
                 <div className="flex justify-between items-start mb-4">
                   <h4 className="text-base font-medium text-[var(--neutral-800)]">Scrap</h4>
                   <Badge variant="outline" className="border-[var(--mw-error)]/20 text-[var(--mw-error)] bg-[var(--mw-error-light)] text-xs">High</Badge>
                 </div>
                 <div className="text-3xl font-bold text-[var(--neutral-800)] tabular-nums mb-1">$1,240</div>
                 <div className="text-sm text-[var(--neutral-500)] mb-3">18 parts scrapped</div>
                 <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--mw-error)] mb-6">
                    <ArrowUpRight className="w-4 h-4" />
                    $340 vs last week
                 </div>
                 {/* Simple Bar Chart */}
                 <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5">
                   <div className="h-full bg-[var(--neutral-800)] w-[60%]" />
                   <div className="h-full bg-[var(--neutral-400)] w-[25%]" />
                   <div className="h-full bg-[var(--neutral-200)] w-[15%]" />
                 </div>
                 <div className="flex justify-between mt-2 text-[10px] text-[var(--neutral-500)]">
                    <span>Material</span>
                    <span>Operator</span>
                    <span>Machine</span>
                 </div>
               </Card>

               {/* Rework */}
               <Card className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]">
                 <div className="flex justify-between items-start mb-4">
                   <h4 className="text-base font-medium text-[var(--neutral-800)]">Rework</h4>
                 </div>
                 <div className="text-3xl font-bold text-[var(--neutral-800)] tabular-nums mb-1">$620</div>
                 <div className="text-sm text-[var(--neutral-500)] mb-3">9 parts reworked</div>
                 <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--mw-success)] mb-6">
                    <ArrowDownRight className="w-4 h-4" />
                    $180 vs last week
                 </div>
                 <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5">
                   <div className="h-full bg-[var(--neutral-800)] w-[40%]" />
                   <div className="h-full bg-[var(--neutral-400)] w-[40%]" />
                   <div className="h-full bg-[var(--neutral-200)] w-[20%]" />
                 </div>
               </Card>
            </div>
          </div>
        </div>
      )}

      {/* Active Issues Tab */}
      {activeTab === 'active-issues' && (
        <div className="space-y-6 animate-in fade-in-50 duration-[250ms] pb-12">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
             <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
                <Input placeholder="Search issues..." className="pl-9 bg-card border-[var(--neutral-200)] h-10" />
             </div>
             <Button variant="outline" className="h-10 border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"><Filter className="w-4 h-4 mr-2"/> Status</Button>
             <Button variant="outline" className="h-10 border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"><Filter className="w-4 h-4 mr-2"/> Priority</Button>
             <Button className="h-10 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] font-medium border border-[var(--mw-yellow-400)]/20">
               <Plus className="w-4 h-4 mr-2"/> Log New Issue
             </Button>
          </div>

          <div className="space-y-4">
            {ACTIVE_ISSUES.map((issue) => (
              <div key={issue.id} className={cn(
                "bg-card rounded-[var(--shape-lg)] shadow-sm border border-[var(--neutral-200)] p-6",
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                   <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-[var(--neutral-800)]">{issue.id}</span>
                      <PriorityBadge priority={issue.priority} />
                      <span className="text-xs text-[var(--neutral-500)] flex items-center gap-1"><Clock className="w-4 h-4"/> {issue.time}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-[var(--neutral-100)] text-[var(--neutral-800)] hover:bg-[var(--neutral-100)] font-normal px-3 py-1 rounded-full">
                         {issue.status}
                      </Badge>
                   </div>
                </div>
                
                <h3 className="text-lg font-medium text-[var(--neutral-800)] mb-3">{issue.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-[var(--neutral-500)] mb-6">
                   <div><span className="text-[var(--neutral-400)] text-xs uppercase tracking-wider block mb-1">Work Order</span>{issue.wo}</div>
                   <div><span className="text-[var(--neutral-400)] text-xs uppercase tracking-wider block mb-1">Part</span>{issue.part}</div>
                   <div><span className="text-[var(--neutral-400)] text-xs uppercase tracking-wider block mb-1">Machine</span>{issue.machine}</div>
                   <div><span className="text-[var(--neutral-400)] text-xs uppercase tracking-wider block mb-1">Reported By</span>{issue.reporter}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--neutral-200)]">
                   <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-[var(--neutral-200)]"><AvatarFallback className="text-[10px]">ER</AvatarFallback></Avatar>
                      <span className="text-xs font-medium text-[var(--neutral-800)]">{issue.assignee}</span>
                   </div>
                   <Button variant="ghost" className="h-14 text-[var(--neutral-800)] hover:text-foreground p-0 hover:bg-transparent font-medium">
                     View Details <ChevronRight className="w-4 h-4 ml-1" />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <div className="space-y-8 animate-in fade-in-50 duration-[250ms] pb-12">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
             {['All Types', 'First Article', 'In-Process', 'Final', 'Receiving'].map((type, i) => (
                <button key={type} className={cn(
                   "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                   i === 1 ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] border-[var(--mw-yellow-400)]" : "bg-card text-[var(--neutral-500)] border-[var(--neutral-200)] hover:text-[var(--neutral-800)]"
                )}>
                   {type}
                </button>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {INSPECTION_TEMPLATES.map((tpl, i) => (
               <Card key={i} className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)] hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--neutral-100)] flex items-center justify-center mb-4 group-hover:bg-[var(--mw-yellow-400)]/20 transition-colors">
                     <tpl.icon className="w-6 h-6 text-[var(--neutral-800)]" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--neutral-800)] mb-2">{tpl.title}</h3>
                  <p className="text-sm text-[var(--neutral-500)] mb-6 min-h-[40px]">{tpl.desc}</p>
                  <Button variant="outline" className="w-full border-[var(--neutral-200)] text-[var(--neutral-800)] font-medium h-11 hover:bg-[var(--neutral-100)]">Start Inspection</Button>
               </Card>
             ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-[250ms] pb-12">
           {REPORTS.map((report, i) => (
              <Card key={i} className="p-6 border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-10 h-10 rounded-[var(--shape-lg)] bg-[var(--neutral-100)] flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-[var(--neutral-500)]" />
                     </div>
                     <Button variant="ghost" size="icon" className="h-14 w-14 text-[var(--neutral-500)]"><MoreHorizontal className="w-4 h-4"/></Button>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--neutral-800)] mb-1">{report.title}</h3>
                  <p className="text-sm text-[var(--neutral-500)] mb-4">{report.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--neutral-200)]">
                     <span className="text-xs text-[var(--neutral-400)]">{report.updated}</span>
                     <Button variant="outline" size="sm" className="h-9 border-[var(--neutral-200)] text-[var(--neutral-800)]">View Report</Button>
                  </div>
              </Card>
           ))}
        </div>
      )}

      {/* Log Issue Modal Overlay */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-card rounded-[var(--shape-lg)] shadow-xs w-full max-w-[600px] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[var(--neutral-200)] flex items-center justify-between bg-card">
                 <h2 className="text-xl font-medium text-[var(--neutral-800)]">Log Quality Issue</h2>
                 <Button variant="ghost" size="icon" onClick={() => setShowLogModal(false)} className="rounded-full text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]">
                    <X className="w-5 h-5" />
                 </Button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                 {/* Issue Type */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--neutral-800)]">Issue Type <span className="text-[var(--mw-error)]">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                       {['Material Defect', 'Dimensional', 'Surface Finish', 'Equipment Failure'].map(type => (
                          <button key={type} className="h-12 border border-[var(--neutral-200)] rounded-[var(--shape-lg)] text-sm font-medium text-[var(--neutral-800)] hover:bg-[var(--neutral-100)] hover:border-[var(--neutral-800)] transition-colors focus:ring-2 focus:ring-[var(--mw-yellow-400)] focus:border-transparent outline-none">
                             {type}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Priority */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--neutral-800)]">Priority <span className="text-[var(--mw-error)]">*</span></label>
                    <div className="flex gap-4">
                       {[
                         { label: 'Critical', desc: 'Stop Production', color: 'border-[var(--mw-error)]/20 bg-[var(--mw-error-light)] text-[var(--mw-error)]' },
                         { label: 'High', desc: 'Affects Delivery', color: 'border-[var(--mw-warning)]/20 bg-[var(--mw-warning-light)] text-[var(--mw-yellow-800)]' },
                         { label: 'Minor', desc: 'Continue w/ Caution', color: 'border-[var(--neutral-200)] bg-[var(--neutral-50)] text-[var(--neutral-700)]' }
                       ].map(p => (
                          <div key={p.label} className={cn("flex-1 p-3 rounded-[var(--shape-lg)] border cursor-pointer hover:opacity-80 transition-opacity", p.color)}>
                             <div className="font-medium text-sm">{p.label}</div>
                             <div className="text-[10px] opacity-80">{p.desc}</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Work Order */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--neutral-800)]">Work Order / Asset</label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
                          <Input placeholder="Search work order or asset..." className="pl-9" />
                       </div>
                       <Button variant="outline" size="icon" className="w-10 h-10 flex-shrink-0">
                          <Barcode className="w-5 h-5 text-[var(--neutral-500)]" />
                       </Button>
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--neutral-800)]">Description <span className="text-[var(--mw-error)]">*</span></label>
                    <Textarea
                      className="w-full min-h-[100px] p-3 rounded-[var(--shape-lg)] border border-[var(--neutral-200)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mw-yellow-400)] resize-none"
                      placeholder="Describe what happened..."
                    />
                 </div>

                 {/* Photo Evidence */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--neutral-800)]">Photo Evidence</label>
                    <div className="flex gap-3">
                       <Button variant="outline" className="h-20 w-20 flex flex-col items-center justify-center gap-2 border-dashed border-2">
                          <Camera className="w-6 h-6 text-[var(--neutral-500)]" />
                          <span className="text-[10px] text-[var(--neutral-500)]">Add Photo</span>
                       </Button>
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-[var(--neutral-200)] bg-[var(--neutral-100)] flex items-center justify-between gap-4">
                 <Button variant="outline" onClick={() => setShowLogModal(false)} className="flex-1 h-12 bg-card border-[var(--neutral-200)] text-[var(--neutral-500)] font-medium hover:text-[var(--neutral-800)]">
                    Cancel
                 </Button>
                 <Button className="flex-1 h-12 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] font-medium border border-[var(--mw-yellow-400)]/20">
                    Log Issue Only
                 </Button>
                 <Button className="flex-1 h-12 bg-[var(--mw-error)] hover:bg-[var(--mw-error-600)] text-white font-medium shadow-sm">
                    Create Hold
                 </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
