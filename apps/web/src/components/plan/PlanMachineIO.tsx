/**
 * PlanMachineIO — unified entry point for CAD import and NC Connect.
 *
 * Replaces the standalone /plan/cad-import and /plan/nc-connect sidebar
 * entries; old routes redirect here. Children own their own PageShell &
 * page header, so this wrapper renders just a tab strip on top.
 */

import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanCADImport } from './PlanCADImport';
import { PlanNCConnect } from './PlanNCConnect';

type MachineIOTab = 'cad-import' | 'nc-connect';

function isMachineIOTab(value: string | null): value is MachineIOTab {
  return value === 'cad-import' || value === 'nc-connect';
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

  return (
    <div>
      {/* Tab strip — sits above the child page's own header */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="cad-import">CAD Import</TabsTrigger>
            <TabsTrigger value="nc-connect">NC Connect</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Active page — child owns its own PageShell & header */}
      {tab === 'cad-import' ? <PlanCADImport /> : <PlanNCConnect />}
    </div>
  );
}
