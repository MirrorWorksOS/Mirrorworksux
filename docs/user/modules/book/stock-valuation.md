# Stock Valuation

## Summary
Stock valuation screen. Behavior is documented from current component implementation.

## Route
`/book/stock-valuation`

## User Intent
Complete stock valuation work and move records to the next stage.

## Primary Actions
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- blocked
- populated

## Components Used
- `@/components/shared/cards/DarkAccentCard`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/book/StockValuation.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`
