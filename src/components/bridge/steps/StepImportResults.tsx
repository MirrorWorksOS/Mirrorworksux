/**
 * Step 7 — Import execution and results.
 */
import { useEffect, useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { bridgeService } from '@/services/bridgeService';
import { BridgeSegmentedSkipPrimary, BridgePrimaryWithTooltip } from '@/components/bridge/BridgeSegmentedActions';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, AlertTriangle, Loader2, MinusCircle, Upload, Users } from 'lucide-react';

export function StepImportResults() {
  const {
    sessionId,
    sessionStatus,
    setSessionStatus,
    importSummary,
    setImportSummary,
    importProgress,
    setImportProgress,
    goToNextStep,
    goToStep,
    files,
  } = useBridge();
  const [step, setStep] = useState(0);

  const hasEmployees = files.some((f) => f.detectedEntityType === 'employees');

  // Run import simulation
  useEffect(() => {
    if (sessionStatus !== 'importing') return;

    async function runImport() {
      let s = 0;
      while (true) {
        const progress = await bridgeService.pollProgress(sessionId || '', s);
        if (!progress) break;
        setImportProgress(progress);
        setStep(s + 1);
        s++;
      }
      const summary = await bridgeService.getImportSummary(sessionId || '');
      setImportSummary(summary);
      setImportProgress(null);
      setSessionStatus('completed');
    }

    runImport();
  }, [sessionStatus]);

  const isImporting = sessionStatus === 'importing';
  const isComplete = sessionStatus === 'completed';

  const totalCreated = importSummary ? Object.values(importSummary.created).reduce((a, b) => a + b, 0) : 0;
  const totalFlagged = importSummary ? Object.values(importSummary.flagged).reduce((a, b) => a + b, 0) : 0;
  const totalSkipped = importSummary ? Object.values(importSummary.skipped).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      {isImporting && (
        <>
          <div className="text-center space-y-4 py-12">
            <Loader2 className="w-12 h-12 text-[var(--mw-yellow-400)] animate-spin mx-auto" />
            <h2 className="text-2xl font-medium tracking-tight">Importing your data...</h2>
            {importProgress && (
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-sm text-muted-foreground capitalize">
                  {importProgress.entity} — {importProgress.processed} of {importProgress.total}
                </p>
                <Progress value={(importProgress.processed / importProgress.total) * 100} className="h-2" />
              </div>
            )}
          </div>
        </>
      )}

      {isComplete && importSummary && (
        <>
          <div className="text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-[var(--mw-success)] mx-auto" />
            <h2 className="text-2xl font-medium tracking-tight">Import complete</h2>
            <p className="text-sm text-muted-foreground">Your data has been imported into MirrorWorks.</p>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6 text-center space-y-1">
              <CheckCircle className="w-6 h-6 text-[var(--mw-success)] mx-auto" />
              <p className="text-3xl font-bold">{totalCreated}</p>
              <p className="text-sm text-muted-foreground">Records created</p>
            </Card>
            <Card className="p-6 text-center space-y-1">
              <AlertTriangle className="w-6 h-6 text-[var(--mw-warning)] mx-auto" />
              <p className="text-3xl font-bold">{totalFlagged}</p>
              <p className="text-sm text-muted-foreground">Flagged for review</p>
            </Card>
            <Card className="p-6 text-center space-y-1">
              <MinusCircle className="w-6 h-6 text-[var(--neutral-400)] mx-auto" />
              <p className="text-3xl font-bold">{totalSkipped}</p>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </Card>
          </div>

          {/* Per-entity breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Breakdown by type</h3>
            {Object.entries(importSummary.created).map(([entity, count]) => (
              <div key={entity} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm font-medium capitalize">{entity}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[var(--mw-success)]">{count} created</span>
                  {(importSummary.flagged[entity] || 0) > 0 && (
                    <span className="text-[var(--mw-warning)]">{importSummary.flagged[entity]} flagged</span>
                  )}
                  {(importSummary.skipped[entity] || 0) > 0 && (
                    <span className="text-muted-foreground">{importSummary.skipped[entity]} skipped</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Team setup CTA */}
          {hasEmployees && (
            <Card className="border-[var(--mw-yellow-400)] bg-[color-mix(in_srgb,var(--mw-yellow-400)_8%,white)] dark:bg-[color-mix(in_srgb,var(--mw-yellow-400)_8%,var(--card))] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--mw-yellow-400)_22%,transparent)]">
                  <Users className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Set up your team</p>
                  <p className="text-xs text-muted-foreground">Assign imported employees to modules and groups.</p>
                </div>
                <BridgePrimaryWithTooltip
                  label="Set up team"
                  onClick={goToNextStep}
                  tooltip="Assign imported people to modules and security groups."
                  icon={ArrowRight}
                  className="shrink-0"
                />
              </div>
            </Card>
          )}

          <div className="flex justify-end pt-2">
            <BridgeSegmentedSkipPrimary
              order="skip-first"
              skipLabel="Import more data"
              primaryLabel="Go to dashboard"
              skipIcon={Upload}
              primaryIcon={ArrowRight}
              onSkip={() => goToStep('upload')}
              onPrimary={() => { window.location.href = '/'; }}
              skipTooltip="Return to the upload step to bring in another file (prototype)."
              primaryTooltip="Exit the wizard and open the main dashboard."
            />
          </div>
        </>
      )}
    </div>
  );
}
