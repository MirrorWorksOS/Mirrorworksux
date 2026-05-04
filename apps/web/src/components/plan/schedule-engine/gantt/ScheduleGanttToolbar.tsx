/**
 * Filter chips, zoom controls, and group-by toggle. Sticky above the Gantt body.
 */
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { GanttFilter, GanttGroupBy, GanttZoom } from '@/store/scheduleEngineStore';
import { Button } from '@/components/ui/button';

const FILTER_OPTIONS: Array<{ value: GanttFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'late', label: 'Late' },
  { value: 'at_risk', label: 'At risk' },
  { value: 'rush', label: 'Rush' },
  { value: 'today', label: 'Today only' },
];

const ZOOM_OPTIONS: Array<{ value: GanttZoom; label: string }> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const GROUP_OPTIONS: Array<{ value: GanttGroupBy; label: string }> = [
  { value: 'workCentre', label: 'Work centre' },
  { value: 'job', label: 'Job' },
];

interface ScheduleGanttToolbarProps {
  onJumpToNow: () => void;
}

export function ScheduleGanttToolbar({ onJumpToNow }: ScheduleGanttToolbarProps) {
  const ganttFilter = useScheduleEngineStore((s) => s.ganttFilter);
  const ganttZoom = useScheduleEngineStore((s) => s.ganttZoom);
  const ganttGroupBy = useScheduleEngineStore((s) => s.ganttGroupBy);
  const setGanttFilter = useScheduleEngineStore((s) => s.setGanttFilter);
  const setGanttZoom = useScheduleEngineStore((s) => s.setGanttZoom);
  const setGanttGroupBy = useScheduleEngineStore((s) => s.setGanttGroupBy);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--neutral-100)] bg-card px-4 py-3">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-1">
        {FILTER_OPTIONS.map((opt) => {
          const active = ganttFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGanttFilter(opt.value)}
              className={`h-11 rounded-full px-3 text-xs font-medium transition-colors ${
                active
                  ? 'bg-[var(--mw-mirage)] text-white'
                  : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Zoom */}
        <div className="flex overflow-hidden rounded-full bg-[var(--neutral-100)] p-0.5">
          {ZOOM_OPTIONS.map((opt) => {
            const active = ganttZoom === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGanttZoom(opt.value)}
                className={`h-10 rounded-full px-3 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-card text-[var(--neutral-900)] shadow-[var(--card-shadow-rest)]'
                    : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10"
          onClick={onJumpToNow}
        >
          Now
        </Button>

        {/* Group by */}
        <div className="flex overflow-hidden rounded-full bg-[var(--neutral-100)] p-0.5">
          {GROUP_OPTIONS.map((opt) => {
            const active = ganttGroupBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGanttGroupBy(opt.value)}
                className={`h-10 rounded-full px-3 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-card text-[var(--neutral-900)] shadow-[var(--card-shadow-rest)]'
                    : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
