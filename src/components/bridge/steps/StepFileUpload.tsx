/**
 * Step 3 — File upload with drag-and-drop, analysis progress, and file list.
 */
import { useCallback, useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/bridge/FileUploadZone';
import { ImportProgressBar } from '@/components/bridge/ImportProgressBar';
import { bridgeService } from '@/services/bridgeService';
import { CheckCircle, X, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import type { BridgeFile } from '@/types/bridge';

export function StepFileUpload() {
  const { files, addFile, removeFile, updateFileAnalysis, setMappings, goToNextStep, goToPreviousStep, sessionId } = useBridge();
  const [analysing, setAnalysing] = useState<Set<string>>(new Set());

  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      for (const file of selectedFiles) {
        // Upload & get initial analysis
        const bridgeFile = await bridgeService.uploadFile(sessionId || '', file);
        addFile(bridgeFile);

        // Run analysis
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

        // Trigger AI matching
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
      }
    },
    [sessionId, addFile, updateFileAnalysis, setMappings]
  );

  const hasAnalysedFiles = files.some((f) => f.analysisStatus === 'complete');
  const isProcessing = analysing.size > 0;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Upload your data files</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload spreadsheets exported from your current system. We'll analyse them and match the fields.
        </p>
      </div>

      {/* Info card for ERP users */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Exporting from your system?</p>
            <p className="text-sm text-blue-700">
              Most systems let you export customer, product, and job lists as CSV or Excel. Check your system's "Export" or "Reports" menu.
            </p>
          </div>
        </div>
      </div>

      <FileUploadZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

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
        <Button variant="ghost" onClick={goToPreviousStep}>Back</Button>
        <Button
          onClick={goToNextStep}
          disabled={!hasAnalysedFiles || isProcessing}
          className="bg-[#FFCF4B] text-[#191406] hover:bg-[#FFCF4B]/90 font-medium px-8"
        >
          Continue
        </Button>
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
      <FileSpreadsheet className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{file.fileName}</span>
          <Badge variant="secondary" className="text-xs shrink-0">{formatSize(file.fileSize)}</Badge>
          {file.analysisStatus === 'complete' && (
            <>
              <Badge variant="outline" className="text-xs shrink-0">{file.rowCount} rows</Badge>
              {file.detectedEntityType && file.detectedEntityType !== 'unknown' && (
                <Badge className="text-xs shrink-0 bg-green-100 text-green-800 hover:bg-green-100">
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
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Analysis complete — {file.headers.length} columns detected</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
