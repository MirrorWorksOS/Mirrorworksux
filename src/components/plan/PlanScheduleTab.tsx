import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChartGantt } from 'lucide-react';
import { addDays } from 'date-fns';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { GanttChart, type GanttTask } from '@/components/shared/schedule/GanttChart';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';

type ViewMode = 'gantt' | 'calendar';
type FilterMode = 'all' | 'done' | 'pending';

const OPERATIONS = [
  { id: 1, name: 'Prepare BOM', days: [2, 3], color: 'var(--mw-mirage)', status: 'done' },
  { id: 2, name: 'Prepare NC files', days: [4, 5], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 3, name: 'Laser Cutting', days: [7, 8, 9], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 4, name: 'Deburr Cut Parts', days: [8, 9, 10, 11, 12], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 5, name: 'Bend Panels on Press Brake', days: [13, 14], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 6, name: 'Spot Welding of Internal Brackets', days: [7, 8, 9], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 7, name: 'Surface Preparation Before Coating', days: [9, 10], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 8, name: 'Apply Powder Coating and Bake', days: [10, 11], color: 'var(--mw-yellow-400)', status: 'pending' },
  { id: 9, name: 'QC', days: [12, 13, 14], color: 'var(--mw-amber)', status: 'pending' }
];

const MONTH_BASE = new Date(2026, 3, 1); // April 2026

function useOperationTasks(filterMode: FilterMode) {
  return useMemo(() => {
    const filtered = OPERATIONS.filter((op) => {
      if (filterMode === 'all') return true;
      return op.status === filterMode;
    });

    const ganttTasks: GanttTask[] = filtered.map((op) => ({
      id: String(op.id),
      label: op.name,
      start: addDays(MONTH_BASE, op.days[0] - 1),
      end: addDays(MONTH_BASE, op.days[op.days.length - 1] - 1),
      progress: op.status === 'done' ? 100 : 0,
      color: op.color,
    }));

    const calendarEvents: CalendarEvent[] = OPERATIONS.map((op) => ({
      id: String(op.id),
      title: op.name,
      date: addDays(MONTH_BASE, op.days[0] - 1),
      endDate: addDays(MONTH_BASE, op.days[op.days.length - 1] - 1),
      color: op.color,
    }));

    const ganttStart = MONTH_BASE;
    const ganttEnd = addDays(MONTH_BASE, 19);

    return { filtered, ganttTasks, ganttStart, ganttEnd, calendarEvents };
  }, [filterMode]);
}

export function PlanScheduleTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [calendarMonth, setCalendarMonth] = useState(MONTH_BASE);

  const { filtered, ganttTasks, ganttStart, ganttEnd, calendarEvents } =
    useOperationTasks(filterMode);

  return (
    <div className="flex flex-col h-full bg-[var(--neutral-100)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-[var(--mw-mirage)] mr-4">
              Schedule
            </h2>
            <Button
              variant={filterMode === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('all')}
              className={cn(
                'h-8 text-xs',
                filterMode === 'all'
                  ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] hover:bg-[var(--border)]'
                  : 'text-[var(--neutral-500)]',
              )}
            >
              All
            </Button>
            <Button
              variant={filterMode === 'done' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('done')}
              className={cn(
                'h-8 text-xs',
                filterMode === 'done'
                  ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] hover:bg-[var(--border)]'
                  : 'text-[var(--neutral-500)]',
              )}
            >
              Done
            </Button>
            <Button
              variant={filterMode === 'pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('pending')}
              className={cn(
                'h-8 text-xs',
                filterMode === 'pending'
                  ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] hover:bg-[var(--border)]'
                  : 'text-[var(--neutral-500)]',
              )}
            >
              Pending
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <IconViewToggle
              value={viewMode}
              onChange={(k) => setViewMode(k as ViewMode)}
              options={[
                { key: 'gantt', icon: ChartGantt, label: 'Gantt chart' },
                { key: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-6">
          <GanttChart
            tasks={ganttTasks}
            startDate={ganttStart}
            endDate={ganttEnd}
          />
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-auto p-6">
          <ScheduleCalendar
            events={calendarEvents}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        </div>
      )}
    </div>
  );
}