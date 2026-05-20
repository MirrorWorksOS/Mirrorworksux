# ADR-002 — MwGantt shared primitive

## Context

Two separate Gantt implementations had grown in the codebase: one inside Plan Schedule Engine (`schedule-engine/gantt/`) for work-centre capacity, another inside the Plan job-detail schedule tab. The new Plan Activities module needed a third — a per-job activity timeline. Building it would have created a third divergent implementation, each with its own time-axis math, row layout, "now line" handling, and bar interaction model.

## Decision

Extract a shared `MwGantt` primitive under `apps/web/src/components/shared/gantt/`:

- `MwGantt.tsx` — orchestrator (header, scrollable body, lane layout)
- `MwGanttRow.tsx` — a lane/row
- `MwGanttBar.tsx` — a single bar with hover + click handlers
- `MwGanttToolbar.tsx` — zoom level, density, range nav
- `NowLine.tsx` — the synchronised "right now" indicator
- `geometry.ts` — pure time-to-pixel helpers
- `types.ts` — `MwGanttItem`, lane types, render-prop shapes
- `index.ts` — public surface

The schedule-engine Gantt is **not** retroactively migrated — it has work-centre-specific semantics (capacity heat, conflict bands) that don't generalise. The shared primitive is the choice for the next Gantt; the schedule engine is its own thing.

## Consequences

- Plan Activities timeline and Plan job-detail schedule tab share one implementation.
- New Gantt surfaces (Make schedule, Ship dispatch waves, Control maintenance windows) start from this primitive.
- Render-prop boundary means bar content can be specialised per consumer without forking the layout engine.
- Cost: two Gantts exist (schedule engine + MwGantt). The split is intentional but needs to be communicated when someone reaches for "the Gantt component".

## Alternatives

- **Migrate schedule engine into MwGantt.** Rejected — schedule-engine semantics (capacity, conflicts, multi-machine lanes) would inflate the primitive with options that no other surface wants.
- **Use an off-the-shelf library (`dhtmlx-gantt`, `gantt-task-react`, `frappe-gantt`).** Rejected — visual language drift, harder to match MW yellow / mirage palette and pill-shaped bars, and licensing/footprint concerns for what is a thin layout problem.
