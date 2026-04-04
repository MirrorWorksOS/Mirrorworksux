export type ModuleKey =
  | 'sell'
  | 'plan'
  | 'make'
  | 'ship'
  | 'book'
  | 'buy'
  | 'control';

export type UserRole = 'lead' | 'team';
export type UserStatus = 'active' | 'invited' | 'deactivated';
export type ScopeValue = 'own' | 'all';

export type PermissionKey =
  // Common keys (ARCH 00 §4.2) — present in every module
  | 'documents.scope'
  | 'settings.access'
  | 'reports.access'
  // Sell (ARCH 00 §4.3)
  | 'crm.access'
  | 'pipeline.visibility'
  | 'quotes.create'
  | 'invoices.create'
  | 'pricing.edit'
  // Plan (ARCH 00 §4.4)
  | 'schedule.edit'
  | 'budget.visibility'
  | 'bom.edit'
  | 'intelligence_hub.access'
  // Make (ARCH 00 §4.5)
  | 'workorders.scope'
  | 'timers.scope'
  | 'qc.record'
  | 'scrap.report'
  | 'andon.manage'
  | 'maintenance.manage'
  // Ship (ARCH 00 §4.6)
  | 'orders.scope'
  | 'manifests.create'
  | 'carrier.config'
  | 'returns.approve'
  // Book (ARCH 00 §4.7)
  | 'expenses.scope'
  | 'po.approve'
  | 'xero.access'
  // Buy (ARCH 00 §4.8)
  | 'requisitions.scope'
  | 'po.create'
  | 'vendors.manage'
  | 'goods_receipts.access'
  // Control (ARCH 00 §4.9)
  | 'products.manage'
  | 'boms.manage'
  | 'locations.manage'
  | 'machines.manage'
  | 'people.view'
  | 'people.manage'
  | 'workflow.manage';

export interface ModuleAssignment {
  module: ModuleKey;
  groups: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  leadModule?: ModuleKey;
  status: UserStatus;
  modules: ModuleAssignment[];
  lastActive: string;
}

export interface GroupPermissionSet {
  // Common keys (ARCH 00 §4.2) — required on every group
  'documents.scope': ScopeValue;
  'settings.access': boolean;
  'reports.access': boolean;
  // Sell (ARCH 00 §4.3) — optional, set only on Sell groups
  'crm.access'?: boolean;
  'pipeline.visibility'?: ScopeValue;
  'quotes.create'?: boolean;
  'invoices.create'?: boolean;
  'pricing.edit'?: boolean;
  // Plan (ARCH 00 §4.4) — optional, set only on Plan groups
  'schedule.edit'?: boolean;
  'budget.visibility'?: boolean;
  'bom.edit'?: boolean;
  'intelligence_hub.access'?: boolean;
  // Make (ARCH 00 §4.5) — optional, set only on Make groups
  'workorders.scope'?: ScopeValue;
  'timers.scope'?: ScopeValue;
  'qc.record'?: boolean;
  'scrap.report'?: boolean;
  'andon.manage'?: boolean;
  'maintenance.manage'?: boolean;
  // Ship (ARCH 00 §4.6) — optional, set only on Ship groups
  'orders.scope'?: ScopeValue;
  'manifests.create'?: boolean;
  'carrier.config'?: boolean;
  'returns.approve'?: boolean;
  // Book (ARCH 00 §4.7) — optional, set only on Book groups
  'expenses.scope'?: ScopeValue;
  'po.approve'?: boolean;
  'xero.access'?: boolean;
  // Buy (ARCH 00 §4.8) — optional, set only on Buy groups
  'requisitions.scope'?: ScopeValue;
  'po.create'?: boolean;
  'vendors.manage'?: boolean;
  'goods_receipts.access'?: boolean;
  // Control (ARCH 00 §4.9) — optional, set only on Control groups
  'products.manage'?: boolean;
  'boms.manage'?: boolean;
  'locations.manage'?: boolean;
  'machines.manage'?: boolean;
  'people.view'?: boolean;
  'people.manage'?: boolean;
  'workflow.manage'?: boolean;
}

export interface Group {
  id: string;
  module: ModuleKey;
  name: string;
  description: string;
  isDefault: boolean;
  members: string[];
  permissions: GroupPermissionSet;
}

export interface ActivityEvent {
  id: string;
  actorName: string;
  message: string;
  timestamp: string;
}

/** Per-module permission label definitions for the Groups tab */
export interface PermissionLabelEntry {
  key: keyof GroupPermissionSet;
  label: string;
  section: 'scope' | 'actions' | 'admin';
  type: 'boolean' | 'scope';
}
