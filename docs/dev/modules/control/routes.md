# Developer notes — control/routes.md

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/forms/MwFormField`
- `@/components/control/RouteEditorSheet` *(new 2026-04-29)*
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/popover.tsx`
- `apps/web/src/components/ui/command.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`

## Logic / Behaviour

### Page (`ControlRoutes.tsx`)
- Card-grid driven by `routesLibraryService.list()`.
- *New route* and per-card *Edit* both open the same `RouteEditorSheet` — distinguished by whether a `route` prop is passed in.

### Editor sheet (`RouteEditorSheet.tsx`)
Defined in [`apps/web/src/components/control/RouteEditorSheet.tsx`](apps/web/src/components/control/RouteEditorSheet.tsx).

```ts
interface RouteEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: StandardRoute;            // undefined → create mode
  onSave?: (route: StandardRoute) => void;
}

interface DraftStep {
  key: string;                      // local-only stable key (newKey()) for reorder
  operationId: string;
  minutesOverride?: number;
}
```

- The internal step state uses a local `key` (random base-36 slug) so React stays happy through drag-reorder; the `operationId` is the only thing persisted.
- `totalMinutes` is memoised over `steps` and looks up each step's default via `operationsLibraryService.byId(operationId)` — falls back to 0 if the op id is missing (defensive against stale references).
- `addStep` appends; `removeStep` filters by `key`; `moveStep(fromKey, toIdx)` is the drag-reorder primitive (splice from-idx out, splice into to-idx).
- Save fires `onSave?(route)` with `minutesOverride` only set on steps where the user actually entered a non-undefined value (clean payload, no `{ minutesOverride: undefined }` keys).
- The *Add op* picker uses the shared `Command` palette wrapped in a `Popover`. Operations are grouped by `category` for quick scanning.

### Step chip colours
Step chips render via `getCategoryColors(operation.category)` from [`operation-category-colors.ts`](apps/web/src/lib/operation-category-colors.ts). Returns a `{ bg, border, text, dot }` Tailwind class set keyed by category name. Unknown categories fall back to a neutral palette.

## Dependencies
- `@/services` → `operationsLibraryService` (catalogue + `byId` lookups), `routesLibraryService` (route list + persistence stub).
- No store binding; the page passes the saved route to the service after `onSave` fires.

## Known Gaps / Questions
- Drag-reorder uses native HTML5 drag events with a single `draggingKey` state value; no announce-to-AT semantics. Consider replacing with a keyboard-accessible reorder lib if a11y becomes a hard requirement.
- No cycle / duplicate-step detection — a route with the same op listed twice is currently allowed.
- `BomRoutingTree` (Plan module) does not yet share the category palette; its `OperationNode` type has no `category` field. Bridging the two will be a follow-up.

## Related Files
- `apps/web/src/components/control/ControlRoutes.tsx`
- `apps/web/src/components/control/RouteEditorSheet.tsx`
- `apps/web/src/components/shared/forms/MwFormField.tsx`
- `apps/web/src/lib/operation-category-colors.ts`
- `apps/web/src/services/operationsLibraryService.ts`
- `apps/web/src/services/routesLibraryService.ts`
