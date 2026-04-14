# Customer Detail

## Summary
Customer Detail screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/sell/crm/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.
- Switch tabs/sub-views within the page.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- KPI/summary card strip.
- Primary table/list region for records.
- Tabbed content regions.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Customer master data, contacts, and account context.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- blocked
- mobile/responsive differences
- populated

## Components Used
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/tabs.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

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
- `apps/web/src/components/sell/SellCustomerDetail.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/dropdown-menu.tsx`
- `apps/web/src/components/ui/alert-dialog.tsx`
