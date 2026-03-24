/**
 * PLAT 01 — optional layout shell for data import / MirrorWorks Bridge steps.
 * Wraps content in PageShell (p-6 space-y-6) per DesignSystem module pages.
 * @see src/guidelines/MirrorWorksBridge.md
 */

import type { ReactNode } from 'react';
import { PageShell } from '@/components/shared/layout/PageShell';

export function DataImportWizardLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
