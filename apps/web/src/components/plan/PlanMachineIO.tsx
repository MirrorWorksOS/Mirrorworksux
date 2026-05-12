/**
 * PlanMachineIO — single entry point for the floor-input pipeline.
 *
 * Previously the sidebar exposed five separate destinations (CAD Import, NC
 * Connect, Nesting Studio, Ready to Nest, Nests). Each had a unique job, but
 * users found it hard to map name → function. They have been consolidated
 * here as one module with a shared tab strip, mirroring the standard tab
 * pattern used across MirrorWorks (Sell > Customer detail, Plan > Job
 * detail, etc.).
 *
 * Why all five survive the cull:
 *  - CAD Import      → entry point for STEP/IGES/DXF → MirrorView geometry.
 *                       Unique: file ingest UX. Stays as a tab.
 *  - NC Connect      → live bridge to machine controllers (NC push/pull).
 *                       Unique: machine wire-up. Stays as a tab.
 *  - Nesting Studio  → multi-part sheet packing workspace.
 *                       Unique: nesting authoring UX. Stays as a tab.
 *  - Ready to Nest   → cut-step demand queue feeding Nesting Studio.
 *                       Could be folded into the Studio later, but planners
 *                       triage it separately today — keep as a tab.
 *  - Nests           → lifecycle table (draft → done) — auditing + scheduler
 *                       handoff. Unique angle — keep as a tab.
 */

import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanCADImport } from './PlanCADImport';
import { PlanNCConnect } from './PlanNCConnect';
import { PlanNestingStudio } from './nesting-studio/PlanNestingStudio';
import { PlanNestingQueue } from './nesting-studio/PlanNestingQueue';
import { PlanNestsList } from './nesting-studio/PlanNestsList';

type MachineIOTab =
  | 'cad-import'
  | 'nc-connect'
  | 'nesting-studio'
  | 'nesting-queue'
  | 'nests';

const TABS: { id: MachineIOTab; label: string }[] = [
  { id: 'cad-import', label: 'CAD Import' },
  { id: 'nc-connect', label: 'NC Connect' },
  { id: 'nesting-studio', label: 'Nesting Studio' },
  { id: 'nesting-queue', label: 'Ready to Nest' },
  { id: 'nests', label: 'Nests' },
];

function isMachineIOTab(value: string | null): value is MachineIOTab {
  return !!value && TABS.some((t) => t.id === value);
}

export function PlanMachineIO() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab = useMemo<MachineIOTab>(() => {
    const param = new URLSearchParams(location.search).get('tab');
    return isMachineIOTab(param) ? param : 'cad-import';
  }, [location.search]);

  const [tab, setTab] = useState<MachineIOTab>(initialTab);

  const handleTabChange = (value: string) => {
    if (!isMachineIOTab(value)) return;
    setTab(value);
    navigate(`/plan/machine-io?tab=${value}`, { replace: true });
  };

  const tabStrip = (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  switch (tab) {
    case 'cad-import':       return <PlanCADImport headerExtras={tabStrip} />;
    case 'nc-connect':       return <PlanNCConnect headerExtras={tabStrip} />;
    case 'nesting-studio':   return <PlanNestingStudio headerExtras={tabStrip} />;
    case 'nesting-queue':    return <PlanNestingQueue headerExtras={tabStrip} />;
    case 'nests':            return <PlanNestsList headerExtras={tabStrip} />;
  }
}
