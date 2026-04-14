/**
 * Evaluate Product Definition Engine against canvas + user selections.
 */

import type { Product } from '@/components/plan/product-studio/product-studio-types';
import type {
  EngineBlock,
  EngineCondition,
  EvaluationResult,
  MergedBomLine,
  ProductDefinitionEngine,
  BomPhantomLine,
  OperationLine,
  CostAdjustment,
} from './types';
import { ENGINE_SCHEMA_VERSION } from './types';

function compareValues(left: string, op: EngineCondition['operator'], right: string): boolean {
  const ln = parseFloat(left);
  const rn = parseFloat(right);
  const numeric = !Number.isNaN(ln) && !Number.isNaN(rn);
  switch (op) {
    case 'equals':
      return numeric ? ln === rn : left.trim() === right.trim();
    case 'not_equals':
      return numeric ? ln !== rn : left.trim() !== right.trim();
    case 'greater_than':
      return numeric ? ln > rn : left > right;
    case 'less_than':
      return numeric ? ln < rn : left < right;
    case 'contains':
      return left.toLowerCase().includes(right.toLowerCase());
    default:
      return false;
  }
}

function evalCondition(cond: EngineCondition, vars: Record<string, string>): boolean {
  const left = vars[cond.leftVariableId] ?? '';
  return compareValues(left, cond.operator, cond.rightValue);
}

/** Initialise variables from defs + current option selections */
export function buildVariableContext(
  engine: ProductDefinitionEngine,
  product: Product,
  selections: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of engine.variables) {
    if (v.kind === 'selection' && v.source) {
      const key = `${v.source.nodeId}:${v.source.optionId}`;
      const node = product.nodes.find((n) => n.id === v.source!.nodeId);
      const opt = node?.options.find((o) => o.id === v.source!.optionId);
      const raw = selections[key] ?? opt?.defaultValue ?? '';
      out[v.id] = String(raw);
    } else {
      out[v.id] = '';
    }
  }
  return out;
}

function runBlock(
  block: EngineBlock,
  vars: Record<string, string>,
  tableMap: Map<string, { key: string; value: string }[]>,
  phantoms: BomPhantomLine[],
  overrides: Map<string, { quantity?: number; hidden?: boolean }>,
  operations: OperationLine[],
  costs: CostAdjustment[],
  warnings: string[],
): void {
  switch (block.type) {
    case 'sequence':
      for (const ch of block.children) {
        runBlock(ch, vars, tableMap, phantoms, overrides, operations, costs, warnings);
      }
      break;
    case 'if_chain': {
      let matched = false;
      for (const branch of block.branches) {
        if (branch.condition === null) {
          if (!matched) {
            for (const ch of branch.children) {
              runBlock(ch, vars, tableMap, phantoms, overrides, operations, costs, warnings);
            }
          }
          break;
        }
        if (!matched && evalCondition(branch.condition, vars)) {
          matched = true;
          for (const ch of branch.children) {
            runBlock(ch, vars, tableMap, phantoms, overrides, operations, costs, warnings);
          }
          break;
        }
      }
      break;
    }
    case 'set_variable':
      if (block.mode === 'literal') {
        vars[block.variableId] = block.value;
      } else {
        const key = vars[block.keyVariableId] ?? '';
        const rows = tableMap.get(block.tableId) ?? [];
        const row = rows.find((r) => r.key === key);
        if (row) vars[block.variableId] = row.value;
      }
      break;
    case 'bom_phantom':
      phantoms.push({
        id: block.id,
        name: block.name,
        sku: block.sku,
        quantity: block.quantity,
        unit: block.unit ?? 'ea',
      });
      break;
    case 'bom_override': {
      const cur = overrides.get(block.nodeId) ?? {};
      overrides.set(block.nodeId, {
        quantity: block.quantity !== undefined ? block.quantity : cur.quantity,
        hidden: block.hidden !== undefined ? block.hidden : cur.hidden,
      });
      break;
    }
    case 'operation':
      operations.push({
        id: block.id,
        name: block.name,
        workCentre: block.workCentre,
        setupMinutes: block.setupMinutes,
        runMinutesPerUnit: block.runMinutesPerUnit,
      });
      break;
    case 'cost_adjust':
      costs.push({
        id: block.id,
        category: block.category,
        label: block.label,
        amount: block.amount,
      });
      break;
    case 'warning':
      warnings.push(block.message);
      break;
    default:
      break;
  }
}

function buildMergedBom(
  product: Product,
  phantoms: BomPhantomLine[],
  overrides: Map<string, { quantity?: number; hidden?: boolean }>,
): MergedBomLine[] {
  const mergedBom: MergedBomLine[] = product.nodes.map((n) => {
    const o = overrides.get(n.id);
    const hidden = o?.hidden === true;
    const quantity = o?.quantity ?? n.quantity;
    return {
      id: `line-${n.id}`,
      nodeId: n.id,
      name: n.name,
      sku: n.sku,
      quantity,
      unit: 'ea',
      nodeType: n.type,
      hidden,
      isPhantom: false,
      basePriceHint: n.pricing.basePrice + n.pricing.perUnit * Math.max(0, quantity - 1),
    };
  });

  for (const p of phantoms) {
    mergedBom.push({
      id: `phantom-${p.id}`,
      nodeId: null,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      unit: p.unit,
      nodeType: 'raw_material',
      hidden: false,
      isPhantom: true,
      basePriceHint: 0,
    });
  }

  return mergedBom.filter((l) => !l.hidden);
}

export function evaluateDefinitionEngine(
  product: Product,
  engine: ProductDefinitionEngine | undefined,
  selections: Record<string, string>,
): EvaluationResult {
  if (!engine || engine.schemaVersion !== ENGINE_SCHEMA_VERSION) {
    return {
      variables: {},
      mergedBom: buildMergedBom(product, [], new Map()),
      operations: [],
      costAdjustments: [],
      warnings: [],
    };
  }

  const vars = buildVariableContext(engine, product, selections);
  const phantoms: BomPhantomLine[] = [];
  const overrides = new Map<string, { quantity?: number; hidden?: boolean }>();
  const operations: OperationLine[] = [];
  const costs: CostAdjustment[] = [];
  const warnings: string[] = [];

  const tableMap = new Map(engine.lookupTables.map((t) => [t.id, t.rows]));

  for (const block of engine.rootBlocks) {
    runBlock(block, vars, tableMap, phantoms, overrides, operations, costs, warnings);
  }

  return {
    variables: vars,
    mergedBom: buildMergedBom(product, phantoms, overrides),
    operations,
    costAdjustments: costs,
    warnings,
  };
}

export function estimateMaterialTotal(mergedBom: MergedBomLine[]): number {
  return mergedBom.reduce((s, l) => s + l.basePriceHint, 0);
}

export function estimateOperationsMinutes(ops: OperationLine[], units = 1): number {
  return ops.reduce((s, o) => s + o.setupMinutes + o.runMinutesPerUnit * units, 0);
}

export function createEmptyEngine(): ProductDefinitionEngine {
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: [],
    lookupTables: [],
    rootBlocks: [],
  };
}
