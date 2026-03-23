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
        "fixed inset-0 z-[1000] bg-[#F5F5F5] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.2,0.0,0,1.0)] will-change-transform font-sans",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* --- Fixed Header (72px) --- */}
      <div className="h-[72px] bg-white border-b border-[#E5E4E0] flex items-center shadow-sm shrink-0 sticky top-0 z-10">
        <div className="flex items-center px-6 xl:w-[360px] shrink-0 justify-start">
           <button 
             onClick={handleClose}
             className="flex items-center gap-3 text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors group min-h-[48px]"
           >
              <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#F5F5F5] transition-colors">
                 <ArrowLeft className="w-6 h-6" />
              </div>
              <span className="text-base font-medium">Back to Work Orders</span>
           </button>
        </div>

        <div className="flex-1 flex items-center pl-6 xl:pl-6 justify-center">
           <div className="text-center">
             <span className="text-xl font-bold text-[#2C2C2C] tracking-tight block">MO-26-401: Server Rack Chassis</span>
             <span className="text-sm text-[#6B6B6B] font-medium">Alliance Metal • Sheet 12 of 20</span>
           </div>
        </div>

        <div className="flex items-center justify-end px-6 xl:w-[400px] shrink-0 gap-4">
           <div className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-1.5 rounded-full border border-[#E5E4E0]">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-gray-400' : 'bg-[#4CAF50]'} animate-pulse`} />
              <span className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
                {isOffline ? 'Offline' : 'Online'}
              </span>
           </div>
           <button 
             onClick={handleClose}
             className="w-12 h-12 rounded-full flex items-center justify-center text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F5F5F5] transition-all min-h-[48px]"
           >
              <X className="w-8 h-8" />
           </button>
        </div>
      </div>

      {/* --- Content Area (3-Panel) --- */}
      <div className="flex-1 flex min-h-0 bg-[#F5F5F5] p-6 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Controls & Operator Info (360px fixed) */}
        <div className="w-[360px] shrink-0 flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
           
           {/* Operator Card */}
           <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[#E5E4E0] bg-white rounded-[16px]">
             <CardContent className="p-5 flex items-center gap-4">
               <Avatar className="w-16 h-16 border-2 border-[#E5E4E0]">
                  <AvatarImage src={operatorAvatar} className="object-cover" />
                  <AvatarFallback className="bg-[#2C2C2C] text-white font-bold">DM</AvatarFallback>
               </Avatar>
               <div>
                  <div className="font-bold text-[#2C2C2C] text-lg">David Miller</div>
                  <div className="text-sm text-[#6B6B6B]">Senior Operator • Amada Ensis Laser</div>
               </div>
             </CardContent>
           </Card>

           {/* Timer & Pause Control */}
           <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[#E5E4E0] bg-white flex flex-col items-center justify-center py-10 rounded-[16px]">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "w-[160px] h-[160px] rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl active:scale-95 group relative overflow-hidden mb-8",
                  isRunning 
                    ? "bg-[#FFCF4B] text-[#2C2C2C] hover:scale-105 hover:bg-[#FFD66B]" 
                    : "bg-[#2C2C2C] text-white hover:scale-105 hover:bg-[#1a1a1a]"
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
                 <div className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">WORK ORDER TIME</div>
                 <div className="text-[56px]  font-bold tracking-tighter text-[#2C2C2C] leading-none mb-2 tabular-nums">{formatTime(elapsedSeconds)}</div>
                 <div className="text-base text-[#6B6B6B] font-medium bg-[#F5F5F5] inline-block px-3 py-1 rounded-full">Est. finish: 2:45 PM</div>
              </div>
           </Card>

           {/* Circular Parts Counter */}
           <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-[#E5E4E0] bg-white rounded-[16px]">
              <CardContent className="p-6 flex flex-col items-center">
                 <div className="flex items-center justify-between w-full mb-6 gap-4">
                    <Button 
                      variant="ghost" 
                      className="w-[64px] h-[64px] rounded-[16px] bg-[#F5F5F5] hover:bg-[#E5E4E0] text-[#2C2C2C] p-0 active:scale-95 transition-transform border border-[#E5E4E0]"
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
                             stroke="#F5F5F5" 
                             strokeWidth="12" 
                          />
                          {/* Progress Circle */}
                          <circle 
                             cx="70" 
                             cy="70" 
                             r="64" 
                             fill="transparent" 
                             stroke="#FFCF4B" 
                             strokeWidth="12"
                             strokeDasharray={2 * Math.PI * 64}
                             strokeDashoffset={(2 * Math.PI * 64) * ((100 - completedParts) / 100)}
                             strokeLinecap="round"
                             className="transition-all duration-300 ease-in-out"
                          />
                       </svg>

                       {/* Centered Large Number */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                          <span key={completedParts} className="text-[48px] font-bold text-[#2C2C2C] leading-none number-change tabular-nums">
                             {completedParts}
                          </span>
                          <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide mt-1">/ 100</span>
                       </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-[64px] h-[64px] rounded-[16px] bg-[#F5F5F5] hover:bg-[#E5E4E0] text-[#2C2C2C] p-0 active:scale-95 transition-transform border border-[#E5E4E0]"
                      onClick={handlePartsIncrement}
                    >
                       <Plus className="w-8 h-8" />
                    </Button>
                 </div>

                 {/* Label */}
                 <div className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest text-center">
                    UNITS COMPLETED
                 </div>
              </CardContent>
           </Card>

           {/* Emergency Stop Button (56px) */}
           <button className="w-full h-[56px] bg-[#EF4444] text-white text-[16px] font-bold uppercase tracking-wider rounded-[8px] border-2 border-[#DC2626] hover:bg-[#DC2626] transition-colors shadow-md emergency-stop mt-auto">
              EMERGENCY STOP
           </button>

        </div>

        {/* CENTER PANEL: Visual & Machine Status (Flexible) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F5] relative gap-4 h-full">
           
           {/* Machine Performance Banner (Solid Yellow) */}
           <div className="bg-[#FFCF4B] rounded-[16px] p-4 shadow-sm z-20 relative flex items-center justify-between text-[#2C2C2C]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <img src={amadaLogo} className="w-8 h-8 object-contain" alt="Amada" />
                 </div>
                 <div>
                    <div className="font-bold text-lg leading-none">Amada Ensis Laser</div>
                    <div className="text-sm font-medium opacity-80 mt-1">Cycle Time: 3:45 (Target: 3:20)</div>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-black/5">
                 <AlertTriangle className="w-5 h-5 text-[#2C2C2C]" />
                 <span className="font-bold text-sm uppercase">13% Slower than Target</span>
              </div>
           </div>

           {/* Visual Area (Camera/CAD) */}
           <div className="flex-1 relative bg-black rounded-[16px] overflow-hidden shadow-sm border border-[#E5E4E0]">
              
              {/* Toggle Controls */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-1 shadow-sm border border-[#E5E4E0] flex">
                 <button 
                   onClick={() => setViewMode('camera')}
                   className={cn(
                     "h-[40px] px-6 rounded-full text-sm font-bold transition-all duration-300 ease-out",
                     viewMode === 'camera' ? "bg-[#2C2C2C] text-white shadow-sm" : "text-[#6B6B6B] hover:bg-[#F5F5F5]"
                   )}
                 >
                   Live Cam
                 </button>
                 <button 
                   onClick={() => setViewMode('3d')}
                   className={cn(
                     "h-[40px] px-6 rounded-full text-sm font-bold transition-all duration-300 ease-out",
                     viewMode === '3d' ? "bg-[#2C2C2C] text-white shadow-sm" : "text-[#6B6B6B] hover:bg-[#F5F5F5]"
                   )}
                 >
                   CAD
                 </button>
              </div>

              {/* View Content */}
              <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
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
                          <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10">
                             <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-[pulse_2s_ease-in-out_infinite]" />
                             Live Feed
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="relative w-full h-full bg-white flex items-center justify-center">
                       <iframe 
                         src="https://player.vimeo.com/video/1146463353?autoplay=1&loop=1&muted=1&background=1" 
                         className="absolute top-1/2 left-1/2 w-[170%] h-[170%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                         allow="autoplay; fullscreen; picture-in-picture"
                         allowFullScreen
                         frameBorder="0"
                       />
                       
                       <div className="absolute bottom-6 right-6 flex gap-2">
                          <Button size="icon" variant="outline" className="h-10 w-10 bg-white shadow-sm rounded-full"><RotateCcw className="w-4 h-4 text-[#2C2C2C]"/></Button>
                          <Button size="icon" variant="outline" className="h-10 w-10 bg-white shadow-sm rounded-full"><ZoomIn className="w-4 h-4 text-[#2C2C2C]"/></Button>
                          <Button size="icon" variant="outline" className="h-10 w-10 bg-white shadow-sm rounded-full"><ZoomOut className="w-4 h-4 text-[#2C2C2C]"/></Button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
           
           {/* Bottom Action Bar */}
           <div className="h-[80px] bg-white rounded-[16px] shadow-sm border border-[#E5E4E0] flex items-center px-6 gap-4">
              <Button 
                onClick={() => setActiveModal('materials')}
                variant="outline"
                className="h-[48px] px-6 bg-[#F5F5F5] border-[#E5E4E0] hover:bg-[#E5E4E0] text-[#2C2C2C] rounded-[8px] gap-2 font-medium"
              >
                 <Box className="w-5 h-5 text-[#6B6B6B]" />
                 Bill of Materials
              </Button>
              <Button 
                onClick={() => setActiveModal('cad')}
                variant="outline"
                className="h-[48px] px-6 bg-[#F5F5F5] border-[#E5E4E0] hover:bg-[#E5E4E0] text-[#2C2C2C] rounded-[8px] gap-2 font-medium"
              >
                 <FileText className="w-5 h-5 text-[#6B6B6B]" />
                 CAD File
              </Button>
              <div className="ml-auto flex items-center gap-2">
                 <span className="text-sm font-medium text-[#6B6B6B]">Next: MO-26-402 (Enclosure)</span>
                 <Button size="icon" variant="ghost" className="h-[48px] w-[48px] rounded-full hover:bg-[#F5F5F5]"><ChevronDown className="w-5 h-5 text-[#2C2C2C] rotate-[-90deg]" /></Button>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: Checklist (400px fixed) */}
        <div className="w-[400px] shrink-0 bg-white border border-[#E5E4E0] rounded-[16px] flex flex-col z-20 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
           
           {/* Header */}
           <div className="p-6 border-b border-[#E5E4E0] bg-[#F5F5F5]">
               <div className="mb-1">
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">WORKFLOW</span>
               </div>
               <div className="text-lg font-bold text-[#2C2C2C]">Assembly Instructions</div>
           </div>

           {/* Steps Scroll Area */}
           <div className="flex-1 overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {/* Completed Step */}
              <div className="p-5 border-b border-[#E5E4E0] flex gap-4 opacity-50 bg-[#F5F5F5]">
                 <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <div className="font-medium text-[#2C2C2C] line-through decoration-[#6B6B6B]">1. Setup machine calibration</div>
                 </div>
              </div>

              {/* Active Step */}
              <div className="relative border-b border-[#E5E4E0]">
                 <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FFCF4B]" />
                 <div className="p-5 bg-white">
                    <div className="flex gap-3 mb-4 items-start">
                       <div className="w-6 h-6 rounded-full bg-[#FFCF4B] flex items-center justify-center shrink-0 text-[#2C2C2C] font-bold text-xs mt-0.5">
                          2
                       </div>
                       <div>
                          <div className="font-bold text-lg text-[#2C2C2C]">Laser cutting operation</div>
                          <div className="text-sm text-[#6B6B6B] mt-1">Ensure safety guard is locked</div>
                       </div>
                    </div>
                    
                    {/* Substep A (Done) */}
                    <div className="mb-3 ml-9 flex items-center gap-3 opacity-60">
                       <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                       <span className="font-medium text-sm text-[#2C2C2C] line-through">A. Material prep & cleaning</span>
                    </div>

                    {/* Substep B (Active) */}
                    <div className="bg-[#F5F5F5] rounded-[12px] border border-[#E5E4E0] overflow-hidden ml-9 mb-6">
                       <div className="p-3 border-b border-[#E5E4E0] flex items-center gap-2 bg-white">
                          <div className="w-2 h-2 rounded-full bg-[#FFCF4B] animate-pulse" />
                          <span className="font-bold text-sm text-[#2C2C2C]">B. Run cutting program</span>
                       </div>
                       <div className="p-4">
                          {/* Instruction Image */}
                          <div className="bg-white rounded-[8px] h-[160px] w-full mb-4 border border-[#E5E4E0] overflow-hidden cursor-pointer hover:border-[#FFCF4B] transition-colors group relative flex items-center justify-center">
                             <img src={instructionImage} alt="Instruction" className="h-full object-contain" />
                             <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-[4px] shadow-sm">
                                <Maximize2 className="w-4 h-4 text-[#2C2C2C]" />
                             </div>
                          </div>
                          
                          <div className="space-y-2 mb-6 text-sm text-[#2C2C2C]">
                             <p>• Verify program #P-2912 loaded</p>
                             <p>• Check focus lens clearance</p>
                             <p>• Monitor first 10mm of cut path</p>
                          </div>

                          {/* Quality Actions */}
                          <div className="space-y-3">
                             <Button 
                               className={cn(
                                 "w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white font-bold h-[56px] text-[16px] rounded-[8px] shadow-sm transition-transform border-b-4 border-[#388E3C] active:border-b-0 active:translate-y-1",
                                 isAnimatingButton && "scale-95"
                               )}
                               onClick={handlePartsIncrement}
                             >
                                <Check className="w-5 h-5 mr-2" /> PASS
                             </Button>
                             
                             <div className="flex gap-3">
                               <Button 
                                 className="flex-1 bg-[#EF4444] hover:bg-[#D32F2F] text-white font-bold h-[48px] text-sm rounded-[8px] shadow-sm border-b-4 border-[#D32F2F] active:border-b-0 active:translate-y-1"
                                 onClick={() => setActiveModal('defect')}
                               >
                                  <X className="w-4 h-4 mr-2" /> FAIL
                               </Button>
                               <Button 
                                 className="flex-1 bg-[#FFCF4B] hover:bg-[#FFC107] text-[#2C2C2C] font-bold h-[48px] text-sm rounded-[8px] shadow-sm border-b-4 border-[#F57F17] active:border-b-0 active:translate-y-1"
                               >
                                  <Pause className="w-4 h-4 mr-2" /> HOLD
                               </Button>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Next Substep */}
                     <div className="mb-2 ml-9 flex items-center gap-3 opacity-40">
                       <div className="w-5 h-5 rounded-full border-2 border-[#6B6B6B] flex items-center justify-center text-[10px] font-bold">C</div>
                       <span className="font-medium text-sm text-[#2C2C2C]">Deburr edges</span>
                    </div>

                 </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 flex gap-4 opacity-40 hover:bg-[#F5F5F5] transition-colors cursor-not-allowed">
                 <div className="w-6 h-6 rounded-full border-2 border-[#E5E4E0] flex items-center justify-center shrink-0 text-[#6B6B6B] font-bold text-xs">
                    3
                 </div>
                 <div className="font-bold text-[#2C2C2C]">Final Inspection</div>
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