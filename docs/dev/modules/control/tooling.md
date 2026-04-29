# Developer notes — control/tooling.md

## Components Used
- `@/components/shared/forms/EntityFormDialog`
- `@/components/control/ToolingFormDialog` *(new 2026-04-29)*
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/ui/badge`
- `@/components/ui/card`

## Logic / Behaviour

### Page (`ControlTooling.tsx`)
- Local state drives search/filter and the *Add tool* dialog open flag.
- The table picks up a *Linked Machine* column reading `linkedMachineName` (new field on `ToolingItem`).

### Dialog (`ToolingFormDialog.tsx`)
Defined in [`apps/web/src/components/control/ToolingFormDialog.tsx`](apps/web/src/components/control/ToolingFormDialog.tsx).

```ts
interface ToolingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<ToolingItem, 'id' | 'lifePercent' | 'status'> & { id?: string }) => void;
}
```

- Wraps [`EntityFormDialog`](../../shared/EntityFormDialog.md).
- Resets field state on `open === false` so re-opens always start fresh (no edit mode in this dialog yet).
- Validation: tool ID + type required.
- Selecting a *Template* fires `handleTemplateChange`, which reads `TOOLING_TEMPLATES` and pre-fills *Type* (= category) + *Description* (= template name).
- Linked machine reuses `MACHINES_LIST` exported from [`MaintenanceFormDialog.tsx`](apps/web/src/components/control/MaintenanceFormDialog.tsx). The blank `value=""` SelectItem encodes "no machine".

### Standard library
[`apps/web/src/services/toolingLibrary.ts`](apps/web/src/services/toolingLibrary.ts) — 19 templates, 5 categories.

```ts
interface ToolingPropDef {
  type: 'number' | 'text' | 'select';
  label: string;
  defaultValue?: string;
  options?: string[];
}

interface ToolingTemplate {
  id: string;                // e.g. 'cutting-endmill'
  category: string;          // e.g. 'Cutting'
  name: string;              // e.g. 'End Mill'
  defaultProps: Record<string, ToolingPropDef>;
}
```

| Category    | Templates                                                                   |
|-------------|-----------------------------------------------------------------------------|
| Cutting     | End Mill · Drill Bit · Tap · Reamer · Insert · Saw Blade · Laser Nozzle (7) |
| Forming     | Press Brake Tool · Punch · Die (3)                                          |
| Welding     | MIG Tip · TIG Nozzle · Electrode (3)                                        |
| Measuring   | Calliper · Micrometer · Gauge Block (3)                                     |
| Workholding | Vice · 3-Jaw Chuck · Fixture (3)                                            |

`defaultProps` is **not yet rendered** by `ToolingFormDialog` — the dialog only consumes the template's `category` + `name`. Future enhancement: surface `defaultProps` as additional fields once the parent stores tool-specific properties.

## Dependencies
- `@/services/toolingLibrary` — `TOOLING_TEMPLATES`, `TOOLING_CATEGORIES`.
- `@/types/entities` → `ToolingItem` (with `linkedMachineId`, `linkedMachineName`).

## Known Gaps / Questions
- No edit mode — the dialog is *Add tool* only. Per-row edit needs to accept an `initialItem` prop similar to `MaintenanceFormDialog`.
- `defaultProps` from `TOOLING_TEMPLATES` are unused at runtime.
- `MACHINES_LIST` cross-import from `MaintenanceFormDialog` — flag for refactor into a shared service.

## Related Files
- `apps/web/src/components/control/ControlTooling.tsx`
- `apps/web/src/components/control/ToolingFormDialog.tsx`
- `apps/web/src/services/toolingLibrary.ts`
- `apps/web/src/types/entities.ts` (`ToolingItem`)
