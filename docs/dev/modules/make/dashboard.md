# Make Dashboard

## Summary
Manager-facing overview for the Make module. Desk-browser view — not for wall display. Three tabs: **Overview** (KPIs, work orders, schedule, trends), **Live floor** (wall-display Andon; see [`live-floor.md`](./live-floor.md)), **Quality** (placeholder).

## Route
`/make`

## Tabs
| Key | Label | Content |
|---|---|---|
| `overview` | Overview | AI feed, QuickNav, active/scheduled WOs, KPI strip, quality alerts, today's Gantt, OEE trend, throughput vs target |
| `live-floor` | Live floor | Renders `<LiveFloorView />` — see [live-floor.md](./live-floor.md) |
| `quality` | Quality | Placeholder — "Quality analytics coming soon" |

## User Intent
Get a fast Make status snapshot at a desk. Drill into active WOs, review today's Gantt, watch OEE trend and throughput.

## Primary Actions
- Jump to any Make sub-page via `ModuleQuickNav`.
- Quick Actions: Start New Job · Log QC Check · Scan Material · Print Traveler · Log Downtime (all toast-only in prototype).
- Hover schedule Gantt blocks for rich WO tooltips (`ScheduleBlockTooltip` via `HoverCard`).

## Key UI Sections (Overview tab)
- `AIFeed` — module-scoped suggestion stream
- `ModuleQuickNav` — bento grid to sub-pages
- **Active Work Orders** — 3-col card grid with progress bar, operator avatar, time range
- **Scheduled** work order list (4-col compact)
- KPI strip: Active Orders · Machines Running · Completion Rate · Quality Holds · OEE Utilisation
- Quality Alerts card (warning accent)
- Today's Schedule — Gantt strip with hover tooltips per block
- Quick Actions · Real-time OEE Trend · Throughput vs Target (3-col bottom row)

Machine Status Grid + legend have **moved** to the Live floor tab (commit `a8906c7c`). Do not reinstate on Overview — it was duplicated content.

## Data Shown
- `dashboardWorkOrders` — in-file mock array (`DashboardWorkOrder[]`) — drives top cards + schedule tooltips
- `scheduleRows` — in-file Gantt block array per machine
- `centralMachines` from `@/services` — used only for KPI counts (running count, avg utilisation)

## Components Used
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/motion/motion-variants` — `staggerContainer`, `staggerItem`
- `./LiveFloorView` — Live floor tab content
- `../ui/{badge, button, card, hover-card, utils}`

## Logic / Behaviour
- `useState('overview')` drives tab routing; children are conditionally rendered per `activeTab`.
- KPI strip derives running count + avg utilisation from `centralMachines`.
- Hover on Gantt block uses `woByLabel` lookup to populate `HoverCard` with WO details.

## Dependencies
- `@/services` (for `machines`)

## Known Gaps / Questions
- In-file mock WO + schedule data. Real impl needs `makeService.getDashboardWorkOrders()` + shift-aware schedule shape.
- Quick Action buttons are toast-only; wire to `jobStore`, `travellerStore`, scan station, etc.
- Quality tab is a placeholder.

## Related Files
- `apps/web/src/components/make/MakeDashboard.tsx`
- `apps/web/src/components/make/LiveFloorView.tsx`
- `apps/web/src/components/ui/{badge,button,card,hover-card,utils}.tsx`
