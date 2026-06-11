/**
 * InvoiceMilestonePanel — "Raise invoice" surface for gate G4
 * (decision D5). Shows the customer's payment-term milestone schedule
 * with each milestone's state (invoiced / ready / not reached), raises
 * the next eligible one through
 * `workflowService.raiseInvoiceForMilestone`, and renders a GateBanner
 * when G4 blocks. Dispatch/delivery milestones render one row per
 * shipment (one pro-rated invoice each).
 *
 * Mounted on the Order Journey page and Sell ▸ Order detail. Additive
 * UI only — the free-form invoice path stays available via the
 * "Open in editor" link into SellNewInvoice.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Receipt, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import type {
  GateFailureDetail,
  PaymentMilestone,
  PaymentMilestoneEvent,
  SalesOrder,
  Shipment,
} from '@/types/entities';
import * as mock from '@/services/mock';
import {
  GateFailure,
  MILESTONE_EVENT_LABELS,
  evaluateInvoiceMilestone,
  milestoneInvoiceAmount,
  milestoneInvoiceExists,
  milestonesForTerm,
  paymentTermForSalesOrder,
  workflowService,
} from '@/services/workflowService';
import { GateBanner } from './GateBanner';

type MilestoneState = 'invoiced' | 'ready' | 'blocked';

interface MilestoneRow {
  key: string;
  milestone: PaymentMilestone;
  shipment?: Shipment;
  state: MilestoneState;
  /** First G4 failure when blocked — shown as the row's hint. */
  blockedReason?: string;
  /** Estimated invoice amount (pct × order total, pro-rated to the shipment). */
  amount: number;
}

const STATE_BADGE: Record<MilestoneState, { label: string; className: string }> = {
  invoiced: { label: 'Invoiced', className: 'border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]' },
  ready: { label: 'Ready', className: 'border-0 bg-[var(--mw-yellow-400)]/25 text-foreground' },
  blocked: { label: 'Not reached', className: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]' },
};

function rowState(
  so: SalesOrder,
  milestone: PaymentMilestone,
  shipment?: Shipment,
): { state: MilestoneState; blockedReason?: string } {
  if (milestoneInvoiceExists(so.id, milestone.event, shipment?.id)) {
    return { state: 'invoiced' };
  }
  const failures = evaluateInvoiceMilestone(so, milestone, shipment?.id);
  if (failures.length === 0) return { state: 'ready' };
  return { state: 'blocked', blockedReason: failures[0].message };
}

export interface InvoiceMilestonePanelProps {
  salesOrderId: string;
  /** Called after an invoice is successfully raised. */
  onRaised?: () => void;
  className?: string;
}

export function InvoiceMilestonePanel({
  salesOrderId,
  onRaised,
  className,
}: InvoiceMilestonePanelProps) {
  const [failures, setFailures] = useState<GateFailureDetail[]>([]);
  const [raising, setRaising] = useState<string | null>(null);
  // Mock collections mutate in place — bump to recompute rows.
  const [version, setVersion] = useState(0);

  const so = useMemo(
    () => mock.salesOrders.find((s) => s.id === salesOrderId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [salesOrderId, version],
  );

  const term = useMemo(
    () => (so ? paymentTermForSalesOrder(so) : undefined),
    [so],
  );

  const rows = useMemo<MilestoneRow[]>(() => {
    if (!so) return [];
    const schedule = milestonesForTerm(term);
    const shipments = mock.shipments.filter((s) => s.salesOrderId === so.id);
    const out: MilestoneRow[] = [];
    for (const milestone of schedule) {
      const perShipment = milestone.event === 'dispatch' || milestone.event === 'delivery';
      if (perShipment && shipments.length > 0) {
        // One invoice per shipment, pro-rated to its lines.
        for (const shipment of shipments) {
          out.push({
            key: `${milestone.event}-${shipment.id}`,
            milestone,
            shipment,
            amount: milestoneInvoiceAmount(so, milestone, shipment),
            ...rowState(so, milestone, shipment),
          });
        }
      } else {
        out.push({
          key: milestone.event,
          milestone,
          amount: milestoneInvoiceAmount(so, milestone),
          ...rowState(so, milestone),
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [so, term, version]);

  if (!so) return null;

  const fmt = (v: number) =>
    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const nextEligibleKey = rows.find((r) => r.state === 'ready')?.key;

  const raise = async (event: PaymentMilestoneEvent, shipmentId?: string, key?: string) => {
    setRaising(key ?? event);
    try {
      const invoice = await workflowService.raiseInvoiceForMilestone({
        salesOrderId: so.id,
        event,
        shipmentId,
      });
      setFailures([]);
      toast.success(
        `Invoice ${invoice.invoiceNumber} raised — ${MILESTONE_EVENT_LABELS[event]} (${invoice.milestonePct}%) · ${fmt(invoice.amount)}`,
        { description: `Due ${invoice.dueDate} (${term?.label ?? 'default terms'}).` },
      );
      setVersion((v) => v + 1);
      onRaised?.();
    } catch (e) {
      if (e instanceof GateFailure) {
        setFailures(e.details);
      } else {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setRaising(null);
    }
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Receipt className="h-4 w-4 text-[var(--neutral-500)]" />
          Billing milestones
        </div>
        <span className="text-xs text-[var(--neutral-500)]">
          {term?.label ?? 'Default terms'} · net {term?.days ?? 30} days
        </span>
      </div>
      <p className="mb-3 text-xs text-[var(--neutral-500)]">
        Gate G4 — each invoice fires when its milestone event has occurred.
        Dispatch and delivery milestones raise one invoice per shipment,
        pro-rated to its lines.
      </p>

      {failures.length > 0 && (
        <div className="mb-3">
          <GateBanner failures={failures} title="G4 · Ship → Book blocked" />
        </div>
      )}

      <ul className="divide-y divide-[var(--border)]">
        {rows.map((row) => {
          const { milestone, shipment, state } = row;
          const badge = STATE_BADGE[state];
          return (
            <li key={row.key} className="flex flex-wrap items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                  <span className="font-medium">
                    {MILESTONE_EVENT_LABELS[milestone.event]}
                  </span>
                  <span className="tabular-nums text-[var(--neutral-500)]">
                    {milestone.pct}%
                  </span>
                  {shipment && (
                    <span className="tabular-nums text-xs text-[var(--neutral-500)]">
                      · {shipment.shipmentNumber}
                    </span>
                  )}
                  <span className="tabular-nums text-xs text-[var(--neutral-500)]">
                    · {fmt(row.amount)}
                  </span>
                </div>
                {state === 'blocked' && row.blockedReason && (
                  <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                    {row.blockedReason}
                  </p>
                )}
              </div>
              <Badge className={cn('rounded-full px-2.5 py-0.5 text-xs', badge.className)}>
                {badge.label}
              </Badge>
              {state === 'ready' && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    className="h-9 bg-[var(--mw-yellow-400)] px-3 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                    disabled={raising !== null}
                    onClick={() => raise(milestone.event, shipment?.id, row.key)}
                  >
                    {raising === row.key
                      ? 'Raising…'
                      : row.key === nextEligibleKey
                        ? 'Raise invoice'
                        : 'Raise'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-[var(--border)] px-2"
                    asChild
                  >
                    <Link
                      to={`/sell/invoices/new?soId=${so.id}&milestone=${milestone.event}${shipment ? `&shipmentId=${shipment.id}` : ''}`}
                      title="Open pre-linked in the invoice editor"
                      aria-label="Open pre-linked in the invoice editor"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
