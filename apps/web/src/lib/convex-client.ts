/**
 * Singleton ConvexReactClient. Returns null when no VITE_CONVEX_URL is set
 * (mock mode) so the app keeps working without a Convex deployment.
 */
import { ConvexReactClient } from 'convex/react';

const url = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convexClient: ConvexReactClient | null = url
  ? new ConvexReactClient(url)
  : null;
