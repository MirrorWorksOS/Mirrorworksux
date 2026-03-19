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
import { Card } from '../ui/card';
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
    progress: "bg-[#FFCF4B] text-[#2C2C2C] border-transparent", // Yellow
    pending: "bg-[#F5F5F5] text-[#2C2C2C] border-[#E5E4E0]",   // Grey
    completed: "bg-[#4CAF50] text-white border-transparent",      // Green
    hold: "bg-[#EF4444] text-white border-transparent"            // Red
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
      <span className="text-xs px-2 py-0.5 rounded-[4px] font-bold text-[#EF4444] bg-[#EF4444]/10">
        HIGH
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-[4px] font-medium text-[#6B6B6B] bg-[#F5F5F5]">
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
    <div className="flex flex-col bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#E5E4E0] overflow-hidden mx-6 mt-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* List Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E5E4E0] bg-white">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
          <Input 
            placeholder="Search work orders..." 
            className="pl-10 bg-[#F8F7F4] border-transparent focus:bg-white focus:border-[#FFCF4B] h-10 rounded-[8px] text-[#2C2C2C]"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 px-4 bg-white border-[#E5E4E0] text-[#2C2C2C] hover:bg-[#F5F5F5] rounded-[8px]">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-4 bg-white border-[#E5E4E0] text-[#2C2C2C] hover:bg-[#F5F5F5] rounded-[8px]">
            View
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] bg-[#F8F7F4] p-4 space-y-4">
          {MOCK_DATA.filter(mo => mo.id === "MO-26-401").map(mo => (
            <div key={mo.id} className="bg-white rounded-[16px] border border-[#E5E4E0] overflow-hidden shadow-sm">
              {/* MO Header Row */}
              <div 
                className="flex items-center gap-4 p-5 cursor-pointer transition-colors hover:bg-[#F5F5F5]"
                onClick={() => toggleMO(mo.id)}
              >
                <div className={`p-1 rounded-full hover:bg-[#E5E4E0] transition-colors`}>
                  <ChevronRight className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-200 ${expandedMOs[mo.id] ? 'rotate-90' : ''}`} />
                </div>
                
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-lg text-[#2C2C2C]">{mo.id}</span>
                      <PriorityBadge priority={mo.priority} />
                    </div>
                    <div className="text-sm font-medium text-[#6B6B6B]">{mo.customer}</div>
                  </div>
                  
                  <div className="col-span-4">
                    <div className="text-[#2C2C2C] font-medium">{mo.partName}</div>
                    <div className="text-xs text-[#6B6B6B] mt-0.5">Total Units: {mo.totalUnits}</div>
                  </div>

                  <div className="col-span-4 text-right">
                    <div className="text-sm text-[#6B6B6B]">Due: <span className="font-medium text-[#2C2C2C]">{mo.dueDate}</span></div>
                    <div className="text-xs text-[#6B6B6B] mt-0.5">{mo.workOrders.length} Work Orders</div>
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
                    <div className="bg-[#F5F5F5]/50 border-t border-[#E5E4E0]">
                      {mo.workOrders.map(wo => (
                        <div 
                          key={wo.id}
                          className="group relative pl-16 pr-6 py-4 flex items-center gap-6 hover:bg-white cursor-pointer transition-all border-b border-[#E5E4E0]/50 last:border-0"
                          onClick={() => onSelectWO(wo, mo)}
                        >
                          {/* Active Indicator Line */}
                          {wo.status === 'progress' && (
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FFCF4B]" />
                          )}

                          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            {/* ID and Name */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-semibold text-[#6B6B6B]">{wo.id}</span>
                                <Badge variant="outline" className="bg-white text-[#2C2C2C] border-[#E5E4E0] font-mono text-[10px] px-1.5 py-0 h-5 rounded-[4px]">
                                  {wo.station}
                                </Badge>
                              </div>
                              <div className="font-medium text-[#2C2C2C] text-base">{wo.name}</div>
                            </div>
                            
                            {/* Progress Bar (Single Black Fill) */}
                            <div className="col-span-4 px-4">
                              <div className="flex justify-between text-xs font-medium text-[#6B6B6B] mb-1.5">
                                <span>Progress</span>
                                <span className="text-[#2C2C2C]">{wo.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#E5E4E0] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${wo.status === 'progress' ? 'bg-[#2C2C2C]' : wo.status === 'completed' ? 'bg-[#4CAF50]' : 'bg-[#6B6B6B]'}`}
                                  style={{ width: `${wo.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Status and Units */}
                            <div className="col-span-4 flex items-center justify-end gap-6">
                              <div className="text-right">
                                  <div className="text-xs text-[#6B6B6B] uppercase tracking-wide font-semibold">Units</div>
                                  <div className="font-mono text-sm text-[#2C2C2C]">{wo.unitsCompleted}/{wo.totalUnits}</div>
                              </div>
                              <StatusBadge status={wo.status} />
                              <ChevronRight className="w-5 h-5 text-[#E5E4E0] group-hover:text-[#2C2C2C] transition-colors" />
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