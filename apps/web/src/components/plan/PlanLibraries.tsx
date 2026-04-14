/**
 * PlanLibraries — unified entry point for the master Material and Finish
 * libraries. A thin tab wrapper that mounts the existing pages unchanged.
 *
 * Replaces the standalone /plan/material-library and /plan/finish-library
 * sidebar entries; old routes redirect here.
 *
 * Note: child library pages (`MaterialLibrary`, `FinishLibrary`) own their
 * own padding container and h1, so this wrapper renders just a tab strip
 * above the active child — no duplicated headers.
 */

import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaterialLibrary } from './material-library/MaterialLibrary';
import { FinishLibrary } from './finish-library/FinishLibrary';

type LibraryTab = 'materials' | 'finishes';

function isLibraryTab(value: string | null): value is LibraryTab {
  return value === 'materials' || value === 'finishes';
}

export function PlanLibraries() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab = useMemo<LibraryTab>(() => {
    const param = new URLSearchParams(location.search).get('tab');
    return isLibraryTab(param) ? param : 'materials';
  }, [location.search]);

  const [tab, setTab] = useState<LibraryTab>(initialTab);

  const handleTabChange = (value: string) => {
    if (!isLibraryTab(value)) return;
    setTab(value);
    navigate(`/plan/libraries?tab=${value}`, { replace: true });
  };

  return (
    <div>
      {/* Tab strip — sits above the child page's own h1 */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="finishes">Finishes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Active library — child owns its own padding & header */}
      {tab === 'materials' ? <MaterialLibrary /> : <FinishLibrary />}
    </div>
  );
}
