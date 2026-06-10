/**
 * RouteFallback — branded Suspense fallback for lazy-loaded routes.
 * Dependency-free: pure-CSS spinner in the brand yellow.
 */
export function RouteFallback() {
  return (
    <div
      className="flex h-64 items-center justify-center gap-3 text-muted-foreground"
      role="status"
    >
      <span
        aria-hidden
        className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mw-yellow-400)] border-t-transparent"
      />
      <span className="text-sm font-medium">Loading</span>
    </div>
  );
}
