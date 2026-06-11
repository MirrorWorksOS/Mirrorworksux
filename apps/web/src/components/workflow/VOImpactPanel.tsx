/**
 * Variation Order impact panel — decision D8: approval amends the LIVE
 * Job in place (the delta-Job path is gone). Shows the baseline-vs-
 * amended preview off the VO's immutable baseline snapshot: MO qty
 * diffs, schedule delta, cost delta, the uninvoiced-milestone
 * adjustment, and a prominent warning + Credit Note summary when a
 * descope exceeds the uninvoiced remainder.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Receipt,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VariationOrder } from '@/types/entities';
import * as mock from '@/services/mock';
import { workflowService } from '@/services/workflowService';

const TYPE_TONE: Record<VariationOrder['type'], string> = {
  additive: 'bg-emerald-100 text-emerald-900',
  descope: 'bg-rose-100 text-rose-900',
  mixed: 'bg-violet-100 text-violet-900',
};

const money = (n: number) =>
  `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export interface VOImpactPanelProps {
  variation: VariationOrder;
  onChanged?: () => void;
}

export function VOImpactPanel({ variation: vo, onChanged }: VOImpactPanelProps) {
  const [busy, setBusy] = useState(false);

  const baseline = vo.baseline;
  const pending = vo.status === 'awaiting_approval';

  // Projected amendment (preview maths mirror approveVariation).
  const projection = useMemo(() => {
    const soTotal = baseline?.soTotal ?? 0;
    const newTotal = Math.max(0, soTotal + vo.costDelta);
    const ratio = soTotal > 0 ? newTotal / soTotal : 1;
    const uninvoiced = baseline?.uninvoicedRemainder ?? 0;
    const reduction = -vo.costDelta;
    const creditOwed = reduction > 0 && reduction > uninvoiced ? reduction - uninvoiced : 0;
    return {
      newTotal,
      ratio,
      uninvoiced,
      uninvoicedAfter: Math.max(0, uninvoiced + vo.costDelta),
      creditOwed,
    };
  }, [baseline, vo.costDelta]);

  // After approval, surface the credit note that was raised (if any).
  const raisedCreditNote = useMemo(
    () => mock.creditNotes.find((c) => c.variationOrderId === vo.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vo.id, vo.status],
  );

  const approve = async () => {
    setBusy(true);
    try {
      const r = await workflowService.approveVariation(vo.id, 'emp-001');
      const moNote = r.amendedMos.length > 0
        ? ` ${r.amendedMos.length} MO${r.amendedMos.length === 1 ? '' : 's'} flagged for re-schedule.`
        : '';
      toast.success(
        r.job
          ? `Approved ${vo.voNumber} — Job ${r.job.jobNumber} amended in place.${moNote}`
          : `Approved ${vo.voNumber} — order re-priced (no live Job to amend).`,
      );
      if (r.creditNote) {
        toast.warning(
          `Descope exceeds the uninvoiced remainder — draft Credit Note ${r.creditNote.creditNoteNumber} raised for ${money(r.creditNote.amount)}.`,
        );
      }
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve VO.');
    } finally {
      setBusy(false);
    }
  };

  const sign = vo.costDelta >= 0 ? '+' : '−';
  const dayPrefix = vo.scheduleDeltaDays >= 0 ? '+' : '−';
  const absDays = Math.abs(vo.scheduleDeltaDays);

  return (
    <Card className="border-violet-200 bg-violet-50/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{vo.voNumber}</span>
            <Badge className={TYPE_TONE[vo.type]}>{vo.type}</Badge>
            <Badge variant="outline" className="text-[10px]">
              {vo.status}
            </Badge>
          </div>
          <div className="mt-1 text-sm text-foreground">{vo.description}</div>
        </div>
        {pending && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={approve}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve &amp; amend Job
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} title="Reject (demo)">
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border bg-card px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" /> Cost delta
          </div>
          <div className={`mt-1 text-lg font-semibold ${vo.costDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {sign}{money(vo.costDelta)}
          </div>
          {baseline && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              {money(baseline.soTotal)} <ArrowRight className="h-3 w-3" /> {money(projection.newTotal)} order total
            </div>
          )}
        </div>
        <div className="rounded-md border bg-card px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> Schedule delta
          </div>
          <div className={`mt-1 text-lg font-semibold ${vo.scheduleDeltaDays > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {dayPrefix}
            {absDays} day{absDays === 1 ? '' : 's'}
          </div>
          {baseline?.jobDueDate && (
            <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              Job due {baseline.jobDueDate}
              {vo.scheduleDeltaDays !== 0 && ` → shifts ${dayPrefix}${absDays}d`}
            </div>
          )}
        </div>
      </div>

      {/* Baseline vs amended — MO qty diffs off the immutable snapshot. */}
      {baseline && baseline.mos.length > 0 && (
        <div className="mt-3 rounded-md border bg-card px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            {pending ? 'Baseline → amended (preview)' : 'Baseline at raise time'} —{' '}
            {baseline.jobNumber ?? 'Job'} amended in place; completed work preserved
          </div>
          <div className="mt-1.5 space-y-1">
            {baseline.mos.map((m) => {
              const projectedQty =
                m.qty != null ? Math.max(0, Math.round(m.qty * projection.ratio)) : undefined;
              const done = m.status === 'done';
              return (
                <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">
                    <span className="font-mono">{m.moNumber}</span>
                    <span className="ml-1.5 text-muted-foreground">{m.productName}</span>
                  </span>
                  {done ? (
                    <span className="shrink-0 text-muted-foreground">
                      qty {m.qty ?? '—'} · done — preserved
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 tabular-nums">
                      qty {m.qty ?? '—'}
                      {pending && m.qty != null && projectedQty !== m.qty && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className={projectedQty! > m.qty ? 'text-emerald-700' : 'text-rose-700'}>
                            {projectedQty}
                          </span>
                        </>
                      )}
                      <span className="ml-1 text-muted-foreground">· re-schedule</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uninvoiced-milestone adjustment (D8 → D5 re-pricing). */}
      {baseline && (
        <div className="mt-3 rounded-md border bg-card px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Receipt className="h-3 w-3" /> Uninvoiced milestones
          </div>
          <div className="mt-1 flex items-center gap-1 tabular-nums">
            {money(projection.uninvoiced)} remaining
            {pending && (
              <>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>{money(projection.uninvoicedAfter)} after approval</span>
              </>
            )}
          </div>
          <div className="mt-0.5 text-muted-foreground">
            Un-raised milestones re-price automatically (pct × amended order total).
            Already-raised invoices are untouched.
          </div>
        </div>
      )}

      {/* Prominent warning: descope exceeds the uninvoiced remainder. */}
      {pending && projection.creditOwed > 0 && (
        <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" /> Descope exceeds the uninvoiced remainder
          </div>
          <div className="mt-1">
            The reduction of {money(vo.costDelta)} is {money(projection.creditOwed)} more than the{' '}
            {money(projection.uninvoiced)} still uninvoiced. Approving raises a{' '}
            <span className="font-semibold">draft Credit Note for {money(projection.creditOwed)}</span>{' '}
            against value already invoiced.
          </div>
        </div>
      )}

      {/* Post-approval Credit Note summary. */}
      {raisedCreditNote && (
        <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <Receipt className="h-3.5 w-3.5" /> Credit Note {raisedCreditNote.creditNoteNumber} ·{' '}
            {money(raisedCreditNote.amount)} · {raisedCreditNote.status}
          </div>
          <div className="mt-1">
            Raised because this descope exceeded the uninvoiced remainder.{' '}
            <Link to={`/book/credit-notes/${raisedCreditNote.id}`} className="underline">
              Open in Book ▸ Credit Notes
            </Link>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        Chain ID <span className="font-mono">{vo.variationChainId}</span> · Created {new Date(vo.createdAt).toLocaleString()}
        {baseline && <> · Baseline captured {new Date(baseline.capturedAt).toLocaleString()}</>}
      </div>
    </Card>
  );
}
