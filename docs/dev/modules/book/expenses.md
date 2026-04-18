# Expenses — dev stub

User doc: [`docs/user/modules/book/expenses.md`](../../../user/modules/book/expenses.md)

- **Route:** `/book/expenses`
- **Component:** `apps/web/src/components/book/ExpenseKanban.tsx` (uses `NewExpense.tsx` sheet)
- **Services used:** none (local `INITIAL_COLUMNS`)
- **Types:** local `Expense`, `ExpenseColumn`, `ExpenseColumnId`; shadows `Expense` in `entities.ts`
- **Shared:** `KanbanBoard`, `KanbanColumn`, `KanbanCard`
- **TODO:** wire `bookService.getExpenses()`; persist drag transitions via mutation; add receipt upload; tier gate (Pilot+).

## Components Used
- `@/components/shared/kanban/KanbanBoard`
- `@/components/shared/kanban/KanbanCard`
- `@/components/shared/kanban/KanbanColumn`
- `@/components/shared/kanban/drag-styles`
- `@/components/shared/layout/IconViewToggle`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/book/NewExpense.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/book/ExpenseKanban.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/book/NewExpense.tsx`
