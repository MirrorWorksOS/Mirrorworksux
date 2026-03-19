import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Package, 
  Settings, 
  XCircle, 
  Recycle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Siren, 
  ChevronDown,
  Mic,
  Pause,
  Play,
  User,
  Bot,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { cn } from '../ui/utils';
import { MaterialIssueForm, MachineIssueForm, QualityIssueForm, ScrapIssueForm } from './issues/IssueModals';

// --- Types & Mock Data ---

type AlertStatus = 'active' | 'progress' | 'resolved';
type IssueType = 'material' | 'machine' | 'quality' | 'scrap';

interface Alert {
  id: string;
  type: IssueType;
  title: string;
  reporter: string;
  time: string;
  status: AlertStatus;
  statusText: string;
  duration?: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "ALT-101",
    type: 'machine',
    title: "Machine Issue - Amada Ensis Laser",
    reporter: "David Miller",
    time: "3 min ago",
    status: 'active',
    statusText: "Maintenance en route"
  },
  {
    id: "ALT-099",
    type: 'material',
    title: "Material Shortage - 5052 Aluminum",
    reporter: "Elena Rodriguez",
    time: "15 min ago",
    status: 'progress',
    statusText: "Supplier contacted"
  },
  {
    id: "ALT-085",
    type: 'quality',
    title: "Quality Variance - MO-26-401",
    reporter: "QA Team",
    time: "1 hr ago",
    status: 'resolved',
    statusText: "Resolved: Tool replaced",
    duration: "45 min"
  }
];

// --- Components ---

const IssueCard = ({ 
  icon: Icon, 
  label, 
  sublabel, 
  onClick, 
  colorConfig
}: { 
  icon: any, 
  label: string, 
  sublabel: string, 
  onClick: () => void,
  colorConfig: { bg: string, text: string, circle: string, border: string, hover: string }
}) => (
  <div 
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center p-6 h-[220px] rounded-[16px] border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] group bg-white",
      colorConfig.border,
      colorConfig.hover
    )}
  >
    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110", colorConfig.circle)}>
      <Icon className={cn("w-10 h-10", colorConfig.text)} />
    </div>
    <div className="text-center">
      <div className="text-xl font-bold text-[#2C2C2C] tracking-tight">{label}</div>
      <div className="text-sm text-[#6B6B6B] font-medium mt-1">{sublabel}</div>
    </div>
  </div>
);

const ActiveAlertRow = ({ alert }: { alert: Alert }) => {
  const styles = {
    active: "bg-[#FEF2F2] border-[#FEE2E2]",
    progress: "bg-[#F5F5F5] border-[#E5E4E0]",
    resolved: "bg-[#F0FDF4] border-[#DCFCE7]"
  };

  const icons = {
    machine: Settings,
    material: Package,
    quality: XCircle,
    scrap: Recycle
  };

  const Icon = icons[alert.type];

  return (
    <div className={cn("p-4 rounded-[12px] border mb-3 flex items-center justify-between", styles[alert.status])}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white rounded-full shadow-sm border border-black/5">
           <Icon className="w-5 h-5 text-[#2C2C2C]" />
        </div>
        <div>
           <div className="flex items-center gap-2">
              <span className="font-bold text-[#2C2C2C] text-sm uppercase tracking-wide">{alert.type}</span>
              <span className="text-[#6B6B6B]">•</span>
              <span className="font-semibold text-[#2C2C2C]">{alert.title}</span>
           </div>
           <div className="text-sm text-[#6B6B6B] mt-0.5 font-medium">
              {alert.statusText} • <span className="opacity-80">{alert.time}</span>
           </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="bg-white border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#2C2C2C] rounded-[8px] h-9">
         View Details
      </Button>
    </div>
  );
};

export function IssuesTab() {
  const [isSupervisorCalled, setIsSupervisorCalled] = useState(false);
  const [activeModal, setActiveModal] = useState<IssueType | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleCallSupervisor = () => {
    setIsSupervisorCalled(true);
    setTimeout(() => setIsSupervisorCalled(false), 3000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto max-w-[1600px] mx-auto w-full p-4 bg-[#F8F7F4]">
      
      {/* Hero Action Section */}
      <div className="shrink-0 py-4 flex justify-start items-center gap-6">
        {/* Call Supervisor Button */}
        <button
          onClick={handleCallSupervisor}
          className={cn(
            "relative w-[420px] h-[88px] rounded-[16px] flex items-center justify-between px-8 transition-all duration-300 shadow-md active:scale-95 group overflow-hidden border-2 border-[#EF4444]",
            isSupervisorCalled 
              ? "bg-[#DC2626]" 
              : "bg-[#EF4444] hover:bg-[#DC2626]"
          )}
        >
          {/* Pulse Animation Overlay */}
          <div className="absolute inset-0 bg-white/10 animate-[pulse_2s_infinite]" />
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
               <Siren className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div className="text-left text-white">
               <div className="text-xl font-bold tracking-tight">CALL SUPERVISOR</div>
               <div className="text-red-100 text-sm font-medium opacity-90">Emergency Assistance</div>
            </div>
          </div>
          
          <ChevronRight className="w-8 h-8 text-white/80 group-hover:text-white transition-transform group-hover:translate-x-1 z-10" />
        </button>

        {/* Voice Note Button */}
        <div 
           onClick={() => !isRecording && setIsRecording(true)}
           className={cn(
             "h-[88px] rounded-[16px] flex items-center shadow-md transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-pointer",
             isRecording 
               ? "w-[480px] cursor-default bg-white border border-[#E5E4E0] ring-4 ring-[#FFCF4B]/20" 
               : "w-[88px] bg-[#FFCF4B] hover:bg-[#FFD66B] justify-center hover:shadow-lg active:scale-95 border border-[#F4C542]"
           )}
        >
           {isRecording ? (
             <div className="flex w-full h-full animate-in fade-in zoom-in-95 duration-300">
                {/* Left Side - Yellow */}
                <div className="flex-1 bg-[#FFCF4B] flex items-center px-6 gap-5 relative h-full">
                   {/* Play Button */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); setIsRecording(false); }}
                     className="w-12 h-12 rounded-full bg-[#1A2732] flex items-center justify-center shrink-0 hover:scale-110 transition-transform shadow-md group"
                   >
                      <Play className="w-5 h-5 text-white fill-white ml-0.5 group-hover:scale-110 transition-transform" />
                   </button>
                   
                   {/* Time */}
                   <span className="text-3xl font-bold text-[#1A2732] tabular-nums tracking-tight">0:12</span>
                   
                   {/* Waveform - Black */}
                   <div className="flex items-center gap-[3px] h-8 ml-2">
                      {[40, 60, 45, 90, 60, 75, 50, 80, 55, 70, 45, 60].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-[#1A2732] rounded-full animate-pulse"
                          style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                   </div>
                </div>

                {/* Right Side - White */}
                <div className="w-[140px] bg-white flex items-center justify-center h-full relative z-10 border-l border-[#E5E4E0]">
                   <div className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide">Recording</div>
                </div>
             </div>
           ) : (
             <Mic className="w-8 h-8 text-[#2C2C2C]" />
           )}
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0 overflow-hidden mt-2">
         {/* Main Content Area: Issue Grid & Active List */}
         <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            
            {/* Issue Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <IssueCard 
                 icon={Package} label="MATERIAL" sublabel="Shortage / Defect" 
                 onClick={() => setActiveModal('material')}
                 colorConfig={{ 
                    bg: "bg-white", text: "text-[#2563EB]", circle: "bg-[#EFF6FF]", border: "border-[#E5E4E0]", hover: "" 
                 }}
               />
               <IssueCard 
                 icon={Settings} label="MACHINE" sublabel="Breakdown / Error" 
                 onClick={() => setActiveModal('machine')}
                 colorConfig={{ 
                    bg: "bg-white", text: "text-[#F59E0B]", circle: "bg-[#FFFBEB]", border: "border-[#E5E4E0]", hover: "" 
                 }}
               />
               <IssueCard 
                 icon={XCircle} label="QUALITY" sublabel="Out of Spec" 
                 onClick={() => setActiveModal('quality')}
                 colorConfig={{ 
                    bg: "bg-white", text: "text-[#7C3AED]", circle: "bg-[#F3E8FF]", border: "border-[#E5E4E0]", hover: "" 
                 }}
               />
               <IssueCard 
                 icon={Recycle} label="SCRAP" sublabel="Report Waste" 
                 onClick={() => setActiveModal('scrap')}
                 colorConfig={{ 
                    bg: "bg-white", text: "text-[#4B5563]", circle: "bg-[#F3F4F6]", border: "border-[#E5E4E0]", hover: "" 
                 }}
               />
            </div>

            {/* Active Issues Panel */}
            <div className="bg-white rounded-[16px] border border-[#E5E4E0] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden flex-1 min-h-[300px]">
               <div className="p-5 border-b border-[#E5E4E0] bg-[#F8F7F4] flex items-center justify-between">
                  <h3 className="font-bold text-[#2C2C2C] text-lg flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-[#6B6B6B]" /> ACTIVE ISSUES
                  </h3>
                  <Badge variant="secondary" className="bg-white border border-[#E5E4E0] text-[#2C2C2C] font-medium rounded-[6px]">3 Open</Badge>
               </div>
               <div className="p-5 bg-white max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                  {MOCK_ALERTS.map(alert => (
                     <ActiveAlertRow key={alert.id} alert={alert} />
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar: Andon Board & Stats */}
         <div className="w-[340px] shrink-0 space-y-6 hidden lg:block overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            
            {/* Andon Status Widget */}
            <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[#E5E4E0] overflow-hidden rounded-[16px] bg-white">
               <div className="bg-[#2C2C2C] text-white p-4 font-bold text-center uppercase tracking-wider text-sm">
                  Machine Status
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FEE2E2]">
                     <span className="font-bold text-[#2C2C2C]">Amada Ensis</span>
                     <Badge className="bg-[#EF4444] hover:bg-[#DC2626] border-0 rounded-[4px] font-bold">STOPPED</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#F0FDF4] border border-[#DCFCE7]">
                     <span className="font-bold text-[#2C2C2C]">Trumpf TruBend</span>
                     <Badge className="bg-[#4CAF50] hover:bg-[#166534] border-0 rounded-[4px] font-bold">RUNNING</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#F0FDF4] border border-[#DCFCE7]">
                     <span className="font-bold text-[#2C2C2C]">Mitsubishi 3015</span>
                     <Badge className="bg-[#4CAF50] hover:bg-[#166534] border-0 rounded-[4px] font-bold">RUNNING</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#FFFBEB] border border-[#FEF3C7]">
                     <span className="font-bold text-[#2C2C2C]">Haeger Press</span>
                     <Badge className="bg-[#F59E0B] hover:bg-[#D97706] text-black border-0 rounded-[4px] font-bold">ATTENTION</Badge>
                  </div>
               </div>
               <div className="bg-[#F8F7F4] p-3 text-center border-t border-[#E5E4E0]">
                  <Button variant="link" size="sm" className="text-[#6B6B6B] hover:text-[#2C2C2C] h-auto p-0 font-medium">View Full Andon Board</Button>
               </div>
            </Card>

            {/* Intelligence Hub Integration */}
            <Card className="shadow-none border-[#7C3AED]/20 bg-[#F5F3FF] rounded-[16px]">
               <div className="p-5">
                  <div className="flex items-center gap-2 mb-4 text-[#7C3AED] font-bold text-lg">
                     <Bot className="w-5 h-5" /> AI Troubleshoot
                  </div>
                  
                  <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md h-12 mb-4 justify-between group rounded-[8px] font-bold">
                     Ask Intelligence Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-[#5B21B6] bg-white/60 p-3 rounded-[8px] border border-[#7C3AED]/20">
                     <Mic className="w-4 h-4" /> 
                     <span className="italic font-medium">"Why is Amada Ensis stopped?"</span>
                  </div>
               </div>
            </Card>

         </div>
      </div>

      {/* Modals */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
         <DialogContent className="max-w-2xl w-[90vw] p-0 overflow-hidden bg-white sm:rounded-2xl border-[#E5E4E0]">
            <DialogTitle className="sr-only">Issue Reporting</DialogTitle>
            <DialogDescription className="sr-only">
               Form to report an issue on the shop floor.
            </DialogDescription>
            {activeModal === 'material' && <MaterialIssueForm onClose={() => setActiveModal(null)} />}
            {activeModal === 'machine' && <MachineIssueForm onClose={() => setActiveModal(null)} />}
            {activeModal === 'quality' && <QualityIssueForm onClose={() => setActiveModal(null)} />}
            {activeModal === 'scrap' && <ScrapIssueForm onClose={() => setActiveModal(null)} />}
         </DialogContent>
      </Dialog>
    </div>
  );
}