# MwGantt

Shared Gantt primitive. See [ADR-002](../../audits/adr/ADR-002-mw-gantt.md) for the rationale and the deliberate split from the schedule-engine Gantt.

## Location

`apps/web/src/components/shared/gantt/`

```
MwGantt.tsx         Orchestrator (header, scrollable body, lane layout)
MwGanttRow.tsx      One lane / row
MwGanttBar.tsx      One bar — pill-shaped, MW yellow / mirage palette
MwGanttToolbar.tsx  Zoom + density + range nav
NowLine.tsx         Synchronised "right now" vertical line
geometry.ts         Pure time-to-pixel helpers (no React)
types.ts            MwGanttItem, lane types, render-prop shapes
index.ts            Public re-exports
```

## Consumers

- Plan job-detail schedule tab (`PlanScheduleTab`)
- Plan activities timeline (`PlanActivities`, `JobActivityCard`)

## Usage shape

```tsx
import { MwGantt, MwGanttToolbar } from '@/components/shared/gantt';

<MwGantt
  items={activities}
  laneBy="resourceId"
  rangeStart={start}
  rangeEnd={end}
  renderBar={(item) => <ActivityBar item={item} />}
  onItemClick={(item) => openSheet(item)}
  toolbar={<MwGanttToolbar zoom={zoom} onZoomChange={setZoom} />}
/>
```

## Render-prop boundary

Consumers control bar content (`renderBar`) and row headers (`renderLaneHeader`). The primitive owns layout, axis, scroll, and the now line. This is the line that lets two very different surfaces (work-centre schedule, per-job activity timeline) share the same layout engine without one consumer dictating the other's visual language.

## Schedule engine Gantt is separate

The Plan Schedule Engine has its own Gantt under `apps/web/src/components/plan/schedule-engine/gantt/`. It carries work-centre semantics (capacity heat, conflict bands, multi-machine lanes) that don't generalise. New Gantts start from `MwGantt`; the schedule engine is the exception.
