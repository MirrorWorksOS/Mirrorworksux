export type UserId = string;
export type OrganizationId = string;
export type ModuleGroupId = string;
export type MembershipId = string;
export type InvitationId = string;

export type ModuleKey =
  | 'sell'
  | 'plan'
  | 'make'
  | 'ship'
  | 'book'
  | 'buy'
  | 'control';

export type SubscriptionTier = 'pilot' | 'produce' | 'expand' | 'excel';

export type ScopeValue = 'own' | 'all';
