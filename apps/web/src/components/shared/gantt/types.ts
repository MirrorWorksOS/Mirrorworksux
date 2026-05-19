/**
 * MwGantt — shared types for the unified Gantt used across modules.
 *
 * MwGantt is a multi-zoom (day / week / month) Gantt that renders rows with
 * a label gutter on the left and bars on a date-scaled timeline on the right.
 * It is intentionally generic: each module supplies its own rows + items and
 * status→colour mapping. Schedule Engine's hour-granularity Gantt remains a
 * separate purpose-built component.
 */
import type { ReactNode } from 'react';

export type MwGanttZoom = 'day' | 'week' | 'month';

export interface MwGanttItem {
  id: string;
  /** Row this item belongs to. */
  rowId: string;
  start: Date;
  end: Date;
  label: string;
  /** Module-specific status string (e.g. 'in_progress', 'late'). */
  status?: string;
  /** Explicit bar colour — wins over `status`-derived colour. CSS var or hex. */
  color?: string;
  /** 0–100. Renders as a darker fill within the lighter bar. */
  progress?: number;
  /** Outline marker — used for "moved" indication in Schedule Engine. */
  highlight?: boolean;
  /** Dim the bar — used to indicate the item is gated by an unfinished predecessor. */
  dimmed?: boolean;
  /** Hover-card body — defaults to `label`. */
  renderHover?: (item: MwGanttItem) => ReactNode;
  /** Bar interior — defaults to `label` text. */
  renderContent?: (item: MwGanttItem) => ReactNode;
  /** Arbitrary metadata passed back to handlers. */
  meta?: Record<string, unknown>;
}

/** Finish-to-start dependency edge. */
export interface MwGanttDependency {
  /** Predecessor item id (arrow tail). */
  from: string;
  /** Successor item id (arrow head). */
  to: string;
  /** Optional tint for the arrow stroke. */
  color?: string;
}

export interface MwGanttRowDef {
  id: string;
  label: string;
  /** Optional left-gutter renderer (avatar, live-status dot, etc.). */
  renderLabel?: () => ReactNode;
  /** Sub-label rendered under the main label (e.g. utilisation %). */
  sublabel?: ReactNode;
}

export interface MwGanttProps {
  rows: MwGanttRowDef[];
  items: MwGanttItem[];
  /** Finish-to-start edges. Rendered as faint arrows above the rows. */
  dependencies?: MwGanttDependency[];
  zoom: MwGanttZoom;
  onZoomChange?: (z: MwGanttZoom) => void;
  /** Window bounds. Defaults to a sensible range around `today`. */
  windowStart?: Date;
  windowEnd?: Date;
  /** "Now" indicator anchor. Defaults to current local time. */
  today?: Date;
  /** Bar click handler. */
  onItemClick?: (item: MwGanttItem) => void;
  /** Render slot for a custom toolbar inside the Gantt card header. */
  toolbar?: ReactNode;
  /** Status → colour mapping. If absent, items rely on `color` or fallback. */
  statusColour?: Record<string, string>;
  /** Status legend entries. Optional — omit to hide legend. */
  legend?: Array<{ key: string; label: string; color: string }>;
  /** Empty-state message when `items.length === 0`. */
  emptyMessage?: string;
  /** Override gutter width. */
  rowLabelPx?: number;
  /** Override row height. */
  rowHeightPx?: number;
  className?: string;
}
