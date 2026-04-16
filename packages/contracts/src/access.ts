import type { ModuleGroupId, ModuleKey, ScopeValue } from './core';
import type { FeatureKey, TierFeatureGrant } from './feature-gates';

export type PermissionKey =
  | 'documents.scope'
  | 'settings.access'
  | 'reports.access'
  | 'crm.access'
  | 'pipeline.visibility'
  | 'quotes.create'
  | 'invoices.create'
  | 'pricing.edit'
  | 'schedule.edit'
  | 'budget.visibility'
  | 'bom.edit'
  | 'intelligence_hub.access'
  | 'traveller.release'
  | 'traveller.exception_release'
  | 'traveller.view_all'
  | 'workorders.scope'
  | 'timers.scope'
  | 'qc.record'
  | 'scrap.report'
  | 'andon.manage'
  | 'maintenance.manage'
  | 'orders.scope'
  | 'manifests.create'
  | 'carrier.config'
  | 'returns.approve'
  | 'expenses.scope'
  | 'po.approve'
  | 'xero.access'
  | 'requisitions.scope'
  | 'po.create'
  | 'vendors.manage'
  | 'goods_receipts.access'
  | 'products.manage'
  | 'boms.manage'
  | 'locations.manage'
  | 'machines.manage'
  | 'people.view'
  | 'people.manage'
  | 'workflow.manage';

export type ScopePermissionKey =
  | 'documents.scope'
  | 'pipeline.visibility'
  | 'workorders.scope'
  | 'timers.scope'
  | 'orders.scope'
  | 'expenses.scope'
  | 'requisitions.scope';

export type BooleanPermissionKey = Exclude<PermissionKey, ScopePermissionKey>;

export type PermissionValue<K extends PermissionKey = PermissionKey> =
  K extends ScopePermissionKey ? ScopeValue : boolean;

export type PermissionSet = {
  [K in ScopePermissionKey]?: ScopeValue;
} & {
  [K in BooleanPermissionKey]?: boolean;
};

export interface EffectivePermissionGrant<K extends PermissionKey = PermissionKey> {
  module: ModuleKey;
  key: K;
  value: PermissionValue<K>;
  source: 'super_admin' | 'lead' | 'group';
  sourceId: string;
}

export interface ModuleGroupSummary {
  id: ModuleGroupId;
  module: ModuleKey;
  name: string;
  description: string;
  isDefault: boolean;
  permissionSet: PermissionSet;
  memberCount: number;
}

export interface PermissionDefinition<K extends PermissionKey = PermissionKey> {
  key: K;
  label: string;
  module: ModuleKey | 'global';
  type: K extends ScopePermissionKey ? 'scope' : 'boolean';
  section: 'scope' | 'actions' | 'admin';
  description?: string;
}

export interface PermissionCatalog {
  byModule: Record<ModuleKey, PermissionDefinition[]>;
}

export interface TierFeatureDefinition {
  key: FeatureKey;
  module: ModuleKey | 'design' | 'global';
  requiredTier: 'pilot' | 'produce' | 'expand' | 'excel';
}

export type { TierFeatureGrant };
