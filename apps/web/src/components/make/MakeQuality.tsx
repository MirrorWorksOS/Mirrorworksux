/**
 * MakeQuality — Standalone route wrapper for QualityTab.
 * Promotes the existing shop-floor tab to its own sidebar destination at /make/quality.
 */

import React from 'react';
import { QualityTab } from '@/components/shop-floor/QualityTab';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

export function MakeQuality() {
  return (
    <PageShell>
      <PageHeader title="Quality" subtitle="Inspections, holds, defect reports, and NCRs" />
      <div className="flex-1 overflow-hidden">
        <QualityTab />
      </div>
    </PageShell>
  );
}
