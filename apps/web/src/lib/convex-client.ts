/**
 * Singleton ConvexReactClient.
 *
 * Always constructs a client so `<ConvexProvider>` can mount unconditionally
 * — `useQuery` from convex/react requires the provider in tree, even when
 * called with `'skip'`. When `VITE_CONVEX_URL` isn't set (e.g. a Netlify
 * deploy with no env vars), we fall back to a placeholder URL. All callers
 * gate real queries behind `VITE_DATA_SOURCE === 'remote'`, so the
 * placeholder URL is never actually contacted in that mode.
 */
import { ConvexReactClient } from 'convex/react';

const url = (import.meta.env.VITE_CONVEX_URL as string | undefined) ?? 'https://placeholder.convex.cloud';

export const convexClient = new ConvexReactClient(url);

/** True when a real Convex deployment URL is wired (not the placeholder). */
export const hasConvexBackend = !!import.meta.env.VITE_CONVEX_URL;
