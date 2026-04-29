import '@testing-library/jest-dom';

// Node 22+ exposes a stub `localStorage` global (whose methods are undefined)
// that shadows jsdom's implementation. Install a working in-memory shim so
// tests that touch storage work consistently across Node versions.
function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: createMemoryStorage(),
});
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: createMemoryStorage(),
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: globalThis.localStorage,
  });
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: globalThis.sessionStorage,
  });
}
