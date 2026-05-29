/**
 * Variation Order impact panel — surfaces the cost delta, schedule
 * delta and scope diff for one VO awaiting customer approval.
 * Side-by-side BoM compare is a stub today; lands properly when the
 * BoM editor surface ships.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VariationOrder } from '@/types/entities';
import { workflowService } from '@/services/workflowService';

const TYPE_TONE: Record<VariationOrder['type'], string> = {
  additive: 'bg-emerald-100 text-emerald-900',
  descope: 'bg-rose-100 text-rose-900',
  mixed: 'bg-violet-100 text-violet-900',
};

export interface VOImpactPanelProps {
  variation: VariationOrder;
  onChanged?: () => void;
}

export function VOImpactPanel({ variation: vo, onChanged }: VOImpactPanelProps) {
  const [busy, setBusy] = useState(false);
  const approve = async () => {
    setBusy(true);
    try {
      const r = await workflowService.approveVariation(vo.id, 'emp-001');
      toast.success(
        r.deltaJob
          ? `Approved ${vo.voNumber}; delta Job ${r.deltaJob.jobNumber} created.`
          : `Approved ${vo.voNumber} (descope — no delta job).`,
      );
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve VO.');
    } finally {
      setBusy(false);
    }
  };

  const sign = vo.costDelta >= 0 ? '+' : '−';
  const absCost = Math.abs(vo.costDelta).toLocaleString();
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
        {vo.status === 'awaiting_approval' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={approve}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
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
            {sign}${absCost}
          </div>
        </div>
        <div className="rounded-md border bg-card px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> Schedule delta
          </div>
          <div className={`mt-1 text-lg font-semibold ${vo.scheduleDeltaDays > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {dayPrefix}
            {absDays} day{absDays === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Chain ID <span className="font-mono">{vo.variationChainId}</span> · Created {new Date(vo.createdAt).toLocaleString()}
      </div>
    </Card>
  );
}
