# Nesting — redirect note

The legacy `/plan/nesting` route now redirects to `/plan/nesting-studio` (see [`apps/web/src/routes.tsx:364`](../../../../apps/web/src/routes.tsx)). The single-part Sheet Calculator was retired in commit `6d0b485c` (2026-05-05) in favour of the multi-part Nesting Studio.

For the canonical dev doc, see [Nesting Studio](./nesting-studio.md).

## Routes that landed here

| Old path | New path | Status |
|---|---|---|
| `/plan/nesting` | `/plan/nesting-studio` | `<Navigate replace />` |
| `/plan/sheet-calculator` | `/plan/nesting-studio` | `<Navigate replace />` |
| `/plan/sheet-calculator-legacy` | (kept as-is) | `PlanSheetCalculator` retained for the rare single-part lookup |

## Related files

- `apps/web/src/components/plan/PlanNesting.tsx` — original placeholder, no longer routed.
- `apps/web/src/components/plan/PlanSheetCalculator.tsx` — kept at `/plan/sheet-calculator-legacy`.
