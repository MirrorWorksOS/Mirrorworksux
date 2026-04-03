import * as React from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isWithinInterval,
  max,
  min,
  startOfDay,
} from "date-fns";

import { cn } from "@/components/ui/utils";

export interface GanttTask {
  id: string;
  label: string;
  start: Date;
  end: Date;
  progress?: number;
  color?: string;
  dependencies?: string[];
}

export interface GanttChartProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
  /** Defaults to current date. Set for prototypes with fixed timeline data. */
  today?: Date;
  onTaskClick?: (task: GanttTask) => void;
  className?: string;
}

const LABEL_W = 200;
const ROW_H = 40;
const HEADER_H = 40;
/** Minimum day column width when the chart must scroll horizontally */
const MIN_DAY_W = 10;
/** Fallback before first resize measurement */
const FALLBACK_DAY_W = 28;

function clampTaskToWindow(
  task: GanttTask,
  windowStart: Date,
  windowEnd: Date,
): { start: Date; end: Date } | null {
  const ws = startOfDay(windowStart);
  const we = startOfDay(windowEnd);
  const ts = startOfDay(task.start);
  const te = startOfDay(task.end);
  if (te < ws || ts > we) return null;
  return {
    start: max([ts, ws]),
    end: min([te, we]),
  };
}

export function GanttChart({ tasks, startDate, endDate, today: todayProp, onTaskClick, className }: GanttChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(w);
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const windowStart = startOfDay(startDate);
  const windowEnd = startOfDay(endDate);
  const totalDays = differenceInCalendarDays(windowEnd, windowStart) + 1;
  const availableTimeline = Math.max(containerWidth - LABEL_W, 0);

  const { dayW, svgW } = React.useMemo(() => {
    if (totalDays < 1) {
      return { dayW: FALLBACK_DAY_W, svgW: LABEL_W + FALLBACK_DAY_W };
    }
    if (containerWidth <= 0) {
      const dw = FALLBACK_DAY_W;
      return { dayW: dw, svgW: LABEL_W + totalDays * dw };
    }
    const ideal = availableTimeline / totalDays;
    if (ideal >= MIN_DAY_W) {
      const dw = ideal;
      const tw = totalDays * dw;
      return { dayW: dw, svgW: LABEL_W + tw };
    }
    const dw = MIN_DAY_W;
    const tw = totalDays * dw;
    return { dayW: dw, svgW: LABEL_W + tw };
  }, [containerWidth, availableTimeline, totalDays]);

  const rows = tasks.length;
  const svgH = HEADER_H + rows * ROW_H;
  const today = startOfDay(todayProp ?? new Date());
  const todayX =
    isWithinInterval(today, { start: windowStart, end: windowEnd }) ?
      LABEL_W + differenceInCalendarDays(today, windowStart) * dayW + dayW / 2
    : null;

  const dayTicks = React.useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < totalDays; i += 1) {
      out.push(addDays(windowStart, i));
    }
    return out;
  }, [windowStart, totalDays]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full min-w-0 overflow-x-auto rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card shadow-xs",
        className,
      )}
    >
      <svg
        width={svgW}
        height={svgH}
        className="block min-w-0 font-sans text-[11px] tabular-nums"
        role="img"
        aria-label="Gantt chart"
      >
        <rect width={svgW} height={svgH} fill="white" />
        <line
          x1={LABEL_W}
          y1={0}
          x2={LABEL_W}
          y2={svgH}
          stroke="var(--neutral-200)"
          strokeWidth={1}
        />
        {dayTicks.map((d, i) => {
          const x = LABEL_W + i * dayW;
          return (
            <g key={d.toISOString()}>
              <line
                x1={x}
                y1={HEADER_H}
                x2={x}
                y2={svgH}
                stroke="var(--neutral-200)"
                strokeWidth={1}
              />
              <text
                x={x + dayW / 2}
                y={HEADER_H - 10}
                textAnchor="middle"
                fill="var(--neutral-600)"
              >
                {format(d, "d")}
              </text>
              <text
                x={x + dayW / 2}
                y={HEADER_H - 22}
                textAnchor="middle"
                fill="var(--neutral-500)"
                fontSize={10}
              >
                {format(d, "EEE")}
              </text>
            </g>
          );
        })}
        {tasks.map((task, row) => {
          const y = HEADER_H + row * ROW_H;
          return (
            <line
              key={`grid-${task.id}`}
              x1={0}
              y1={y + ROW_H}
              x2={svgW}
              y2={y + ROW_H}
              stroke="var(--neutral-200)"
              strokeWidth={1}
            />
          );
        })}
        {todayX !== null && (
          <line
            x1={todayX}
            y1={HEADER_H}
            x2={todayX}
            y2={svgH}
            stroke="var(--mw-yellow-400)"
            strokeWidth={2}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
        {tasks.map((task, row) => {
          const clipped = clampTaskToWindow(task, windowStart, windowEnd);
          const y = HEADER_H + row * ROW_H;
          const barY = y + 8;
          const barH = ROW_H - 16;
          const defaultFill = "var(--mw-yellow-400)";
          const labelShort = task.label.length > 28 ? `${task.label.slice(0, 26)}…` : task.label;
          let bar: React.ReactNode = null;
          if (clipped) {
            const offset = differenceInCalendarDays(clipped.start, windowStart);
            const span = differenceInCalendarDays(clipped.end, clipped.start) + 1;
            const bx = LABEL_W + offset * dayW + 1;
            const bw = span * dayW - 2;
            const pct = Math.min(100, Math.max(0, task.progress ?? 0));
            const fill = task.color ?? defaultFill;
            bar = (
              <g>
                <rect
                  x={bx}
                  y={barY}
                  width={bw}
                  height={barH}
                  rx={4}
                  fill={fill}
                  fillOpacity={0.2}
                  stroke={fill}
                  strokeWidth={1}
                  cursor={onTaskClick ? "pointer" : "default"}
                  onClick={() => onTaskClick?.(task)}
                />
                <rect
                  x={bx}
                  y={barY}
                  width={(bw * pct) / 100}
                  height={barH}
                  rx={4}
                  fill={fill}
                  pointerEvents="none"
                />
              </g>
            );
          }
          return (
            <g key={task.id}>
              <title>{task.label}</title>
              <text x={12} y={y + ROW_H / 2 + 4} fill="var(--neutral-900)" fontSize={12} fontWeight={500}>
                {labelShort}
              </text>
              {bar}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
