import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
    progress: "bg-[#FFCF4B] text-[#2C2C2C] border-transparent",
    pending: "bg-[#F5F5F5] text-[#2C2C2C] border-[#E5E4E0]",
    completed: "bg-[#4CAF50] text-white border-transparent",
    hold: "bg-[#EF4444] text-white border-transparent"
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
      <span className="text-xs px-3 py-1 rounded-[20px] font-medium bg-[#EF4444] text-white">
        High
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 font-medium text-[#6B6B6B]">
      {priority}
    </span>
  );
};

// --- Main Component ---

export function OverviewTab() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex gap-6 h-full overflow-hidden bg-[#F8F7F4]">
      {/* Main Content Area */}
      <ScrollArea className="flex-1 h-full">
      <div className="flex-1 flex flex-col space-y-6 min-w-0 pr-4 pb-8 pt-1">
        
        {/* Intelligence Hub Banner */}
        <div className="bg-[#F5F5F5] rounded-[16px] overflow-hidden border border-[#E5E4E0] mx-1 mt-1">
           <div 
             className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#E5E4E0]/50 transition-colors"
             onClick={() => setIsInsightsOpen(!isInsightsOpen)}
           >
              <div className="flex items-center gap-2 font-medium text-[#2C2C2C]">
                 <Bot className="w-5 h-5 text-[#FFCF4B]" />
                 <span>AI Insights: <span className="text-[#6B6B6B] font-normal">3 new</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
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
                 <div className="bg-[#F5F5F5] border-t border-[#E5E4E0] p-2 space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-[8px] hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#E5E4E0]">
                       <AlertCircle className="w-5 h-5 text-[#FFCF4B] shrink-0" />
                       <div className="text-sm text-[#2C2C2C] text-[15px]">
                          <span className="font-semibold">Material shortage:</span> 16ga stainless sheets. 15 needed, 8 in stock. Expedite #PO-8847 with Central Steel.
                       </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-[8px] hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#E5E4E0]">
                       <Zap className="w-5 h-5 text-[#FFCF4B] shrink-0" />
                       <div className="text-sm text-[#2C2C2C] text-[15px]">
                          <span className="font-semibold">Optimization:</span> Amada Ensis Laser free in 15 min - Queue MO-26-405 now
                       </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-[8px] hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#E5E4E0]">
                       <Info className="w-5 h-5 text-[#FFCF4B] shrink-0" />
                       <div className="text-sm text-[#2C2C2C] text-[15px]">
                          <span className="font-semibold">Efficiency:</span> Shop running 8% above target efficiency today
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
            <Input 
              placeholder="Search work orders" 
              className="pl-10 h-12 w-full bg-white text-base shadow-sm border-[#E5E4E0] rounded-[8px] focus-visible:ring-[#FFCF4B]"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" className="h-12 px-4 border-[#E5E4E0] bg-white hover:bg-[#F5F5F5] text-[#2C2C2C] font-medium rounded-[8px]">
              Status <ChevronDown className="w-4 h-4 ml-2 text-[#6B6B6B]" />
            </Button>
            <Button variant="outline" className="h-12 px-4 border-[#E5E4E0] bg-white hover:bg-[#F5F5F5] text-[#2C2C2C] font-medium rounded-[8px]">
              Priority <ChevronDown className="w-4 h-4 ml-2 text-[#6B6B6B]" />
            </Button>
            <Button variant="outline" className="h-12 px-4 border-[#E5E4E0] bg-white hover:bg-[#F5F5F5] text-[#2C2C2C] font-medium rounded-[8px]">
              Machine <ChevronDown className="w-4 h-4 ml-2 text-[#6B6B6B]" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
            
            {/* Job Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card A: Active Jobs */}
              <Card className="border-[#E5E4E0] shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-[16px] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#6B6B6B] uppercase tracking-wide">Active Job Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <a href="#" className="text-[18px] font-medium text-[#2C2C2C] hover:underline hover:text-[#FFCF4B] transition-colors">
                        {ACTIVE_JOBS_SUMMARY.customer}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-normal text-sm text-[#6B6B6B]">
                          {ACTIVE_JOBS_SUMMARY.moNumber}
                        </span>
                        <StatusBadge status={ACTIVE_JOBS_SUMMARY.status} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-[16px] border border-[#E5E4E0]">
                      <div className="space-y-1">
                        <div className="text-xs text-[#6B6B6B] font-medium">DUE IN</div>
                        <div className="text-[24px] font-semibold text-[#2C2C2C] tabular-nums">4d 12h</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-xs text-[#6B6B6B] font-medium">PRIORITY</div>
                        <PriorityBadge priority={ACTIVE_JOBS_SUMMARY.priority} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card B: Time Tracking */}
              <Card className="border-[#E5E4E0] shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-[16px] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#6B6B6B] uppercase tracking-wide">Shift Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-4xl font-semibold text-[#2C2C2C] tabular-nums tracking-tight leading-none">
                        {TIME_TRACKING_SUMMARY.totalShiftTime}
                      </div>
                      <div className="text-sm text-[#6B6B6B] mt-2">Total Shift Time</div>
                    </div>
                    
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                       {/* Simple SVG Circular Progress */}
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-[#E5E4E0]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                          <path className="text-[#FFCF4B]" strokeDasharray={`${TIME_TRACKING_SUMMARY.efficiency}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                       </svg>
                       <span className="absolute text-[9px] font-bold text-[#2C2C2C]">{TIME_TRACKING_SUMMARY.efficiency}%</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-[#E5E4E0] text-[#6B6B6B] text-[10px]">OP</AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border-2 border-white flex items-center justify-center text-[10px] font-medium text-[#6B6B6B]">
                        +8
                      </div>
                    </div>
                    <div className="flex items-center text-[#4CAF50] text-sm font-medium">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {TIME_TRACKING_SUMMARY.targetComparison}% vs Target
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card C: Andon Alerts */}
              <Card className="border-[#E5E4E0] shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-[16px] bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <Badge variant="destructive" className="animate-pulse bg-[#EF4444] text-white border-0 rounded-[20px] px-3">
                    {ANDON_ALERTS.length} Active
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#6B6B6B] uppercase tracking-wide">Andon Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ANDON_ALERTS.slice(0, 2).map(alert => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-[8px] bg-[#F5F5F5] border border-transparent hover:border-[#E5E4E0] transition-colors">
                        <div className="w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0 mt-0.5">
                           <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#2C2C2C]">{alert.message}</div>
                          <div className="text-xs text-[#6B6B6B] mt-0.5">{alert.time}</div>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-xs font-medium text-[#6B6B6B] hover:text-[#2C2C2C] h-8">
                      View All Issues <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Manufacturing Orders List */}
            <div className="bg-white border border-[#E5E4E0] rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#E5E4E0] bg-[#F5F5F5]/50 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">
                <div className="col-span-2">MO #</div>
                <div className="col-span-3">Customer & Part</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-[#E5E4E0]">
                {MANUFACTURING_ORDERS.map((mo) => (
                  <div key={mo.id} className="group transition-colors bg-white hover:bg-[#F5F5F5]">
                    {/* Parent Row */}
                    <div 
                      className="grid grid-cols-12 gap-4 p-4 items-center min-h-[56px] cursor-pointer"
                      onClick={() => toggleRow(mo.id)}
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 text-[#6B6B6B] transition-transform duration-200 ${expandedRows[mo.id] ? 'rotate-90' : ''}`} />
                        <span className="font-medium text-[#2C2C2C]">{mo.id}</span>
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium text-[#2C2C2C] text-sm">{mo.customer}</div>
                        <div className="text-xs text-[#6B6B6B] truncate">{mo.partName}</div>
                      </div>
                      <div className="col-span-2 text-sm text-[#6B6B6B]">
                        {mo.dueDate}
                      </div>
                      <div className="col-span-2">
                         <StatusBadge status={mo.status} />
                      </div>
                      <div className="col-span-2 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#E5E4E0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#FFCF4B] rounded-full" style={{ width: `${mo.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-[#6B6B6B]">{mo.progress}%</span>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4 text-[#6B6B6B]" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Child Rows (Work Orders) */}
                    {expandedRows[mo.id] && (
                      <div className="bg-[#F5F5F5]/30 border-t border-[#E5E4E0] shadow-inner">
                        <div className="px-4 py-2 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider pl-12">
                          Work Orders
                        </div>
                        {mo.workOrders.length > 0 ? (
                          mo.workOrders.map((wo) => (
                            <div key={wo.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-[#E5E4E0]/50 transition-colors pl-12 border-b border-[#E5E4E0]/50 last:border-0">
                              <div className="col-span-2 flex items-center gap-2">
                                <span className="font-medium text-[#2C2C2C] text-sm">{wo.id}</span>
                              </div>
                              <div className="col-span-3 text-sm text-[#6B6B6B]">
                                {wo.name}
                              </div>
                              <div className="col-span-2">
                                <Badge variant="secondary" className="bg-white border-[#E5E4E0] text-[#6B6B6B] font-normal">
                                  {wo.station}
                                </Badge>
                              </div>
                              <div className="col-span-2">
                                <StatusBadge status={wo.status} />
                              </div>
                              <div className="col-span-2 pr-4">
                                <div className="h-1.5 bg-[#E5E4E0] rounded-full overflow-hidden w-24">
                                   <div className={`h-full rounded-full ${wo.status === 'completed' ? 'bg-[#4CAF50]' : 'bg-[#FFCF4B]'}`} style={{ width: `${wo.progress}%` }} />
                                </div>
                              </div>
                              <div className="col-span-1 text-right">
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-[#6B6B6B]">View</Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-12 py-4 text-sm text-[#6B6B6B] italic">No active work orders</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
      </div>
      </ScrollArea>

      {/* Right Sidebar */}
      {isSidebarOpen && (
        <div className="w-[320px] shrink-0 bg-white flex flex-col h-full rounded-[16px] border border-[#E5E4E0] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden py-4">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="font-semibold text-[#2C2C2C]">Communication</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#F5F5F5]" onClick={() => setIsSidebarOpen(false)}>
               <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
             {/* Chat Section */}
             <div className="flex-1 flex flex-col min-h-0">
               <div className="flex-1 px-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                 <div className="space-y-4 py-2">
                   {/* Message 1 */}
                   <div className="flex gap-3">
                     <Avatar className="w-8 h-8 mt-1 border border-[#E5E4E0]">
                       <AvatarFallback className="bg-[#F5F5F5] text-[#2C2C2C] text-xs">JD</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-[#2C2C2C]">John Doe</span>
                         <span className="text-xs text-[#6B6B6B]">2m</span>
                       </div>
                       <p className="text-sm text-[#2C2C2C] mt-0.5 bg-[#F5F5F5] p-3 rounded-[16px] rounded-tl-none">
                         Material for <span className="text-[#F4C542] font-semibold">@MO-26-401</span> is arrived.
                       </p>
                     </div>
                   </div>

                   {/* Message 2 */}
                   <div className="flex gap-3">
                     <Avatar className="w-8 h-8 mt-1 border border-[#E5E4E0]">
                       <AvatarFallback className="bg-[#F5F5F5] text-[#2C2C2C] text-xs">SJ</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-[#2C2C2C]">Sarah Jenkins</span>
                         <span className="text-xs text-[#6B6B6B]">15m</span>
                       </div>
                       <p className="text-sm text-[#2C2C2C] mt-0.5 bg-[#F5F5F5] p-3 rounded-[16px] rounded-tl-none">
                         QA check passed for the first batch. Proceeding.
                       </p>
                     </div>
                   </div>

                   {/* Context Message (System/Yellow) */}
                    <div className="flex gap-3">
                     <Avatar className="w-8 h-8 mt-1 border border-[#E5E4E0]">
                       <AvatarFallback className="bg-[#FFF9C4] text-[#F57F17] text-xs"><Bot className="w-4 h-4" /></AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-[#2C2C2C]">System</span>
                         <span className="text-xs text-[#6B6B6B]">1m</span>
                       </div>
                       <p className="text-sm text-[#2C2C2C] mt-0.5 bg-[#F4C542]/20 p-3 rounded-[16px] rounded-tl-none border border-[#F4C542]/30">
                         Production speed increased by 15% after material arrival.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Input Area */}
               <div className="p-4 border-t border-[#E5E4E0] bg-white">
                 <div className="relative">
                   <Input placeholder="Type a message..." className="pr-10 bg-[#F8F7F4] border-transparent focus:bg-white focus:border-[#FFCF4B] transition-all rounded-[8px]" />
                   <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-[#FFCF4B] hover:text-[#F4C542] hover:bg-transparent">
                     <Send className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                   <Button variant="ghost" size="sm" className="h-8 px-2 text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F5F5F5]">
                     <Paperclip className="w-3 h-3 mr-1" /> Attach
                   </Button>
                 </div>
               </div>
             </div>

             <Separator className="my-2 bg-[#E5E4E0]" />

             {/* Work Standards / Instructions */}
             <div className="px-4 py-2">
               <h3 className="font-semibold text-[#2C2C2C] mb-3 text-sm">Quick Access</h3>
               <div className="space-y-2">
                 <Button variant="outline" className="w-full justify-start text-left h-auto py-3 border-[#E5E4E0] bg-white hover:bg-[#F5F5F5] rounded-[8px]">
                   <FileText className="w-4 h-4 mr-3 text-[#FFCF4B]" />
                   <div>
                     <div className="text-sm font-medium text-[#2C2C2C]">SOP-001 Assembly</div>
                     <div className="text-xs text-[#6B6B6B]">Updated 2 days ago</div>
                   </div>
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-left h-auto py-3 border-[#E5E4E0] bg-white hover:bg-[#F5F5F5] rounded-[8px]">
                   <ShieldAlert className="w-4 h-4 mr-3 text-[#EF4444]" />
                   <div>
                     <div className="text-sm font-medium text-[#2C2C2C]">Safety Protocol</div>
                     <div className="text-xs text-[#6B6B6B]">Required reading</div>
                   </div>
                 </Button>
               </div>
             </div>
          </div>
        </div>
      )}
      {!isSidebarOpen && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
           <Button variant="secondary" size="icon" className="h-12 w-8 rounded-l-lg rounded-r-none shadow-md border-y border-l border-[#E5E4E0] bg-white hover:bg-[#F5F5F5]" onClick={() => setIsSidebarOpen(true)}>
             <ChevronDown className="w-4 h-4 rotate-90 text-[#6B6B6B]" />
           </Button>
        </div>
      )}
    </div>
  );
}
