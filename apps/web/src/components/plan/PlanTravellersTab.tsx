import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import type { TravellerPacket, TravellerStatus } from '@/store/travellerStore';

interface PlanTravellersTabProps {
  travellers: TravellerPacket[];
  selectedTravellerId: string | null;
  onSelectTraveller: (id: string) => void;
}

function statusLabel(status: TravellerStatus): string {
  if (status === 'in_progress') return 'In progress';
  return status.slice(0, 1).toUpperCase() + status.slice(1);
}

function statusVariant(status: TravellerStatus) {
  switch (status) {
    case 'ready':
      return 'info';
    case 'released':
    case 'in_progress':
      return 'accent';
    case 'hold':
      return 'warning';
    case 'complete':
      return 'success';
    case 'draft':
    default:
      return 'neutral';
  }
}

export function PlanTravellersTab({
  travellers,
  selectedTravellerId,
  onSelectTraveller,
}: PlanTravellersTabProps) {
  return (
    <div className="space-y-4">
      <Card variant="flat" className="border-[var(--border)] p-4">
        <p className="text-sm text-[var(--neutral-600)]">
          Plan authorises release. Make executes released travellers only. If something is
          missing, place the traveller on hold and notify planning.
        </p>
      </Card>

      <div className="space-y-4">
        {travellers.map((traveller) => {
          const isSelected = selectedTravellerId === traveller.id;
          return (
            <Card
              key={traveller.id}
              variant="flat"
              className={cn(
                'border p-5 transition-colors',
                isSelected ? 'border-[var(--mw-yellow-400)]' : 'border-[var(--border)]',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium tabular-nums">{traveller.travellerNumber}</span>
                    <StatusBadge variant={statusVariant(traveller.status)}>
                      {statusLabel(traveller.status)}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--neutral-600)]">
                    {traveller.partName} • {traveller.jobRef} / {traveller.workOrderRef}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="h-12 border-[var(--border)]"
                  onClick={() => onSelectTraveller(traveller.id)}
                >
                  {isSelected ? 'Selected' : 'Review'}
                </Button>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-[var(--neutral-500)]">Drawing</p>
                  <p>{traveller.drawingNumber} • {traveller.drawingRevision}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)]">Quantity to make</p>
                  <p className="tabular-nums">{traveller.quantityToMake}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)]">Current operation</p>
                  <p>{traveller.currentOperation}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neutral-500)]">Workstation / work centre</p>
                  <p>{traveller.workstation} • {traveller.workCentre}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs text-[var(--neutral-500)]">Route / operation strip</p>
                <div className="flex flex-wrap gap-2">
                  {traveller.routeOperationStrip.map((step) => (
                    <Badge key={`${traveller.id}-${step}`} variant="outline" className="border-[var(--border)]">
                      {step}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-[var(--neutral-600)] sm:grid-cols-2 lg:grid-cols-4">
                <p>Drawing: <span className="text-foreground">{traveller.linkedFiles.drawing}</span></p>
                <p>NC: <span className="text-foreground">{traveller.linkedFiles.nc}</span></p>
                <p>Instructions: <span className="text-foreground">{traveller.linkedFiles.instructions}</span></p>
                <p>QC: <span className="text-foreground">{traveller.linkedFiles.qc}</span></p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
