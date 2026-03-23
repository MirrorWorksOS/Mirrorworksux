/**
 * Design Process Builder - Visual routing/workflow builder
 * Placeholder for future node-based workflow editor
 */

import React from 'react';
import { GitBranch, Info } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function DesignProcessBuilder() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Process Builder</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <GitBranch className="w-4 h-4 mr-2" />
          New Process
        </Button>
      </div>

      <Card className="bg-[#FFCF4B] border-2 border-[#2C2C2C] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#2C2C2C] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[16px] font-semibold text-[#2C2C2C] mb-2">
              Visual Workflow Designer
            </h3>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              This module will provide a node-based visual editor for designing manufacturing routings, 
              defining operation sequences, setting up QC checkpoints, and configuring approval workflows. 
              Implementation requires a workflow library (e.g., React Flow, D3.js).
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-[var(--border)] rounded-2xl p-12">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-[#737373] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1A2732] mb-2">Process Builder Coming Soon</h3>
          <p className="text-sm text-[#737373]">Node-based workflow and routing designer</p>
        </div>
      </Card>
    </div>
  );
}
