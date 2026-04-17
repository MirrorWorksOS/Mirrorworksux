# Expenses — dev stub

User doc: [`docs/user/modules/book/expenses.md`](../../../user/modules/book/expenses.md)

- **Route:** `/book/expenses`
- **Component:** `apps/web/src/components/book/ExpenseKanban.tsx` (uses `NewExpense.tsx` sheet)
- **Services used:** none (local `INITIAL_COLUMNS`)
- **Types:** local `Expense`, `ExpenseColumn`, `ExpenseColumnId`; shadows `Expense` in `entities.ts`
- **Shared:** `KanbanBoard`, `KanbanColumn`, `KanbanCard`
- **TODO:** wire `bookService.getExpenses()`; persist drag transitions via mutation; add receipt upload; tier gate (Pilot+).
