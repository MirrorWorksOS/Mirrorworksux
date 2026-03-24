/**
 * Make Schedule — Gantt chart + list view for production scheduling
 * SVG-based Gantt: rows = work centres, bars = manufacturing orders
 * Current-day line, colour-coded status, tooltip on hover
 */
import React, { useState, useMemo } from 'react';
import { Calendar, List, Plus, Filter } from 'lucide-react';
import { addDays } from 'date-fns';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { GanttChart, type GanttTask } from '@/components/shared/schedule/GanttChart';


// ── Data ─────────────────────────────────────────────────
type MOStatus = 'in_progress' | 'scheduled' | 'completed' | 'overdue';

interface MO {
  id: string; moNumber: string; job: string; product: string;
  workCenter: string; startDay: number; durationDays: number; status: MOStatus;
  operator: string;
}

// Days are 0-indexed relative to Mar 18 2026 (today = day 2, i.e. Mar 20)
const TODAY_OFFSET = 2; // Mar 20 is index 2

const MOs: MO[] = [
  { id: '1',  moNumber: 'MO-0045', job: 'MW-089', product: 'Server Rack Chassis',    workCenter: 'Cutting',   startDay: 0,  durationDays: 2, status: 'completed',   operator: 'DL' },
  { id: '2',  moNumber: 'MO-0046', job: 'MW-089', product: 'Server Rack Chassis',    workCenter: 'Forming',   startDay: 2,  durationDays: 2, status: 'in_progress', operator: 'EW' },
  { id: '3',  moNumber: 'MO-0047', job: 'MW-089', product: 'Server Rack Chassis',    workCenter: 'Welding',   startDay: 4,  durationDays: 3, status: 'scheduled',   operator: 'MT' },
  { id: '4',  moNumber: 'MO-0048', job: 'MW-089', product: 'Server Rack Chassis',    workCenter: 'Finishing', startDay: 7,  durationDays: 1, status: 'scheduled',   operator: 'SC' },
  { id: '5',  moNumber: 'MO-0044', job: 'MW-088', product: 'Rail Platform Components', workCenter: 'Cutting', startDay: 1,  durationDays: 3, status: 'in_progress', operator: 'DL' },
  { id: '6',  moNumber: 'MO-0049', job: 'MW-088', product: 'Rail Platform Components', workCenter: 'Welding', startDay: 4,  durationDays: 4, status: 'scheduled',   operator: 'TB' },
  { id: '7',  moNumber: 'MO-0050', job: 'MW-087', product: 'Aluminium Enclosures',   workCenter: 'Machining', startDay: 0,  durationDays: 4, status: 'overdue',     operator: 'EW' },
  { id: '8',  moNumber: 'MO-0051', job: 'MW-087', product: 'Aluminium Enclosures',   workCenter: 'Forming',   startDay: 5,  durationDays: 2, status: 'scheduled',   operator: 'SC' },
  { id: '9',  moNumber: 'MO-0052', job: 'MW-091', product: 'Structural Bracket Type A',workCenter:'Cutting',  startDay: 3,  durationDays: 1, status: 'scheduled',   operator: 'DL' },
  { id: '10', moNumber: 'MO-0053', job: 'MW-091', product: 'Structural Bracket Type A',workCenter:'Welding',  startDay: 4,  durationDays: 1, status: 'scheduled',   operator: 'MT' },
  { id: '11', moNumber: 'MO-0054', job: 'MW-091', product: 'Structural Bracket Type A',workCenter:'Finishing',startDay: 6,  durationDays: 1, status: 'scheduled',   operator: 'SC' },
  { id: '12', moNumber: 'MO-0055', job: 'MW-090', product: 'Machine Guards',          workCenter: 'Machining', startDay: 5,  durationDays: 3, status: 'scheduled',   operator: 'TB' },
];

const WORK_CENTERS = ['Cutting', 'Forming', 'Welding', 'Machining', 'Finishing'];

const STATUS_CONFIG: Record<MOStatus, { bar: string; badge: string; text: string; label: string }> = {
  completed:   { bar: 'var(--mw-yellow-400)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Completed' },
  in_progress: { bar: 'var(--mw-blue)', badge: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]', label: 'In Progress' },
  scheduled:   { bar: 'var(--neutral-400)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Scheduled' },
  overdue:     { bar: 'var(--mw-error)', badge: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Overdue' },
};

// Generate day labels starting from Mar 18 2026
const START_DATE = new Date(2026, 2, 18); // March 18
const NUM_DAYS = 15;

const getDayLabel = (offset: number) => {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + offset);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-AU', { month: 'short' });
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  return { label: `${month} ${day}`, isWeekend, isToday: offset === TODAY_OFFSET };
};

const STATUS_TO_PROGRESS: Record<MOStatus, number> = {
  completed: 100,
  in_progress: 50,
  scheduled: 0,
  overdue: 30,
};

function useGanttTasks(): { tasks: GanttTask[]; startDate: Date; endDate: Date } {
  return useMemo(() => {
    const tasks: GanttTask[] = MOs.map((mo) => ({
      id: mo.id,
      label: `${mo.moNumber} — ${mo.workCenter}`,
      start: addDays(START_DATE, mo.startDay),
      end: addDays(START_DATE, mo.startDay + mo.durationDays - 1),
      progress: STATUS_TO_PROGRESS[mo.status],
      color: STATUS_CONFIG[mo.status].bar,
    }));
    const endDate = addDays(START_DATE, NUM_DAYS - 1);
    return { tasks, startDate: START_DATE, endDate };
  }, []);
}

// ── List view ─────────────────────────────────────────────
function ListView() {
  return (
    <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
            {['MO #', 'JOB', 'PRODUCT', 'WORK CENTRE', 'OPERATOR', 'START', 'END', 'STATUS'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOs.map(mo => {
            const cfg   = STATUS_CONFIG[mo.status];
            const start = new Date(START_DATE); start.setDate(start.getDate() + mo.startDay);
            const end   = new Date(START_DATE); end.setDate(end.getDate() + mo.startDay + mo.durationDays - 1);
            const fmt   = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
            return (
              <tr key={mo.id} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors">
                <td className="px-4 text-sm font-medium tabular-nums text-[var(--mw-mirage)]">{mo.moNumber}</td>
                <td className="px-4 text-sm tabular-nums text-[var(--mw-mirage)]">{mo.job}</td>
                <td className="px-4 text-sm text-[var(--mw-mirage)]">{mo.product}</td>
                <td className="px-4 text-sm text-[var(--neutral-500)]">{mo.workCenter}</td>
                <td className="px-4">
                  <div className="w-7 h-7 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center text-white text-[10px] font-medium">{mo.operator}</div>
                </td>
                <td className="px-4 text-sm text-[var(--neutral-500)]">{fmt(start)}</td>
                <td className="px-4 text-sm text-[var(--neutral-500)]">{fmt(end)}</td>
                <td className="px-4">
                  <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>
                    {cfg.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// ── Root ─────────────────────────────────────────────────
export function MakeSchedule() {
  const [view, setView] = useState<'gantt' | 'list'>('gantt');
  const { tasks, startDate, endDate } = useGanttTasks();

  const statusCounts = {
    in_progress: MOs.filter(m => m.status === 'in_progress').length,
    scheduled:   MOs.filter(m => m.status === 'scheduled').length,
    overdue:     MOs.filter(m => m.status === 'overdue').length,
    completed:   MOs.filter(m => m.status === 'completed').length,
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Production schedule</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            <span className="text-[var(--mw-blue)]">{statusCounts.in_progress} in progress</span>
            {' · '}
            {statusCounts.scheduled} scheduled
            {statusCounts.overdue > 0 && <span className="text-[var(--mw-error)]"> · {statusCounts.overdue} overdue</span>}
            {' · '}
            {statusCounts.completed} completed
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-[var(--border)] gap-2 h-10">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] gap-2 h-10">
            <Plus className="w-4 h-4" /> New MO
          </Button>
          <div className="flex bg-[var(--neutral-100)] rounded-xl p-1">
            <button
              onClick={() => setView('gantt')}
              className={cn('p-2 rounded-md transition-colors', view === 'gantt' ? 'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]' : 'text-[var(--neutral-500)]')}
              title="Gantt chart"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2 rounded-md transition-colors', view === 'list' ? 'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]' : 'text-[var(--neutral-500)]')}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cfg.bar }} />
            <span className="text-xs text-[var(--neutral-500)]">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-0.5 bg-[var(--mw-yellow-400)] border-dashed" style={{ borderTop: '2px dashed var(--mw-yellow-400)' }} />
          <span className="text-xs text-[var(--neutral-500)]">Today (Mar 20)</span>
        </div>
      </div>

      {/* Gantt or List */}
      {view === 'gantt' && (
        <GanttChart tasks={tasks} startDate={startDate} endDate={endDate} />
      )}
      {view === 'list' && <ListView />}
    </motion.div>
  );
}
