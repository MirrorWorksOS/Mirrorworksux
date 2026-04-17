# WIP Valuation — dev stub

User doc: [`docs/user/modules/book/wip.md`](../../../user/modules/book/wip.md)

- **Route:** `/book/wip`
- **Component:** `apps/web/src/components/book/BookWipValuation.tsx`
- **Services used:** `bookService.getWipValuations()` (one of the few book pages actually wired)
- **Types:** `WipValuation` in `apps/web/src/types/entities.ts` (L783)
- **TODO:** migrate from `useEffect`+`useState` to React Query (`['book','wip']`); add error/loading states; add tier gate (Expand+).
