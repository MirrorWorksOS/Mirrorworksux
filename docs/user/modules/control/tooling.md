# Tooling

## Summary
Tooling inventory page. Lists every consumable + reusable tool in the factory along with its location, expected life, last service, and (new) the machine it's linked to.

## Route
`/control/tooling`

## User Intent
Maintain a tool register so operators can find what they need, schedule calibration, and replace consumables before they're worn out.

## Primary Actions
- *Add tool* — opens [`ToolingFormDialog`](apps/web/src/components/control/ToolingFormDialog.tsx) (landed 2026-04-29).
- Filter / search across tool ID, type, location, linked machine.

### Create / edit form fields
- **Tool ID** *(required)* — your internal asset code, e.g. `TL-001`.
- **Template** *(optional)* — pick from a 19-template standard library grouped into 5 categories (Cutting, Forming, Welding, Measuring, Workholding). Selecting a template pre-fills *Type* and *Description*.
- **Type / Description** — free text, pre-filled from the template if one was selected.
- **Location** — where the tool lives (e.g. *Tool crib Bay A*).
- **Linked machine** *(optional)* — the machine the tool is paired with. Displayed in a new *Linked Machine* column on the tooling table.
- **Expected life (days)** — informational only at this stage.
- **Last service / Calibration due** dates.

## Key UI Sections
- Page header with *Add tool* CTA.
- Primary table: tool ID, type, description, location, linked machine, life %, status, calibration due.

## Data Shown
- Tool register entries.

## States
- default
- empty
- success (after add)
- populated

## Design / UX Notes
- The standard library lives in [`apps/web/src/services/toolingLibrary.ts`](apps/web/src/services/toolingLibrary.ts) — 19 templates × 5 categories. To extend the library, add an entry there; the dialog picks it up automatically.
- The *Cutting* category currently has 7 templates (end mill, drill, tap, reamer, insert, saw blade, laser nozzle); other categories are smaller. Worth growing as the SME catalogue stabilises.
- `linkedMachineId` / `linkedMachineName` are new fields on `ToolingItem` — older mock entries may show *—* in the Linked Machine column.
