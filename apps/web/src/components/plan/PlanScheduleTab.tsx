/**
 * Plan Job Detail — Schedule Tab
 *
 * Operations are derived from the job's BOM + routing (the same data driving
 * the Production tab) so this view always reflects the authoritative product
 * assembly structure. In edit mode each row is editable inline (name, start,
 * span). The "Open in Schedule Engine" button hands off to the work-centre
 * Gantt at /plan/schedule-engine for AI-assisted sequencing.
 */
import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChartGantt, ExternalLink, Pencil, Save, Plus, Trash2 } from 'lucide-react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { GanttChart, type GanttTask } from '@/components/shared/schedule/GanttChart';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { getDifferentialAssembly } from './BomRoutingTree.data';
import { toast } from 'sonner';

type ViewMode = 'gantt' | 'calendar';
type FilterMode = 'all' | 'done' | 'pending';

interface ScheduledOp {
  id: string;
  name: string;
  workCentre: string;
  start: string;          // ISO date
  durationDays: number;
  status: 'done' | 'pending' | 'in_progress';
  partName: string;
  minutes: number;
}

const STATUS_COLOR: Record<ScheduledOp['status'], string> = {
  done: 'var(--mw-success)',
  in_progress: 'var(--mw-yellow-400)',
  pending: 'var(--mw-mirage)',
};

/** Build the initial schedule from the live BOM/routing data. Each op gets
 *  a duration proportional to its minutes (~ minutes / 60 days). */
function buildInitialSchedule(): { ops: ScheduledOp[]; baseDate: Date } {
  const base = new Date(2026, 3, 1);
  const assembly = getDifferentialAssembly('plan');
  let cursor = 0;
  const ops: ScheduledOp[] = [];
  assembly.parts.forEach((part) => {
    (part.operations ?? []).forEach((op) => {
      const days = Math.max(1, Math.round(op.minutes / 240));
      ops.push({
        id: op.id,
        name: op.name,
        workCentre: op.workCentre,
        start: format(addDays(base, cursor), 'yyyy-MM-dd'),
        durationDays: days,
        status: op.status === 'pending' ? 'pending' : op.status === 'done' ? 'done' : 'in_progress',
        partName: part.name,
        minutes: op.minutes,
      });
      cursor += days;
    });
  });
  return { ops, baseDate: base };
}

interface PlanScheduleTabProps {
  editable?: boolean;
}

export function PlanScheduleTab({ editable = false }: PlanScheduleTabProps = {}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [{ ops, baseDate }, setSched] = useState(() => buildInitialSchedule());
  const [calendarMonth, setCalendarMonth] = useState(baseDate);

  const filteredOps = useMemo(
    () => ops.filter((o) => filterMode === 'all' ? true : (filterMode === 'done' ? o.status === 'done' : o.status !== 'done')),
    [ops, filterMode],
  );

  const ganttTasks: GanttTask[] = useMemo(
    () => filteredOps.map((o) => {
      const start = parseISO(o.start);
      const end = addDays(start, Math.max(0, o.durationDays - 1));
      return {
        id: o.id,
        label: `${o.name} · ${o.workCentre}`,
        start, end,
        progress: o.status === 'done' ? 100 : o.status === 'in_progress' ? 50 : 0,
        color: STATUS_COLOR[o.status],
      };
    }),
    [filteredOps],
  );

  const ganttStart = baseDate;
  const ganttEnd = useMemo(() => {
    const maxOffset = ops.reduce((m, o) => Math.max(m, differenceInCalendarDays(parseISO(o.start), baseDate) + o.durationDays), 0);
    return addDays(baseDate, Math.max(20, maxOffset + 2));
  }, [ops, baseDate]);

  const calendarEvents: CalendarEvent[] = useMemo(
    () => ops.map((o) => ({
      id: o.id, title: o.name, date: parseISO(o.start),
      endDate: addDays(parseISO(o.start), Math.max(0, o.durationDays - 1)),
      color: STATUS_COLOR[o.status],
    })),
    [ops],
  );

  const updateOp = (id: string, patch: Partial<ScheduledOp>) => {
    setSched((s) => ({ ...s, ops: s.ops.map((o) => o.id === id ? { ...o, ...patch } : o) }));
  };

  const addOp = () => {
    const id = `op-new-${Date.now()}`;
    setSched((s) => ({ ...s, ops: [...s.ops, {
      id, name: 'New operation', workCentre: 'Unassigned',
      start: format(baseDate, 'yyyy-MM-dd'), durationDays: 1, status: 'pending',
      partName: '—', minutes: 60,
    }] }));
  };

  const removeOp = (id: string) => {
    setSched((s) => ({ ...s, ops: s.ops.filter((o) => o.id !== id) }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-card border-b border-[var(--border)] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-foreground mr-4">
              Schedule
            </h2>
            {(['all', 'done', 'pending'] as FilterMode[]).map((mode) => (
              <Button
                key={mode}
                variant={filterMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode(mode)}
                className={cn(
                  'h-8 text-xs capitalize',
                  filterMode === mode
                    ? 'bg-[var(--neutral-100)] text-foreground hover:bg-[var(--border)]'
                    : 'text-[var(--neutral-500)]',
                )}
              >
                {mode}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {editable && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs border-[var(--border)]"
                onClick={() => {
                  if (isEditing) toast.success('Schedule saved');
                  setIsEditing((v) => !v);
                }}
              >
                {isEditing ? <Save className="w-3.5 h-3.5 mr-1.5" /> : <Pencil className="w-3.5 h-3.5 mr-1.5" />}
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs border-[var(--border)]"
              onClick={() => navigate('/plan/schedule-engine')}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open in Schedule Engine
            </Button>
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-6 gap-4">
          <GanttChart
            tasks={ganttTasks}
            startDate={ganttStart}
            endDate={ganttEnd}
          />

          {isEditing && (
            <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-medium">Edit operations</h3>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addOp}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {filteredOps.map((op) => (
                  <div key={op.id} className="grid grid-cols-[2fr,1.4fr,1.2fr,80px,40px] gap-3 px-4 py-2 items-center text-xs">
                    <Input
                      value={op.name}
                      onChange={(e) => updateOp(op.id, { name: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      value={op.workCentre}
                      onChange={(e) => updateOp(op.id, { workCentre: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="date"
                      value={op.start}
                      onChange={(e) => updateOp(op.id, { start: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={op.durationDays}
                      onChange={(e) => updateOp(op.id, { durationDays: Math.max(1, Number(e.target.value) || 1) })}
                      className="h-8 text-xs tabular-nums"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[var(--neutral-400)] hover:text-[var(--mw-error)]"
                      onClick={() => removeOp(op.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
