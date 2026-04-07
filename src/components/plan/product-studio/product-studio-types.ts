/**
 * Product Studio — TypeScript type definitions
 * Visual product configurator for manufacturing BOM structures + rules
 */

import type { ProductDefinitionEngine } from '@/lib/product-studio/types';

// ── Node Types ───────────────────────────────────────────────────────────────

export type ProductNodeType = 'assembly' | 'component' | 'raw_material' | 'service';

export type OptionType = 'dropdown' | 'number' | 'checkbox' | 'text';

export interface ProductOption {
  id: string;
  name: string;
  type: OptionType;
  values: string[];
  defaultValue: string;
  required: boolean;
}

export interface PricingRule {
  basePrice: number;
  perUnit: number;
  formula: string; // user-visible label, e.g. "Base + qty * $12.50"
}

export interface ProductNodeConstraints {
  minQuantity: number;
  maxQuantity: number;
  required: boolean;
}

export interface ProductNode {
  id: string;
  type: ProductNodeType;
  name: string;
  sku: string;
  description: string;
  options: ProductOption[];
  position: { x: number; y: number };
  parentId: string | null;
  pricing: PricingRule;
  constraints: ProductNodeConstraints;
  quantity: number;
}

export interface ProductEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

// ── Rule Types ───────────────────────────────────────────────────────────────

export type RuleOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_selected';

export type RuleActionType =
  | 'add_component'
  | 'remove_component'
  | 'change_quantity'
  | 'adjust_price'
  | 'show_warning'
  | 'require_approval';

export type ConditionGroupType = 'and' | 'or';

export interface RuleCondition {
  id: string;
  field: string;
  operator: RuleOperator;
  value: string;
}

export interface ConditionGroup {
  id: string;
  type: ConditionGroupType;
  conditions: RuleCondition[];
}

export interface RuleAction {
  id: string;
  type: RuleActionType;
  target: string; // node id or label
  value: string;
}

export interface CaseStatement {
  id: string;
  whenValue: string;
  action: RuleAction;
}

export interface ProductRule {
  id: string;
  name: string;
  nodeId: string;
  conditionGroups: ConditionGroup[];
  actions: RuleAction[];
  caseStatements: CaseStatement[];
  priority: number;
  enabled: boolean;
}

// ── Product Definition ───────────────────────────────────────────────────────

/** @deprecated Legacy form rules — cleared on migration; use definitionEngine */
export interface Product {
  id: string;
  name: string;
  description: string;
  nodes: ProductNode[];
  edges: ProductEdge[];
  rules: ProductRule[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // emoji or icon key for list view
  /** Visual rule graph + variables (Product Definition Engine) */
  definitionEngine?: ProductDefinitionEngine;
  lifecycleStatus?: 'draft' | 'published';
  /** Increments when definition shape changes (export / handoff) */
  definitionVersion?: number;
  /** Prevent edits when referenced (prototype flag) */
  locked?: boolean;
}

// ── Canvas State ─────────────────────────────────────────────────────────────

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

// ── Panel Tabs ───────────────────────────────────────────────────────────────

/** Preview uses toolbar `showPreview` only — not a tab value (avoids empty TabsContent). */
export type RightPanelTab = 'properties' | 'rules';

// ── Utility ──────────────────────────────────────────────────────────────────

export const NODE_TYPE_COLORS: Record<ProductNodeType, string> = {
  assembly: 'bg-blue-500',
  component: 'bg-emerald-500',
  raw_material: 'bg-amber-500',
  service: 'bg-purple-500',
};

export const NODE_TYPE_COLORS_LIGHT: Record<ProductNodeType, string> = {
  assembly: 'bg-blue-50 dark:bg-blue-950/40',
  component: 'bg-emerald-50 dark:bg-emerald-950/40',
  raw_material: 'bg-amber-50 dark:bg-amber-950/40',
  service: 'bg-purple-50 dark:bg-purple-950/40',
};

export const NODE_TYPE_BORDER: Record<ProductNodeType, string> = {
  assembly: 'border-blue-200 dark:border-blue-800',
  component: 'border-emerald-200 dark:border-emerald-800',
  raw_material: 'border-amber-200 dark:border-amber-800',
  service: 'border-purple-200 dark:border-purple-800',
};

export const NODE_TYPE_TEXT: Record<ProductNodeType, string> = {
  assembly: 'text-blue-700 dark:text-blue-300',
  component: 'text-emerald-700 dark:text-emerald-300',
  raw_material: 'text-amber-700 dark:text-amber-300',
  service: 'text-purple-700 dark:text-purple-300',
};

export const NODE_TYPE_LABELS: Record<ProductNodeType, string> = {
  assembly: 'Assembly',
  component: 'Component',
  raw_material: 'Raw Material',
  service: 'Service',
};

export const RULE_OPERATOR_LABELS: Record<RuleOperator, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  greater_than: 'is greater than',
  less_than: 'is less than',
  contains: 'contains',
  is_selected: 'is selected',
};

export const RULE_ACTION_LABELS: Record<RuleActionType, string> = {
  add_component: 'Add component',
  remove_component: 'Remove component',
  change_quantity: 'Change quantity to',
  adjust_price: 'Adjust price by',
  show_warning: 'Show warning',
  require_approval: 'Require approval',
};
