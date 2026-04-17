# Expenses

## Summary
Expenses screen. Behavior is documented from current component implementation.

## Route
`/book/expenses`

## User Intent
Complete expenses work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- populated

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

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/book/ExpenseKanban.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/book/NewExpense.tsx`
