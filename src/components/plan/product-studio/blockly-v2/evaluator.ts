/**
 * Product Studio v2 — runtime evaluator.
 *
 * Takes the engine JSON + sidecar `StudioV2Extras` and produces a fully-resolved
 * `EvaluationResultV2` with BOM lines, work-order operations, and cost rollups.
 *
 * Differences vs the v1 evaluator (`@/lib/product-studio/evaluate`):
 *   - Resolves `ValueExpr` trees from extras at run-time, so BOM qty / op time /
 *     cost amount can come from variables and expressions, not just literals.
 *   - Knows about Material + Finish libraries so material BOM lines and finish
 *     applications carry real prices, lead times, and labels.
 *   - Returns category subtotals so the cost panel can render a roll-up.
 */

import type { EngineBlock, ProductDefinitionEngine } from '@/lib/product-studio/types';
import type { Material } from '@/lib/material-library/types';
import type { Finish } from '@/lib/finish-library/types';
import type { Product } from '@/components/plan/product-studio/product-studio-types';
import type { StudioV2Extras, ValueExpr } from './generator';

// ── Output types ─────────────────────────────────────────────────────────────
export interface BomLineV2 {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lineCost: number;
  source: 'phantom' | 'material';
  materialId?: string;
}

export interface OperationLineV2 {
  id: string;
  name: string;
  workCentre: string;
  setupMinutes: number;
  runMinutesPerUnit: number;
  totalMinutes: number;
  cost: number;
}

export interface CostLineV2 {
  id: string;
  category: 'material' | 'labour' | 'machine' | 'overhead' | 'margin';
  label: string;
  amount: number;
}

export interface CostRollupV2 {
  material: number;
  labour: number;
  machine: number;
  overhead: number;
  margin: number;
  total: number;
}

/**
 * ERP side-effect preview card. Emitted by `mw_action_*` blocks via the
 * `action` engine block type. The Studio v2 UI surfaces these in the Actions
 * tab as "would create…" cards; downstream platform code (Plan / Make / Buy)
 * consumes them when the recipe is executed against a real customer order.
 */
export interface ActionItemV2 {
  id: string;
  kind:
    | 'create_work_order'
    | 'create_plan_activity'
    | 'send_alert'
    | 'create_purchase_request';
  title: string;
  payload: Record<string, string | number | boolean>;
}

export interface EvaluationResultV2 {
  variables: Record<string, string | number | boolean>;
  bom: BomLineV2[];
  operations: OperationLineV2[];
  costs: CostLineV2[];
  rollup: CostRollupV2;
  warnings: string[];
  actions: ActionItemV2[];
}

// ── Defaults / pricing assumptions ───────────────────────────────────────────
// Tunable later via shop settings. Rates are AUD / hour for the work centre.
// The empty key is the catch-all fallback when an op block lands on an unknown
// workcentre — keeping it generous (100/h) means typos still produce a sane $.
const WORK_CENTRE_RATES_PER_HOUR: Record<string, number> = {
  LASER: 180,
  PLASMA: 140,
  WATERJET: 220,
  SHEAR: 95,
  PUNCH: 130,
  BRAKE: 120,
  ROLL: 130,
  WELD: 110,
  DRILL: 80,
  COAT: 90,
  FINISH: 85,
  BLAST: 95,
  ASSY: 75,
  QC: 90,
  PACK: 65,
  '': 100,
};

// ── Expression resolver ──────────────────────────────────────────────────────
function num(v: string | number | boolean | undefined): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return v ? 1 : 0;
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v === 'true' || parseFloat(v) > 0;
  return false;
}

function resolve(
  expr: ValueExpr | undefined,
  vars: Record<string, string | number | boolean>,
): string | number | boolean {
  if (!expr) return 0;
  switch (expr.kind) {
    case 'number':
      return expr.value;
    case 'text':
      return expr.value;
    case 'boolean':
      return expr.value;
    case 'var':
      return vars[expr.name] ?? 0;
    case 'arith': {
      const a = num(resolve(expr.a, vars));
      const b = num(resolve(expr.b, vars));
      switch (expr.op) {
        case 'ADD':
          return a + b;
        case 'SUB':
          return a - b;
        case 'MUL':
          return a * b;
        case 'DIV':
          return b === 0 ? 0 : a / b;
      }
      return 0;
    }
    case 'round': {
      const v = num(resolve(expr.value, vars));
      switch (expr.op) {
        case 'ROUND':
          return Math.round(v);
        case 'FLOOR':
          return Math.floor(v);
        case 'CEIL':
          return Math.ceil(v);
      }
      return v;
    }
    case 'minmax': {
      const a = num(resolve(expr.a, vars));
      const b = num(resolve(expr.b, vars));
      return expr.op === 'MIN' ? Math.min(a, b) : Math.max(a, b);
    }
    case 'compare': {
      const a = resolve(expr.a, vars);
      const b = resolve(expr.b, vars);
      const an = num(a);
      const bn = num(b);
      switch (expr.op) {
        case 'equals':
          return an === bn || String(a) === String(b);
        case 'not_equals':
          return an !== bn && String(a) !== String(b);
        case 'greater_than':
          return an > bn;
        case 'less_than':
          return an < bn;
        case 'greater_or_equal':
          return an >= bn;
        case 'less_or_equal':
          return an <= bn;
        case 'contains':
          return String(a).includes(String(b));
      }
      return false;
    }
    case 'logic': {
      const a = bool(resolve(expr.a, vars));
      const b = bool(resolve(expr.b, vars));
      return expr.op === 'AND' ? a && b : a || b;
    }
    case 'material_ref':
      return expr.id;
    case 'finish_ref':
      return expr.id;
    case 'product_ref':
      // Returning the product id keeps the resolver pure and lets callers that
      // care about sub-assemblies (e.g. the `product_ref` op handler) look up
      // the actual `Product` from `ctx.products` themselves. Resolved as a
      // string so it composes cleanly with arithmetic on `0`.
      return expr.id;
  }
}

// ── Material / finish pricing ────────────────────────────────────────────────
function priceMaterial(material: Material | undefined, qty: number): number {
  if (!material) return 0;
  const cost = material.cost.amount;
  // Crude unit handling: per_kg/per_m treat qty as "how many units of cost.unit",
  // per_sheet treats qty as sheets.
  return cost * qty;
}

function priceFinish(finish: Finish | undefined, areaM2: number): number {
  if (!finish) return 0;
  return (
    finish.setupCost +
    finish.flatFee +
    finish.costPerM2 * Math.max(0, areaM2)
  );
}

function operationCost(workCentre: string, totalMinutes: number): number {
  const rate = WORK_CENTRE_RATES_PER_HOUR[workCentre] ?? WORK_CENTRE_RATES_PER_HOUR[''];
  return (rate / 60) * totalMinutes;
}

// ── Block runner ─────────────────────────────────────────────────────────────
interface RunCtx {
  engine: ProductDefinitionEngine;
  extras: StudioV2Extras;
  materials: Map<string, Material>;
  finishes: Map<string, Finish>;
  /** Product library for sub-assembly resolution (`product_ref` ops). */
  products: Map<string, Product>;
  /** Currently-evaluating product ids — used by `product_ref` for cycle
   *  detection. Each recursive call pushes the child id; on encountering an
   *  id already on the stack we emit a warning and short-circuit instead of
   *  stack-overflowing. */
  productStack: Set<string>;
  vars: Record<string, string | number | boolean>;
  bom: BomLineV2[];
  operations: OperationLineV2[];
  costs: CostLineV2[];
  warnings: string[];
  actions: ActionItemV2[];
}

function runBlock(block: EngineBlock, ctx: RunCtx): void {
  switch (block.type) {
    case 'sequence':
      for (const c of block.children) runBlock(c, ctx);
      break;

    case 'if_chain': {
      let matched = false;
      for (const branch of block.branches) {
        if (branch.condition === null) {
          // Final `else` branch — only runs when no prior branch matched.
          if (!matched) {
            for (const c of branch.children) runBlock(c, ctx);
          }
          break;
        }
        // The generator stores branch conditions under synthetic keys keyed by
        // branch index, so the condition's `leftVariableId` looks like
        //   __expr__:<ownerId>#<branchIdx>
        // Pull the real ValueExpr from extras and resolve it. (Older payloads
        // without an index fall back to a single COND key for compatibility.)
        const ref = branch.condition.leftVariableId;
        if (ref.startsWith('__expr__:')) {
          const rest = ref.slice('__expr__:'.length);
          const hashIdx = rest.indexOf('#');
          const ownerId = hashIdx === -1 ? rest : rest.slice(0, hashIdx);
          const branchIdx = hashIdx === -1 ? null : rest.slice(hashIdx + 1);
          const slot = branchIdx === null ? 'COND' : `COND${branchIdx}`;
          const expr = ctx.extras.values[ownerId]?.[slot] as
            | ValueExpr
            | undefined;
          const passed = bool(resolve(expr, ctx.vars));
          if (passed) {
            matched = true;
            for (const c of branch.children) runBlock(c, ctx);
            break;
          }
        }
      }
      break;
    }

    case 'set_variable': {
      const mode = ctx.extras.setVariableMode[block.id];
      if (mode === 'expression') {
        const expr = ctx.extras.values[block.id]?.VALUE;
        ctx.vars[block.variableId] = resolve(expr, ctx.vars) as
          | string
          | number
          | boolean;
      } else if (block.mode === 'literal') {
        ctx.vars[block.variableId] = block.value;
      }
      break;
    }

    case 'bom_phantom': {
      const meta = ctx.extras.bomMeta[block.id];
      const qtyExpr = ctx.extras.values[block.id]?.QTY;
      const qty = num(resolve(qtyExpr, ctx.vars)) || block.quantity;

      if (meta?.kind === 'material') {
        const material = ctx.materials.get(meta.materialId);
        const lineCost = priceMaterial(material, qty);
        ctx.bom.push({
          id: block.id,
          name: material?.name ?? meta.materialLabel,
          sku: material?.code ?? meta.materialId,
          quantity: qty,
          unit: material?.cost.unit === 'per_kg' ? 'kg' : material?.cost.unit === 'per_m' ? 'm' : 'ea',
          unitCost: material?.cost.amount ?? 0,
          lineCost,
          source: 'material',
          materialId: meta.materialId,
        });
      } else {
        // Phantom BOM lines may carry an optional UNIT_COST expression in
        // extras (e.g. mw_op_fastener stores per-fastener cost there) so we
        // can roll it up into the material total.
        const unitExpr = ctx.extras.values[block.id]?.UNIT_COST;
        const unitCost = unitExpr ? num(resolve(unitExpr, ctx.vars)) : 0;
        ctx.bom.push({
          id: block.id,
          name: block.name,
          sku: block.sku,
          quantity: qty,
          unit: block.unit ?? 'ea',
          unitCost,
          lineCost: unitCost * qty,
          source: 'phantom',
        });
      }
      break;
    }

    case 'operation': {
      const setupExpr = ctx.extras.values[block.id]?.SETUP;
      const runExpr = ctx.extras.values[block.id]?.RUN;
      const setup = num(resolve(setupExpr, ctx.vars)) || block.setupMinutes;
      const runMin = num(resolve(runExpr, ctx.vars)) || block.runMinutesPerUnit;
      const totalMinutes = setup + runMin; // qty 1 for now; loop integration later
      const wc = ctx.extras.operationMeta[block.id]?.workCentre ?? block.workCentre;
      const cost = operationCost(wc, totalMinutes);
      ctx.operations.push({
        id: block.id,
        name: block.name,
        workCentre: wc,
        setupMinutes: setup,
        runMinutesPerUnit: runMin,
        totalMinutes,
        cost,
      });
      break;
    }

    case 'cost_adjust': {
      const finishMeta = ctx.extras.finishMeta[block.id];
      const pctMeta = ctx.extras.costPctMeta[block.id];
      if (finishMeta) {
        const finish = ctx.finishes.get(finishMeta.finishId);
        const areaExpr = ctx.extras.values[block.id]?.AREA;
        const area = num(resolve(areaExpr, ctx.vars));
        const amount = priceFinish(finish, area);
        ctx.costs.push({
          id: block.id,
          category: 'material',
          label: `${finish?.name ?? finishMeta.finishLabel} (${area.toFixed(2)} m²)`,
          amount,
        });
      } else if (pctMeta) {
        // Defer: percentage adjustments are computed in the rollup pass once
        // material/labour/machine subtotals are known. We push a placeholder
        // entry so the order/identity is preserved for the post-process step.
        const pct = num(resolve(pctMeta.pctExpr, ctx.vars));
        ctx.costs.push({
          id: block.id,
          category: pctMeta.kind,
          label: `${pctMeta.kind === 'overhead' ? 'Overhead' : 'Margin'} ${pct}%`,
          amount: 0, // filled in by rollup pass
        });
      } else {
        const amtExpr = ctx.extras.values[block.id]?.AMOUNT;
        const amount = num(resolve(amtExpr, ctx.vars)) || block.amount;
        ctx.costs.push({
          id: block.id,
          category: block.category,
          label: block.label,
          amount,
        });
      }
      break;
    }

    case 'warning':
      ctx.warnings.push(block.message);
      break;

    case 'action': {
      // Resolve any value-typed sockets out of extras at run-time so live
      // scenarioInputs can drive them (e.g. action qty = order qty).
      const slots = ctx.extras.values[block.id] ?? {};
      const resolved: Record<string, string | number | boolean> = { ...block.payload };
      if (slots.QTY) {
        resolved.quantity = num(resolve(slots.QTY, ctx.vars));
      }
      if (slots.DURATION_MIN) {
        resolved.durationMinutes = num(resolve(slots.DURATION_MIN, ctx.vars));
      }
      if (slots.MATERIAL) {
        const matExpr = slots.MATERIAL;
        if (matExpr.kind === 'material_ref') {
          resolved.materialId = matExpr.id;
          resolved.materialLabel = matExpr.label;
        }
      }
      if (slots.PRODUCT) {
        const prodExpr = slots.PRODUCT;
        if (prodExpr.kind === 'product_ref') {
          resolved.productId = prodExpr.id;
          resolved.productLabel = prodExpr.label;
        }
      }
      ctx.actions.push({
        id: block.id,
        kind: block.actionKind,
        title: block.title,
        payload: resolved,
      });
      break;
    }

    case 'product_ref': {
      // Sub-assembly drop. Walk: lookup → cycle check → recursive eval → merge.
      const childId = block.productId;
      if (!childId || childId === '__none__') {
        ctx.warnings.push(
          `Sub-assembly slot is empty — pick a published product on the canvas.`,
        );
        break;
      }

      const child = ctx.products.get(childId);
      if (!child) {
        ctx.warnings.push(
          `Sub-assembly "${block.productLabel || childId}" not found in library.`,
        );
        break;
      }

      if (ctx.productStack.has(childId)) {
        // Build a readable path through the cycle for the warning.
        const path = [...ctx.productStack, childId]
          .map((id) => ctx.products.get(id)?.name ?? id)
          .join(' → ');
        ctx.warnings.push(`Cycle detected: ${path}. Sub-assembly skipped.`);
        break;
      }

      const childExtras =
        (child.blocklyExtras as StudioV2Extras | null | undefined) ?? null;
      if (!child.definitionEngine || !childExtras) {
        ctx.warnings.push(
          `Sub-assembly "${child.name}" has no Studio v2 recipe yet — open it once and re-save.`,
        );
        break;
      }

      // Resolve the multiplier from extras so a parent var can drive it.
      const qtyExpr = ctx.extras.values[block.id]?.QTY;
      const qty = num(resolve(qtyExpr, ctx.vars)) || block.quantity || 1;

      // Vars are deliberately *forked*: the child gets an empty bag, so a
      // parent's `width` doesn't accidentally reach into the child's recipe.
      const childResult = evaluateStudioV2({
        engine: child.definitionEngine,
        extras: childExtras,
        materials: Array.from(ctx.materials.values()),
        finishes: Array.from(ctx.finishes.values()),
        products: Array.from(ctx.products.values()),
        initialVars: {},
        parentStack: new Set([...ctx.productStack, childId]),
      });

      const labelPrefix = `${block.productLabel || child.name}/`;

      // BOM lines: prefix label + multiply qty/cost.
      for (const line of childResult.bom) {
        ctx.bom.push({
          ...line,
          id: `${block.id}:${line.id}`,
          name: `${labelPrefix}${line.name}`,
          quantity: line.quantity * qty,
          lineCost: line.lineCost * qty,
        });
      }

      // Operations: prefix name + scale time/cost. Setup minutes are *not*
      // collapsed across multiplier copies — we treat each multiplier copy as
      // a separate run, so setup repeats. (Future pass: optionally fold setup
      // when count > 1, gated on a per-op flag.)
      for (const op of childResult.operations) {
        ctx.operations.push({
          ...op,
          id: `${block.id}:${op.id}`,
          name: `${labelPrefix}${op.name}`,
          totalMinutes: op.totalMinutes * qty,
          cost: op.cost * qty,
        });
      }

      // Costs: ONLY literal lines. Child percentages drop on the floor —
      // overhead/margin only re-apply at the *outermost* product. This is the
      // critical "no-double-overhead" rule — without it, a 4-deep nesting
      // would compound 15% overhead 4 times and inflate the quote 75%+.
      for (const c of childResult.costs) {
        if (childExtras.costPctMeta[c.id]) continue;
        ctx.costs.push({
          ...c,
          id: `${block.id}:${c.id}`,
          label: `${labelPrefix}${c.label}`,
          amount: c.amount * qty,
        });
      }

      for (const w of childResult.warnings) {
        ctx.warnings.push(`${labelPrefix}${w}`);
      }

      // Actions inherit from sub-assemblies — every "create work order" or
      // "send alert" inside a child product fires when the parent's recipe
      // runs too. Title gets the label prefix so it's clear which sub-assembly
      // sourced the action when the user is staring at a long list.
      for (const a of childResult.actions) {
        ctx.actions.push({
          ...a,
          id: `${block.id}:${a.id}`,
          title: `${labelPrefix}${a.title}`,
        });
      }
      break;
    }

    default:
      break;
  }
}

// ── Public entry point ───────────────────────────────────────────────────────
export interface EvaluateOpts {
  engine: ProductDefinitionEngine;
  extras: StudioV2Extras;
  materials: Material[];
  finishes: Finish[];
  /** Product library — required for sub-assembly resolution via `product_ref`. */
  products?: Product[];
  /** External variable bindings (e.g. configurator selections). */
  initialVars?: Record<string, string | number | boolean>;
  /** Cycle-detection stack carried by recursive sub-assembly evaluation. */
  parentStack?: Set<string>;
}

export function evaluateStudioV2({
  engine,
  extras,
  materials,
  finishes,
  products,
  initialVars,
  parentStack,
}: EvaluateOpts): EvaluationResultV2 {
  const ctx: RunCtx = {
    engine,
    extras,
    materials: new Map(materials.map((m) => [m.id, m])),
    finishes: new Map(finishes.map((f) => [f.id, f])),
    products: new Map((products ?? []).map((p) => [p.id, p])),
    productStack: parentStack ?? new Set<string>(),
    vars: { ...(initialVars ?? {}) },
    bom: [],
    operations: [],
    costs: [],
    warnings: [],
    actions: [],
  };

  for (const b of engine.rootBlocks) runBlock(b, ctx);

  // Roll up: material lines feed `material`, op lines feed `labour`, cost
  // adjusts feed their own category.
  const rollup: CostRollupV2 = {
    material: 0,
    labour: 0,
    machine: 0,
    overhead: 0,
    margin: 0,
    total: 0,
  };
  for (const l of ctx.bom) rollup.material += l.lineCost;
  for (const o of ctx.operations) rollup.labour += o.cost;
  // First pass: literal cost adjusts (skip percent ones — those need a base).
  for (const c of ctx.costs) {
    const pct = extras.costPctMeta[c.id];
    if (!pct) rollup[c.category] += c.amount;
  }
  // Second pass: percentage overhead/margin applied to running subtotal
  // (material + labour + machine + any literal overhead already in the rollup).
  // Margin compounds on top of overhead, matching how shops actually quote.
  for (const c of ctx.costs) {
    const pct = extras.costPctMeta[c.id];
    if (!pct) continue;
    const subtotal =
      rollup.material + rollup.labour + rollup.machine +
      (pct.kind === 'margin' ? rollup.overhead : 0);
    const pctValue = num(resolve(pct.pctExpr, ctx.vars));
    const amount = subtotal * (pctValue / 100);
    c.amount = amount; // mutate the line so the panel shows the resolved $
    rollup[pct.kind] += amount;
  }
  rollup.total =
    rollup.material + rollup.labour + rollup.machine + rollup.overhead + rollup.margin;

  return {
    variables: ctx.vars,
    bom: ctx.bom,
    operations: ctx.operations,
    costs: ctx.costs,
    rollup,
    warnings: ctx.warnings,
    actions: ctx.actions,
  };
}
