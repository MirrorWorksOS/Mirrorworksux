import { useState } from 'react';
import { Printer, FileSignature, StickyNote, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/ui/utils';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { toast } from 'sonner';
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
    case 'ready': return 'info';
    case 'released':
    case 'in_progress': return 'accent';
    case 'hold': return 'warning';
    case 'complete': return 'success';
    case 'draft':
    default: return 'neutral';
  }
}

/** Per-traveller scratchpad: signatures + production notes captured during
 *  execution. Holds in-memory state for the prototype; production wiring goes
 *  through the traveller store. */
interface TravellerScratch {
  releasedBy: string;
  releasedAt: string;
  operatorSignoff: string;
  qcSignoff: string;
  productionNotes: string;
}

const DEFAULT_SCRATCH = (): TravellerScratch => ({
  releasedBy: '',
  releasedAt: '',
  operatorSignoff: '',
  qcSignoff: '',
  productionNotes: '',
});

export function PlanTravellersTab({
  travellers,
  selectedTravellerId,
  onSelectTraveller,
}: PlanTravellersTabProps) {
  const [scratch, setScratch] = useState<Record<string, TravellerScratch>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const getScratch = (id: string) => scratch[id] ?? DEFAULT_SCRATCH();
  const patchScratch = (id: string, patch: Partial<TravellerScratch>) => {
    setScratch((s) => ({ ...s, [id]: { ...getScratch(id), ...patch } }));
  };

  const handlePrint = (t: TravellerPacket) => {
    // Browser print covers the prototype need; production wires a server-side
    // PDF render with the traveller's full operation strip, drawings, and notes.
    if (typeof window !== 'undefined') {
      toast.success(`Printing ${t.travellerNumber}`);
      window.print();
    }
  };

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
          const isEditingNotes = editingId === traveller.id;
          const s = getScratch(traveller.id);
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 border-[var(--border)]"
                    onClick={() => handlePrint(traveller)}
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 border-[var(--border)]"
                    onClick={() => onSelectTraveller(traveller.id)}
                  >
                    {isSelected ? 'Selected' : 'Review'}
                  </Button>
                </div>
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

              {/* Signatures — captured at release and at each handoff. The
                  shop-floor PDF print of the traveller (Kevin Meyer's
                  "value-add" idea) requires a visible signature block so the
                  paper copy can be physically initialled. */}
              <div className="mt-5 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-4 dark:bg-[var(--neutral-900)]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
                      Signatures
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setEditingId(isEditingNotes ? null : traveller.id)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    {isEditingNotes ? 'Done' : 'Sign'}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--neutral-500)]">Released by (Plan)</p>
                    <Input
                      placeholder="Signature"
                      value={s.releasedBy}
                      onChange={(e) => patchScratch(traveller.id, { releasedBy: e.target.value })}
                      readOnly={!isEditingNotes}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--neutral-500)]">Operator</p>
                    <Input
                      placeholder="Signature"
                      value={s.operatorSignoff}
                      onChange={(e) => patchScratch(traveller.id, { operatorSignoff: e.target.value })}
                      readOnly={!isEditingNotes}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--neutral-500)]">QC</p>
                    <Input
                      placeholder="Signature"
                      value={s.qcSignoff}
                      onChange={(e) => patchScratch(traveller.id, { qcSignoff: e.target.value })}
                      readOnly={!isEditingNotes}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Production notes — free-text scratchpad shop floor uses to
                  log issues, deviations, or hand-off context. Captures
                  Kevin Meyer's "value your fell" value-add intent. */}
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <StickyNote className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
                    Production notes
                  </span>
                </div>
                <Textarea
                  placeholder="Operator observations, deviations, hand-off notes…"
                  value={s.productionNotes}
                  onChange={(e) => patchScratch(traveller.id, { productionNotes: e.target.value })}
                  readOnly={!isEditingNotes}
                  className="min-h-[80px] text-xs"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
