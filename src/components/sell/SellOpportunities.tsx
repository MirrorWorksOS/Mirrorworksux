/**
 * Sell Opportunities - Drag-and-drop Kanban board
 * 6 columns: New, Qualified, Proposal, Negotiation, Won, Lost
 */

import React, { useState } from 'react';
import { Plus, Filter, DollarSign, Calendar, Flag } from 'lucide-react';
import { InlineEmpty } from '@/components/shared/feedback/EmptyState';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus, AnimatedFilter } from '../ui/animated-icons';
import { SellOpportunityDetail, type Opportunity } from './SellOpportunityDetail';

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

const stages: { key: OpportunityStage; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'var(--neutral-500)' },
  { key: 'qualified', label: 'Qualified', color: 'var(--mw-info)' },
  { key: 'proposal', label: 'Proposal', color: 'var(--mw-info)' },
  { key: 'negotiation', label: 'Negotiation', color: 'var(--mw-warning)' },
  { key: 'won', label: 'Won', color: 'var(--mw-success)' },
  { key: 'lost', label: 'Lost', color: 'var(--mw-error)' },
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const getOpportunitiesByStage = (stage: OpportunityStage) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const handleStageChange = (id: string, stage: OpportunityStage) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, stage } : o));
    setSelectedOpp(prev => prev?.id === id ? { ...prev, stage } : prev);
  };

  const handleKanbanDrop = (item: KanbanDragItem, columnId: string) => {
    handleStageChange(item.id, columnId as OpportunityStage);
  };

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--neutral-900)]">Opportunities</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            <span className="tabular-nums">{opportunities.length}</span> total • <span className="tabular-nums">${opportunities.reduce((sum, o) => sum + o.value, 0).toLocaleString()}</span> pipeline value
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full border-[var(--border)] group">
            <AnimatedFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--neutral-900)] rounded-full group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

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
                headerColor={stage.color}
                className="min-w-[320px] w-[320px] flex-shrink-0"
              >
                <div className="flex items-center justify-between px-0.5 pb-1 text-xs text-[var(--neutral-500)]">
                  <span className="tabular-nums">${stageValue.toLocaleString()}</span>
                  <button type="button" className="p-1 hover:bg-[var(--border)] rounded transition-colors" aria-label="Add opportunity">
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
                        onClick={() => setSelectedOpp(opp)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedOpp(opp);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xs font-medium text-[var(--neutral-900)] group-hover:text-[var(--mw-yellow-400)] transition-colors line-clamp-2">
                            {opp.title}
                          </h4>
                          <Badge className={cn("rounded text-xs px-1.5 py-0.5 border-0 flex-shrink-0 ml-2", priorityBadge.bg, priorityBadge.text)}>
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

      {/* Opportunity Detail Sheet */}
      <SellOpportunityDetail
        opportunity={selectedOpp}
        open={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onStageChange={handleStageChange}
      />
    </motion.div>
  );
}
