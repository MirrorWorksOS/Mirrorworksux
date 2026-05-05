/**
 * PlanNestingQueue — Demand waiting for cut programming.
 *
 * Shows every queue item still in `pending` state with material grouping,
 * due-date pressure, and "Open in Studio" handoff. Items are added to a
 * Nest from the Studio, which transitions them to `placed`.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Inbox, Clock, AlertTriangle, FileText } from 'lucide-react';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { planService } from '@/services/planService';
import type { NestingQueueItem } from '@/types/entities';

function daysUntil(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

function groupKey(q: NestingQueueItem): string {
  return `${q.material} ${q.thicknessMm}mm`;
}

export function PlanNestingQueue() {
  const [items, setItems] = useState<NestingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void planService.getNestingQueue().then((q) => {
      if (!alive) return;
      setItems(q);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const pending = items.filter((i) => i.status === 'pending');
  const placed = items.filter((i) => i.status === 'placed');

  const groups = useMemo(() => {
    const m = new Map<string, NestingQueueItem[]>();
    for (const item of pending) {
      const k = groupKey(item);
      const arr = m.get(k) ?? [];
      arr.push(item);
      m.set(k, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [pending]);

  const overdue = pending.filter((i) => daysUntil(i.dueDate) < 0).length;
  const dueSoon = pending.filter((i) => {
    const d = daysUntil(i.dueDate);
    return d >= 0 && d <= 3;
  }).length;

  return (
    <PageShell>
      <PageHeader
        title="Ready to Nest"
        subtitle="Cut-step demand waiting for a programmer to place onto a sheet"
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Ready to Nest' },
        ]}
        actions={
          <Button asChild>
            <Link to="/plan/nesting-studio">Open Nesting Studio</Link>
          </Button>
        }
      />

      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Pending" value={pending.length} icon={Inbox} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Material groups" value={groups.length} icon={FileText} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Due ≤ 3 days" value={dueSoon} icon={Clock} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Overdue" value={overdue} icon={AlertTriangle} />
        </motion.div>
      </motion.div>

      {loading && <Card variant="flat" className="p-6 text-sm text-muted-foreground">Loading…</Card>}

      {groups.map(([key, rows]) => (
        <Card key={key} variant="flat" className="space-y-3 p-6">
          <header className="flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground">{key}</h3>
            <Badge variant="secondary">{rows.length} parts</Badge>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO / MO / Job</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Bbox (mm)</TableHead>
                <TableHead>Due</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows
                .slice()
                .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
                .map((q) => {
                  const days = daysUntil(q.dueDate);
                  return (
                    <TableRow key={q.id}>
                      <TableCell>
                        <div className="font-mono text-xs">{q.woNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {q.moNumber} · {q.jobNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{q.partNumber}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{q.description}</div>
                      </TableCell>
                      <TableCell className="text-xs">{q.customerName}</TableCell>
                      <TableCell className="text-right font-mono">{q.qtyRequired}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {q.bboxMm.widthMm}×{q.bboxMm.heightMm}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={days < 0 ? 'destructive' : days <= 3 ? 'default' : 'secondary'}
                        >
                          {days < 0 ? `${Math.abs(days)}d late` : `${days}d`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/plan/nesting-studio?queueItem=${q.id}`}>Open in Studio</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Card>
      ))}

      {!loading && pending.length === 0 && (
        <Card variant="flat" className="p-12 text-center text-sm text-muted-foreground">
          Queue is clear. Nothing waiting on a programmer.
        </Card>
      )}

      {placed.length > 0 && (
        <Card variant="flat" className="space-y-3 p-6 opacity-80">
          <header className="flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground">Already placed on a nest</h3>
            <Badge variant="outline">{placed.length}</Badge>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Nest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placed.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">{q.woNumber}</TableCell>
                  <TableCell className="font-mono text-sm">{q.partNumber}</TableCell>
                  <TableCell className="text-xs">{q.material} {q.thicknessMm}mm</TableCell>
                  <TableCell className="text-right font-mono">{q.qtyRequired}</TableCell>
                  <TableCell className="text-xs">
                    {q.placedOnNestId ? (
                      <Link to={`/plan/nests/${q.placedOnNestId}`} className="underline">
                        {q.placedOnNestId}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageShell>
  );
}
