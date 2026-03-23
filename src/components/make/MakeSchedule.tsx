/**
 * Make Schedule — Gantt chart + list view for production scheduling
 * SVG-based Gantt: rows = work centres, bars = manufacturing orders
 * Current-day line, colour-coded status, tooltip on hover
 */
import React, { useState, useRef } from 'react';
import { Calendar, List, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

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
  completed:   { bar: '#FFCF4B', badge: 'bg-[#F5F5F5]', text: 'text-[#1A2732]', label: 'Completed' },
  in_progress: { bar: '#0A7AFF', badge: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', label: 'In Progress' },
  scheduled:   { bar: '#A3A3A3', badge: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Scheduled' },
  overdue:     { bar: '#EF4444', badge: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Overdue' },
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

// ── Gantt Component ────────────────────────────────────────
const ROW_H  = 56;
const DAY_W  = 72;
const LEFT_W = 120;
const PAD_Y  = 8;

interface Tooltip { x: number; y: number; mo: MO }

function GanttChart() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const totalW = LEFT_W + NUM_DAYS * DAY_W;
  const totalH = PAD_Y + WORK_CENTERS.length * ROW_H;

  return (
    <div className="overflow-x-auto">
      <svg
        ref={svgRef}
        width={totalW}
        height={totalH + 32}
        className="select-none"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Day header */}
        {Array.from({ length: NUM_DAYS }).map((_, d) => {
          const { label, isWeekend, isToday } = getDayLabel(d);
          const x = LEFT_W + d * DAY_W;
          return (
            <g key={`day-${d}`}>
              {isWeekend && (
                <rect x={x} y={0} width={DAY_W} height={totalH + 32} fill="#F5F5F5" />
              )}
              {isToday && (
                <rect x={x} y={0} width={DAY_W} height={totalH + 32} fill="#FFFBF0" opacity={0.7} />
              )}
              <text
                x={x + DAY_W / 2}
                y={18}
                textAnchor="middle"
                fontSize={10}
                fill={isToday ? '#1A2732' : '#737373'}
                fontWeight={isToday ? '600' : '400'}
                fontFamily="Roboto Mono, monospace"
              >
                {label}
              </text>
              {isToday && (
                <line x1={x + DAY_W / 2} y1={24} x2={x + DAY_W / 2} y2={totalH + 32} stroke="#FFCF4B" strokeWidth={2} strokeDasharray="4 3" />
              )}
            </g>
          );
        })}

        {/* Grid lines */}
        {Array.from({ length: NUM_DAYS + 1 }).map((_, d) => (
          <line key={`vline-${d}`} x1={LEFT_W + d * DAY_W} y1={24} x2={LEFT_W + d * DAY_W} y2={totalH + 32} stroke="var(--border)" strokeWidth={1} />
        ))}

        {/* Work center rows */}
        {WORK_CENTERS.map((wc, rowIdx) => {
          const y = 32 + PAD_Y + rowIdx * ROW_H;
          const rowMOs = MOs.filter(mo => mo.workCenter === wc);

          return (
            <g key={`row-${wc}`}>
              {/* Row background */}
              <rect x={0} y={y} width={totalW} height={ROW_H} fill={rowIdx % 2 === 0 ? '#FFFFFF' : '#F5F5F5'} />
              <line x1={0} y1={y + ROW_H} x2={totalW} y2={y + ROW_H} stroke="var(--border)" strokeWidth={1} />

              {/* Work centre label */}
              <text x={8} y={y + ROW_H / 2 + 5} fontSize={12} fill="#1A2732" fontWeight="500" fontFamily="Geist, sans-serif">{wc}</text>

              {/* MO bars */}
              {rowMOs.map(mo => {
                const cfg    = STATUS_CONFIG[mo.status];
                const barX   = LEFT_W + mo.startDay * DAY_W + 3;
                const barW   = mo.durationDays * DAY_W - 6;
                const barY   = y + 10;
                const barH   = ROW_H - 20;

                return (
                  <g
                    key={mo.id}
                    onMouseEnter={e => {
                      const rect = svgRef.current?.getBoundingClientRect();
                      if (rect) setTooltip({ x: barX + barW / 2, y: barY, mo });
                    }}
                    className="cursor-pointer"
                  >
                    <rect x={barX} y={barY} width={barW} height={barH} rx={4} fill={cfg.bar} opacity={0.9} />
                    {barW > 60 && (
                      <text x={barX + 8} y={barY + barH / 2 + 4} fontSize={10} fill="white" fontWeight="500" fontFamily="Roboto Mono, monospace">
                        {mo.moNumber}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 20, top: tooltip.y + 40 }}
        >
          <div className="bg-[#1A2732] text-white rounded-xl px-3 py-2 shadow-lg text-xs whitespace-nowrap">
            <p className=" font-semibold">{tooltip.mo.moNumber}</p>
            <p className="text-[#A3A3A3] mt-0.5">{tooltip.mo.product}</p>
            <p className="text-[#A3A3A3]">Job: {tooltip.mo.job} · Op: {tooltip.mo.operator}</p>
            <p className="text-[#A3A3A3]">{tooltip.mo.durationDays}d duration</p>
            <p style={{ color: STATUS_CONFIG[tooltip.mo.status].bar }} className="mt-0.5 font-medium">
              {STATUS_CONFIG[tooltip.mo.status].label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────
function ListView() {
  return (
    <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
            {['MO #', 'JOB', 'PRODUCT', 'WORK CENTRE', 'OPERATOR', 'START', 'END', 'STATUS'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
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
              <tr key={mo.id} className="border-b border-[#F5F5F5] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors">
                <td className="px-4 text-sm  font-medium text-[#1A2732]">{mo.moNumber}</td>
                <td className="px-4 text-sm  text-[#1A2732]">{mo.job}</td>
                <td className="px-4 text-sm text-[#1A2732]">{mo.product}</td>
                <td className="px-4 text-sm text-[#737373]">{mo.workCenter}</td>
                <td className="px-4">
                  <div className="w-7 h-7 rounded-full bg-[#1A2732] flex items-center justify-center text-white text-[10px] font-medium">{mo.operator}</div>
                </td>
                <td className="px-4 text-sm text-[#737373]">{fmt(start)}</td>
                <td className="px-4 text-sm text-[#737373]">{fmt(end)}</td>
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
      variants={animationVariants.stagger}
      className="p-6 space-y-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Production schedule</h1>
          <p className="text-sm text-[#737373] mt-1">
            <span className="text-[#0A7AFF]">{statusCounts.in_progress} in progress</span>
            {' · '}
            {statusCounts.scheduled} scheduled
            {statusCounts.overdue > 0 && <span className="text-[#EF4444]"> · {statusCounts.overdue} overdue</span>}
            {' · '}
            {statusCounts.completed} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--border)] gap-2 h-10">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2 h-10">
            <Plus className="w-4 h-4" /> New MO
          </Button>
          <div className="flex bg-[#F5F5F5] rounded-xl p-1">
            <button
              onClick={() => setView('gantt')}
              className={cn('p-2 rounded-md transition-colors', view === 'gantt' ? 'bg-[#FFCF4B] text-[#1A2732]' : 'text-[#737373]')}
              title="Gantt chart"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2 rounded-md transition-colors', view === 'list' ? 'bg-[#FFCF4B] text-[#1A2732]' : 'text-[#737373]')}
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
            <span className="text-xs text-[#737373]">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-0.5 bg-[#FFCF4B] border-dashed" style={{ borderTop: '2px dashed #FFCF4B' }} />
          <span className="text-xs text-[#737373]">Today (Mar 20)</span>
        </div>
      </div>

      {/* Gantt or List */}
      {view === 'gantt' && (
        <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden p-4">
          <GanttChart />
        </Card>
      )}
      {view === 'list' && <ListView />}
    </motion.div>
  );
}
