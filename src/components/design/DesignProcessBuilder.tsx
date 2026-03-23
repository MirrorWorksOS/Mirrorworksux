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
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Process Builder</h1>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)]">
          <GitBranch className="w-4 h-4 mr-2" />
          New Process
        </Button>
      </div>

      <Card className="bg-[var(--mw-yellow-400)] border-2 border-[var(--neutral-800)] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--neutral-800)] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-[var(--neutral-800)] mb-2">
              Visual Workflow Designer
            </h3>
            <p className="text-sm text-[var(--neutral-800)] leading-relaxed">
              This module will provide a node-based visual editor for designing manufacturing routings, 
              defining operation sequences, setting up QC checkpoints, and configuring approval workflows. 
              Implementation requires a workflow library (e.g., React Flow, D3.js).
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-[var(--border)] rounded-2xl p-12">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-[var(--neutral-500)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--mw-mirage)] mb-2">Process Builder Coming Soon</h3>
          <p className="text-sm text-[var(--neutral-500)]">Node-based workflow and routing designer</p>
        </div>
      </Card>
    </div>
  );
}
