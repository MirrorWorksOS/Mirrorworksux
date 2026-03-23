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
  | 'documents.scope'
  | 'quotes.create'
  | 'orders.create'
  | 'jobs.assign'
  | 'quality.approve'
  | 'maintenance.schedule'
  | 'reports.access'
  | 'settings.access'
  // Book-specific (ARCH 00 §4.7)
  | 'invoices.create'
  | 'expenses.scope'
  | 'po.approve'
  | 'xero.access'
  // Buy-specific (ARCH 00 §4.8)
  | 'requisitions.scope'
  | 'po.create'
  | 'vendors.manage'
  | 'goods_receipts.access'
  // Control-specific (ARCH 00 §4.9)
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
  'documents.scope': ScopeValue;
  'quotes.create': boolean;
  'orders.create': boolean;
  'jobs.assign': boolean;
  'quality.approve': boolean;
  'maintenance.schedule': boolean;
  'reports.access': boolean;
  'settings.access': boolean;
  // Extended keys - optional so existing data still compiles
  'invoices.create'?: boolean;
  'expenses.scope'?: ScopeValue;
  'po.approve'?: boolean;
  'xero.access'?: boolean;
  'requisitions.scope'?: ScopeValue;
  'po.create'?: boolean;
  'vendors.manage'?: boolean;
  'goods_receipts.access'?: boolean;
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
