import { useMemo, useState } from 'react';
import { Shield, AlertTriangle, UserPlus, KeyRound, LogIn, CreditCard, Filter } from 'lucide-react';
import { DarkAccentCard } from '@/components/shared/cards/DarkAccentCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { mockActivity } from './people/mock-data';
import type { ActivityEvent, AuditCategory } from './people/types';

const CATEGORY_META: Record<AuditCategory, { label: string; className: string }> = {
  permission: { label: 'Permission', className: 'bg-blue-100 text-blue-800' },
  membership: { label: 'Membership', className: 'bg-indigo-100 text-indigo-800' },
  invite: { label: 'User lifecycle', className: 'bg-emerald-100 text-emerald-800' },
  tier: { label: 'Tier', className: 'bg-amber-100 text-amber-800' },
  auth: { label: 'Auth', className: 'bg-slate-100 text-slate-800' },
  denial: { label: 'Access denied', className: 'bg-red-100 text-red-800' },
};

function formatDate(iso: string | undefined, fallback: string): string {
  if (!iso) return fallback;
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return fallback;
  }
}

const auditColumns: MwColumnDef<ActivityEvent>[] = [
  {
    key: 'when',
    header: 'When',
    headerClassName: 'w-40',
    cell: (e) => (
      <div className="text-xs text-muted-foreground">
        <div>{formatDate(e.occurredAt, e.timestamp)}</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{e.timestamp}</div>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    headerClassName: 'w-40',
    cell: (e) => {
      const meta = e.category ? CATEGORY_META[e.category] : null;
      return meta ? (
        <Badge className={meta.className} variant="secondary">{meta.label}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
  },
  {
    key: 'actor',
    header: 'Actor',
    headerClassName: 'w-48',
    cell: (e) => <span className="text-sm">{e.actorName}</span>,
  },
  {
    key: 'event',
    header: 'Event',
    cell: (e) => <span className="text-sm">{e.message}</span>,
  },
  {
    key: 'target',
    header: 'Target',
    cell: (e) => (
      <span className="text-sm text-muted-foreground">
        {e.targetLabel ?? '—'}
        {e.ip && <div className="text-[10px] uppercase tracking-wide">IP {e.ip}</div>}
      </span>
    ),
  },
  {
    key: 'change',
    header: 'Before → After',
    cell: (e) =>
      e.before || e.after ? (
        <span className="text-xs text-muted-foreground">
          <span className="text-red-600">{e.before ?? '—'}</span>
          <span className="mx-1">→</span>
          <span className="text-emerald-700">{e.after ?? '—'}</span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];

export function ControlAudit() {
  const [category, setCategory] = useState<AuditCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const events = useMemo<ActivityEvent[]>(() => {
    return [...mockActivity].sort((a, b) => (b.occurredAt ?? '').localeCompare(a.occurredAt ?? ''));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(e => {
      if (category !== 'all' && e.category !== category) return false;
      if (!q) return true;
      return (
        e.actorName.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        (e.targetLabel ?? '').toLowerCase().includes(q)
      );
    });
  }, [events, category, query]);

  const stats = useMemo(() => {
    const last30 = events.length;
    const denials = events.filter(e => e.category === 'denial').length;
    const failedAuth = events.filter(e => e.category === 'auth' && e.message.toLowerCase().includes('failed')).length;
    const permissionChanges = events.filter(e => e.category === 'permission' || e.category === 'membership').length;
    return { last30, denials, failedAuth, permissionChanges };
  }, [events]);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access audit</h1>
        <p className="mt-1 text-sm text-[var(--neutral-500)]">
          Read-only log of permission, membership, and authentication events across the workspace
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <DarkAccentCard icon={Shield} label="Events (last 30 days)" value={String(stats.last30)} subtext="All categories" />
        <DarkAccentCard icon={KeyRound} label="Permission changes" value={String(stats.permissionChanges)} subtext="Groups & memberships" />
        <DarkAccentCard icon={AlertTriangle} label="Access denials" value={String(stats.denials)} subtext="Attempted actions" />
        <DarkAccentCard icon={LogIn} label="Failed sign-ins" value={String(stats.failedAuth)} subtext="Last 30 days" />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </div>
          <Select value={category} onValueChange={v => setCategory(v as AuditCategory | 'all')}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="permission">Permission changes</SelectItem>
              <SelectItem value="membership">Membership changes</SelectItem>
              <SelectItem value="invite">User lifecycle</SelectItem>
              <SelectItem value="tier">Tier changes</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="denial">Access denials</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search actor, target, or message…"
            className="w-80"
          />
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {events.length} events
          </div>
        </div>

        <MwDataTable<ActivityEvent>
          columns={auditColumns}
          data={filtered}
          keyExtractor={(e) => e.id}
          className="border-0 shadow-none"
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No events match the current filter.
            </div>
          }
        />

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" /> Append-only log — entries cannot be edited or deleted.</span>
          <span className="inline-flex items-center gap-1"><UserPlus className="h-3 w-3" /> Retention: 12 months (mock).</span>
        </div>
      </Card>
    </div>
  );
}
