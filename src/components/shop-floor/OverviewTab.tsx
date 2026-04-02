import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare,
  FileText,
  ShieldAlert,
  Paperclip,
  Send,
  Play,
  Pause,
  StopCircle,
  MoreHorizontal,
  Bot,
  Zap,
  Info,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from 'sonner';

// --- Mock Data ---

const ACTIVE_JOBS_SUMMARY = {
  customer: "Global Systems",
  moNumber: "MO-26-401",
  dueDate: "2025-12-08T17:00:00",
  priority: "High",
  status: "progress"
};

const TIME_TRACKING_SUMMARY = {
  totalShiftTime: "05:42:18",
  activeOperators: 12,
  efficiency: 87,
  targetComparison: 5 // +5%
};

const ANDON_ALERTS = [
  { id: 1, type: "material", message: "Material Shortage - Amada Ensis Laser", time: "10 min ago", severity: "high" },
  { id: 2, type: "machine", message: "Maintenance Req - Haeger Insert Press", time: "25 min ago", severity: "medium" },
  { id: 3, type: "quality", message: "First Article Inspection", time: "1 hr ago", severity: "low" }
];

const MANUFACTURING_ORDERS = [
  {
    id: "MO-26-401",
    customer: "Global Systems",
    partName: "Server Rack Chassis",
    dueDate: "Dec 8, 2025",
    status: "progress",
    priority: "High",
    progress: 65,
    totalQty: 400,
    completedQty: 260,
    workOrders: [
      { id: "MO-26-401-01", name: "Base Plate", station: "Amada Ensis Laser", status: "completed", progress: 100 },
      { id: "MO-26-401-02", name: "Support Arm", station: "Trumpf TruBend 5000", status: "progress", progress: 45 },
      { id: "MO-26-401-03", name: "Assembly Kit", station: "Assembly", status: "pending", progress: 0 }
    ]
  },
  {
    id: "MO-26-402",
    customer: "TechCorp",
    partName: "Heavy Duty Enclosure",
    dueDate: "Dec 12, 2025",
    status: "pending",
    priority: "Medium",
    progress: 15,
    totalQty: 200,
    completedQty: 30,
    workOrders: [
      { id: "MO-26-402-01", name: "Frame Rails", station: "Mitsubishi 3015", status: "progress", progress: 30 },
      { id: "MO-26-402-02", name: "Weldments", station: "Miller Tig Weld 3", status: "pending", progress: 0 }
    ]
  },
  {
    id: "MO-26-403",
    customer: "Delta Mfg",
    partName: "Control Panel Box",
    dueDate: "Dec 15, 2025",
    status: "hold",
    priority: "Low",
    progress: 0,
    totalQty: 50,
    completedQty: 0,
    workOrders: []
  }
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    progress: "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] border-transparent",
    pending: "bg-[var(--neutral-100)] text-[var(--neutral-800)] border-[var(--neutral-200)]",
    completed: "bg-[var(--mw-green)] text-white border-transparent",
    hold: "bg-[var(--mw-error)] text-white border-transparent"
  };
  
  const labels: Record<string, string> = {
    progress: "In Progress",
    pending: "Pending",
    completed: "Completed",
    hold: "Blocked"
  };

  return (
    <Badge variant="outline" className={`${styles[status] || styles.pending} font-medium px-3 py-1.5 rounded-[20px] border`}>
      {labels[status] || status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  if (priority === 'High') {
    return (
      <span className="text-xs px-3 py-1 rounded-[20px] font-medium bg-[var(--mw-error)] text-white">
        High
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 font-medium text-[var(--neutral-500)]">
      {priority}
    </span>
  );
};

// --- Main Component ---

export function OverviewTab() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);
  const [floorMode, setFloorMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ from: 'user' | 'ai'; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSubmit = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages(prev => [...prev, { from: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        from: 'ai',
        text: 'Based on current shop floor data, all workstations are operating within normal parameters. Machine M-102 shows slightly elevated cycle times — I recommend checking tool wear.'
      }]);
    }, 1200);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Floor Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--neutral-900)]">
          {floorMode ? 'Factory Floor View' : 'Office View'}
        </span>
        <Button
          variant={floorMode ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-14 gap-2",
            floorMode ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]" : "border-[var(--border)]"
          )}
          onClick={() => setFloorMode(!floorMode)}
        >
          <Monitor className="h-4 w-4" />
          {floorMode ? 'Exit Floor Mode' : 'Floor Mode'}
        </Button>
      </div>

      {floorMode ? (
        <div className="p-6 space-y-6 bg-[var(--neutral-900)] rounded-[var(--shape-lg)] flex-1 overflow-auto">
          {/* Large KPI tiles - 2x2 grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[var(--neutral-800)] rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest mb-2">ACTIVE JOBS</p>
              <p className="text-7xl font-bold tabular-nums text-white">4</p>
              <p className="text-lg text-[var(--mw-green)] font-medium mt-2">All on schedule</p>
            </div>
            <div className="bg-[var(--neutral-800)] rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest mb-2">WORK ORDERS</p>
              <p className="text-7xl font-bold tabular-nums text-white">12</p>
              <p className="text-lg text-[var(--mw-yellow-400)] font-medium mt-2">3 in progress</p>
            </div>
            <div className="bg-[var(--neutral-800)] rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest mb-2">OEE</p>
              <p className="text-7xl font-bold tabular-nums text-[var(--mw-green)]">87%</p>
              <p className="text-lg text-[var(--neutral-400)] font-medium mt-2">Target: 85%</p>
            </div>
            <div className="bg-[var(--neutral-800)] rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest mb-2">QUALITY</p>
              <p className="text-7xl font-bold tabular-nums text-[var(--mw-green)]">99.2%</p>
              <p className="text-lg text-[var(--neutral-400)] font-medium mt-2">First pass yield</p>
            </div>
          </div>

          {/* Machine status - large cards */}
          <div>
            <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest mb-4">MACHINES</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Laser-01', status: 'Running', job: 'WO-001', color: 'var(--mw-green)' },
                { name: 'CNC-01', status: 'Running', job: 'WO-002', color: 'var(--mw-green)' },
                { name: 'CNC-02', status: 'Idle', job: '—', color: 'var(--mw-yellow-400)' },
                { name: 'Press-01', status: 'Running', job: 'WO-005', color: 'var(--mw-green)' },
                { name: 'Weld-01', status: 'Maintenance', job: '—', color: 'var(--mw-error)' },
                { name: 'Pack-01', status: 'Idle', job: '—', color: 'var(--mw-yellow-400)' },
              ].map((m) => (
                <div key={m.name} className="bg-[var(--neutral-800)] rounded-xl p-6 flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: m.color }} />
                  <div>
                    <p className="text-lg font-bold text-white">{m.name}</p>
                    <p className="text-sm text-[var(--neutral-400)]">{m.status} {m.job !== '—' ? `· ${m.job}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shift info */}
          <div className="bg-[var(--neutral-800)] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest">CURRENT SHIFT</p>
              <p className="text-2xl font-bold text-white mt-1">Day Shift · 06:00 – 14:00</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-widest">OPERATORS</p>
              <p className="text-2xl font-bold text-white mt-1">6 / 8 active</p>
            </div>
          </div>
        </div>
      ) : (
      <div className="flex gap-6 flex-1">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        
        {/* Intelligence Hub Banner */}
        <div className="bg-white rounded-[var(--shape-lg)] overflow-hidden border border-[var(--border)]">
           <div 
             className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--accent)] transition-colors"
             onClick={() => setIsInsightsOpen(!isInsightsOpen)}
           >
              <div className="flex items-center gap-2 font-medium text-[var(--neutral-800)]">
                 <Bot className="w-5 h-5 text-[var(--mw-yellow-400)]" />
                 <span>AI Insights: <span className="text-[var(--neutral-500)] font-normal">3 new</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--neutral-500)]">
                 {isInsightsOpen ? 'Hide' : 'View All'}
                 <ChevronDown className={`w-4 h-4 transition-transform ${isInsightsOpen ? 'rotate-180' : ''}`} />
              </div>
           </div>
           
           <AnimatePresence>
             {isInsightsOpen && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 transition={{ duration: 0.5, ease: [0.2, 0.0, 0, 1.0] }}
                 className="overflow-hidden"
               >
                 <div className="border-t border-[var(--border)] p-2 space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-sm hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]">
                       <AlertCircle className="w-5 h-5 text-[var(--mw-mirage)] shrink-0" />
                       <div className="text-sm text-[var(--neutral-800)] text-sm">
                          <span className="font-medium">Material shortage:</span> 16ga stainless sheets. 15 needed, 8 in stock. Expedite #PO-8847 with Central Steel.
                       </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-sm hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]">
                       <Zap className="w-5 h-5 text-[var(--mw-mirage)] shrink-0" />
                       <div className="text-sm text-[var(--neutral-800)] text-sm">
                          <span className="font-medium">Optimization:</span> Amada Ensis Laser free in 15 min - Queue MO-26-405 now
                       </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-sm hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]">
                       <Info className="w-5 h-5 text-[var(--mw-mirage)] shrink-0" />
                       <div className="text-sm text-[var(--neutral-800)] text-sm">
                          <span className="font-medium">Efficiency:</span> Shop running 8% above target efficiency today
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutral-500)]" />
            <Input 
              placeholder="Search work orders" 
              className="pl-10 h-12 w-full bg-white text-base shadow-sm border-[var(--neutral-200)] rounded-sm focus-visible:ring-[var(--mw-yellow-400)]"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" className="h-14 px-4 border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-100)] text-[var(--neutral-800)] font-medium rounded-sm">
              Status <ChevronDown className="w-4 h-4 ml-2 text-[var(--neutral-500)]" />
            </Button>
            <Button variant="outline" className="h-14 px-4 border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-100)] text-[var(--neutral-800)] font-medium rounded-sm">
              Priority <ChevronDown className="w-4 h-4 ml-2 text-[var(--neutral-500)]" />
            </Button>
            <Button variant="outline" className="h-14 px-4 border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-100)] text-[var(--neutral-800)] font-medium rounded-sm">
              Machine <ChevronDown className="w-4 h-4 ml-2 text-[var(--neutral-500)]" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
            
            {/* Job Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card A: Active Jobs */}
              <Card className="border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--neutral-500)] uppercase tracking-wide">Active Job Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-lg font-medium text-[var(--neutral-800)] hover:underline hover:text-[var(--mw-yellow-400)] transition-colors cursor-pointer" onClick={() => toast('Customer detail coming soon')}>
                        {ACTIVE_JOBS_SUMMARY.customer}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-normal text-sm text-[var(--neutral-500)]">
                          {ACTIVE_JOBS_SUMMARY.moNumber}
                        </span>
                        <StatusBadge status={ACTIVE_JOBS_SUMMARY.status} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-[var(--shape-lg)] border border-[var(--neutral-200)]">
                      <div className="space-y-1">
                        <div className="text-xs text-[var(--neutral-500)] font-medium">DUE IN</div>
                        <div className="text-2xl font-medium text-[var(--neutral-800)] tabular-nums">4d 12h</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-xs text-[var(--neutral-500)] font-medium">PRIORITY</div>
                        <PriorityBadge priority={ACTIVE_JOBS_SUMMARY.priority} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card B: Time Tracking */}
              <Card className="border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--neutral-500)] uppercase tracking-wide">Shift Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-4xl font-medium text-[var(--neutral-800)] tabular-nums tracking-tight leading-none">
                        {TIME_TRACKING_SUMMARY.totalShiftTime}
                      </div>
                      <div className="text-sm text-[var(--neutral-500)] mt-2">Total Shift Time</div>
                    </div>
                    
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                       {/* Simple SVG Circular Progress */}
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-[var(--neutral-300)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                          <path className="text-[var(--mw-yellow-400)]" strokeDasharray={`${TIME_TRACKING_SUMMARY.efficiency}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                       </svg>
                       <span className="absolute text-[9px] font-bold text-[var(--neutral-800)]">{TIME_TRACKING_SUMMARY.efficiency}%</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-[var(--border)] text-[var(--neutral-500)] text-[10px]">OP</AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] border-2 border-white flex items-center justify-center text-[10px] font-medium text-[var(--neutral-500)]">
                        +8
                      </div>
                    </div>
                    <div className="flex items-center text-[var(--mw-green)] text-sm font-medium">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {TIME_TRACKING_SUMMARY.targetComparison}% vs Target
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card C: Andon Alerts */}
              <Card className="border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)] bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <Badge variant="destructive" className="animate-pulse bg-[var(--mw-error)] text-white border-0 rounded-[20px] px-3">
                    {ANDON_ALERTS.length} Active
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--neutral-500)] uppercase tracking-wide">Andon Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ANDON_ALERTS.slice(0, 2).map(alert => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-sm bg-[var(--neutral-100)] border border-transparent hover:border-[var(--border)] transition-colors">
                        <div className="w-5 h-5 rounded-full bg-[var(--mw-error)] flex items-center justify-center shrink-0 mt-0.5">
                           <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--neutral-800)]">{alert.message}</div>
                          <div className="text-xs text-[var(--neutral-500)] mt-0.5">{alert.time}</div>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-xs font-medium text-[var(--neutral-500)] hover:text-[var(--neutral-800)] h-14">
                      View All Issues <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Manufacturing Orders List */}
            <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--neutral-100)] text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide">
                <div className="col-span-2">MO #</div>
                <div className="col-span-3">Customer & Part</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {MANUFACTURING_ORDERS.map((mo) => (
                  <div key={mo.id} className="group transition-colors bg-white hover:bg-[var(--neutral-100)]">
                    {/* Parent Row */}
                    <div 
                      className="grid grid-cols-12 gap-4 p-4 items-center min-h-[56px] cursor-pointer"
                      onClick={() => toggleRow(mo.id)}
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 text-[var(--neutral-500)] transition-transform duration-200 ${expandedRows[mo.id] ? 'rotate-90' : ''}`} />
                        <span className="font-medium text-[var(--neutral-800)]">{mo.id}</span>
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium text-[var(--neutral-800)] text-sm">{mo.customer}</div>
                        <div className="text-xs text-[var(--neutral-500)] truncate">{mo.partName}</div>
                      </div>
                      <div className="col-span-2 text-sm text-[var(--neutral-500)]">
                        {mo.dueDate}
                      </div>
                      <div className="col-span-2">
                         <StatusBadge status={mo.status} />
                      </div>
                      <div className="col-span-2 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--mw-yellow-400)] rounded-full" style={{ width: `${mo.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-[var(--neutral-500)]">{mo.progress}%</span>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="icon" className="h-14 w-14">
                          <MoreHorizontal className="w-4 h-4 text-[var(--neutral-500)]" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Child Rows (Work Orders) */}
                    {expandedRows[mo.id] && (
                      <div className="bg-[var(--neutral-100)]/30 border-t border-[var(--neutral-200)] shadow-inner">
                        <div className="px-4 py-2 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider pl-12">
                          Work Orders
                        </div>
                        {mo.workOrders.length > 0 ? (
                          mo.workOrders.map((wo) => (
                            <div key={wo.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-[var(--border)]/50 transition-colors pl-12 border-b border-[var(--neutral-200)]/50 last:border-0">
                              <div className="col-span-2 flex items-center gap-2">
                                <span className="font-medium text-[var(--neutral-800)] text-sm">{wo.id}</span>
                              </div>
                              <div className="col-span-3 text-sm text-[var(--neutral-500)]">
                                {wo.name}
                              </div>
                              <div className="col-span-2">
                                <Badge variant="secondary" className="bg-white border-[var(--neutral-200)] text-[var(--neutral-500)] font-normal">
                                  {wo.station}
                                </Badge>
                              </div>
                              <div className="col-span-2">
                                <StatusBadge status={wo.status} />
                              </div>
                              <div className="col-span-2 pr-4">
                                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden w-24">
                                   <div className={`h-full rounded-full ${wo.status === 'completed' ? 'bg-[var(--mw-green)]' : 'bg-[var(--mw-yellow-400)]'}`} style={{ width: `${wo.progress}%` }} />
                                </div>
                              </div>
                              <div className="col-span-1 text-right">
                                <Button variant="ghost" size="sm" className="h-14 text-xs text-[var(--neutral-500)]">View</Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-12 py-4 text-sm text-muted-foreground italic">No active work orders</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
      </div>

      {/* Right Sidebar */}
      {isSidebarOpen && (
        <div className="w-[320px] shrink-0 bg-white flex flex-col rounded-[var(--shape-lg)] border border-[var(--border)] overflow-hidden py-4">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="font-medium text-[var(--neutral-800)]">Communication</h3>
            <Button variant="ghost" size="icon" className="h-14 w-14 hover:bg-[var(--neutral-100)]" onClick={() => setIsSidebarOpen(false)}>
               <ChevronRight className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
             {/* Chat Section */}
             <div className="flex-1 flex flex-col min-h-0">
               <div className="flex-1 px-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                 <div className="space-y-4 py-2">
                   {/* Message 1 */}
                   <div className="flex gap-3">
                     <Avatar className="w-8 h-8 mt-1 border border-[var(--neutral-200)]">
                       <AvatarFallback className="bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">JD</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-[var(--neutral-800)]">John Doe</span>
                         <span className="text-xs text-[var(--neutral-500)]">2m</span>
                       </div>
                       <p className="text-sm text-[var(--neutral-800)] mt-0.5 bg-[var(--neutral-100)] p-3 rounded-[var(--shape-lg)] rounded-tl-none">
                         Material for <span className="text-[var(--mw-yellow-400)] font-medium">@MO-26-401</span> is arrived.
                       </p>
                     </div>
                   </div>

                   {/* Message 2 */}
                   <div className="flex gap-3">
                     <Avatar className="w-8 h-8 mt-1 border border-[var(--neutral-200)]">
                       <AvatarFallback className="bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">SJ</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-[var(--neutral-800)]">Sarah Jenkins</span>
                         <span className="text-xs text-[var(--neutral-500)]">15m</span>
                       </div>
                       <p className="text-sm text-[var(--neutral-800)] mt-0.5 bg-[var(--neutral-100)] p-3 rounded-[var(--shape-lg)] rounded-tl-none">
                         QA check passed for the first batch. Proceeding.
                       </p>
                     </div>
                   </div>

                   {/* Context Message (System/Yellow) */}
                    <div className="flex gap-3">
                     <Avatar className="w-8 h-8 mt-1 border border-[var(--neutral-200)]">
                       <AvatarFallback className="bg-[var(--mw-yellow-400)]/20 text-[var(--mw-mirage)] text-xs"><Bot className="w-4 h-4" /></AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-[var(--neutral-800)]">System</span>
                         <span className="text-xs text-[var(--neutral-500)]">1m</span>
                       </div>
                       <p className="text-sm text-[var(--neutral-800)] mt-0.5 bg-[var(--mw-yellow-400)]/20 p-3 rounded-[var(--shape-lg)] rounded-tl-none border border-[var(--mw-yellow-400)]/30">
                         Production speed increased by 15% after material arrival.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* User / AI Messages */}
               {chatMessages.length > 0 && (
                 <div className="px-4 pb-2 overflow-y-auto max-h-[200px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                   <div className="space-y-3 py-2">
                     {chatMessages.map((m, i) => (
                       <div key={i} className="flex gap-3">
                         <Avatar className="w-8 h-8 mt-1 border border-[var(--neutral-200)]">
                           <AvatarFallback className={m.from === 'ai' ? 'bg-[var(--mw-yellow-400)]/20 text-[var(--mw-mirage)] text-xs' : 'bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs'}>
                             {m.from === 'ai' ? <Bot className="w-4 h-4" /> : 'You'}
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                           <span className="text-sm font-medium text-[var(--neutral-800)]">{m.from === 'ai' ? 'AI Assistant' : 'You'}</span>
                           <p className={cn('text-sm text-[var(--neutral-800)] mt-0.5 p-3 rounded-[var(--shape-lg)] rounded-tl-none', m.from === 'ai' ? 'bg-[var(--mw-yellow-400)]/20 border border-[var(--mw-yellow-400)]/30' : 'bg-[var(--neutral-100)]')}>
                             {m.text}
                           </p>
                         </div>
                       </div>
                     ))}
                     <div ref={chatEndRef} />
                   </div>
                 </div>
               )}

               {/* Input Area */}
               <div className="p-4 border-t border-[var(--neutral-200)] bg-white">
                 <div className="relative">
                   <Input
                     placeholder="Type a message..."
                     className="pr-10 bg-[var(--neutral-100)] border-transparent focus:bg-white focus:border-[var(--mw-yellow-400)] transition-all rounded-sm"
                     value={chatInput}
                     onChange={e => setChatInput(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') handleChatSubmit(); }}
                   />
                   <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-14 w-14 text-[var(--mw-yellow-400)] hover:text-[var(--mw-yellow-400)] hover:bg-transparent" onClick={handleChatSubmit}>
                     <Send className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                   <Button variant="ghost" size="sm" className="h-14 px-2 text-[var(--neutral-500)] hover:text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]" onClick={() => toast('File attachment coming soon')}>
                     <Paperclip className="w-4 h-4 mr-1" /> Attach
                   </Button>
                 </div>
               </div>
             </div>

             <Separator className="my-2 bg-[var(--border)]" />

             {/* Work Standards / Instructions */}
             <div className="px-4 py-2">
               <h3 className="font-medium text-[var(--neutral-800)] mb-3 text-sm">Quick Access</h3>
               <div className="space-y-2">
                 <Button variant="outline" className="w-full justify-start text-left h-auto py-3 border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-100)] rounded-sm">
                   <FileText className="w-4 h-4 mr-3 text-[var(--mw-yellow-400)]" />
                   <div>
                     <div className="text-sm font-medium text-[var(--neutral-800)]">SOP-001 Assembly</div>
                     <div className="text-xs text-[var(--neutral-500)]">Updated 2 days ago</div>
                   </div>
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-left h-auto py-3 border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-100)] rounded-sm">
                   <ShieldAlert className="w-4 h-4 mr-3 text-[var(--mw-error)]" />
                   <div>
                     <div className="text-sm font-medium text-[var(--neutral-800)]">Safety Protocol</div>
                     <div className="text-xs text-[var(--neutral-500)]">Required reading</div>
                   </div>
                 </Button>
               </div>
             </div>
          </div>
        </div>
      )}
      {!isSidebarOpen && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
           <Button variant="secondary" size="icon" className="h-14 w-14 rounded-l-lg rounded-r-none shadow-md border-y border-l border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-100)]" onClick={() => setIsSidebarOpen(true)}>
             <ChevronDown className="w-4 h-4 rotate-90 text-[var(--neutral-500)]" />
           </Button>
        </div>
      )}
      </div>
      )}
    </div>
  );
}
