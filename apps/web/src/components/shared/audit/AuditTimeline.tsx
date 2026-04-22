/**
 * AuditTimeline — Shared history-of-changes component.
 *
 * Renders an ordered list of AuditEvents for a given entity (PO, quote, MO, etc.)
 * with actor avatar, relative timestamp, action glyph, human description, and
 * optional before→after field diffs.
 *
 * Two variants:
 *  - `mini`: compact inline feed (latest N events) for document overview tabs.
 *            Pairs with a "View full history" button that opens AuditTimelineSheet.
 *  - `full`: full list with all events, used inside the side drawer.
 */

import { useMemo } from 'react';
import {
  Plus, Pencil, CircleCheck, CircleX, Send, FileCheck2, Slash,
  MessageSquare, Package, Activity, ArrowRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import {
  auditService,
  type AuditAction,
  type AuditEntityType,
  type AuditEvent,
  type FieldChange,
} from '@/services/auditService';

// ── Action presentation ────────────────────────────────────────
const ACTION_META: Record<AuditAction, { icon: React.ComponentType<{ className?: string }>; tone: string; bg: string; label: string }> = {
  created:        { icon: Plus,          tone: 'text-[var(--mw-mirage)]', bg: 'bg-[var(--neutral-100)]',    label: 'Created' },
  updated:        { icon: Pencil,        tone: 'text-[var(--mw-mirage)]', bg: 'bg-[var(--neutral-100)]',    label: 'Updated' },
  status_changed: { icon: Activity,      tone: 'text-[var(--mw-mirage)]', bg: 'bg-[var(--neutral-100)]',    label: 'Status changed' },
  approved:       { icon: CircleCheck,   tone: 'text-[var(--mw-success)]', bg: 'bg-[var(--mw-success-100)]', label: 'Approved' },
  rejected:       { icon: CircleX,       tone: 'text-[var(--mw-error)]',   bg: 'bg-[var(--mw-error-100)]',   label: 'Rejected' },
  submitted:      { icon: FileCheck2,    tone: 'text-[var(--mw-mirage)]', bg: 'bg-[var(--neutral-100)]',    label: 'Submitted' },
  sent:           { icon: Send,          tone: 'text-[var(--mw-blue)]',    bg: 'bg-[var(--mw-blue-100)]',    label: 'Sent' },
  amended:        { icon: Pencil,        tone: 'text-[var(--mw-warning)]', bg: 'bg-[var(--mw-amber-50)]',    label: 'Amended' },
  cancelled:      { icon: Slash,         tone: 'text-[var(--mw-error)]',   bg: 'bg-[var(--mw-error-100)]',   label: 'Cancelled' },
  commented:      { icon: MessageSquare, tone: 'text-[var(--mw-mirage)]', bg: 'bg-[var(--neutral-100)]',    label: 'Commented' },
  received:       { icon: Package,       tone: 'text-[var(--mw-success)]', bg: 'bg-[var(--mw-success-100)]', label: 'Received' },
};

// ── Timestamp helpers ──────────────────────────────────────────
function formatRelative(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const diffMs = now - t;
  const s = Math.round(diffMs / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w} wk ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatExact(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// ── Field diff rendering ───────────────────────────────────────
function formatFieldValue(value: unknown, format?: FieldChange['format']): string {
  if (value === null || value === undefined || value === '') return '—';
  if (format === 'currency' && typeof value === 'number') {
    return `$${value.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;
  }
  if (format === 'date' && typeof value === 'string') {
    return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return String(value);
}

function FieldDiff({ change }: { change: FieldChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-[var(--neutral-500)]">{change.label ?? change.path}</span>
      <span className="rounded bg-[var(--neutral-100)] px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-foreground/70 line-through decoration-[var(--neutral-400)]">
        {formatFieldValue(change.before, change.format)}
      </span>
      <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
      <span className="rounded bg-[var(--mw-amber-50)] px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-foreground">
        {formatFieldValue(change.after, change.format)}
      </span>
    </div>
  );
}

// ── Timeline row ───────────────────────────────────────────────
function TimelineRow({ event, isLast, variant }: { event: AuditEvent; isLast: boolean; variant: 'mini' | 'full' }) {
  const actor = auditService.resolveActor(event.actorId, event.actorType);
  const meta = ACTION_META[event.action];
  const Icon = meta.icon;
  const isSystem = event.actorType === 'system';

  return (
    <li className="relative flex gap-3">
      {/* Connector rail */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[19px] top-10 bottom-0 w-px bg-[var(--neutral-200)]"
        />
      )}

      {/* Actor / icon gutter */}
      <div className="relative flex-shrink-0">
        <Avatar className="size-10 border border-[var(--neutral-200)] bg-background">
          <AvatarFallback
            className={cn(
              'text-xs font-medium',
              isSystem ? 'bg-[var(--neutral-100)] text-[var(--neutral-500)]' : 'bg-[var(--mw-mirage)] text-white',
            )}
          >
            {actor.initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-background',
            meta.bg,
          )}
          aria-hidden
        >
          <Icon className={cn('h-3 w-3', meta.tone)} />
        </span>
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-5', variant === 'mini' && 'pb-3')}>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-foreground">{actor.name}</span>
          <span className="text-sm text-[var(--neutral-500)]">{event.description.replace(/^(created|approved|sent|amended|cancelled|received|submitted) /i, m => m.toLowerCase())}</span>
        </div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="mt-0.5 inline-block cursor-help text-xs text-[var(--neutral-400)] tabular-nums">
                {formatRelative(event.occurredAt)}
                {actor.role && !isSystem ? ` · ${actor.role}` : ''}
              </span>
            </TooltipTrigger>
            <TooltipContent>{formatExact(event.occurredAt)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {(event.fieldChanges && event.fieldChanges.length > 0) || event.reason ? (
          <div className="mt-2 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-background p-2.5 space-y-1.5">
            {event.fieldChanges?.map((c, i) => <FieldDiff key={i} change={c} />)}
            {event.reason && (
              <p className="text-xs text-[var(--neutral-500)] italic">
                <span className="not-italic font-medium text-foreground/70">Reason:</span> {event.reason}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </li>
  );
}

// ── Public component ───────────────────────────────────────────
export interface AuditTimelineProps {
  entityType: AuditEntityType;
  entityId: string;
  variant?: 'mini' | 'full';
  /** Mini variant: cap event count (default 3). */
  limit?: number;
  /** Filter to only these actions. */
  actions?: AuditAction[];
  /** Mini variant: click handler for "View full history" button. */
  onViewFull?: () => void;
  className?: string;
}

export function AuditTimeline({
  entityType,
  entityId,
  variant = 'full',
  limit,
  actions,
  onViewFull,
  className,
}: AuditTimelineProps) {
  const events = useMemo(
    () => auditService.list(entityType, entityId, {
      actions,
      limit: variant === 'mini' ? (limit ?? 3) : undefined,
    }),
    [entityType, entityId, variant, limit, actions],
  );

  if (events.length === 0) {
    return (
      <div className={cn('rounded-[var(--shape-lg)] border border-dashed border-[var(--neutral-200)] p-6 text-center', className)}>
        <Activity className="mx-auto mb-2 h-5 w-5 text-[var(--neutral-400)]" />
        <p className="text-sm text-[var(--neutral-500)]">No history yet</p>
        <p className="mt-1 text-xs text-[var(--neutral-400)]">Changes will appear here as they happen.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="space-y-0">
        {events.map((e, i) => (
          <TimelineRow key={e.id} event={e} isLast={i === events.length - 1} variant={variant} />
        ))}
      </ul>
      {variant === 'mini' && onViewFull && (
        <div className="pt-1">
          <Button variant="ghost" size="sm" className="text-xs text-[var(--neutral-500)] hover:text-foreground" onClick={onViewFull}>
            View full history
          </Button>
        </div>
      )}
    </div>
  );
}
