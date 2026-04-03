/**
 * MakeManufacturingOrderDetail — Full-page MO detail using JobWorkspaceLayout.
 *
 * 4 tabs: Overview, Work, Issues, Intelligence Hub
 * Follows PlanJobDetail / SellOpportunityPage pattern.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Printer, Plus, Save, ChevronDown, ChevronRight, Search, Filter, Upload, FileText, Download, FileSpreadsheet, ClipboardCheck, Shield, MessageSquare, Paperclip, Send, Clock, Receipt } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';
import { AIInsightCard, AIInsightMessage } from '@/components/shared/ai/AIInsightCard';
import { AISuggestion } from '@/components/shared/ai/AISuggestion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/ui/utils';
import { IconWell } from '@/components/shared/icons/IconWell';
import { toast } from 'sonner';

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

const MO_BY_ID: Record<string, { moNumber: string; product: string; jobNumber: string; status: string; operator: string; startDate: string; customer: string }> = {
  '1': { moNumber: 'MO-2026-001', product: 'Mounting Bracket Assembly', jobNumber: 'JOB-1210', status: 'In Progress', operator: 'M. Johnson', startDate: 'Dec 5, 2025', customer: 'TechCorp Industries' },
  '2': { moNumber: 'MO-2026-002', product: 'Server Rack Chassis', jobNumber: 'JOB-1211', status: 'In Progress', operator: 'D. Lee', startDate: 'Jan 12, 2026', customer: 'Pacific Fab' },
  '3': { moNumber: 'MO-2026-003', product: 'Cable Tray Support', jobNumber: 'JOB-1212', status: 'Confirmed', operator: 'E. Williams', startDate: 'Feb 1, 2026', customer: 'Sydney Rail Corp' },
  '4': { moNumber: 'MO-2026-004', product: 'Machine Guard Assembly', jobNumber: 'JOB-1213', status: 'Done', operator: 'M. Thompson', startDate: 'Nov 20, 2025', customer: 'Kemppi Australia' },
  '5': { moNumber: 'MO-2026-005', product: 'Aluminium Enclosure Panel', jobNumber: 'JOB-1214', status: 'Draft', operator: 'S. Chen', startDate: 'Mar 15, 2026', customer: 'Hunter Steel Co' },
};

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
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Based on the current production data, WO-001 is progressing well. Material availability is confirmed for remaining operations.' },
      ]);
    }, 800);
  };

  const mo = id ? MO_BY_ID[id] : undefined;

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
                      <Badge className="bg-[var(--mw-green)] text-white">{mo.status}</Badge>
                    </div>
                  </div>
                </div>
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
                            wo.status === 'complete' ? 'bg-[var(--mw-green)]' :
                            wo.status === 'in_progress' ? 'bg-[var(--mw-yellow-400)]' :
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-medium text-foreground">AI Suggestions</h2>
                <p className="text-xs text-[var(--neutral-500)]">Actionable recommendations based on production data</p>
              </div>
              <Badge className="border-0 bg-[var(--mw-yellow-400)]/20 text-foreground text-xs">3 new suggestions</Badge>
            </div>

            <AISuggestion
              title="Schedule optimisation"
              confidence={87}
              source="Production scheduling engine · last 30 days of similar jobs"
              impact="4 hours saved on total MO lead time"
            >
              Moving WO-004 (Mounting Bracket) start forward by 1 day enables parallel processing with WO-003 completion. Net benefit: <strong>4 hours saved</strong> on total MO lead time.
            </AISuggestion>

            <AISuggestion
              title="Quality trend alert"
              confidence={74}
              source="SPC analysis · CNC-01 measurement data"
              impact="Prevent potential batch rejection — estimated cost avoidance: $3,200"
            >
              Material thickness variance detected on Side Panel L (WO-002). 3 of 75 units flagged — within tolerance but <strong>trending toward upper limit</strong>. Recommend recalibrating laser measurement on next batch.
            </AISuggestion>

            <AISuggestion
              title="Predictive maintenance"
              confidence={68}
              source="Machine vibration sensors · historical failure data"
              impact="Avoid 8-hour unplanned downtime"
            >
              CNC-01 spindle vibration trending <strong>15% above baseline</strong>. Based on similar patterns, predicted bearing wear in ~40 operating hours. Recommend scheduling maintenance before WO-006 starts.
            </AISuggestion>

            <AISuggestion
              title="Resource reallocation"
              confidence={92}
              source="Real-time machine utilisation · current queue"
              impact="2.5 hours time saving"
            >
              CNC-01 utilisation at 92%. Consider shifting WO-004 to CNC-02 (currently idle) to avoid bottleneck. Estimated time saving: <strong>2.5 hours</strong>.
            </AISuggestion>

            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="text-sm font-medium text-foreground mb-4">MO Timeline</h3>
              <div className="relative pl-8 space-y-4">
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[var(--border)]" />
                {[
                  { label: 'MO created', time: mo.startDate, dot: 'bg-[var(--mw-blue)]' },
                  { label: 'Materials confirmed in stock', time: '2 days later', dot: 'bg-[var(--mw-green)]' },
                  { label: 'WO-001 (Base Plate) completed', time: '5 days later', dot: 'bg-[var(--mw-green)]' },
                  { label: 'AI: Schedule optimisation suggested', time: '6 days later', dot: 'bg-[var(--mw-yellow-400)]' },
                  { label: 'WO-002 started on CNC-01', time: 'Current', dot: 'bg-[var(--mw-yellow-400)]' },
                ].map((ev, i) => (
                  <div key={i} className="relative">
                    <div className={cn('absolute left-[-29px] w-4 h-4 rounded-full border-2 border-white', ev.dot)} />
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

  /* ── Communication Sidebar ── */
  const communicationSidebar = (
    <div className="w-80 border-l border-[var(--border)] bg-card flex flex-col h-full overflow-hidden shrink-0">
      {/* Quick Access */}
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Access</h3>
        <div className="space-y-2">
          {[
            { name: 'SOP-001 Setup Procedure', type: 'SOP', color: 'bg-[var(--mw-blue)]' },
            { name: 'Safety Brief — Laser', type: 'Safety', color: 'bg-[var(--mw-error)]' },
            { name: 'QC Checklist MO-001', type: 'Quality', color: 'bg-[var(--mw-green)]' },
            { name: 'Weld Procedure Spec', type: 'SOP', color: 'bg-[var(--mw-blue)]' },
          ].map((doc) => (
            <div key={doc.name} className="flex items-center gap-3 p-2 rounded-[var(--shape-md)] hover:bg-[var(--neutral-50)] cursor-pointer transition-colors">
              <div className={cn('w-8 h-8 rounded-[var(--shape-md)] flex items-center justify-center', doc.color)}>
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
              </div>
              <Badge variant="outline" className="border-[var(--border)] text-[10px] shrink-0">{doc.type}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Chatter Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Day Separator — Today */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs font-medium text-[var(--neutral-500)]">Today</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* AI Insight Message */}
        <AIInsightMessage timestamp="11:02 AM">
          CNC-01 utilisation at 92%. Consider shifting WO-004 to CNC-02 to avoid bottleneck. Estimated saving: 2.5 hrs.
        </AIInsightMessage>

        {/* User message */}
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 border border-[var(--border)] shrink-0">
            <AvatarImage src="https://i.pravatar.cc/150?img=12" />
            <AvatarFallback className="text-xs">MJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-foreground">M. Johnson</span>
              <span className="text-xs text-[var(--neutral-500)]">10:30 AM</span>
            </div>
            <p className="text-xs text-foreground">
              WO-001 Base Plate complete. Moving to Side Panel L on CNC-01 now. @D.Lee heads up on material staging.
            </p>
          </div>
        </div>

        {/* System message */}
        <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--neutral-500)] shrink-0" />
          <p className="text-xs text-[var(--neutral-500)]">
            MO status changed to <strong>In Progress</strong>
          </p>
        </div>

        {/* Day Separator — Yesterday */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs font-medium text-[var(--neutral-500)]">Yesterday</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* User message */}
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 border border-[var(--border)] shrink-0">
            <AvatarImage src="https://i.pravatar.cc/150?img=5" />
            <AvatarFallback className="text-xs">DL</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-foreground">D. Lee</span>
              <span className="text-xs text-[var(--neutral-500)]">4:15 PM</span>
            </div>
            <p className="text-xs text-foreground">
              Materials staged for WO-001. All 304SS sheets verified against cert. Good to go for morning shift.
            </p>
          </div>
        </div>

        {/* System message */}
        <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--neutral-500)] shrink-0" />
          <p className="text-xs text-[var(--neutral-500)]">
            Materials confirmed — status changed to <strong>Ready</strong>
          </p>
        </div>

        {/* User message */}
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 border border-[var(--border)] shrink-0">
            <AvatarImage src="https://i.pravatar.cc/150?img=8" />
            <AvatarFallback className="text-xs">EW</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-foreground">E. Williams</span>
              <span className="text-xs text-[var(--neutral-500)]">2:00 PM</span>
            </div>
            <p className="text-xs text-foreground">
              Uploaded updated drawing rev B. Please confirm before we start cutting.
            </p>
            <div className="mt-2 border border-[var(--border)] rounded-[var(--shape-lg)] p-2 flex items-center gap-2 hover:bg-[var(--neutral-50)] cursor-pointer">
              <div className="w-7 h-7 bg-[var(--neutral-800)] rounded flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Drawing-RevB.pdf</p>
                <p className="text-[10px] text-[var(--neutral-500)]">1.2 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      {chatMessages.length > 0 && (
        <div className="px-3 space-y-2 mb-2">
          {chatMessages.map((m, i) => (
            <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : '')}>
              {m.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-[var(--mw-yellow-400)] flex items-center justify-center text-[10px] font-bold shrink-0">AI</div>
              )}
              <div className={cn(
                'rounded-lg px-3 py-2 text-xs max-w-[85%]',
                m.role === 'user'
                  ? 'bg-[var(--mw-mirage)] text-white'
                  : 'bg-[var(--neutral-100)] text-foreground',
              )}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 border-t border-[var(--border)] flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-14 w-14 p-0 shrink-0">
          <Paperclip className="w-4 h-4 text-[var(--neutral-500)]" />
        </Button>
        <Input
          placeholder="Type a message..."
          className="flex-1 h-14 text-xs"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(); }}
        />
        <Button size="sm" className="h-14 px-3 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] shrink-0" onClick={handleChatSubmit}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-full">
      <div className="flex-1 min-w-0">
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
            <Badge className="bg-[var(--mw-green)] text-white rounded-full px-2 py-0.5 text-xs">{mo.status}</Badge>
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
      </div>
      {showChat && communicationSidebar}
      </div>
      {selectedWorkOrder && (
        <WorkOrderFullScreen
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </>
  );
}
