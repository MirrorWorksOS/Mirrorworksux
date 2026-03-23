/**
 * Sell Opportunities - Drag-and-drop Kanban board
 * 6 columns: New, Qualified, Proposal, Negotiation, Won, Lost
 */

import React, { useState } from 'react';
import { Plus, Filter, DollarSign, Calendar, User, Flag } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus, AnimatedFilter } from '../ui/animated-icons';
import { SellOpportunityDetail, type Opportunity } from './SellOpportunityDetail';

const { animationVariants } = designSystem;

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
  { key: 'new', label: 'New', color: '#737373' },
  { key: 'qualified', label: 'Qualified', color: '#0052CC' },
  { key: 'proposal', label: 'Proposal', color: '#0052CC' },
  { key: 'negotiation', label: 'Negotiation', color: '#FACC15' },
  { key: 'won', label: 'Won', color: '#36B37E' },
  { key: 'lost', label: 'Lost', color: '#DE350B' },
];

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'urgent': return { bg: 'bg-[#FFEBE6]', text: 'text-[#DE350B]', label: 'Urgent' };
    case 'high': return { bg: 'bg-[#FFF4CC]', text: 'text-[#805900]', label: 'High' };
    case 'medium': return { bg: 'bg-[#DEEBFF]', text: 'text-[#0052CC]', label: 'Medium' };
    case 'low': return { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Low' };
  }
};

export function SellOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [selectedOpp, setSelectedOpp]     = useState<Opportunity | null>(null);

  const getOpportunitiesByStage = (stage: OpportunityStage) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const handleStageChange = (id: string, stage: OpportunityStage) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, stage } : o));
    setSelectedOpp(prev => prev?.id === id ? { ...prev, stage } : prev);
  };

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Opportunities</h1>
          <p className="text-sm text-[#737373] mt-1">
            {opportunities.length} total • ${opportunities.reduce((sum, o) => sum + o.value, 0).toLocaleString()} pipeline value
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5] group">
            <AnimatedFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, idx) => {
          const stageOpps  = getOpportunitiesByStage(stage.key);
          const stageValue = stageOpps.reduce((sum, o) => sum + o.value, 0);

          return (
            <motion.div key={stage.key} variants={animationVariants.listItem} custom={idx} className="flex-shrink-0 w-[320px]">
              <div className="bg-[#FAFAFA] rounded-2xl p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-[14px] font-semibold text-[#0A0A0A]">{stage.label}</h3>
                    <Badge className="bg-[#E5E5E5] text-[#525252] border-0 text-xs">{stageOpps.length}</Badge>
                  </div>
                  <button className="p-1 hover:bg-[#E5E5E5] rounded transition-colors">
                    <Plus className="w-4 h-4 text-[#737373]" />
                  </button>
                </div>

                <div className="text-xs text-[#737373] mb-3 font-mono">
                  ${stageValue.toLocaleString()}
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {stageOpps.map((opp) => {
                    const priorityBadge = getPriorityBadge(opp.priority);
                    return (
                      <Card
                        key={opp.id}
                        className="bg-white border border-[#E5E5E5] rounded-2xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        onClick={() => setSelectedOpp(opp)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-[13px] font-medium text-[#0A0A0A] group-hover:text-[#0052CC] transition-colors line-clamp-2">
                            {opp.title}
                          </h4>
                          <Badge className={cn("rounded text-xs px-1.5 py-0.5 border-0 flex-shrink-0 ml-2", priorityBadge.bg, priorityBadge.text)}>
                            {priorityBadge.label}
                          </Badge>
                        </div>

                        <p className="text-xs text-[#737373] mb-3">{opp.customer}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-xs text-[#0A0A0A]">
                            <DollarSign className="w-3.5 h-3.5 text-[#36B37E]" />
                            <span className="font-mono font-semibold">${opp.value.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#737373]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(opp.expectedClose).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-[#0052CC] text-white text-[10px]">{opp.assignedTo}</AvatarFallback>
                          </Avatar>
                          <Flag className="w-3.5 h-3.5 text-[#737373]" />
                        </div>
                      </Card>
                    );
                  })}

                  {/* Empty state */}
                  {stageOpps.length === 0 && (
                    <div className="bg-white border border-dashed border-[#E5E5E5] rounded-lg p-6 text-center">
                      <p className="text-xs text-[#737373]">No opportunities</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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