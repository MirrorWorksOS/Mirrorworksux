import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  ArrowLeft, 
  Sparkles, 
  MoreHorizontal, 
  Settings,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { motion, AnimatePresence } from "motion/react";
import { cn } from '../ui/utils';

export function VoiceInterfaceMobile({ onClose }: { onClose?: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
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

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col overflow-hidden bg-[var(--neutral-900)] font-sans text-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 pt-12 pb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          {onClose ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium tracking-wide text-white/90">INTELLIGENCE HUB</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--mw-yellow-400)]" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--mw-yellow-400)]">Online</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative px-6">
        <AnimatePresence mode="wait">
          {!isRecording ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 -mt-20">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-[var(--mw-mirage)]"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                
                <div className="space-y-2 max-w-[280px]">
                  <h2 className="text-3xl font-light tracking-tight text-white">
                    Hello, <span className="font-medium">Operator</span>
                  </h2>
                  <p className="text-white/60 text-lg">
                    I'm listening for your commands
                  </p>
                </div>
              </div>

              {/* Suggestions Chips */}
              <div className="mb-12 space-y-4">
                <p className="text-xs text-white/40 font-medium uppercase tracking-widest text-center mb-6">Suggested Actions</p>
                <div className="flex flex-col gap-3">
                  {[
                    "Show efficiency for Amada Laser",
                    "Why is MO-26-402 delayed?",
                    "Check 5052 Aluminum stock"
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="w-full p-4 rounded-[var(--shape-lg)] bg-white/5 border border-white/10 text-left text-sm text-white/90 active:bg-white/10 transition-colors flex items-center justify-between group"
                    >
                      "{suggestion}"
                      <Sparkles className="w-4 h-4 text-white/20 group-active:text-[var(--mw-mirage)] transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="listening"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center -mt-20"
            >
              <div className="text-2xl font-medium text-white mb-2">Listening...</div>
              <div className="text-[var(--mw-purple-light)]  text-xl mb-12 tracking-wider">{formatTime(recordingTime)}</div>

              {/* Dynamic Waveform Visualization */}
              <div className="h-24 flex items-center justify-center gap-1.5 w-full max-w-[300px]">
                {[...Array(20)].map((_, i) => (
                   <motion.div 
                      key={i} 
                      className="w-1.5 bg-[var(--mw-mirage)] rounded-full"
                      animate={{ 
                        height: [
                          10 + Math.random() * 10, 
                          30 + Math.random() * 60, 
                          10 + Math.random() * 10
                        ] 
                      }}
                      transition={{ 
                        duration: 0.5 + Math.random() * 0.5, 
                        repeat: Infinity, 
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: i * 0.05
                      }}
                   />
                ))}
              </div>

              <div className="mt-12 text-center max-w-[280px]">
                 <p className="text-white/50 text-sm">Try saying "Update status of work order 401 to complete"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Area */}
      <div className="bg-[var(--neutral-900)] p-6 pb-8">
         <div className="relative flex items-center justify-center h-24">
            <AnimatePresence>
               {isRecording && (
                  <motion.div
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0, opacity: 0 }}
                     className="absolute inset-0 flex items-center justify-center"
                  >
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="absolute h-24 w-24 animate-ping rounded-full bg-[var(--mw-yellow-400)]/20" />
                       <div className="absolute h-20 w-20 animate-pulse rounded-full bg-[var(--mw-yellow-400)]/30 delay-75" />
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <motion.button
               className={cn(
                  "relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-[var(--elevation-3)] transition-all duration-[250ms]",
                  isRecording 
                     ? "bg-[var(--mw-error)] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                     : "bg-white text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] shadow-[0_0_20px_rgba(255,255,255,0.2)]"
               )}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsRecording(!isRecording)}
            >
               {isRecording ? (
                  <div className="w-8 h-8 rounded-xs bg-white" />
               ) : (
                  <Mic className="w-8 h-8" />
               )}
            </motion.button>
         </div>
         
         {!isRecording && (
            <div className="text-center mt-4">
               <p className="text-sm font-medium text-white/80">Tap to speak</p>
            </div>
         )}
      </div>
    </div>
  );
}
