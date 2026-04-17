# Floor Run

## Summary
Floor Run screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/floor/run/:workOrderId`

## User Intent
Run operator workflows quickly in kiosk mode with minimal office complexity.

## Primary Actions
- Open related pages and record detail views.
- Progress kiosk flow from sign-in/station selection to work execution.

## Key UI Sections
- Operator-first kiosk surface with reduced office chrome.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- loading
- error
- success
- mobile/responsive differences
- populated

## Components Used
- `@/components/floor/execution/snapshot`
- `@/components/floor/execution/types`
- `@/components/shop-floor/WorkOrderFullScreen`
- `@/components/ui/button`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Page logic relies on Zustand stores for shared state or mutations.
- Behavior is largely client-side React state and memoized derivations.
- Kiosk flow protects operator context and redirects to run steps when prerequisites are met.

## Dependencies
- `@/store/floorExecutionStore`
- `@/store/floorSessionStore`

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/floor/FloorRun.tsx`
- `apps/web/src/store/floorExecutionStore`
- `apps/web/src/store/floorSessionStore`
