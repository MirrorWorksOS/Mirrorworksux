# WIP Valuation — dev stub

User doc: [`docs/user/modules/book/wip.md`](../../../user/modules/book/wip.md)

- **Route:** `/book/wip`
- **Component:** `apps/web/src/components/book/BookWipValuation.tsx`
- **Services used:** `bookService.getWipValuations()` (one of the few book pages actually wired)
- **Types:** `WipValuation` in `apps/web/src/types/entities.ts` (L783)
- **TODO:** migrate from `useEffect`+`useState` to React Query (`['book','wip']`); add error/loading states; add tier gate (Expand+).

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/book/BookWipValuation.tsx`
