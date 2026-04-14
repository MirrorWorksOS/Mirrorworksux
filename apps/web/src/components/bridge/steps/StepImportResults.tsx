/**
 * Step 7 — Import execution and results.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useBridge } from '@/hooks/useBridge';
import { bridgeService } from '@/services';
import { BridgeSegmentedSkipPrimary, BridgePrimaryWithTooltip } from '@/components/bridge/BridgeSegmentedActions';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, AlertTriangle, Loader2, MinusCircle, Upload, Users } from 'lucide-react';

export function StepImportResults() {
  const navigate = useNavigate();
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
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Typical imports of this size finish within a minute. You can leave this page and return to Bridge from
              Control if you need to — progress is simulated in this prototype.
            </p>
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

          <div className="rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">What happens next</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">Flagged</span> records are saved but should be checked
                before you rely on them for quotes, jobs, or shipments — usually for formatting or missing optional fields.{' '}
                <span className="font-medium text-foreground">Skipped</span> rows were not created; fix the source file
                and run Bridge again, or add them manually.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/sell/crm" className="text-[var(--mw-info)] underline underline-offset-2 hover:opacity-90">
                Customers in Sell
              </Link>
              <Link to="/sell/products" className="text-[var(--mw-info)] underline underline-offset-2 hover:opacity-90">
                Products in Sell
              </Link>
              <Link to="/control/mirrorworks-bridge" className="text-[var(--mw-info)] underline underline-offset-2 hover:opacity-90">
                Import more data
              </Link>
            </div>
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
              skipLabel="Import more data"
              skipIcon={Upload}
              skipTooltip="Return to the upload step to bring in another file (prototype)."
              onSkip={() => goToStep('upload')}
              primaryLabel="Continue to dashboard"
              primaryIcon={ArrowRight}
              primaryTooltip="Exit the wizard and open the main dashboard."
              onPrimary={() => {
                navigate('/');
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
