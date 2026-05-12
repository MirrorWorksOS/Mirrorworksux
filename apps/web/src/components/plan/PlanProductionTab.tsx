/**
 * Plan Job Detail — Production Tab
 *
 * Focused on the integrated BOM + Routing tree. Part visualisation (MirrorView
 * 3D + 2D Drawing) lives on its own MirrorView tab so this view stays focused
 * on materials, operations, and routing.
 */

import { useMemo } from 'react';
import { BomRoutingTree } from './BomRoutingTree';
import { getDifferentialAssembly } from './BomRoutingTree.data';

export function PlanProductionTab() {
  const assembly = useMemo(() => getDifferentialAssembly('plan'), []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <BomRoutingTree assembly={assembly} mode="plan" />
    </div>
  );
}
