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
  | 'settings.access';

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
