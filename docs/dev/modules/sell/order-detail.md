<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/order-detail.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/shared/ai/AIInsightCard`
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Notes — list-row id collisions

`handleAddLineItem` and `handleUploadDocument` (file upload onto the documents tab) used `id: \`li-${Date.now()}\`` / `\`doc-${Date.now()}\`` and would collide on rapid clicks / drops. Since `d5b9e766` (2026-05-08) the ids are suffixed with `prev.length`. Use the same pattern when adding new push-to-array editors here.

## Related Files
- `apps/web/src/components/sell/SellOrderDetail.tsx`
