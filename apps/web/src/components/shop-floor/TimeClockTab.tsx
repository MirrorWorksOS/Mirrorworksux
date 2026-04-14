import React, { useState, useEffect } from 'react';
import { Clock, History, Calendar, CheckCircle2, AlertCircle, Coffee } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";
import operatorImage from 'figma:asset/ba6178de4b6be80c019e44df2f99d355a1af18f9.png';

export function TimeClockTab() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingAction, setPendingAction] = useState<'clock' | 'break' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (isClockedIn && startTime && !isOnBreak) {
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isClockedIn, startTime, isOnBreak]);

  const handleClockAction = () => {
    if (isClockedIn) {
      // Clock out immediately
      setIsClockedIn(false);
      setIsOnBreak(false);
      setStartTime(null);
    } else {
      // Ask for PIN before clocking in
      setPendingAction('clock');
      setShowPinDialog(true);
      setPin(""); 
    }
  };

  const handleBreakAction = () => {
    if (isOnBreak) {
      // End break
      setIsOnBreak(false);
    } else {
      // Start break
      setIsOnBreak(true);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      setShowPinDialog(false);
      if (pendingAction === 'clock') {
        setIsClockedIn(true);
        setStartTime(new Date());
        setElapsedTime("00:00:00");
      }
      setPendingAction(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Mock History Data
  const history = [
    { date: 'Today', range: isClockedIn ? '7:30 AM - ...' : '7:30 AM - 4:15 PM', total: isClockedIn ? 'In Progress' : '6h 45m' },
    { date: 'Yesterday', range: '7:30 AM - 4:15 PM', total: '8h 45m' },
    { date: 'Wed, Oct 23', range: '7:25 AM - 4:10 PM', total: '8h 45m' },
    { date: 'Tue, Oct 22', range: '7:30 AM - 4:00 PM', total: '8h 30m' },
    { date: 'Mon, Oct 21', range: '7:35 AM - 4:20 PM', total: '8h 45m' },
  ];

  const getStatusText = () => {
    if (isOnBreak) return 'On Break';
    if (isClockedIn) return 'Clocked In';
    return 'Clocked Out';
  };


  return (
    <div className="flex flex-col h-full overflow-y-auto max-w-[1600px] mx-auto w-full p-6 bg-[var(--neutral-100)]">
      <div 
        className={cn(
          "flex flex-col h-full flex-1 transition-all duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)]",
        )}
      >
        {/* Spacer (heading provided by PageHeader in MakeTimeClock wrapper) */}
        <div className="pt-4 flex-shrink-0" />

        <div className="flex-1 flex flex-col items-center max-w-[480px] mx-auto w-full gap-8 pb-12">
          
          {/* Main Card */}
          <div className="w-full bg-card rounded-xl shadow-sm p-8 text-center border border-[var(--neutral-200)] flex flex-col items-center relative overflow-hidden">
            
            {/* PIN Entry Overlay */}
            {showPinDialog && (
              <div className="absolute inset-0 z-50 bg-card flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
                <h3 className="text-xl font-medium text-[var(--neutral-800)] mb-2">Enter PIN</h3>
                <p className="text-[var(--neutral-500)] text-sm mb-8">Enter your 4-digit PIN to clock in</p>
                
                <div className="mb-8">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={(value) => setPin(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-14 h-14 text-2xl border-[var(--neutral-200)]" />
                      <InputOTPSlot index={1} className="w-14 h-14 text-2xl border-[var(--neutral-200)]" />
                      <InputOTPSlot index={2} className="w-14 h-14 text-2xl border-[var(--neutral-200)]" />
                      <InputOTPSlot index={3} className="w-14 h-14 text-2xl border-[var(--neutral-200)]" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex gap-3 w-full max-w-[300px]">
                   <Button 
                     variant="outline" 
                     className="flex-1 h-12 text-[var(--neutral-500)] border-[var(--neutral-200)]"
                     onClick={() => setShowPinDialog(false)}
                   >
                     Cancel
                   </Button>
                   <Button 
                     className="flex-1 h-12 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground font-medium"
                     onClick={handlePinSubmit}
                     disabled={pin.length !== 4}
                   >
                     Confirm
                   </Button>
                </div>
              </div>
            )}

            {/* Operator Info - Material 3 Style */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-card shadow-[var(--elevation-2)]">
                <AvatarImage src={operatorImage} className="object-cover" />
                <AvatarFallback>DM</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-foreground">David Miller</h3>
                <p className="text-sm font-medium text-[var(--neutral-600)]">Senior Operator • Amada Ensis Laser</p>
              </div>
            </div>

            <div className="w-full h-px bg-[var(--neutral-200)] mb-8" />

            {/* Status */}
            <div className="flex flex-col items-center justify-center gap-3 mb-6">
               <StatusBadge
                 variant={isOnBreak ? 'warning' : isClockedIn ? 'success' : 'neutral'}
                 withDot
                 className="text-base font-medium px-4 py-1.5"
               >
                 {getStatusText()}
               </StatusBadge>
               {isClockedIn && !isOnBreak && (
                  <div className="flex items-center gap-2 text-[var(--mw-success)]  font-medium bg-[var(--mw-success-light)] px-3 py-1 rounded-full border border-[var(--mw-success)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--mw-success)] animate-pulse" />
                    {elapsedTime}
                  </div>
               )}
               {isOnBreak && (
                  <div className="flex items-center gap-2 text-[var(--mw-warning)]  font-medium bg-[var(--mw-warning)]/10 px-3 py-1 rounded-full border border-[var(--mw-warning)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--mw-warning)]" />
                    Paused
                  </div>
               )}
            </div>

            {/* Time Display */}
            <div className=" text-6xl font-medium text-foreground leading-none mb-2 tracking-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-[var(--neutral-600)] text-base font-medium mb-10">
              {formatDate(currentTime)}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3 mb-6">
              <button
                onClick={handleClockAction}
                className={cn(
                  "w-full h-16 rounded-full text-lg font-medium transition-all duration-[250ms] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2",
                  !isClockedIn 
                    ? "bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] hover:shadow-[var(--elevation-2)]" 
                    : "bg-card border-2 border-[var(--mw-error-light)] text-[var(--mw-error)] hover:bg-[var(--mw-error)]/10 hover:border-[var(--mw-error)]"
                )}
              >
                {!isClockedIn && <Clock className="w-5 h-5" />}
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>

              <button
                onClick={handleBreakAction}
                disabled={!isClockedIn}
                className={cn(
                  "w-full h-14 rounded-full text-lg font-medium transition-all duration-[250ms] active:scale-[0.98] flex items-center justify-center gap-2",
                  isOnBreak
                    ? "bg-[var(--mw-info-light)] text-[var(--mw-info)] border-2 border-[var(--mw-info)] hover:bg-[var(--mw-info-light)]"
                    : "bg-card border border-[var(--neutral-200)] text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]",
                  !isClockedIn && "opacity-[0.38] cursor-not-allowed hover:bg-card"
                )}
              >
                <Coffee className="w-5 h-5" />
                {isOnBreak ? 'End Break' : 'Start Break'}
              </button>
            </div>

            {/* Today's Summary */}
            <div className="w-full bg-[var(--neutral-50)] rounded-[var(--shape-lg)] p-4 border border-[var(--neutral-200)]">
               <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-foreground">Today: {isClockedIn ? 'In Progress' : '6h 45m'}</div>
                  {isClockedIn && startTime && (
                     <div className="text-xs text-[var(--neutral-600)]">Started at {formatTime(startTime)}</div>
                  )}
                  {!isClockedIn && (
                     <div className="text-xs text-[var(--neutral-600)]">Shift started at 7:30 AM</div>
                  )}
               </div>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="w-full">
             <h3 className="text-xl font-medium text-[var(--neutral-800)] mb-4 pl-1">This Week</h3>
             <div className="bg-card rounded-xl shadow-sm border border-[var(--neutral-200)] overflow-hidden">
                {history.map((entry, i) => (
                   <div key={i} className={cn(
                      "flex items-center justify-between h-12 px-4 hover:bg-[var(--neutral-100)] transition-colors",
                      i !== history.length - 1 && "border-b border-[var(--neutral-200)]"
                   )}>
                      <div className="text-sm font-medium text-[var(--neutral-800)] w-32">{entry.date}</div>
                      <div className="text-sm text-[var(--neutral-500)] flex-1 text-center">{entry.range}</div>
                      <div className="text-sm font-bold text-[var(--neutral-800)] w-24 text-right">{entry.total}</div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
