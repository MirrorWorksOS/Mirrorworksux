/**
 * MirrorWorks Bridge — PLAT 01 data import & onboarding wizard (post-onboarding).
 * @see src/guidelines/MirrorWorksBridge.md
 */

import { useState } from 'react';
import { Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';
import { DataImportWizardLayout } from '@/components/shared/onboarding/DataImportWizardLayout';
import { getChartScaleColour } from '@/components/shared/charts/chart-theme';

const dataTypes = [
  { key: 'customers', label: 'Customers', icon: Database, imported: 45, total: 45, status: 'complete' as const },
  { key: 'suppliers', label: 'Suppliers', icon: Database, imported: 28, total: 28, status: 'complete' as const },
  { key: 'products', label: 'Products', icon: Database, imported: 156, total: 200, status: 'partial' as const },
  { key: 'machines', label: 'Machines', icon: Database, imported: 0, total: 12, status: 'pending' as const },
  { key: 'users', label: 'Users', icon: Database, imported: 0, total: 24, status: 'pending' as const },
];

export function MirrorWorksBridge() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <DataImportWizardLayout>
      <h1 className="text-3xl tracking-tight text-foreground">MirrorWorks Bridge</h1>

      <ModuleInfoCallout
        showIcon={false}
        title={`Step ${activeStep} of 3: Import master data`}
        description="Import your existing data from CSV, Excel, or connect to external systems. MirrorWorks Bridge is the first step after onboarding (PLAT 01)."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {dataTypes.map(type => {
          const Icon = type.icon;
          const progress = type.total > 0 ? (type.imported / type.total) * 100 : 0;

          return (
            <Card
              key={type.key}
              className="rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-6 shadow-xs"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-blue-100)]">
                    <Icon className="h-5 w-5 text-[var(--mw-blue)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{type.label}</h3>
                    <p className="mt-1 text-xs text-[var(--neutral-500)]">
                      <span className="tabular-nums">
                        {type.imported} / {type.total}
                      </span>{' '}
                      records
                    </p>
                  </div>
                </div>
                {type.status === 'complete' && <CheckCircle2 className="h-5 w-5 text-foreground" />}
                {type.status === 'pending' && <AlertCircle className="h-5 w-5 text-[var(--mw-yellow-400)]" />}
              </div>

              <div className="mb-3">
                <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: getChartScaleColour(progress),
                    }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 w-full border-[var(--border)]"
                disabled={type.status === 'complete'}
              >
                <Upload className="mr-2 h-4 w-4" />
                {type.status === 'complete' ? 'Imported' : 'Import data'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
        <Button
          variant="outline"
          className="h-12 min-h-[48px] border-[var(--border)]"
          disabled={activeStep === 1}
          onClick={() => setActiveStep(s => Math.max(1, s - 1))}
        >
          ← Previous
        </Button>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                step === activeStep
                  ? 'bg-[var(--mw-yellow-400)]'
                  : step < activeStep
                    ? 'bg-[var(--mw-mirage)]'
                    : 'bg-[var(--border)]',
              )}
            />
          ))}
        </div>
        <Button
          className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
          onClick={() => setActiveStep(s => Math.min(3, s + 1))}
        >
          Next →
        </Button>
      </div>
    </DataImportWizardLayout>
  );
}
