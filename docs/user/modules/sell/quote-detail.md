# Quote Detail

## Summary
Quote Detail screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/sell/quotes/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- Primary table/list region for records.
- Embedded AI/assistant insight panels.

## Data Shown
- Quote lines, pricing assumptions, revision/approval signals.

## States
- default
- loading
- error
- success
- populated

## Components Used
- `@/components/sell/CapableToPromise`
- `@/components/sell/DxfUploadPanel`
- `@/components/sell/ESignaturePanel`
- `@/components/sell/LeadScoreIndicator`
- `@/components/sell/QuoteHeuristicPanel`
- `@/components/sell/QuoteViewActivity`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/label`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellQuoteDetail.tsx`
