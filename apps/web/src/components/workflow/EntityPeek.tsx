/**
 * Hover card for any cross-reference (Job, MO, WO, Invoice, Supplier).
 * Tries to look up the entity in the mock store and shows a compact
 * summary; falls back to the raw id if not found.
 */
import { type ReactNode } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import * as mock from '@/services/mock';

export type EntityPeekKind = 'job' | 'workOrder' | 'salesOrder' | 'supplier' | 'product';

export interface EntityPeekProps {
  kind: EntityPeekKind;
  id: string;
  children: ReactNode;
}

export function EntityPeek({ kind, id, children }: EntityPeekProps) {
  const summary = peekSummary(kind, id);
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <span className="cursor-help underline decoration-dotted underline-offset-2">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-xs" align="start">
        {summary}
      </HoverCardContent>
    </HoverCard>
  );
}

function peekSummary(kind: EntityPeekKind, id: string): ReactNode {
  switch (kind) {
    case 'job': {
      const j = mock.jobs.find((x) => x.id === id);
      if (!j) return <em className="text-muted-foreground">Job {id} not found.</em>;
      return (
        <div className="space-y-1">
          <div className="font-medium">{j.jobNumber}</div>
          <div>{j.title}</div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">{j.status}</Badge>
            <Badge variant="secondary" className="text-[10px]">{j.source ?? 'manual'}</Badge>
            {j.qty && <span className="text-muted-foreground">× {j.qty}</span>}
          </div>
        </div>
      );
    }
    case 'workOrder': {
      const w = mock.workOrders.find((x) => x.id === id);
      if (!w) return <em className="text-muted-foreground">WO {id} not found.</em>;
      return (
        <div className="space-y-1">
          <div className="font-medium">{w.woNumber}</div>
          <div>{w.operation} · {w.machineName}</div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">{w.status}</Badge>
            {(w.reworkDepth ?? 0) > 0 && (
              <Badge className="bg-rose-100 text-rose-900 text-[10px]">
                rework {w.reworkDepth}
              </Badge>
            )}
          </div>
        </div>
      );
    }
    case 'salesOrder': {
      const s = mock.salesOrders.find((x) => x.id === id);
      if (!s) return <em className="text-muted-foreground">SO {id} not found.</em>;
      return (
        <div className="space-y-1">
          <div className="font-medium">{s.orderNumber}</div>
          <div>{s.customerName}</div>
          <div className="text-muted-foreground">
            Due {s.deliveryDate} · ${s.total.toLocaleString()}
          </div>
        </div>
      );
    }
    case 'supplier': {
      const p = mock.suppliers.find((x) => x.id === id);
      if (!p) return <em className="text-muted-foreground">Supplier {id} not found.</em>;
      return (
        <div className="space-y-1">
          <div className="font-medium">{p.company}</div>
          <div className="text-muted-foreground">{p.contact} · {p.category}</div>
        </div>
      );
    }
    case 'product': {
      const p = mock.products.find((x) => x.id === id);
      if (!p) return <em className="text-muted-foreground">Product {id} not found.</em>;
      return (
        <div className="space-y-1">
          <div className="font-medium">{p.partNumber}</div>
          <div>{p.description}</div>
          <div className="text-muted-foreground">{p.material}</div>
        </div>
      );
    }
  }
}
