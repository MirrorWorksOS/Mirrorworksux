import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
 * Route-level error boundary. Catches render errors that escape the
 * lazy-load retry (typically: a chunk that's been gone for more than one
 * reload, or a real runtime error inside a page component).
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const chunkError = isChunkLoadError(error);
  const status = isRouteErrorResponse(error) ? error.status : null;

  const title = chunkError
    ? 'A new version is available'
    : status === 404
      ? "We couldn't find that page"
      : 'Something went wrong loading this page';

  const description = chunkError
    ? "Reload to pick up the latest version of MirrorWorks. Your work isn't lost."
    : status === 404
      ? 'The link may be out of date, or the page has moved.'
      : 'An unexpected error occurred. Reloading usually fixes it.';

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--mw-yellow-100)]">
            <AlertTriangle className="size-6 text-[var(--mw-yellow-900)]" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="size-4" />
              Reload
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
              <Home className="size-4" />
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
