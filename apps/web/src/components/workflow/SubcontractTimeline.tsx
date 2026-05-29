/**
 * 5-step subcontract lifecycle visualization for one SubcontractDispatch.
 * Renders horizontal nodes (released → in_transit → at_supplier →
 * returning → received → closed) with the current state highlighted.
 */
import { Truck, PackageCheck, Building2, MoveLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SubcontractDispatch } from '@/types/entities';
import * as mock from '@/services/mock';

const STEPS: Array<{
  id: SubcontractDispatch['status'];
  label: string;
  icon: typeof Truck;
}> = [
  { id: 'released', label: 'Released', icon: Truck },
  { id: 'subcontract_in_transit', label: 'In transit out', icon: Truck },
  { id: 'at_supplier', label: 'At supplier', icon: Building2 },
  { id: 'returning', label: 'Returning', icon: MoveLeft },
  { id: 'received', label: 'Received', icon: PackageCheck },
  { id: 'closed', label: 'Closed', icon: CheckCircle2 },
];

export interface SubcontractTimelineProps {
  dispatch: SubcontractDispatch;
}

export function SubcontractTimeline({ dispatch }: SubcontractTimelineProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === dispatch.status);
  const wo = mock.workOrders.find((w) => w.id === dispatch.workOrderId);
  const supplier = mock.suppliers.find((s) => s.id === dispatch.supplierId);
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium">{wo?.woNumber ?? dispatch.workOrderId}</span>
          <span className="text-muted-foreground"> · {supplier?.company ?? 'Supplier'}</span>
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
    </Card>
  );
}
