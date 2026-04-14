# Welcome Dashboard

## Summary
Welcome Dashboard screen. Current implementation includes mock/seed data paths.

## Route
`/`

## User Intent
Get a fast Platform status snapshot and drill into exceptions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- KPI/summary card strip.
- Primary table/list region for records.
- Charts and trend cards.
- Embedded AI/assistant insight panels.

## Data Shown
- Cross-workflow KPI summaries and recent activity indicators.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- loading
- error
- success
- populated

## Components Used
- `@/components/animate-ui/primitives/effects/theme-toggler`
- `@/components/shared/ai/AgentBar`
- `@/components/shared/charts/WelcomeDashboardActivityChart`
- `@/components/shared/feedback/CardSkeleton`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion-community/DashboardFlipCard`
- `@/components/shared/motion-community/DashboardManagementBar`
- `@/components/shared/motion-community/DashboardNotificationList`
- `@/components/shared/motion-community/DashboardPinList`
- `@/components/shared/motion/AnimatedCount`
- `@/components/shared/motion/SplitText`
- `@/components/shared/motion/motion-variants`
- `@/components/shared/surfaces/SpotlightCard`
- `@/components/theme-provider`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/dashboard-ui`
- `@/lib/icon-config`
- `@/lib/mock-user-context`

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/WelcomeDashboard.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/shared/data/MwDataTable.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/avatar.tsx`
