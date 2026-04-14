import type { OrganizationId, UserId } from './core';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  lastUpdatedAt?: string | null;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  hasMore?: boolean;
  nextCursor?: string | null;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  source: 'system' | 'tier' | 'organization' | 'viewer';
  description?: string;
  orgId?: OrganizationId;
  userId?: UserId;
  metadata?: Record<string, unknown>;
}

export type StorageNamespace =
  | 'theme'
  | 'session'
  | 'notifications'
  | 'command_palette'
  | 'dashboard_layout'
  | 'agent_history'
  | 'product_library'
  | 'material_library'
  | 'finish_library'
  | 'bridge'
  | 'floor_kiosk'
  | 'custom';

export interface RouteDescriptor {
  path: string;
  label?: string;
  hash?: string;
  params?: Record<string, string | number | boolean | undefined>;
}
