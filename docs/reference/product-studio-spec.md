# Product Studio — Block Editor Spec

**Status:** v0.1 draft, MVP target
**Owner:** Matt
**Last updated:** 2026-04-07

---

## 1. Goal

Replace the current split-pane Product Studio (BOM canvas + form-based rules rail) with a **single Scratch-like block editor** built on Blockly. Users compose configurable products by dragging shaped blocks from a typed toolbox onto a workspace; the editor emits `ProductDefinitionEngine` JSON that the existing evaluator consumes unchanged.

The aim: a metal fabricator with no programming experience can build a quoted, BOM-complete, work-order-generating product in minutes.

---

## 2. Architecture

```
Toolbox (left)        Workspace (centre)        Output panels (right)
─────────────         ─────────────────         ─────────────────────
Triggers              Hat blocks                BOM (live)
Variables             Stack blocks              Costs (live)
Operators             C-blocks                  Work orders (live)
Logic                 Reporters                 Warnings
Materials             Hex booleans
Finishes              Caps
Products
CAD
Operations            ↓ Code generator
Costs
Output                ProductDefinitionEngine JSON
My Blocks                       ↓
                      Existing evaluator (unchanged)
```

- **Authoring** = Blockly workspace + custom blocks + custom code generator.
- **Runtime** = existing `@/lib/product-studio/evaluate` (no changes for MVP).
- **Persistence** = `ProductDefinitionEngine` JSON in zustand store + localStorage (existing).
- **Blockly XML** = stored alongside the JSON so the workspace can re-render exactly. JSON is the source of truth for evaluation; XML is the source of truth for layout/visual state.

The same JSON is produced by manual editing AND by AI generation. One contract.

---

## 3. Socket type system

**Loose with unit hints.** Five socket types only:

| Socket | Shape | Description |
|---|---|---|
| `number` | round (oval) | Any number. Field-level *unit hint* (mm / m² / kg / AUD / %). Hint is metadata; math just works. |
| `text` | round (oval) | String. |
| `boolean` | **hex** | Strict — only fits hex sockets (`if`, `repeat until`, `and/or/not`). |
| `ref` | round, themed colour | Reference to a library entity. Subtypes: `material`, `finish`, `product`, `cad`. Visually distinct, technically a value socket. |
| `void` | n/a | Statement blocks (no return). |

### Unit hints

The user picks "loose typing" — sockets do not enforce dimensions. To still get auto-conversion (`1500mm + 1.5m = 3000mm`), input fields carry an optional unit toggle:

- The user types `1.5` and selects `m` from the unit toggle.
- The block stores the canonical value `1500` (canonical = mm for length, m² for area, kg for mass, AUD for currency).
- All workspace math operates on canonical values, so `+`/`-`/`×`/`÷` are unit-agnostic and correct by construction.
- FX rates for currency are snapshotted at input time, not at evaluation time, so quotes are stable.

### Canonical units (MVP)

| Domain | Canonical |
|---|---|
| Length | mm |
| Area | m² |
| Volume | m³ |
| Mass | kg |
| Currency | AUD |
| Time | minutes |
| Angle | degrees |

---

## 4. Block shapes

Standard Blockly shapes — no custom rendering.

| Shape | Role | Examples |
|---|---|---|
| **Hat** (curved top) | Trigger | `When configured`, `When variable changes`, `When quote requested` |
| **Stack** (puzzle top + bottom) | Statement | `Set X to`, `Add to BOM`, `Add operation` |
| **C-block** | Container | `If`, `If/else`, `If/else if/else` |
| **Reporter** (round) | Returns number/text/ref | `width`, `5 + 3`, `Material X cost/kg` |
| **Boolean** (hex) | Returns true/false | `>`, `=`, `and`, `is selected` |
| **Cap** (puzzle top, flat bottom) | Terminates stack | `Stop`, `Block configuration` |

---

## 5. Toolbox categories (palette)

| # | Category | Colour | Contents |
|---|---|---|---|
| 1 | **Triggers** | Yellow | Hat blocks: `When configured`, `When variable changes`, `When quote requested` |
| 2 | **Variables** | Orange | `Make a variable`, then per-variable: `Get`, `Set to`, `Change by`. Lists deferred to v2. |
| 3 | **Operators** | Green | `+ - × ÷`, `min max abs round mod pow sqrt`, `=, ≠, >, <, ≥, ≤`, `and or not`, `join`, `length`, `contains` |
| 4 | **Logic** | Gold | `If`, `If/else`, `If/else if/else`, `Stop` |
| 5 | **Materials** | Brown | `Use material [picker]` (returns material-ref), `Material's cost/kg`, `Material's density`, `Material's thicknesses` |
| 6 | **Finishes** | Purple | `Use finish [picker]`, `Finish cost/m²`, `Finish setup cost`, `Finish lead time`, `Apply finish [X] to [Y]` (statement) |
| 7 | **Products** | Blue | `Use product [picker]`, `Add subassembly [X] qty [N]`, `Pass [variable] to [subassembly] as [input]` |
| 8 | **CAD** | Teal | `Use CAD file [picker]`, `Area of`, `Perimeter of`, `Cut length`, `Hole count`, `Bend count`, `Bounding box` |
| 9 | **Operations** | Red | `Cut on laser`, `Bend on press brake`, `Weld`, `Drill`, `Assemble`, `Subcontract to [X]` (each carries work centre, setup time, run rate) |
| 10 | **Costs** | Dark green | `Material cost`, `Labour cost`, `Machine cost`, `Add overhead %`, `Add margin %`, `Sum costs from group` |
| 11 | **Output** | Grey caps | `Add BOM line`, `Add subassembly BOM`, `Generate work order`, `Show warning`, `Block configuration` (cap) |
| 12 | **My Blocks** | Pink | User-defined custom blocks (`Make a block`). Reusable formulas/macros. MVP. |

---

## 6. Library entities (first-class)

These are stored in their own zustand stores + localStorage, mirroring `productBuilderStore`. They expose entries to the toolbox dropdowns and to the AI text bar.

### 6.1 Material

```ts
interface Material {
  id: string;
  name: string;
  code: string;
  type: 'sheet' | 'plate' | 'tube' | 'rhs' | 'shs' | 'angle' | 'flat_bar' | 'round_bar' | 'wire' | 'mesh';
  grade: string;                       // '304', '316', '250MPa'
  densityKgM3: number;
  cost: {
    unit: 'per_kg' | 'per_m' | 'per_sheet';
    amount: number;
    currency: string;                  // 'AUD' default
  };
  stockSizes: Array<{                  // shape varies by type
    width?: number;                    // mm — sheet/plate
    length?: number;                   // mm — sheet/plate/tube
    thickness?: number;                // mm — sheet/plate
    diameter?: number;                 // mm — round bar/tube
    profile?: string;                  // '50x50x3' — RHS/SHS/angle
  }>;
  thicknesses: number[];               // mm — standard available thicknesses
  compatibleFinishes: string[];        // finish ids
  suppliers: Array<{
    name: string;
    leadTimeDays: number;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 Finish

```ts
interface Finish {
  id: string;
  name: string;
  code: string;
  type: 'powder_coat' | 'galv' | 'paint' | 'anodise' | 'polish' | 'passivate';
  costPerM2: number;
  flatFee: number;                     // optional — 0 if none
  setupCost: number;                   // minimum / setup charge
  leadTimeDays: number;
  colour: { ral: string; name: string } | null;
  compatibleMaterials: string[];       // material ids
  source: 'in_house' | 'subcontract';
  subcontractor: { name: string; contact: string } | null;
  shipping: {
    fixed: number;
    perKg: number;
    perKm: number;
  } | null;                             // for subcontract jobs
  createdAt: string;
  updatedAt: string;
}
```

### 6.3 Product reference (Q12)

A product can be dragged into another product as a subassembly.

- Parent passes named values down: `Pass [width] to [Frame] as [outer_width]`.
- Child declares which variables are *inputs* via a checkbox in the variable definition: "Accept from parent".
- Child variables not marked as inputs stay private.
- Child runs full evaluation; returns BOM/cost/work orders; parent rolls them up.
- Recursion guard: a product cannot reference itself, directly or transitively.

### 6.4 CAD reference (Q13)

`cad-ref` block points at a CAD file (DXF/STEP/IGES) from CAD import. Reporter blocks derive computed properties:

- `area`, `perimeter`, `cut length`
- `hole count`, `hole diameters` (list)
- `bend count`, `bend lengths` (list)
- `bounding box` (W × H × D)
- `weight` (when paired with a material reference)

This is the lever for fast sheet metal quoting — drop a DXF and the BOM and cost almost build themselves.

---

## 7. Custom blocks (My Blocks)

Engineers click **Make a block**, name it (e.g. `Sheet metal blank size`), define inputs (`width: number`, `height: number`, `thickness: number`, `bend count: number`), and the block becomes a reusable function in the toolbox.

- Two flavours: **reporter** (returns a value) for formulas, **statement** (no return) for repeated procedures.
- Internally each is a stack-block subtree compiled into the engine JSON via the same code generator.
- **Scope:** per-product by default. A "Promote to library" action makes a custom block globally reusable across products.

---

## 8. Outputs (live panels)

The right side of the studio renders three live tabs that re-evaluate on every workspace change:

- **BOM** — tree, subassemblies, qty rollups, weight/material totals
- **Costs** — by category (material/labour/machine/overhead/margin), per subassembly + grand total
- **Work orders** — generated routing per part, sequenced operations, work centres, total minutes per work centre

Plus a persistent warnings strip for any `Show warning` blocks that fired.

---

## 9. Storage / runtime contract

Blockly's authoring layer outputs JSON. We extend the existing `ProductDefinitionEngine` to cover the new block kinds (materials, finishes, operations with library refs, custom blocks). Runtime evaluator reads JSON only.

### Extension points needed in `ProductDefinitionEngine`

The current engine has: `set_variable`, `if_chain`, `sequence`, `bom_phantom`, `bom_override`, `operation`, `cost_adjust`, `warning`. For MVP we add:

- `expression` (any tree of operators that resolves to a value — replaces inline literal-only conditions)
- `material_ref` (reference to a material library id; reporter)
- `finish_ref` (reference to a finish library id; reporter)
- `apply_finish` (statement: applies a finish to a target part)
- `product_ref` (reference to another product id; reporter)
- `subassembly_add` (statement: pulls in a subassembly with overrides)
- `cad_ref` (reference to a CAD file; reporter)
- `cad_property` (reporter: pulls a computed property from a cad_ref)
- `custom_block_def` and `custom_block_call` (top-level definitions + invocation sites)

### Storage shape

```ts
{
  schemaVersion: 2,
  variables: [...],
  lookupTables: [...],
  customBlocks: [...],          // NEW
  rootBlocks: [...],
  blocklyXml: '<xml>...</xml>',  // NEW — workspace layout
}
```

`schemaVersion` bumps to 2; existing v1 documents auto-migrate (no destructive changes).

---

## 10. AI features

All AI features read or write the same `ProductDefinitionEngine` JSON. AI never bypasses the engine — its output is visible as blocks the user can edit.

### Tier 1 — magical (MVP)

1. **Text → product.** Chat bar at the top of the canvas. *"A shelving unit 1500 wide, 2000 tall, 5 shelves, 1.6mm mild steel powdercoated black."* → AI emits engine JSON → Blockly renders the blocks. Editable from there. **Headline demo.**
2. **CAD → product.** Drop a DXF; AI infers material thickness from geometry, suggests folds/welds/cuts, generates a starting block tree. Works because CAD pipeline already produces structured data.
3. **Plain English explainer.** Right-click any block subtree → "Explain in English." Renders as customer-readable text. Critical for sales / quote review without learning blocks.

### Tier 2 — daily-use

4. **Suggest next block.** *"You added a material but no finish — want me to add a powder coat block?"*
5. **Validation / lint.** *"This `if` will never fire because variable X is always > 100."* / *"This finish isn't compatible with this material per the library."*
6. **Refactor suggestions.** *"These three rules could be one if/else if/else."* / *"You're using the same formula in 5 places — extract as a custom block?"*
7. **Test case generation.** *"Generate 10 test cases that exercise every branch."*

### Tier 3 — strategic

8. **Spreadsheet → product.** Upload an `.xlsx`; AI reverse-engineers formulas into a block program. Excel migration onboarding.
9. **Photo → product.** Vision model proposes dimensions/materials/structure from a photo.
10. **Quote critique.** *"Your margin is 8%, your usual is 25%."* Internal sales tool.
11. **Voice / chat building.** Salesperson on a call talks the product into existence. Mobile/tablet UX.
12. **Auto-doc.** Customer PDF quote, shop-floor work order pack, maintenance datasheet — all from the same block program.

### Architecture

```
AI text bar  →  Claude API (Sonnet 4.6 for fast/cheap, Opus 4.6 for hard reasoning)
             →  returns engine JSON patch
             →  preview diff against current
             →  user accepts → applied to workspace
             →  Blockly re-renders
```

**Model recommendation:**
- Sonnet 4.6 — text→product, explainer, suggest-next, validation
- Opus 4.6 — CAD interpretation, refactor suggestions, spreadsheet→product

---

## 11. Migration plan

1. **Spike** — small Blockly proof-of-concept page (`/plan/product-studio/blockly-spike`). 6 blocks, 3 categories, dummy code generator → engine JSON. Decision-grade. Throwaway code.
2. **Material + Finish library entities** — built in parallel; no Blockly dependency.
3. **Schema v2** — extend `ProductDefinitionEngine`, write migration, keep v1 readable.
4. **Block library port** — port the existing 8 block kinds to Blockly definitions; verify the existing evaluator still passes against generated JSON.
5. **New categories** — add Materials, Finishes, Products, CAD, Operations, Costs, Output toolbox categories. Each one ships as a small PR.
6. **Custom blocks** — Blockly's procedure system, wire to engine.
7. **Output panels** — wire BOM / Costs / Work orders to live evaluation.
8. **AI text bar** — Tier 1 features.
9. **Kill the old rules rail + canvas split.** Replace `ProductStudio.tsx`'s split layout with the Blockly editor.
10. **Test cases + step debugger.**

Steps 1–3 unblock everything else. After step 5, the studio is functionally at parity with the current one but on a real foundation.

---

## 12. Open questions

- **Q1** Locked-down list types for v2 — `list<number>`, `list<material>`, etc. Defer until iteration is needed.
- **Q2** Tolerances data type — defer to v2 per Q4.
- **Q3** Multi-currency UX — default to AUD; add per-product currency override later.
- **Q4** Where do `Triggers` belong if a product can have multiple? Same workspace, multiple hats, run on the relevant event. (Scratch model.)
- **Q5** How does undo/redo interact with library changes (e.g., user deletes a material that's referenced by a block)? Soft-delete with a warning blocking publish.
