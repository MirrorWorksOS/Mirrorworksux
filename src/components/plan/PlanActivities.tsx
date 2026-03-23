/**
 * Plan Activities - Full-page calendar view
 * Shows production schedule, maintenance, QC checks
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus } from '../ui/animated-icons';

const { animationVariants } = designSystem;

const mockEvents = [
  { id: '1', title: 'JOB-2026-0012 - Start Fabrication', type: 'job' as const, date: '2026-03-20', time: '08:00' },
  { id: '2', title: 'Laser Cutter - Scheduled Maintenance', type: 'maintenance' as const, date: '2026-03-22', time: '14:00' },
  { id: '3', title: 'QC Checkpoint - Weld Inspection', type: 'qc' as const, date: '2026-03-21', time: '10:00' },
  { id: '4', title: 'JOB-2026-0011 - Final Assembly', type: 'job' as const, date: '2026-03-23', time: '09:00' },
];

const getEventColor = (type: 'job' | 'maintenance' | 'qc') => {
  switch (type) {
    case 'job': return 'bg-[#DBEAFE] text-[#0A7AFF] border-[#0A7AFF]';
    case 'maintenance': return 'bg-[#FFEDD5] text-[#FF8B00] border-[#FF8B00]';
    case 'qc': return 'bg-[var(--warm-200)] text-[#1A2732] border-[#36B37E]';
  }
};

export function PlanActivities() {
  const [currentDate] = useState(new Date('2026-03-20'));

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Production Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-[var(--border)]">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-[#1A2732] min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-[var(--border)]">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <AnimatedPlus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#DBEAFE] border border-[#0A7AFF] rounded" />
          <span className="text-sm text-[#737373]">Job</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FFEDD5] border border-[#FF8B00] rounded" />
          <span className="text-sm text-[#737373]">Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--warm-200)] border border-[#36B37E] rounded" />
          <span className="text-sm text-[#737373]">QC</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white border border-[var(--border)] rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-[#737373] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Simplified calendar view */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => {
            const dayNum = i - 2; // Start from day 1 on Wednesday
            const isValid = dayNum >= 1 && dayNum <= 31;
            const dateStr = isValid ? `2026-03-${String(dayNum).padStart(2, '0')}` : '';
            const dayEvents = mockEvents.filter(e => e.date === dateStr);

            return (
              <div key={i} className={cn(
                "min-h-[100px] border border-[var(--border)] rounded-lg p-2",
                isValid ? "bg-white hover:bg-[#F5F5F5] cursor-pointer" : "bg-[#F5F5F5]"
              )}>
                {isValid && (
                  <>
                    <div className="text-sm font-medium text-[#1A2732] mb-2">{dayNum}</div>
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div key={event.id} className={cn("text-xs p-1 rounded border-l-2", getEventColor(event.type))}>
                          <div className="font-medium line-clamp-2">{event.title}</div>
                          <div className="text-[10px] opacity-75">{event.time}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
