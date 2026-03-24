/**
 * Process builder — visual routing / workflow editor (Control).
 */

import { GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';

export function ControlProcessBuilder() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Process builder</h1>
        <Button className="h-12 min-h-[48px] rounded-[var(--shape-lg)] bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]">
          <GitBranch className="mr-2 h-4 w-4" />
          New process
        </Button>
      </div>

      <ModuleInfoCallout
        title="Visual workflow designer"
        description="Node-based editor for routings, operation sequences, QC checkpoints, and approvals. May use React Flow or similar when wired to data."
      />

      <Card className="rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-white p-12 shadow-xs">
        <div className="text-center">
          <GitBranch className="mx-auto mb-4 h-16 w-16 text-[var(--neutral-500)]" />
          <h3 className="mb-2 text-xl font-semibold text-[var(--mw-mirage)]">Process builder</h3>
          <p className="text-sm text-[var(--neutral-500)]">Node-based workflow and routing designer</p>
        </div>
      </Card>
    </div>
  );
}
