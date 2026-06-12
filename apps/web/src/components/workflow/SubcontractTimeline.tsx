/**
 * 4-state subcontract lifecycle visualization for one SubcontractDispatch
 * (decision D10): released → at_supplier → received → closed. The
 * return leg is a Goods Receipt against the subcontract PO through
 * gate G5 — the old in-transit / returning intermediate states are gone.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Truck, PackageCheck, Building2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GateFailureDetail, SubcontractDispatch } from '@/types/entities';
import * as mock from '@/services/mock';
import { workflowService, GateFailure } from '@/services/workflowService';
import { GateBanner } from './GateBanner';

const STEPS: Array<{
  id: SubcontractDispatch['status'];
  label: string;
  icon: typeof Truck;
}> = [
  { id: 'released', label: 'Released', icon: Truck },
  { id: 'at_supplier', label: 'At supplier', icon: Building2 },
  { id: 'received', label: 'Received (G5)', icon: PackageCheck },
  { id: 'closed', label: 'Closed', icon: CheckCircle2 },
];

export interface SubcontractTimelineProps {
  dispatch: SubcontractDispatch;
  /**
   * When provided, the card renders lifecycle actions (At supplier /
   * Receive via G5 / Close) and calls back after each transition. The
   * Receive action routes through gate G5 — failures render inline.
   */
  onChanged?: () => void;
}

export function SubcontractTimeline({ dispatch, onChanged }: SubcontractTimelineProps) {
  const [busy, setBusy] = useState(false);
  const [gateFailures, setGateFailures] = useState<GateFailureDetail[]>([]);
  const currentIdx = STEPS.findIndex((s) => s.id === dispatch.status);
  const wo = mock.workOrders.find((w) => w.id === dispatch.workOrderId);
  const supplier = mock.suppliers.find((s) => s.id === dispatch.supplierId);
  const po = mock.purchaseOrders.find((p) => p.id === dispatch.purchaseOrderId);

  const advance = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      setGateFailures([]);
      toast.success(success);
      onChanged?.();
    } catch (e) {
      if (e instanceof GateFailure) {
        setGateFailures(e.details);
        toast.error('Receive blocked — Receiving gate (G5) failed');
      } else {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium">{wo?.woNumber ?? dispatch.workOrderId}</span>
          <span className="text-muted-foreground">
            {' '}· {supplier?.company ?? 'Supplier'}
            {po ? ` · ${po.poNumber}` : ''}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {dispatch.materialModel}
        </Badge>
      </div>
      <ol className="flex items-center gap-2 overflow-x-auto text-xs">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const reached = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <li key={step.id} className="flex items-center gap-2">
              <div
                className={[
                  'flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1',
                  current
                    ? 'bg-primary/10 text-primary ring-1 ring-primary'
                    : reached
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-muted-foreground',
                ].join(' ')}
              >
                <Icon className="h-3 w-3" aria-hidden />
                <span>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="text-muted-foreground/40">
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Released {new Date(dispatch.releasedAt).toLocaleString()}
        {dispatch.returnedAt && ` · Returned ${new Date(dispatch.returnedAt).toLocaleString()}`}
      </div>
      {onChanged && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {dispatch.status === 'released' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void advance(
                  () => workflowService.markSubcontractAtSupplier(dispatch.id),
                  'Goods arrived at the supplier.',
                )
              }
            >
              Mark at supplier
            </Button>
          )}
          {(dispatch.status === 'released' || dispatch.status === 'at_supplier') && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void advance(
                  () => workflowService.receiveSubcontract(dispatch.id),
                  `Received back via the Receiving gate (G5) against ${po?.poNumber ?? 'the subcontract PO'}.`,
                )
              }
            >
              Receive back (G5)
            </Button>
          )}
          {dispatch.status === 'received' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void advance(
                  () => workflowService.closeSubcontract(dispatch.id),
                  'Subcontract closed.',
                )
              }
            >
              Close
            </Button>
          )}
        </div>
      )}
      {gateFailures.length > 0 && (
        <div className="mt-3">
          <GateBanner failures={gateFailures} title="Receive blocked — Receiving gate (G5)" />
        </div>
      )}
    </Card>
  );
}
