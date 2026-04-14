/**
 * Product Studio v2 — full Blockly block library.
 *
 * One block per concept in the spec, organised by toolbox category.
 * Each block is intentionally tiny — the colours/shapes do the explaining,
 * and the generator (`./generator.ts`) translates each `block.type` into the
 * canonical `EngineBlock` shape consumed by `evaluateDefinitionEngine`.
 *
 * Categories (colour hue):
 *   - Triggers     45  yellow   (hat blocks)
 *   - Inputs       290 magenta  (typed parameters from the configurator)
 *   - Variables    260 purple   (reporters + setters)
 *   - Math         120 green    (pure functions)
 *   - Logic        210 blue     (if / compare / boolean)
 *   - Geometry     160 teal-grn (shape calculators)
 *   - Materials    30  orange   (material refs — dynamic, see toolbox)
 *   - Cutting      195 cyan     (laser, drill, tap, punch)
 *   - Forming      230 indigo   (bend, roll, form)
 *   - Welding      350 magenta  (weld, braze)
 *   - Finishes     330 pink     (finish refs — dynamic, see toolbox)
 *   - Assembly     50  amber    (fasteners, fitting)
 *   - Costs        15  red      (cost adjustments)
 *   - Output       0   grey/red (BOM lines, warnings)
 *
 * Direct typing: numeric value sockets are paired with shadow `mw_number`
 * blocks via the toolbox JSON (`./toolbox.ts`) so the user can type values
 * inline without dragging a number block first.
 */

import * as Blockly from 'blockly/core';
// English message catalogue — without this, built-in blocks like `controls_if`
// render as raw `%{BKY_CONTROLS_IF_MSG_IF}` placeholders because Blockly looks
// up labels via `Blockly.Msg.<KEY>` at block-init time. The package exports a
// flat object of key→string pairs that we hand to `setLocale` once at module
// load — every workspace created afterwards inherits the catalogue.
import * as BlocklyEn from 'blockly/msg/en';
import { FieldSlider } from '@blockly/field-slider';
import { FieldGridDropdown } from '@blockly/field-grid-dropdown';
// Side-effect import: registers the if/elseif/else mutator on Blockly's
// `controls_if` block (and its sibling text/list/maths blocks). We use it
// below for the `mw_if` block via setMutator inheritance.
import '@blockly/block-plus-minus';
// Read-time access to the product library so the `mw_product_ref` dropdown can
// list real published products. We touch the store via `getState()` from inside
// the dropdown's menu generator so a stale module-load snapshot never freezes
// the choices — every time the user opens the menu they see the current list.
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { useMaterialLibraryStore } from '@/store/materialLibraryStore';
// Cross-module product catalogue. The 10 mock products in `@/services/mock`
// are the company-wide parts list shared by Sell / Buy / Make / Plan / Ship
// (mounting brackets, base plates, motor housings, server rack chassis…). The
// product-ref dropdown merges these with whatever's been authored in the
// in-studio product builder so a recipe can reference *any* product the rest
// of the platform already knows about — not just ones that were created in
// the studio. When Supabase is wired up this becomes a single query, but for
// now both sources need to be unioned client-side.
import { products as mockCatalogueProducts } from '@/services';

// Install the English message catalogue immediately at module load so it's in
// place before any workspace is injected (and before block-plus-minus's patched
// `controls_if` tries to look up its IF / THEN / ELSE labels).
Blockly.setLocale(BlocklyEn as unknown as { [key: string]: string });

// ── FieldVariableDropdown ────────────────────────────────────────────────────
//
// Dropdown that lists every variable currently visible on the workspace —
// both *declared inputs* (any `mw_input_*` block, surfaced as a configurator
// parameter) and *derived variables* (every `mw_set_variable` block, the
// recipe's internal scratch values). Eliminates the entire "I typed `widt`
// instead of `width`" class of bugs by removing the typing entirely.
//
// We extend `FieldDropdown` and pass a *menu generator function* (not a static
// array) so the option list refreshes every time the user opens the menu —
// newly-added inputs / set-vars show up immediately, renames take effect on
// next open. The generator walks `this.sourceBlock_.workspace` to find sibling
// blocks rather than calling out to `extractInputs()` directly so the field
// stays decoupled from the generator module (avoids a circular import).
//
// Behaviour when nothing is declared: the dropdown still has to render at
// least one option (Blockly throws if you give it an empty array), so we
// surface a sentinel `(no inputs declared)` row that round-trips losslessly
// through XML — the evaluator's `vars` lookup will simply miss and fall back
// to 0.
const INPUT_BLOCK_TYPES = new Set([
  'mw_input_dimension',
  'mw_input_quantity',
  'mw_input_choice',
  'mw_input_toggle',
  'mw_input_percent',
  'mw_input_text',
  'mw_input_angle',
  'mw_input_material',
  'mw_input_finish',
]);

/** Walk a workspace and return [name, name] tuples for every variable name
 *  reachable on the canvas — `mw_input_*` declarations *and* every
 *  `mw_set_variable` NAME. Inputs come first (configurator parameters),
 *  derived set-vars come second; insertion order is preserved so duplicate
 *  names render once at their first appearance. */
function listWorkspaceInputNames(
  workspace: Blockly.Workspace | null,
): { names: string[]; seen: Set<string> } {
  const seen = new Set<string>();
  const names: string[] = [];
  if (!workspace) return { names, seen };
  // Pass 1 — declared inputs (configurator parameters).
  for (const b of workspace.getAllBlocks(true)) {
    if (!INPUT_BLOCK_TYPES.has(b.type)) continue;
    const name = String(b.getFieldValue('NAME') ?? '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  // Pass 2 — derived `mw_set_variable` names. A name that already showed up as
  // an input is skipped so the option list stays unique.
  for (const b of workspace.getAllBlocks(true)) {
    if (b.type !== 'mw_set_variable') continue;
    const name = String(b.getFieldValue('NAME') ?? '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return { names, seen };
}

class FieldVariableDropdown extends Blockly.FieldDropdown {
  /** Last-known persisted value, surfaced into the option list so Blockly's
   *  validator never rejects a name that isn't yet declared on the canvas
   *  (e.g. during XML deserialisation, where the get-var block deserialises
   *  before the input block it points at). */
  private pendingValue: string | null = null;

  constructor(initialValue?: string) {
    // We need `this` inside the menu generator but the class isn't fully
    // constructed at `super()` time. The trick: Blockly calls the generator
    // *bound to the field instance*, and we read the bound `this` at call
    // time via a regular function expression. We type the parameter as
    // `FieldDropdown` (the public base) and downcast inside.
    super(function (this: Blockly.FieldDropdown): [string, string][] {
      const self = this as FieldVariableDropdown;
      const block = self.getSourceBlock();
      const { names, seen } = listWorkspaceInputNames(block?.workspace ?? null);
      const out: [string, string][] = names.map((n) => [n, n]);
      // Make sure the persisted value is always present in the options so the
      // dropdown can render it even if the matching input was deleted (or
      // hasn't been deserialised yet). We surface it as a plain row — no
      // "(unbound)" suffix because the visible label IS what gets persisted
      // through XML, and a tagged label causes Blockly to round-trip the tag
      // text into the next save.
      if (self.pendingValue && !seen.has(self.pendingValue)) {
        out.push([self.pendingValue, self.pendingValue]);
      }
      if (out.length === 0) {
        return [['(no inputs declared)', '__none__']];
      }
      return out;
    });
    if (initialValue !== undefined) {
      this.pendingValue = initialValue;
      this.setValue(initialValue);
    }
  }

  /**
   * Override Blockly's class-level validator so we *never* reject a value —
   * the source-of-truth is the field's persisted name, not the live option
   * set. Returning the value verbatim makes setValue() always succeed even
   * when the named input isn't on the canvas yet.
   */
  protected override doClassValidation_(newValue?: string): string | null {
    if (newValue === undefined || newValue === null) return null;
    this.pendingValue = String(newValue);
    return String(newValue);
  }
}

// Register the field so workspace XML deserialisation can find it under the
// canonical key `field_variable_dropdown`. Custom blocks below use the class
// constructor directly (no need to ship a JSON-init field type), but the
// registration is required for round-tripping persisted XML across reloads
// since Blockly looks up custom field classes via the registry.
Blockly.fieldRegistry.register('field_variable_dropdown', FieldVariableDropdown);

// ── FieldSearchableDropdown ──────────────────────────────────────────────────
//
// Drop-in replacement for `Blockly.FieldDropdown` that injects a search box at
// the top of the menu. Critical for the product picker on the recipe hat: the
// real catalogue easily reaches dozens of parts, and Blockly's stock dropdown
// is a vertical scroll list with no filter — so finding "BKT-001" means
// scrolling, which is unforgivable in a configurator.
//
// Implementation: we extend `FieldDropdown` (so persistence + value validation
// keep working unchanged) and override `showEditor_` to render a custom DOM
// inside `Blockly.DropDownDiv.getContentDiv()`. The custom DOM is just an
// `<input>` + an `<ul>` of buttons that filter as the user types. Picking a
// row calls `setValue()` and dismisses the dropdown via `DropDownDiv.hide()`,
// matching the standard menu's exit behaviour.
class FieldSearchableDropdown extends Blockly.FieldDropdown {
  /** Last search query — kept across opens so re-opening the menu starts where
   *  the user left off (a small but valuable papercut for power users). */
  private searchQuery = '';

  /** Same trick as FieldVariableDropdown — accept any persisted value so the
   *  field round-trips losslessly even when the chosen option isn't (yet) on
   *  the live catalogue (e.g. mock data hasn't loaded). */
  protected override doClassValidation_(newValue?: string): string | null {
    if (newValue === undefined || newValue === null) return null;
    return String(newValue);
  }

  protected override showEditor_(_e?: MouseEvent): void {
    Blockly.DropDownDiv.clearContent();
    const div = Blockly.DropDownDiv.getContentDiv();
    div.innerHTML = '';

    // Resolve the option list. FieldDropdown stores either a static array or a
    // generator function under `menuGenerator_` (private but stable across
    // 12.x). Calling `getOptions(false)` gives us the live list either way.
    const options = this.getOptions(false) as [string, string][];

    // Container — flex column with a fixed width so the menu feels deliberate
    // rather than re-flowing as the user types.
    const container = document.createElement('div');
    container.style.cssText =
      'display:flex;flex-direction:column;width:280px;max-height:340px;font-family:var(--font-family-sans);';
    div.appendChild(container);

    // Search input — auto-focused so the user starts typing immediately.
    const search = document.createElement('input');
    search.type = 'search';
    search.value = this.searchQuery;
    search.placeholder = 'Search…';
    search.setAttribute('aria-label', 'Search options');
    search.style.cssText =
      'margin:6px 6px 4px;padding:8px 10px;font:500 13px var(--font-family-sans);' +
      'border:1px solid var(--neutral-200);border-radius:8px;outline:none;color:var(--neutral-900);' +
      'background:#fff;';
    search.addEventListener('focus', () => {
      search.style.borderColor = 'var(--mw-yellow-400)';
      search.style.boxShadow = '0 0 0 3px rgba(255,207,75,0.18)';
    });
    search.addEventListener('blur', () => {
      search.style.borderColor = 'var(--neutral-200)';
      search.style.boxShadow = 'none';
    });
    container.appendChild(search);

    // Scrollable list of matching rows.
    const list = document.createElement('div');
    list.style.cssText =
      'flex:1 1 auto;overflow-y:auto;padding:2px 6px 6px;display:flex;flex-direction:column;gap:2px;';
    container.appendChild(list);

    // Render rows — re-runs whenever the query changes. Match is a simple
    // case-insensitive substring on the visible label (the first tuple entry).
    const renderRows = (query: string) => {
      list.innerHTML = '';
      const q = query.trim().toLowerCase();
      const filtered = q
        ? options.filter(([label]) => String(label).toLowerCase().includes(q))
        : options;

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'No matches';
        empty.style.cssText =
          'padding:14px 8px;text-align:center;color:var(--neutral-500);font:500 12px var(--font-family-sans);';
        list.appendChild(empty);
        return;
      }

      const currentValue = this.getValue();
      for (const [label, value] of filtered) {
        const row = document.createElement('button');
        row.type = 'button';
        row.textContent = String(label);
        const isSelected = value === currentValue;
        row.style.cssText =
          'text-align:left;padding:8px 10px;border-radius:8px;border:1px solid transparent;' +
          'background:' +
          (isSelected ? 'var(--mw-yellow-50)' : 'transparent') +
          ';color:' +
          (isSelected ? 'var(--neutral-900)' : 'var(--neutral-800)') +
          ';font:' +
          (isSelected ? '600' : '500') +
          ' 13px var(--font-family-sans);cursor:pointer;outline:none;';
        if (isSelected) row.style.borderColor = 'var(--mw-yellow-200)';
        row.addEventListener('mouseover', () => {
          if (!isSelected) row.style.background = 'var(--neutral-100)';
        });
        row.addEventListener('mouseout', () => {
          if (!isSelected) row.style.background = 'transparent';
        });
        row.addEventListener('click', () => {
          this.setValue(value);
          Blockly.DropDownDiv.hideWithoutAnimation();
        });
        list.appendChild(row);
      }
    };

    search.addEventListener('input', () => {
      this.searchQuery = search.value;
      renderRows(this.searchQuery);
    });
    // Keyboard escape closes the dropdown the same way the menu does.
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Blockly.DropDownDiv.hideWithoutAnimation();
        return;
      }
      e.stopPropagation();
    });

    renderRows(this.searchQuery);

    // Position + show. Same call the parent class makes after building its menu.
    // Cast through `unknown` because Blockly v12's typings parameterise
    // `showPositionedByBlock` over `Field<string | undefined>`, while
    // `FieldDropdown<string>` resolves to `Field<string>` — at runtime the call
    // is identical so the cast is safe.
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock instanceof Blockly.BlockSvg) {
      Blockly.DropDownDiv.showPositionedByBlock(
        this as unknown as Blockly.Field,
        sourceBlock,
      );
    }

    // Auto-focus the search box one tick after positioning so the dropdown's
    // ephemeral focus management has finished and our focus call wins.
    setTimeout(() => search.focus(), 0);
  }
}

Blockly.fieldRegistry.register('field_searchable_dropdown', FieldSearchableDropdown);

/** Studio + mock catalogue — shared by `mw_product_ref` and inline product pickers. */
function buildProductPickerOptions(): [string, string][] {
  const state = useProductBuilderStore.getState();
  const activeId = state.activeProductId;
  const studioProducts = state.products.map((p) => {
    let tag = '';
    if (p.id === activeId) tag = ' (this)';
    else if (p.lifecycleStatus === 'draft') tag = ' (draft)';
    return [`${p.name}${tag}`, p.id] as [string, string];
  });
  const catalogueProducts = mockCatalogueProducts
    .filter((p) => p.isActive)
    .map(
      (p) =>
        [`${p.partNumber} · ${p.description}`, `mock:${p.id}`] as [string, string],
    );
  const out = [...studioProducts, ...catalogueProducts];
  if (out.length === 0) {
    return [['(no products)', '__none__']];
  }
  return out;
}

/** Material library — searchable “Add material to BOM” picker (live store). */
function buildMaterialPickerOptions(): [string, string][] {
  const materials = useMaterialLibraryStore.getState().materials;
  const out = materials.map(
    (m) => [`${m.code} · ${m.name}`, m.id] as [string, string],
  );
  if (out.length === 0) {
    return [['(no materials)', '__none__']];
  }
  return out;
}

// ── Brand colour constants ───────────────────────────────────────────────────
//
// Each block category is mapped to a hex from the MirrorWorks brand sheet
// (DesignSystem.md UI/UX + Brand Colours), so the canvas no longer ships with
// Blockly's stock rainbow. Blockly's `setColour()` accepts a hex string and
// computes the block tile gradient/border from there. Pairs of categories that
// share a colour (e.g. Forming & Actions both purple) live under different
// parent super-categories so the duplication is unambiguous in context.
//
//   Setup       — Recipe (yellow)   • Inputs (purple)  • Variables (magenta)
//   Calculate   — Math (green)      • Logic (blue)     • Geometry (teal)
//                 Time (sea foam)   • Money (saddle)
//   Build       — Materials (orange)• Cutting (blue)   • Forming (purple)
//                 Welding (red)     • Finishes (pink)  • Assembly (saddle)
//   Sub-products— Products (teal)   • Operations (earth) • Actions (purple)
//   Output      — BOM/warn (mirage) • Costs (saddle)
const HUE_TRIGGER = '#FFCF4B';   // MW Yellow — recipe entry, brand thread
const HUE_INPUT = '#9B4DFF';     // Graph 5 purple — typed configurator inputs
const HUE_VARIABLE = '#FF4DB8';  // Graph 3 magenta — set/get reporters
const HUE_OPERATOR = '#5FE07F';  // Success green — math operators (calc family)
const HUE_LOGIC = '#4D7CFF';     // Primary blue — control flow / compares
const HUE_GEOMETRY = '#4DDDC9';  // Graph 4 teal — shape calculators
const HUE_TIME = '#7B9386';      // MW Sea Foam — time helpers
const HUE_MONEY = '#A68D60';     // MW Saddle — money calc helpers (AUD)
const HUE_MATERIAL = '#FF944D';  // Graph 1 orange — material refs
const HUE_CUTTING = '#4D7CFF';   // Primary blue — cold cutting (laser/plasma)
const HUE_FORMING = '#9B4DFF';   // Graph 5 purple — bending / rolling
const HUE_WELDING = '#FF584D';   // Alert red — hot work
const HUE_FINISH = '#FF4D7C';    // Graph 2 pink — surface treatments
const HUE_ASSEMBLY = '#A68D60';  // MW Saddle — mechanical fastening
const HUE_PRODUCT = '#4DDDC9';   // Graph 4 teal — sub-product compose
const HUE_OPERATION = '#8FA6A6'; // MW Earth — generic operation escape hatch
const HUE_COST = '#A68D60';      // MW Saddle — cost adjustments (financial)
const HUE_ACTION = '#9B4DFF';    // Graph 5 purple — ERP side-effects
const HUE_OUTPUT = '#1A2732';    // MW Mirage — outputs / dispatch (dark)

// Guard against double-registration on hot reload.
let registered = false;

export function registerStudioV2Blocks(): void {
  if (registered) return;
  registered = true;

  // Side-effect: the FieldSlider / FieldGridDropdown classes self-register on
  // import. We import them above so the bundle keeps the registration calls
  // (otherwise tree-shaking strips the unused symbols). The references below
  // also keep TS happy and document why the imports exist.
  void FieldSlider;
  void FieldGridDropdown;

  // ── Triggers (the recipe hats) ─────────────────────────────────────────────
  //
  // The studio is *product-centric*: every program in here describes how a
  // single product is built and quoted. We expose **two** hats so authors can
  // separate the two phases of a quote:
  //
  //   • mw_when_pricing — "When pricing this <product>" — runs at quote time.
  //     Used for inputs, calculations, BOM rollup, costs, margins, warnings.
  //   • mw_when_making  — "When making this <product>"  — runs at production
  //     time. Used for the operations sequence, work orders, tooling notes.
  //
  // Both hats embed a `Product` value socket so the user can pick *which*
  // product the recipe applies to with a real dropdown — the same
  // `mw_product_ref` reporter used elsewhere plugs in directly. This makes the
  // top of the recipe self-documenting and lets a single canvas describe a
  // small library of related products if needed.
  //
  // Backwards-compat: the legacy `mw_when_configured` block id stays
  // registered (treated as a generic hat) so older persisted XML still loads.
  // The seed templates have been updated to use the new pricing/making split.
  Blockly.Blocks['mw_when_pricing'] = {
    init() {
      this.appendDummyInput().appendField('When pricing this');
      // setCheck accepts an array — list every type the product socket should
      // tolerate so a user can plug in a `mw_product_ref` (Product), a get-var
      // bound to a product input (Number/String/null), or a future text-based
      // SKU literal. Without 'String' in the list a get-var binding silently
      // refuses to drop into the hat, which is the #1 papercut on first use.
      this.appendValueInput('PRODUCT')
        .setCheck(['Product', 'String'])
        .appendField('product');
      this.setInputsInline(true);
      this.setNextStatement(true, null);
      this.setColour(HUE_TRIGGER);
      this.setTooltip(
        'Quote-time recipe. Stack inputs, calculations, BOM, costs, margins and warnings under here — they roll up into the chosen product\'s price.',
      );
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['mw_when_making'] = {
    init() {
      this.appendDummyInput().appendField('When making this');
      this.appendValueInput('PRODUCT')
        .setCheck(['Product', 'String'])
        .appendField('product');
      this.setInputsInline(true);
      this.setNextStatement(true, null);
      this.setColour(HUE_TRIGGER);
      this.setTooltip(
        'Production-time recipe. Stack the operations sequence (laser, bend, weld, finish, assembly) under here — they emit the work order for the chosen product.',
      );
      this.setHelpUrl('');
    },
  };

  // Legacy generic hat. Kept registered so any existing persisted XML still
  // loads cleanly — but hidden from the toolbox since the pricing / making
  // pair above is the canonical entry point now.
  Blockly.Blocks['mw_when_configured'] = {
    init() {
      this.appendDummyInput().appendField('When manufacturing this product');
      this.setNextStatement(true, null);
      this.setColour(HUE_TRIGGER);
      this.setTooltip(
        'Legacy generic recipe hat. Newer canvases use "When pricing this" and "When making this" so the two phases stay separate.',
      );
      this.setHelpUrl('');
    },
  };

  // Legacy: kept registered so very old XML loads cleanly. Hidden from the
  // toolbox. Identical shape to `mw_when_configured`.
  Blockly.Blocks['mw_when_published'] = {
    init() {
      this.appendDummyInput().appendField('When manufacturing this product (legacy)');
      this.setNextStatement(true, null);
      this.setColour(HUE_TRIGGER);
      this.setTooltip(
        'Legacy "release-time" hat — folded into the pricing / making recipe pair. Drag the children up under one of those and delete this block.',
      );
      this.setHelpUrl('');
    },
  };

  // ── Lifecycle hats (state-machine triggers) ──────────────────────────────
  //
  // The studio's mental model is: a *template* lives in the studio, and when
  // a customer touchpoint occurs (quote requested, order placed, MO raised,
  // WO completed, delivered, stock drops below threshold) the template spawns
  // an *instance* and the matching hat's body runs. Each hat binds to a
  // specific state-machine event so the recipe author is explicit about
  // "this set of actions fires when this exact transition happens".
  //
  // The two "common" hats (`mw_when_pricing`, `mw_when_making`) above are
  // ergonomic shortcuts — they map onto `quote.price` and `production.start`
  // respectively. The lifecycle hats below give full access to the state
  // machine for recipes that need finer-grained control (e.g. "send SMS on
  // delivery", "raise a reorder PO when stock drops low").
  //
  // All lifecycle hats share the same shape as `mw_when_pricing`: a
  // `PRODUCT` value socket that binds the recipe to a specific product chip,
  // and a statement stack for the body. The only thing that varies is the
  // label and the implicit event — which the generator records in
  // `extras.hatEvents[<block.id>] = '<event>'`.
  const defineLifecycleHat = (
    type: string,
    label: string,
    tooltip: string,
    opts?: { hideProductSocket?: boolean },
  ) => {
    Blockly.Blocks[type] = {
      init() {
        this.appendDummyInput().appendField(label);
        if (!opts?.hideProductSocket) {
          this.appendValueInput('PRODUCT')
            .setCheck(['Product', 'String'])
            .appendField('product');
        }
        this.setInputsInline(true);
        this.setNextStatement(true, null);
        this.setColour(HUE_TRIGGER);
        this.setTooltip(tooltip);
        this.setHelpUrl('');
      },
    };
  };

  defineLifecycleHat(
    'mw_when_quote_requested',
    'When a quote is requested for',
    'Fires the moment a customer asks for a quote on this product. Good place to run configurator validation, warn about out-of-range dimensions, or calculate lead time.',
  );

  defineLifecycleHat(
    'mw_when_quote_confirmed',
    'When a quote is confirmed for',
    'Fires when the customer accepts the quote. Typical actions: create sales order, reserve stock, send confirmation email.',
  );

  defineLifecycleHat(
    'mw_when_order_placed',
    'When an order is placed for',
    'Fires when a firm order is raised against this product. Typical actions: create manufacturing order, push purchase requisitions for long-lead materials.',
  );

  defineLifecycleHat(
    'mw_when_mo_raised',
    'When a manufacturing order is raised for',
    'Fires when a manufacturing order (MO) is created. Typical actions: schedule work orders, reserve capacity, push NC programs to the laser.',
  );

  defineLifecycleHat(
    'mw_when_wo_start',
    'When a work order starts for',
    'Fires when a work order on the shop floor moves to in-progress. Typical actions: clock the operator on, light up a cell kanban, start a QC log.',
  );

  defineLifecycleHat(
    'mw_when_wo_complete',
    'When a work order completes for',
    'Fires when a work order is marked complete. Typical actions: record QC, move the part to the next cell, update the dispatch manifest.',
  );

  defineLifecycleHat(
    'mw_when_delivered',
    'When this product is delivered:',
    'Fires when the product is marked delivered. Typical actions: send customer SMS, generate invoice, request a review.',
  );

  defineLifecycleHat(
    'mw_when_stock_low',
    'When stock runs low for',
    'Fires when on-hand stock for this product drops below its reorder threshold. Typical actions: create a replenishment manufacturing order or a purchase order.',
  );

  // Manual-run hat — the play button in the studio toolbar dispatches a
  // synthetic `manual.run` event, which matches this hat only. Lets an author
  // dry-run a recipe against the current scenario inputs without waiting for
  // a real quote/order touchpoint. No product socket — the play button
  // implicitly runs against the studio's active product.
  defineLifecycleHat(
    'mw_when_manual',
    'When I press Run in the studio',
    'Dry-run entry point. The Run button in the studio toolbar fires this hat against the current scenario inputs, without committing any of the downstream actions. Use this to scratch-test a recipe.',
    { hideProductSocket: true },
  );

  // ── Inputs (typed customer/quote parameters) ───────────────────────────────
  // These are statement blocks that act like `set_variable` but expose the
  // parameter to the configurator. The default value is editable inline.
  Blockly.Blocks['mw_input_dimension'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input')
        .appendField(new Blockly.FieldTextInput('length'), 'NAME')
        .appendField(
          new Blockly.FieldDropdown([
            ['mm', 'mm'],
            ['cm', 'cm'],
            ['m', 'm'],
            ['in', 'in'],
          ]),
          'UNIT',
        )
        .appendField('default');
      this.appendValueInput('DEFAULT').setCheck('Number');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('Declares a typed dimension parameter the configurator can edit.');
    },
  };

  Blockly.Blocks['mw_input_quantity'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input qty')
        .appendField(new Blockly.FieldTextInput('quantity'), 'NAME')
        .appendField('default');
      this.appendValueInput('DEFAULT').setCheck('Number');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('An order quantity parameter (integer).');
    },
  };

  Blockly.Blocks['mw_input_choice'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input choice')
        .appendField(new Blockly.FieldTextInput('finish_colour'), 'NAME')
        .appendField('options')
        .appendField(new Blockly.FieldTextInput('Black,White,Raw'), 'OPTIONS')
        .appendField('default')
        .appendField(new Blockly.FieldTextInput('Black'), 'DEFAULT');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('A multiple-choice parameter (comma-separated options).');
    },
  };

  // Boolean toggle input — renders as a switch in the Inputs sidebar.
  Blockly.Blocks['mw_input_toggle'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input toggle')
        .appendField(new Blockly.FieldTextInput('include_lid'), 'NAME')
        .appendField('default')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'DEFAULT');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('A boolean (yes/no) parameter the configurator can flip.');
    },
  };

  // Percent input — uses the slider field for inline 0–100 entry.
  Blockly.Blocks['mw_input_percent'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input %')
        .appendField(new Blockly.FieldTextInput('discount'), 'NAME')
        .appendField('default')
        .appendField(new FieldSlider(10, 0, 100, 1), 'DEFAULT');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('A percentage parameter (0–100) — renders as a slider.');
    },
  };

  // Free-text input — short string parameter (e.g. customer reference).
  Blockly.Blocks['mw_input_text'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input text')
        .appendField(new Blockly.FieldTextInput('customer_ref'), 'NAME')
        .appendField('default')
        .appendField(new Blockly.FieldTextInput(''), 'DEFAULT');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('A short text parameter (e.g. customer reference).');
    },
  };

  // Angle input — degrees, useful for fold/bend recipes. We constrain to
  // [-360, 360] via the standard FieldNumber so the field stays in core
  // Blockly without pulling in a third-party dial picker.
  Blockly.Blocks['mw_input_angle'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input angle')
        .appendField(new Blockly.FieldTextInput('bend_angle'), 'NAME')
        .appendField('default')
        .appendField(new Blockly.FieldNumber(90, -360, 360, 1), 'DEFAULT')
        .appendField('°');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip('A bend / fold angle parameter (degrees).');
    },
  };

  // Material picker input — declares a parameter whose value is a material id
  // from the library. The Inputs sidebar renders this as a Material dropdown
  // so the user can swap stock without touching the canvas.
  Blockly.Blocks['mw_input_material'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input material')
        .appendField(new Blockly.FieldTextInput('stock'), 'NAME');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip(
        'Declares a material parameter — the configurator picks from the Material Library at run time.',
      );
    },
  };

  // Finish picker input — same shape as material picker but bound to the
  // Finish Library. Lives under Inputs (not Finishes) because it's authoring
  // a *parameter*, not a static finish reference.
  Blockly.Blocks['mw_input_finish'] = {
    init() {
      this.appendDummyInput()
        .appendField('Input finish')
        .appendField(new Blockly.FieldTextInput('coating'), 'NAME');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_INPUT);
      this.setTooltip(
        'Declares a finish parameter — the configurator picks from the Finish Library at run time.',
      );
    },
  };

  // ── Variables ──────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_set_variable'] = {
    init() {
      this.appendDummyInput()
        .appendField('Set')
        .appendField(new Blockly.FieldTextInput('width'), 'NAME')
        .appendField('to');
      this.appendValueInput('VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_VARIABLE);
      this.setTooltip('Sets a named variable to a value.');
    },
  };

  Blockly.Blocks['mw_get_variable'] = {
    init() {
      // FieldVariableDropdown lists every input declared on the workspace —
      // pick from a real list instead of free-typing a name. The persisted
      // initial value lets older XML payloads (which used FieldTextInput) keep
      // their binding even when the typed name isn't in the current option set.
      this.appendDummyInput()
        .appendField('Var')
        .appendField(new FieldVariableDropdown('width'), 'NAME');
      this.setOutput(true, null);
      this.setColour(HUE_VARIABLE);
      this.setTooltip('Reads a previously declared input — pick from the dropdown.');
    },
  };

  // Number / text literals — Blockly's defaults are too plain so we ship our own
  // tiny ones in the same colour family as Operators.
  Blockly.Blocks['mw_number'] = {
    init() {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(0), 'VALUE');
      this.setOutput(true, 'Number');
      this.setColour(HUE_OPERATOR);
      this.setTooltip('A number literal — type directly in the field.');
    },
  };

  Blockly.Blocks['mw_text'] = {
    init() {
      this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput(''), 'VALUE')
        .appendField('"');
      this.setOutput(true, 'String');
      this.setColour(HUE_OPERATOR);
      this.setTooltip('A text literal — type directly in the field.');
    },
  };

  // ── Math (renamed from Operators) ──────────────────────────────────────────
  Blockly.Blocks['mw_arithmetic'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['+', 'ADD'],
          ['−', 'SUB'],
          ['×', 'MUL'],
          ['÷', 'DIV'],
        ]),
        'OP',
      );
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_OPERATOR);
      this.setTooltip('Arithmetic on two numbers.');
    },
  };

  Blockly.Blocks['mw_round'] = {
    init() {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['round', 'ROUND'],
          ['floor', 'FLOOR'],
          ['ceil', 'CEIL'],
        ]),
        'OP',
      );
      this.appendValueInput('VALUE').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_OPERATOR);
      this.setTooltip('Round a number.');
    },
  };

  Blockly.Blocks['mw_min_max'] = {
    init() {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['min', 'MIN'],
          ['max', 'MAX'],
        ]),
        'OP',
      );
      this.appendValueInput('A').setCheck('Number');
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_OPERATOR);
      this.setTooltip('Minimum or maximum of two numbers.');
    },
  };

  Blockly.Blocks['mw_percent'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Number');
      this.appendDummyInput().appendField('×');
      // Inline slider 0–100% — much faster to scrub than typing on a number
      // socket, and reads as the universal "percentage" affordance.
      this.appendDummyInput().appendField(
        new FieldSlider(15, 0, 100, 1),
        'PCT_INLINE',
      );
      this.appendDummyInput().appendField('%');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_OPERATOR);
      this.setTooltip(
        'Percentage of a value — drag the slider to scrub between 0 % and 100 %.',
      );
    },
  };

  // ── Logic ──────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_compare'] = {
    init() {
      this.appendValueInput('A');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'EQ'],
          ['≠', 'NEQ'],
          ['<', 'LT'],
          ['≤', 'LTE'],
          ['>', 'GT'],
          ['≥', 'GTE'],
        ]),
        'OP',
      );
      this.appendValueInput('B');
      this.setOutput(true, 'Boolean');
      this.setInputsInline(true);
      this.setColour(HUE_LOGIC);
      this.setTooltip('Compare two values; returns a boolean.');
    },
  };

  Blockly.Blocks['mw_boolean'] = {
    init() {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['true', 'TRUE'],
          ['false', 'FALSE'],
        ]),
        'VALUE',
      );
      this.setOutput(true, 'Boolean');
      this.setColour(HUE_LOGIC);
    },
  };

  Blockly.Blocks['mw_logic_op'] = {
    init() {
      this.appendValueInput('A').setCheck('Boolean');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['and', 'AND'],
          ['or', 'OR'],
        ]),
        'OP',
      );
      this.appendValueInput('B').setCheck('Boolean');
      this.setOutput(true, 'Boolean');
      this.setInputsInline(true);
      this.setColour(HUE_LOGIC);
    },
  };

  // Note: we deliberately do NOT define our own `mw_if`. Blockly's built-in
  // `controls_if` block is patched by `@blockly/block-plus-minus` to expose a
  // +/- mutator that lets the user add elseif and else branches inline. We
  // restyle it via the same HUE_LOGIC swatch in the toolbox JSON below.

  // ── Geometry ───────────────────────────────────────────────────────────────
  // Reporter blocks — return a Number that the rest of the program can use.

  Blockly.Blocks['mw_geom_area_rect'] = {
    init() {
      this.appendDummyInput().appendField('area of rect');
      this.appendValueInput('L').setCheck('Number').appendField('L');
      this.appendValueInput('W').setCheck('Number').appendField('W');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_GEOMETRY);
      this.setTooltip('Returns L × W.');
    },
  };

  Blockly.Blocks['mw_geom_perimeter_rect'] = {
    init() {
      this.appendDummyInput().appendField('perimeter of rect');
      this.appendValueInput('L').setCheck('Number').appendField('L');
      this.appendValueInput('W').setCheck('Number').appendField('W');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_GEOMETRY);
      this.setTooltip('Returns 2(L + W).');
    },
  };

  Blockly.Blocks['mw_geom_volume_box'] = {
    init() {
      this.appendDummyInput().appendField('volume of box');
      this.appendValueInput('L').setCheck('Number').appendField('L');
      this.appendValueInput('W').setCheck('Number').appendField('W');
      this.appendValueInput('H').setCheck('Number').appendField('H');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_GEOMETRY);
      this.setTooltip('Returns L × W × H.');
    },
  };

  Blockly.Blocks['mw_geom_weight'] = {
    init() {
      this.appendDummyInput().appendField('weight kg');
      this.appendValueInput('VOLUME').setCheck('Number').appendField('volume mm³');
      this.appendValueInput('DENSITY').setCheck('Number').appendField('density g/cm³');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_GEOMETRY);
      this.setTooltip('Returns mass in kg from volume (mm³) × density (g/cm³).');
    },
  };

  Blockly.Blocks['mw_geom_sheet_area'] = {
    init() {
      this.appendDummyInput().appendField('sheet area m² with scrap');
      this.appendValueInput('AREA').setCheck('Number').appendField('part area m²');
      this.appendValueInput('SCRAP').setCheck('Number').appendField('scrap %');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_GEOMETRY);
      this.setTooltip('Returns area × (1 + scrap%/100).');
    },
  };

  // ── Materials ──────────────────────────────────────────────────────────────
  // Reporter block carrying a material id from the library. Generated dynamically
  // by the toolbox builder so each material gets its own draggable chip.
  Blockly.Blocks['mw_material_ref'] = {
    init() {
      this.appendDummyInput()
        .appendField('Material')
        .appendField(new Blockly.FieldTextInput('—'), 'LABEL');
      // Multi-typed output: Material is the primary type but we also expose
      // String so the chip can plug into any [Material, String] socket and
      // String-only debugging displays without an extra adapter block.
      this.setOutput(true, ['Material', 'String']);
      this.setColour(HUE_MATERIAL);
      this.setTooltip('A reference to a material from the Material Library.');
    },
  };

  // ── Finishes ───────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_finish_ref'] = {
    init() {
      this.appendDummyInput()
        .appendField('Finish')
        .appendField(new Blockly.FieldTextInput('—'), 'LABEL');
      this.setOutput(true, ['Finish', 'String']);
      this.setColour(HUE_FINISH);
      this.setTooltip('A reference to a finish from the Finish Library.');
    },
  };

  // ── Products ───────────────────────────────────────────────────────────────
  // Reporter block carrying a product id from the library. Renders as a
  // dropdown of every product in the store (drafts and published alike) so the
  // user can pick *any* product they're authoring, not just ones they've
  // already shipped. The dropdown's value IS the product id (so it round-trips
  // through XML losslessly), and the menu generator runs every time the user
  // clicks the field — so freshly-created products show up immediately and
  // renames take effect on the next open.
  //
  // Output type is multi-typed: ['Product', 'Number', 'String'] so the same
  // reporter can plug into the dedicated `Product` socket on the recipe hats /
  // sub-assembly block AND into any generic value socket (BOM qty, cost
  // amounts, get_variable substitutes, etc). The downstream evaluator
  // gracefully degrades a product reference to its id-as-string when read in
  // a non-product context — useful for "use product code as sku" patterns.
  Blockly.Blocks['mw_product_ref'] = {
    init() {
      // FieldSearchableDropdown adds a search box at the top of the menu so a
      // catalogue with dozens of parts (BKT-001, PLT-042, …) is searchable
      // instead of scroll-only. Critical the moment the platform-wide product
      // list grows past one screenful, which it already does once mock data is
      // unioned with studio products.
      this.appendDummyInput()
        .appendField('Product')
        .appendField(new FieldSearchableDropdown(buildProductPickerOptions), 'PRODUCT_ID');
      // Multi-output: Blockly accepts an array of accepted check types on
      // setOutput(), so the same reporter slots into a 'Product' value input
      // (recipe hats, sub-assembly), a 'Number' input (legacy fallback), or
      // any generic socket (null check). Without the multi-type, the chip is
      // confined to two blocks total — far too restrictive for the brief.
      this.setOutput(true, ['Product', 'Number', 'String']);
      this.setColour(HUE_PRODUCT);
      this.setTooltip(
        'Reference another product. Type to search by name or part number. Plugs into the recipe hats to pick which product the recipe describes, and into "Add sub-assembly" to pull the referenced product\'s BOM, ops, and cost into the current rollup. Cycle-safe.',
      );
    },
  };

  // Statement block: drop a referenced product into the current recipe with a
  // multiplier. Pairs with `mw_product_ref` (which provides the value socket).
  // Generates a `product_ref` engine op that the evaluator recursively expands.
  Blockly.Blocks['mw_op_assemble_with'] = {
    init() {
      // Searchable picker on the block — users were stuck with an empty value
      // socket unless they hunted the toolbox for `mw_product_ref`. Same
      // catalogue + search UX as the Product reporter chip.
      this.appendDummyInput()
        .appendField('Add sub-assembly')
        .appendField(new FieldSearchableDropdown(buildProductPickerOptions), 'PRODUCT_ID');
      this.appendValueInput('QTY').setCheck('Number').appendField('×');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_PRODUCT);
      this.setTooltip(
        'Adds another product as a sub-assembly — search by name or part number on the block. BOM, operations, and costs roll up × quantity. Cycles are blocked.',
      );
    },
  };

  // ── Recipe ▸ shop-floor input shortcut ─────────────────────────────────────
  // The recipe hat's PRODUCT socket needs a value chip — without one the
  // first-time user is stuck with an empty hexagonal hole and no clue what to
  // drop in. Sub-products ▸ Products' `mw_product_ref` is the canonical answer
  // but it lives two categories away. We surface the same chip directly under
  // Recipe via the toolbox merge below; no new block type required.

  // ── Cutting (laser / waterjet / drill / tap) ───────────────────────────────
  // Each emits an `operation` engine block with computed setup + run minutes.
  Blockly.Blocks['mw_op_laser_cut'] = {
    init() {
      this.appendDummyInput().appendField('Laser cut');
      this.appendValueInput('PERIMETER').setCheck('Number').appendField('perimeter mm');
      this.appendValueInput('PIERCES').setCheck('Number').appendField('pierces');
      this.appendValueInput('CUT_RATE').setCheck('Number').appendField('cut mm/min');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip(
        'Adds a laser-cut operation: time = perimeter / cut rate + pierces × 1.5 s.',
      );
    },
  };

  Blockly.Blocks['mw_op_drill'] = {
    init() {
      this.appendDummyInput().appendField('Drill holes');
      this.appendValueInput('COUNT').setCheck('Number').appendField('count');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/hole');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a drilling operation.');
    },
  };

  Blockly.Blocks['mw_op_tap'] = {
    init() {
      this.appendDummyInput().appendField('Tap thread');
      this.appendValueInput('COUNT').setCheck('Number').appendField('count');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/thread');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a thread-tapping operation.');
    },
  };

  // Plasma cut — same shape as laser_cut (perimeter ÷ rate + pierce time) but
  // typically slower than laser and rougher edge. Workcentre PLASMA so the
  // scheduler can split it onto its own machine. Different default cut rate.
  Blockly.Blocks['mw_op_plasma_cut'] = {
    init() {
      this.appendDummyInput().appendField('Plasma cut');
      this.appendValueInput('PERIMETER').setCheck('Number').appendField('perimeter mm');
      this.appendValueInput('PIERCES').setCheck('Number').appendField('pierces');
      this.appendValueInput('CUT_RATE').setCheck('Number').appendField('cut mm/min');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a plasma-cut operation: time = perimeter / cut rate + pierces × 2 s.');
    },
  };

  // Waterjet — perimeter/rate model, slowest of the cutting trio but no HAZ
  // and works on any material. Same socket layout as laser/plasma so they can
  // be swapped without rewiring the inputs.
  Blockly.Blocks['mw_op_waterjet'] = {
    init() {
      this.appendDummyInput().appendField('Waterjet cut');
      this.appendValueInput('PERIMETER').setCheck('Number').appendField('perimeter mm');
      this.appendValueInput('PIERCES').setCheck('Number').appendField('pierces');
      this.appendValueInput('CUT_RATE').setCheck('Number').appendField('cut mm/min');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a waterjet operation: time = perimeter / cut rate + pierces × 3 s.');
    },
  };

  // Shear — guillotine cut, single straight cut per stroke. Count × sec/cut.
  Blockly.Blocks['mw_op_shear'] = {
    init() {
      this.appendDummyInput().appendField('Shear cut');
      this.appendValueInput('COUNT').setCheck('Number').appendField('cuts');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/cut');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a guillotine-shear operation.');
    },
  };

  // Punch press — turret punch, count × sec/hit (one tool per hit).
  Blockly.Blocks['mw_op_punch'] = {
    init() {
      this.appendDummyInput().appendField('Punch press');
      this.appendValueInput('COUNT').setCheck('Number').appendField('hits');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/hit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a turret-punch operation.');
    },
  };

  // ── Forming (bend / roll) ──────────────────────────────────────────────────
  Blockly.Blocks['mw_op_bend'] = {
    init() {
      this.appendDummyInput().appendField('Press brake bend');
      this.appendValueInput('COUNT').setCheck('Number').appendField('bends');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/bend');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FORMING);
      this.setTooltip('Adds a press-brake bending operation.');
    },
  };

  // Plate-roll — for cylinders / cones. Length × sec/mm of roll path.
  Blockly.Blocks['mw_op_roll'] = {
    init() {
      this.appendDummyInput().appendField('Plate roll');
      this.appendValueInput('LENGTH_MM').setCheck('Number').appendField('roll length mm');
      this.appendValueInput('SEC_PER_MM').setCheck('Number').appendField('sec/mm');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FORMING);
      this.setTooltip('Adds a plate-rolling operation, time = length × sec/mm.');
    },
  };

  // ── Welding ────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_op_weld'] = {
    init() {
      this.appendDummyInput()
        .appendField('Weld')
        // 2-column grid dropdown — MIG/TIG/Stick/Spot lays out as a 2×2 picker
        // which is faster to scan than a vertical dropdown list.
        .appendField(
          new FieldGridDropdown(
            [
              ['MIG', 'MIG'],
              ['TIG', 'TIG'],
              ['Stick', 'STICK'],
              ['Spot', 'SPOT'],
            ],
            undefined,
            { columns: 2 },
          ),
          'TYPE',
        );
      this.appendValueInput('LENGTH_MM').setCheck('Number').appendField('length mm');
      this.appendValueInput('SEC_PER_MM').setCheck('Number').appendField('sec/mm');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_WELDING);
      this.setTooltip('Adds a welding operation, time = length × sec/mm.');
    },
  };

  // ── Surface prep / finishing ───────────────────────────────────────────────
  // Grind weld dressing — length-based, like welding but slower.
  Blockly.Blocks['mw_op_grind'] = {
    init() {
      this.appendDummyInput().appendField('Grind / linish');
      this.appendValueInput('LENGTH_MM').setCheck('Number').appendField('length mm');
      this.appendValueInput('SEC_PER_MM').setCheck('Number').appendField('sec/mm');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a grinding / linishing operation, time = length × sec/mm.');
    },
  };

  // Sandblast / shot blast — area-based prep before paint or powder coat.
  Blockly.Blocks['mw_op_sandblast'] = {
    init() {
      this.appendDummyInput().appendField('Sandblast');
      this.appendValueInput('AREA').setCheck('Number').appendField('area m²');
      this.appendValueInput('SEC_PER_M2')
        .setCheck('Number')
        .appendField('sec/m²');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a sandblast / surface-prep operation, time = area × sec/m².');
    },
  };

  // ── Assembly ───────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_op_fastener'] = {
    init() {
      this.appendDummyInput()
        .appendField('Add fasteners')
        .appendField(new Blockly.FieldTextInput('M6 x 20'), 'SPEC');
      this.appendValueInput('COUNT').setCheck('Number').appendField('count');
      this.appendValueInput('UNIT_COST').setCheck('Number').appendField('AUD/ea');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds fasteners as a phantom BOM line + a small assembly time.');
    },
  };

  Blockly.Blocks['mw_op_assemble'] = {
    init() {
      this.appendDummyInput()
        .appendField('Assemble')
        .appendField(new Blockly.FieldTextInput('Final assembly'), 'NAME');
      this.appendValueInput('MIN').setCheck('Number').appendField('min/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds an assembly operation.');
    },
  };

  // QA / inspection — flat minutes per unit, charged to QC workcentre. Used
  // to model first-article inspection or final visual check before pack-out.
  Blockly.Blocks['mw_op_inspect'] = {
    init() {
      this.appendDummyInput()
        .appendField('Inspect')
        .appendField(new Blockly.FieldTextInput('Final QA'), 'NAME');
      this.appendValueInput('MIN').setCheck('Number').appendField('min/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds an inspection / QA operation, charged at QC rates.');
    },
  };

  // Pack & label — minutes per unit for pack-out before dispatch.
  Blockly.Blocks['mw_op_pack'] = {
    init() {
      this.appendDummyInput()
        .appendField('Pack & label')
        .appendField(new Blockly.FieldTextInput('Crate'), 'NAME');
      this.appendValueInput('MIN').setCheck('Number').appendField('min/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds a pack-out operation before shipping.');
    },
  };

  // Palletise / strap — minutes per pallet for pallet-build / strapping ahead
  // of shipping to the freight forwarder. Charged to PACK workcentre.
  Blockly.Blocks['mw_op_palletise'] = {
    init() {
      this.appendDummyInput().appendField('Palletise & strap');
      this.appendValueInput('PALLETS').setCheck('Number').appendField('pallets');
      this.appendValueInput('MIN_PER').setCheck('Number').appendField('min/pallet');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds palletising / strapping minutes ahead of dispatch.');
    },
  };

  // Kit / pick — pulling components from stores into a kit prior to assembly.
  Blockly.Blocks['mw_op_kit'] = {
    init() {
      this.appendDummyInput().appendField('Kit / pick');
      this.appendValueInput('LINES').setCheck('Number').appendField('lines');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/line');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds a kit-build / pick operation, charged to ASSY.');
    },
  };

  // ── Machining (mill / lathe / EDM) ─────────────────────────────────────────
  // 3-axis CNC mill — explicit setup vs run minutes; rolled into a generic
  // operation on the MILL workcentre. Setup is typically the long pole on
  // milled jobs (workholding + tooling), so we expose it directly.
  Blockly.Blocks['mw_op_mill'] = {
    init() {
      this.appendDummyInput().appendField('CNC mill');
      this.appendValueInput('SETUP').setCheck('Number').appendField('setup min');
      this.appendValueInput('RUN').setCheck('Number').appendField('run min/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a CNC milling operation: setup minutes + run minutes per unit.');
    },
  };

  // CNC lathe — same shape as mill (setup vs run), different workcentre so
  // the scheduler can split machining across mill and turning capacity.
  Blockly.Blocks['mw_op_lathe'] = {
    init() {
      this.appendDummyInput().appendField('CNC lathe turn');
      this.appendValueInput('SETUP').setCheck('Number').appendField('setup min');
      this.appendValueInput('RUN').setCheck('Number').appendField('run min/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a CNC turning operation on the lathe.');
    },
  };

  // Wire EDM — length × sec/mm, rough setup. Charged to EDM workcentre.
  Blockly.Blocks['mw_op_edm'] = {
    init() {
      this.appendDummyInput().appendField('Wire EDM');
      this.appendValueInput('LENGTH_MM').setCheck('Number').appendField('cut length mm');
      this.appendValueInput('SEC_PER_MM').setCheck('Number').appendField('sec/mm');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a wire EDM operation, time = length × sec/mm.');
    },
  };

  // Countersink — fast secondary op on already-drilled holes. Count × sec/each.
  Blockly.Blocks['mw_op_countersink'] = {
    init() {
      this.appendDummyInput().appendField('Countersink');
      this.appendValueInput('COUNT').setCheck('Number').appendField('count');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/each');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a countersink operation on a set of holes.');
    },
  };

  // Ream — precision finishing pass on holes. Count × sec/each.
  Blockly.Blocks['mw_op_ream'] = {
    init() {
      this.appendDummyInput().appendField('Ream holes');
      this.appendValueInput('COUNT').setCheck('Number').appendField('count');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/each');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a ream / precision-hole operation.');
    },
  };

  // Deburr — perimeter-based finishing pass. Charged to FINISH workcentre.
  Blockly.Blocks['mw_op_deburr'] = {
    init() {
      this.appendDummyInput().appendField('Deburr');
      this.appendValueInput('LENGTH_MM').setCheck('Number').appendField('length mm');
      this.appendValueInput('SEC_PER_MM').setCheck('Number').appendField('sec/mm');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a deburring operation, time = length × sec/mm.');
    },
  };

  // Polish / linish — area-based fine surface finishing.
  Blockly.Blocks['mw_op_polish'] = {
    init() {
      this.appendDummyInput().appendField('Polish');
      this.appendValueInput('AREA').setCheck('Number').appendField('area m²');
      this.appendValueInput('SEC_PER_M2').setCheck('Number').appendField('sec/m²');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a polishing operation, time = area × sec/m².');
    },
  };

  // Vibratory tumble — batch finishing. Single setup + run minutes (one cycle).
  Blockly.Blocks['mw_op_tumble'] = {
    init() {
      this.appendDummyInput().appendField('Vibratory tumble');
      this.appendValueInput('CYCLE_MIN').setCheck('Number').appendField('cycle min');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a vibratory / tumble finishing cycle (batch operation).');
    },
  };

  // Bead / shot blast — area-based surface prep, distinct from sandblast in the
  // shop because it uses a finer media. Charged to BLAST workcentre.
  Blockly.Blocks['mw_op_bead_blast'] = {
    init() {
      this.appendDummyInput().appendField('Bead blast');
      this.appendValueInput('AREA').setCheck('Number').appendField('area m²');
      this.appendValueInput('SEC_PER_M2').setCheck('Number').appendField('sec/m²');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a bead / shot-blast surface prep operation.');
    },
  };

  // Powder coat — full coat process minutes (mask + spray + bake), area-based.
  // Charged to COAT workcentre. Distinct from `mw_apply_finish` (which adds it
  // as a *cost* line) — this surfaces the *time* on the schedule.
  Blockly.Blocks['mw_op_powder_coat'] = {
    init() {
      this.appendDummyInput().appendField('Powder coat');
      this.appendValueInput('AREA').setCheck('Number').appendField('area m²');
      this.appendValueInput('MIN_PER_M2').setCheck('Number').appendField('min/m²');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds powder-coat process minutes (prep + spray + bake) on the schedule.');
    },
  };

  // Anodise prep — minutes spent racking + chemistry-prep before the anodise
  // line. Charged to COAT workcentre.
  Blockly.Blocks['mw_op_anodise'] = {
    init() {
      this.appendDummyInput().appendField('Anodise');
      this.appendValueInput('AREA').setCheck('Number').appendField('area m²');
      this.appendValueInput('MIN_PER_M2').setCheck('Number').appendField('min/m²');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds anodising process minutes (rack + bath + seal).');
    },
  };

  // Heat treat — flat hours per batch (kiln cycle is the constraint, not part
  // count). Authored as hours in the field, generator converts to minutes.
  Blockly.Blocks['mw_op_heat_treat'] = {
    init() {
      this.appendDummyInput()
        .appendField('Heat treat')
        .appendField(
          new Blockly.FieldDropdown([
            ['Anneal', 'ANNEAL'],
            ['Normalise', 'NORMALISE'],
            ['Harden', 'HARDEN'],
            ['Temper', 'TEMPER'],
            ['Stress relieve', 'STRESS'],
          ]),
          'PROCESS',
        );
      this.appendValueInput('HOURS').setCheck('Number').appendField('hours');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_FINISH);
      this.setTooltip('Adds a heat-treatment cycle measured in hours per batch.');
    },
  };

  // Tack weld — small spot welds for fit-up before final pass. Count × sec/tack.
  Blockly.Blocks['mw_op_tack_weld'] = {
    init() {
      this.appendDummyInput().appendField('Tack weld');
      this.appendValueInput('COUNT').setCheck('Number').appendField('tacks');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/tack');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_WELDING);
      this.setTooltip('Adds tack-weld minutes (typically before a full weld pass).');
    },
  };

  // Spot weld — resistance-welded joints, count × sec/spot.
  Blockly.Blocks['mw_op_spot_weld'] = {
    init() {
      this.appendDummyInput().appendField('Resistance spot weld');
      this.appendValueInput('COUNT').setCheck('Number').appendField('spots');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/spot');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_WELDING);
      this.setTooltip('Adds a resistance spot-weld operation, count × sec/spot.');
    },
  };

  // Laser engrave / etch — text or graphic engraving on a part face.
  Blockly.Blocks['mw_op_engrave'] = {
    init() {
      this.appendDummyInput()
        .appendField('Laser engrave')
        .appendField(new Blockly.FieldTextInput('Part #'), 'TEXT');
      this.appendValueInput('SECONDS').setCheck('Number').appendField('sec/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_CUTTING);
      this.setTooltip('Adds a laser-engrave operation (part marking / serialisation).');
    },
  };

  // Dimensional QC — flat seconds per check × number of checks. Charged to QC.
  Blockly.Blocks['mw_op_qc_dimensional'] = {
    init() {
      this.appendDummyInput().appendField('QC dimensional check');
      this.appendValueInput('CHECKS').setCheck('Number').appendField('checks');
      this.appendValueInput('SEC_PER').setCheck('Number').appendField('sec/check');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds dimensional inspection minutes (CMM, calipers, gauges).');
    },
  };

  // First-article inspection — flat minutes per first-off. Triggered once per run.
  Blockly.Blocks['mw_op_qc_first_article'] = {
    init() {
      this.appendDummyInput().appendField('First-article inspection');
      this.appendValueInput('MIN').setCheck('Number').appendField('minutes');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ASSEMBLY);
      this.setTooltip('Adds first-article inspection minutes (one-off per run).');
    },
  };

  // ── Operations (generic catch-all) ─────────────────────────────────────────
  Blockly.Blocks['mw_operation'] = {
    init() {
      this.appendDummyInput()
        .appendField('Operation')
        .appendField(new Blockly.FieldTextInput('Laser cut'), 'NAME')
        .appendField('@')
        .appendField(
          new Blockly.FieldDropdown([
            ['Laser', 'LASER'],
            ['Plasma', 'PLASMA'],
            ['Waterjet', 'WATERJET'],
            ['Shear', 'SHEAR'],
            ['Punch', 'PUNCH'],
            ['Press brake', 'BRAKE'],
            ['Plate roll', 'ROLL'],
            ['CNC mill', 'MILL'],
            ['CNC lathe', 'LATHE'],
            ['Wire EDM', 'EDM'],
            ['Drill', 'DRILL'],
            ['Welding', 'WELD'],
            ['Spot weld', 'SPOT'],
            ['Heat treat', 'HEAT'],
            ['Bead blast', 'BLAST'],
            ['Powder coat', 'COAT'],
            ['Surface finish', 'FINISH'],
            ['Assembly', 'ASSY'],
            ['QC', 'QC'],
            ['Pack & ship', 'PACK'],
          ]),
          'WORK_CENTRE',
        );
      this.appendValueInput('SETUP').setCheck('Number').appendField('setup min');
      this.appendValueInput('RUN').setCheck('Number').appendField('run min/unit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_OPERATION);
      this.setTooltip('Adds a generic operation line to the work order.');
    },
  };

  // ── Costs ──────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_cost_adjust'] = {
    init() {
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['Material', 'material'],
            ['Labour', 'labour'],
            ['Machine', 'machine'],
            ['Overhead', 'overhead'],
            ['Margin', 'margin'],
          ]),
          'CATEGORY',
        )
        .appendField(new Blockly.FieldTextInput('Setup fee'), 'LABEL');
      this.appendValueInput('AMOUNT').setCheck('Number').appendField('AUD');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_COST);
      this.setTooltip('Adds a cost adjustment to the rollup.');
    },
  };

  Blockly.Blocks['mw_cost_overhead_pct'] = {
    init() {
      this.appendDummyInput()
        .appendField('Add overhead')
        // Inline 0–50% slider — typical shop overhead lives in this range, so
        // capping the slider keeps the affordance focused.
        .appendField(new FieldSlider(12, 0, 50, 0.5), 'PCT_INLINE')
        .appendField('%');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_COST);
      this.setTooltip('Charges overhead as a % of material + labour + machine.');
    },
  };

  Blockly.Blocks['mw_cost_margin_pct'] = {
    init() {
      this.appendDummyInput()
        .appendField('Add margin')
        // Margin runs higher than overhead — slider goes up to 100 %.
        .appendField(new FieldSlider(25, 0, 100, 1), 'PCT_INLINE')
        .appendField('%');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_COST);
      this.setTooltip('Marks the running subtotal up by this margin.');
    },
  };

  // ── Output (BOM / warnings) ────────────────────────────────────────────────
  Blockly.Blocks['mw_add_bom_line'] = {
    init() {
      this.appendDummyInput()
        .appendField('Add BOM line')
        .appendField(new Blockly.FieldTextInput('Mounting bracket'), 'NAME')
        .appendField('SKU')
        .appendField(new Blockly.FieldTextInput('BKT-001'), 'SKU');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_OUTPUT);
      this.setTooltip('Adds a phantom line to the BOM.');
    },
  };

  Blockly.Blocks['mw_add_material_bom'] = {
    init() {
      // Searchable picker on row 1; optional value socket on row 2 so dynamic
      // recipes (`mw_input_material` → get variable) still work.
      this.setInputsInline(false);
      this.appendDummyInput()
        .appendField('Add material to BOM')
        .appendField(new FieldSearchableDropdown(buildMaterialPickerOptions), 'MATERIAL_ID');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.appendValueInput('MATERIAL')
        .setCheck(['Material', 'String'])
        .appendField('or drag material / expression (optional)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_OUTPUT);
      this.setTooltip(
        'Pick a material from your library (search inline). Use the optional socket for a dynamic expression (variable, input material, etc.) — it overrides the picker when connected.',
      );
    },
  };

  Blockly.Blocks['mw_apply_finish'] = {
    init() {
      // Same loosening as mw_add_material_bom — accept either a static
      // `mw_finish_ref` chip OR a get-var pointing at an `mw_input_finish` decl.
      this.appendValueInput('FINISH')
        .setCheck(['Finish', 'String'])
        .appendField('Apply finish');
      this.appendValueInput('AREA').setCheck('Number').appendField('area m²');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_OUTPUT);
      this.setTooltip('Charges a finish over a given surface area.');
    },
  };

  Blockly.Blocks['mw_show_warning'] = {
    init() {
      this.appendDummyInput()
        .appendField('Show warning')
        .appendField(new Blockly.FieldTextInput('Heads up'), 'MESSAGE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_OUTPUT);
      this.setTooltip('Surfaces a warning in the configuration preview.');
    },
  };

  // ── Time helpers (Calculate ▸ Time) ────────────────────────────────────────
  // Times are normalised to **minutes** internally so they compose freely with
  // the existing operation time math (which is also in minutes — see all the
  // `runMinutesPerUnit` calls in the generator). The literal block carries a
  // unit dropdown so the user can author "2 hours" / "0.5 days" naturally and
  // the generator converts to the canonical minutes value at translation time.
  // The conversion math lives in the *generator* (so the IR stays a plain
  // number) — the block UI just collects the inputs.

  // Time literal — number + unit (sec/min/hr/day). Outputs minutes.
  Blockly.Blocks['mw_time_literal'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(15, 0), 'AMOUNT')
        .appendField(
          new Blockly.FieldDropdown([
            ['sec', 'sec'],
            ['min', 'min'],
            ['hr', 'hr'],
            ['day', 'day'],
          ]),
          'UNIT',
        );
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_TIME);
      this.setTooltip(
        'A time literal with units. Outputs the equivalent in minutes — drop into any operation\'s setup or run socket.',
      );
    },
  };

  // Convert minutes → another unit. Useful when surfacing a cycle time in a
  // BOM warning or as an output to another system.
  Blockly.Blocks['mw_time_convert'] = {
    init() {
      this.appendDummyInput().appendField('convert');
      this.appendValueInput('VALUE').setCheck('Number').appendField('min');
      this.appendDummyInput()
        .appendField('to')
        .appendField(
          new Blockly.FieldDropdown([
            ['sec', 'sec'],
            ['min', 'min'],
            ['hr', 'hr'],
            ['day', 'day'],
          ]),
          'UNIT',
        );
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_TIME);
      this.setTooltip(
        'Converts a value in minutes to seconds, hours or days. Day = 8 working hours; tweak in shop settings later.',
      );
    },
  };

  // Sum two times in minutes — exists so the Time category has an arithmetic
  // affordance without leaving the user to find Math ▸ +.
  Blockly.Blocks['mw_time_sum'] = {
    init() {
      this.appendValueInput('A').setCheck('Number').appendField('time');
      this.appendValueInput('B').setCheck('Number').appendField('+');
      this.appendDummyInput().appendField('min');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_TIME);
      this.setTooltip('Adds two time values (both in minutes).');
    },
  };

  // ── Cost helpers (Calculate ▸ Costs) ───────────────────────────────────────
  // All cost helpers output a Number representing AUD. The literal block exists
  // so the user can author "$5.50" with a clear AUD label rather than dropping
  // a bare number block — much harder to misread when scanning a recipe.

  // Money literal — A$ amount.
  Blockly.Blocks['mw_aud_literal'] = {
    init() {
      this.appendDummyInput()
        .appendField('A$')
        .appendField(new Blockly.FieldNumber(0, 0, undefined, 0.01), 'AMOUNT');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_MONEY);
      this.setTooltip(
        'An AUD money literal. Outputs the dollar amount as a Number — plug into any cost socket.',
      );
    },
  };

  // qty × unit cost — the most common cost calc by far. Output is AUD.
  Blockly.Blocks['mw_cost_per_unit'] = {
    init() {
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.appendValueInput('UNIT_COST')
        .setCheck('Number')
        .appendField('× A$/ea');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_MONEY);
      this.setTooltip(
        'Per-unit cost: qty × unit cost. Outputs AUD. Drop into a cost adjust block to add it to the rollup.',
      );
    },
  };

  // hours × rate/hour — labour cost shorthand. Inputs in HOURS to match the
  // way Australian shops quote labour ("$110/h × 2.5 h"). The generator
  // multiplies them straight through (no minute conversion) so the user's
  // mental model stays clean.
  Blockly.Blocks['mw_cost_hourly'] = {
    init() {
      this.appendValueInput('HOURS').setCheck('Number').appendField('hours');
      this.appendValueInput('RATE')
        .setCheck('Number')
        .appendField('× A$/h');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_MONEY);
      this.setTooltip(
        'Labour cost: hours × rate per hour. Outputs AUD.',
      );
    },
  };

  // Subtotal — adds two AUD values. Same shape as mw_arithmetic ADD but lives
  // in the Cost category so the user finds it next to the other money helpers.
  Blockly.Blocks['mw_cost_subtotal'] = {
    init() {
      this.appendValueInput('A').setCheck('Number').appendField('A$');
      this.appendValueInput('B').setCheck('Number').appendField('+ A$');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(HUE_MONEY);
      this.setTooltip('Adds two AUD subtotals.');
    },
  };

  // ── ERP Actions (Compose ▸ Actions) ────────────────────────────────────────
  // Statement blocks that emit a side-effect on the wider ERP. They don't
  // affect the BOM/cost rollup directly — instead they queue an `ActionItem`
  // into the evaluator's `actions` array, which the Actions tab in the studio
  // surfaces and the rest of the platform (Plan / Make / Buy) can consume to
  // create real records when the recipe is run for a customer order.
  //
  // For the Studio v2 prototype the actions are *previewed* in the right-hand
  // panel — they show up as "would create…" cards. Wiring them to the actual
  // Linear / Plan / Buy create endpoints is a Phase 4 task; the schema is the
  // hard part and lives here.

  Blockly.Blocks['mw_action_create_work_order'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create work order')
        .appendField(new Blockly.FieldTextInput('Production run'), 'TITLE');
      this.appendValueInput('PRODUCT')
        .setCheck(['Product', 'String'])
        .appendField('for');
      this.appendValueInput('QTY').setCheck('Number').appendField('×');
      this.appendDummyInput()
        .appendField('priority')
        .appendField(
          new Blockly.FieldDropdown([
            ['Standard', 'standard'],
            ['Urgent', 'urgent'],
            ['Hot', 'hot'],
          ]),
          'PRIORITY',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Queues a Make work order for the chosen product. Previewed in the Actions tab; published when the recipe runs against a real customer order.',
      );
    },
  };

  Blockly.Blocks['mw_action_create_plan_activity'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create Plan activity')
        .appendField(new Blockly.FieldTextInput('Schedule on press brake'), 'TITLE');
      this.appendDummyInput()
        .appendField('lane')
        .appendField(
          new Blockly.FieldDropdown([
            ['Laser', 'LASER'],
            ['Press brake', 'BRAKE'],
            ['Welding', 'WELD'],
            ['Powder coat', 'COAT'],
            ['Assembly', 'ASSY'],
            ['QA', 'QC'],
            ['Pack & ship', 'PACK'],
          ]),
          'LANE',
        );
      this.appendValueInput('DURATION_MIN')
        .setCheck('Number')
        .appendField('minutes');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Books an activity onto a Plan lane. Use to reserve press-brake / weld / coat capacity ahead of the actual work order.',
      );
    },
  };

  Blockly.Blocks['mw_action_send_alert'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Send alert')
        .appendField(
          new Blockly.FieldDropdown([
            ['Sales', 'sales'],
            ['Production', 'production'],
            ['Buying', 'buying'],
            ['QA', 'qa'],
          ]),
          'CHANNEL',
        );
      this.appendDummyInput()
        .appendField('message')
        .appendField(
          new Blockly.FieldTextInput('Long-lead material — confirm stock'),
          'MESSAGE',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Sends a notification to a team channel when this branch of the recipe runs. Pair with an If block to alert only when a condition trips.',
      );
    },
  };

  Blockly.Blocks['mw_action_create_purchase_request'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create purchase request')
        .appendField(new Blockly.FieldTextInput('Stock top-up'), 'TITLE');
      // Accept ['Material', 'String'] so the action can be triggered by a
      // dynamic material chosen via an input variable, not just a static chip.
      this.appendValueInput('MATERIAL')
        .setCheck(['Material', 'String'])
        .appendField('material');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Drops a purchase request into Buy for the chosen material. Use inside an If to trigger reorder when stock falls below a threshold.',
      );
    },
  };

  // ── Expanded action vocabulary (Phase 3b) ────────────────────────────────
  //
  // Every action block below follows the same shape so the generator can
  // lower them uniformly:
  //   • statement block (previous/next), colour HUE_ACTION
  //   • TITLE: plain text, shown as the first chip on the row
  //   • optional typed value sockets (PRODUCT / MATERIAL / QTY / DURATION_MIN)
  //   • optional static dropdown fields that drop straight into the payload
  // The generator's `mw_action_*` switch arm mirrors this shape and the
  // evaluator's generic `case 'action'` handler resolves the value sockets
  // from extras.values at run-time.

  // ── Sell ─────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_create_quote'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create quote')
        .appendField(new Blockly.FieldTextInput('Quote'), 'TITLE');
      this.appendValueInput('PRODUCT')
        .setCheck(['Product', 'String'])
        .appendField('for');
      this.appendValueInput('QTY').setCheck('Number').appendField('×');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Drafts a Sell quote for the chosen product and quantity, ready for the customer to accept.',
      );
    },
  };

  Blockly.Blocks['mw_action_create_sales_order'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create sales order')
        .appendField(new Blockly.FieldTextInput('Sales order'), 'TITLE');
      this.appendValueInput('PRODUCT')
        .setCheck(['Product', 'String'])
        .appendField('for');
      this.appendValueInput('QTY').setCheck('Number').appendField('×');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Promotes a quote into a firm sales order. Typically fires on `When a quote is confirmed`.',
      );
    },
  };

  Blockly.Blocks['mw_action_create_invoice'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create invoice')
        .appendField(new Blockly.FieldTextInput('Invoice'), 'TITLE');
      this.appendDummyInput()
        .appendField('terms')
        .appendField(
          new Blockly.FieldDropdown([
            ['7 days', '7'],
            ['14 days', '14'],
            ['30 days', '30'],
            ['60 days', '60'],
          ]),
          'TERMS',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Raises an invoice for the active order. Typically fires on `When this product is delivered`.',
      );
    },
  };

  // ── Plan ─────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_reserve_capacity'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Reserve capacity')
        .appendField(
          new Blockly.FieldDropdown([
            ['Laser', 'LASER'],
            ['Press brake', 'BRAKE'],
            ['Welding', 'WELD'],
            ['Powder coat', 'COAT'],
            ['Assembly', 'ASSY'],
            ['QA', 'QC'],
          ]),
          'LANE',
        );
      this.appendValueInput('DURATION_MIN')
        .setCheck('Number')
        .appendField('minutes');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Soft-books capacity on a cell ahead of the work order being created. Prevents a hot order from being quoted past the lane\'s real availability.',
      );
    },
  };

  Blockly.Blocks['mw_action_push_nc_program'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Push NC program')
        .appendField(new Blockly.FieldTextInput('Nest.nc'), 'PROGRAM');
      this.appendDummyInput()
        .appendField('to')
        .appendField(
          new Blockly.FieldDropdown([
            ['Laser', 'LASER'],
            ['Plasma', 'PLASMA'],
            ['Waterjet', 'WATERJET'],
            ['Mill', 'MILL'],
            ['Lathe', 'LATHE'],
            ['Punch', 'PUNCH'],
          ]),
          'MACHINE',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Uploads an NC program to the chosen machine via NC Connect. Fires typically on `When a work order starts`.',
      );
    },
  };

  // ── Production / Make ────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_create_mo'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create manufacturing order')
        .appendField(new Blockly.FieldTextInput('MO'), 'TITLE');
      this.appendValueInput('PRODUCT')
        .setCheck(['Product', 'String'])
        .appendField('for');
      this.appendValueInput('QTY').setCheck('Number').appendField('×');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Raises a manufacturing order that spawns the work orders on the shop floor. Typically fires on `When an order is placed`.',
      );
    },
  };

  Blockly.Blocks['mw_action_record_qc'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Record QC')
        .appendField(new Blockly.FieldTextInput('Dimensional check'), 'CHECK')
        .appendField(
          new Blockly.FieldDropdown([
            ['Pass', 'pass'],
            ['Fail', 'fail'],
            ['Hold', 'hold'],
          ]),
          'RESULT',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Writes a QC event against the active work order. Typically fires on `When a work order completes`.',
      );
    },
  };

  Blockly.Blocks['mw_action_clock_on'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Clock operator on')
        .appendField(
          new Blockly.FieldDropdown([
            ['Laser', 'LASER'],
            ['Press brake', 'BRAKE'],
            ['Welding', 'WELD'],
            ['Powder coat', 'COAT'],
            ['Assembly', 'ASSY'],
            ['QA', 'QC'],
          ]),
          'LANE',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Starts a cell-level operator timer for the active work order. Fires typically on `When a work order starts`.',
      );
    },
  };

  // ── Buy ──────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_create_po'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create purchase order')
        .appendField(new Blockly.FieldTextInput('PO'), 'TITLE');
      this.appendValueInput('MATERIAL')
        .setCheck(['Material', 'String'])
        .appendField('material');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Raises a firm purchase order against the chosen material. Use for long-lead buys that need to commit early.',
      );
    },
  };

  Blockly.Blocks['mw_action_reserve_stock'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Reserve stock')
        .appendField(new Blockly.FieldTextInput('Allocation'), 'TITLE');
      this.appendValueInput('MATERIAL')
        .setCheck(['Material', 'String'])
        .appendField('material');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Soft-allocates on-hand stock against the active order so a later hot order can\'t pull the same material.',
      );
    },
  };

  // ── Stock ────────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_stock_adjust'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Stock adjust')
        .appendField(
          new Blockly.FieldDropdown([
            ['Consume', 'consume'],
            ['Return', 'return'],
            ['Scrap', 'scrap'],
          ]),
          'DIRECTION',
        );
      this.appendValueInput('MATERIAL')
        .setCheck(['Material', 'String'])
        .appendField('material');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Writes a stock movement (consume / return / scrap) against the chosen material.',
      );
    },
  };

  // ── People (comms) ───────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_create_task'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Create task')
        .appendField(new Blockly.FieldTextInput('Follow-up'), 'TITLE')
        .appendField('assign to')
        .appendField(
          new Blockly.FieldDropdown([
            ['Sales', 'sales'],
            ['Production', 'production'],
            ['Buying', 'buying'],
            ['QA', 'qa'],
            ['Dispatch', 'dispatch'],
          ]),
          'TEAM',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Creates a follow-up task assigned to a team. Previews in the Actions tab.',
      );
    },
  };

  Blockly.Blocks['mw_action_send_sms'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Send SMS')
        .appendField(new Blockly.FieldTextInput('Your order is on its way'), 'MESSAGE');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Sends a text message to the customer. Typically fires on `When this product is delivered`.',
      );
    },
  };

  // ── Integrate ────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_action_webhook'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Call webhook')
        .appendField(new Blockly.FieldTextInput('https://example.com/hook'), 'URL');
      this.appendDummyInput()
        .appendField('method')
        .appendField(
          new Blockly.FieldDropdown([
            ['POST', 'POST'],
            ['PUT', 'PUT'],
            ['PATCH', 'PATCH'],
          ]),
          'METHOD',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Fires an HTTP request at an external system. Use for any integration not already in this vocabulary.',
      );
    },
  };

  Blockly.Blocks['mw_action_push_accounting'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶ Push to accounting')
        .appendField(
          new Blockly.FieldDropdown([
            ['Xero', 'xero'],
            ['MYOB', 'myob'],
            ['QuickBooks', 'quickbooks'],
          ]),
          'SYSTEM',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['Invoice', 'invoice'],
            ['Bill', 'bill'],
            ['Credit note', 'credit'],
          ]),
          'DOCTYPE',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(HUE_ACTION);
      this.setTooltip(
        'Pushes a finance document into the connected accounting system.',
      );
    },
  };
}
