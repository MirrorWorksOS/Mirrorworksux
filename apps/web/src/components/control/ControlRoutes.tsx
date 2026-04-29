/**
 * ControlRoutes — Standard Routes (named templates of operations).
 *
 * A Route bundles multiple Operations from Control → Operations into a
 * named, ordered template (e.g. "Standard sheet-metal route"). In Plan,
 * a planner can "Apply route" to a part to bulk-insert all of the route's
 * operations instead of picking them one at a time.
 */

import { useEffect, useMemo, useState } from 'react';
import { Route as RouteIcon, Search, Plus, ChevronRight, GripVertical, User } from 'lucide-react';
import { motion } from 'motion/react';

import {
  routesLibraryService,
  operationsLibraryService,
  type StandardRoute,
} from '@/services';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/utils';
import { getCategoryColors } from '@/lib/operation-category-colors';
import { RouteEditorSheet } from './RouteEditorSheet';

export function ControlRoutes() {
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<StandardRoute | undefined>();
  const all = useMemo(() => routesLibraryService.list(), []);

  // Local-only ordering — reordering is mock and doesn't persist to the service yet.
  const [orderedIds, setOrderedIds] = useState<string[]>(() => all.map((r) => r.id));
  useEffect(() => {
    // Keep order in sync if the underlying list grows (e.g. after creating a new route).
    setOrderedIds((prev) => {
      const fromAll = all.map((r) => r.id);
      const merged = [...prev.filter((id) => fromAll.includes(id))];
      fromAll.forEach((id) => {
        if (!merged.includes(id)) merged.push(id);
      });
      return merged;
    });
  }, [all]);

  const ordered = useMemo(
    () =>
      orderedIds
        .map((id) => all.find((r) => r.id === id))
        .filter((r): r is StandardRoute => Boolean(r)),
    [orderedIds, all],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [ordered, search]);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const moveRoute = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setOrderedIds((prev) => {
      const fromIdx = prev.indexOf(fromId);
      const toIdx = prev.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="Routes"
        subtitle="Reusable operation sequences — apply a whole route to a part in one click"
        breadcrumbs={[
          { label: 'Control', href: '/control' },
          { label: 'Routes' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <RouteIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {all.length} routes
            </Badge>
            <Button
              size="sm"
              className="h-9 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={() => {
                setEditingRoute(undefined);
                setEditorOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New route
            </Button>
          </div>
        }
      />

      <motion.div variants={staggerItem} className="space-y-4">
        <Card variant="flat" className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <Input
              placeholder="Search routes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isDragging={draggingId === route.id}
              onDragStart={() => setDraggingId(route.id)}
              onDragEnd={() => setDraggingId(null)}
              onDropOver={() => {
                if (draggingId) moveRoute(draggingId, route.id);
              }}
              onEdit={() => {
                setEditingRoute(route);
                setEditorOpen(true);
              }}
            />
          ))}
          {filtered.length === 0 && (
            <Card variant="flat" className="p-8 text-center text-sm text-[var(--neutral-500)] col-span-full">
              No routes match this filter.
            </Card>
          )}
        </div>
      </motion.div>

      <RouteEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        route={editingRoute}
      />
    </PageShell>
  );
}

function RouteCard({
  route,
  isDragging,
  onDragStart,
  onDragEnd,
  onDropOver,
  onEdit,
}: {
  route: StandardRoute;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOver: () => void;
  onEdit: () => void;
}) {
  const resolved = useMemo(() => routesLibraryService.resolve(route), [route]);
  const totalMinutes = resolved.reduce(
    (sum, s) => sum + (s.minutesOverride ?? s.operation.defaultMinutes),
    0,
  );
  const subContains = resolved.some((s) => s.operation.isSubcontract);

  // Unique work centres, in the order they first appear.
  const workstations = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    resolved.forEach((s) => {
      const wc = s.operation.defaultWorkCentre;
      if (wc && !seen.has(wc)) {
        seen.add(wc);
        out.push(wc);
      }
    });
    return out;
  }, [resolved]);

  return (
    <Card
      variant="flat"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropOver();
      }}
      className={cn(
        'p-5 space-y-4 transition-opacity cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2">
          <GripVertical
            className="h-4 w-4 text-[var(--neutral-300)] shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium text-foreground truncate">{route.name}</h3>
              {route.category && (
                <Badge variant="outline" className="text-[10px]">{route.category}</Badge>
              )}
            </div>
            {route.description && (
              <p className="text-xs text-[var(--neutral-500)]">{route.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {route.defaultOperator && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-7 w-7 border border-[var(--border)]">
                    <AvatarFallback className="bg-[var(--mw-yellow-100)] text-[var(--mw-yellow-900)] text-[10px] font-medium">
                      {route.defaultOperator.initials ??
                        route.defaultOperator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <span className="text-xs">
                    Owner: {route.defaultOperator.name}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Workstations strip — chips of unique work centres used by this route */}
      {workstations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 -mt-1">
          {workstations.map((wc) => (
            <span
              key={wc}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[10px] text-[var(--neutral-700)]"
            >
              <User className="h-2.5 w-2.5 text-[var(--neutral-400)]" aria-hidden />
              {wc}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-[var(--neutral-500)] border-y border-[var(--border)] py-2 tabular-nums">
        <span>{resolved.length} ops</span>
        <span>·</span>
        <span>{(totalMinutes / 60).toFixed(1)}h planned</span>
        {subContains && (
          <>
            <span>·</span>
            <span>contains subcontract</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {resolved.map((step, idx) => {
          const op = step.operation;
          const std = operationsLibraryService.byId(op.id);
          const colour = getCategoryColors(op.category ?? '');
          return (
            <div key={`${op.id}-${idx}`} className="inline-flex items-center">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[var(--shape-sm)] border px-2 py-1 text-[11px]',
                  colour.bg,
                  colour.border,
                )}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-white text-[9px] font-medium tabular-nums">
                  {idx + 1}
                </span>
                <span className={cn('font-medium', colour.text)}>{op.name}</span>
                <span className="text-[var(--neutral-500)] tabular-nums">
                  · {step.minutesOverride ?? std?.defaultMinutes ?? op.defaultMinutes}m
                </span>
              </span>
              {idx < resolved.length - 1 && (
                <ChevronRight className="h-3 w-3 text-[var(--neutral-300)] mx-0.5" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
