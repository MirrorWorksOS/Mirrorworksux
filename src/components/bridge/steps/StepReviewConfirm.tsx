/**
 * Step 6 — Review and confirm before import.
 */
import { useEffect, useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { bridgeService } from '@/services/bridgeService';
import { Button } from '@/components/ui/button';
import { BridgePrimaryWithTooltip } from '@/components/bridge/BridgeSegmentedActions';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export function StepReviewConfirm() {
  const { files, mappings, previewRecords, setPreviewRecords, toggleRecordExclusion, goToNextStep, goToPreviousStep, sessionId, setSessionStatus } = useBridge();
  const [loading, setLoading] = useState(true);

  // Load preview data
  useEffect(() => {
    async function loadPreviews() {
      setLoading(true);
      for (const file of files.filter((f) => f.analysisStatus === 'complete')) {
        const entity = file.detectedEntityType || 'unknown';
        if (!previewRecords[entity]) {
          const records = await bridgeService.getPreviewRecords(sessionId || '', entity);
          setPreviewRecords(entity, records);
        }
      }
      setLoading(false);
    }
    loadPreviews();
  }, []);

  const entities = files
    .filter((f) => f.analysisStatus === 'complete')
    .map((f) => {
      const entity = f.detectedEntityType || 'unknown';
      const fileMappings = mappings[f.id] || [];
      const mapped = fileMappings.filter((m) => m.targetColumn !== null).length;
      const records = previewRecords[entity] || [];
      const active = records.filter((r) => !r.excluded);
      const warnings = records.filter((r) => r.warnings.length > 0);

      return { entity, file: f, mapped, total: fileMappings.length, records, activeCount: active.length, warningCount: warnings.length };
    });

  const totalRecords = entities.reduce((acc, e) => acc + e.activeCount, 0);

  const handleImport = () => {
    setSessionStatus('importing');
    goToNextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Review your import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check the summary below, then confirm to start importing.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {entities.map((e) => (
          <Card key={e.entity} className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm capitalize">{e.entity}</h3>
              <Badge variant="outline" className="text-xs">{e.mapped}/{e.total} fields</Badge>
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
                    <AlertTriangle className="w-3 h-3" />
                    {record.warnings[0]}
                  </span>
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-[var(--mw-success)]" />
                ),
            },
          ];
          return (
            <div key={e.entity} className="space-y-2">
              <h3 className="font-medium text-sm capitalize">{e.entity} preview</h3>
              <MwDataTable
                columns={previewColumns}
                data={e.records}
                keyExtractor={(record) => String(record.rowNumber)}
              />
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
