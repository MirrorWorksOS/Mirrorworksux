# New Quote

## Summary
New Quote screen. Behavior is documented from current component implementation.

## Route
`/sell/quotes/new`

## User Intent
Complete new quote work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Quote lines, pricing assumptions, revision/approval signals.

## States
- default
- error
- success
- populated

## Components Used
- `@/components/sell/QuoteAssistantBar`
- `@/components/sell/QuoteUploadZone`
- `@/components/shared/ai/AIInsightCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/feedback/ConfirmDialog`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/separator.tsx`
- `apps/web/src/components/ui/textarea.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellNewQuote.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/separator.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/utils.tsx`
