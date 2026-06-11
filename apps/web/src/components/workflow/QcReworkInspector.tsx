/**
 * QC + Rework inspector — surfaced on any Work Order row. Operator can
 * record Pass / Fail / Hold inline; on Fail, a disposition picker opens
 * with the four standard choices (rework / scrap / use_as_is /
 * return_to_vendor). QC owns disposition (decision D9, no NCR entity):
 * each choice stamps disposition / qty / costImpact / links on the
 * QualityCheck. Scrap forces an explicit remake-or-ship-short prompt
 * (shortfall MO vs concession); return-to-vendor raises a
 * SupplierReturn. At reworkDepth >= 2 the rework option escalates to a
 * lead via the existing GateFailure path.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, PauseCircle, RotateCw, Trash2, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { QcDisposition, WorkOrder } from '@/types/entities';
import * as mock from '@/services/mock';
import { workflowService, GateFailure } from '@/services/workflowService';

const DISPOSITIONS: { id: QcDisposition; label: string; icon: typeof RotateCw }[] = [
  { id: 'rework', label: 'Rework', icon: RotateCw },
  { id: 'scrap', label: 'Scrap', icon: Trash2 },
  { id: 'use_as_is', label: 'Use as-is (concession)', icon: ShieldCheck },
  { id: 'return_to_vendor', label: 'Return to vendor', icon: ArrowLeftRight },
];

export interface QcReworkInspectorProps {
  workOrder: WorkOrder;
  onChanged?: () => void;
}

export function QcReworkInspector({ workOrder, onChanged }: QcReworkInspectorProps) {
  const [open, setOpen] = useState(false);
  /** The failed QualityCheck the disposition is being recorded against. */
  const [qcId, setQcId] = useState<string | null>(null);

  // Scrap modal — step 1 records qty + cost impact on the QC; step 2
  // forces the explicit remake-or-ship-short choice (decision D9).
  const [scrapOpen, setScrapOpen] = useState(false);
  const [scrapStep, setScrapStep] = useState<'record' | 'resolve'>('record');
  const [scrapQty, setScrapQty] = useState('1');
  const [scrapCost, setScrapCost] = useState('0');

  // Return-to-vendor modal — raises a SupplierReturn linked to the QC.
  const [rtvOpen, setRtvOpen] = useState(false);
  const [rtvQty, setRtvQty] = useState('1');
  const [rtvReason, setRtvReason] = useState('');

  const jobIdForWo = (): string => {
    const mo = mock.manufacturingOrders.find((m) => m.id === workOrder.manufacturingOrderId);
    return mo?.jobId ?? 'job-001';
  };

  const submitQc = async (result: 'pass' | 'fail' | 'hold') => {
    const qc = await workflowService.recordQualityCheck({
      workOrderId: workOrder.id,
      result,
      inspectorId: 'emp-002',
    });
    if (result === 'pass') {
      toast.success(`${workOrder.woNumber} passed QC.`);
      onChanged?.();
      return;
    }
    if (result === 'hold') {
      toast.message(`${workOrder.woNumber} placed on hold pending review.`);
      onChanged?.();
      return;
    }
    setQcId(qc.id);
    setOpen(true);
  };

  const handleError = (e: unknown) => {
    if (e instanceof GateFailure) {
      toast.error(`Lead escalation: ${e.details.map((x) => x.message).join('; ')}`);
    } else {
      toast.error(e instanceof Error ? e.message : 'Disposition failed.');
    }
  };

  const applyDisposition = async (d: QcDisposition) => {
    try {
      if (d === 'rework') {
        const r = await workflowService.createReworkWorkOrder({
          parentWorkOrderId: workOrder.id,
          raisedBy: 'emp-002',
        });
        if (qcId) {
          await workflowService.setQcDisposition(qcId, {
            disposition: 'rework',
            links: { reworkWorkOrderId: r.id },
          });
        }
        toast.success(`Rework ${r.woNumber} created (depth ${r.reworkDepth}).`);
      } else if (d === 'use_as_is') {
        const concession = await workflowService.recordConcession({
          workOrderId: workOrder.id,
          jobId: jobIdForWo(),
          reason: 'Customer accepted minor variance.',
          approvedBy: 'emp-001',
          customerContact: 'TechCorp QA',
        });
        if (qcId) {
          await workflowService.setQcDisposition(qcId, {
            disposition: 'use_as_is',
            links: { concessionId: concession.id },
          });
        }
        toast.success(`Ship-with-concession logged for ${workOrder.woNumber}.`);
      } else if (d === 'scrap') {
        // Scrap needs qty + cost impact, then the remake-or-ship-short
        // prompt — handled in the modal; the picker stays open behind it.
        setScrapStep('record');
        setScrapOpen(true);
        return;
      } else {
        setRtvOpen(true);
        return;
      }
      setOpen(false);
      onChanged?.();
    } catch (e) {
      handleError(e);
    }
  };

  const recordScrap = async () => {
    if (!qcId) return;
    const qty = Number(scrapQty);
    const costImpact = Number(scrapCost);
    if (!(qty > 0)) {
      toast.error('Enter the scrapped quantity.');
      return;
    }
    try {
      await workflowService.setQcDisposition(qcId, { disposition: 'scrap', qty, costImpact });
      setScrapStep('resolve');
    } catch (e) {
      handleError(e);
    }
  };

  const resolveScrap = async (path: 'remake' | 'ship_short') => {
    if (!qcId) return;
    try {
      if (path === 'remake') {
        const mo = await workflowService.createShortfallMo({ qualityCheckId: qcId });
        toast.success(
          `Shortfall MO ${mo.moNumber} (qty ${mo.qty}) created under ${mo.jobNumber} — draft, flagged for re-schedule.`,
        );
      } else {
        const concession = await workflowService.recordConcession({
          workOrderId: workOrder.id,
          jobId: jobIdForWo(),
          reason: `Ship short after scrap of ${scrapQty} unit(s) on ${workOrder.woNumber}.`,
          approvedBy: 'emp-001',
        });
        await workflowService.setQcDisposition(qcId, {
          disposition: 'scrap',
          links: { concessionId: concession.id },
        });
        toast.success(`Ship-short concession logged for ${workOrder.woNumber}.`);
      }
      setScrapOpen(false);
      setOpen(false);
      onChanged?.();
    } catch (e) {
      handleError(e);
    }
  };

  const raiseSupplierReturn = async () => {
    const qty = Number(rtvQty);
    if (!(qty > 0)) {
      toast.error('Enter the quantity being returned.');
      return;
    }
    if (!rtvReason.trim()) {
      toast.error('Enter the reason for the return.');
      return;
    }
    try {
      const sr = await workflowService.createSupplierReturn({
        workOrderId: workOrder.id,
        qty,
        reason: rtvReason,
        qualityCheckId: qcId ?? undefined,
      });
      toast.success(
        `Supplier return raised for ${workOrder.woNumber} (qty ${sr.qty}) — debit against the Bill follows in Book.`,
      );
      setRtvOpen(false);
      setOpen(false);
      onChanged?.();
    } catch (e) {
      handleError(e);
    }
  };

  const escalated = (workOrder.reworkDepth ?? 0) >= 2;

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium">{workOrder.woNumber}</span>
          <span className="text-muted-foreground"> · {workOrder.machineName}</span>
          {(workOrder.reworkDepth ?? 0) > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              rework depth {workOrder.reworkDepth}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => submitQc('pass')}>
            <Check className="mr-1 h-3.5 w-3.5" /> Pass
          </Button>
          <Button size="sm" variant="outline" onClick={() => submitQc('fail')}>
            <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Fail
          </Button>
          <Button size="sm" variant="outline" onClick={() => submitQc('hold')}>
            <PauseCircle className="mr-1 h-3.5 w-3.5" /> Hold
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-md border bg-muted/30 p-3">
          {escalated && (
            <div className="mb-2 flex items-center gap-2 rounded border border-destructive/40 bg-destructive/5 px-2 py-1 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Rework cap hit (depth 2) — a lead must override or scrap.
            </div>
          )}
          <div className="mb-2 text-xs font-medium">Choose disposition</div>
          <div className="flex flex-wrap gap-2">
            {DISPOSITIONS.map((d) => {
              const Icon = d.icon;
              const disabled = d.id === 'rework' && escalated;
              return (
                <Button
                  key={d.id}
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => applyDisposition(d.id)}
                >
                  <Icon className="mr-1 h-3.5 w-3.5" />
                  {d.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={scrapOpen} onOpenChange={setScrapOpen}>
        <DialogContent className="sm:max-w-md">
          {scrapStep === 'record' ? (
            <>
              <DialogHeader>
                <DialogTitle>Scrap — {workOrder.woNumber}</DialogTitle>
                <DialogDescription>
                  Scrap charges the Job — the cost never leaves the job&apos;s P&amp;L
                  (decision D9). Record the scrapped quantity and cost impact, then
                  choose how to cover the shortfall.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="scrap-qty" className="text-xs font-medium">Scrapped qty</label>
                  <Input
                    id="scrap-qty"
                    type="number"
                    min="1"
                    value={scrapQty}
                    onChange={(e) => setScrapQty(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="scrap-cost" className="text-xs font-medium">Cost impact ($)</label>
                  <Input
                    id="scrap-cost"
                    type="number"
                    min="0"
                    value={scrapCost}
                    onChange={(e) => setScrapCost(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScrapOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void recordScrap()}>Record scrap</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Cover the shortfall — {workOrder.woNumber}</DialogTitle>
                <DialogDescription>
                  {scrapQty} unit(s) scrapped and charged to the Job. Remake them with
                  a shortfall MO (re-fires MRP + schedule), or ship short via the
                  concession path.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" onClick={() => void resolveScrap('remake')}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Remake — shortfall MO under the same Job
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => void resolveScrap('ship_short')}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Ship short — record a concession
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rtvOpen} onOpenChange={setRtvOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return to vendor — {workOrder.woNumber}</DialogTitle>
            <DialogDescription>
              Raises a supplier return for the defective material, linked to this QC
              check. The debit against the supplier&apos;s Bill follows in Book.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="rtv-qty" className="text-xs font-medium">Qty to return</label>
              <Input
                id="rtv-qty"
                type="number"
                min="1"
                value={rtvQty}
                onChange={(e) => setRtvQty(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="rtv-reason" className="text-xs font-medium">Reason</label>
              <Input
                id="rtv-reason"
                value={rtvReason}
                onChange={(e) => setRtvReason(e.target.value)}
                placeholder="e.g. material out of spec on arrival"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRtvOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void raiseSupplierReturn()}>Raise supplier return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
