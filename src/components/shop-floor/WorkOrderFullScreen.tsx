import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  X, 
  Play, 
  Pause, 
  Maximize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Box, 
  FileText, 
  Settings, 
  Check, 
  ChevronDown, 
  Camera, 
  Plus, 
  Minus,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import liveCamImage from 'figma:asset/f55352753708d5a1c04a6b5e7921ba6a691ec0b2.png';
import cadModelImage from 'figma:asset/d86adce230f818f3c37eb92d8f5d16a03ab446bd.png';
import operatorAvatar from 'figma:asset/eda747c5b9fff8f376f736407b5003ea07ae2886.png';
import amadaLogo from 'figma:asset/c026b240c39a817b71ade4c0053350630c49d874.png';
import instructionImage from 'figma:asset/752bff3fda929cfb03de2d177a91f0aef5f1478d.png';
import { MaterialsModal } from './MaterialsModal';
import { CadFileModal } from './CadFileModal';
import { DefectReportModal } from './DefectReportModal';

export interface FullScreenWorkOrderProps {
  workOrder: any; 
  onClose: () => void;
}

export function WorkOrderFullScreen({ workOrder, onClose }: FullScreenWorkOrderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(workOrder?.status === 'progress');
  const [activeModal, setActiveModal] = useState<'materials' | 'cad' | 'defect' | null>(null);
  const [completedParts, setCompletedParts] = useState(78);
  const [viewMode, setViewMode] = useState<'camera' | '3d'>('camera');
  const [isOffline, setIsOffline] = useState(false);
  
  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(14 * 60 + 32); // Start at 00:14:32

  // Animation states
  const [isAnimatingButton, setIsAnimatingButton] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 700); 
  };

  const handlePartsIncrement = () => {
    setCompletedParts(p => p + 1);
    setIsAnimatingButton(true);
    setTimeout(() => setIsAnimatingButton(false), 200);
  };

  if (!workOrder) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[1000] bg-[var(--neutral-100)] flex flex-col transition-transform duration-[550ms] ease-[cubic-bezier(0.2,0.0,0,1.0)] will-change-transform font-sans",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* --- Fixed Header (72px) --- */}
      <div className="h-[72px] bg-card border-b border-[var(--neutral-200)] flex items-center shadow-sm shrink-0 sticky top-0 z-10">
        <div className="flex items-center px-6 xl:w-[360px] shrink-0 justify-start">
           <button 
             onClick={handleClose}
             className="flex items-center gap-3 text-[var(--neutral-500)] hover:text-[var(--neutral-800)] transition-colors group min-h-[48px]"
           >
              <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[var(--neutral-100)] transition-colors">
                 <ArrowLeft className="w-6 h-6" />
              </div>
              <span className="text-base font-medium">Back to Work Orders</span>
           </button>
        </div>

        <div className="flex-1 flex items-center pl-6 xl:pl-6 justify-center">
           <div className="text-center">
             <span className="text-xl font-bold text-[var(--neutral-800)] tracking-tight block">MO-26-401: Server Rack Chassis</span>
             <span className="text-sm text-[var(--neutral-500)] font-medium">Alliance Metal • Sheet 12 of 20</span>
           </div>
        </div>

        <div className="flex items-center justify-end px-6 xl:w-[400px] shrink-0 gap-4">
           <div className="flex items-center gap-2 bg-[var(--neutral-100)] px-3 py-1.5 rounded-full border border-[var(--neutral-200)]">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-[var(--neutral-400)]' : 'bg-[var(--mw-green)]'} animate-pulse`} />
              <span className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide">
                {isOffline ? 'Offline' : 'Online'}
              </span>
           </div>
           <button 
             onClick={handleClose}
             className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--neutral-500)] hover:text-[var(--neutral-800)] hover:bg-[var(--neutral-100)] transition-all min-h-[48px]"
           >
              <X className="w-8 h-8" />
           </button>
        </div>
      </div>

      {/* --- Content Area (3-Panel) --- */}
      <div className="flex-1 flex min-h-0 bg-[var(--neutral-100)] p-6 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Controls & Operator Info (360px fixed) */}
        <div className="w-[360px] shrink-0 flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
           
           {/* Operator Card */}
           <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[var(--neutral-200)] bg-card rounded-[var(--shape-lg)]">
             <CardContent className="p-6 flex items-center gap-4">
               <Avatar className="w-16 h-16 border-2 border-[var(--neutral-200)]">
                  <AvatarImage src={operatorAvatar} className="object-cover" />
                  <AvatarFallback className="bg-[var(--neutral-800)] text-white font-bold">DM</AvatarFallback>
               </Avatar>
               <div>
                  <div className="font-bold text-[var(--neutral-800)] text-lg">David Miller</div>
                  <div className="text-sm text-[var(--neutral-500)]">Senior Operator • Amada Ensis Laser</div>
               </div>
             </CardContent>
           </Card>

           {/* Timer & Pause Control */}
           <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[var(--neutral-200)] bg-card flex flex-col items-center justify-center py-10 rounded-[var(--shape-lg)]">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "w-[160px] h-[160px] rounded-full flex flex-col items-center justify-center transition-all duration-[250ms] shadow-xs active:scale-95 group relative overflow-hidden mb-8",
                  isRunning 
                    ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] hover:scale-105 hover:bg-[var(--mw-yellow-500)]" 
                    : "bg-[var(--neutral-800)] text-white hover:scale-105 hover:bg-[var(--neutral-900)]"
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-16 h-16 fill-current mb-2" />
                    <span className="text-xs font-bold tracking-widest uppercase">PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-16 h-16 fill-current ml-2 mb-2" />
                    <span className="text-xs font-bold tracking-widest uppercase">RESUME</span>
                  </>
                )}
              </button>

              <div className="text-center w-full">
                 <div className="text-xs font-bold text-[var(--neutral-500)] uppercase tracking-widest mb-2">WORK ORDER TIME</div>
                 <div className="text-6xl  font-bold tracking-tighter text-[var(--neutral-800)] leading-none mb-2 tabular-nums">{formatTime(elapsedSeconds)}</div>
                 <div className="text-base text-[var(--neutral-500)] font-medium bg-[var(--neutral-100)] inline-block px-3 py-1 rounded-full">Est. finish: 2:45 PM</div>
              </div>
           </Card>

           {/* Circular Parts Counter */}
           <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[var(--neutral-200)] bg-card rounded-[var(--shape-lg)]">
              <CardContent className="p-6 flex flex-col items-center">
                 <div className="flex items-center justify-between w-full mb-6 gap-4">
                    <Button 
                      variant="ghost" 
                      className="w-[64px] h-[64px] bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] text-[var(--neutral-800)] p-0 active:scale-95 transition-transform border border-[var(--neutral-200)]"
                      onClick={() => setCompletedParts(Math.max(0, completedParts - 1))}
                    >
                       <Minus className="w-8 h-8" />
                    </Button>
                    
                    {/* Donut Chart Visual */}
                    <div className="relative flex items-center justify-center">
                       {/* SVG Donut */}
                       <svg width="140" height="140" className="rotate-[-90deg]">
                          {/* Background Circle */}
                          <circle 
                             cx="70" 
                             cy="70" 
                             r="64" 
                             fill="transparent" 
                             stroke="var(--neutral-100)" 
                             strokeWidth="12" 
                          />
                          {/* Progress Circle */}
                          <circle 
                             cx="70" 
                             cy="70" 
                             r="64" 
                             fill="transparent" 
                             stroke="var(--mw-yellow-400)" 
                             strokeWidth="12"
                             strokeDasharray={2 * Math.PI * 64}
                             strokeDashoffset={(2 * Math.PI * 64) * ((100 - completedParts) / 100)}
                             strokeLinecap="round"
                             className="transition-all duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)]"
                          />
                       </svg>

                       {/* Centered Large Number */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                          <span key={completedParts} className="text-5xl font-bold text-[var(--neutral-800)] leading-none number-change tabular-nums">
                             {completedParts}
                          </span>
                          <span className="text-xs font-bold text-[var(--neutral-500)] uppercase tracking-wide mt-1">/ 100</span>
                       </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-[64px] h-[64px] bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] text-[var(--neutral-800)] p-0 active:scale-95 transition-transform border border-[var(--neutral-200)]"
                      onClick={handlePartsIncrement}
                    >
                       <Plus className="w-8 h-8" />
                    </Button>
                 </div>

                 {/* Label */}
                 <div className="text-xs font-bold text-[var(--neutral-500)] uppercase tracking-widest text-center">
                    UNITS COMPLETED
                 </div>
              </CardContent>
           </Card>

           {/* Emergency Stop Button (56px) */}
           <button className="w-full h-[56px] bg-[var(--mw-error)] text-white text-base font-bold uppercase tracking-wider rounded-sm border-2 border-[var(--mw-error-600)] hover:bg-[var(--mw-error-600)] transition-colors shadow-[var(--elevation-2)] emergency-stop mt-auto">
              EMERGENCY STOP
           </button>

        </div>

        {/* CENTER PANEL: Visual & Machine Status (Flexible) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--neutral-100)] relative gap-4 h-full">
           
           {/* Machine Performance Banner (Solid Yellow) */}
           <div className="bg-[var(--mw-yellow-400)] rounded-[var(--shape-lg)] p-4 shadow-sm z-20 relative flex items-center justify-between text-[var(--neutral-800)]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm">
                    <img src={amadaLogo} className="w-8 h-8 object-contain" alt="Amada" />
                 </div>
                 <div>
                    <div className="font-bold text-lg leading-none">Amada Ensis Laser</div>
                    <div className="text-sm font-medium opacity-80 mt-1">Cycle Time: 3:45 (Target: 3:20)</div>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-[var(--shape-lg)] border border-black/5">
                 <AlertTriangle className="w-5 h-5 text-[var(--neutral-800)]" />
                 <span className="font-bold text-sm uppercase">13% Slower than Target</span>
              </div>
           </div>

           {/* Visual Area (Camera/CAD) */}
           <div className="flex-1 relative bg-black rounded-[var(--shape-lg)] overflow-hidden shadow-sm border border-[var(--neutral-200)]">
              
              {/* Toggle Controls */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 rounded-full p-1 shadow-sm border border-[var(--neutral-200)] flex">
                 <button 
                   onClick={() => setViewMode('camera')}
                   className={cn(
                     "h-[40px] px-6 rounded-full text-sm font-bold transition-all duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)]",
                     viewMode === 'camera' ? "bg-[var(--neutral-800)] text-white shadow-sm" : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
                   )}
                 >
                   Live Cam
                 </button>
                 <button 
                   onClick={() => setViewMode('3d')}
                   className={cn(
                     "h-[40px] px-6 rounded-full text-sm font-bold transition-all duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)]",
                     viewMode === '3d' ? "bg-[var(--neutral-800)] text-white shadow-sm" : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
                   )}
                 >
                   CAD
                 </button>
              </div>

              {/* View Content */}
              <div className="w-full h-full flex items-center justify-center bg-[var(--neutral-900)]">
                 {viewMode === 'camera' ? (
                    <div className="relative w-full h-full">
                       <iframe 
                         src="https://player.vimeo.com/video/1146446628?autoplay=1&loop=1&muted=1&background=1" 
                         className="absolute top-1/2 left-1/2 w-[170%] h-[170%] -translate-x-1/2 -translate-y-1/2 opacity-90 pointer-events-none" 
                         allow="autoplay; fullscreen; picture-in-picture"
                         allowFullScreen
                         frameBorder="0"
                       />
                       <div className="absolute bottom-6 left-6 z-10">
                          <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10">
                             <span className="w-2 h-2 rounded-full bg-[var(--mw-green)] animate-[pulse_2s_cubic-bezier(0.2,0,0,1)_infinite]" />
                             Live Feed
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="relative w-full h-full bg-card flex items-center justify-center">
                       <iframe 
                         src="https://player.vimeo.com/video/1146463353?autoplay=1&loop=1&muted=1&background=1" 
                         className="absolute top-1/2 left-1/2 w-[170%] h-[170%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                         allow="autoplay; fullscreen; picture-in-picture"
                         allowFullScreen
                         frameBorder="0"
                       />
                       
                       <div className="absolute bottom-6 right-6 flex gap-2">
                          <Button size="icon" variant="outline" className="h-10 w-10 bg-card shadow-sm rounded-full"><RotateCcw className="w-4 h-4 text-[var(--neutral-800)]"/></Button>
                          <Button size="icon" variant="outline" className="h-10 w-10 bg-card shadow-sm rounded-full"><ZoomIn className="w-4 h-4 text-[var(--neutral-800)]"/></Button>
                          <Button size="icon" variant="outline" className="h-10 w-10 bg-card shadow-sm rounded-full"><ZoomOut className="w-4 h-4 text-[var(--neutral-800)]"/></Button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
           
           {/* Bottom Action Bar */}
           <div className="h-[80px] bg-card rounded-[var(--shape-lg)] shadow-sm border border-[var(--neutral-200)] flex items-center px-6 gap-4">
              <Button 
                onClick={() => setActiveModal('materials')}
                variant="outline"
                className="h-[48px] px-6 bg-[var(--neutral-100)] border-[var(--neutral-200)] hover:bg-[var(--neutral-200)] text-[var(--neutral-800)] gap-2 font-medium"
              >
                 <Box className="w-5 h-5 text-[var(--neutral-500)]" />
                 Bill of Materials
              </Button>
              <Button 
                onClick={() => setActiveModal('cad')}
                variant="outline"
                className="h-[48px] px-6 bg-[var(--neutral-100)] border-[var(--neutral-200)] hover:bg-[var(--neutral-200)] text-[var(--neutral-800)] gap-2 font-medium"
              >
                 <FileText className="w-5 h-5 text-[var(--neutral-500)]" />
                 CAD File
              </Button>
              <div className="ml-auto flex items-center gap-2">
                 <span className="text-sm font-medium text-[var(--neutral-500)]">Next: MO-26-402 (Enclosure)</span>
                 <Button size="icon" variant="ghost" className="h-[48px] w-[48px] rounded-full hover:bg-[var(--neutral-100)]"><ChevronDown className="w-5 h-5 text-[var(--neutral-800)] rotate-[-90deg]" /></Button>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: Checklist (400px fixed) */}
        <div className="w-[400px] shrink-0 bg-card border border-[var(--neutral-200)] rounded-[var(--shape-lg)] flex flex-col z-20 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
           
           {/* Header */}
           <div className="p-6 border-b border-[var(--neutral-200)] bg-[var(--neutral-100)]">
               <div className="mb-1">
                  <span className="text-[10px] font-bold text-[var(--neutral-500)] uppercase tracking-widest">WORKFLOW</span>
               </div>
               <div className="text-lg font-bold text-[var(--neutral-800)]">Assembly Instructions</div>
           </div>

           {/* Steps Scroll Area */}
           <div className="flex-1 overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {/* Completed Step */}
              <div className="p-6 border-b border-[var(--neutral-200)] flex gap-4 opacity-[0.38] bg-[var(--neutral-100)]">
                 <div className="w-6 h-6 rounded-full bg-[var(--mw-green)] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <div className="font-medium text-[var(--neutral-800)] line-through decoration-[var(--neutral-500)]">1. Setup machine calibration</div>
                 </div>
              </div>

              {/* Active Step */}
              <div className="relative border-b border-[var(--neutral-200)]">
                 <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--mw-yellow-400)]" />
                 <div className="p-6 bg-card">
                    <div className="flex gap-3 mb-4 items-start">
                       <div className="w-6 h-6 rounded-full bg-[var(--mw-yellow-400)] flex items-center justify-center shrink-0 text-[var(--neutral-800)] font-bold text-xs mt-0.5">
                          2
                       </div>
                       <div>
                          <div className="font-bold text-lg text-[var(--neutral-800)]">Laser cutting operation</div>
                          <div className="text-sm text-[var(--neutral-500)] mt-1">Ensure safety guard is locked</div>
                       </div>
                    </div>
                    
                    {/* Substep A (Done) */}
                    <div className="mb-3 ml-9 flex items-center gap-3 opacity-60">
                       <CheckCircle2 className="w-5 h-5 text-[var(--mw-success)]" />
                       <span className="font-medium text-sm text-[var(--neutral-800)] line-through">A. Material prep & cleaning</span>
                    </div>

                    {/* Substep B (Active) */}
                    <div className="bg-[var(--neutral-100)] rounded-md border border-[var(--neutral-200)] overflow-hidden ml-9 mb-6">
                       <div className="p-3 border-b border-[var(--neutral-200)] flex items-center gap-2 bg-card">
                          <div className="w-2 h-2 rounded-full bg-[var(--mw-yellow-400)] animate-pulse" />
                          <span className="font-bold text-sm text-[var(--neutral-800)]">B. Run cutting program</span>
                       </div>
                       <div className="p-4">
                          {/* Instruction Image */}
                          <div className="bg-card rounded-sm h-[160px] w-full mb-4 border border-[var(--neutral-200)] overflow-hidden cursor-pointer hover:border-[var(--mw-yellow-400)] transition-colors group relative flex items-center justify-center">
                             <img src={instructionImage} alt="Instruction" className="h-full object-contain" />
                             <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-xs shadow-sm">
                                <Maximize2 className="w-4 h-4 text-[var(--neutral-800)]" />
                             </div>
                          </div>
                          
                          <div className="space-y-2 mb-6 text-sm text-[var(--neutral-800)]">
                             <p>• Verify program #P-2912 loaded</p>
                             <p>• Check focus lens clearance</p>
                             <p>• Monitor first 10mm of cut path</p>
                          </div>

                          {/* Quality Actions */}
                          <div className="space-y-3">
                             <Button 
                               className={cn(
                                 "w-full bg-[var(--mw-green)] hover:bg-[var(--mw-success)] text-white font-bold h-[56px] text-base shadow-sm transition-transform border-b-4 border-[var(--mw-success)] active:border-b-0 active:translate-y-1",
                                 isAnimatingButton && "scale-95"
                               )}
                               onClick={handlePartsIncrement}
                             >
                                <Check className="w-5 h-5 mr-2" /> PASS
                             </Button>
                             
                             <div className="flex gap-3">
                               <Button 
                                 className="flex-1 bg-[var(--mw-error)] hover:bg-[var(--mw-error-600)] text-white font-bold h-[48px] text-sm shadow-sm border-b-4 border-[var(--mw-error-600)] active:border-b-0 active:translate-y-1"
                                 onClick={() => setActiveModal('defect')}
                               >
                                  <X className="w-4 h-4 mr-2" /> FAIL
                               </Button>
                               <Button 
                                 className="flex-1 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] font-bold h-[48px] text-sm shadow-sm border-b-4 border-[var(--mw-yellow-700)] active:border-b-0 active:translate-y-1"
                               >
                                  <Pause className="w-4 h-4 mr-2" /> HOLD
                               </Button>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Next Substep */}
                     <div className="mb-2 ml-9 flex items-center gap-3 opacity-40">
                       <div className="w-5 h-5 rounded-full border-2 border-[var(--neutral-500)] flex items-center justify-center text-[10px] font-bold">C</div>
                       <span className="font-medium text-sm text-[var(--neutral-800)]">Deburr edges</span>
                    </div>

                 </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 flex gap-4 opacity-40 hover:bg-[var(--neutral-100)] transition-colors cursor-not-allowed">
                 <div className="w-6 h-6 rounded-full border-2 border-[var(--neutral-200)] flex items-center justify-center shrink-0 text-[var(--neutral-500)] font-bold text-xs">
                    3
                 </div>
                 <div className="font-bold text-[var(--neutral-800)]">Final Inspection</div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Modals */}
      <MaterialsModal isOpen={activeModal === 'materials'} onClose={() => setActiveModal(null)} />
      <CadFileModal isOpen={activeModal === 'cad'} onClose={() => setActiveModal(null)} />
      <DefectReportModal 
        isOpen={activeModal === 'defect'} 
        onClose={() => setActiveModal(null)} 
        partNumber={completedParts}
      />

      <style>{`
        @keyframes number-slide {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .number-change {
          animation: number-slide 250ms ease-out;
        }
        @keyframes emergency-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .emergency-stop {
          animation: emergency-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}