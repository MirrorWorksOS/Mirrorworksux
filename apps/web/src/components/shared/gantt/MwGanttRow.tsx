/**
 * MwGanttRow — one Gantt row: label gutter on the left, bars on a date-scaled
 * timeline on the right. Includes a vertical gridline per column.
 */
import { cn } from '@/components/ui/utils';
import { BAR_HEIGHT_PX, ROW_HEIGHT_PX, ROW_LABEL_PX, buildTicks } from './geometry';
import { MwGanttBar } from './MwGanttBar';
import type { MwGanttItem, MwGanttRowDef, MwGanttZoom } from './types';

interface MwGanttRowProps {
  row: MwGanttRowDef;
  items: MwGanttItem[];
  windowStart: Date;
  windowEnd: Date;
  zoom: MwGanttZoom;
  statusColour?: Record<string, string>;
  rowLabelPx?: number;
  rowHeightPx?: number;
  onItemClick?: (item: MwGanttItem) => void;
}

export function MwGanttRow({
  row,
  items,
  windowStart,
  windowEnd,
  zoom,
  statusColour,
  rowLabelPx = ROW_LABEL_PX,
  rowHeightPx = ROW_HEIGHT_PX,
  onItemClick,
}: MwGanttRowProps) {
  const ticks = buildTicks(windowStart, windowEnd, zoom);

  return (
    <div
      className="flex items-stretch border-b border-[var(--neutral-100)]"
      style={{ minHeight: rowHeightPx }}
    >
      {/* Gutter */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ width: rowLabelPx }}
      >
        {row.renderLabel ? (
          row.renderLabel()
        ) : (
          <div className="flex flex-col">
            <p className="truncate text-sm font-medium text-[var(--neutral-900)]">{row.label}</p>
            {row.sublabel && (
              <div className="text-[11px] text-[var(--neutral-500)]">{row.sublabel}</div>
            )}
          </div>
        )}
      </div>

      {/* Timeline body */}
      <div className="relative flex-1" style={{ minHeight: rowHeightPx }}>
        {/* Vertical gridlines */}
        {ticks.map((t) => (
          <div
            key={t.key}
            className={cn(
              'absolute inset-y-0 border-r',
              t.isToday ? 'border-[var(--mw-yellow-400)]/30' : 'border-[var(--neutral-100)]',
            )}
            style={{ left: t.px, width: t.width }}
          />
        ))}

        {/* Bars */}
        {items.map((item) => (
          <MwGanttBar
            key={item.id}
            item={item}
            windowStart={windowStart}
            zoom={zoom}
            statusColour={statusColour}
            onClick={onItemClick}
          />
        ))}

        {/* Empty hint when no items in this row */}
        {items.length === 0 && (
          <span
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] italic text-[var(--neutral-400)]"
            style={{ height: BAR_HEIGHT_PX - 8 }}
          >
            &nbsp;
          </span>
        )}
      </div>
    </div>
  );
}
