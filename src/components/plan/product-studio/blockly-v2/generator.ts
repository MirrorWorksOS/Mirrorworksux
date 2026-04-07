/**
 * Product Studio v2 — Blockly → engine JSON generator.
 *
 * Walks the workspace's top-level trigger blocks and emits a
 * `ProductDefinitionEngine` plus a sidecar `StudioV2Extras` describing the
 * v2-only constructs (material refs, finish refs, get-variable expressions)
 * that the v1 engine doesn't natively model.
 *
 * Design notes:
 *  - The v1 engine is the source of truth for evaluation. We translate where
 *    we can; everything else lands in `extras` where the v2 evaluator can find it.
 *  - Sub-statements under a `mw_when_configured` hat are flattened into
 *    `engine.rootBlocks`. Multiple hats are concatenated.
 *  - Value sockets recurse into a typed `ValueExpr` so the evaluator can
 *    fold expressions at run-time.
 */

import * as Blockly from 'blockly/core';
import type {
  EngineBlock,
  EngineCondition,
  EngineCompareOp,
  IfBranch,
  ProductDefinitionEngine,
} from '@/lib/product-studio/types';
import { ENGINE_SCHEMA_VERSION } from '@/lib/product-studio/types';

// ── Value expression IR ──────────────────────────────────────────────────────
// We attach this to engine blocks via the `extras.values` map keyed by block id.
// The runtime evaluator uses it to compute numeric inputs (qty / area / etc.)
// from the block tree, instead of the v1 engine's literal-only model.

// v2-only compare op set. Strict superset of v1's `EngineCompareOp` with the
// inclusive `>=` / `<=` variants the `mw_compare` block UI exposes. Kept local
// to the v2 generator/evaluator so we don't ripple through v1 callers.
export type V2CompareOp =
  | EngineCompareOp
  | 'greater_or_equal'
  | 'less_or_equal';

export type ValueExpr =
  | { kind: 'number'; value: number }
  | { kind: 'text'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'var'; name: string }
  | { kind: 'arith'; op: 'ADD' | 'SUB' | 'MUL' | 'DIV'; a: ValueExpr; b: ValueExpr }
  | { kind: 'round'; op: 'ROUND' | 'FLOOR' | 'CEIL'; value: ValueExpr }
  | { kind: 'minmax'; op: 'MIN' | 'MAX'; a: ValueExpr; b: ValueExpr }
  | { kind: 'compare'; op: V2CompareOp; a: ValueExpr; b: ValueExpr }
  | { kind: 'logic'; op: 'AND' | 'OR'; a: ValueExpr; b: ValueExpr }
  | { kind: 'material_ref'; id: string; label: string }
  | { kind: 'finish_ref'; id: string; label: string }
  | { kind: 'product_ref'; id: string; label: string };

const ZERO: ValueExpr = { kind: 'number', value: 0 };
const EMPTY: ValueExpr = { kind: 'text', value: '' };

/**
 * Maps `mw_compare`'s UI op set onto the v2 compare op vocabulary.
 *
 * v2 owns its own `V2CompareOp` (a strict superset of v1's `EngineCompareOp`)
 * so the inclusive `<=` / `>=` variants round-trip losslessly into the
 * evaluator. v1's vocabulary stays untouched — we don't widen the engine type.
 */
const COMPARE_MAP: Record<string, V2CompareOp> = {
  EQ: 'equals',
  NEQ: 'not_equals',
  LT: 'less_than',
  GT: 'greater_than',
  LTE: 'less_or_equal',
  GTE: 'greater_or_equal',
};

// ── Sidecar value table ──────────────────────────────────────────────────────
// Block id → expression payload, so the evaluator can re-eval on selection change.
export interface StudioV2Extras {
  /** ValueExpr trees keyed by the engine block id that owns them. */
  values: Record<string, Record<string, ValueExpr>>;
  /** Set-variable mode: 'expression' means the evaluator should resolve via values. */
  setVariableMode: Record<string, 'literal' | 'expression'>;
  /** mw_add_bom_line / mw_add_material_bom payload metadata. */
  bomMeta: Record<
    string,
    | { kind: 'phantom' }
    | { kind: 'material'; materialId: string; materialLabel: string }
  >;
  /** mw_apply_finish payload metadata. */
  finishMeta: Record<string, { finishId: string; finishLabel: string }>;
  /** mw_operation work centre. */
  operationMeta: Record<string, { workCentre: string }>;
  /** Percentage-based cost adjustments (overhead/margin %) — block id → pct. */
  costPctMeta: Record<string, { kind: 'overhead' | 'margin'; pctExpr: ValueExpr }>;
}

export function emptyExtras(): StudioV2Extras {
  return {
    values: {},
    setVariableMode: {},
    bomMeta: {},
    finishMeta: {},
    operationMeta: {},
    costPctMeta: {},
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function readValue(input: Blockly.Block | null): ValueExpr {
  if (!input) return ZERO;

  switch (input.type) {
    case 'mw_number':
      return { kind: 'number', value: Number(input.getFieldValue('VALUE') ?? 0) };

    case 'mw_text':
      return { kind: 'text', value: String(input.getFieldValue('VALUE') ?? '') };

    case 'mw_boolean':
      return {
        kind: 'boolean',
        value: input.getFieldValue('VALUE') === 'TRUE',
      };

    case 'mw_get_variable':
      return { kind: 'var', name: String(input.getFieldValue('NAME') ?? '') };

    case 'mw_arithmetic':
      return {
        kind: 'arith',
        op: (input.getFieldValue('OP') ?? 'ADD') as 'ADD' | 'SUB' | 'MUL' | 'DIV',
        a: readValue(input.getInputTargetBlock('A')),
        b: readValue(input.getInputTargetBlock('B')),
      };

    case 'mw_round':
      return {
        kind: 'round',
        op: (input.getFieldValue('OP') ?? 'ROUND') as 'ROUND' | 'FLOOR' | 'CEIL',
        value: readValue(input.getInputTargetBlock('VALUE')),
      };

    case 'mw_min_max':
      return {
        kind: 'minmax',
        op: (input.getFieldValue('OP') ?? 'MIN') as 'MIN' | 'MAX',
        a: readValue(input.getInputTargetBlock('A')),
        b: readValue(input.getInputTargetBlock('B')),
      };

    case 'mw_percent': {
      // value × pct%  ≡  (value × pct) ÷ 100. PCT is an inline slider field.
      const v = readValue(input.getInputTargetBlock('VALUE'));
      const pctNum = Number(input.getFieldValue('PCT_INLINE') ?? 0);
      return {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: v, b: { kind: 'number', value: pctNum } },
        b: { kind: 'number', value: 100 },
      };
    }

    // ── Geometry reporters ─────────────────────────────────────────────────
    case 'mw_geom_area_rect': {
      const l = readValue(input.getInputTargetBlock('L'));
      const w = readValue(input.getInputTargetBlock('W'));
      return { kind: 'arith', op: 'MUL', a: l, b: w };
    }

    case 'mw_geom_perimeter_rect': {
      const l = readValue(input.getInputTargetBlock('L'));
      const w = readValue(input.getInputTargetBlock('W'));
      // 2 × (L + W)
      return {
        kind: 'arith',
        op: 'MUL',
        a: { kind: 'number', value: 2 },
        b: { kind: 'arith', op: 'ADD', a: l, b: w },
      };
    }

    case 'mw_geom_volume_box': {
      const l = readValue(input.getInputTargetBlock('L'));
      const w = readValue(input.getInputTargetBlock('W'));
      const h = readValue(input.getInputTargetBlock('H'));
      // L × W × H
      return {
        kind: 'arith',
        op: 'MUL',
        a: { kind: 'arith', op: 'MUL', a: l, b: w },
        b: h,
      };
    }

    case 'mw_geom_weight': {
      // mass_kg = volume_mm3 × density_g_per_cm3 × 1e-6
      // (1 cm³ = 1000 mm³, 1 kg = 1000 g  →  g/cm³ × mm³ ÷ 1e6 = kg)
      const vol = readValue(input.getInputTargetBlock('VOLUME'));
      const dens = readValue(input.getInputTargetBlock('DENSITY'));
      return {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: vol, b: dens },
        b: { kind: 'number', value: 1_000_000 },
      };
    }

    case 'mw_geom_sheet_area': {
      // area × (1 + scrap/100) ≡ area + area × scrap / 100
      const area = readValue(input.getInputTargetBlock('AREA'));
      const scrap = readValue(input.getInputTargetBlock('SCRAP'));
      return {
        kind: 'arith',
        op: 'ADD',
        a: area,
        b: {
          kind: 'arith',
          op: 'DIV',
          a: { kind: 'arith', op: 'MUL', a: area, b: scrap },
          b: { kind: 'number', value: 100 },
        },
      };
    }

    case 'mw_compare': {
      const opCode = (input.getFieldValue('OP') ?? 'EQ') as keyof typeof COMPARE_MAP;
      return {
        kind: 'compare',
        op: COMPARE_MAP[opCode] ?? 'equals',
        a: readValue(input.getInputTargetBlock('A')),
        b: readValue(input.getInputTargetBlock('B')),
      };
    }

    case 'mw_logic_op':
      return {
        kind: 'logic',
        op: (input.getFieldValue('OP') ?? 'AND') as 'AND' | 'OR',
        a: readValue(input.getInputTargetBlock('A')),
        b: readValue(input.getInputTargetBlock('B')),
      };

    case 'mw_material_ref': {
      // Material id rides on `block.data` (set by the toolbox builder).
      const id = (input.data ?? '') as string;
      const label = String(input.getFieldValue('LABEL') ?? '');
      return { kind: 'material_ref', id, label };
    }

    case 'mw_finish_ref': {
      const id = (input.data ?? '') as string;
      const label = String(input.getFieldValue('LABEL') ?? '');
      return { kind: 'finish_ref', id, label };
    }

    case 'mw_product_ref': {
      // The dropdown's *value* is the product id (the menu generator emits
      // [name, id] tuples). Reading the field text via the live block gives us
      // a fresh display label even when the referenced product was renamed
      // since the recipe was authored.
      const id = String(input.getFieldValue('PRODUCT_ID') ?? '');
      const field = input.getField('PRODUCT_ID') as
        | Blockly.Field<unknown>
        | null;
      // FieldDropdown exposes the visible option text via getText(); fall back
      // to the id if the lookup fails (e.g. the chosen product was deleted).
      const label = field ? field.getText() : id;
      return { kind: 'product_ref', id, label };
    }

    // ── Time reporters (Calculate ▸ Time) ──────────────────────────────────
    // The IR is unitless minutes — every Time reporter folds into a plain
    // arith ValueExpr that yields minutes. The block UI lets the user author
    // in seconds / hours / days for ergonomic reasons; the conversion lives
    // here so the engine never has to know about units.
    case 'mw_time_literal': {
      const amount = Number(input.getFieldValue('AMOUNT') ?? 0);
      const unit = String(input.getFieldValue('UNIT') ?? 'min');
      // sec → /60, min → ×1, hr → ×60, day → ×480 (8h working day)
      const minutes =
        unit === 'sec'
          ? amount / 60
          : unit === 'hr'
          ? amount * 60
          : unit === 'day'
          ? amount * 480
          : amount;
      return { kind: 'number', value: minutes };
    }

    case 'mw_time_convert': {
      // Conversion is purely a presentation concern — at IR level we keep
      // the canonical minutes value so downstream math stays consistent.
      // The visual unit dropdown is a hint for the formula tab.
      return readValue(input.getInputTargetBlock('VALUE'));
    }

    case 'mw_time_sum': {
      return {
        kind: 'arith',
        op: 'ADD',
        a: readValue(input.getInputTargetBlock('A')),
        b: readValue(input.getInputTargetBlock('B')),
      };
    }

    // ── Cost (AUD) reporters (Calculate ▸ Costs) ───────────────────────────
    // The IR is unitless AUD — every Cost reporter folds into an arith tree.
    case 'mw_aud_literal':
      return { kind: 'number', value: Number(input.getFieldValue('AMOUNT') ?? 0) };

    case 'mw_cost_per_unit': {
      const qty = readValue(input.getInputTargetBlock('QTY'));
      const unitCost = readValue(input.getInputTargetBlock('UNIT_COST'));
      return { kind: 'arith', op: 'MUL', a: qty, b: unitCost };
    }

    case 'mw_cost_hourly': {
      const hours = readValue(input.getInputTargetBlock('HOURS'));
      const rate = readValue(input.getInputTargetBlock('RATE'));
      return { kind: 'arith', op: 'MUL', a: hours, b: rate };
    }

    case 'mw_cost_subtotal': {
      return {
        kind: 'arith',
        op: 'ADD',
        a: readValue(input.getInputTargetBlock('A')),
        b: readValue(input.getInputTargetBlock('B')),
      };
    }

    default:
      return EMPTY;
  }
}

// ── Statement walker ─────────────────────────────────────────────────────────
function blockToEngine(
  block: Blockly.Block,
  extras: StudioV2Extras,
): EngineBlock | null {
  const id = nextId('blk');

  switch (block.type) {
    // ── Inputs ────────────────────────────────────────────────────────────
    // Translated as set_variable so the rest of the program can read them
    // via mw_get_variable. The default value is recorded as the seed.
    case 'mw_input_dimension':
    case 'mw_input_quantity': {
      const name = String(block.getFieldValue('NAME') ?? '');
      const expr = readValue(block.getInputTargetBlock('DEFAULT'));
      if (expr.kind === 'number') {
        return {
          id,
          type: 'set_variable',
          variableId: name,
          mode: 'literal',
          value: String(expr.value),
        };
      }
      extras.setVariableMode[id] = 'expression';
      extras.values[id] = { VALUE: expr };
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: '',
      };
    }

    case 'mw_input_choice': {
      const name = String(block.getFieldValue('NAME') ?? '');
      const def = String(block.getFieldValue('DEFAULT') ?? '');
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: def,
      };
    }

    case 'mw_input_toggle': {
      const name = String(block.getFieldValue('NAME') ?? '');
      // FieldCheckbox stores 'TRUE' / 'FALSE' as field values.
      const def = block.getFieldValue('DEFAULT') === 'TRUE' ? 'true' : 'false';
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: def,
      };
    }

    case 'mw_input_percent': {
      const name = String(block.getFieldValue('NAME') ?? '');
      const def = String(block.getFieldValue('DEFAULT') ?? '0');
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: def,
      };
    }

    case 'mw_input_text': {
      const name = String(block.getFieldValue('NAME') ?? '');
      const def = String(block.getFieldValue('DEFAULT') ?? '');
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: def,
      };
    }

    case 'mw_input_angle': {
      const name = String(block.getFieldValue('NAME') ?? '');
      const def = String(block.getFieldValue('DEFAULT') ?? '0');
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: def,
      };
    }

    case 'mw_input_material':
    case 'mw_input_finish': {
      // Material / finish pickers default to the empty string at authoring
      // time — the configurator's Inputs sidebar populates them at run time.
      const name = String(block.getFieldValue('NAME') ?? '');
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: '',
      };
    }

    case 'mw_set_variable': {
      const name = String(block.getFieldValue('NAME') ?? '');
      const valueBlock = block.getInputTargetBlock('VALUE');
      const expr = readValue(valueBlock);

      // If the user wired a literal number/text we can compress into v1's
      // literal mode; otherwise we leave the engine block as a literal "" and
      // let the evaluator resolve the expression from extras.
      if (expr.kind === 'number') {
        return {
          id,
          type: 'set_variable',
          variableId: name,
          mode: 'literal',
          value: String(expr.value),
        };
      }
      if (expr.kind === 'text') {
        return {
          id,
          type: 'set_variable',
          variableId: name,
          mode: 'literal',
          value: expr.value,
        };
      }

      extras.setVariableMode[id] = 'expression';
      extras.values[id] = { VALUE: expr };
      return {
        id,
        type: 'set_variable',
        variableId: name,
        mode: 'literal',
        value: '', // resolved via extras at run-time
      };
    }

    case 'controls_if': {
      // Blockly's built-in if-block (with the +/- mutator from
      // @blockly/block-plus-minus) exposes dynamic inputs:
      //   IF0 / DO0       — first branch (always present)
      //   IF1 / DO1, ...  — added elseif branches
      //   ELSE            — optional final else (when present)
      // We walk all of them and translate to an `if_chain` engine block.
      const branches: IfBranch[] = [];
      const valueMap: Record<string, ValueExpr> = {};

      // Discover how many IFn/DOn pairs exist by probing inputs in order.
      let n = 0;
      while (block.getInput(`IF${n}`)) {
        const cond = readValue(block.getInputTargetBlock(`IF${n}`));
        const children = collectStatements(
          block.getInputTargetBlock(`DO${n}`),
          extras,
        );
        // Stash this branch's condition under a synthetic key on the owner.
        valueMap[`COND${n}`] = cond;
        const condition: EngineCondition = {
          id: nextId('cnd'),
          leftVariableId: `__expr__:${id}#${n}`,
          operator: 'equals',
          rightValue: 'true',
        };
        branches.push({
          id: nextId('br'),
          condition,
          children,
        });
        n += 1;
      }

      // Optional ELSE branch (if the user clicked + once more to add it).
      if (block.getInput('ELSE')) {
        const elseChildren = collectStatements(
          block.getInputTargetBlock('ELSE'),
          extras,
        );
        if (elseChildren.length > 0) {
          branches.push({
            id: nextId('br'),
            condition: null,
            children: elseChildren,
          });
        }
      }

      extras.values[id] = valueMap;
      return { id, type: 'if_chain', branches };
    }

    case 'mw_add_bom_line': {
      const qtyExpr = readValue(block.getInputTargetBlock('QTY'));
      const qty = qtyExpr.kind === 'number' ? qtyExpr.value : 1;
      extras.values[id] = { QTY: qtyExpr };
      extras.bomMeta[id] = { kind: 'phantom' };
      return {
        id,
        type: 'bom_phantom',
        name: String(block.getFieldValue('NAME') ?? ''),
        sku: String(block.getFieldValue('SKU') ?? ''),
        quantity: qty,
        unit: 'ea',
      };
    }

    case 'mw_add_material_bom': {
      const matExpr = readValue(block.getInputTargetBlock('MATERIAL'));
      const qtyExpr = readValue(block.getInputTargetBlock('QTY'));
      const matId = matExpr.kind === 'material_ref' ? matExpr.id : '';
      const matLabel = matExpr.kind === 'material_ref' ? matExpr.label : 'Material';
      const qty = qtyExpr.kind === 'number' ? qtyExpr.value : 1;
      extras.values[id] = { QTY: qtyExpr, MATERIAL: matExpr };
      extras.bomMeta[id] = {
        kind: 'material',
        materialId: matId,
        materialLabel: matLabel,
      };
      return {
        id,
        type: 'bom_phantom',
        name: matLabel,
        sku: matId || 'MAT',
        quantity: qty,
        unit: 'ea',
      };
    }

    case 'mw_apply_finish': {
      const finExpr = readValue(block.getInputTargetBlock('FINISH'));
      const areaExpr = readValue(block.getInputTargetBlock('AREA'));
      const finId = finExpr.kind === 'finish_ref' ? finExpr.id : '';
      const finLabel = finExpr.kind === 'finish_ref' ? finExpr.label : 'Finish';
      const area = areaExpr.kind === 'number' ? areaExpr.value : 0;
      extras.values[id] = { FINISH: finExpr, AREA: areaExpr };
      extras.finishMeta[id] = { finishId: finId, finishLabel: finLabel };
      // Treat as a cost adjustment with a placeholder amount; the evaluator
      // resolves the real $ value once it has the finish library + area expr.
      return {
        id,
        type: 'cost_adjust',
        category: 'material',
        label: `Finish: ${finLabel} (${area} m²)`,
        amount: 0,
      };
    }

    case 'mw_operation': {
      const setupExpr = readValue(block.getInputTargetBlock('SETUP'));
      const runExpr = readValue(block.getInputTargetBlock('RUN'));
      extras.values[id] = { SETUP: setupExpr, RUN: runExpr };
      extras.operationMeta[id] = {
        workCentre: String(block.getFieldValue('WORK_CENTRE') ?? ''),
      };
      return {
        id,
        type: 'operation',
        name: String(block.getFieldValue('NAME') ?? ''),
        workCentre: String(block.getFieldValue('WORK_CENTRE') ?? ''),
        setupMinutes: setupExpr.kind === 'number' ? setupExpr.value : 0,
        runMinutesPerUnit: runExpr.kind === 'number' ? runExpr.value : 0,
      };
    }

    // ── Manufacturing operations ──────────────────────────────────────────
    // Each domain block lowers to a generic `operation` engine block with a
    // synthetic RUN expression so the evaluator computes the time at run-time.

    case 'mw_op_laser_cut': {
      // run min = perimeter / cut_rate + (pierces × 1.5 / 60)
      const perim = readValue(block.getInputTargetBlock('PERIMETER'));
      const pierces = readValue(block.getInputTargetBlock('PIERCES'));
      const rate = readValue(block.getInputTargetBlock('CUT_RATE'));
      const setup: ValueExpr = { kind: 'number', value: 5 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'ADD',
        a: { kind: 'arith', op: 'DIV', a: perim, b: rate },
        b: {
          kind: 'arith',
          op: 'DIV',
          a: { kind: 'arith', op: 'MUL', a: pierces, b: { kind: 'number', value: 1.5 } },
          b: { kind: 'number', value: 60 },
        },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'LASER' };
      return {
        id,
        type: 'operation',
        name: 'Laser cut',
        workCentre: 'LASER',
        setupMinutes: 5,
        runMinutesPerUnit: 0,
      };
    }

    case 'mw_op_drill': {
      // run min = count × sec_per / 60
      const count = readValue(block.getInputTargetBlock('COUNT'));
      const secPer = readValue(block.getInputTargetBlock('SEC_PER'));
      const setup: ValueExpr = { kind: 'number', value: 2 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: count, b: secPer },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'DRILL' };
      return {
        id,
        type: 'operation',
        name: 'Drill holes',
        workCentre: 'DRILL',
        setupMinutes: 2,
        runMinutesPerUnit: 0,
      };
    }

    case 'mw_op_tap': {
      const count = readValue(block.getInputTargetBlock('COUNT'));
      const secPer = readValue(block.getInputTargetBlock('SEC_PER'));
      const setup: ValueExpr = { kind: 'number', value: 2 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: count, b: secPer },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'DRILL' };
      return {
        id,
        type: 'operation',
        name: 'Tap thread',
        workCentre: 'DRILL',
        setupMinutes: 2,
        runMinutesPerUnit: 0,
      };
    }

    // Plasma cut — same shape as laser_cut but slightly slower pierce time
    // (2 s per pierce vs 1.5 s) and longer setup. Lowered to a generic
    // operation block on the PLASMA workcentre.
    case 'mw_op_plasma_cut': {
      const perim = readValue(block.getInputTargetBlock('PERIMETER'));
      const pierces = readValue(block.getInputTargetBlock('PIERCES'));
      const rate = readValue(block.getInputTargetBlock('CUT_RATE'));
      const setup: ValueExpr = { kind: 'number', value: 8 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'ADD',
        a: { kind: 'arith', op: 'DIV', a: perim, b: rate },
        b: {
          kind: 'arith',
          op: 'DIV',
          a: { kind: 'arith', op: 'MUL', a: pierces, b: { kind: 'number', value: 2 } },
          b: { kind: 'number', value: 60 },
        },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'PLASMA' };
      return {
        id,
        type: 'operation',
        name: 'Plasma cut',
        workCentre: 'PLASMA',
        setupMinutes: 8,
        runMinutesPerUnit: 0,
      };
    }

    // Waterjet — same shape as laser/plasma; longer pierce time still (3 s)
    // and longer setup as the abrasive feed needs priming.
    case 'mw_op_waterjet': {
      const perim = readValue(block.getInputTargetBlock('PERIMETER'));
      const pierces = readValue(block.getInputTargetBlock('PIERCES'));
      const rate = readValue(block.getInputTargetBlock('CUT_RATE'));
      const setup: ValueExpr = { kind: 'number', value: 12 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'ADD',
        a: { kind: 'arith', op: 'DIV', a: perim, b: rate },
        b: {
          kind: 'arith',
          op: 'DIV',
          a: { kind: 'arith', op: 'MUL', a: pierces, b: { kind: 'number', value: 3 } },
          b: { kind: 'number', value: 60 },
        },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'WATERJET' };
      return {
        id,
        type: 'operation',
        name: 'Waterjet cut',
        workCentre: 'WATERJET',
        setupMinutes: 12,
        runMinutesPerUnit: 0,
      };
    }

    // Shear (guillotine) — count × sec/cut, fast setup.
    case 'mw_op_shear': {
      const count = readValue(block.getInputTargetBlock('COUNT'));
      const secPer = readValue(block.getInputTargetBlock('SEC_PER'));
      const setup: ValueExpr = { kind: 'number', value: 3 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: count, b: secPer },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'SHEAR' };
      return {
        id,
        type: 'operation',
        name: 'Shear cut',
        workCentre: 'SHEAR',
        setupMinutes: 3,
        runMinutesPerUnit: 0,
      };
    }

    // Punch press — count × sec/hit. Workcentre PUNCH so it doesn't share
    // capacity with the laser or shear.
    case 'mw_op_punch': {
      const count = readValue(block.getInputTargetBlock('COUNT'));
      const secPer = readValue(block.getInputTargetBlock('SEC_PER'));
      const setup: ValueExpr = { kind: 'number', value: 6 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: count, b: secPer },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'PUNCH' };
      return {
        id,
        type: 'operation',
        name: 'Punch press',
        workCentre: 'PUNCH',
        setupMinutes: 6,
        runMinutesPerUnit: 0,
      };
    }

    case 'mw_op_bend': {
      const count = readValue(block.getInputTargetBlock('COUNT'));
      const secPer = readValue(block.getInputTargetBlock('SEC_PER'));
      const setup: ValueExpr = { kind: 'number', value: 8 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: count, b: secPer },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'BRAKE' };
      return {
        id,
        type: 'operation',
        name: 'Press brake bend',
        workCentre: 'BRAKE',
        setupMinutes: 8,
        runMinutesPerUnit: 0,
      };
    }

    // Plate-roll — length × sec/mm, like welding. Workcentre ROLL.
    case 'mw_op_roll': {
      const len = readValue(block.getInputTargetBlock('LENGTH_MM'));
      const secPerMm = readValue(block.getInputTargetBlock('SEC_PER_MM'));
      const setup: ValueExpr = { kind: 'number', value: 10 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: len, b: secPerMm },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'ROLL' };
      return {
        id,
        type: 'operation',
        name: 'Plate roll',
        workCentre: 'ROLL',
        setupMinutes: 10,
        runMinutesPerUnit: 0,
      };
    }

    // Grind / linish — length × sec/mm, like welding. Workcentre FINISH.
    case 'mw_op_grind': {
      const len = readValue(block.getInputTargetBlock('LENGTH_MM'));
      const secPerMm = readValue(block.getInputTargetBlock('SEC_PER_MM'));
      const setup: ValueExpr = { kind: 'number', value: 3 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: len, b: secPerMm },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'FINISH' };
      return {
        id,
        type: 'operation',
        name: 'Grind / linish',
        workCentre: 'FINISH',
        setupMinutes: 3,
        runMinutesPerUnit: 0,
      };
    }

    // Sandblast — area × sec/m². Workcentre BLAST.
    case 'mw_op_sandblast': {
      const area = readValue(block.getInputTargetBlock('AREA'));
      const secPerM2 = readValue(block.getInputTargetBlock('SEC_PER_M2'));
      const setup: ValueExpr = { kind: 'number', value: 5 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: area, b: secPerM2 },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'BLAST' };
      return {
        id,
        type: 'operation',
        name: 'Sandblast',
        workCentre: 'BLAST',
        setupMinutes: 5,
        runMinutesPerUnit: 0,
      };
    }

    // Inspect — minutes per unit, charged to QC.
    case 'mw_op_inspect': {
      const minExpr = readValue(block.getInputTargetBlock('MIN'));
      const setup: ValueExpr = { kind: 'number', value: 0 };
      extras.values[id] = { SETUP: setup, RUN: minExpr };
      extras.operationMeta[id] = { workCentre: 'QC' };
      return {
        id,
        type: 'operation',
        name: String(block.getFieldValue('NAME') ?? 'Inspect'),
        workCentre: 'QC',
        setupMinutes: 0,
        runMinutesPerUnit: minExpr.kind === 'number' ? minExpr.value : 0,
      };
    }

    // Pack — minutes per unit, charged to PACK workcentre.
    case 'mw_op_pack': {
      const minExpr = readValue(block.getInputTargetBlock('MIN'));
      const setup: ValueExpr = { kind: 'number', value: 0 };
      extras.values[id] = { SETUP: setup, RUN: minExpr };
      extras.operationMeta[id] = { workCentre: 'PACK' };
      return {
        id,
        type: 'operation',
        name: String(block.getFieldValue('NAME') ?? 'Pack & label'),
        workCentre: 'PACK',
        setupMinutes: 0,
        runMinutesPerUnit: minExpr.kind === 'number' ? minExpr.value : 0,
      };
    }

    case 'mw_op_weld': {
      const len = readValue(block.getInputTargetBlock('LENGTH_MM'));
      const secPerMm = readValue(block.getInputTargetBlock('SEC_PER_MM'));
      const type = String(block.getFieldValue('TYPE') ?? 'MIG');
      const setup: ValueExpr = { kind: 'number', value: 5 };
      const runExpr: ValueExpr = {
        kind: 'arith',
        op: 'DIV',
        a: { kind: 'arith', op: 'MUL', a: len, b: secPerMm },
        b: { kind: 'number', value: 60 },
      };
      extras.values[id] = { SETUP: setup, RUN: runExpr };
      extras.operationMeta[id] = { workCentre: 'WELD' };
      return {
        id,
        type: 'operation',
        name: `Weld (${type})`,
        workCentre: 'WELD',
        setupMinutes: 5,
        runMinutesPerUnit: 0,
      };
    }

    case 'mw_op_fastener': {
      // Two-for-one: a phantom BOM line for the fasteners + a small assembly
      // operation. We can only return one engine block here, so we lower to a
      // BOM phantom and let the assembly time fold into the next assemble
      // block. (A future pass could synthesise both via `sequence`.)
      const count = readValue(block.getInputTargetBlock('COUNT'));
      const unit = readValue(block.getInputTargetBlock('UNIT_COST'));
      const spec = String(block.getFieldValue('SPEC') ?? 'Fastener');
      // Total cost = count × unit_cost — stash both so the evaluator can
      // resolve at run-time via the QTY/UNIT_COST extras.
      extras.values[id] = { QTY: count, UNIT_COST: unit };
      extras.bomMeta[id] = { kind: 'phantom' };
      const qty = count.kind === 'number' ? count.value : 1;
      return {
        id,
        type: 'bom_phantom',
        name: spec,
        sku: spec,
        quantity: qty,
        unit: 'ea',
      };
    }

    case 'mw_op_assemble': {
      const minExpr = readValue(block.getInputTargetBlock('MIN'));
      const setup: ValueExpr = { kind: 'number', value: 0 };
      extras.values[id] = { SETUP: setup, RUN: minExpr };
      extras.operationMeta[id] = { workCentre: 'ASSY' };
      return {
        id,
        type: 'operation',
        name: String(block.getFieldValue('NAME') ?? 'Assembly'),
        workCentre: 'ASSY',
        setupMinutes: 0,
        runMinutesPerUnit: minExpr.kind === 'number' ? minExpr.value : 0,
      };
    }

    case 'mw_cost_overhead_pct': {
      // PCT is an inline slider field — read as a literal number.
      const pctNum = Number(block.getFieldValue('PCT_INLINE') ?? 0);
      extras.costPctMeta[id] = {
        kind: 'overhead',
        pctExpr: { kind: 'number', value: pctNum },
      };
      return {
        id,
        type: 'cost_adjust',
        category: 'overhead',
        label: 'Overhead %',
        amount: 0, // resolved from accumulated subtotal in evaluator rollup pass
      };
    }

    case 'mw_cost_margin_pct': {
      const pctNum = Number(block.getFieldValue('PCT_INLINE') ?? 0);
      extras.costPctMeta[id] = {
        kind: 'margin',
        pctExpr: { kind: 'number', value: pctNum },
      };
      return {
        id,
        type: 'cost_adjust',
        category: 'margin',
        label: 'Margin %',
        amount: 0, // resolved from accumulated subtotal in evaluator rollup pass
      };
    }

    case 'mw_cost_adjust': {
      const amtExpr = readValue(block.getInputTargetBlock('AMOUNT'));
      extras.values[id] = { AMOUNT: amtExpr };
      const category = (block.getFieldValue('CATEGORY') ?? 'material') as
        | 'material'
        | 'labour'
        | 'machine'
        | 'overhead'
        | 'margin';
      return {
        id,
        type: 'cost_adjust',
        category,
        label: String(block.getFieldValue('LABEL') ?? ''),
        amount: amtExpr.kind === 'number' ? amtExpr.value : 0,
      };
    }

    case 'mw_op_assemble_with': {
      // Sub-assembly drop. Resolve the wired product reference + multiplier so
      // the evaluator can recursively expand the child product. The QTY socket
      // can be a literal or an expression — we stash both, but the engine block
      // also caches a literal qty so the recursive merge has a sensible default
      // when no live vars are available (the v1 evaluator never executes this).
      const productExpr = readValue(block.getInputTargetBlock('PRODUCT'));
      const qtyExpr = readValue(block.getInputTargetBlock('QTY'));
      const productId = productExpr.kind === 'product_ref' ? productExpr.id : '';
      const productLabel =
        productExpr.kind === 'product_ref' ? productExpr.label : 'Sub-assembly';
      const qty = qtyExpr.kind === 'number' ? qtyExpr.value : 1;
      extras.values[id] = { PRODUCT: productExpr, QTY: qtyExpr };
      return {
        id,
        type: 'product_ref',
        productId,
        productLabel,
        quantity: qty,
      };
    }

    case 'mw_show_warning':
      return {
        id,
        type: 'warning',
        message: String(block.getFieldValue('MESSAGE') ?? ''),
      };

    // ── ERP actions ───────────────────────────────────────────────────────
    // Each action lowers to a generic `action` engine block. Value-typed
    // sockets (PRODUCT, MATERIAL, QTY, DURATION_MIN) are stashed into extras
    // so the evaluator can resolve them at run-time using live scenario vars.
    case 'mw_action_create_work_order': {
      const productExpr = readValue(block.getInputTargetBlock('PRODUCT'));
      const qtyExpr = readValue(block.getInputTargetBlock('QTY'));
      extras.values[id] = { PRODUCT: productExpr, QTY: qtyExpr };
      const productLabel =
        productExpr.kind === 'product_ref'
          ? productExpr.label
          : productExpr.kind === 'text'
          ? productExpr.value
          : '';
      return {
        id,
        type: 'action',
        actionKind: 'create_work_order',
        title: String(block.getFieldValue('TITLE') ?? 'Production run'),
        payload: {
          productId: productExpr.kind === 'product_ref' ? productExpr.id : '',
          productLabel,
          quantity: qtyExpr.kind === 'number' ? qtyExpr.value : 1,
          priority: String(block.getFieldValue('PRIORITY') ?? 'standard'),
        },
      };
    }

    case 'mw_action_create_plan_activity': {
      const durExpr = readValue(block.getInputTargetBlock('DURATION_MIN'));
      extras.values[id] = { DURATION_MIN: durExpr };
      return {
        id,
        type: 'action',
        actionKind: 'create_plan_activity',
        title: String(block.getFieldValue('TITLE') ?? 'Schedule activity'),
        payload: {
          lane: String(block.getFieldValue('LANE') ?? 'ASSY'),
          durationMinutes: durExpr.kind === 'number' ? durExpr.value : 0,
        },
      };
    }

    case 'mw_action_send_alert':
      return {
        id,
        type: 'action',
        actionKind: 'send_alert',
        title: String(block.getFieldValue('MESSAGE') ?? 'Alert'),
        payload: {
          channel: String(block.getFieldValue('CHANNEL') ?? 'production'),
          message: String(block.getFieldValue('MESSAGE') ?? ''),
        },
      };

    case 'mw_action_create_purchase_request': {
      const matExpr = readValue(block.getInputTargetBlock('MATERIAL'));
      const qtyExpr = readValue(block.getInputTargetBlock('QTY'));
      extras.values[id] = { MATERIAL: matExpr, QTY: qtyExpr };
      return {
        id,
        type: 'action',
        actionKind: 'create_purchase_request',
        title: String(block.getFieldValue('TITLE') ?? 'Purchase request'),
        payload: {
          materialId: matExpr.kind === 'material_ref' ? matExpr.id : '',
          materialLabel:
            matExpr.kind === 'material_ref' ? matExpr.label : 'Material',
          quantity: qtyExpr.kind === 'number' ? qtyExpr.value : 1,
        },
      };
    }

    default:
      return null;
  }
}

function collectStatements(
  start: Blockly.Block | null,
  extras: StudioV2Extras,
): EngineBlock[] {
  const out: EngineBlock[] = [];
  let cur: Blockly.Block | null = start;
  while (cur) {
    const e = blockToEngine(cur, extras);
    if (e) out.push(e);
    cur = cur.getNextBlock();
  }
  return out;
}

// ── Public entry point ───────────────────────────────────────────────────────
export interface GenerateResult {
  engine: ProductDefinitionEngine;
  extras: StudioV2Extras;
}

// Recipe hats — every top-level block whose type is in this set is treated as
// an entry point. The new pricing/making split lives here alongside the legacy
// `mw_when_configured` / `mw_when_published` ids so older XML still loads.
//
// Both new hats expose a PRODUCT value socket (an `mw_product_ref` chip). The
// product binding is currently informational only — the studio still authors
// against the *active* product on the page — but we round-trip it through
// extras so a future feature ("multi-product canvas") can light up without a
// schema change.
const RECIPE_HAT_TYPES = new Set([
  'mw_when_pricing',
  'mw_when_making',
  'mw_when_configured',
  'mw_when_published',
]);

export function generateEngine(workspace: Blockly.Workspace): GenerateResult {
  const extras = emptyExtras();
  const rootBlocks: EngineBlock[] = [];

  for (const top of workspace.getTopBlocks(true)) {
    if (!RECIPE_HAT_TYPES.has(top.type)) continue;
    // Skip the hat itself; collect everything stacked under it.
    rootBlocks.push(...collectStatements(top.getNextBlock(), extras));
  }

  // Walk all set_variable blocks to surface their names as variable defs.
  // (We treat every named variable as a "derived" engine variable.)
  const variableNames = new Set<string>();
  walkEngineBlocks(rootBlocks, (b) => {
    if (b.type === 'set_variable') variableNames.add(b.variableId);
  });

  const engine: ProductDefinitionEngine = {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: Array.from(variableNames).map((name) => ({
      id: name,
      label: name,
      kind: 'derived',
    })),
    lookupTables: [],
    rootBlocks,
  };

  return { engine, extras };
}

function walkEngineBlocks(
  blocks: EngineBlock[],
  fn: (b: EngineBlock) => void,
): void {
  for (const b of blocks) {
    fn(b);
    if (b.type === 'sequence') walkEngineBlocks(b.children, fn);
    else if (b.type === 'if_chain') {
      for (const br of b.branches) walkEngineBlocks(br.children, fn);
    }
  }
}

// ── Input declaration discovery ──────────────────────────────────────────────
// `extractInputs` walks the live workspace (NOT the engine) so unit / option /
// kind metadata isn't lost during the lossy generator collapse to set_variable.
// The returned descriptors drive the Inputs sidebar in the Studio UI: it
// renders one editor per declaration and feeds the user's edits into the
// evaluator's `initialVars` slot, closing the input → output configurator loop.

export type InputKind =
  | 'dimension'
  | 'quantity'
  | 'choice'
  | 'toggle'
  | 'percent'
  | 'text'
  | 'angle'
  | 'material'
  | 'finish';

export interface InputDecl {
  /** Variable name the engine emits — used as the `initialVars` key. */
  name: string;
  kind: InputKind;
  /** Optional display unit (mm, m, in, …) for dimensions. */
  unit?: string;
  /** Comma-separated option labels (choice only). */
  options?: string[];
  /** Default value as authored on the canvas. */
  defaultValue: string | number | boolean;
}

const INPUT_BLOCK_KINDS: Record<string, InputKind> = {
  mw_input_dimension: 'dimension',
  mw_input_quantity: 'quantity',
  mw_input_choice: 'choice',
  mw_input_toggle: 'toggle',
  mw_input_percent: 'percent',
  mw_input_text: 'text',
  mw_input_angle: 'angle',
  mw_input_material: 'material',
  mw_input_finish: 'finish',
};

/** Read a value-input shadow's number value, falling back to 0. */
function readShadowNumber(block: Blockly.Block, inputName: string): number {
  const target = block.getInputTargetBlock(inputName);
  if (!target) return 0;
  if (target.type === 'mw_number') {
    return Number(target.getFieldValue('VALUE') ?? 0);
  }
  return 0;
}

export function extractInputs(workspace: Blockly.Workspace): InputDecl[] {
  const out: InputDecl[] = [];
  const seen = new Set<string>();
  // Order isn't strictly important but visual order (top→bottom of the
  // workspace) feels right; getAllBlocks(true) returns ordered blocks.
  for (const block of workspace.getAllBlocks(true)) {
    const kind = INPUT_BLOCK_KINDS[block.type];
    if (!kind) continue;

    const name = String(block.getFieldValue('NAME') ?? '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);

    switch (kind) {
      case 'dimension': {
        out.push({
          name,
          kind,
          unit: String(block.getFieldValue('UNIT') ?? 'mm'),
          defaultValue: readShadowNumber(block, 'DEFAULT'),
        });
        break;
      }
      case 'quantity': {
        out.push({
          name,
          kind,
          defaultValue: readShadowNumber(block, 'DEFAULT'),
        });
        break;
      }
      case 'choice': {
        const optsRaw = String(block.getFieldValue('OPTIONS') ?? '');
        const options = optsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        out.push({
          name,
          kind,
          options,
          defaultValue: String(block.getFieldValue('DEFAULT') ?? options[0] ?? ''),
        });
        break;
      }
      case 'toggle': {
        out.push({
          name,
          kind,
          defaultValue: block.getFieldValue('DEFAULT') === 'TRUE',
        });
        break;
      }
      case 'percent': {
        out.push({
          name,
          kind,
          defaultValue: Number(block.getFieldValue('DEFAULT') ?? 0),
        });
        break;
      }
      case 'text': {
        out.push({
          name,
          kind,
          defaultValue: String(block.getFieldValue('DEFAULT') ?? ''),
        });
        break;
      }
      case 'angle': {
        out.push({
          name,
          kind,
          unit: '°',
          defaultValue: Number(block.getFieldValue('DEFAULT') ?? 0),
        });
        break;
      }
      case 'material':
      case 'finish': {
        // No on-canvas default — the Inputs sidebar populates these from the
        // live library at run time. The empty string is a sentinel for "not
        // chosen yet" so the evaluator can fall back to a sensible default.
        out.push({
          name,
          kind,
          defaultValue: '',
        });
        break;
      }
    }
  }
  return out;
}
