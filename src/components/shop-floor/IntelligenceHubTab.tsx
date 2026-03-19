import React, { useState } from 'react';
import { 
  Mic, 
  Search, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Wrench, 
  Package, 
  User, 
  Play, 
  Pause, 
  StopCircle, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Info,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogPortal, DialogOverlay } from '../ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { motion, AnimatePresence } from "motion/react";
import { cn } from '../ui/utils';

// --- Mock Data ---

type InsightType = 'efficiency' | 'quality' | 'scheduling' | 'material' | 'performance' | 'risk' | 'maintenance';
type Severity = 'critical' | 'warning' | 'success' | 'info';

interface Insight {
  id: string;
  type: InsightType;
  severity: Severity;
  title: string;
  time: string;
  content: React.ReactNode;
  actions: { label: string; variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary', onClick?: () => void }[];
}

const INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'efficiency',
    severity: 'warning',
    title: 'EFFICIENCY OPPORTUNITY',
    time: '12 min ago',
    content: (
      <div className="space-y-4">
        <div>
          <div className="font-medium text-lg text-[#2C2C2C]">MO-26-401: Server Rack Chassis - 16ga (Amada Ensis Laser)</div>
          <div className="text-[#6B6B6B] mt-1 text-sm">
            <p>Cycle time: <span className="font-semibold text-[#2C2C2C]">3:45</span> vs Target: <span className="font-semibold text-[#2C2C2C]">3:20</span></p>
            <p className="text-[#EF4444] font-medium mt-1">Variance: +25s (12% slower)</p>
          </div>
        </div>
        
        {/* Analysis Section (Blue) */}
        <div className="bg-[#EFF6FF] p-4 rounded-[8px] text-sm border border-[#DBEAFE]">
          <div className="font-bold text-[#1E3A8A] flex items-center gap-2 mb-2 uppercase text-xs tracking-wide">
            <Info className="w-4 h-4" /> Analysis
          </div>
          <ul className="space-y-1 text-[#1E40AF] list-disc list-inside">
            <li>Similar parts by Elena: 3:10 avg (optimized nesting)</li>
            <li>Historical data: This part type averages 3:15</li>
          </ul>
        </div>

        <div className="text-sm text-[#2C2C2C]">
          <div className="font-bold mb-2 uppercase text-xs text-[#6B6B6B] tracking-wide">Recommendations</div>
          <ol className="list-decimal list-inside space-y-2 pl-1">
            <li className="pl-2">Review David's nesting strategy</li>
            <li className="pl-2">Check slat condition (slag buildup affecting loading)</li>
          </ol>
        </div>
      </div>
    ),
    actions: [
      { label: 'View Work Standard', variant: 'outline' },
      { label: 'Notify Operator', variant: 'secondary' }
    ]
  },
  {
    id: '2',
    type: 'quality',
    severity: 'critical',
    title: 'QUALITY ALERT',
    time: 'Just now',
    content: (
      <div className="space-y-4">
        <div>
          <div className="font-medium text-lg text-[#2C2C2C]">MO-26-401: Kerf Width Deviation</div>
          <div className="text-[#6B6B6B] mt-2 text-sm">
            <p className="font-medium text-[#2C2C2C] mb-2">Last 10 measurements:</p>
            <div className="h-24 flex items-end gap-1 pb-4 border-b border-[#E5E4E0] relative">
               {[0.2, 0.21, 0.22, 0.24, 0.25, 0.28, 0.32, 0.35, 0.38].map((h, i) => (
                 <div key={i} className="flex-1 bg-[#FCA5A5] rounded-t-sm relative group hover:bg-[#EF4444] transition-colors" style={{ height: `${((h - 0.2) / 0.2) * 100}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-[#2C2C2C] text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">{h}mm</div>
                 </div>
               ))}
               <div className="absolute top-[20%] w-full border-t border-dashed border-[#EF4444] text-[10px] text-[#EF4444] font-bold">Max Limit 0.30mm</div>
            </div>
          </div>
        </div>
        
        {/* Pattern Detection (Red) */}
        <div className="bg-[#FEF2F2] p-4 rounded-[8px] text-sm border border-[#FEE2E2]">
          <div className="font-bold text-[#991B1B] flex items-center gap-2 mb-1 uppercase text-xs tracking-wide">
            <AlertTriangle className="w-4 h-4" /> Pattern Detected
          </div>
          <p className="text-[#7F1D1D]">Consistent widening of cut kerf. Lens contamination suspected.</p>
        </div>

        <div className="text-sm text-[#2C2C2C]">
          <div className="font-bold mb-2 uppercase text-xs text-[#6B6B6B] tracking-wide">Immediate Action</div>
          <ol className="list-decimal list-inside space-y-2 pl-1 font-medium">
            <li className="pl-2">STOP production on MO-26-401</li>
            <li className="pl-2">Inspect/Clean lens & nozzle on Amada Ensis</li>
          </ol>
        </div>
      </div>
    ),
    actions: [
      { label: 'Stop Production', variant: 'destructive' },
      { label: 'Call Maintenance', variant: 'outline' }
    ]
  },
  {
    id: '3',
    type: 'scheduling',
    severity: 'success',
    title: 'SCHEDULING OPPORTUNITY',
    time: '8 min ago',
    content: (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
           <div>
              <div className="font-medium text-lg text-[#2C2C2C]">Trumpf TruBend 5000 available in 22 min</div>
              <div className="text-[#6B6B6B] text-sm">Current job completion: 94%</div>
           </div>
        </div>
        
        <div>
           <div className="flex justify-between text-xs mb-1 text-[#6B6B6B] font-medium">
              <span>MO-26-402 Progress</span>
              <span className="text-[#2C2C2C]">94%</span>
           </div>
           <div className="h-2 bg-[#E5E4E0] rounded-full overflow-hidden">
              <div className="h-full bg-[#2C2C2C] w-[94%]" />
           </div>
        </div>
        
        {/* Smart Suggestion (Green) */}
        <div className="bg-[#F0FDF4] p-4 rounded-[8px] text-sm border border-[#DCFCE7]">
          <div className="font-bold text-[#166534] flex items-center gap-2 mb-2 uppercase text-xs tracking-wide">
            <Sparkles className="w-4 h-4" /> Smart Suggestion
          </div>
          <p className="text-[#15803D] font-medium">Start MO-26-403 setup NOW for seamless transition</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-[#F8F7F4] p-3 rounded-[8px] border border-[#E5E4E0]">
              <div className="text-[10px] font-bold text-[#6B6B6B] uppercase mb-2">Benefits</div>
              <ul className="text-sm space-y-1 text-[#2C2C2C]">
                 <li>• Zero idle time</li>
                 <li>• Save 2h total</li>
              </ul>
           </div>
           <div className="bg-[#F8F7F4] p-3 rounded-[8px] border border-[#E5E4E0]">
              <div className="text-[10px] font-bold text-[#6B6B6B] uppercase mb-2">Requirements</div>
              <ul className="text-sm space-y-1 text-[#2C2C2C]">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#4CAF50]"/> 5052 Alum ready</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#4CAF50]"/> Dies staged</li>
              </ul>
           </div>
        </div>
      </div>
    ),
    actions: [
      { label: 'Start Setup', variant: 'default' },
      { label: 'View Schedule', variant: 'ghost' }
    ]
  },
  {
    id: '5',
    type: 'performance',
    severity: 'info',
    title: 'PERFORMANCE SUMMARY',
    time: '1 hour ago',
    content: (
       <div className="space-y-4">
          <div>
             <div className="font-medium text-lg text-[#2C2C2C]">Shift performance vs targets</div>
             <div className="mt-3">
                <div className="flex justify-between text-sm mb-1 text-[#6B6B6B] font-medium">
                   <span>Overall Efficiency</span>
                   <span className="text-[#2C2C2C]">87%</span>
                </div>
                <div className="h-3 w-full bg-[#E5E4E0] rounded-full overflow-hidden">
                   <div className="h-full bg-[#2C2C2C] w-[87%]" />
                </div>
                <div className="text-xs text-[#6B6B6B] mt-1 text-right">Target: 85%</div>
             </div>
          </div>

          <div className="space-y-3">
             <div className="p-3 bg-[#F8F7F4] rounded-[8px] border border-[#E5E4E0]">
                <div className="flex justify-between items-center mb-1">
                   <div className="font-medium text-sm flex items-center gap-2 text-[#2C2C2C]">David Miller (Amada Ensis) 
                     <Badge variant="outline" className="text-[10px] h-5 px-2 bg-[#FFCF4B]/10 text-[#2C2C2C] border-transparent font-medium rounded-full">Below Target</Badge>
                   </div>
                   <div className="font-bold text-[#EF4444] text-sm">82%</div>
                </div>
                <div className="text-xs text-[#6B6B6B]">MO-26-401: Slower than historical average</div>
             </div>
             <div className="p-3 bg-[#F8F7F4] rounded-[8px] border border-[#E5E4E0]">
                <div className="flex justify-between items-center mb-1">
                   <div className="font-medium text-sm flex items-center gap-2 text-[#2C2C2C]">Elena Rodriguez (TruBend) 
                     <Badge variant="outline" className="text-[10px] h-5 px-2 bg-[#4CAF50]/10 text-[#2C2C2C] border-transparent font-medium rounded-full">Exceeding Target</Badge>
                   </div>
                   <div className="font-bold text-[#4CAF50] text-sm">94%</div>
                </div>
                <div className="text-xs text-[#6B6B6B]">MO-26-402: 15% faster than estimate</div>
             </div>
          </div>
       </div>
    ),
    actions: [
       { label: 'View Detailed Stats', variant: 'outline' },
       { label: 'Schedule Training', variant: 'ghost' }
    ]
  }
];

// --- Components ---

const FilterBadge = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
      active 
        ? "bg-[#2C2C2C] text-white border-[#2C2C2C] shadow-sm" 
        : "bg-white text-[#6B6B6B] hover:bg-[#F5F5F5] border-[#E5E4E0] hover:text-[#2C2C2C]"
    )}
  >
    {label}
  </button>
);

const InsightCard = ({ insight }: { insight: Insight }) => {
   // Using simple clean headers instead of colored backgrounds for the header
   const headerIconColors = {
      critical: "text-[#EF4444]",
      warning: "text-[#FFCF4B]",
      success: "text-[#4CAF50]",
      info: "text-[#3B82F6]"
   };

   return (
      <Card className="overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#E5E4E0] rounded-[16px] bg-white transition-shadow hover:shadow-md">
         <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E4E0]">
            <div className="flex items-center gap-3">
               <div className={cn("flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F5]", headerIconColors[insight.severity])}>
                  {insight.severity === 'critical' && <AlertTriangle className="w-4 h-4 fill-current/10" />}
                  {insight.severity === 'warning' && <AlertTriangle className="w-4 h-4 fill-current/10" />}
                  {insight.severity === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {insight.severity === 'info' && <Info className="w-4 h-4" />}
               </div>
               <span className="text-[#2C2C2C] text-sm font-bold uppercase tracking-wide">{insight.title}</span>
            </div>
            <div className="text-xs text-[#6B6B6B] font-medium flex items-center gap-1">
               <Clock className="w-3 h-3" /> {insight.time}
            </div>
         </div>
         <CardContent className="p-6">
            {insight.content}
         </CardContent>
         <CardFooter className="bg-[#F8F7F4] px-6 py-4 gap-3 flex flex-wrap border-t border-[#E5E4E0]">
            {insight.actions.map((action, i) => (
               <Button 
                  key={i} 
                  variant={action.variant as any || 'default'} 
                  size="sm"
                  className={cn(
                    "h-9 font-medium rounded-[8px]", 
                    action.variant === 'destructive' ? "bg-[#EF4444] hover:bg-[#DC2626]" :
                    action.variant === 'outline' ? "border-[#E5E4E0] bg-white hover:bg-[#F5F5F5] text-[#2C2C2C]" :
                    action.variant === 'ghost' ? "text-[#6B6B6B] hover:text-[#2C2C2C] ml-auto" :
                    "bg-[#FFCF4B] hover:bg-[#FFC107] text-[#2C2C2C]"
                  )}
                  onClick={action.onClick}
               >
                  {action.label}
               </Button>
            ))}
         </CardFooter>
      </Card>
   );
};

export function IntelligenceHubTab() {
  const [filter, setFilter] = useState('All');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  React.useEffect(() => {
     let interval: NodeJS.Timeout;
     if (isRecording) {
        interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
     } else {
        setRecordingTime(0);
     }
     return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredInsights = filter === 'All' 
     ? INSIGHTS 
     : INSIGHTS.filter(i => i.title.toLowerCase().includes(filter.toLowerCase()) || i.type === filter.toLowerCase());

  return (
    <div className="flex flex-col h-full overflow-y-auto max-w-[1600px] mx-auto w-full p-4 gap-6 bg-[#F8F7F4]">
       
       {/* Header */}
       <div className="shrink-0 flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <div>
                <h2 className="text-[32px] font-semibold tracking-tight text-[#2C2C2C]">Intelligence Hub</h2>
                <p className="text-[#6B6B6B] text-lg">AI insights & predictive analysis</p>
             </div>
             <Button 
                size="lg" 
                className="rounded-full h-12 px-8 shadow-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2 border-0 font-medium transition-transform active:scale-95"
                onClick={() => setIsVoiceActive(true)}
             >
                <Sparkles className="w-5 h-5 fill-white/20" /> Ask AI Assistant
             </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
             {['All', 'Critical', 'Efficiency', 'Quality', 'Scheduling'].map(f => (
                <FilterBadge key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
             ))}
          </div>
       </div>

       {/* Content Grid */}
       <div className="flex-1 -mr-4 pr-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
             {filteredInsights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
             ))}
          </div>
       </div>

       {/* Voice Interface Modal */}
       <Dialog open={isVoiceActive} onOpenChange={setIsVoiceActive}>
          <DialogPortal>
             <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
             <DialogPrimitive.Content 
                className="fixed left-[50%] top-[50%] z-[1050] w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%] p-0 overflow-hidden bg-[#1A1A1A] border border-[#333] text-white rounded-[24px] shadow-2xl focus:outline-none"
             >
                <DialogTitle className="sr-only">Voice Interface</DialogTitle>
                <DialogDescription className="sr-only">Voice command interface for shop floor</DialogDescription>
                
                {/* Close Button */}
                <DialogPrimitive.Close className="absolute top-6 left-6 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:pointer-events-none">
                   <X className="h-5 w-5 text-white" />
                   <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
                
                {/* Settings Button (placeholder for the icon in top-right) */}
                <button className="absolute top-6 right-6 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A1A1A]">
                   <MoreHorizontal className="h-5 w-5 text-white" />
                   <span className="sr-only">Settings</span>
                </button>
                
                {/* Header */}
                <div className="text-center pt-8 pb-4 border-b border-[#333]">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-white">Intelligence Hub</h3>
                   <div className="flex items-center justify-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                      <span className="text-xs text-[#A78BFA] uppercase tracking-wide font-medium">Online</span>
                   </div>
                </div>
                
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px] relative">
               
                {isRecording ? (
                   <>
                      <div className="mb-8 relative">
                         <div className="w-24 h-24 rounded-full bg-[#7C3AED]/20 animate-pulse flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                               <Mic className="w-8 h-8 text-white" />
                            </div>
                         </div>
                      </div>
                      <div className="text-2xl font-bold mb-2">Listening...</div>
                      <div className="text-[#A78BFA] font-mono text-xl mb-8">{formatTime(recordingTime)}</div>
                      <div className="w-full max-w-xs h-12 flex items-center justify-center gap-1 mb-12">
                         {[...Array(12)].map((_, i) => (
                            <div 
                               key={i} 
                               className="w-1.5 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                               style={{ 
                                  height: `${Math.random() * 100}%`,
                                  animationDelay: `${i * 0.1}s` 
                               }}
                            />
                         ))}
                      </div>
                      <div className="flex gap-4 w-full">
                         <Button 
                            className="flex-1 h-14 text-base font-bold bg-[#333] hover:bg-[#444] text-white rounded-[12px]"
                            onClick={() => setIsRecording(false)}
                         >
                            CANCEL
                         </Button>
                         <Button 
                            className="flex-1 h-14 text-base font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[12px]"
                            onClick={() => setIsRecording(false)}
                         >
                            DONE
                         </Button>
                      </div>
                   </>
                ) : (
                   <>
                      <div className="text-center space-y-3 mb-12">
                         <h3 className="text-2xl font-bold">How can I help?</h3>
                         <div className="bg-[#333] p-4 rounded-[16px] text-left max-w-xs mx-auto">
                            <p className="text-xs text-[#A3A3A3] mb-2 uppercase tracking-wide font-bold">Suggestions</p>
                            <div className="text-sm text-white space-y-2">
                               <p className="cursor-pointer hover:text-[#A78BFA]">"Show me efficiency for Amada Ensis Laser"</p>
                               <Separator className="bg-[#444]" />
                               <p className="cursor-pointer hover:text-[#A78BFA]">"Why is MO-26-402 delayed?"</p>
                               <Separator className="bg-[#444]" />
                               <p className="cursor-pointer hover:text-[#A78BFA]">"Check 5052 Aluminum inventory"</p>
                            </div>
                         </div>
                      </div>
                      
                      <Button 
                         className="w-20 h-20 rounded-full bg-white text-black hover:bg-[#F5F5F5] transition-all shadow-xl flex flex-col items-center justify-center gap-1 animate-pulse hover:animate-none"
                         onClick={() => setIsRecording(true)}
                      >
                         <Mic className="w-8 h-8" />
                      </Button>
                      <div className="text-sm font-medium text-[#A3A3A3] flex items-center gap-2 mt-4">
                        <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                        AI Assistant Listening
                     </div>
                   </>
                )}
                </div>
             </DialogPrimitive.Content>
          </DialogPortal>
       </Dialog>
    </div>
  );
}