/**
 * Plan QC Planning - Define quality control checkpoints
 */

import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { AnimatedPlus } from '../ui/animated-icons';

const mockCheckpoints = [
  { id: '1', name: 'Incoming Material Inspection', stage: 'Pre-Production', frequency: 'Every delivery', duration: 15 },
  { id: '2', name: 'Weld Quality Check', stage: 'In-Process', frequency: 'Per job', duration: 30 },
  { id: '3', name: 'Dimensional Verification', stage: 'In-Process', frequency: 'Per part', duration: 20 },
  { id: '4', name: 'Final Visual Inspection', stage: 'Post-Production', frequency: 'Per job', duration: 45 },
];

export function PlanQCPlanning() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">QC Checkpoints</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <AnimatedPlus className="w-4 h-4 mr-2" />
          New Checkpoint
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCheckpoints.map(checkpoint => (
          <Card key={checkpoint.id} className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#36B37E]" />
                <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
                  {checkpoint.name}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#737373]">Stage:</span>
                <Badge className="bg-[#F5F5F5] text-[#525252] border-0 text-xs">{checkpoint.stage}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#737373]">Frequency:</span>
                <span className="text-[#0A0A0A]">{checkpoint.frequency}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#737373]">Duration:</span>
                <span className="text-[#0A0A0A] font-['Roboto_Mono',monospace]">{checkpoint.duration} min</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
