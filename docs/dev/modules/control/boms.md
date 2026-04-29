# Developer notes — control/boms.md

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/FilterBar`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/motion/motion-variants`
- `@/components/shared/forms/MwFormField`
- `@/components/control/BomEditorSheet` *(new 2026-04-29)*
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour

### Page (`ControlBOMs.tsx`)
- Local state drives search/filter and derived visible lists.
- Holds the `editing` BOM and an `isOpen` flag for the editor sheet.
- *New BOM* and per-row Edit set the same state machine — the sheet renders in create mode iff `editing` is `undefined`.

### Editor sheet (`BomEditorSheet.tsx`)
Defined in [`apps/web/src/components/control/BomEditorSheet.tsx`](apps/web/src/components/control/BomEditorSheet.tsx).

```ts
type BomLineKind = 'material' | 'purchased' | 'labour' | 'subAssembly';

interface BomLineDraft {
  key: string;        // local-only stable key for list rendering
  kind: BomLineKind;
  sku: string;        // SKU for material/purchased/labour, sub-BOM id for subAssembly
  description: string;
  qty: number;
  unit: string;
}

interface BomDraft {
  id?: string;        // undefined → create mode
  product: string;
  sku: string;
  version: string;
  status: 'active' | 'draft' | 'obsolete';
  lines: BomLineDraft[];
}
```

- A `KIND_META` map gives each kind its label + chip class.
- The sub-assembly picker accepts an `availableSubAssemblies` prop — the parent page is responsible for filtering its own list of BOMs to a safe set (e.g. exclude the BOM currently being edited to prevent self-reference).
- Multi-tier nesting is shallow at this layer: a `subAssembly` line stores only the referenced BOM id; the editor does not recursively render children. To inspect a sub-BOM, close and re-open the referenced one.
- Save fires `onSave?(draft)` and dismisses the sheet. Backend wiring is pending — every new component still has a `// TODO(backend)` marker on its mutation handler.

## Dependencies
- No store or service; the parent page passes `availableSubAssemblies` down. Replace this with a `bomsService.listBoms()` call when wiring backend.

## Known Gaps / Questions
- No cycle detection on `subAssembly` lines yet — a user could create A → B → A. The picker accepts any BOM id, including the one being edited if the parent doesn't filter it out.
- No expand-in-place for nested BOMs.
- `BomRoutingTree` op chips (separate component) do not yet share the `operation-category-colors` palette.

## Related Files
- `apps/web/src/components/control/ControlBOMs.tsx`
- `apps/web/src/components/control/BomEditorSheet.tsx`
- `apps/web/src/components/shared/forms/MwFormField.tsx`
- `apps/web/src/lib/operation-category-colors.ts` *(used by `RouteEditorSheet`, not `BomEditorSheet`, but lives next to BOM-related routing UI)*
