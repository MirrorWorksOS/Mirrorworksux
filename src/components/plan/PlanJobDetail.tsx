import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, DollarSign, Plus, Save } from 'lucide-react';
import { Button } from '../ui/button';
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
  const { id } = useParams<{ id: string }>();
  const userRole = 'Manager' as 'Operator' | 'Supervisor' | 'Scheduler' | 'Manager' | 'Admin';
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStage, setCurrentStage] = useState<StageId>('planning');

  const jobId = 'JOB-2026-0012';
  const quoteId = 'MW-Q-0042';
  const hasBudgetAccess = ['Scheduler', 'Manager', 'Admin'].includes(userRole);

  const tabs = useMemo<JobWorkspaceTabConfig[]>(() => {
    const base: JobWorkspaceTabConfig[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'production', label: 'Production', count: 4 },
      { id: 'schedule', label: 'Schedule', count: 9 },
      { id: 'intelligence', label: 'Intelligence Hub' },
    ];
    if (hasBudgetAccess) {
      base.push({ id: 'budget', label: 'Budget' });
    }
    return base;
  }, [hasBudgetAccess]);

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return <PlanOverviewTab />;
      case 'production':
        return <PlanProductionTab />;
      case 'schedule':
        return <PlanScheduleTab />;
      case 'intelligence':
        return <PlanIntelligenceHubTab />;
      case 'budget':
        return <PlanBudgetTab jobId={jobId} userRole={userRole} quoteId={quoteId} />;
      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Plan', href: '/plan' },
        { label: 'Jobs', href: '/plan/jobs' },
        { label: 'Server Rack Chassis' },
      ]}
      title="Server Rack Chassis"
      subtitle={
        <>
          <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">{jobId}</span>
          <span>TechCorp Industries</span>
          <span className="tabular-nums">$20,000</span>
        </>
      }
      metaRow={
        <div className="flex flex-col gap-3 w-full">
          {/* Progress bar */}
          <ProgressBar value={stageProgress(currentStage)} showLabel size="sm" />

          {/* Stage button group */}
          <div className="flex items-center gap-0 border border-[var(--border)] rounded-full overflow-hidden w-fit">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setCurrentStage(stage.id)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  currentStage === stage.id
                    ? 'bg-[var(--mw-yellow-400)] text-primary-foreground'
                    : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Quote badge — Sell quotes list */}
          <div className="flex items-center gap-2">
            <Link
              to="/sell/quotes"
              className="inline-flex items-center rounded-full border border-[var(--border)] text-xs tabular-nums px-2.5 py-0.5 font-medium text-foreground hover:bg-[var(--neutral-50)] transition-colors"
            >
              {quoteId}
            </Link>
          </div>
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
          <Button
            className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={() => navigate('/make/manufacturing-orders')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create MO
          </Button>
        </>
      }
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}
