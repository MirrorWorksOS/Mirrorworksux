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
      "relative flex flex-col items-center justify-center p-6 h-[220px] rounded-[var(--shape-lg)] border transition-all duration-200 cursor-pointer hover:shadow-[var(--elevation-2)] hover:scale-[1.01] group bg-card",
      colorConfig.border,
      colorConfig.hover
    )}
  >
    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110", colorConfig.circle)}>
      <Icon className={cn("w-10 h-10", colorConfig.text)} />
    </div>
    <div className="text-center">
      <div className="text-xl font-bold text-[var(--neutral-800)] tracking-tight">{label}</div>
      <div className="text-sm text-[var(--neutral-500)] font-medium mt-1">{sublabel}</div>
    </div>
  </div>
);

const ActiveAlertRow = ({ alert }: { alert: Alert }) => {
  const styles = {
    active: "bg-[var(--mw-error-50)] border-[var(--mw-error-100)]",
    progress: "bg-[var(--neutral-100)] border-[var(--neutral-200)]",
    resolved: "bg-[var(--mw-green-50)] border-[var(--mw-green-100)]"
  };

  const icons = {
    machine: Settings,
    material: Package,
    quality: XCircle,
    scrap: Recycle
  };

  const Icon = icons[alert.type];

  return (
    <div className={cn("p-4 rounded-md border mb-3 flex items-center justify-between", styles[alert.status])}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-card rounded-full shadow-sm border border-black/5">
           <Icon className="w-5 h-5 text-[var(--neutral-800)]" />
        </div>
        <div>
           <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--neutral-800)] text-sm uppercase tracking-wide">{alert.type}</span>
              <span className="text-[var(--neutral-500)]">•</span>
              <span className="font-medium text-[var(--neutral-800)]">{alert.title}</span>
           </div>
           <div className="text-sm text-[var(--neutral-500)] mt-0.5 font-medium">
              {alert.statusText} • <span className="opacity-80">{alert.time}</span>
           </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="bg-card border-[var(--neutral-200)] hover:bg-[var(--neutral-100)] text-[var(--neutral-800)] rounded-sm h-14">
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
    <div className="flex flex-col h-full overflow-y-auto max-w-[1600px] mx-auto w-full p-4 bg-[var(--neutral-100)]">
      
      {/* Hero Action Section */}
      <div className="shrink-0 py-4 flex justify-start items-center gap-6">
        {/* Call Supervisor Button */}
        <button
          onClick={handleCallSupervisor}
          className={cn(
            "relative w-[420px] h-[88px] rounded-[var(--shape-lg)] flex items-center justify-between px-8 transition-all duration-[250ms] shadow-xs active:scale-95 group overflow-hidden border-2 border-[var(--mw-error)]",
            isSupervisorCalled 
              ? "bg-[var(--mw-error-600)]" 
              : "bg-[var(--mw-error)] hover:bg-[var(--mw-error-600)]"
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
               <div className="text-[var(--mw-error-light)] text-sm font-medium opacity-90">Emergency Assistance</div>
            </div>
          </div>
          
          <ChevronRight className="w-8 h-8 text-white/80 group-hover:text-white transition-transform group-hover:translate-x-1 z-10" />
        </button>

        {/* Voice Note Button */}
        <div 
           onClick={() => !isRecording && setIsRecording(true)}
           className={cn(
             "h-[88px] rounded-[var(--shape-lg)] flex items-center shadow-xs transition-all duration-[450ms] ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden cursor-pointer",
             isRecording 
               ? "w-[480px] cursor-default bg-card border border-[var(--neutral-200)] ring-4 ring-[var(--mw-yellow-400)]/20" 
               : "w-[88px] bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-300)] justify-center hover:shadow-[var(--elevation-3)] active:scale-95 border border-[var(--mw-yellow-400)]"
           )}
        >
           {isRecording ? (
             <div className="flex w-full h-full animate-in fade-in zoom-in-95 duration-[250ms]">
                {/* Left Side - Yellow */}
                <div className="flex-1 bg-[var(--mw-yellow-400)] flex items-center px-6 gap-5 relative h-full">
                   {/* Play Button */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); setIsRecording(false); }}
                     className="w-12 h-12 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center shrink-0 hover:scale-110 transition-transform group"
                   >
                      <Play className="w-5 h-5 text-white fill-white ml-0.5 group-hover:scale-110 transition-transform" />
                   </button>
                   
                   {/* Time */}
                   <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight">0:12</span>
                   
                   {/* Waveform - Black */}
                   <div className="flex items-center gap-[3px] h-8 ml-2">
                      {[40, 60, 45, 90, 60, 75, 50, 80, 55, 70, 45, 60].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-[var(--mw-mirage)] rounded-full animate-pulse"
                          style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                   </div>
                </div>

                {/* Right Side - White */}
                <div className="w-[140px] bg-card flex items-center justify-center h-full relative z-10 border-l border-[var(--neutral-200)]">
                   <div className="text-xs font-bold text-[var(--neutral-500)] uppercase tracking-wide">Recording</div>
                </div>
             </div>
           ) : (
             <Mic className="w-8 h-8 text-[var(--neutral-800)]" />
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
                    bg: "bg-card", text: "text-[var(--mw-info)]", circle: "bg-[var(--mw-blue-50)]", border: "border-[var(--neutral-200)]", hover: "" 
                 }}
               />
               <IssueCard 
                 icon={Settings} label="MACHINE" sublabel="Breakdown / Error" 
                 onClick={() => setActiveModal('machine')}
                 colorConfig={{ 
                    bg: "bg-card", text: "text-[var(--mw-warning)]", circle: "bg-[var(--mw-yellow-50)]", border: "border-[var(--neutral-200)]", hover: "" 
                 }}
               />
               <IssueCard 
                 icon={XCircle} label="QUALITY" sublabel="Out of Spec" 
                 onClick={() => setActiveModal('quality')}
                 colorConfig={{ 
                    bg: "bg-card", text: "text-[var(--neutral-500)]", circle: "bg-[var(--mw-purple-100)]", border: "border-[var(--neutral-200)]", hover: "" 
                 }}
               />
               <IssueCard 
                 icon={Recycle} label="SCRAP" sublabel="Report Waste" 
                 onClick={() => setActiveModal('scrap')}
                 colorConfig={{ 
                    bg: "bg-card", text: "text-[var(--neutral-600)]", circle: "bg-[var(--neutral-100)]", border: "border-[var(--neutral-200)]", hover: "" 
                 }}
               />
            </div>

            {/* Active Issues Panel */}
            <div className="bg-card rounded-[var(--shape-lg)] border border-[var(--neutral-200)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden flex-1 min-h-[300px]">
               <div className="p-6 border-b border-[var(--neutral-200)] bg-[var(--neutral-100)] flex items-center justify-between">
                  <h3 className="font-bold text-[var(--neutral-800)] text-lg flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-[var(--neutral-500)]" /> ACTIVE ISSUES
                  </h3>
                  <Badge variant="secondary" className="bg-card border border-[var(--neutral-200)] text-[var(--neutral-800)] font-medium rounded-sm">3 Open</Badge>
               </div>
               <div className="p-6 bg-card max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                  {MOCK_ALERTS.map(alert => (
                     <ActiveAlertRow key={alert.id} alert={alert} />
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar: Andon Board & Stats */}
         <div className="w-[340px] shrink-0 space-y-6 hidden lg:block overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            
            {/* Andon Status Widget */}
            <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[var(--neutral-200)] overflow-hidden rounded-[var(--shape-lg)] bg-card">
               <div className="bg-[var(--neutral-800)] text-white p-4 font-bold text-center uppercase tracking-wider text-sm">
                  Machine Status
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-sm bg-[var(--mw-error-50)] border border-[var(--mw-error-100)]">
                     <span className="font-bold text-[var(--neutral-800)]">Amada Ensis</span>
                     <Badge className="bg-[var(--mw-error)] hover:bg-[var(--mw-error-600)] border-0 rounded-xs font-bold">STOPPED</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-sm bg-[var(--mw-green-50)] border border-[var(--mw-green-100)]">
                     <span className="font-bold text-[var(--neutral-800)]">Trumpf TruBend</span>
                     <Badge className="bg-[var(--mw-green)] hover:bg-[var(--mw-success)] border-0 rounded-xs font-bold">RUNNING</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-sm bg-[var(--mw-green-50)] border border-[var(--mw-green-100)]">
                     <span className="font-bold text-[var(--neutral-800)]">Mitsubishi 3015</span>
                     <Badge className="bg-[var(--mw-green)] hover:bg-[var(--mw-success)] border-0 rounded-xs font-bold">RUNNING</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-sm bg-[var(--mw-yellow-50)] border border-[#FEF3C7]">
                     <span className="font-bold text-[var(--neutral-800)]">Haeger Press</span>
                     <Badge className="bg-[#F59E0B] hover:bg-[#D97706] text-foreground border-0 rounded-xs font-bold">ATTENTION</Badge>
                  </div>
               </div>
               <div className="bg-[var(--neutral-100)] p-3 text-center border-t border-[var(--neutral-200)]">
                  <Button variant="link" size="sm" className="text-[var(--neutral-500)] hover:text-[var(--neutral-800)] h-auto p-0 font-medium">View Full Andon Board</Button>
               </div>
            </Card>

            {/* Intelligence Hub Integration */}
            <Card className="shadow-none border-[var(--mw-purple)]/20 bg-card rounded-[var(--shape-lg)]">
               <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-[var(--neutral-500)] font-bold text-lg">
                     <Bot className="w-5 h-5" /> AI Troubleshoot
                  </div>
                  
                  <Button className="w-full bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12 mb-4 justify-between group rounded-sm font-bold">
                     Ask Intelligence Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-foreground bg-white/60 p-3 rounded-sm border border-[var(--mw-purple)]/20">
                     <Mic className="w-4 h-4" /> 
                     <span className="italic font-medium">"Why is Amada Ensis stopped?"</span>
                  </div>
               </div>
            </Card>

         </div>
      </div>

      {/* Modals */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
         <DialogContent className="max-w-2xl w-[90vw] p-0 overflow-hidden bg-white/95 backdrop-blur-xl sm:rounded-[var(--shape-lg)] border-[var(--neutral-200)]">
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