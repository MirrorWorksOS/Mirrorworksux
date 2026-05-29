/**
 * Displays one or more {@link GateFailureDetail} entries at the top of an
 * order/job/MO/WO detail page when a stage transition is blocked. Each
 * entry shows the reason + an optional deep link to fix it.
 */
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import type { GateFailureDetail } from '@/types/entities';

export interface GateBannerProps {
  failures: GateFailureDetail[];
  title?: string;
}

export function GateBanner({ failures, title = 'Blocked' }: GateBannerProps) {
  if (failures.length === 0) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
    >
      <div className="mb-2 flex items-center gap-2 font-medium text-destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        {title} — {failures.length} issue{failures.length === 1 ? '' : 's'} to fix
      </div>
      <ul className="space-y-1 pl-6">
        {failures.map((f) => (
          <li key={`${f.code}-${f.message}`} className="list-disc text-foreground">
            <span>{f.message}</span>
            {f.fixUrl ? (
              <>
                {' '}
                <Link
                  to={f.fixUrl}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Open fix
                </Link>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
