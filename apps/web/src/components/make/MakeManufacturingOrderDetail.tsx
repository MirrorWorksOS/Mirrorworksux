/**
 * MakeManufacturingOrderDetail — Full-page MO detail using JobWorkspaceLayout.
 *
 * 4 tabs: Overview, Work, Issues, Intelligence Hub
 * Follows PlanJobDetail / SellOpportunityPage pattern.
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Printer, Plus, ChevronDown, ChevronRight, Search, Filter, Upload, FileText, Download, FileSpreadsheet, ClipboardCheck, Shield, MessageSquare, Receipt, Play, Pause, AlertTriangle, Timer } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';
import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';
import { AIFeed } from '@/components/shared/ai/AIFeed';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/ui/utils';
import { IconWell } from '@/components/shared/icons/IconWell';
import { manufacturingOrders } from '@/services';
import { OperatorChat } from '@/components/make/OperatorChat';
import { MaterialConsumption } from '@/components/make/MaterialConsumption';
import { useTravellerStore } from '@/store/travellerStore';

/* ------------------------------------------------------------------ */
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

interface WorkOrder {
  id: string;
  woNumber: string;
  partName: string;
  workstation: string;
  progress: number;
  unitsComplete: number;
  unitsTotal: number;
  status: 'pending' | 'in_progress' | 'complete';
}

interface Issue {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  reportedBy: string;
  timestamp: string;
}

const STATUS_DISPLAY: Record<string, string> = {
  draft: 'Draft', confirmed: 'Confirmed', in_progress: 'In Progress', done: 'Done',
};

const MO_BY_ID: Record<string, { moNumber: string; product: string; jobNumber: string; jobId: string; status: string; operator: string; startDate: string; customer: string }> = Object.fromEntries(
  manufacturingOrders.map((mo) => [
    mo.id,
    {
      moNumber: mo.moNumber,
      product: mo.productName,
      jobNumber: mo.jobNumber,
      jobId: mo.jobId,
      status: STATUS_DISPLAY[mo.status] ?? mo.status,
      operator: mo.operatorName.split(' ').map((n, i) => i === 0 ? `${n[0]}.` : n).join(' '),
      startDate: new Date(mo.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      customer: mo.customerName,
    },
  ]),
);

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1', woNumber: 'WO-001', partName: 'Base Plate', workstation: 'Laser-01', progress: 100, unitsComplete: 100, unitsTotal: 100, status: 'complete' },
  { id: 'wo2', woNumber: 'WO-002', partName: 'Side Panel L', workstation: 'CNC-01', progress: 75, unitsComplete: 75, unitsTotal: 100, status: 'in_progress' },
  { id: 'wo3', woNumber: 'WO-003', partName: 'Side Panel R', workstation: 'CNC-01', progress: 60, unitsComplete: 60, unitsTotal: 100, status: 'in_progress' },
  { id: 'wo4', woNumber: 'WO-004', partName: 'Mounting Bracket', workstation: 'Pack-Station', progress: 0, unitsComplete: 0, unitsTotal: 100, status: 'pending' },
];

const ISSUES: Issue[] = [
  { id: 'i1', title: 'Material thickness variance on Side Panel L', severity: 'high', status: 'investigating', reportedBy: 'D. Lee', timestamp: '2h ago' },
  { id: 'i2', title: 'Tooling wear on CNC-01 spindle', severity: 'medium', status: 'open', reportedBy: 'E. Williams', timestamp: '4h ago' },
  { id: 'i3', title: 'Surface finish defect on Base Plate batch 3', severity: 'low', status: 'resolved', reportedBy: 'M. Johnson', timestamp: '1d ago' },
];

/* ------------------------------------------------------------------ */
/* Tabs config                                                        */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'work', label: 'Work' },
  { id: 'issues', label: 'Issues' },
  { id: 'intelligence', label: 'Intelligence Hub' },
  { id: 'documents', label: 'Documents' },
];

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type SummaryFilterKey = 'status' | 'priority' | 'machine' | 'due';

export function MakeManufacturingOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [woSearch, setWoSearch] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilterKey | null>(null);
  const [shiftPaused, setShiftPaused] = useState(false);

  const mo = id ? MO_BY_ID[id] : undefined;
  const travellerPackets = useTravellerStore((state) =>
    state.travellers.filter((packet) => packet.jobRef === mo?.jobNumber),
  );
  const primaryTravellerPacket = useMemo(
    () =>
      travellerPackets.find((packet) =>
        ['released', 'in_progress', 'hold'].includes(packet.status),
      ) ?? travellerPackets[0],
    [travellerPackets],
  );
  const chatJobId = mo?.jobId ?? id ?? 'job-unknown';

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === 'work') return { ...t, count: WORK_ORDERS.length };
      if (t.id === 'issues') return { ...t, count: ISSUES.filter((i) => i.status !== 'resolved').length };
      return { ...t };
    });
  }, []);

  if (!mo) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/make/manufacturing-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to manufacturing orders
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Manufacturing order not found.</p>
      </div>
    );
  }

  const overallProgress = Math.round(WORK_ORDERS.reduce((s, w) => s + w.progress, 0) / WORK_ORDERS.length);

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      /* ── Overview ── */
      case 'overview':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="space-y-6">
              {/* Shop floor summary cards (§4.3 — filter-style quick context) */}
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {(
                  [
                    {
                      key: 'status' as const,
                      label: 'Status',
                      value: mo.status,
                      hint: 'Production state',
                    },
                    {
                      key: 'priority' as const,
                      label: 'Priority',
                      value: mo.status === 'Draft' ? 'Scheduled' : 'High',
                      hint: 'Floor priority',
                    },
                    {
                      key: 'machine' as const,
                      label: 'Primary machine',
                      value: WORK_ORDERS.find((w) => w.status === 'in_progress')?.workstation ?? '—',
                      hint: 'Active workstation',
                    },
                    {
                      key: 'due' as const,
                      label: 'Ship due',
                      value: 'Apr 18, 2026',
                      hint: 'Customer promise date',
                    },
                  ] as const
                ).map((card) => {
                  const active = summaryFilter === card.key;
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() =>
                        setSummaryFilter((f) => (f === card.key ? null : card.key))
                      }
                      className={cn(
                        'rounded-[var(--shape-lg)] border p-6 text-left transition-colors',
                        active
                          ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/10 shadow-xs'
                          : 'border-[var(--neutral-200)] bg-card shadow-xs hover:bg-[var(--neutral-50)]',
                      )}
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                        {card.label}
                      </p>
                      <p className="mt-2 text-lg font-medium text-foreground tabular-nums">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-[var(--neutral-500)]">{card.hint}</p>
                    </button>
                  );
                })}
              </div>

              {/* MO Details */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="text-base font-medium text-foreground mb-4">Manufacturing Order Details</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">MO Number</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)] tabular-nums" value={mo.moNumber} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Job</Label>
                    <Link to={`/plan/jobs/${mo.jobNumber.replace('JOB-', '')}`} className="mt-1 h-12 border border-[var(--border)] rounded-md px-3 flex items-center text-sm text-[var(--mw-blue)] hover:underline tabular-nums">
                      {mo.jobNumber}
                    </Link>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Customer</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={mo.customer} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Start Date</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={mo.startDate} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Operator</Label>
                    <Input readOnly className="mt-1 h-12 border-[var(--border)]" value={mo.operator} />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">Status</Label>
                    <div className="mt-1 h-12 flex items-center">
                      <StatusBadge status={mo.status === 'In Progress' ? 'progress' : mo.status === 'Done' ? 'completed' : mo.status === 'Confirmed' ? 'confirmed' : 'draft'} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h2 className="text-base font-medium text-foreground">Traveller packet</h2>
                  {primaryTravellerPacket ? (
                    <StatusBadge
                      variant={
                        primaryTravellerPacket.status === 'hold'
                          ? 'warning'
                          : primaryTravellerPacket.status === 'released' || primaryTravellerPacket.status === 'in_progress'
                            ? 'accent'
                            : primaryTravellerPacket.status === 'complete'
                              ? 'success'
                              : 'info'
                      }
                    >
                      {primaryTravellerPacket.status === 'in_progress' ? 'In progress' : primaryTravellerPacket.status}
                    </StatusBadge>
                  ) : null}
                </div>
                {primaryTravellerPacket ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[var(--neutral-600)]">
                      Released by Plan as a controlled packet for execution in Make.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Traveller</p>
                        <p className="font-medium tabular-nums">{primaryTravellerPacket.travellerNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Work order</p>
                        <p className="tabular-nums">{primaryTravellerPacket.workOrderRef}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Drawing + revision</p>
                        <p>{primaryTravellerPacket.drawingNumber} • {primaryTravellerPacket.drawingRevision}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Quantity</p>
                        <p className="tabular-nums">{primaryTravellerPacket.quantityToMake}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Current operation</p>
                        <p>{primaryTravellerPacket.currentOperation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Workstation / work centre</p>
                        <p>{primaryTravellerPacket.workstation} • {primaryTravellerPacket.workCentre}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Drawing file</p>
                        <p>{primaryTravellerPacket.linkedFiles.drawing}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--neutral-500)]">Instructions</p>
                        <p>{primaryTravellerPacket.linkedFiles.instructions}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-2">Route / operation strip</p>
                      <div className="flex flex-wrap gap-2">
                        {primaryTravellerPacket.routeOperationStrip.map((operation) => (
                          <Badge key={`${primaryTravellerPacket.id}-${operation}`} variant="outline" className="border-[var(--border)]">
                            {operation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--neutral-500)]">
                    No traveller packet found for this job yet. Travellers are issued from Plan.
                  </p>
                )}
              </Card>

              {/* Work Orders summary */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium text-foreground">Work Orders</h2>
                  <Badge variant="secondary" className="border-0 bg-[var(--neutral-100)] text-xs tabular-nums">{WORK_ORDERS.length}</Badge>
                </div>
                <div className="space-y-3">
                  {WORK_ORDERS.slice(0, 3).map((wo) => (
                    <div key={wo.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{wo.woNumber} — {wo.partName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-[var(--border)] text-xs">{wo.workstation}</Badge>
                          <span className="text-xs text-[var(--neutral-500)] tabular-nums">{wo.unitsComplete}/{wo.unitsTotal} units</span>
                        </div>
                      </div>
                      <div className="w-24">
                        <ProgressBar value={wo.progress} size="sm" showLabel />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs text-[var(--neutral-500)]"
                  onClick={() => setActiveTab('work')}
                >
                  View all work orders
                </Button>
              </Card>

              {/* Schedule */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="text-base font-medium text-foreground mb-4">Schedule</h2>
                <div className="space-y-3">
                  {WORK_ORDERS.map((wo) => (
                    <div key={wo.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[var(--neutral-700)] w-16 shrink-0 tabular-nums">{wo.woNumber}</span>
                      <div className="flex-1 h-6 bg-[var(--neutral-100)] rounded-full relative overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            wo.status === 'complete' ? 'bg-[var(--mw-yellow-400)]' :
                            wo.status === 'in_progress' ? 'bg-[var(--mw-mirage)]' :
                            'bg-[var(--neutral-300)]'
                          )}
                          style={{ width: `${wo.progress}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-foreground">{wo.partName}</span>
                      </div>
                      <span className="text-xs tabular-nums text-[var(--neutral-500)] w-10 text-right">{wo.progress}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Shift Performance */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium text-foreground">Shift Performance</h2>
                  <Badge variant="softAccent" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold tabular-nums text-foreground tracking-tight">05:42:18</span>
                  <p className="text-xs text-[var(--neutral-500)] mt-1">Total Shift Time</p>
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    {['MJ', 'DL', 'EW', 'SC'].map((initials) => (
                      <Avatar key={initials} className="w-7 h-7 border-2 border-card">
                        <AvatarFallback className="text-[10px] bg-[var(--mw-mirage)] text-white">{initials}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-[var(--neutral-500)]">+8 operators</span>
                </div>
                <div className="rounded-[var(--shape-md)] bg-[var(--neutral-100)] px-3 py-2 text-center mb-4">
                  <p className="text-xs">
                    <span className="font-medium text-[var(--chart-scale-high)]">5% ahead</span>
                    <span className="text-[var(--neutral-500)]"> vs target</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-12 gap-2 border-[var(--border)]',
                    shiftPaused && 'bg-[var(--mw-yellow-400)]/10 border-[var(--mw-yellow-400)]',
                  )}
                  onClick={() => setShiftPaused(!shiftPaused)}
                >
                  {shiftPaused ? (
                    <><Play className="h-4 w-4" /> Resume Shift</>
                  ) : (
                    <><Pause className="h-4 w-4" /> Pause Shift</>
                  )}
                </Button>
              </Card>

              {/* Progress */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="text-base font-medium text-foreground mb-4">Overall Progress</h2>
                <div className="text-center mb-4">
                  <span className="text-3xl font-medium tabular-nums text-foreground">{overallProgress}%</span>
                </div>
                <ProgressBar value={overallProgress} />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-medium tabular-nums text-foreground">{WORK_ORDERS.filter((w) => w.status === 'complete').length}</p>
                    <p className="text-xs text-[var(--neutral-500)]">Complete</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium tabular-nums text-[var(--mw-yellow-500)]">{WORK_ORDERS.filter((w) => w.status === 'in_progress').length}</p>
                    <p className="text-xs text-[var(--neutral-500)]">In Progress</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium tabular-nums text-[var(--neutral-400)]">{WORK_ORDERS.filter((w) => w.status === 'pending').length}</p>
                    <p className="text-xs text-[var(--neutral-500)]">Pending</p>
                  </div>
                </div>
              </Card>

              <MaterialConsumption />

              {/* Issues */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium text-foreground">Active Issues</h2>
                  <Badge variant="secondary" className="border-0 bg-[var(--mw-error)]/10 text-[var(--mw-error)] text-xs tabular-nums">
                    {ISSUES.filter((i) => i.status !== 'resolved').length}
                  </Badge>
                </div>
                <ul className="space-y-3">
                  {ISSUES.filter((i) => i.status !== 'resolved').map((issue) => (
                    <li key={issue.id} className="text-sm border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-foreground">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge priority={issue.severity === 'critical' ? 'urgent' : issue.severity} />
                        <span className="text-xs text-[var(--neutral-500)]">{issue.timestamp}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs text-[var(--neutral-500)]"
                  onClick={() => setActiveTab('issues')}
                >
                  View all issues
                </Button>
              </Card>

              {/* Andon Alerts */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium text-foreground">Andon Alerts</h2>
                  <Badge variant="secondary" className="border-0 bg-[var(--mw-error)]/10 text-[var(--mw-error)] text-xs tabular-nums">2</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-[var(--shape-md)] bg-[var(--mw-error)]/5 border border-[var(--mw-error)]/20 p-3">
                    <AlertTriangle className="h-4 w-4 text-[var(--mw-error)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">Material Shortage</p>
                      <p className="text-xs text-[var(--neutral-500)] mt-0.5">RHS-50252 stock below min — 2 lengths remaining</p>
                      <p className="text-[10px] text-[var(--neutral-400)] mt-1 tabular-nums">12 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-[var(--shape-md)] bg-[var(--mw-yellow-400)]/5 border border-[var(--mw-yellow-400)]/20 p-3">
                    <Timer className="h-4 w-4 text-[var(--mw-yellow-500)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">Maintenance Required</p>
                      <p className="text-xs text-[var(--neutral-500)] mt-0.5">CNC-01 spindle calibration overdue by 48 hrs</p>
                      <p className="text-[10px] text-[var(--neutral-400)] mt-1 tabular-nums">45 min ago</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs text-[var(--neutral-500)] w-full"
                  onClick={() => setActiveTab('issues')}
                >
                  View All Issues
                </Button>
              </Card>

              {/* AI Insight */}
              <AIInsightCard title="Production signal">
                CNC-01 utilisation at 92% — consider shifting WO-004 to CNC-02 to avoid bottleneck. Estimated time saving: 2.5 hours.
              </AIInsightCard>

              {/* Cross-module link: Book */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h2 className="text-base font-medium text-foreground mb-2">Invoicing</h2>
                <p className="text-xs text-[var(--neutral-500)] mb-4">Create an invoice in the Book module for this manufacturing order.</p>
                <Button
                  className="w-full h-14 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                  onClick={() => navigate('/book/invoices')}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Card>
            </div>
          </div>
        );

      /* ── Work Orders ── */
      case 'work':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
                <Input
                  placeholder="Search work orders..."
                  value={woSearch}
                  onChange={(e) => setWoSearch(e.target.value)}
                  className="pl-9 h-14 border-[var(--border)]"
                />
              </div>
              <Button variant="outline" size="sm" className="h-14 border-[var(--border)]">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <Card className="border border-[var(--neutral-200)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
              {/* MO group header */}
              <div className="border-b border-[var(--border)] bg-[var(--neutral-50)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronDown className="h-4 w-4 text-[var(--neutral-500)]" />
                  <span className="text-sm font-medium text-foreground">{mo.moNumber}</span>
                  <span className="text-sm text-[var(--neutral-600)]">{mo.product}</span>
                  <Badge variant="secondary" className="border-0 bg-[var(--neutral-200)] text-xs tabular-nums">{WORK_ORDERS.length} units</Badge>
                </div>
                <span className="text-xs text-[var(--neutral-500)]">{mo.customer}</span>
              </div>

              {/* Work order rows */}
              {WORK_ORDERS.filter(
                (wo) => !woSearch || wo.partName.toLowerCase().includes(woSearch.toLowerCase()) || wo.woNumber.toLowerCase().includes(woSearch.toLowerCase()),
              ).map((wo) => (
                <div
                  key={wo.id}
                  className={cn(
                    'relative flex items-center gap-4 px-4 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] cursor-pointer transition-colors',
                  )}
                  onClick={() => setSelectedWorkOrder(wo)}
                >
                  {wo.status === 'in_progress' && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--mw-yellow-400)]" />
                  )}
                  <div className="flex-1 min-w-0 ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground tabular-nums">{wo.woNumber}</span>
                      <span className="text-sm text-[var(--neutral-600)]">{wo.partName}</span>
                      <Badge variant="outline" className="border-[var(--border)] text-xs">{wo.workstation}</Badge>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={wo.progress} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium tabular-nums text-[var(--neutral-700)]">{wo.progress}%</span>
                      <span className="text-xs text-[var(--neutral-500)] tabular-nums">{wo.unitsComplete}/{wo.unitsTotal} units</span>
                      <StatusBadge status={wo.status === 'in_progress' ? 'progress' : wo.status === 'complete' ? 'completed' : wo.status} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--neutral-400)] shrink-0" />
                </div>
              ))}
            </Card>
          </div>
        );

      /* ── Issues ── */
      case 'issues':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--neutral-500)]">Issues reported against this manufacturing order</p>
              <Button className="h-14 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
            <div className="space-y-3">
              {ISSUES.map((issue) => (
                <Card key={issue.id} className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge priority={issue.severity === 'critical' ? 'urgent' : issue.severity} />
                        <StatusBadge status={issue.status === 'investigating' ? 'progress' : issue.status === 'resolved' ? 'completed' : 'open'} />
                        <span className="text-xs text-[var(--neutral-500)]">Reported by {issue.reportedBy} · {issue.timestamp}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--neutral-400)] shrink-0 mt-1" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      /* ── Intelligence Hub (MO-scoped) ── */
      case 'intelligence':
        return (
          <div className="space-y-6">
            <AIFeed module="make" initialCount={3} />

            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="text-sm font-medium text-foreground mb-4">MO Timeline</h3>
              <div className="relative pl-8 space-y-4">
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[var(--border)]" />
                {[
                  { label: 'MO created', time: mo.startDate, dot: 'bg-[var(--neutral-400)]' },
                  { label: 'Materials confirmed in stock', time: '2 days later', dot: 'bg-[var(--mw-mirage)]' },
                  { label: 'WO-001 (Base Plate) completed', time: '5 days later', dot: 'bg-[var(--mw-mirage)]' },
                  { label: 'AI: Schedule optimisation suggested', time: '6 days later', dot: 'bg-[var(--mw-yellow-400)]' },
                  { label: 'WO-002 started on CNC-01', time: 'Current', dot: 'bg-[var(--mw-yellow-400)]' },
                ].map((ev, i) => (
                  <div key={i} className="relative">
                    <div className={cn('absolute left-[-29px] w-4 h-4 rounded-full border-2 border-card', ev.dot)} />
                    <p className="text-sm font-medium text-foreground">{ev.label}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{ev.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      /* ── Documents ── */
      case 'documents':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--neutral-500)]">Drawings, BOMs, and traveller documents for this manufacturing order</p>
              <Button className="h-14 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
            <Card className="border border-[var(--neutral-200)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
              {/* Documents list */}
              {[
                { name: 'Mounting Bracket Assembly.pdf', type: 'Drawing', size: '2.4 MB', date: 'Dec 5, 2025', icon: FileText },
                { name: 'BOM-MO-2026-001.xlsx', type: 'Bill of Materials', size: '156 KB', date: 'Dec 5, 2025', icon: FileSpreadsheet },
                { name: 'Traveller-MO-2026-001.pdf', type: 'Traveller', size: '890 KB', date: 'Dec 6, 2025', icon: Printer },
                { name: 'QC-Checklist-001.pdf', type: 'Quality', size: '340 KB', date: 'Dec 8, 2025', icon: ClipboardCheck },
                { name: 'Material-Cert-304SS.pdf', type: 'Certificate', size: '1.1 MB', date: 'Dec 4, 2025', icon: Shield },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--neutral-50)] transition-colors">
                  <IconWell icon={doc.icon} surface="onDark" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{doc.type} · {doc.size} · {doc.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-14 text-xs text-[var(--neutral-500)]">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <JobWorkspaceLayout
        breadcrumbs={[
          { label: 'Make', href: '/make' },
          { label: 'Manufacturing Orders', href: '/make/manufacturing-orders' },
          { label: mo.moNumber },
        ]}
        title={mo.product}
        subtitle={
          <>
            <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">{mo.moNumber}</span>
            <span>{mo.customer}</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[10px] font-medium text-primary-foreground">{mo.operator.split(' ').map(n => n[0]).join('')}</span>
              {mo.operator}
            </span>
            <span>{mo.startDate}</span>
          </>
        }
        metaRow={
          <>
            <StatusBadge status={mo.status === 'In Progress' ? 'progress' : mo.status === 'Done' ? 'completed' : mo.status === 'Confirmed' ? 'confirmed' : 'draft'} />
            <Badge variant="outline" className="rounded-full border-[var(--border)] text-xs tabular-nums" asChild>
              <Link to={`/plan/jobs/${mo.jobNumber.replace('JOB-', '')}`}>{mo.jobNumber}</Link>
            </Badge>
          </>
        }
        headerActions={
          <>
            <Button variant="outline" className="h-12 border-[var(--border)]" asChild>
              <Link to="/make/manufacturing-orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" className="h-12 border-[var(--border)]">
              <Printer className="mr-2 h-4 w-4" />
              Print Traveler
            </Button>
            <Button className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
              <Plus className="mr-2 h-4 w-4" />
              Add Work Order
            </Button>
            <Button
              variant={showChat ? 'default' : 'outline'}
              className={cn(
                'h-12',
                showChat
                  ? 'bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]'
                  : 'border-[var(--border)]'
              )}
              onClick={() => setShowChat((v) => !v)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </>
        }
        tabs={tabConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderTabPanel={renderTabPanel}
      />
      <OperatorChat jobId={chatJobId} open={showChat} onOpenChange={setShowChat} />
      {selectedWorkOrder && (
        <WorkOrderFullScreen
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </>
  );
}
