/**
 * PlanLibraries — unified entry point for the master Material and Finish
 * libraries. A thin tab wrapper that mounts the existing pages unchanged.
 *
 * Replaces the standalone /plan/material-library and /plan/finish-library
 * sidebar entries; old routes redirect here. Children own their own padding
 * + h1, and this wrapper injects the tab strip as `headerExtras` so the tabs
 * render DIRECTLY BELOW the child's title — matching the standard pattern
 * (breadcrumb/title at top, nav below).
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

  const tabStrip = (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="finishes">Finishes</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  return tab === 'materials' ? (
    <MaterialLibrary headerExtras={tabStrip} />
  ) : (
    <FinishLibrary headerExtras={tabStrip} />
  );
}
