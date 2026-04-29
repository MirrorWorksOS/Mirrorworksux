/**
 * QuoteUploadZone — Multi-format file upload with AI analysis.
 * Drag-drop CAD, spreadsheets, images, or documents to auto-generate line items.
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, FileSpreadsheet, Image, FileText, Cog, X, Check, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/components/ui/utils';
import { AgentLogomark } from '@/components/shared/agent/AgentLogomark';
import { mockUploadScenarios } from '@/services';
import type { ExtractedLineItem } from '@/types/entities';
import { MirrorWorksAgentCard } from '@/components/shared/ai/MirrorWorksAgentCard';

// ── Types ─────────────────────────────────────────────────────────────

interface QuoteUploadZoneProps {
  onAddItems: (items: { description: string; sku: string; qty: number; unit: string; unitCost: number; margin: number; unitPrice: number }[]) => void;
}

type UploadState = 'idle' | 'analyzing' | 'complete';
type PipelineStage = 'upload' | 'parse' | 'classify' | 'extract' | 'match' | 'review';

const ACCEPTED_EXTENSIONS = ['.dxf', '.dwg', '.step', '.pdf', '.xlsx', '.csv', '.png', '.jpg', '.jpeg'];
const PIPELINE_STAGES: { key: PipelineStage; label: string; description: string }[] = [
  { key: 'upload', label: 'Upload', description: 'Receive file and validate format' },
  { key: 'parse', label: 'Parse', description: 'Read geometry, OCR, or spreadsheet structure' },
  { key: 'classify', label: 'Classify', description: 'Determine file and RFQ intent' },
  { key: 'extract', label: 'Extract', description: 'Pull candidate line items and routing hints' },
  { key: 'match', label: 'Match to catalog', description: 'Suggest SKUs and estimated pricing' },
  { key: 'review', label: 'Review', description: 'Present generated items for confirmation' },
];

const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  cad: Cog,
  spreadsheet: FileSpreadsheet,
  image: Image,
  document: FileText,
};

function detectFileType(name: string): 'cad' | 'spreadsheet' | 'image' | 'document' {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (['dxf', 'dwg', 'step'].includes(ext)) return 'cad';
  if (['xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
  return 'document';
}

function pickMockScenario(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('bom') || lower.includes('.xlsx') || lower.includes('.csv')) return mockUploadScenarios['bom-xlsx'];
  if (lower.includes('.dxf') || lower.includes('.dwg') || lower.includes('.step')) return mockUploadScenarios['drawing-dxf'];
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png')) return mockUploadScenarios['photo-jpg'];
  return mockUploadScenarios['rfq-pdf'];
}

function confidenceColor(c: number) {
  if (c >= 80) return 'var(--mw-green)';
  if (c >= 60) return 'var(--mw-yellow-500)';
  return 'var(--neutral-500)';
}

// ── Component ─────────────────────────────────────────────────────────

export function QuoteUploadZone({ onAddItems }: QuoteUploadZoneProps) {
  const [expanded, setExpanded] = useState(true);
  const [state, setState] = useState<UploadState>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [extractedItems, setExtractedItems] = useState<ExtractedLineItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [metadata, setMetadata] = useState<{ materialSummary?: string; routingSummary?: string; customerHint?: string }>({});
  const [activeStage, setActiveStage] = useState<PipelineStage>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback((name: string) => {
    setFileName(name);
    setState('analyzing');
    setActiveStage('upload');
    const scenario = pickMockScenario(name);
    const timers = [
      window.setTimeout(() => setActiveStage('parse'), 250),
      window.setTimeout(() => setActiveStage('classify'), 500),
      window.setTimeout(() => setActiveStage('extract'), 800),
      window.setTimeout(() => setActiveStage('match'), 1100),
    ];
    setTimeout(() => {
      const items = scenario.extractedItems;
      setExtractedItems(items);
      setMetadata(scenario.metadata);
      // Auto-check high-confidence items
      setChecked(new Set(items.filter(i => i.confidence >= 60).map(i => i.id)));
      setState('complete');
      setActiveStage('review');
      timers.forEach(window.clearTimeout);
    }, 1500);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragOver(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) runAnalysis(file.name);
  }, [runAnalysis]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runAnalysis(file.name);
    if (inputRef.current) inputRef.current.value = '';
  }, [runAnalysis]);

  const handleReset = useCallback(() => {
    setState('idle');
    setExtractedItems([]);
    setChecked(new Set());
    setFileName('');
    setMetadata({});
    setActiveStage('upload');
  }, []);

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAddToQuote = () => {
    const selected = extractedItems.filter(i => checked.has(i.id));
    const converted = selected.map(i => ({
      description: i.description,
      sku: i.suggestedSku ?? '',
      qty: i.qty,
      unit: i.unit,
      unitCost: i.estimatedCost,
      margin: i.suggestedPrice > 0 ? parseFloat((((i.suggestedPrice - i.estimatedCost) / i.suggestedPrice) * 100).toFixed(1)) : 20,
      unitPrice: i.suggestedPrice,
    }));
    onAddItems(converted);
    handleReset();
  };

  const checkedCount = checked.size;
  const fileType = fileName ? detectFileType(fileName) : 'document';
  const activeStageIndex = PIPELINE_STAGES.findIndex(stage => stage.key === activeStage);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--neutral-50)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--mw-yellow-500)]" />
          <span className="text-sm font-medium text-foreground">MirrorWorks Agent upload review</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-[var(--neutral-400)]" /> : <ChevronDown className="w-4 h-4 text-[var(--neutral-400)]" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Dropzone */}
              {state === 'idle' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
                    isDragOver
                      ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                      : 'border-[var(--neutral-300)] bg-[var(--neutral-50)] hover:border-[var(--neutral-400)]',
                  )}
                >
                  <Upload className="h-8 w-8 text-[var(--neutral-400)]" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-[var(--neutral-700)]">
                      Drag & drop to auto-generate line items
                    </p>
                    <p className="text-xs text-[var(--neutral-500)] mt-1">
                      Supports DXF, STEP, PDF, XLSX, CSV, PNG, and JPG
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {['CAD', 'Spreadsheet', 'PDF', 'Image'].map(t => (
                      <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 text-[var(--neutral-500)] border-[var(--neutral-300)]">{t}</Badge>
                    ))}
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Analyzing */}
              {state === 'analyzing' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--neutral-50)] p-6"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--neutral-200)] border-t-[var(--mw-yellow-400)]" />
                      <AgentLogomark size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Analysing {fileName}</p>
                      <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                        Moving through the upload, extraction, and catalog matching pipeline…
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 pt-4 md:grid-cols-3">
                    {PIPELINE_STAGES.map((stage, index) => {
                      const isDone = index < activeStageIndex;
                      const isActive = index === activeStageIndex;
                      return (
                        <div
                          key={stage.key}
                          className={cn(
                            'rounded-lg border p-3 text-left transition-colors',
                            isDone
                              ? 'border-[var(--mw-green)]/30 bg-[var(--mw-success-light)]'
                              : isActive
                                ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                                : 'border-[var(--border)] bg-card',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                                isDone
                                  ? 'bg-[var(--mw-green)] text-white'
                                  : isActive
                                    ? 'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]'
                                    : 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
                              )}
                            >
                              {index + 1}
                            </span>
                            <p className="text-xs font-medium text-foreground">{stage.label}</p>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-[var(--neutral-500)]">{stage.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {state === 'complete' && extractedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                  className="space-y-3"
                >
                  {/* File chip */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <MirrorWorksAgentCard
                        title={`Review ${fileName}`}
                        suggestion={`MirrorWorks Agent found ${extractedItems.length} candidate quote line item${extractedItems.length !== 1 ? 's' : ''}. Review the matches below before adding them to the quote.`}
                        primaryAction={{
                          label: checkedCount === 0
                            ? 'Select lines to add'
                            : `Add ${checkedCount} item${checkedCount !== 1 ? 's' : ''} to quote`,
                          onClick: checkedCount === 0 ? undefined : handleAddToQuote,
                          disabled: checkedCount === 0,
                        }}
                        statusLabel={fileType}
                        statusText={metadata.customerHint ?? 'Ready for review'}
                        detailContent={
                          <div className="space-y-1">
                            {metadata.materialSummary ? <p><span className="font-medium">Materials:</span> {metadata.materialSummary}</p> : null}
                            {metadata.routingSummary ? <p><span className="font-medium">Routing:</span> {metadata.routingSummary}</p> : null}
                          </div>
                        }
                        evidenceLevel={(metadata.materialSummary || metadata.routingSummary) ? 'expandable' : 'hidden'}
                        detailLabel="Extraction details"
                      />
                    </div>
                    <button onClick={handleReset} className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
                      <X className="w-4 h-4 text-[var(--neutral-500)]" />
                    </button>
                  </div>

                  {/* Metadata */}
                  {(metadata.materialSummary || metadata.routingSummary) && (
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--neutral-500)]">
                      {metadata.materialSummary && <span>Materials: {metadata.materialSummary}</span>}
                      {metadata.routingSummary && <span>Routing: {metadata.routingSummary}</span>}
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-3">
                    {PIPELINE_STAGES.map((stage, index) => {
                      const isDone = index < activeStageIndex;
                      const isActive = index === activeStageIndex;
                      return (
                        <div
                          key={stage.key}
                          className={cn(
                            'rounded-lg border p-3',
                            isDone
                              ? 'border-[var(--mw-green)]/30 bg-[var(--mw-success-light)]'
                              : isActive
                                ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                                : 'border-[var(--border)] bg-card',
                          )}
                        >
                          <p className="text-xs font-medium text-foreground">{stage.label}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[var(--neutral-500)]">{stage.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items table */}
                  <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--neutral-50)] border-b border-[var(--border)]">
                          <th className="w-8 p-2" />
                          <th className="text-left p-2 text-xs font-medium text-[var(--neutral-500)]">Description</th>
                          <th className="text-left p-2 text-xs font-medium text-[var(--neutral-500)]">Material</th>
                          <th className="text-right p-2 text-xs font-medium text-[var(--neutral-500)]">Qty</th>
                          <th className="text-right p-2 text-xs font-medium text-[var(--neutral-500)]">Est. Cost</th>
                          <th className="text-right p-2 text-xs font-medium text-[var(--neutral-500)]">Price</th>
                          <th className="text-center p-2 text-xs font-medium text-[var(--neutral-500)]">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedItems.map(item => (
                          <tr key={item.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] transition-colors">
                            <td className="p-2 text-center">
                              <Checkbox
                                checked={checked.has(item.id)}
                                onCheckedChange={() => toggleCheck(item.id)}
                              />
                            </td>
                            <td className="p-2">
                              <p className="text-sm font-medium text-foreground">{item.description}</p>
                              <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">{item.source}</p>
                            </td>
                            <td className="p-2 text-xs text-[var(--neutral-600)]">{item.material ?? '—'}</td>
                            <td className="p-2 text-right tabular-nums text-foreground">{item.qty}</td>
                            <td className="p-2 text-right tabular-nums text-[var(--neutral-500)]">${item.estimatedCost.toFixed(2)}</td>
                            <td className="p-2 text-right tabular-nums font-medium text-foreground">${item.suggestedPrice.toFixed(2)}</td>
                            <td className="p-2 text-center">
                              <Badge
                                className="border-0 text-[10px] px-1.5 py-0"
                                style={{ backgroundColor: `${confidenceColor(item.confidence)}20`, color: confidenceColor(item.confidence) }}
                              >
                                {item.confidence}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--neutral-500)]">{checkedCount} of {extractedItems.length} items selected</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        Upload another
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
