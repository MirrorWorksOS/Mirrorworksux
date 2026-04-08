/**
 * Product Definition Engine — serialisable types (no React).
 * Variables → rule blocks → BOM / operations / cost outputs.
 */

export const ENGINE_SCHEMA_VERSION = 1 as const;

export type EngineCompareOp =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains';

/** Variable bound to a canvas option selection, or derived during evaluation */
export type EngineVariableKind = 'selection' | 'derived';

export interface EngineVariableDef {
  id: string;
  label: string;
  kind: EngineVariableKind;
  /** When kind === selection: which option supplies the value */
  source?: { nodeId: string; optionId: string };
  unit?: string;
}

export interface LookupTableDef {
  id: string;
  label: string;
  /** Column of keys (string) → output value */
  rows: { key: string; value: string }[];
}

export interface EngineCondition {
  id: string;
  leftVariableId: string;
  operator: EngineCompareOp;
  rightValue: string;
}

/** One branch: condition null means ELSE */
export interface IfBranch {
  id: string;
  condition: EngineCondition | null;
  children: EngineBlock[];
}

export type EngineBlock =
  | {
      id: string;
      type: 'sequence';
      children: EngineBlock[];
    }
  | {
      id: string;
      type: 'if_chain';
      branches: IfBranch[];
    }
  | {
      id: string;
      type: 'set_variable';
      variableId: string;
      mode: 'literal';
      value: string;
    }
  | {
      id: string;
      type: 'set_variable';
      variableId: string;
      mode: 'lookup';
      tableId: string;
      keyVariableId: string;
    }
  | {
      id: string;
      type: 'bom_phantom';
      name: string;
      sku: string;
      quantity: number;
      unit?: string;
    }
  | {
      id: string;
      type: 'bom_override';
      nodeId: string;
      quantity?: number;
      hidden?: boolean;
    }
  | {
      id: string;
      type: 'operation';
      name: string;
      workCentre: string;
      setupMinutes: number;
      runMinutesPerUnit: number;
    }
  | {
      id: string;
      type: 'cost_adjust';
      category: 'material' | 'labour' | 'machine' | 'overhead' | 'margin';
      label: string;
      amount: number;
    }
  | {
      id: string;
      type: 'warning';
      message: string;
    }
  | {
      /**
       * Sub-assembly reference: drops another product's BOM / ops / cost into
       * the current evaluation, multiplied by `quantity`. The Studio v2
       * evaluator looks the product up by id, recursively evaluates it, and
       * merges the results back in. Cycles are detected by walking the
       * `productStack` in `RunCtx` — if `productId` is already on the stack
       * we emit a warning and bail out cleanly.
       */
      id: string;
      type: 'product_ref';
      productId: string;
      productLabel: string;
      quantity: number;
    }
  | {
      /**
       * ERP side-effect action — Studio v2 only. The evaluator collects these
       * into `EvaluationResultV2.actions` so the Actions tab in ProductStudioV2
       * can preview "would create…" cards. The downstream platform (Plan / Make
       * / Buy) consumes them when the recipe is executed against a real order.
       *
       * Payload shape varies per action kind; the evaluator never inspects it
       * and just round-trips it through to the UI panel.
       */
      id: string;
      type: 'action';
      actionKind:
        // ── Sell ───────────────────────────────────────────────
        | 'create_quote'
        | 'create_sales_order'
        | 'create_invoice'
        // ── Plan ───────────────────────────────────────────────
        | 'create_plan_activity'
        | 'reserve_capacity'
        | 'push_nc_program'
        // ── Production / Make ──────────────────────────────────
        | 'create_mo'
        | 'create_work_order'
        | 'record_qc'
        | 'clock_on'
        // ── Buy ────────────────────────────────────────────────
        | 'create_purchase_request'
        | 'create_po'
        | 'reserve_stock'
        // ── Stock ──────────────────────────────────────────────
        | 'stock_adjust'
        // ── People (comms) ─────────────────────────────────────
        | 'send_alert'
        | 'create_task'
        | 'send_sms'
        // ── Integrate ──────────────────────────────────────────
        | 'webhook'
        | 'push_accounting';
      title: string;
      payload: Record<string, string | number | boolean>;
    };

export interface ProductDefinitionEngine {
  schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  variables: EngineVariableDef[];
  lookupTables: LookupTableDef[];
  /** Top-level blocks run in order */
  rootBlocks: EngineBlock[];
}

export interface BomPhantomLine {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
}

export interface MergedBomLine {
  id: string;
  nodeId: string | null;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  nodeType: string;
  hidden: boolean;
  isPhantom: boolean;
  basePriceHint: number;
}

export interface OperationLine {
  id: string;
  name: string;
  workCentre: string;
  setupMinutes: number;
  runMinutesPerUnit: number;
}

export interface CostAdjustment {
  id: string;
  category: 'material' | 'labour' | 'machine' | 'overhead' | 'margin';
  label: string;
  amount: number;
}

export interface EvaluationResult {
  variables: Record<string, string>;
  mergedBom: MergedBomLine[];
  operations: OperationLine[];
  costAdjustments: CostAdjustment[];
  warnings: string[];
}

export interface ValidationIssue {
  level: 'error' | 'warning';
  message: string;
  blockId?: string;
}
