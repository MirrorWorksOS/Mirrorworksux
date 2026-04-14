/**
 * MakeTimeClock — Standalone route wrapper for TimeClockTab.
 * Promotes the existing shop-floor tab to its own sidebar destination at /make/time-clock.
 */

import React from 'react';
import { TimeClockTab } from '@/components/shop-floor/TimeClockTab';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

export function MakeTimeClock() {
  return (
    <PageShell>
      <PageHeader title="Time Clock" subtitle="Operator clock-in, breaks, and timesheet history" />
      <div className="flex-1 overflow-hidden">
        <TimeClockTab />
      </div>
    </PageShell>
  );
}
