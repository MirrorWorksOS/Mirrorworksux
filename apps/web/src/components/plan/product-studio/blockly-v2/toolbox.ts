/**
 * Product Studio v2 — Blockly toolbox builder.
 *
 * The toolbox is built dynamically so the Materials / Finishes categories can
 * be populated from the live library stores. Each material/finish becomes its
 * own draggable chip with the id baked in via `block.data`.
 *
 * ── Inline typing via shadow blocks ──────────────────────────────────────────
 * Every numeric value socket is paired with an `mw_number` *shadow* block via
 * the toolbox JSON `inputs` map. Shadow blocks render in-place and accept
 * direct typing — exactly like Scratch — and they are silently replaced when a
 * real expression block is dropped onto them. The defaults below are sensible
 * shop-floor starting points so the user doesn't see a screen full of zeros.
 */

import type { Material } from '@/lib/material-library/types';
import type { Finish } from '@/lib/finish-library/types';
import { MATERIAL_TYPE_LABELS } from '@/lib/material-library/types';
import { FINISH_TYPE_LABELS } from '@/lib/finish-library/types';

export interface ToolboxBuildOpts {
  materials: Material[];
  finishes: Finish[];
}

interface ShadowBlock {
  shadow: {
    type: string;
    fields?: Record<string, string | number>;
    /**
     * Nested shadow children. Blockly's JSON toolbox happily walks an
     * arbitrary depth of `shadow → inputs → shadow → …` so we expose the
     * recursion in our type. This is what makes "if length > 1000" appear
     * pre-wired when the user drags `controls_if` out: the IF0 socket carries
     * a shadow `mw_compare`, whose A socket carries a shadow `mw_get_variable`,
     * whose NAME field is preloaded with `length`. Three drags become one.
     */
    inputs?: Record<string, ShadowBlock>;
  };
}

interface BlockEntry {
  kind: 'block';
  type: string;
  fields?: Record<string, string | number>;
  inputs?: Record<string, ShadowBlock>;
  /** Round-trips on the block via Blockly's `block.data` slot. */
  data?: string;
  /**
   * Mutation state for blocks that use Blockly's serialiser-driven mutation
   * API (e.g. `controls_if` patched by @blockly/block-plus-minus, which
   * stores `{ elseIfCount, hasElse }` here). The toolbox JSON loader feeds
   * this verbatim into `Block.loadExtraState_()` at flyout-time.
   */
  extraState?: Record<string, unknown>;
}

interface SepEntry {
  kind: 'sep';
  gap?: number;
}

interface CategoryEntry {
  kind: 'category';
  name: string;
  colour: string;
  contents: Array<BlockEntry | SepEntry | CategoryEntry>;
  /**
   * CSS class hooks Blockly v12 splices onto the rendered category nodes. We
   * use the `row` slot to attach a per-category icon class (e.g. `mw-cat-recipe`)
   * which the design-system stylesheet picks up to render a lucide icon as a
   * `::before` mask on the row's label. Other slots (`label`, `container`,
   * `icon`) are left untouched so Blockly's defaults still apply.
   */
  cssConfig?: {
    container?: string;
    row?: string;
    label?: string;
    icon?: string;
    selected?: string;
    openIcon?: string;
    closedIcon?: string;
  };
}

interface ToolboxJson {
  kind: 'categoryToolbox';
  contents: CategoryEntry[];
}

// ── Shadow helpers ───────────────────────────────────────────────────────────
/** Build a shadow `mw_number` block with a default value. */
function numShadow(value: number): ShadowBlock {
  return { shadow: { type: 'mw_number', fields: { VALUE: value } } };
}

/** Build a shadow `mw_get_variable` block bound to a named input. */
function varShadow(name: string): ShadowBlock {
  return { shadow: { type: 'mw_get_variable', fields: { NAME: name } } };
}

/**
 * Build a shadow `mw_compare` pre-wired with `<var name> <op> <number>`.
 * Used to seed `controls_if` and the standalone `mw_compare` toolbox entry so
 * the variables → logic plumbing is discoverable on first drag — no more
 * "where do my inputs plug in?" guessing.
 */
function compareVarShadow(varName: string, defaultRhs: number): ShadowBlock {
  return {
    shadow: {
      type: 'mw_compare',
      inputs: {
        A: varShadow(varName),
        B: numShadow(defaultRhs),
      },
    },
  };
}

// ── Material / finish chips ──────────────────────────────────────────────────
function materialChip(m: Material): BlockEntry {
  return {
    kind: 'block',
    type: 'mw_material_ref',
    // The material id rides on `block.data`, the label fills the editable field.
    data: m.id,
    fields: {
      LABEL: `${m.code} · ${MATERIAL_TYPE_LABELS[m.type]}`,
    },
  };
}

function finishChip(f: Finish): BlockEntry {
  return {
    kind: 'block',
    type: 'mw_finish_ref',
    data: f.id,
    fields: {
      LABEL: `${f.code} · ${FINISH_TYPE_LABELS[f.type]}`,
    },
  };
}

export function buildStudioV2Toolbox(opts: ToolboxBuildOpts): ToolboxJson {
  // ── Leaf categories (re-used inside super-categories below) ───────────────
  // We keep each leaf's *colour* identical to the previous flat layout so the
  // canvas blocks stay visually familiar — only the *grouping* changes. Leaves
  // are declared once here so reordering between super-categories is cheap.
  //
  // Each leaf and super-category carries a `cssConfig.row` icon class
  // (`mw-cat-<slug>`) that the design-system stylesheet uses to render a
  // lucide icon as a CSS mask on the row's `::before` pseudo-element. The
  // class names are stable contract between `toolbox.ts` and
  // `blockly-theme.css` — adding a new category means picking a slug here
  // and adding a matching `--mw-cat-icon-<slug>` data URI in the CSS.

  // Recipe — the entry point of the studio. Surfaces both pricing/making hats
  // AND the product reference chips, so the user can author a complete recipe
  // ("price this product, then make this product, with these sub-assemblies")
  // without ever leaving the Recipe category. Previously `mw_product_ref` and
  // `mw_op_assemble_with` lived in their own "Products" sibling under Setup,
  // which buried the most-used chips two clicks away. Merging them into Recipe
  // collapses the discoverability gap — the same blocks are still findable
  // under Sub-products ▸ Products for the "compose another product" flow.
  //
  // Legacy: the generic `mw_when_configured` hat stays registered but is
  // hidden so old XML still loads cleanly.
  const triggersCategory: CategoryEntry = {
    kind: 'category',
    name: 'Recipe',
    colour: '#FFCF4B',
    cssConfig: { row: 'mw-cat-recipe' },
    contents: [
      // ── Ergonomic shortcuts (folded onto the lifecycle state machine) ──
      // mw_when_pricing  → quote.requested
      // mw_when_making   → mo.raised
      { kind: 'block', type: 'mw_when_pricing' },
      { kind: 'block', type: 'mw_when_making' },
      { kind: 'sep', gap: 12 },
      // ── Manual (play-button dry-run) ─────────────────────────────────
      // Fires the `manual.run` synthetic event dispatched by the Run
      // toolbar button. Use this for "scratch test the recipe against
      // current scenario inputs without committing anything".
      { kind: 'block', type: 'mw_when_manual' },
      { kind: 'sep', gap: 12 },
      // ── Lifecycle hats (state-machine touchpoints) ───────────────────
      // Ordered by their position in the quote → delivery pipeline so a
      // left-to-right scan of the drawer reads like a Gantt of a job.
      { kind: 'block', type: 'mw_when_quote_requested' },
      { kind: 'block', type: 'mw_when_quote_confirmed' },
      { kind: 'block', type: 'mw_when_order_placed' },
      { kind: 'block', type: 'mw_when_mo_raised' },
      { kind: 'block', type: 'mw_when_wo_start' },
      { kind: 'block', type: 'mw_when_wo_complete' },
      { kind: 'block', type: 'mw_when_delivered' },
      { kind: 'sep', gap: 12 },
      // ── Condition hats (non-lifecycle state-machine triggers) ────────
      { kind: 'block', type: 'mw_when_stock_low' },
      { kind: 'sep', gap: 12 },
      // Product reference chips — the recipe hats' PRODUCT socket needs one of
      // these to bind. Surfacing them inline means a brand-new user opens
      // Recipe, drags `When pricing this`, drags a `Product`, and is already
      // authoring — no category-hunting required.
      { kind: 'block', type: 'mw_product_ref' },
      {
        kind: 'block',
        type: 'mw_op_assemble_with',
        inputs: { QTY: numShadow(1) },
      },
    ],
  };

  // Each input declared here surfaces in the Inputs sidebar of the Studio at
  // run-time, where the user can edit the live value to scenario-test the
  // configurator. The blocks themselves emit `set_variable` engine ops so the
  // rest of the program can read them via mw_get_variable.
  //
  // ── Metal-shop presets ──────────────────────────────────────────────────
  // The first batch are *preconfigured* `mw_input_*` blocks — same block
  // types as the generics, but with default NAME / UNIT / OPTIONS fields
  // baked in so the most-reached-for variables in a sheet-metal shop are one
  // drag away.
  //
  // Previously this was a single flat list of ~17 blocks that scrolled past
  // the fold. We now nest them under 5 sub-drawers so the author sees a
  // scannable tree instead of a wall:
  //
  //   Inputs ▸ Dimensions  — length/width/height/depth/thickness/gauge/bend_radius
  //   Inputs ▸ Geometry    — pitch/hole_diameter/fastener_size/bend_angle
  //   Inputs ▸ Quantities  — mass_kg/parts_per_unit/holes/bends
  //   Inputs ▸ Choices     — colour/grade/tolerance/roughness/weld_class
  //   Inputs ▸ Generic     — the unconfigured input block factories
  //
  // Blockly's `categoryToolbox` kind walks nested `kind: 'category'` entries
  // natively, so this is a pure structural refactor — no runtime plumbing.
  const inputsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Inputs',
    colour: '#9B4DFF',
    cssConfig: { row: 'mw-cat-inputs' },
    contents: [
      // ── Dimensions (mm) ────────────────────────────────────────────────
      {
        kind: 'category',
        name: 'Dimensions',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-inputs-dim' },
        contents: [
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'length', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(1000) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'width', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(500) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'height', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(750) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'depth', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(400) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'thickness', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(2) },
          },
          // Gauge is the colloquial name for sheet thickness in imperial-shop
          // talk; we still author the value in mm because the rest of the recipe
          // does — the variable just gives the user a familiar handle.
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'gauge', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(1.6) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'bend_radius', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(3) },
          },
        ],
      },
      // ── Geometry (feature-level layout dims) ──────────────────────────
      {
        kind: 'category',
        name: 'Geometry',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-inputs-geom' },
        contents: [
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'pitch', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(100) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'hole_diameter', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(8) },
          },
          {
            kind: 'block',
            type: 'mw_input_dimension',
            fields: { NAME: 'fastener_size', UNIT: 'mm' },
            inputs: { DEFAULT: numShadow(6) },
          },
          {
            kind: 'block',
            type: 'mw_input_angle',
            fields: { NAME: 'bend_angle', DEFAULT: 90 },
          },
        ],
      },
      // ── Quantities (counts and mass) ──────────────────────────────────
      // Mass lives on `mw_input_quantity` rather than dimension because the
      // dimension UNIT dropdown is mm/cm/m/in only — kg doesn't fit.
      {
        kind: 'category',
        name: 'Quantities',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-inputs-qty' },
        contents: [
          {
            kind: 'block',
            type: 'mw_input_quantity',
            fields: { NAME: 'mass_kg' },
            inputs: { DEFAULT: numShadow(10) },
          },
          {
            kind: 'block',
            type: 'mw_input_quantity',
            fields: { NAME: 'parts_per_unit' },
            inputs: { DEFAULT: numShadow(4) },
          },
          {
            kind: 'block',
            type: 'mw_input_quantity',
            fields: { NAME: 'holes' },
            inputs: { DEFAULT: numShadow(8) },
          },
          {
            kind: 'block',
            type: 'mw_input_quantity',
            fields: { NAME: 'bends' },
            inputs: { DEFAULT: numShadow(4) },
          },
        ],
      },
      // ── Choices (material, colour, tolerance dropdowns) ───────────────
      // Colour as a free-form choice — the configurator renders this as a
      // dropdown of the comma-separated options. Authors can edit the option
      // list inline to add their own RAL codes.
      {
        kind: 'category',
        name: 'Choices',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-inputs-choice' },
        contents: [
          {
            kind: 'block',
            type: 'mw_input_choice',
            fields: {
              NAME: 'colour',
              OPTIONS: 'Signal Grey,Jet Black,Pearl White,Safety Yellow,Raw Steel',
              DEFAULT: 'Signal Grey',
            },
          },
          {
            kind: 'block',
            type: 'mw_input_choice',
            fields: {
              NAME: 'grade',
              OPTIONS: 'Mild Steel 250,Mild Steel 350,Stainless 304,Stainless 316,Aluminium 5052,Aluminium 6061',
              DEFAULT: 'Mild Steel 250',
            },
          },
          {
            kind: 'block',
            type: 'mw_input_choice',
            fields: {
              NAME: 'tolerance_class',
              OPTIONS: 'IT11 (general),IT9 (medium),IT7 (precision)',
              DEFAULT: 'IT11 (general)',
            },
          },
          {
            kind: 'block',
            type: 'mw_input_choice',
            fields: {
              NAME: 'surface_roughness',
              OPTIONS: 'Ra 12.5 (rough),Ra 6.3 (machined),Ra 3.2 (smooth),Ra 1.6 (fine)',
              DEFAULT: 'Ra 6.3 (machined)',
            },
          },
          {
            kind: 'block',
            type: 'mw_input_choice',
            fields: {
              NAME: 'weld_class',
              OPTIONS: 'GP (general purpose),SP (structural),AS/NZS 1554.1,AS/NZS 1554.5',
              DEFAULT: 'GP (general purpose)',
            },
          },
        ],
      },
      // ── Generic input authoring blocks ─────────────────────────────────
      {
        kind: 'category',
        name: 'Generic',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-inputs-gen' },
        contents: [
          {
            kind: 'block',
            type: 'mw_input_dimension',
            inputs: { DEFAULT: numShadow(1000) },
          },
          {
            kind: 'block',
            type: 'mw_input_quantity',
            inputs: { DEFAULT: numShadow(1) },
          },
          { kind: 'block', type: 'mw_input_choice' },
          { kind: 'block', type: 'mw_input_toggle' },
          { kind: 'block', type: 'mw_input_percent' },
          { kind: 'block', type: 'mw_input_text' },
          { kind: 'block', type: 'mw_input_angle' },
          { kind: 'block', type: 'mw_input_material' },
          { kind: 'block', type: 'mw_input_finish' },
        ],
      },
    ],
  };

  // Variables — *internal* values the recipe computes or derives, as opposed
  // to Inputs (which become user-facing parameters in the configurator).
  // Pre-seeded with the rates, yields and batch quantities a typical metal-fab
  // quote leans on so the author can drag a labelled starting point and tweak
  // the literal value, instead of typing the name from scratch every time.
  //
  // Nested sub-drawers (5) so the ~19 preset blocks stop scrolling past the
  // fold:
  //   Variables ▸ Rates        — labour/machine/laser/weld/overhead $/hr
  //   Variables ▸ Yields       — scrap %, sheet yield %, kerf/bend allow, rework %
  //   Variables ▸ Batching     — batch_size, units_per_sheet, parts_per_batch, lead_days
  //   Variables ▸ Scratch      — computed holders (unit_weight_kg, cut_length_m, …)
  //   Variables ▸ Generic      — bare set/get authoring blocks
  const variablesCategory: CategoryEntry = {
    kind: 'category',
    name: 'Variables',
    colour: '#FF4DB8',
    cssConfig: { row: 'mw-cat-variables' },
    contents: [
      // ── Rates ($/hr) ────────────────────────────────────────────────────
      {
        kind: 'category',
        name: 'Rates',
        colour: '#FF4DB8',
        cssConfig: { row: 'mw-cat-vars-rates' },
        contents: [
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'labour_rate' },
            inputs: { VALUE: numShadow(95) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'machine_rate' },
            inputs: { VALUE: numShadow(130) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'laser_rate' },
            inputs: { VALUE: numShadow(180) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'weld_rate' },
            inputs: { VALUE: numShadow(110) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'overhead_rate' },
            inputs: { VALUE: numShadow(45) },
          },
        ],
      },
      // ── Yields, scrap, allowances (% as a 0-100 number) ─────────────────
      {
        kind: 'category',
        name: 'Yields',
        colour: '#FF4DB8',
        cssConfig: { row: 'mw-cat-vars-yields' },
        contents: [
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'scrap_pct' },
            inputs: { VALUE: numShadow(15) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'sheet_yield_pct' },
            inputs: { VALUE: numShadow(78) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'kerf_allowance_mm' },
            inputs: { VALUE: numShadow(0.2) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'bend_allowance_mm' },
            inputs: { VALUE: numShadow(2) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'rework_pct' },
            inputs: { VALUE: numShadow(3) },
          },
        ],
      },
      // ── Batch / run sizing ──────────────────────────────────────────────
      {
        kind: 'category',
        name: 'Batching',
        colour: '#FF4DB8',
        cssConfig: { row: 'mw-cat-vars-batch' },
        contents: [
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'batch_size' },
            inputs: { VALUE: numShadow(10) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'units_per_sheet' },
            inputs: { VALUE: numShadow(8) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'parts_per_batch' },
            inputs: { VALUE: numShadow(40) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'lead_days' },
            inputs: { VALUE: numShadow(10) },
          },
        ],
      },
      // ── Working scratch values (derived — wire to an expression) ────────
      {
        kind: 'category',
        name: 'Scratch',
        colour: '#FF4DB8',
        cssConfig: { row: 'mw-cat-vars-scratch' },
        contents: [
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'unit_weight_kg' },
            inputs: { VALUE: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'cut_length_m' },
            inputs: { VALUE: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'weld_length_m' },
            inputs: { VALUE: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'paint_area_m2' },
            inputs: { VALUE: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_set_variable',
            fields: { NAME: 'subtotal' },
            inputs: { VALUE: numShadow(0) },
          },
        ],
      },
      // ── Generic authoring blocks ────────────────────────────────────────
      {
        kind: 'category',
        name: 'Generic',
        colour: '#FF4DB8',
        cssConfig: { row: 'mw-cat-vars-gen' },
        contents: [
          {
            kind: 'block',
            type: 'mw_set_variable',
            inputs: { VALUE: numShadow(0) },
          },
          { kind: 'block', type: 'mw_get_variable' },
        ],
      },
    ],
  };

  const mathCategory: CategoryEntry = {
    kind: 'category',
    name: 'Math',
    colour: '#5FE07F',
    cssConfig: { row: 'mw-cat-math' },
    contents: [
      {
        kind: 'block',
        type: 'mw_arithmetic',
        inputs: { A: numShadow(0), B: numShadow(0) },
      },
      {
        kind: 'block',
        type: 'mw_round',
        inputs: { VALUE: numShadow(0) },
      },
      {
        kind: 'block',
        type: 'mw_min_max',
        inputs: { A: numShadow(0), B: numShadow(0) },
      },
      {
        kind: 'block',
        type: 'mw_percent',
        // PCT is now an inline slider field — no shadow needed.
        inputs: { VALUE: numShadow(100) },
      },
      { kind: 'sep', gap: 8 },
      { kind: 'block', type: 'mw_number' },
      { kind: 'block', type: 'mw_text' },
    ],
  };

  // Logic uses Blockly's built-in `controls_if` block — patched by
  // `@blockly/block-plus-minus` to expose +/- buttons for adding elseif /
  // else branches inline. The generator walks the dynamic IF0/DO0/... inputs
  // at translation time.
  //
  // Shadow wiring: both `controls_if` and the standalone `mw_compare` ship
  // pre-loaded with `<var:length> > <number:1000>` shadows. This is the single
  // most important UX fix for the studio — without it, new users see an empty
  // hexagonal IF socket and have no idea what's allowed to plug in. With it,
  // dragging `if` out of the toolbox already reads "if length > 1000 then …"
  // and the user can immediately swap the variable name in the dropdown,
  // change the operator, or replace either side with a real expression block.
  //
  // Loops:
  //   • controls_repeat_ext — fixed-count repeat. Generator unrolls when the
  //     count is a literal number; for dynamic counts the body runs once and
  //     a warning is emitted to the user.
  //   • controls_whileUntil — condition-based loop. Used for warnings/guards
  //     today; the generator surfaces a "while not yet supported" warning
  //     so authoring is discoverable without a runtime.
  //   • controls_for — counted for-loop with start / end / step. Generator
  //     unrolls when start, end, and step are all literal.
  const logicCategory: CategoryEntry = {
    kind: 'category',
    name: 'Logic',
    colour: '#4D7CFF',
    cssConfig: { row: 'mw-cat-logic' },
    contents: [
      // Plain `if` — single branch, no else. The +/- mutator (added by
      // @blockly/block-plus-minus) lets the user grow it to elseif/else.
      {
        kind: 'block',
        type: 'controls_if',
        inputs: { IF0: compareVarShadow('length', 1000) },
      },
      // Pre-shaped `if / else` — same controls_if block but the mutation
      // state already has `hasElse: true` baked in so the user gets the
      // ELSE branch without having to find the +/- toggle. block-plus-minus
      // stores its mutation under `{ elseIfCount, hasElse }` and Blockly's
      // toolbox JSON loader feeds extraState straight into the block at
      // flyout time.
      {
        kind: 'block',
        type: 'controls_if',
        extraState: { hasElse: true },
        inputs: { IF0: compareVarShadow('length', 1000) },
      },
      // Pre-shaped `if / else if / else` — three-branch ladder for the
      // common "small / medium / large" pattern.
      {
        kind: 'block',
        type: 'controls_if',
        extraState: { elseIfCount: 1, hasElse: true },
        inputs: { IF0: compareVarShadow('length', 1000) },
      },
      { kind: 'sep', gap: 8 },
      {
        kind: 'block',
        type: 'mw_compare',
        inputs: { A: varShadow('length'), B: numShadow(1000) },
      },
      { kind: 'block', type: 'mw_logic_op' },
      { kind: 'block', type: 'mw_boolean' },
      { kind: 'sep', gap: 8 },
      // ── Loops ─────────────────────────────────────────────────────────
      // Built-in `repeat N times` block. The TIMES socket carries a shadow
      // number so authors can drop the count straight in.
      {
        kind: 'block',
        type: 'controls_repeat_ext',
        inputs: { TIMES: numShadow(4) },
      },
      // While / until — condition-based loop. The BOOL socket gets a
      // pre-wired compare shadow so it reads "while length > 1000".
      {
        kind: 'block',
        type: 'controls_whileUntil',
        fields: { MODE: 'WHILE' },
        inputs: { BOOL: compareVarShadow('length', 1000) },
      },
      // Counted for-loop — for i = 1 to 10 step 1. Useful for numbered
      // hole patterns and indexed sub-assemblies.
      {
        kind: 'block',
        type: 'controls_for',
        fields: { VAR: 'i' },
        inputs: {
          FROM: numShadow(1),
          TO: numShadow(10),
          BY: numShadow(1),
        },
      },
    ],
  };

  // Time category — authoring helpers for sub-recipes that talk in seconds /
  // hours / days. Every reporter outputs *minutes* (the canonical IR) so the
  // value can be plugged into any operation's setup or run socket without
  // a manual conversion. The literal block carries an inline unit dropdown.
  const timeCategory: CategoryEntry = {
    kind: 'category',
    name: 'Time',
    colour: '#7B9386',
    cssConfig: { row: 'mw-cat-time' },
    contents: [
      // Most-used: a literal time value with units. AMOUNT/UNIT live in fields.
      {
        kind: 'block',
        type: 'mw_time_literal',
        fields: { AMOUNT: 15, UNIT: 'min' },
      },
      {
        kind: 'block',
        type: 'mw_time_convert',
        fields: { UNIT: 'hr' },
        inputs: { VALUE: numShadow(60) },
      },
      {
        kind: 'block',
        type: 'mw_time_sum',
        inputs: { A: numShadow(15), B: numShadow(30) },
      },
    ],
  };

  // Money (Calculate ▸ Money) — authoring helpers for AUD subtotals. Every
  // reporter outputs an AUD number that can be dropped into a cost-adjust
  // block. The literal block carries an inline `A$` glyph so the recipe reads
  // like the way an Aussie estimator scribbles a margin calculation on paper.
  //
  // Renamed from "Costs" → "Money" to disambiguate from Output ▸ Costs (the
  // statement-level rollup adjustments). Calculate ▸ Money is for *building*
  // a dollar value as an expression; Output ▸ Costs is for *applying* a
  // dollar value to the rollup. Same icon (banknote), different intent.
  const costsCalcCategory: CategoryEntry = {
    kind: 'category',
    name: 'Money',
    colour: '#A68D60',
    cssConfig: { row: 'mw-cat-money' },
    contents: [
      {
        kind: 'block',
        type: 'mw_aud_literal',
        fields: { AMOUNT: 12.5 },
      },
      {
        kind: 'block',
        type: 'mw_cost_per_unit',
        inputs: { QTY: numShadow(10), UNIT_COST: numShadow(2.5) },
      },
      {
        kind: 'block',
        type: 'mw_cost_hourly',
        inputs: { HOURS: numShadow(2), RATE: numShadow(110) },
      },
      {
        kind: 'block',
        type: 'mw_cost_subtotal',
        inputs: { A: numShadow(50), B: numShadow(25) },
      },
    ],
  };

  // Actions — ERP side-effect blocks. Statement blocks (no value output) so
  // the user stacks them under a hat (or an If branch) to fire when the
  // recipe runs. The studio surfaces them in the Actions tab as
  // "would create…" cards.
  //
  // Phase 3b: grouped into business-function sub-drawers so the 19-action
  // vocabulary stays scannable. Each sub-drawer corresponds to an ERP
  // module the customer already thinks in (Sell / Plan / Production / Buy /
  // Stock / People / Integrate). Flat-list mode previously had 4 actions and
  // fit on one screen; with 19 it would scroll past the fold.
  const actionsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Actions',
    colour: '#9B4DFF',
    cssConfig: { row: 'mw-cat-actions' },
    contents: [
      {
        kind: 'category',
        name: 'Sell',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-sell' },
        contents: [
          {
            kind: 'block',
            type: 'mw_action_create_quote',
            inputs: { QTY: numShadow(1) },
          },
          {
            kind: 'block',
            type: 'mw_action_create_sales_order',
            inputs: { QTY: numShadow(1) },
          },
          { kind: 'block', type: 'mw_action_create_invoice' },
        ],
      },
      {
        kind: 'category',
        name: 'Plan',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-plan' },
        contents: [
          {
            kind: 'block',
            type: 'mw_action_create_plan_activity',
            inputs: { DURATION_MIN: numShadow(60) },
          },
          {
            kind: 'block',
            type: 'mw_action_reserve_capacity',
            inputs: { DURATION_MIN: numShadow(60) },
          },
          { kind: 'block', type: 'mw_action_push_nc_program' },
        ],
      },
      {
        kind: 'category',
        name: 'Production',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-prod' },
        contents: [
          {
            kind: 'block',
            type: 'mw_action_create_mo',
            inputs: { QTY: numShadow(1) },
          },
          {
            kind: 'block',
            type: 'mw_action_create_work_order',
            inputs: { QTY: numShadow(1) },
          },
          { kind: 'block', type: 'mw_action_record_qc' },
          { kind: 'block', type: 'mw_action_clock_on' },
        ],
      },
      {
        kind: 'category',
        name: 'Buy',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-buy' },
        contents: [
          {
            kind: 'block',
            type: 'mw_action_create_purchase_request',
            inputs: { QTY: numShadow(1) },
          },
          {
            kind: 'block',
            type: 'mw_action_create_po',
            inputs: { QTY: numShadow(1) },
          },
          {
            kind: 'block',
            type: 'mw_action_reserve_stock',
            inputs: { QTY: numShadow(1) },
          },
        ],
      },
      {
        kind: 'category',
        name: 'Stock',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-stock' },
        contents: [
          {
            kind: 'block',
            type: 'mw_action_stock_adjust',
            inputs: { QTY: numShadow(1) },
          },
        ],
      },
      {
        kind: 'category',
        name: 'People',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-people' },
        contents: [
          { kind: 'block', type: 'mw_action_send_alert' },
          { kind: 'block', type: 'mw_action_create_task' },
          { kind: 'block', type: 'mw_action_send_sms' },
        ],
      },
      {
        kind: 'category',
        name: 'Integrate',
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-act-int' },
        contents: [
          { kind: 'block', type: 'mw_action_webhook' },
          { kind: 'block', type: 'mw_action_push_accounting' },
        ],
      },
    ],
  };

  const geometryCategory: CategoryEntry = {
    kind: 'category',
    name: 'Geometry',
    colour: '#4DDDC9',
    cssConfig: { row: 'mw-cat-geometry' },
    contents: [
      {
        kind: 'block',
        type: 'mw_geom_area_rect',
        inputs: { L: numShadow(1000), W: numShadow(500) },
      },
      {
        kind: 'block',
        type: 'mw_geom_perimeter_rect',
        inputs: { L: numShadow(1000), W: numShadow(500) },
      },
      {
        kind: 'block',
        type: 'mw_geom_volume_box',
        inputs: {
          L: numShadow(1000),
          W: numShadow(500),
          H: numShadow(50),
        },
      },
      {
        kind: 'block',
        type: 'mw_geom_weight',
        inputs: { VOLUME: numShadow(500000), DENSITY: numShadow(7.85) },
      },
      {
        kind: 'block',
        type: 'mw_geom_sheet_area',
        inputs: { AREA: numShadow(0.5), SCRAP: numShadow(15) },
      },
    ],
  };

  const materialsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Materials',
    colour: '#FF944D',
    cssConfig: { row: 'mw-cat-materials' },
    contents:
      opts.materials.length > 0
        ? opts.materials.map(materialChip)
        : [{ kind: 'block', type: 'mw_text' }], // empty-state placeholder
  };

  const cuttingCategory: CategoryEntry = {
    kind: 'category',
    name: 'Cutting',
    colour: '#4D7CFF',
    cssConfig: { row: 'mw-cat-cutting' },
    contents: [
      {
        kind: 'block',
        type: 'mw_op_laser_cut',
        inputs: {
          PERIMETER: numShadow(2000),
          PIERCES: numShadow(4),
          CUT_RATE: numShadow(4500),
        },
      },
      {
        kind: 'block',
        type: 'mw_op_plasma_cut',
        inputs: {
          PERIMETER: numShadow(2000),
          PIERCES: numShadow(4),
          CUT_RATE: numShadow(2500),
        },
      },
      {
        kind: 'block',
        type: 'mw_op_waterjet',
        inputs: {
          PERIMETER: numShadow(2000),
          PIERCES: numShadow(4),
          CUT_RATE: numShadow(800),
        },
      },
      {
        kind: 'block',
        type: 'mw_op_shear',
        inputs: { COUNT: numShadow(6), SEC_PER: numShadow(8) },
      },
      {
        kind: 'block',
        type: 'mw_op_punch',
        inputs: { COUNT: numShadow(20), SEC_PER: numShadow(2) },
      },
      {
        kind: 'block',
        type: 'mw_op_drill',
        inputs: { COUNT: numShadow(8), SEC_PER: numShadow(6) },
      },
      {
        kind: 'block',
        type: 'mw_op_tap',
        inputs: { COUNT: numShadow(4), SEC_PER: numShadow(15) },
      },
      {
        kind: 'block',
        type: 'mw_op_countersink',
        inputs: { COUNT: numShadow(8), SEC_PER: numShadow(8) },
      },
      {
        kind: 'block',
        type: 'mw_op_ream',
        inputs: { COUNT: numShadow(4), SEC_PER: numShadow(20) },
      },
      { kind: 'sep', gap: 8 },
      // Machining — explicit setup vs run minutes since CNC jobs are setup-bound.
      {
        kind: 'block',
        type: 'mw_op_mill',
        inputs: { SETUP: numShadow(20), RUN: numShadow(6) },
      },
      {
        kind: 'block',
        type: 'mw_op_lathe',
        inputs: { SETUP: numShadow(15), RUN: numShadow(4) },
      },
      {
        kind: 'block',
        type: 'mw_op_edm',
        inputs: { LENGTH_MM: numShadow(500), SEC_PER_MM: numShadow(6) },
      },
      {
        kind: 'block',
        type: 'mw_op_engrave',
        inputs: { SECONDS: numShadow(20) },
      },
    ],
  };

  const formingCategory: CategoryEntry = {
    kind: 'category',
    name: 'Forming',
    colour: '#9B4DFF',
    cssConfig: { row: 'mw-cat-forming' },
    contents: [
      {
        kind: 'block',
        type: 'mw_op_bend',
        inputs: { COUNT: numShadow(4), SEC_PER: numShadow(20) },
      },
      {
        kind: 'block',
        type: 'mw_op_roll',
        inputs: { LENGTH_MM: numShadow(1500), SEC_PER_MM: numShadow(0.4) },
      },
    ],
  };

  const weldingCategory: CategoryEntry = {
    kind: 'category',
    name: 'Welding',
    colour: '#FF584D',
    cssConfig: { row: 'mw-cat-welding' },
    contents: [
      {
        kind: 'block',
        type: 'mw_op_weld',
        inputs: {
          LENGTH_MM: numShadow(500),
          SEC_PER_MM: numShadow(1.5),
        },
      },
      {
        kind: 'block',
        type: 'mw_op_tack_weld',
        inputs: { COUNT: numShadow(8), SEC_PER: numShadow(6) },
      },
      {
        kind: 'block',
        type: 'mw_op_spot_weld',
        inputs: { COUNT: numShadow(20), SEC_PER: numShadow(3) },
      },
    ],
  };

  const finishesCategory: CategoryEntry = {
    kind: 'category',
    name: 'Finishes',
    colour: '#FF4D7C',
    cssConfig: { row: 'mw-cat-finishes' },
    contents: [
      // Surface-prep operations live here so the user finds grind / sandblast
      // alongside the finish chips they apply afterwards.
      {
        kind: 'block',
        type: 'mw_op_grind',
        inputs: { LENGTH_MM: numShadow(500), SEC_PER_MM: numShadow(0.3) },
      },
      {
        kind: 'block',
        type: 'mw_op_deburr',
        inputs: { LENGTH_MM: numShadow(500), SEC_PER_MM: numShadow(0.2) },
      },
      {
        kind: 'block',
        type: 'mw_op_sandblast',
        inputs: { AREA: numShadow(1), SEC_PER_M2: numShadow(180) },
      },
      {
        kind: 'block',
        type: 'mw_op_bead_blast',
        inputs: { AREA: numShadow(1), SEC_PER_M2: numShadow(120) },
      },
      {
        kind: 'block',
        type: 'mw_op_polish',
        inputs: { AREA: numShadow(0.5), SEC_PER_M2: numShadow(240) },
      },
      {
        kind: 'block',
        type: 'mw_op_tumble',
        inputs: { CYCLE_MIN: numShadow(45) },
      },
      { kind: 'sep', gap: 8 },
      // Coating + heat treatment as scheduled operations.
      {
        kind: 'block',
        type: 'mw_op_powder_coat',
        inputs: { AREA: numShadow(1), MIN_PER_M2: numShadow(8) },
      },
      {
        kind: 'block',
        type: 'mw_op_anodise',
        inputs: { AREA: numShadow(1), MIN_PER_M2: numShadow(12) },
      },
      {
        kind: 'block',
        type: 'mw_op_heat_treat',
        fields: { PROCESS: 'ANNEAL' },
        inputs: { HOURS: numShadow(2) },
      },
      { kind: 'sep', gap: 8 },
      // Finish chips from the library — fall back to a stub when empty so the
      // category isn't visually empty on first run.
      ...(opts.finishes.length > 0
        ? opts.finishes.map(finishChip)
        : ([{ kind: 'block', type: 'mw_text' }] as BlockEntry[])),
    ],
  };

  const assemblyCategory: CategoryEntry = {
    kind: 'category',
    name: 'Assembly',
    colour: '#A68D60',
    cssConfig: { row: 'mw-cat-assembly' },
    contents: [
      {
        kind: 'block',
        type: 'mw_op_kit',
        inputs: { LINES: numShadow(8), SEC_PER: numShadow(20) },
      },
      {
        kind: 'block',
        type: 'mw_op_fastener',
        inputs: { COUNT: numShadow(8), UNIT_COST: numShadow(0.35) },
      },
      {
        kind: 'block',
        type: 'mw_op_assemble',
        inputs: { MIN: numShadow(15) },
      },
      { kind: 'sep', gap: 8 },
      // Quality control — flat first-article + dimensional pass per part.
      {
        kind: 'block',
        type: 'mw_op_qc_first_article',
        inputs: { MIN: numShadow(20) },
      },
      {
        kind: 'block',
        type: 'mw_op_qc_dimensional',
        inputs: { CHECKS: numShadow(5), SEC_PER: numShadow(15) },
      },
      {
        kind: 'block',
        type: 'mw_op_inspect',
        inputs: { MIN: numShadow(5) },
      },
      { kind: 'sep', gap: 8 },
      {
        kind: 'block',
        type: 'mw_op_pack',
        inputs: { MIN: numShadow(3) },
      },
      {
        kind: 'block',
        type: 'mw_op_palletise',
        inputs: { PALLETS: numShadow(1), MIN_PER: numShadow(8) },
      },
    ],
  };

  // Sub-products (parent→child assembly refs) — `mw_product_ref` is a dropdown
  // reporter that lists every published product. Pair it with `mw_op_assemble_with`
  // (which takes a Product value + multiplier) to drop a real sub-assembly into
  // the current recipe and roll its BOM/ops/cost up automatically.
  //
  // Renamed from "Products" → "Sub-products" so it reads correctly inside the
  // new Assemble supercategory: the drawer is specifically about dropping a
  // *smaller* product into a *bigger* one.
  const subProductsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Sub-products',
    colour: '#4DDDC9',
    cssConfig: { row: 'mw-cat-subproducts-ref' },
    contents: [
      { kind: 'block', type: 'mw_product_ref' },
      {
        kind: 'block',
        type: 'mw_op_assemble_with',
        inputs: { QTY: numShadow(1) },
      },
    ],
  };

  // Operations — generic catch-all line items that don't have a strongly-typed
  // counterpart in Build. Pre-seeded with the metal-fab work that lives
  // *between* the cutting/forming/welding ops a quote is built from:
  // engineering, programming, tool changes, material handling, outsourced
  // processes, logistics. Each entry pre-fills NAME, WORK_CENTRE and the
  // setup/run defaults so the user can drag a sensible starting point and
  // tweak rather than typing from scratch.
  //
  // Nested sub-drawers (5) so the 18-block list stops scrolling past the fold:
  //   Operations ▸ Engineering — review, CAM, nesting, tool change
  //   Operations ▸ Handling    — load, forklift, receiving, line clearance
  //   Operations ▸ Outsourced  — galv, zinc, electropolish, heat treat, NDT
  //   Operations ▸ QA          — first-off, final, documentation, crate, freight
  //   Operations ▸ Generic     — the freeform `mw_operation` factory
  const operationsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Operations',
    colour: '#8FA6A6',
    cssConfig: { row: 'mw-cat-operations' },
    contents: [
      // ── Engineering / programming (setup-bound, no per-unit run) ─────────
      {
        kind: 'category',
        name: 'Engineering',
        colour: '#8FA6A6',
        cssConfig: { row: 'mw-cat-ops-eng' },
        contents: [
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Engineering review', WORK_CENTRE: 'ASSY' },
            inputs: { SETUP: numShadow(20), RUN: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'CAM programming', WORK_CENTRE: 'MILL' },
            inputs: { SETUP: numShadow(30), RUN: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Sheet nesting', WORK_CENTRE: 'LASER' },
            inputs: { SETUP: numShadow(10), RUN: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Tool change', WORK_CENTRE: 'MILL' },
            inputs: { SETUP: numShadow(15), RUN: numShadow(0) },
          },
        ],
      },
      // ── Material handling ────────────────────────────────────────────────
      {
        kind: 'category',
        name: 'Handling',
        colour: '#8FA6A6',
        cssConfig: { row: 'mw-cat-ops-handling' },
        contents: [
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Material loading', WORK_CENTRE: 'LASER' },
            inputs: { SETUP: numShadow(5), RUN: numShadow(0.5) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Forklift transfer', WORK_CENTRE: 'PACK' },
            inputs: { SETUP: numShadow(0), RUN: numShadow(2) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Goods receiving', WORK_CENTRE: 'ASSY' },
            inputs: { SETUP: numShadow(10), RUN: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Line clearance', WORK_CENTRE: 'ASSY' },
            inputs: { SETUP: numShadow(10), RUN: numShadow(0) },
          },
        ],
      },
      // ── Outsourced processes ─────────────────────────────────────────────
      // These run at an external supplier — the SETUP minute slug stands in
      // for the kit / dispatch overhead, RUN minutes per unit captures the
      // hand-off + receive-back cycle. Cost is then captured separately
      // through Costs ▸ Adjust if the supplier invoice is known.
      {
        kind: 'category',
        name: 'Outsourced',
        colour: '#8FA6A6',
        cssConfig: { row: 'mw-cat-ops-out' },
        contents: [
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Outsource: Hot-dip galv', WORK_CENTRE: 'COAT' },
            inputs: { SETUP: numShadow(60), RUN: numShadow(1) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Outsource: Zinc plate', WORK_CENTRE: 'COAT' },
            inputs: { SETUP: numShadow(30), RUN: numShadow(0.5) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Outsource: Electropolish', WORK_CENTRE: 'FINISH' },
            inputs: { SETUP: numShadow(45), RUN: numShadow(1) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Outsource: Heat treat', WORK_CENTRE: 'HEAT' },
            inputs: { SETUP: numShadow(30), RUN: numShadow(4) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Outsource: NDT (X-ray / UT)', WORK_CENTRE: 'QC' },
            inputs: { SETUP: numShadow(20), RUN: numShadow(2) },
          },
        ],
      },
      // ── QA + dispatch ────────────────────────────────────────────────────
      {
        kind: 'category',
        name: 'QA & Dispatch',
        colour: '#8FA6A6',
        cssConfig: { row: 'mw-cat-ops-qa' },
        contents: [
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'First-off check', WORK_CENTRE: 'QC' },
            inputs: { SETUP: numShadow(15), RUN: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Final inspection', WORK_CENTRE: 'QC' },
            inputs: { SETUP: numShadow(5), RUN: numShadow(3) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Documentation / certs', WORK_CENTRE: 'QC' },
            inputs: { SETUP: numShadow(15), RUN: numShadow(0) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Crate / strap', WORK_CENTRE: 'PACK' },
            inputs: { SETUP: numShadow(10), RUN: numShadow(5) },
          },
          {
            kind: 'block',
            type: 'mw_operation',
            fields: { NAME: 'Freight prep', WORK_CENTRE: 'PACK' },
            inputs: { SETUP: numShadow(5), RUN: numShadow(2) },
          },
        ],
      },
      // ── Generic authoring block ─────────────────────────────────────────
      // Falls through to the freeform `mw_operation` for anything the
      // pre-seeds don't cover.
      {
        kind: 'category',
        name: 'Generic',
        colour: '#8FA6A6',
        cssConfig: { row: 'mw-cat-ops-gen' },
        contents: [
          {
            kind: 'block',
            type: 'mw_operation',
            inputs: { SETUP: numShadow(5), RUN: numShadow(2) },
          },
        ],
      },
    ],
  };

  const costsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Costs',
    colour: '#A68D60',
    cssConfig: { row: 'mw-cat-costs' },
    contents: [
      {
        kind: 'block',
        type: 'mw_cost_adjust',
        inputs: { AMOUNT: numShadow(50) },
      },
      // PCT is an inline slider field on these blocks — no shadow needed.
      { kind: 'block', type: 'mw_cost_overhead_pct' },
      { kind: 'block', type: 'mw_cost_margin_pct' },
    ],
  };

  const outputCategory: CategoryEntry = {
    kind: 'category',
    name: 'Output',
    colour: '#1A2732',
    cssConfig: { row: 'mw-cat-output' },
    contents: [
      {
        kind: 'block',
        type: 'mw_add_bom_line',
        inputs: { QTY: numShadow(1) },
      },
      {
        kind: 'block',
        type: 'mw_add_material_bom',
        inputs: { QTY: numShadow(1) },
      },
      {
        kind: 'block',
        type: 'mw_apply_finish',
        inputs: { AREA: numShadow(0.5) },
      },
      { kind: 'block', type: 'mw_show_warning' },
    ],
  };

  // ── 6 super-categories ───────────────────────────────────────────────────
  // Toolbox is reorganised by *intent*, not by colour family. Each super-row
  // names a distinct stage of the quote→make→ship pipeline:
  //   ① Setup     — declare what the recipe needs (triggers, inputs, vars)
  //   ② Calculate — pure functions for working things out (math, logic, geom)
  //   ③ Make      — physical operations on the primary product (cut/form/weld/finish/ops)
  //   ④ Assemble  — compose the product from smaller products + assembly ops (kit/fastener/QC/pack)
  //   ⑤ Actions   — side-effects emitted to the outside world (create WO, alert, …)
  //   ⑥ Output    — what falls out the bottom (BOM, costs, warnings)
  //
  // "Sub-products" was retired as a supercategory — operations and actions
  // never belonged under it. Build → Make renames the supercategory to the
  // verb the author uses when talking about production. Assemble is the new
  // compose bucket: "take a bracket (another product) and stick it onto this
  // frame, then run the assembly line ops". Actions is promoted to a
  // top-level supercategory because it represents system-level side-effects,
  // not manufacturing steps, and deserves equal billing with Make.
  //
  // Leaf colours stay identical so muscle memory survives — only the
  // *grouping* changes.
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Setup',
        // MW Yellow — same hue as the Recipe leaf so the Setup super-row reads
        // as the brand-coloured "front door" of the studio. Recipe is the
        // first thing inside it, so the colours line up.
        colour: '#FFCF4B',
        cssConfig: { row: 'mw-cat-setup' },
        contents: [triggersCategory, inputsCategory, variablesCategory],
      },
      {
        kind: 'category',
        name: 'Calculate',
        // Success green — Calculate is the "pure functions" bucket and green
        // matches the Math leaf inside it.
        colour: '#5FE07F',
        cssConfig: { row: 'mw-cat-calculate' },
        contents: [
          mathCategory,
          logicCategory,
          geometryCategory,
          timeCategory,
          costsCalcCategory,
        ],
      },
      {
        kind: 'category',
        name: 'Make',
        // Graph 1 orange — "do physical things to metal" bucket. Absorbs the
        // old Build supercategory (Materials/Cutting/Forming/Welding/Finishes)
        // plus the freeform Operations drawer.
        colour: '#FF944D',
        cssConfig: { row: 'mw-cat-make' },
        contents: [
          materialsCategory,
          cuttingCategory,
          formingCategory,
          weldingCategory,
          finishesCategory,
          operationsCategory,
        ],
      },
      {
        kind: 'category',
        name: 'Assemble',
        // Graph 4 teal — compose-and-join bucket. Holds the sub-product refs
        // (drop another product in as a sub-assembly) and the assembly-line
        // ops (kit/fastener/assemble/QC/pack/palletise).
        colour: '#4DDDC9',
        cssConfig: { row: 'mw-cat-assemble' },
        contents: [subProductsCategory, assemblyCategory],
      },
      {
        kind: 'category',
        name: 'Actions',
        // Action purple — side-effects that fire when the recipe runs. Flat
        // in Pass 1 (the 4 existing action blocks); Pass 3 nests them under
        // business-function sub-drawers (Sell/Plan/Production/Buy/Stock/People/Integrate).
        colour: '#9B4DFF',
        cssConfig: { row: 'mw-cat-actions-group' },
        contents: [actionsCategory],
      },
      {
        kind: 'category',
        name: 'Output',
        // MW Mirage — the dark brand colour, used for the "what falls out the
        // bottom" bucket so the rollups read as the *result* of the recipe.
        colour: '#1A2732',
        cssConfig: { row: 'mw-cat-output-group' },
        contents: [outputCategory, costsCategory],
      },
    ],
  };
}
