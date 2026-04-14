/**
 * Step 3 — File upload with drag-and-drop, analysis progress, and file list.
 */
import { useCallback, useMemo, useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import { FileUploadZone } from '@/components/bridge/FileUploadZone';
import { ImportProgressBar } from '@/components/bridge/ImportProgressBar';
import { bridgeService } from '@/services';
import { toast } from 'sonner';
import { CheckCircle, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import type { BridgeFile } from '@/types/bridge';

export function StepFileUpload() {
  const { files, addFile, removeFile, updateFileAnalysis, setMappings, goToNextStep, goToPreviousStep, sessionId } =
    useBridge();
  const [analysing, setAnalysing] = useState<Set<string>>(new Set());

  const processOneFile = useCallback(
    async (file: File) => {
      const bridgeFile = await bridgeService.uploadFile(sessionId || '', file);
      addFile(bridgeFile);
      setAnalysing((prev) => new Set(prev).add(bridgeFile.id));
      updateFileAnalysis(bridgeFile.id, { analysisStatus: 'analysing' });

      const analysed = await bridgeService.analyseFile(sessionId || '', bridgeFile);
      updateFileAnalysis(bridgeFile.id, {
        analysisStatus: 'complete',
        headers: analysed.headers,
        sampleData: analysed.sampleData,
        rowCount: analysed.rowCount,
        detectedEntityType: analysed.detectedEntityType,
      });

      const mappings = await bridgeService.triggerAIMatch(sessionId || '', {
        ...bridgeFile,
        ...analysed,
      });
      setMappings(bridgeFile.id, mappings);

      setAnalysing((prev) => {
        const next = new Set(prev);
        next.delete(bridgeFile.id);
        return next;
      });
    },
    [sessionId, addFile, updateFileAnalysis, setMappings]
  );

  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      await Promise.all(selectedFiles.map((file) => processOneFile(file)));
    },
    [processOneFile]
  );

  const handleReject = useCallback((info: { invalidTypeCount: number; oversizeCount: number }) => {
    const parts: string[] = [];
    if (info.invalidTypeCount > 0) {
      parts.push(
        `${info.invalidTypeCount} file${info.invalidTypeCount === 1 ? '' : 's'} not accepted (use .csv, .xls, or .xlsx)`
      );
    }
    if (info.oversizeCount > 0) {
      parts.push(`${info.oversizeCount} file${info.oversizeCount === 1 ? '' : 's'} over 50MB`);
    }
    toast.message('Some files were skipped', { description: parts.join('. ') });
  }, []);

  const hasAnalysedFiles = files.some((f) => f.analysisStatus === 'complete');
  const isProcessing = analysing.size > 0;

  const entitySummary = useMemo(() => {
    const complete = files.filter((f) => f.analysisStatus === 'complete');
    const counts = new Map<string, number>();
    for (const f of complete) {
      const t = f.detectedEntityType || 'unknown';
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    return { completeCount: complete.length, counts };
  }, [files]);

  const summaryLine =
    entitySummary.completeCount > 0
      ? `${entitySummary.completeCount} file${entitySummary.completeCount === 1 ? '' : 's'} ready: ${[...entitySummary.counts.entries()]
          .map(([k, n]) => `${n}× ${k}`)
          .join(', ')}`
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Upload your data files</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload spreadsheets exported from your current system. We&apos;ll analyse them and suggest column mappings. You
          can add more files while others are processing.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          In development, analysis runs faster than it will in production. Typical production imports of moderate files
          usually finish within a minute.
        </p>
      </div>

      {/* Info card for ERP users */}
      <div className="rounded-xl border border-[var(--mw-info)]/20 bg-[var(--mw-info-light)] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--mw-info)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--mw-info)]">Exporting from your system?</p>
            <p className="text-sm text-[var(--mw-info)]">
              Most systems let you export customer, product, and job lists as CSV or Excel. Check your system&apos;s
              &quot;Export&quot; or &quot;Reports&quot; menu.
            </p>
          </div>
        </div>
      </div>

      <FileUploadZone onFilesSelected={handleFilesSelected} onReject={handleReject} disabled={false} />

      {isProcessing && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Analysing {analysing.size} file{analysing.size === 1 ? '' : 's'} in parallel…
        </p>
      )}

      {summaryLine && (
        <p className="text-sm font-medium text-foreground border border-[var(--neutral-200)] rounded-[var(--shape-lg)] px-4 py-3 bg-[var(--neutral-50)]">
          {summaryLine}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Uploaded files</h3>
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isAnalysing={analysing.has(file.id)}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" className="h-12 min-h-[48px]" onClick={goToPreviousStep}>
          Back
        </Button>
        <BridgeSegmentedSkipPrimary
          order="primary-first"
          skipLabel="Skip"
          primaryLabel="Continue"
          onSkip={goToNextStep}
          onPrimary={goToNextStep}
          primaryDisabled={!hasAnalysedFiles || isProcessing}
          isLoading={false}
          skipTooltip="Continue without files and enter data manually instead."
          primaryTooltip="Continue to map columns to MirrorWorks fields, then review before import."
          primaryDisabledTooltip={
            isProcessing
              ? 'Wait for file analysis to finish.'
              : 'Upload and analyse at least one spreadsheet first.'
          }
        />
      </div>
    </div>
  );
}

function FileCard({
  file,
  isAnalysing,
  onRemove,
}: {
  file: BridgeFile;
  isAnalysing: boolean;
  onRemove: () => void;
}) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-start gap-4 rounded-xl border bg-background p-4">
      <FileSpreadsheet className="w-5 h-5 shrink-0 mt-0.5 text-[var(--mw-success)]" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{file.fileName}</span>
          <Badge variant="secondary" className="text-xs shrink-0">
            {formatSize(file.fileSize)}
          </Badge>
          {file.analysisStatus === 'complete' && (
            <>
              <Badge variant="outline" className="text-xs shrink-0">
                {file.rowCount} rows
              </Badge>
              {file.detectedEntityType && file.detectedEntityType !== 'unknown' && (
                <Badge className="bg-[var(--mw-success-light)] text-xs text-[var(--mw-success)] hover:bg-[var(--mw-success-light)] shrink-0">
                  {file.detectedEntityType}
                </Badge>
              )}
            </>
          )}
        </div>

        {isAnalysing && (
          <ImportProgressBar
            analysisStatus={file.analysisStatus}
            matchedCount={file.headers.length}
            totalCount={file.headers.length}
          />
        )}

        {file.analysisStatus === 'complete' && !isAnalysing && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--mw-success)]">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Analysis complete — {file.headers.length} columns detected</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={isAnalysing}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 disabled:opacity-40"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
