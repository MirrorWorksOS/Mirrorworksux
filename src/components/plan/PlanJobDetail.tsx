import React, { useState } from 'react';
import { ArrowLeft, Calendar, Sparkles, Bell, Settings, MoreVertical, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { PlanOverviewTab } from './PlanOverviewTab';
import { PlanProductionTab } from './PlanProductionTab';
import { PlanScheduleTab } from './PlanScheduleTab';
import { PlanIntelligenceHubTab } from './PlanIntelligenceHubTab';
import { PlanBudgetTab } from './PlanBudgetTab';

interface PlanJobDetailProps {
  onBack: () => void;
  userRole?: 'Operator' | 'Supervisor' | 'Scheduler' | 'Manager' | 'Admin';
}

export function PlanJobDetail({ onBack, userRole = 'Manager' }: PlanJobDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'schedule' | 'intelligence' | 'budget'>('overview');

  // Mock job data - replace with actual props
  const jobId = 'JOB-2026-0012';
  const quoteId = 'MW-Q-0042';

  // Check if user has budget access
  const hasBudgetAccess = ['Scheduler', 'Manager', 'Admin'].includes(userRole);

  return (
    <div className="min-h-screen bg-[var(--neutral-100)] flex flex-col">
      {/* Job Header */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--mw-mirage)]" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className=" text-[20px] font-semibold text-[var(--mw-mirage)]">
              Server Rack Chassis
            </h1>
            <Badge className="bg-[var(--mw-green)] text-white px-2 py-0.5 text-xs font-medium rounded">
              New
            </Badge>
            <span className=" text-sm text-[var(--neutral-500)]">
              $20,000
            </span>
          </div>
          <button className="ml-auto p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
            <MoreVertical className="w-5 h-5 text-[var(--neutral-500)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-2  text-sm rounded-[var(--shape-lg)] transition-colors",
              activeTab === 'overview' 
                ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium' 
                : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={cn(
              "px-4 py-2  text-sm rounded-[var(--shape-lg)] transition-colors flex items-center gap-2",
              activeTab === 'production' 
                ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium' 
                : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
            )}
          >
            Production
            <span className="flex items-center justify-center w-5 h-5 bg-[var(--mw-mirage)] text-white text-xs rounded-full font-medium">
              4
            </span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "px-4 py-2  text-sm rounded-[var(--shape-lg)] transition-colors flex items-center gap-2",
              activeTab === 'schedule' 
                ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium' 
                : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
            )}
          >
            Schedule
            <span className="flex items-center justify-center w-5 h-5 bg-[var(--mw-mirage)] text-white text-xs rounded-full font-medium">
              9
            </span>
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={cn(
              "px-4 py-2  text-sm rounded-[var(--shape-lg)] transition-colors flex items-center gap-2",
              activeTab === 'intelligence' 
                ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium' 
                : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
            )}
          >
            Intelligence Hub
            <Sparkles className="w-4 h-4" />
          </button>
          {hasBudgetAccess && (
            <button
              onClick={() => setActiveTab('budget')}
              className={cn(
                "px-4 py-2  text-sm rounded-[var(--shape-lg)] transition-colors flex items-center gap-2",
                activeTab === 'budget' 
                  ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)] font-medium' 
                  : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]'
              )}
            >
              Budget
              <DollarSign className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && <PlanOverviewTab />}
        {activeTab === 'production' && <PlanProductionTab />}
        {activeTab === 'schedule' && <PlanScheduleTab />}
        {activeTab === 'intelligence' && <PlanIntelligenceHubTab />}
        {activeTab === 'budget' && <PlanBudgetTab jobId={jobId} userRole={userRole} quoteId={quoteId} />}
      </div>
    </div>
  );
}