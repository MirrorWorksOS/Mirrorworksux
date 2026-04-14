# Reports Gallery

## Summary
Reports screen. Behavior is documented from current component implementation.

## Route
`/book/reports`

## User Intent
Review aggregated outputs and export analysis for decisions.

## Primary Actions
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Charts and trend cards.
- Embedded AI/assistant insight panels.

## Data Shown
- Aggregated reporting views and exportable analysis slices.

## States
- default
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/book/ReportsGallery.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`
