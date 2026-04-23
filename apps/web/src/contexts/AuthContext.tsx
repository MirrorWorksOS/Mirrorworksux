/**
 * AuthContext — provides "who is looking at this screen" to the whole app.
 *
 * Two identities coexist:
 *   1. `currentUser` — an Alliance Metal employee (admin/lead/team role on
 *      internal modules). Populated from `employees` mock data.
 *   2. `currentCustomerContact` — a portal contact (customer-side). Populated
 *      when an internal user is previewing the portal, or (eventually) when
 *      a real customer-side user is logged in.
 *
 * Today the portal is rendered *as a preview by internal users*, so both
 * identities coexist. We surface `viewingCustomerId` as the single source
 * of truth for which customer the portal is currently scoped to — pulled
 * from a URL param when present, else the impersonated customer, else the
 * currentUser's assigned customer (none for internal), else the first
 * customer in the list (demo fallback).
 *
 * When we wire a real auth flow (Supabase / Clerk), swap `MOCK_SESSION`
 * for a provider-backed value and keep the shape of `AuthValue`.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { customers, employees } from '@/services';
import type {
  Employee,
  Customer,
  CustomerContact,
  CustomerContactRole,
} from '@/types/entities';

// ── Types ──────────────────────────────────────────────────────

/** Permission keys used across modules — kept flat for simple `hasPermission` checks. */
export type PermissionKey =
  // Existing Sell/Control keys (mirrored from SellSettings sellPermissionKeys)
  | 'portal.access'
  | 'portal.configure'
  // New portal access / invitation keys
  | 'portal.invitations.send'
  | 'portal.invitations.revoke'
  | 'portal.customers.impersonate'
  // Subscription management (internal + customer-side)
  | 'portal.subscriptions.view'
  | 'portal.subscriptions.modify'
  | 'portal.subscriptions.cancel'
  // Markup
  | 'portal.markup.view'
  | 'portal.markup.create'
  | 'portal.markup.reply'
  | 'portal.markup.resolve'
  | 'portal.markup.delete';

export interface InternalIdentity {
  kind: 'internal';
  user: Employee;
  role: 'admin' | 'lead' | 'team';
}

export interface CustomerIdentity {
  kind: 'customer';
  contact: CustomerContact;
  customer: Customer;
}

export type Identity = InternalIdentity | CustomerIdentity;

export interface AuthValue {
  /** The logged-in subject (internal employee OR customer contact). */
  identity: Identity;
  /** Customer currently being viewed in the portal (may != identity.customer if internal is impersonating). */
  viewingCustomerId: string;
  /** Change which customer the portal preview scopes to. Internal-only. */
  setViewingCustomerId: (customerId: string) => void;
  /** Flat permission check — returns true if identity is allowed the action. */
  hasPermission: (key: PermissionKey) => boolean;
  /** Convenience: true when internal is previewing as a customer. */
  isImpersonating: boolean;
}

// ── Mock defaults ──────────────────────────────────────────────

/**
 * Default mock session — an admin-role internal user from the employees
 * mock. Matches the "Dave Li" sales rep who already appears in SellSettings.
 */
function defaultInternalIdentity(): InternalIdentity {
  const admin =
    employees.find((e) => e.name === 'Dave Li') ??
    employees[0];
  return {
    kind: 'internal',
    user: admin,
    // Dave is in Sales group with broad Sell perms; treat as admin for demo.
    role: 'admin',
  };
}

/**
 * Permission matrix for internal + customer-side roles.
 * Mirrors the design doc §6 table.
 */
const PERMISSION_MATRIX: Record<
  'internal_admin' | 'internal_lead' | 'internal_team' |
  'customer_admin' | 'customer_lead' | 'customer_team',
  Partial<Record<PermissionKey, boolean>>
> = {
  internal_admin: {
    'portal.access': true,
    'portal.configure': true,
    'portal.invitations.send': true,
    'portal.invitations.revoke': true,
    'portal.customers.impersonate': true,
    'portal.subscriptions.view': true,
    'portal.subscriptions.modify': true,
    'portal.subscriptions.cancel': true,
    'portal.markup.view': true,
    'portal.markup.create': true,
    'portal.markup.reply': true,
    'portal.markup.resolve': true,
    'portal.markup.delete': true,
  },
  internal_lead: {
    'portal.access': true,
    'portal.configure': true,
    'portal.invitations.send': true,
    'portal.invitations.revoke': true,
    'portal.customers.impersonate': true,
    'portal.subscriptions.view': true,
    'portal.subscriptions.modify': false,
    'portal.subscriptions.cancel': false,
    'portal.markup.view': true,
    'portal.markup.create': true,
    'portal.markup.reply': true,
    'portal.markup.resolve': true,
    'portal.markup.delete': false,
  },
  internal_team: {
    'portal.access': true,
    'portal.configure': false,
    'portal.invitations.send': false,
    'portal.invitations.revoke': false,
    'portal.customers.impersonate': false,
    'portal.subscriptions.view': true,
    'portal.subscriptions.modify': false,
    'portal.subscriptions.cancel': false,
    'portal.markup.view': true,
    'portal.markup.create': false,
    'portal.markup.reply': false,
    'portal.markup.resolve': false,
    'portal.markup.delete': false,
  },
  customer_admin: {
    'portal.access': true,
    'portal.subscriptions.view': true,
    'portal.subscriptions.modify': true,
    'portal.subscriptions.cancel': true, // still gated by plan.closable
    'portal.markup.view': true,
    'portal.markup.create': true,
    'portal.markup.reply': true,
    'portal.markup.resolve': false, // only internal can resolve in MVP
    'portal.markup.delete': true,
  },
  customer_lead: {
    'portal.access': true,
    'portal.subscriptions.view': true,
    'portal.subscriptions.modify': false,
    'portal.subscriptions.cancel': false,
    'portal.markup.view': true,
    'portal.markup.create': true,
    'portal.markup.reply': true,
    'portal.markup.resolve': false,
    'portal.markup.delete': false,
  },
  customer_team: {
    'portal.access': true,
    'portal.subscriptions.view': true,
    'portal.subscriptions.modify': false,
    'portal.subscriptions.cancel': false,
    'portal.markup.view': true,
    'portal.markup.create': false,
    'portal.markup.reply': false,
    'portal.markup.resolve': false,
    'portal.markup.delete': false,
  },
};

function matrixKey(id: Identity): keyof typeof PERMISSION_MATRIX {
  if (id.kind === 'internal') {
    return `internal_${id.role}` as const;
  }
  const role: CustomerContactRole = id.contact.role;
  return `customer_${role}` as const;
}

// ── Context + provider ────────────────────────────────────────

const AuthContext = createContext<AuthValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  /** Overrides for tests / storybook. */
  identity?: Identity;
  initialViewingCustomerId?: string;
}

export function AuthProvider({
  children,
  identity: identityOverride,
  initialViewingCustomerId,
}: AuthProviderProps) {
  const initialIdentity = identityOverride ?? defaultInternalIdentity();
  const initialCustomerId =
    initialViewingCustomerId ??
    (initialIdentity.kind === 'customer'
      ? initialIdentity.customer.id
      : customers[0]?.id ?? 'cust-001');

  const [identity] = useState<Identity>(initialIdentity);
  const [viewingCustomerId, setViewingCustomerIdState] =
    useState<string>(initialCustomerId);

  const setViewingCustomerId = useCallback((customerId: string) => {
    setViewingCustomerIdState(customerId);
  }, []);

  const hasPermission = useCallback(
    (key: PermissionKey) => {
      const row = PERMISSION_MATRIX[matrixKey(identity)];
      return Boolean(row[key]);
    },
    [identity],
  );

  const value = useMemo<AuthValue>(
    () => ({
      identity,
      viewingCustomerId,
      setViewingCustomerId,
      hasPermission,
      isImpersonating:
        identity.kind === 'internal' &&
        viewingCustomerId !== '' &&
        // impersonating whenever they're viewing the portal at all
        true,
    }),
    [identity, viewingCustomerId, setViewingCustomerId, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth must be called inside <AuthProvider>. Wrap the app tree.',
    );
  }
  return ctx;
}

/** Narrow helper — returns null outside a provider. Useful for optional consumers. */
export function useOptionalAuth(): AuthValue | null {
  return useContext(AuthContext);
}
