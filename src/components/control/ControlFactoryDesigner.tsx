/**
 * Factory designer — canvas-based factory floor layout (ARCH 00 / Control).
 * @see src/guidelines/AccessRightsAndPermissions.md
 */

import { Layout } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';
import { toast } from 'sonner';

export function ControlFactoryDesigner() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Factory designer</h1>
        <Button className="h-12 min-h-[48px] rounded-[var(--shape-lg)] bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]" onClick={() => toast('Factory layout designer coming soon')}>
          <Layout className="mr-2 h-4 w-4" />
          New layout
        </Button>
      </div>

      <ModuleInfoCallout
        title="Canvas-based layout designer"
        description="Drag-and-drop canvas for factory floor layouts, machines, work centres, and material flow. Implementation may use HTML5 Canvas or a library such as Konva or Fabric.js."
      />

      <Card className="rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-white p-12 shadow-xs">
        <div className="text-center">
          <Layout className="mx-auto mb-4 h-16 w-16 text-[var(--neutral-500)]" />
          <h3 className="mb-2 text-xl font-medium text-[var(--mw-mirage)]">Factory designer</h3>
          <p className="text-sm text-[var(--neutral-500)]">Placeholder canvas — connect routing and data when backend is available.</p>
        </div>
      </Card>
    </div>
  );
}
