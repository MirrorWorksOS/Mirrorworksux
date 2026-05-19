/**
 * Side sheet listing schedule issues — opened from the Schedule Health card.
 */
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { ScheduleIssue, ScheduleSnapshot } from '@/types/entities';

const SEVERITY_COLOUR: Record<ScheduleIssue['severity'], string> = {
  high: 'var(--mw-error)',
  medium: 'var(--mw-warning)',
  low: 'var(--neutral-400)',
};

interface IssuesSheetProps {
  snapshot: ScheduleSnapshot;
}

export function IssuesSheet({ snapshot }: IssuesSheetProps) {
  const issuesSheetOpen = useScheduleEngineStore((s) => s.issuesSheetOpen);
  const setIssuesSheetOpen = useScheduleEngineStore((s) => s.setIssuesSheetOpen);

  return (
    <Sheet open={issuesSheetOpen} onOpenChange={setIssuesSheetOpen}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Schedule issues</SheetTitle>
          <SheetDescription>
            {snapshot.issues.length === 0
              ? 'No current issues — schedule is clear.'
              : `${snapshot.issues.length} ${snapshot.issues.length === 1 ? 'issue' : 'issues'} affecting the schedule.`}
          </SheetDescription>
        </SheetHeader>

        <ul className="space-y-3 px-4 pb-6">
          {snapshot.issues.map((issue) => (
            <li
              key={issue.id}
              className="rounded-md border border-[var(--neutral-200)] p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLOUR[issue.severity] }}
                  aria-hidden
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--neutral-900)]">{issue.title}</p>
                  <p className="text-xs leading-relaxed text-[var(--neutral-600)]">
                    {issue.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
          {snapshot.issues.length === 0 && (
            <li className="text-sm text-[var(--mw-success)]">All clear.</li>
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
