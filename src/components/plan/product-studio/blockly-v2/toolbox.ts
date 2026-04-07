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
      { kind: 'block', type: 'mw_when_pricing' },
      { kind: 'block', type: 'mw_when_making' },
      { kind: 'sep', gap: 8 },
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
  // The first batch are *preconfigured* `mw_input_dimension` /
  // `mw_input_quantity` blocks — same block type, different default NAME and
  // UNIT fields baked in via the toolbox JSON `fields` map. These are the
  // five variables almost every sheet-metal recipe will reach for (length,
  // width, thickness, pitch, mass) so a new user can drag them out as named
  // chips instead of having to know to rename a generic "length" placeholder.
  // After the presets we keep the generic input blocks so the long tail of
  // less-common parameters (choice, toggle, percent, text, angle, material,
  // finish) is still one drag away.
  const inputsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Inputs',
    colour: '#9B4DFF',
    cssConfig: { row: 'mw-cat-inputs' },
    contents: [
      // ── Metal manufacturing presets ────────────────────────────────────
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
        fields: { NAME: 'thickness', UNIT: 'mm' },
        inputs: { DEFAULT: numShadow(2) },
      },
      {
        kind: 'block',
        type: 'mw_input_dimension',
        fields: { NAME: 'pitch', UNIT: 'mm' },
        inputs: { DEFAULT: numShadow(100) },
      },
      // Mass lives on `mw_input_quantity` rather than dimension because the
      // dimension UNIT dropdown is mm/cm/m/in only — kg doesn't fit. Quantity
      // accepts any positive number which is the right shape for mass too.
      {
        kind: 'block',
        type: 'mw_input_quantity',
        fields: { NAME: 'mass_kg' },
        inputs: { DEFAULT: numShadow(10) },
      },
      { kind: 'sep', gap: 8 },
      // ── Generic input authoring blocks ─────────────────────────────────
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
  };

  const variablesCategory: CategoryEntry = {
    kind: 'category',
    name: 'Variables',
    colour: '#FF4DB8',
    cssConfig: { row: 'mw-cat-variables' },
    contents: [
      {
        kind: 'block',
        type: 'mw_set_variable',
        inputs: { VALUE: numShadow(0) },
      },
      { kind: 'block', type: 'mw_get_variable' },
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
  const logicCategory: CategoryEntry = {
    kind: 'category',
    name: 'Logic',
    colour: '#4D7CFF',
    cssConfig: { row: 'mw-cat-logic' },
    contents: [
      {
        kind: 'block',
        type: 'controls_if',
        inputs: { IF0: compareVarShadow('length', 1000) },
      },
      {
        kind: 'block',
        type: 'mw_compare',
        inputs: { A: varShadow('length'), B: numShadow(1000) },
      },
      { kind: 'block', type: 'mw_logic_op' },
      { kind: 'block', type: 'mw_boolean' },
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
  // the user stacks them under an If branch to fire when a condition trips.
  // The studio surfaces them in the Actions tab as "would create…" cards.
  const actionsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Actions',
    colour: '#9B4DFF',
    cssConfig: { row: 'mw-cat-actions' },
    contents: [
      {
        kind: 'block',
        type: 'mw_action_create_work_order',
        inputs: { QTY: numShadow(1) },
      },
      {
        kind: 'block',
        type: 'mw_action_create_plan_activity',
        inputs: { DURATION_MIN: numShadow(60) },
      },
      { kind: 'block', type: 'mw_action_send_alert' },
      {
        kind: 'block',
        type: 'mw_action_create_purchase_request',
        inputs: { QTY: numShadow(1) },
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
        type: 'mw_op_sandblast',
        inputs: { AREA: numShadow(1), SEC_PER_M2: numShadow(180) },
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
        type: 'mw_op_fastener',
        inputs: { COUNT: numShadow(8), UNIT_COST: numShadow(0.35) },
      },
      {
        kind: 'block',
        type: 'mw_op_assemble',
        inputs: { MIN: numShadow(15) },
      },
      {
        kind: 'block',
        type: 'mw_op_inspect',
        inputs: { MIN: numShadow(5) },
      },
      {
        kind: 'block',
        type: 'mw_op_pack',
        inputs: { MIN: numShadow(3) },
      },
    ],
  };

  // Products (sub-assemblies) — `mw_product_ref` is a dropdown reporter that
  // lists every published product. Pair it with `mw_op_assemble_with` (which
  // takes a Product value + multiplier) to drop a real sub-assembly into the
  // current recipe and roll its BOM/ops/cost up automatically.
  const productsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Products',
    colour: '#4DDDC9',
    cssConfig: { row: 'mw-cat-products' },
    contents: [
      { kind: 'block', type: 'mw_product_ref' },
      {
        kind: 'block',
        type: 'mw_op_assemble_with',
        inputs: { QTY: numShadow(1) },
      },
    ],
  };

  const operationsCategory: CategoryEntry = {
    kind: 'category',
    name: 'Operations',
    colour: '#8FA6A6',
    cssConfig: { row: 'mw-cat-operations' },
    contents: [
      {
        kind: 'block',
        type: 'mw_operation',
        inputs: { SETUP: numShadow(5), RUN: numShadow(2) },
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

  // ── 5 super-categories ───────────────────────────────────────────────────
  // Toolbox is reorganised by *intent*, not by colour family. The 16 leaves
  // map onto 5 high-level groups that mirror the way a quote actually flows:
  //   ① Setup     — declare what the recipe needs (triggers, inputs, vars)
  //   ② Calculate — pure functions for working things out (math, logic, geom)
  //   ③ Build     — physical operations on materials (cut, form, weld, etc)
  //   ④ Compose   — drop other products in as sub-assemblies
  //   ⑤ Output    — what falls out the bottom (BOM, costs, warnings)
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
        // Products is *no longer* a sibling of Recipe in Setup — its blocks
        // (`mw_product_ref`, `mw_op_assemble_with`) are now folded directly
        // into the Recipe leaf so the most-used recipe entry points live one
        // click deep, not two. The `productsCategory` reference still lives
        // under Sub-products ▸ Products for the "compose another product"
        // flow, so nothing has been removed — just reorganised.
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
        name: 'Build',
        // Graph 1 orange — Build is the "do physical things to metal" bucket
        // and orange matches the Materials leaf inside it.
        colour: '#FF944D',
        cssConfig: { row: 'mw-cat-build' },
        contents: [
          materialsCategory,
          cuttingCategory,
          formingCategory,
          weldingCategory,
          finishesCategory,
          assemblyCategory,
        ],
      },
      {
        kind: 'category',
        name: 'Sub-products',
        // Graph 4 teal — matches the Products leaf inside it.
        colour: '#4DDDC9',
        cssConfig: { row: 'mw-cat-subproducts' },
        contents: [productsCategory, operationsCategory, actionsCategory],
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
