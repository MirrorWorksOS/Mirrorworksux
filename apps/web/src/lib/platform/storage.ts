import type { StateStorage } from 'zustand/middleware';
import type { StorageNamespace } from '@mirrorworks/contracts';

export type BrowserStorageKind = 'local' | 'session';

type MinimalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const fallbackMemoryStorage = (() => {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  } satisfies MinimalStorage;
})();

function resolveStorage(kind: BrowserStorageKind): MinimalStorage {
  if (typeof window === 'undefined') return fallbackMemoryStorage;

  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return fallbackMemoryStorage;
  }
}

export function buildStorageKey(
  namespace: StorageNamespace,
  ...segments: Array<string | number | null | undefined>
): string {
  const suffix = segments.filter((segment) => segment !== null && segment !== undefined && segment !== '');
  return ['mw', namespace, ...suffix.map(String)].join('.');
}

export function readStorageValue(
  key: string,
  kind: BrowserStorageKind = 'local',
): string | null {
  try {
    return resolveStorage(kind).getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageValue(
  key: string,
  value: string,
  kind: BrowserStorageKind = 'local',
): void {
  try {
    resolveStorage(kind).setItem(key, value);
  } catch {
    // Ignore quota/private-mode failures.
  }
}

export function removeStorageValue(
  key: string,
  kind: BrowserStorageKind = 'local',
): void {
  try {
    resolveStorage(kind).removeItem(key);
  } catch {
    // Ignore quota/private-mode failures.
  }
}

export function readStorageJson<T>(
  key: string,
  fallback: T,
  kind: BrowserStorageKind = 'local',
): T {
  const raw = readStorageValue(key, kind);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    removeStorageValue(key, kind);
    return fallback;
  }
}

export function writeStorageJson(
  key: string,
  value: unknown,
  kind: BrowserStorageKind = 'local',
): void {
  writeStorageValue(key, JSON.stringify(value), kind);
}

export function createZustandStorage(
  kind: BrowserStorageKind = 'local',
): StateStorage {
  return {
    getItem: (name) => readStorageValue(name, kind),
    setItem: (name, value) => writeStorageValue(name, value, kind),
    removeItem: (name) => removeStorageValue(name, kind),
  };
}
