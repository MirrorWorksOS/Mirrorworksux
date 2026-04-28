import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Plus, Save, ChevronRight, SendToBack, ShieldAlert } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { PageShell } from '@/components/shared/layout/PageShell';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { PlanOverviewTab } from './PlanOverviewTab';
import { PlanProductionTab } from './PlanProductionTab';
import { PlanScheduleTab } from './PlanScheduleTab';
import { PlanIntelligenceHubTab } from './PlanIntelligenceHubTab';
import { PlanBudgetTab } from './PlanBudgetTab';
import { PlanTravellersTab } from './PlanTravellersTab';
import { useTravellerStore, isTravellerReadyForRelease } from '@/store/travellerStore';
import { useShallow } from 'zustand/react/shallow';
import type { PermissionKey } from '@mirrorworks/contracts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { peopleUsers } from '@/components/control/people/people-data';
import { mockUserContext } from '@/lib/mock-user-context';

const STAGES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'planning', label: 'Planning' },
  { id: 'materials', label: 'Materials' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in-production', label: 'In Production' },
  { id: 'review-close', label: 'Review & Close' },
] as const;

type StageId = (typeof STAGES)[number]['id'];

function stageProgress(stage: StageId): number {
  const idx = STAGES.findIndex((s) => s.id === stage);
  return Math.round(((idx + 1) / STAGES.length) * 100);
}

/** Document flow lineage for the current job — labels are IDs; docType is the full document name for tooltips */
const DOCUMENT_FLOW = [
  { label: 'OPP-2026-0001', href: '/sell/opportunities/opp-001', docType: 'Opportunity' as const },
  { label: 'Q-2026-0055', href: '/sell/quotes/qt-001', docType: 'Quote' as const },
  { label: 'SO-2026-0085', href: '/sell/orders/so-001', docType: 'Sales order' as const },
  { label: 'JOB-2026-0012', href: '/plan/jobs/JOB-2026-0012', docType: 'Job' as const },
  { label: 'WO-2026-0001', href: '#', docType: 'Work order' as const },
  { label: 'MO-2026-0001', href: '#', docType: 'Manufacturing order' as const },
];

export function PlanJobDetail() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const isNew = !routeId || routeId === 'new';

  const userRole = 'Manager' as 'Operator' | 'Supervisor' | 'Scheduler' | 'Manager' | 'Admin';
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStage, setCurrentStage] = useState<StageId>('planning');
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [selectedTravellerId, setSelectedTravellerId] = useState<string | null>('traveller-001');

  // Use the route id when present so deep links resolve correctly; fall back
  // to the legacy hard-coded job for any other entry (preserves behaviour for
  // callers that mounted this component without a /:id route).
  const jobId = !isNew && routeId ? routeId : 'JOB-2026-0015';
  const quoteId = 'Q-2026-0055';
  const hasBudgetAccess = ['Scheduler', 'Manager', 'Admin'].includes(userRole);
  const activePermissionUser = useMemo(
    () =>
      peopleUsers.find((user) => user.name === mockUserContext.displayName) ??
      peopleUsers.find((user) => user.modules.some((assignment) => assignment.module === 'plan')) ??
      peopleUsers[0],
    [],
  );
  const planPermissionGrants = activePermissionUser?.effectivePermissions ?? [];

  const hasPlanPermission = (permissionKey: PermissionKey): boolean =>
    planPermissionGrants.some(
      (grant) =>
        grant.module === 'plan' &&
        grant.key === permissionKey &&
        grant.value === true,
    );

  const canReleaseTraveller = hasPlanPermission('traveller.release');
  const canViewAllTravellers = hasPlanPermission('traveller.view_all');

  const travellers = useTravellerStore(
    useShallow((state) =>
      state.travellers.filter(
        (packet) => packet.jobRef === jobId || (canViewAllTravellers && packet.status === 'released'),
      ),
    ),
  );
  const releaseTraveller = useTravellerStore((state) => state.releaseTraveller);

  const selectedTraveller =
    travellers.find((packet) => packet.id === selectedTravellerId) ??
    travellers[0] ??
    null;
  const selectedTravellerReady = selectedTraveller ? isTravellerReadyForRelease(selectedTraveller) : false;
  const selectedTravellerReleased = selectedTraveller?.status === 'released';

  const tabs = useMemo<JobWorkspaceTabConfig[]>(() => {
    const base: JobWorkspaceTabConfig[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'production', label: 'Production', count: 4 },
      { id: 'travellers', label: 'Travellers', count: travellers.length },
    ];
    if (hasBudgetAccess) {
      base.push({ id: 'budget', label: 'Budget' });
    }
    base.push(
      { id: 'schedule', label: 'Schedule', count: 9 },
      { id: 'intelligence', label: 'Intelligence Hub' },
    );
    return base;
  }, [hasBudgetAccess, travellers.length]);

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return <PlanOverviewTab />;
      case 'production':
        return <PlanProductionTab />;
      case 'schedule':
        return <PlanScheduleTab />;
      case 'intelligence':
        return <PlanIntelligenceHubTab onOpenBudget={() => setActiveTab('budget')} />;
      case 'budget':
        return (
          <PlanBudgetTab
            jobId={jobId}
            userRole={userRole}
            quoteId={quoteId}
            onOpenIntelligence={() => setActiveTab('intelligence')}
          />
        );
      case 'travellers':
        return (
          <PlanTravellersTab
            travellers={travellers}
            selectedTravellerId={selectedTraveller?.id ?? null}
            onSelectTraveller={setSelectedTravellerId}
          />
        );
      default:
        return null;
    }
  };

  const handleReleaseToFloor = () => {
    if (!selectedTraveller) return;
    const result = releaseTraveller(selectedTraveller.id);
    if (result.ok) {
      toast.success(`${selectedTraveller.travellerNumber} released to floor.`);
      setIsReleaseDialogOpen(false);
      return;
    }
    toast.error(result.reason ?? 'Unable to release traveller.');
  };

  const checklistRows = selectedTraveller
    ? [
        { label: 'Routing complete', pass: selectedTraveller.checklist.routingComplete },
        { label: 'Drawing attached', pass: selectedTraveller.checklist.drawingAttached },
        { label: 'NC attached (if required)', pass: selectedTraveller.checklist.ncAttachedIfRequired },
        { label: 'Instructions present', pass: selectedTraveller.checklist.instructionsPresent },
        {
          label: 'Material status ready / ordered',
          pass:
            selectedTraveller.checklist.materialStatus === 'ready' ||
            selectedTraveller.checklist.materialStatus === 'ordered',
          detail: selectedTraveller.checklist.materialStatus,
        },
        { label: 'Revision locked', pass: selectedTraveller.checklist.revisionLocked },
      ]
    : [];

  // Brand-new job: render a focused create form. We branch here (after all
  // hooks) so existing callers and deep links keep working unchanged.
  if (isNew) {
    return <PlanJobCreateForm onCancel={() => navigate('/plan/jobs')} />;
  }

  return (
    <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
      <JobWorkspaceLayout
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Jobs', href: '/plan/jobs' },
          { label: 'Differential Assembly' },
        ]}
        title="Differential Assembly"
        subtitle={
          <>
            <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">{jobId}</span>
            <span>Drivetrain Dynamics Pty Ltd</span>
            <span className="tabular-nums">$185,000</span>
          </>
        }
        metaRow={
          <div className="flex flex-col gap-3 w-full">
            <ProgressBar value={stageProgress(currentStage)} showLabel size="sm" />

            <div className="flex items-center gap-0 border border-[var(--border)] rounded-full overflow-hidden w-fit">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setCurrentStage(stage.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    currentStage === stage.id
                      ? 'bg-[var(--mw-yellow-400)] text-primary-foreground'
                      : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:text-[var(--neutral-400)] dark:hover:bg-[var(--neutral-800)]'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>

            <nav aria-label="Document flow" className="flex flex-wrap items-center gap-1">
              {DOCUMENT_FLOW.map((doc, idx) => (
                <React.Fragment key={doc.label}>
                  {idx > 0 && (
                    <ChevronRight className="h-3 w-3 shrink-0 text-[var(--neutral-400)]" aria-hidden />
                  )}
                  <Link
                    to={doc.href}
                    title={doc.docType}
                    className={`inline-flex items-center rounded-full border text-xs tabular-nums px-2.5 py-0.5 font-medium transition-colors ${
                      doc.label === jobId
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/10 text-foreground'
                        : 'border-[var(--border)] text-foreground hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-800)]'
                    }`}
                  >
                    {doc.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {selectedTraveller ? (
              <Card variant="flat" className="border-[var(--border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Traveller control point</p>
                    <p className="text-xs text-[var(--neutral-500)]">
                      Operators can view and execute released travellers only.
                    </p>
                  </div>
                  <StatusBadge variant={selectedTravellerReleased ? 'accent' : selectedTravellerReady ? 'info' : 'warning'}>
                    {selectedTraveller.status === 'in_progress'
                      ? 'In progress'
                      : selectedTraveller.status.slice(0, 1).toUpperCase() + selectedTraveller.status.slice(1)}
                  </StatusBadge>
                </div>
                <Separator className="my-3" />
                <p className="text-xs text-[var(--neutral-600)]">
                  Selected packet: <span className="text-foreground font-medium">{selectedTraveller.travellerNumber}</span> • {selectedTraveller.workOrderRef} • {selectedTraveller.currentOperation}
                </p>
              </Card>
            ) : null}
          </div>
        }
        headerActions={
          <>
            <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => navigate('/plan/jobs')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" className="h-12 border-[var(--border)]">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            {canReleaseTraveller ? (
              <Button
                className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                onClick={() => setIsReleaseDialogOpen(true)}
                disabled={!selectedTraveller || selectedTravellerReleased}
              >
                <SendToBack className="mr-2 h-4 w-4" />
                Release to floor
              </Button>
            ) : null}
            <Button
              className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={() => navigate(`/make/manufacturing-orders/new?jobId=${jobId}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create manufacturing order
            </Button>
          </>
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderTabPanel={renderTabPanel}
      />

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Release to floor</DialogTitle>
          <DialogDescription>
            This traveller can only be issued once files, routing, and materials are ready.
          </DialogDescription>
        </DialogHeader>

        {selectedTraveller ? (
          <div className="space-y-4">
            <Card variant="flat" className="border-[var(--border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{selectedTraveller.travellerNumber}</p>
                <p className="text-xs text-[var(--neutral-500)]">
                  {selectedTraveller.jobRef} / {selectedTraveller.workOrderRef}
                </p>
              </div>
              <p className="mt-1 text-sm text-[var(--neutral-600)]">{selectedTraveller.partName}</p>
            </Card>

            <Card variant="flat" className="border-[var(--border)] p-4">
              <p className="mb-2 text-sm font-medium">Release checklist</p>
              <div className="space-y-2">
                {checklistRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--neutral-100)] pb-2 last:border-0 last:pb-0"
                  >
                    <p className="text-sm text-foreground">
                      {row.label}
                      {row.detail ? (
                        <span className="ml-1 text-[var(--neutral-500)]">({row.detail})</span>
                      ) : null}
                    </p>
                    <StatusBadge variant={row.pass ? 'success' : 'warning'}>
                      {row.pass ? 'Ready' : 'Missing'}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="flat" className="border-[var(--border)] p-4">
              <p className="text-sm text-[var(--neutral-600)]">
                Operators can view and execute released travellers only. If something is missing,
                place the traveller on hold and notify planning.
              </p>
            </Card>
          </div>
        ) : (
          <p className="text-sm text-[var(--neutral-500)]">No traveller selected.</p>
        )}

        <DialogFooter>
          <Button variant="outline" className="h-12 border-[var(--border)]" onClick={() => setIsReleaseDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            disabled={!selectedTraveller || !selectedTravellerReady || selectedTravellerReleased}
            onClick={handleReleaseToFloor}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Issue traveller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// PlanJobCreateForm — minimal create form for /plan/jobs/new
// ---------------------------------------------------------------------------

function PlanJobCreateForm({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // TODO(backend): jobs.create({ title, customer, value, dueDate, notes })
    const stubId = `JOB-NEW-${Date.now()}`;
    toast.success('Job created');
    navigate(`/plan/jobs/${stubId}`, { replace: true });
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--neutral-500)] mb-1">
            <Link to="/plan/jobs" className="hover:underline">Plan / Jobs</Link>
            <span className="mx-1">/</span>
            <span>New</span>
          </p>
          <h1 className="text-2xl font-medium text-foreground">New Job</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            Capture the customer brief; production fields populate after release.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 border-[var(--border)]" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button
            className="h-10 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-5 max-w-3xl">
        <h2 className="text-sm font-medium text-foreground">Job details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Differential Assembly"
              className="mt-1 h-10 border-[var(--border)]"
            />
          </div>
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Customer</Label>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Drivetrain Dynamics Pty Ltd"
              className="mt-1 h-10 border-[var(--border)]"
            />
          </div>
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Value</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="$0"
              className="mt-1 h-10 border-[var(--border)] tabular-nums"
            />
          </div>
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 h-10 border-[var(--border)]"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-[var(--neutral-500)]">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Brief, scope, special requirements…"
            className="mt-1 min-h-24 border-[var(--border)]"
          />
        </div>
      </Card>
    </PageShell>
  );
}
