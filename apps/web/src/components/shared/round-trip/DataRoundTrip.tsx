/**
 * <DataRoundTrip> — shared export → edit → re-import flow.
 *
 * Renders a "Bulk edit" trigger button + a four-step dialog:
 *   1. Upload   — drop/pick or paste CSV
 *   2. Mapping  — confirm suggested header → column mappings
 *   3. Preview  — adds / changes / removals diffed against current
 *                 data, per-row warnings, exclude checkboxes
 *   4. Result   — applied / skipped summary
 *
 * Pages supply a DataRoundTripAdapter (see src/lib/round-trip/types.ts
 * and docs/dev/shared/data-round-trip.md); export is available
 * separately via exportAdapterCsv() so pages can keep their own
 * Export buttons.
 */
import React, { useMemo, useState } from 'react';
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, FileUp, PencilRuler, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { cn } from '@/components/ui/utils';
import {
  buildIncomingRows,
  computeDiffs,
  downloadCsv,
  parseCsv,
  serializeCsv,
  suggestMappings,
  type DataRoundTripAdapter,
  type FlatRow,
  type HeaderMapping,
  type ParsedCsv,
  type RowDiff,
} from '@/lib/round-trip';

/** Export the adapter's current dataset as CSV (canonical headers). */
export async function exportAdapterCsv(adapter: DataRoundTripAdapter): Promise<void> {
  const rows = await adapter.fetchRows();
  downloadCsv(adapter.exportFileName, serializeCsv(adapter.columns, rows));
  toast.success(`${adapter.entityLabel} exported — edit and re-import via Bulk edit`);
}

type Step = 'upload' | 'mapping' | 'preview' | 'result';

const STEP_ORDER: Step[] = ['upload', 'mapping', 'preview', 'result'];
const STEP_LABELS: Record<Step, string> = {
  upload: 'Upload',
  mapping: 'Map columns',
  preview: 'Review changes',
  result: 'Done',
};

const DIFF_BADGE: Record<RowDiff['kind'], { variant: 'success' | 'warning' | 'error'; label: string }> = {
  add: { variant: 'success', label: 'Add' },
  change: { variant: 'warning', label: 'Change' },
  remove: { variant: 'error', label: 'Remove' },
};

interface DataRoundTripProps<TRow extends FlatRow> {
  adapter: DataRoundTripAdapter<TRow>;
  /** Called after a successful apply so the page can refresh. */
  onApplied?: () => void;
  /** Override the trigger label (default "Bulk edit"). */
  triggerLabel?: string;
  triggerClassName?: string;
}

export function DataRoundTrip<TRow extends FlatRow>({
  adapter, onApplied, triggerLabel = 'Bulk edit', triggerClassName,
}: DataRoundTripProps<TRow>) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mappings, setMappings] = useState<HeaderMapping[]>([]);
  const [diffs, setDiffs] = useState<RowDiff<TRow>[]>([]);
  const [duplicateKeys, setDuplicateKeys] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ applied: number; skipped: { key: string; error: string }[] } | null>(null);

  const currentStepIndex = STEP_ORDER.indexOf(step);

  const reset = () => {
    setStep('upload');
    setCsvText('');
    setParsed(null);
    setMappings([]);
    setDiffs([]);
    setDuplicateKeys([]);
    setExcluded(new Set());
    setResult(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  // ── Step 1 → 2: parse + suggest mappings ──
  const handleParse = () => {
    const parsedCsv = parseCsv(csvText);
    if (parsedCsv.headers.length === 0 || parsedCsv.rows.length === 0) {
      toast.error('No data rows found — paste or upload a CSV with a header row.');
      return;
    }
    setParsed(parsedCsv);
    setMappings(suggestMappings(parsedCsv.headers, adapter.columns));
    setStep('mapping');
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  // ── Step 2 → 3: build rows + diff ──
  const unmappedRequired = useMemo(() => {
    const mapped = new Set(mappings.map((m) => m.targetKey).filter(Boolean));
    return adapter.columns.filter((c) => c.required && !mapped.has(c.key));
  }, [mappings, adapter.columns]);

  const handlePreview = async () => {
    if (!parsed) return;
    setBusy(true);
    try {
      const incoming = buildIncomingRows(parsed, mappings, adapter);
      const current = await adapter.fetchRows();
      const diffResult = computeDiffs(current, incoming, adapter);
      setDiffs(diffResult.diffs);
      setDuplicateKeys(diffResult.duplicateKeys);
      // Removals are opt-in: partial uploads are the common case, and
      // "everything missing from my 3-row file" must not apply by accident.
      setExcluded(new Set(diffResult.diffs.filter((d) => d.kind === 'remove').map((d) => d.key)));
      setStep('preview');
    } finally {
      setBusy(false);
    }
  };

  // ── Step 3 → 4: apply ──
  const includedDiffs = diffs.filter((d) => !excluded.has(d.key));
  const blockedCount = includedDiffs.filter((d) => (d.warnings?.length ?? 0) > 0).length;

  const handleApply = async () => {
    // Rows with validation warnings are excluded from apply automatically;
    // the user sees them flagged in the preview.
    const applicable = includedDiffs.filter((d) => (d.warnings?.length ?? 0) === 0);
    if (applicable.length === 0) {
      toast.error('Nothing to apply — every row is excluded or has warnings.');
      return;
    }
    setBusy(true);
    try {
      const applyResult = await adapter.applyDiffs(applicable);
      setResult(applyResult);
      setStep('result');
      onApplied?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Apply failed');
    } finally {
      setBusy(false);
    }
  };

  const toggleExcluded = (key: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const summary = useMemo(() => ({
    add: diffs.filter((d) => d.kind === 'add').length,
    change: diffs.filter((d) => d.kind === 'change').length,
    remove: diffs.filter((d) => d.kind === 'remove').length,
  }), [diffs]);

  const describeRow = (row: TRow | undefined) =>
    row ? adapter.keyColumns.map((k) => String(row[k] ?? '')).join(' · ') : '';

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn('h-12 min-h-[48px] border-[var(--border)] gap-2', triggerClassName)}
        onClick={() => setOpen(true)}
      >
        <PencilRuler className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk edit {adapter.entityLabel.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Step {currentStepIndex + 1} of {STEP_ORDER.length}: {STEP_LABELS[step]}.
              Export, edit in a spreadsheet, re-import — changes are previewed before anything applies.
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-2">
            {STEP_ORDER.map((s, i) => (
              <React.Fragment key={s}>
                <div className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 transition-colors',
                  i <= currentStepIndex
                    ? 'bg-[var(--mw-yellow-400)] text-primary-foreground'
                    : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[var(--neutral-500)]',
                )}>
                  {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 rounded-full transition-colors',
                    i < currentStepIndex ? 'bg-[var(--mw-yellow-400)]' : 'bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]',
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="min-h-[260px]">
            {/* ── Upload ── */}
            {step === 'upload' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--neutral-200)] dark:border-[var(--border)] text-sm cursor-pointer hover:border-[var(--neutral-400)] transition-colors">
                    <FileUp className="w-4 h-4" />
                    Upload CSV
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <span className="text-xs text-[var(--neutral-500)]">or paste below</span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
                    onClick={() => exportAdapterCsv(adapter)}
                  >
                    Export current {adapter.entityLabel.toLowerCase()} first
                  </button>
                </div>
                <Textarea
                  className="font-mono text-xs"
                  rows={9}
                  placeholder={`${adapter.columns.map((c) => c.key).join(',')}\n…`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </div>
            )}

            {/* ── Mapping ── */}
            {step === 'mapping' && parsed && (
              <div className="space-y-3">
                <p className="text-sm text-[var(--neutral-500)]">
                  {parsed.rows.length} data rows. Match each upload column to a {adapter.entityLabel.toLowerCase()} field — unmatched columns are ignored.
                </p>
                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                  {mappings.map((mapping, index) => (
                    <div
                      key={mapping.header + index}
                      className="flex items-center gap-3 bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/50 rounded-md p-3 border border-[var(--neutral-200)] dark:border-[var(--border)]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{mapping.header}</p>
                        <p className="text-xs text-[var(--neutral-500)] truncate">
                          e.g. {parsed.rows[0]?.[mapping.headerIndex] || '—'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                      <Select
                        value={mapping.targetKey ?? 'skip'}
                        onValueChange={(value) =>
                          setMappings((prev) => prev.map((m, i) =>
                            i === index ? { ...m, targetKey: value === 'skip' ? null : value, suggested: false } : m,
                          ))
                        }
                      >
                        <SelectTrigger className="h-10 w-52 shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">— Skip —</SelectItem>
                          {adapter.columns.map((c) => (
                            <SelectItem key={c.key} value={c.key}>
                              {c.label}{c.required ? ' *' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                {unmappedRequired.length > 0 && (
                  <p className="text-xs text-[var(--mw-error)]">
                    Required fields not mapped: {unmappedRequired.map((c) => c.label).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* ── Preview ── */}
            {step === 'preview' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge variant="success">{summary.add} new</StatusBadge>
                  <StatusBadge variant="warning">{summary.change} changed</StatusBadge>
                  {adapter.removalPolicy === 'apply' && summary.remove > 0 && (
                    <StatusBadge variant="error">{summary.remove} missing from upload (excluded — tick to apply)</StatusBadge>
                  )}
                  {blockedCount > 0 && (
                    <span className="text-xs text-[var(--mw-error)]">
                      {blockedCount} row{blockedCount !== 1 ? 's' : ''} with warnings will be skipped
                    </span>
                  )}
                  {duplicateKeys.length > 0 && (
                    <span className="text-xs text-[var(--neutral-500)]">
                      {duplicateKeys.length} duplicate key{duplicateKeys.length !== 1 ? 's' : ''} in upload (last row wins)
                    </span>
                  )}
                </div>

                {diffs.length === 0 ? (
                  <p className="text-sm text-[var(--neutral-500)] py-8 text-center">
                    No differences — the upload matches current {adapter.entityLabel.toLowerCase()}.
                  </p>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                    {diffs.map((diff) => {
                      const isExcluded = excluded.has(diff.key);
                      const hasWarnings = (diff.warnings?.length ?? 0) > 0;
                      return (
                        <div
                          key={diff.kind + diff.key}
                          className={cn(
                            'flex items-start gap-3 rounded-md p-3 border',
                            hasWarnings
                              ? 'bg-[var(--mw-error-light)] dark:bg-[var(--mw-error)]/10 border-[var(--mw-error)]/30'
                              : 'bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/50 border-[var(--neutral-200)] dark:border-[var(--border)]',
                            isExcluded && 'opacity-50',
                          )}
                        >
                          <Checkbox
                            checked={!isExcluded}
                            onCheckedChange={() => toggleExcluded(diff.key)}
                            className="mt-0.5"
                            aria-label={`Include ${diff.key}`}
                            disabled={hasWarnings}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <StatusBadge variant={DIFF_BADGE[diff.kind].variant}>
                                {DIFF_BADGE[diff.kind].label}
                              </StatusBadge>
                              <span className="text-sm font-medium text-foreground truncate">
                                {describeRow((diff.after ?? diff.before) as TRow)}
                              </span>
                            </div>
                            {diff.kind === 'change' && diff.changedKeys && (
                              <div className="mt-1 space-y-0.5">
                                {diff.changedKeys.map((key) => {
                                  const column = adapter.columns.find((c) => c.key === key);
                                  return (
                                    <p key={key} className="text-xs text-[var(--neutral-500)]">
                                      {column?.label ?? key}:{' '}
                                      <span className="line-through">{String(diff.before?.[key] ?? '—')}</span>
                                      {' → '}
                                      <span className="font-medium text-foreground">{String(diff.after?.[key] ?? '—')}</span>
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                            {diff.kind === 'remove' && adapter.removalDescription && (
                              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{adapter.removalDescription}</p>
                            )}
                            {diff.warnings?.map((warning) => (
                              <p key={warning} className="text-xs text-[var(--mw-error)] mt-0.5">{warning}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Result ── */}
            {step === 'result' && result && (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--mw-success-light)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-[var(--mw-success)]" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {result.applied} change{result.applied !== 1 ? 's' : ''} applied
                </p>
                {result.skipped.length > 0 && (
                  <div className="text-xs text-[var(--neutral-500)] space-y-0.5 max-h-[120px] overflow-y-auto">
                    {result.skipped.map((s) => (
                      <p key={s.key}>{s.key}: {s.error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {step === 'mapping' && (
              <Button variant="outline" className="gap-1 rounded-full" onClick={() => setStep('upload')}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step === 'preview' && (
              <Button variant="outline" className="gap-1 rounded-full" onClick={() => setStep('mapping')}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <div className="flex-1" />
            {step === 'upload' && (
              <Button
                className="gap-1 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                onClick={handleParse}
                disabled={!csvText.trim()}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === 'mapping' && (
              <Button
                className="gap-1 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                onClick={handlePreview}
                disabled={busy || unmappedRequired.length > 0}
              >
                Preview changes <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === 'preview' && (
              <Button
                className="gap-2 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                onClick={handleApply}
                disabled={busy || includedDiffs.filter((d) => (d.warnings?.length ?? 0) === 0).length === 0}
              >
                <Upload className="w-4 h-4" />
                Apply {includedDiffs.filter((d) => (d.warnings?.length ?? 0) === 0).length} change{includedDiffs.filter((d) => (d.warnings?.length ?? 0) === 0).length !== 1 ? 's' : ''}
              </Button>
            )}
            {step === 'result' && (
              <Button
                className="rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
