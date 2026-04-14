/**
 * Step 6 — Review and confirm before import.
 */
import { useEffect, useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { bridgeService } from '@/services';
import { Button } from '@/components/ui/button';
import { BridgePrimaryWithTooltip } from '@/components/bridge/BridgeSegmentedActions';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export function StepReviewConfirm() {
  const { files, mappings, previewRecords, setPreviewRecords, toggleRecordExclusion, goToNextStep, goToPreviousStep, sessionId, setSessionStatus } =
    useBridge();
  const [loading, setLoading] = useState(true);
  const [warningsOnly, setWarningsOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviews() {
      const todo = files.filter((f) => f.analysisStatus === 'complete');
      const missing = todo.filter((f) => {
        const entity = f.detectedEntityType || 'unknown';
        return !previewRecords[entity];
      });

      if (missing.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all(
        missing.map(async (file) => {
          const entity = file.detectedEntityType || 'unknown';
          const records = await bridgeService.getPreviewRecords(sessionId || '', entity);
          if (!cancelled) setPreviewRecords(entity, records);
        })
      );
      if (!cancelled) setLoading(false);
    }

    loadPreviews();
    return () => {
      cancelled = true;
    };
  }, [files, sessionId, previewRecords, setPreviewRecords]);

  const entities = files
    .filter((f) => f.analysisStatus === 'complete')
    .map((f) => {
      const entity = f.detectedEntityType || 'unknown';
      const fileMappings = mappings[f.id] || [];
      const mapped = fileMappings.filter((m) => m.targetColumn !== null).length;
      const records = previewRecords[entity] || [];
      const active = records.filter((r) => !r.excluded);
      const warnings = records.filter((r) => r.warnings.length > 0);

      return {
        entity,
        file: f,
        mapped,
        total: fileMappings.length,
        records,
        activeCount: active.length,
        warningCount: warnings.length,
        excludedCount: records.length - active.length,
      };
    });

  const totalRecords = entities.reduce((acc, e) => acc + e.activeCount, 0);
  const totalWarnings = entities.reduce((acc, e) => acc + e.warningCount, 0);
  const totalExcluded = entities.reduce((acc, e) => acc + e.excludedCount, 0);

  const handleImport = () => {
    setSessionStatus('importing');
    goToNextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Review your import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check the summary below, then confirm to start importing. You can exclude individual rows with the Include
          toggle. This is your last stop before records are created in MirrorWorks.
        </p>
      </div>

      <Card className="p-6 space-y-2 border-[var(--neutral-200)] bg-[var(--neutral-50)]">
        <h3 className="text-sm font-medium text-foreground">Import summary</h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{totalRecords}</span> rows will be created across{' '}
          {entities.length} type{entities.length === 1 ? '' : 's'}.{' '}
          {totalWarnings > 0 ? (
            <>
              <span className="font-medium text-[var(--mw-warning)] tabular-nums">{totalWarnings}</span> row
              {totalWarnings === 1 ? '' : 's'} have warnings — fix them in the spreadsheet and re-upload, edit after
              import, or exclude below.{' '}
            </>
          ) : null}
          {totalExcluded > 0 ? (
            <>
              <span className="font-medium text-foreground tabular-nums">{totalExcluded}</span> row
              {totalExcluded === 1 ? '' : 's'} excluded from this run.
            </>
          ) : null}
        </p>
      </Card>

      <div className="flex items-center gap-3 rounded-[var(--shape-lg)] border border-[var(--neutral-200)] px-4 py-3">
        <Switch id="bridge-warnings-only" checked={warningsOnly} onCheckedChange={setWarningsOnly} />
        <Label htmlFor="bridge-warnings-only" className="text-sm font-normal cursor-pointer">
          Show only rows with warnings
        </Label>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {entities.map((e) => (
          <Card key={e.entity} className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm capitalize">{e.entity}</h3>
              <Badge variant="outline" className="text-xs">
                {e.mapped}/{e.total} fields
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-[var(--mw-success)]">
                <CheckCircle className="w-3.5 h-3.5" />
                {e.activeCount} to create
              </span>
              {e.warningCount > 0 && (
                <span className="flex items-center gap-1 text-[var(--mw-warning)]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {e.warningCount} warnings
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Preview tables */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        entities.map((e) => {
          const visibleRows = warningsOnly ? e.records.filter((r) => r.warnings.length > 0) : e.records;
          const dataKeys = Object.keys(e.records[0]?.data || {}).slice(0, 4);
          type PreviewRow = (typeof e.records)[number];
          const previewColumns: MwColumnDef<PreviewRow>[] = [
            {
              key: 'include',
              header: 'Include',
              headerClassName: 'w-12 text-center',
              className: 'text-center',
              cell: (record) => (
                <Switch
                  checked={!record.excluded}
                  onCheckedChange={() => toggleRecordExclusion(e.entity, record.rowNumber)}
                />
              ),
            },
            {
              key: 'rowNumber',
              header: '#',
              className: 'text-muted-foreground',
              cell: (record) => record.rowNumber,
            },
            ...dataKeys.map((key) => ({
              key,
              header: key,
              className: 'truncate max-w-[150px]',
              cell: (record: PreviewRow) => String(record.data[key] ?? ''),
            })),
            {
              key: 'status',
              header: 'Status',
              cell: (record) =>
                record.warnings.length > 0 ? (
                  <span className="flex items-center gap-1 text-[var(--mw-warning)] text-xs">
                    <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden />
                    <span>{record.warnings[0]}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-[var(--mw-success)]">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    OK
                  </span>
                ),
            },
          ];
          return (
            <div key={e.entity} className="space-y-2">
              <h3 className="font-medium text-sm capitalize">{e.entity} preview</h3>
              {visibleRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  {warningsOnly ? 'No rows with warnings for this type.' : 'No preview rows.'}
                </p>
              ) : (
                <MwDataTable
                  columns={previewColumns}
                  data={visibleRows}
                  keyExtractor={(record) => String(record.rowNumber)}
                />
              )}
            </div>
          );
        })
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" className="h-12 min-h-[48px]" onClick={goToPreviousStep}>
          Go back to fix issues
        </Button>
        <BridgePrimaryWithTooltip
          label={`Import ${totalRecords} records`}
          onClick={handleImport}
          tooltip="Run the import with the rows and mappings shown above."
          icon={ArrowRight}
        />
      </div>
    </div>
  );
}
