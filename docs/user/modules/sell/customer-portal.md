# Customer Portal

## Summary
Customer Portal screen. Current implementation includes mock/seed data paths.

## Route
`/sell/portal`

## User Intent
Complete customer portal work and move records to the next stage.

## Primary Actions
- Switch tabs/sub-views within the page.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- loading
- empty
- success
- populated

## Components Used
- `@/components/sell/PortalQuoteDetail`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/tabs`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/sell/SellCustomerPortal.tsx`
