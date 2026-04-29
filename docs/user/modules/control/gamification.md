# Gamification

## Summary
Gamification & Targets screen. Configure performance targets and achievement badges that surface in the team dashboards and individual user profiles.

## Route
`/control/gamification`

## User Intent
Reward outstanding performance and motivate teams by defining measurable goals (targets) and the badges they unlock.

## Primary Actions
- *Add target* — opens [`TargetFormDialog`](apps/web/src/components/control/TargetFormDialog.tsx) (landed 2026-04-29).
- Click any target row to edit it in the same dialog.
- *Create badge* — opens [`BadgeFormDialog`](apps/web/src/components/control/BadgeFormDialog.tsx) (landed 2026-04-29).
- Click any badge card to edit it in the same dialog.

### Target form fields
- **Target name** *(required)* — e.g. *Close deals*.
- **Metric / KPI** *(required)* — e.g. *Deals closed*.
- **Period** — *Daily* / *Weekly* / *Monthly* / *Quarterly*.
- **Target value** *(required)* — numeric or percentage, free text.
- **Active toggle** — when off, the target is saved as *Draft* and not shown on dashboards.

### Badge form fields
- **Icon** — pick from a 14-icon library (*Trophy*, *Bolt*, *Crosshair*, *Fire*, *Star*, *Diamond*, *Shield*, *Chart Bar*, *Medal*, *Award*, *Rocket*, *Mountain*, *Target*, *Flag*). The dialog renders a live preview of the chosen icon on a soft-gold tile.
- **Badge name** *(required)*.
- **Description** — short string shown on the badge card.
- **Criteria** *(optional)* — free-text description of how a user earns the badge.

## Key UI Sections
- Page header with *Add target* + *Create badge* CTAs.
- Targets table with metric, period, value, status.
- Badge gallery card grid.
- KPI strip + trend chart for active gamification engagement.

## Data Shown
- Targets, badges, leaderboard scratch data.

## States
- default
- empty
- success (after target/badge save)
- populated

## Design / UX Notes
- Both dialogs close on successful submit and surface a toast.
- Badge icons render gold (`#ffcf4b` token) on a 20%-opacity soft-gold tile — colour is fixed by design, not user-configurable.
- Targets default to *Active*; the *Inactive* state is the *Draft* status used in lists.
- Backend wiring is mocked. Production will hand the payload to `controlService.upsertTarget` / `upsertBadge`.
