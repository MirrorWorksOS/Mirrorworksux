<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/quote-detail.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

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

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellQuoteDetail.tsx`
