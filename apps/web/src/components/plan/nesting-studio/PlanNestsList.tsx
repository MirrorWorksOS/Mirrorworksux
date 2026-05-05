/**
 * PlanNestsList — Nests across the lifecycle.
 *
 * Tabbed view: Drafts (programmer iterating), Ready to Schedule (planner's
 * tray), Scheduled, Cutting, Done. The Ready-to-Schedule tab is where the
 * planner clicks "Schedule" — the action calls planService.scheduleNest
 * which reserves stock and stamps a schedule block.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { LayoutGrid, CalendarCheck, ClipboardList, Cpu, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { planService } from '@/services/planService';
import type { Nest } from '@/types/entities';
import type { NestStatus } from '@/types/common';

const STATUS_TABS: { key: NestStatus; label: string; description: string }[] = [
  { key: 'draft', label: 'Drafts', description: 'Programmer iterating' },
  { key: 'ready_to_schedule', label: 'Ready to schedule', description: 'Awaiting planner' },
  { key: 'scheduled', label: 'Scheduled', description: 'On the engine, stock reserved' },
  { key: 'cutting', label: 'Cutting', description: 'On the machine' },
  { key: 'done', label: 'Done', description: 'Cut, scrap captured' },
];

function fmtAud(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
}

function statusVariant(s: NestStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (s) {
    case 'draft':
      return 'outline';
    case 'ready_to_schedule':
      return 'default';
    case 'scheduled':
      return 'secondary';
    case 'cutting':
      return 'default';
    case 'done':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function PlanNestsList() {
  const [nests, setNests] = useState<Nest[]>([]);
  const [activeTab, setActiveTab] = useState<NestStatus>('ready_to_schedule');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const all = await planService.getNests();
    // Spread so React sees a new array reference and re-renders the list +
    // count KPIs after a status mutation in the in-memory mock store.
    setNests([...all]);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const counts = useMemo(() => {
    const out: Record<NestStatus, number> = {
      draft: 0,
      ready_to_schedule: 0,
      scheduled: 0,
      cutting: 0,
      done: 0,
      cancelled: 0,
    };
    for (const n of nests) out[n.status]++;
    return out;
  }, [nests]);

  const filtered = nests.filter((n) => n.status === activeTab);

  async function handleSchedule(nest: Nest) {
    setBusyId(nest.id);
    try {
      await planService.scheduleNest(nest.id);
      toast.success(`${nest.nestNumber} scheduled · stock reserved`);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleStartCut(nest: Nest) {
    setBusyId(nest.id);
    try {
      await planService.setNestStatus(nest.id, 'cutting');
      toast.success(`${nest.nestNumber} now cutting`);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleComplete(nest: Nest) {
    setBusyId(nest.id);
    try {
      await planService.setNestStatus(nest.id, 'done');
      toast.success(`${nest.nestNumber} complete · stock consumed`);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Nests"
        subtitle="Multi-part cut jobs across draft → done"
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Nests' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/plan/nesting-queue">View queue</Link>
            </Button>
            <Button asChild>
              <Link to="/plan/nesting-studio">New nest</Link>
            </Button>
          </div>
        }
      />

      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Drafts" value={counts.draft} icon={ClipboardList} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Ready" value={counts.ready_to_schedule} icon={LayoutGrid} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Scheduled" value={counts.scheduled} icon={CalendarCheck} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Cutting" value={counts.cutting} icon={Cpu} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Done" value={counts.done} icon={CheckCircle2} />
        </motion.div>
      </motion.div>

      <Card variant="flat" className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NestStatus)}>
          <TabsList className="mb-4 flex flex-wrap">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label} <span className="ml-1 text-muted-foreground">({counts[t.key]})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map((t) => (
            <TabsContent key={t.key} value={t.key}>
              <p className="mb-3 text-xs text-muted-foreground">{t.description}</p>
              {filtered.length === 0 ? (
                <div className="rounded-md border border-dashed border-[var(--neutral-300)] p-8 text-center text-sm text-muted-foreground">
                  No nests in this state.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nest</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Sheets</TableHead>
                      <TableHead className="text-right">Yield</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Source MOs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{n.nestNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            By {n.createdBy}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{n.machineName}</TableCell>
                        <TableCell className="text-xs">
                          {n.material} {n.thicknessMm}mm · {n.grade}
                        </TableCell>
                        <TableCell className="text-right font-mono">{n.sheets.length}</TableCell>
                        <TableCell className="text-right font-mono">{n.totalYieldPercent}%</TableCell>
                        <TableCell className="text-right font-mono">{fmtAud(n.cost.totalCostAud)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {n.sourceManufacturingOrderIds.length} MO
                          {n.sourceManufacturingOrderIds.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(n.status)}>{n.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/plan/nests/${n.id}`}>Open</Link>
                            </Button>
                            {n.status === 'ready_to_schedule' && (
                              <Button
                                size="sm"
                                onClick={() => handleSchedule(n)}
                                disabled={busyId === n.id}
                              >
                                Schedule
                              </Button>
                            )}
                            {n.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleStartCut(n)}
                                disabled={busyId === n.id}
                              >
                                Start cut
                              </Button>
                            )}
                            {n.status === 'cutting' && (
                              <Button
                                size="sm"
                                onClick={() => handleComplete(n)}
                                disabled={busyId === n.id}
                              >
                                Mark done
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </PageShell>
  );
}
