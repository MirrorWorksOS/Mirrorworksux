import { lazy, type ComponentType } from 'react';

const RELOAD_FLAG_KEY = 'mw.lazy-retry.reloaded';

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    (err as { name?: string })?.name === 'ChunkLoadError'
  );
}

/**
 * `React.lazy` wrapper that recovers from stale-chunk errors after a deploy.
 *
 * When a tab that loaded `index.html` before a deploy tries to fetch a chunk
 * by its old hashed URL, the request 404s. We reload once per session — that
 * fetches the new `index.html`, which references the new chunk hashes — and
 * the rerendered `<Suspense>` boundary asks for the right chunk this time.
 *
 * The session-storage flag prevents a refresh loop if the chunk is genuinely
 * missing (build error, bad deploy): the second failure escapes to the
 * route-level `errorElement`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors React.lazy's signature so callers can pass components with any props shape
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
): ReturnType<typeof lazy<T>> {
  return lazy(async () => {
    try {
      const mod = await importFn();
      sessionStorage.removeItem(RELOAD_FLAG_KEY);
      return mod;
    } catch (err) {
      if (isChunkLoadError(err) && sessionStorage.getItem(RELOAD_FLAG_KEY) !== '1') {
        sessionStorage.setItem(RELOAD_FLAG_KEY, '1');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
