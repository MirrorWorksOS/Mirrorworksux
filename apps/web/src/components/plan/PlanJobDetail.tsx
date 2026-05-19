import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Plus, Save, Pencil, SendToBack, ShieldAlert } from 'lucide-react';
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
import { PlanMirrorViewTab } from './PlanMirrorViewTab';
import { PlanScheduleTab } from './PlanScheduleTab';
import { PlanIntelligenceHubTab } from './PlanIntelligenceHubTab';
import { PlanBudgetTab } from './PlanBudgetTab';
import { PlanTravellersTab } from './PlanTravellersTab';
import { JobActivitiesTab } from './job-detail/JobActivitiesTab';
import { DocumentChainPill, buildManufacturingFlow } from '@/components/shared/data/DocumentChainPill';
import { ChatterButton } from '@/components/shared/chatter';
import { useJobActivityStore } from '@/store/jobActivityStore';
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

export function PlanJobDetail() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const isNew = !routeId || routeId === 'new';

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTabInternal] = useState<string>(tabFromUrl ?? 'overview');
  const setActiveTab = (tab: string) => {
    setActiveTabInternal(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === 'overview') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabInternal(tabFromUrl);
    }
  }, [tabFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  const [currentStage, setCurrentStage] = useState<StageId>('planning');
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  // Allow deep-linking to a specific traveller via `?traveller=<id>` query param.
  const travellerFromUrl = searchParams.get('traveller');
  const [selectedTravellerId, setSelectedTravellerId] = useState<string | null>(
    travellerFromUrl ?? 'traveller-001',
  );
  useEffect(() => {
    if (travellerFromUrl && travellerFromUrl !== selectedTravellerId) {
      setSelectedTravellerId(travellerFromUrl);
    }
  }, [travellerFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  // Header-level Edit ↔ Save toggle. Starts in view mode for existing jobs,
  // edit mode for new jobs so the form is immediately writable.
  const [isEditing, setIsEditing] = useState<boolean>(isNew);

  // Use the route id when present so deep links resolve correctly; fall back
  // to the legacy hard-coded job for any other entry (preserves behaviour for
  // callers that mounted this component without a /:id route).
  const jobId = !isNew && routeId ? routeId : 'JOB-2026-0015';
  const quoteId = 'Q-2026-0055';
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

  const canViewBudget = hasPlanPermission('budget.visibility');
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

  const openActivityCount = useJobActivityStore((s) =>
    s.activities.filter(
      (a) =>
        (a.jobId === jobId || a.jobNumber === jobId) &&
        a.status !== 'completed' &&
        a.status !== 'cancelled',
    ).length,
  );

  const tabs = useMemo<JobWorkspaceTabConfig[]>(() => {
    const base: JobWorkspaceTabConfig[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'production', label: 'Production', count: 4 },
      { id: 'mirrorview', label: 'MirrorView' },
      { id: 'travellers', label: 'Travellers', count: travellers.length },
      { id: 'activities', label: 'Activities', count: openActivityCount },
    ];
    if (canViewBudget) {
      base.push({ id: 'budget', label: 'Budget' });
    }
    base.push(
      { id: 'schedule', label: 'Schedule', count: 9 },
      { id: 'intelligence', label: 'Intelligence Hub' },
    );
    return base;
  }, [canViewBudget, travellers.length, openActivityCount]);

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <PlanOverviewTab
            isEditing={isEditing}
            onEditToggle={() => setIsEditing((v) => !v)}
            onSwitchTab={(t) => setActiveTab(t)}
          />
        );
      case 'production':
        return <PlanProductionTab />;
      case 'mirrorview':
        return <PlanMirrorViewTab />;
      case 'schedule':
        return <PlanScheduleTab editable />;
      case 'intelligence':
        return <PlanIntelligenceHubTab onOpenBudget={() => setActiveTab('budget')} />;
      case 'budget':
        return (
          <PlanBudgetTab
            jobId={jobId}
            canViewBudget={canViewBudget}
            quoteId={quoteId}
            onOpenIntelligence={() => setActiveTab('intelligence')}
          />
        );
      case 'activities':
        return <JobActivitiesTab jobId={jobId} />;
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

  // Brand-new job uses the same workspace shell so users land in the same
  // context they will work in — no separate "blank form" page.
  const titleText = isNew ? 'New Job' : 'Differential Assembly';
  const subtitleCustomer = isNew ? 'Pick a customer to attach this job to' : 'Drivetrain Dynamics Pty Ltd';
  const subtitleValue = isNew ? '$0' : '$185,000';

  return (
    <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
      <JobWorkspaceLayout
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Jobs', href: '/plan/jobs' },
          { label: titleText },
        ]}
        title={titleText}
        subtitle={
          <>
            <DocumentChainPill
              flow={buildManufacturingFlow(isNew ? 'JOB-NEW' : jobId)}
              activeLabel={isNew ? 'JOB-NEW' : jobId}
            />
            <span>{subtitleCustomer}</span>
            <span className="tabular-nums">{subtitleValue}</span>
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
                      : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:text-[var(--muted-foreground)] dark:hover:bg-[var(--neutral-800)]'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>

            {selectedTraveller ? (
              <Card variant="flat" className="border-[var(--border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Traveller control point</p>
                    <p className="text-xs text-[var(--neutral-500)]">
                      Released travellers only — request release access from your Plan lead.
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
            <Button
              variant="outline"
              className="h-12 border-[var(--border)]"
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/plan/jobs');
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              className="h-12 border-[var(--border)]"
              onClick={() => {
                if (isEditing) {
                  toast.success(isNew ? 'Job created' : 'Job saved');
                  if (isNew) {
                    const stubId = `JOB-NEW-${Date.now()}`;
                    navigate(`/plan/jobs/${stubId}`, { replace: true });
                  }
                }
                setIsEditing((v) => !v);
              }}
            >
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            {!isNew && <ChatterButton entity={{ type: 'job', id: jobId }} />}
            {canReleaseTraveller && !isNew ? (
              <Button
                className="h-12 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
                onClick={() => setIsReleaseDialogOpen(true)}
                disabled={!selectedTraveller || selectedTravellerReleased}
              >
                <SendToBack className="mr-2 h-4 w-4" />
                Release to floor
              </Button>
            ) : null}
            {!isNew ? (
              <Button
                className="h-12 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
                onClick={() => navigate(`/make/manufacturing-orders/new?jobId=${jobId}`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create manufacturing order
              </Button>
            ) : null}
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
                Released travellers can be viewed and executed by anyone with traveller access. If
                something is missing, place the traveller on hold and notify planning.
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

