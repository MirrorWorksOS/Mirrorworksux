# Sell Dashboard

## Summary
Sell Dashboard screen. Behavior is documented from current component implementation.

## Route
`/sell`

## User Intent
Get a fast Sell status snapshot and drill into exceptions.

## Primary Actions
- Switch tabs/sub-views within the page.

## Key UI Sections
- KPI/summary card strip.
- Charts and trend cards.
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- success
- populated

## Components Used
- `@/components/sell/WinLossAnalysis`
- `@/components/shared/ai/AIFeed`
- `@/components/shared/ai/AISuggestion`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/data/ProgressBar`
- `@/components/shared/icons/IconWell`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/badge.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellDashboard.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
