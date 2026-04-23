/**
 * Customer Portal preferences — PER-CUSTOMER toggles that control which
 * sections each customer sees when they log in.
 *
 * Previously these were a single tenant-global blob; that meant flipping
 * "Show activities" for one demo customer flipped it for everyone. Now the
 * record is keyed by customerId so a Sell admin can configure per-customer,
 * which is the shape Odoo's portal-access model uses (visibility rules at
 * the contact level, toggles at the customer level).
 *
 * Storage: localStorage under `mw.sell.portal.prefs.v2`. Real impl =
 * `customer_portal_preferences` Supabase table with a row per customer.
 *
 * Subscription visibility is intentionally NOT in this toggle set — a paying
 * customer always sees their billing. Only `showSubscriptionUsage` controls
 * whether the consumption meters render, because some customers don't want
 * their end users to see usage numbers.
 */
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'mw.sell.portal.prefs.v2';
const LEGACY_STORAGE_KEY = 'mw.sell.portal.prefs.v1';
const CHANGE_EVENT = 'mw:portal-prefs-changed';

export interface PortalPreferences {
  /** Whether the "Active Activities" feed is shown in the portal. */
  showActivities: boolean;
  /** Whether the "Shipping Status" chart + list is shown. */
  showShipping: boolean;
  /** Whether the portal surfaces quotes for acceptance/decline. */
  showQuotes: boolean;
  /** Whether customers can download invoice PDFs. */
  allowInvoiceDownload: boolean;
  /** Whether the 3D model review + markup is surfaced on quotes. */
  showMarkup: boolean;
  /** Whether consumption meters render in the Subscription card. */
  showSubscriptionUsage: boolean;
  /** Whether the Self-service profile edit drawer is enabled. */
  allowProfileEdit: boolean;
  /** Whether delivery-note PDFs are downloadable from shipments. */
  allowDeliveryNoteDownload: boolean;
  /** Whether the portal surfaces an "Pay online" link on invoices. */
  allowOnlinePayment: boolean;
}

export const defaultPortalPreferences: PortalPreferences = {
  showActivities: false,
  showShipping: true,
  showQuotes: true,
  allowInvoiceDownload: true,
  showMarkup: true,
  showSubscriptionUsage: true,
  allowProfileEdit: true,
  allowDeliveryNoteDownload: true,
  allowOnlinePayment: true,
};

type StoreShape = {
  /** tenant-level fallback when a customer has no per-customer override. */
  tenant: PortalPreferences;
  /** per-customer overrides. Empty object on first run. */
  perCustomer: Record<string, Partial<PortalPreferences>>;
};

const emptyStore: StoreShape = {
  tenant: defaultPortalPreferences,
  perCustomer: {},
};

function readStore(): StoreShape {
  if (typeof window === 'undefined') return emptyStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreShape>;
      return {
        tenant: { ...defaultPortalPreferences, ...(parsed.tenant ?? {}) },
        perCustomer: parsed.perCustomer ?? {},
      };
    }
    // Migrate v1 → v2 once: pull the old flat prefs into `tenant`.
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy) as Partial<PortalPreferences>;
      const migrated: StoreShape = {
        tenant: { ...defaultPortalPreferences, ...parsedLegacy },
        perCustomer: {},
      };
      writeStore(migrated);
      return migrated;
    }
  } catch {
    // fall through
  }
  return emptyStore;
}

function writeStore(store: StoreShape): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // quota / private-mode — ignore
  }
}

/** Resolve effective prefs for a customer (per-customer override ⋯ tenant default). */
function resolveForCustomer(
  store: StoreShape,
  customerId: string | null,
): PortalPreferences {
  if (!customerId) return store.tenant;
  const override = store.perCustomer[customerId] ?? {};
  return { ...store.tenant, ...override };
}

/**
 * Use portal preferences for a specific customer. If `customerId` is null,
 * returns tenant defaults and writes to the tenant layer.
 */
export function usePortalPreferences(
  customerId: string | null = null,
): [PortalPreferences, (patch: Partial<PortalPreferences>) => void] {
  const [store, setStore] = useState<StoreShape>(() => readStore());

  useEffect(() => {
    function handleChange() {
      setStore(readStore());
    }
    window.addEventListener(CHANGE_EVENT, handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const update = useCallback(
    (patch: Partial<PortalPreferences>) => {
      setStore((prev) => {
        const next: StoreShape = {
          tenant: prev.tenant,
          perCustomer: { ...prev.perCustomer },
        };
        if (customerId) {
          next.perCustomer[customerId] = {
            ...(prev.perCustomer[customerId] ?? {}),
            ...patch,
          };
        } else {
          next.tenant = { ...prev.tenant, ...patch };
        }
        writeStore(next);
        return next;
      });
    },
    [customerId],
  );

  return [resolveForCustomer(store, customerId), update];
}

/**
 * Tenant-level view over the store (Settings panel consumes this to show
 * the defaults AND the per-customer override map).
 */
export function usePortalPreferencesAdmin(): {
  tenant: PortalPreferences;
  perCustomer: Record<string, Partial<PortalPreferences>>;
  updateTenant: (patch: Partial<PortalPreferences>) => void;
  resetCustomer: (customerId: string) => void;
} {
  const [store, setStore] = useState<StoreShape>(() => readStore());

  useEffect(() => {
    function handleChange() {
      setStore(readStore());
    }
    window.addEventListener(CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CHANGE_EVENT, handleChange);
  }, []);

  const updateTenant = useCallback((patch: Partial<PortalPreferences>) => {
    setStore((prev) => {
      const next: StoreShape = {
        tenant: { ...prev.tenant, ...patch },
        perCustomer: prev.perCustomer,
      };
      writeStore(next);
      return next;
    });
  }, []);

  const resetCustomer = useCallback((customerId: string) => {
    setStore((prev) => {
      const { [customerId]: _omit, ...rest } = prev.perCustomer;
      void _omit;
      const next: StoreShape = { tenant: prev.tenant, perCustomer: rest };
      writeStore(next);
      return next;
    });
  }, []);

  return {
    tenant: store.tenant,
    perCustomer: store.perCustomer,
    updateTenant,
    resetCustomer,
  };
}
