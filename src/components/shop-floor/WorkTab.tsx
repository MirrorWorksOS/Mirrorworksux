import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Pause, 
  Clock, 
  RotateCcw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Box, 
  FileText, 
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MessageSquare,
  ArrowLeft,
  Settings,
  MoreVertical,
  Camera,
  X,
  Menu,
  MessageCircle,
  List
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { Separator } from '../ui/separator';

// --- Types & Mock Data ---

type WorkOrder = {
  id: string;
  name: string;
  station: string;
  status: 'pending' | 'progress' | 'completed' | 'hold';
  progress: number; // 0-100
  unitsCompleted: number;
  totalUnits: number;
};

type ManufacturingOrder = {
  id: string;
  customer: string;
  partName: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  totalUnits: number;
  workOrders: WorkOrder[];
};

const MOCK_DATA: ManufacturingOrder[] = [
  {
    id: "MO-26-401",
    customer: "Global Systems",
    partName: "Server Rack Chassis",
    dueDate: "Dec 8, 2025",
    priority: "High",
    totalUnits: 400,
    workOrders: [
      { id: "MO-26-401-01", name: "Base Plate", station: "Amada Ensis Laser", status: "progress", progress: 75, unitsCompleted: 75, totalUnits: 100 },
      { id: "MO-26-401-02", name: "Support Arm", station: "Trumpf TruBend 5000", status: "pending", progress: 0, unitsCompleted: 0, totalUnits: 200 },
      { id: "MO-26-401-03", name: "Assembly Kit", station: "Assembly Station 1", status: "progress", progress: 45, unitsCompleted: 45, totalUnits: 100 }
    ]
  },
  {
    id: "MO-26-402",
    customer: "TechCorp",
    partName: "Heavy Duty Enclosure",
    dueDate: "Dec 10, 2025",
    priority: "Medium",
    totalUnits: 250,
    workOrders: [
      { id: "MO-26-402-01", name: "Frame Rails", station: "Mitsubishi 3015", status: "progress", progress: 20, unitsCompleted: 50, totalUnits: 250 }
    ]
  }
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    progress: "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] border-transparent", // Yellow
    pending: "bg-[var(--neutral-100)] text-[var(--neutral-800)] border-[var(--neutral-200)]",   // Grey
    completed: "bg-[var(--mw-green)] text-white border-transparent",      // Green
    hold: "bg-[var(--mw-error)] text-white border-transparent"            // Red
  };

  const labels: Record<string, string> = {
    progress: "In Progress",
    pending: "Pending",
    completed: "Completed",
    hold: "Blocked"
  };

  return (
    <span className={`text-xs font-medium px-3 py-1.5 rounded-[20px] border ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  if (priority === 'High') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-xs font-bold text-[var(--mw-error)] bg-[var(--mw-error)]/10">
        HIGH
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-xs font-medium text-[var(--neutral-500)] bg-[var(--neutral-100)]">
      {priority}
    </span>
  );
};

// --- Sub-Screens ---

const WorkOrderList = ({ onSelectWO }: { onSelectWO: (wo: WorkOrder, mo: ManufacturingOrder) => void }) => {
  const [expandedMOs, setExpandedMOs] = useState<Record<string, boolean>>({ "MO-26-401": true });

  const toggleMO = (id: string) => {
    setExpandedMOs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col bg-white rounded-[var(--shape-lg)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[var(--neutral-200)] overflow-hidden mx-6 mt-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* List Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--neutral-200)] bg-white">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutral-500)]" />
          <Input 
            placeholder="Search work orders..." 
            className="pl-10 bg-[var(--neutral-100)] border-transparent focus:bg-white focus:border-[var(--mw-yellow-400)] h-10 rounded-sm text-[var(--neutral-800)]"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 px-4 bg-white border-[var(--neutral-200)] text-[var(--neutral-800)] hover:bg-[var(--neutral-100)] rounded-sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-4 bg-white border-[var(--neutral-200)] text-[var(--neutral-800)] hover:bg-[var(--neutral-100)] rounded-sm">
            View
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] bg-[var(--neutral-100)] p-4 space-y-4">
          {MOCK_DATA.filter(mo => mo.id === "MO-26-401").map(mo => (
            <div key={mo.id} className="bg-white rounded-[var(--shape-lg)] border border-[var(--neutral-200)] overflow-hidden shadow-sm">
              {/* MO Header Row */}
              <div 
                className="flex items-center gap-4 p-6 cursor-pointer transition-colors hover:bg-[var(--neutral-100)]"
                onClick={() => toggleMO(mo.id)}
              >
                <div className={`p-1 rounded-full hover:bg-[var(--neutral-200)] transition-colors`}>
                  <ChevronRight className={`w-5 h-5 text-[var(--neutral-500)] transition-transform duration-200 ${expandedMOs[mo.id] ? 'rotate-90' : ''}`} />
                </div>
                
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-lg text-[var(--neutral-800)]">{mo.id}</span>
                      <PriorityBadge priority={mo.priority} />
                    </div>
                    <div className="text-sm font-medium text-[var(--neutral-500)]">{mo.customer}</div>
                  </div>
                  
                  <div className="col-span-4">
                    <div className="text-[var(--neutral-800)] font-medium">{mo.partName}</div>
                    <div className="text-xs text-[var(--neutral-500)] mt-0.5">Total Units: {mo.totalUnits}</div>
                  </div>

                  <div className="col-span-4 text-right">
                    <div className="text-sm text-[var(--neutral-500)]">Due: <span className="font-medium text-[var(--neutral-800)]">{mo.dueDate}</span></div>
                    <div className="text-xs text-[var(--neutral-500)] mt-0.5">{mo.workOrders.length} Work Orders</div>
                  </div>
                </div>
              </div>

              {/* WO Rows */}
              <AnimatePresence initial={false}>
                {expandedMOs[mo.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[var(--neutral-100)]/50 border-t border-[var(--neutral-200)]">
                      {mo.workOrders.map(wo => (
                        <div 
                          key={wo.id}
                          className="group relative pl-16 pr-6 py-4 flex items-center gap-6 hover:bg-white cursor-pointer transition-all border-b border-[var(--neutral-200)]/50 last:border-0"
                          onClick={() => onSelectWO(wo, mo)}
                        >
                          {/* Active Indicator Line */}
                          {wo.status === 'progress' && (
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--mw-yellow-400)]" />
                          )}

                          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            {/* ID and Name */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className=" text-sm font-medium text-[var(--neutral-500)]">{wo.id}</span>
                                <Badge variant="outline" className="bg-white text-[var(--neutral-800)] border-[var(--neutral-200)]  text-[10px] px-1.5 py-0 h-5 rounded-xs">
                                  {wo.station}
                                </Badge>
                              </div>
                              <div className="font-medium text-[var(--neutral-800)] text-base">{wo.name}</div>
                            </div>
                            
                            {/* Progress Bar (Single Black Fill) */}
                            <div className="col-span-4 px-4">
                              <div className="flex justify-between text-xs font-medium text-[var(--neutral-500)] mb-1.5">
                                <span>Progress</span>
                                <span className="text-[var(--neutral-800)]">{wo.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${wo.status === 'progress' ? 'bg-[var(--neutral-800)]' : wo.status === 'completed' ? 'bg-[var(--mw-green)]' : 'bg-[var(--neutral-500)]'}`}
                                  style={{ width: `${wo.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Status and Units */}
                            <div className="col-span-4 flex items-center justify-end gap-6">
                              <div className="text-right">
                                  <div className="text-xs text-[var(--neutral-500)] uppercase tracking-wide font-medium">Units</div>
                                  <div className=" text-sm text-[var(--neutral-800)]">{wo.unitsCompleted}/{wo.totalUnits}</div>
                              </div>
                              <StatusBadge status={wo.status} />
                              <ChevronRight className="w-5 h-5 text-[var(--neutral-200)] group-hover:text-[var(--neutral-800)] transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export function WorkTab({ onSelectWorkOrder }: { onSelectWorkOrder?: (wo: any) => void }) {
  const [expandedMOs, setExpandedMOs] = useState<Record<string, boolean>>({ "MO-26-401": true });

  const toggleMO = (id: string) => {
    setExpandedMOs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectWO = (wo: WorkOrder, mo: ManufacturingOrder) => {
    if (onSelectWorkOrder) {
      onSelectWorkOrder({ ...wo, moId: mo.id, moCustomer: mo.customer, moPartName: mo.partName });
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
        <WorkOrderList onSelectWO={handleSelectWO} />
    </div>
  );
}