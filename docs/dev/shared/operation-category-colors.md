# operation-category-colors

7-key Tailwind colour palette keyed by operation category. Used to colour route step chips, op pickers, and any other surface that needs to communicate which kind of work an operation represents.

## Source
[`apps/web/src/lib/operation-category-colors.ts`](apps/web/src/lib/operation-category-colors.ts)

## Categories + colours

| Category   | Token base       | Notes                                                       |
|------------|------------------|-------------------------------------------------------------|
| Planning   | `--mw-blue-400`  | Schedule/queue work — blue tint, dark blue text.            |
| Cutting    | `--mw-yellow-400`| MW brand yellow — uses `yellow-900` text per memory rule.   |
| Forming    | `--mw-amber-400` | Press / brake / bend — amber tint.                          |
| Machining  | `--mw-info`      | Mill / turn / drill — info-blue tint.                       |
| Joining    | `--mw-mirage`    | Weld / fasten / glue — mirage tonal scale.                  |
| Finishing  | `--mw-success`   | Powder coat / paint / polish — success-green tint.          |
| Quality    | `--neutral-*`    | Inspection — neutral grey, no chromatic accent.             |

Unknown categories fall back to the `Quality` neutral palette via `getCategoryColors()`.

## API

```ts
interface CategoryColors {
  bg: string;      // background class (color-mix tint)
  border: string;  // 1px border class (matching tint, ~40% opacity)
  text: string;    // foreground text class
  dot: string;     // solid-colour dot for status pips
}

function getCategoryColors(category: string): CategoryColors;

const OPERATION_CATEGORY_COLORS: Record<string, CategoryColors>;
```

All four properties are pre-baked Tailwind class strings, so consumers can spread them directly into `className`:

```tsx
const cls = getCategoryColors(operation.category);
return <span className={cn('rounded-full px-2 py-1 border', cls.bg, cls.border, cls.text)}>…</span>;
```

## Consumers

- [`RouteEditorSheet`](../../../apps/web/src/components/control/RouteEditorSheet.tsx) — step chips inside a route.
- [`ControlRoutes`](../../../apps/web/src/components/control/ControlRoutes.tsx) — card-grid step previews.
- (Pending) Plan → `BomRoutingTree` op chips. Currently uses status colours; bridging the two is on the follow-up list because `OperationNode` has no `category` field yet.

## Adding a new consumer

1. Import `getCategoryColors`.
2. Look up the category off the underlying operation, **not** off the route or BOM that references it — categories live on the catalogue entry, not the reference.
3. If you need a new category, add it to `OPERATION_CATEGORY_COLORS` and pick a token from the `--mw-*` design-system palette so dark-mode flipping is automatic. Avoid hand-rolled `rgba()`.

## Why a shared module

Before this util landed (2026-04-29) the same palette was being inlined three different ways across Control routes and the Plan BOM tree, which drifted on every retone pass. Centralising it lets the next chromatic adjustment land in one place and propagate.
