/**
 * Sell Opportunities - Drag-and-drop Kanban board
 * 6 columns: New, Qualified, Proposal, Negotiation, Won, Lost
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Plus, DollarSign, Calendar, Flag } from 'lucide-react';
import { InlineEmpty } from '@/components/shared/feedback/EmptyState';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSummaryBar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import type { Opportunity } from './sell-opportunity-types';

const KANBAN_ITEM_TYPE = 'sell-opportunity';

type OpportunityStage = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

const mockOpportunities: Opportunity[] = [
  { id: '1', title: 'Server Rack Fabrication', customer: 'TechCorp Industries', value: 45000, expectedClose: '2026-04-15', assignedTo: 'SC', priority: 'high', stage: 'proposal' },
  { id: '2', title: 'Structural Steel Package', customer: 'BHP Contractors', value: 128000, expectedClose: '2026-04-30', assignedTo: 'MT', priority: 'urgent', stage: 'negotiation' },
  { id: '3', title: 'Custom Brackets (50 units)', customer: 'Pacific Fab', value: 8500, expectedClose: '2026-03-25', assignedTo: 'EW', priority: 'medium', stage: 'qualified' },
  { id: '4', title: 'Rail Platform Components', customer: 'Sydney Rail Corp', value: 67000, expectedClose: '2026-05-10', assignedTo: 'DL', priority: 'high', stage: 'proposal' },
  { id: '5', title: 'Machine Guards', customer: 'Kemppi Australia', value: 12000, expectedClose: '2026-03-30', assignedTo: 'SC', priority: 'low', stage: 'new' },
  { id: '6', title: 'Aluminium Enclosures', customer: 'Hunter Steel Co', value: 22000, expectedClose: '2026-04-05', assignedTo: 'MT', priority: 'medium', stage: 'new' },
];

const stages: { key: OpportunityStage; label: string; summaryColor: string }[] = [
  { key: 'new', label: 'New', summaryColor: 'var(--neutral-500)' },
  { key: 'qualified', label: 'Qualified', summaryColor: 'var(--mw-info)' },
  { key: 'proposal', label: 'Proposal', summaryColor: 'var(--mw-info)' },
  { key: 'negotiation', label: 'Negotiation', summaryColor: 'var(--mw-warning)' },
  { key: 'won', label: 'Won', summaryColor: 'var(--mw-success)' },
  { key: 'lost', label: 'Lost', summaryColor: 'var(--mw-error)' },
];

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'urgent': return { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]', label: 'Urgent' };
    case 'high': return { bg: 'bg-[var(--mw-yellow-400)]/20', text: 'text-[var(--neutral-900)]', label: 'High' };
    case 'medium': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-900)]', label: 'Medium' };
    case 'low': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Low' };
  }
};

export function SellOpportunities() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);

  const getOpportunitiesByStage = (stage: OpportunityStage) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const handleStageChange = (id: string, stage: OpportunityStage) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, stage } : o));
  };

  const handleKanbanDrop = (item: KanbanDragItem, columnId: string) => {
    handleStageChange(item.id, columnId as OpportunityStage);
  };

  const pipelineValue = opportunities.reduce((sum, o) => sum + o.value, 0);

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Opportunities"
        subtitle={`${opportunities.length} total • $${pipelineValue.toLocaleString()} pipeline value`}
      />

      <ToolbarSummaryBar
        segments={stages.filter(s => s.key !== 'lost').map(s => ({
          key: s.key,
          label: s.label,
          value: getOpportunitiesByStage(s.key).reduce((sum, o) => sum + o.value, 0),
          color: s.summaryColor,
        }))}
      />

      <PageToolbar>
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New opportunity form coming soon')}>
          New Opportunity
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Kanban Board */}
      <motion.div variants={staggerItem}>
        <KanbanBoard className="gap-4">
          {stages.map((stage) => {
            const stageOpps = getOpportunitiesByStage(stage.key);
            const stageValue = stageOpps.reduce((sum, o) => sum + o.value, 0);

            return (
              <KanbanColumn
                key={stage.key}
                id={stage.key}
                title={stage.label}
                count={stageOpps.length}
                accept={KANBAN_ITEM_TYPE}
                onDrop={handleKanbanDrop}
                className="min-w-[320px] w-[320px] flex-shrink-0"
              >
                <div className="flex items-center justify-between px-0.5 pb-1 text-xs text-[var(--neutral-500)]">
                  <span className="tabular-nums">${stageValue.toLocaleString()}</span>
                  <button type="button" className="p-1 hover:bg-[var(--border)] rounded transition-colors" aria-label="Add opportunity" onClick={() => toast('New opportunity form coming soon')}>
                    <Plus className="w-4 h-4 text-[var(--neutral-500)]" />
                  </button>
                </div>

                {stageOpps.map((opp) => {
                  const priorityBadge = getPriorityBadge(opp.priority);
                  return (
                    <KanbanCard key={opp.id} id={opp.id} type={KANBAN_ITEM_TYPE} className="p-0">
                      <div
                        role="button"
                        tabIndex={0}
                        className="p-4 cursor-pointer group"
                        onClick={() => navigate(`/sell/opportunities/${opp.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/sell/opportunities/${opp.id}`);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-sm font-medium text-[var(--neutral-900)] group-hover:text-[var(--mw-yellow-400)] transition-colors line-clamp-2">
                            {opp.title}
                          </h4>
                          <Badge className={cn("rounded-full text-xs px-2.5 py-0.5 border-0 flex-shrink-0 ml-2", priorityBadge.bg, priorityBadge.text)}>
                            {priorityBadge.label}
                          </Badge>
                        </div>

                        <p className="text-xs text-[var(--neutral-500)] mb-4">{opp.customer}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1 text-xs text-[var(--neutral-900)]">
                            <DollarSign className="w-4 h-4 text-[var(--neutral-900)]" />
                            <span className="font-medium tabular-nums">${opp.value.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[var(--neutral-500)]">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(opp.expectedClose).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-[var(--mw-mirage)] text-white text-[10px]">{opp.assignedTo}</AvatarFallback>
                          </Avatar>
                          <Flag className="w-4 h-4 text-[var(--neutral-500)]" />
                        </div>
                      </div>
                    </KanbanCard>
                  );
                })}

                {stageOpps.length === 0 && (
                  <InlineEmpty message="No opportunities" />
                )}
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
      </motion.div>

    </PageShell>
  );
}
