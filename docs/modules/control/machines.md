# Machines

## Summary
Machines screen. Current implementation includes mock/seed data paths.

## Route
`/control/machines`

## User Intent
Complete machines work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.
- Switch tabs/sub-views within the page.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.
- Charts and trend cards.
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- empty
- error
- success
- populated

## Components Used
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/IconViewToggle`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/sheet`
- `@/components/ui/tabs`
- `@/components/ui/utils`
- `apps/web/src/components/ui/button.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlMachines.tsx`
- `apps/web/src/components/ui/button.tsx`
