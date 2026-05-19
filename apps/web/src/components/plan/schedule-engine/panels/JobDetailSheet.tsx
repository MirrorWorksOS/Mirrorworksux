/**
 * Right-drawer placeholder for the demo. Shows a job-summary card derived
 * from the snapshot blocks. A real implementation would route to the full
 * job page or fetch the job entity directly.
 */
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import { useNavigate } from 'react-router';
import type { ScheduleSnapshot } from '@/types/entities';

import { STATUS_COLOUR, STATUS_LABEL } from '../constants';

interface JobDetailSheetProps {
  snapshot: ScheduleSnapshot;
}

export function JobDetailSheet({ snapshot }: JobDetailSheetProps) {
  const navigate = useNavigate();
  const selectedJobId = useScheduleEngineStore((s) => s.selectedJobId);
  const detailSheetOpen = useScheduleEngineStore((s) => s.detailSheetOpen);
  const closeJobDetail = useScheduleEngineStore((s) => s.closeJobDetail);

  const blocks = snapshot.blocks.filter((b) => b.jobId === selectedJobId);
  const first = blocks[0];

  return (
    <Sheet open={detailSheetOpen} onOpenChange={(o) => (o ? null : closeJobDetail())}>
      <SheetContent side="right" className="w-[360px] sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle>{first?.jobNumber ?? 'Job detail'}</SheetTitle>
          {first?.customerName && (
            <SheetDescription>{first.customerName}</SheetDescription>
          )}
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          {first ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">Qty</p>
                  <p className="tabular-nums">{first.qty ?? '—'} ea</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">Due</p>
                  <p className="tabular-nums">
                    {first.dueDate
                      ? new Date(first.dueDate).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Sequenced operations
                </p>
                <ul className="space-y-2">
                  {blocks.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--neutral-200)] p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{b.operationName}</p>
                        <p className="truncate text-xs text-[var(--neutral-500)] tabular-nums">
                          {b.workCenterName} ·{' '}
                          {new Date(b.startTime).toLocaleTimeString('en-AU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          –
                          {new Date(b.endTime).toLocaleTimeString('en-AU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUS_COLOUR[b.status ?? 'queued'] }}
                        title={STATUS_LABEL[b.status ?? 'queued']}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  closeJobDetail();
                  navigate(`/plan/jobs/${first.jobId}`);
                }}
              >
                Open job →
              </Button>
            </>
          ) : (
            <p className="text-sm text-[var(--neutral-500)]">No job selected.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
