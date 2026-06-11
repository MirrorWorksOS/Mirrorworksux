/**
 * KickoffDialog — surfaced on Sell ▸ Order Detail when the user confirms a
 * sales order. Reflects the one-Job-per-SO grain (workflow decision D2):
 * the order releases ONE Plan Job covering its manufactured (mto / eto)
 * lines, and each manufactured line becomes a Manufacturing Order under
 * that Job. Stock-sale lines skip Plan entirely — a pick list is raised
 * instead — and pure stock-sale orders create no Job at all.
 *
 * For each manufactured line, picks the activity templates that should be
 * applied to the order's Plan job. Resolution order per line:
 *   1. Explicit pins on the Product (`Product.defaultTemplateIds`)
 *   2. Fallback: templates whose `productKinds` include the Product's `productKind`
 *
 * On confirm we synthesise ONE JobId for the order and call
 * `useJobActivityStore.applyTemplate` per included line so the resulting
 * activities land in the Plan ▸ Activities feed (with the template's
 * `defaultAssignee.label` already copied into `assignedTo`).
 *
 * This is a demo wiring — there's no `planService.jobs.create` yet, so the
 * dialog returns the synthetic jobId via the `onApplied` callback for the
 * caller to surface (e.g. toast with "Open Plan ▸ Activities").
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/components/ui/utils';

import { useJobActivityStore } from '@/store/jobActivityStore';
import type { JobActivityTemplate, ProductKind } from '@/types/job-activity';
import type { ProductRoute } from '@/types/entities';
import { AssigneeChip } from '@/components/shared/assignee/AssigneeChip';

/**
 * Minimal product shape the dialog needs per line. The caller passes one
 * entry per line item (already resolved against the product catalogue).
 */
export interface KickoffProduct {
  /** Stable product id (PRODUCT-001 or similar). */
  id: string;
  /** Display label (typically partNumber or SKU). */
  label: string;
  /** Single-line description shown under the label. */
  description?: string;
  productKind?: ProductKind;
  /** Explicit template pins from the product. */
  defaultTemplateIds?: string[];
  /**
   * Effective fulfilment route for the line. Manufactured routes
   * (mto / eto) become MOs under the order's single Job; stock_sale
   * lines skip Plan — a pick list is raised instead.
   */
  route?: ProductRoute;
}

export interface KickoffLine {
  /** Order line id — used for stable React keys, not for job creation. */
  id: string;
  product: KickoffProduct;
  qty: number;
}

/** Result of confirming the kickoff — one Job per order (decision D2). */
export interface KickoffResult {
  /** Absent when the order is pure stock-sale (no Job — pick list raised). */
  job?: { jobId: string; jobNumber: string };
  /** One entry per included manufactured line — each becomes an MO under the Job. */
  lines: { lineId: string; templateIds: string[] }[];
  /** Count of stock-sale lines that bypass Plan via pick lists. */
  stockLineCount: number;
}

interface KickoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  lines: KickoffLine[];
  /** Called when the user confirms. */
  onApplied?: (result: KickoffResult) => void;
}

interface LineDraft {
  included: boolean;
  pickedTemplateIds: string[];
}

export function KickoffDialog({
  open,
  onOpenChange,
  orderNumber,
  lines,
  onApplied,
}: KickoffDialogProps) {
  const allTemplates = useJobActivityStore((s) => s.templates);
  const applyTemplate = useJobActivityStore((s) => s.applyTemplate);

  // One Job per order (D2): only manufactured lines feed the Job; stock
  // lines are picked from inventory.
  const isStockLine = (line: KickoffLine) => line.product.route === 'stock_sale';
  const manufacturedLines = lines.filter((l) => !isStockLine(l));
  const stockLines = lines.filter(isStockLine);

  /** Pre-resolve which templates apply to a line. */
  const resolveSuggested = (p: KickoffProduct): JobActivityTemplate[] => {
    if (p.defaultTemplateIds && p.defaultTemplateIds.length > 0) {
      return allTemplates.filter((t) => p.defaultTemplateIds!.includes(t.id));
    }
    if (p.productKind) {
      return allTemplates.filter((t) => t.productKinds.includes(p.productKind!));
    }
    return [];
  };

  const initialDraft = (): Record<string, LineDraft> => {
    const out: Record<string, LineDraft> = {};
    for (const line of manufacturedLines) {
      const suggested = resolveSuggested(line.product);
      out[line.id] = {
        included: suggested.length > 0,
        // Pre-tick: pinned templates always, kind-matched only if there are no pins.
        pickedTemplateIds: suggested.map((t) => t.id),
      };
    }
    return out;
  };

  const [drafts, setDrafts] = useState<Record<string, LineDraft>>(() => initialDraft());

  // Reset draft state whenever the dialog re-opens for a fresh order.
  useEffect(() => {
    if (open) setDrafts(initialDraft());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lines]);

  const toggleLine = (lineId: string) => {
    setDrafts((d) => ({ ...d, [lineId]: { ...d[lineId], included: !d[lineId].included } }));
  };

  const toggleTemplate = (lineId: string, templateId: string) => {
    setDrafts((d) => {
      const picked = d[lineId].pickedTemplateIds;
      const next = picked.includes(templateId)
        ? picked.filter((id) => id !== templateId)
        : [...picked, templateId];
      return { ...d, [lineId]: { ...d[lineId], pickedTemplateIds: next } };
    });
  };

  const summary = useMemo(() => {
    let mos = 0;
    let activities = 0;
    for (const line of manufacturedLines) {
      const d = drafts[line.id];
      if (!d?.included) continue;
      mos += 1;
      for (const tid of d.pickedTemplateIds) {
        const t = allTemplates.find((x) => x.id === tid);
        if (t) activities += t.activities.length;
      }
    }
    return { mos, activities };
  }, [drafts, manufacturedLines, allTemplates]);

  const stockOnly = manufacturedLines.length === 0 && stockLines.length > 0;

  const handleConfirm = () => {
    const startIso = new Date().toISOString();
    const includedLines: { lineId: string; templateIds: string[] }[] = [];

    // ONE Job per order (D2) — every included manufactured line becomes
    // an MO under it. Pure stock-sale orders create no Job.
    let job: KickoffResult['job'];
    if (summary.mos > 0) {
      const jobId = `job-${orderNumber.toLowerCase()}-${Date.now().toString(36)}`;
      const jobNumber = `JOB-${orderNumber.replace(/[^0-9]/g, '')}`;
      job = { jobId, jobNumber };
      for (const line of manufacturedLines) {
        const d = drafts[line.id];
        if (!d?.included) continue;
        for (const tid of d.pickedTemplateIds) {
          applyTemplate(jobId, jobNumber, tid, startIso);
        }
        includedLines.push({ lineId: line.id, templateIds: d.pickedTemplateIds });
      }
    }

    onApplied?.({ job, lines: includedLines, stockLineCount: stockLines.length });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm order &amp; release to Plan</DialogTitle>
          <DialogDescription>
            {stockOnly
              ? 'All lines are stock-sale — no Job is created; a pick list is raised instead.'
              : 'The order releases one Plan Job; each included line becomes a Manufacturing Order under it. Pick which activity templates pre-apply — pins from the product are ticked by default.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {manufacturedLines.map((line) => {
            const draft = drafts[line.id] ?? { included: false, pickedTemplateIds: [] };
            const suggested = resolveSuggested(line.product);
            const hasSuggestions = suggested.length > 0;

            return (
              <div
                key={line.id}
                className={cn(
                  'rounded-md border px-4 py-3 transition-colors',
                  draft.included
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                    : 'border-[var(--border)] bg-card',
                )}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={draft.included}
                    onCheckedChange={() => toggleLine(line.id)}
                    className="mt-0.5"
                    disabled={!hasSuggestions}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {line.product.label}
                      </span>
                      <Badge variant="outline" className="border-[var(--border)] text-[10px]">
                        Qty {line.qty}
                      </Badge>
                      {line.product.productKind && (
                        <Badge
                          variant="outline"
                          className="border-[var(--border)] text-[10px] capitalize"
                        >
                          {line.product.productKind}
                        </Badge>
                      )}
                    </div>
                    {line.product.description && (
                      <p className="text-xs text-[var(--neutral-500)] mt-0.5 truncate">
                        {line.product.description}
                      </p>
                    )}
                    {!hasSuggestions && (
                      <p className="text-[11px] text-[var(--neutral-500)] mt-1.5 italic">
                        No activity templates linked. Set `productKind` or pin templates on
                        the product to enable kickoff.
                      </p>
                    )}
                  </div>
                </label>

                {draft.included && hasSuggestions && (
                  <div className="mt-3 ml-7 space-y-1.5">
                    {suggested.map((t) => {
                      const ticked = draft.pickedTemplateIds.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className="flex items-start gap-2 text-xs cursor-pointer"
                        >
                          <Checkbox
                            checked={ticked}
                            onCheckedChange={() => toggleTemplate(line.id, t.id)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-medium text-foreground">{t.name}</span>
                              <span className="text-[10px] tabular-nums text-[var(--neutral-500)]">
                                {t.activities.length} acts
                              </span>
                              {t.activities
                                .flatMap((a) =>
                                  [a.defaultAssignee, a.defaultMachine].filter(
                                    (x): x is NonNullable<typeof x> => Boolean(x),
                                  ),
                                )
                                .slice(0, 4)
                                .map((a, i) => (
                                  <AssigneeChip key={i} assignee={a} />
                                ))}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {stockLines.map((line) => (
            <div
              key={line.id}
              className="rounded-md border border-dashed border-[var(--border)] bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {line.product.label}
                </span>
                <Badge variant="outline" className="border-[var(--border)] text-[10px]">
                  Qty {line.qty}
                </Badge>
                <Badge variant="outline" className="border-[var(--border)] text-[10px]">
                  Stock sale
                </Badge>
              </div>
              <p className="text-[11px] text-[var(--neutral-500)] mt-1.5">
                No Job — pick list raised. This line is picked from stock and skips Plan.
              </p>
            </div>
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between gap-3 sm:justify-between">
          <p className="text-xs text-[var(--neutral-500)]">
            <FileText className="inline-block h-3 w-3 mr-1" />
            {summary.mos > 0 ? (
              <>
                1 Job · {summary.mos} {summary.mos === 1 ? 'MO' : 'MOs'} · {summary.activities}{' '}
                {summary.activities === 1 ? 'activity' : 'activities'} will be created
                {stockLines.length > 0 &&
                  ` · ${stockLines.length} stock line${stockLines.length === 1 ? '' : 's'} → pick list`}
              </>
            ) : stockOnly ? (
              <>No Job — pick list raised for {stockLines.length} stock line{stockLines.length === 1 ? '' : 's'}</>
            ) : (
              <>Nothing selected — include at least one line</>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[var(--border)]">
              Cancel
            </Button>
            <Button
              disabled={summary.mos === 0 && !stockOnly}
              onClick={handleConfirm}
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            >
              Confirm &amp; release
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
