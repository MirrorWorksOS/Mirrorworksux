/**
 * QC + Rework inspector — surfaced on any Work Order row. Operator can
 * record Pass / Fail / Hold inline; on Fail, a disposition picker opens
 * with the four standard choices (rework / scrap / use_as_is /
 * return_to_vendor). At reworkDepth >= 2 the rework option escalates to
 * supervisor via the existing GateFailure path.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, PauseCircle, RotateCw, Trash2, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkOrder } from '@/types/entities';
import { workflowService, GateFailure } from '@/services/workflowService';

type Disposition = 'rework' | 'scrap' | 'use_as_is' | 'return_to_vendor';

const DISPOSITIONS: { id: Disposition; label: string; icon: typeof RotateCw }[] = [
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

  const submitQc = async (result: 'pass' | 'fail' | 'hold') => {
    await workflowService.recordQualityCheck({
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
    setOpen(true);
  };

  const applyDisposition = async (d: Disposition) => {
    try {
      if (d === 'rework') {
        const r = await workflowService.createReworkWorkOrder({
          parentWorkOrderId: workOrder.id,
          raisedBy: 'emp-002',
        });
        toast.success(`Rework ${r.woNumber} created (depth ${r.reworkDepth}).`);
      } else if (d === 'use_as_is') {
        await workflowService.recordConcession({
          workOrderId: workOrder.id,
          jobId: 'job-001',
          reason: 'Customer accepted minor variance.',
          approvedBy: 'emp-001',
          customerContact: 'TechCorp QA',
        });
        toast.success(`Ship-with-concession logged for ${workOrder.woNumber}.`);
      } else if (d === 'scrap') {
        toast.success(`${workOrder.woNumber} scrapped (demo — variance posted).`);
      } else {
        toast.success(`Return-to-vendor raised for ${workOrder.woNumber} (demo).`);
      }
      setOpen(false);
      onChanged?.();
    } catch (e) {
      if (e instanceof GateFailure) {
        toast.error(`Supervisor escalation: ${e.details.map((x) => x.message).join('; ')}`);
      } else {
        toast.error(e instanceof Error ? e.message : 'Disposition failed.');
      }
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
              Rework cap hit (depth 2) — supervisor must override or scrap.
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
    </Card>
  );
}
