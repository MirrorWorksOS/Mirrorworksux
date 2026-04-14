# Job Traveler

## Summary
Job Traveler screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/make/job-traveler/:id`

## User Intent
Complete job traveler work and move records to the next stage.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Charts and trend cards.

## Data Shown
- Work-order/job execution data, machine context, and production statuses.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- success
- mobile/responsive differences
- populated

## Components Used
- `@/components/shared/barcode/BarcodeDisplay`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/utils`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/make/MakeJobTraveler.tsx`
