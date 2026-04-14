import type { ModuleKey, SubscriptionTier } from './core';

export type FeatureKey = string;

export interface TierFeatureGrant {
  featureKey: FeatureKey;
  module: ModuleKey | 'design' | 'global';
  allowed: boolean;
  limit: number | null;
  requiredTier: SubscriptionTier;
}
