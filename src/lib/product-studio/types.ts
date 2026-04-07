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
