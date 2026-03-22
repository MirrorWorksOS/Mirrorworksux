/**
 * Sell Opportunity Detail — slide-over sheet
 * Two-column layout: customer/contact info + opportunity details
 * Stage tracker, activity feed, quick actions
 */
import React, { useState } from 'react';
import { X, DollarSign, Calendar, User, Phone, Mail, MapPin, FileText, MessageSquare, Clock, Plus, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { useNavigate } from 'react-router';
import { AIInsightCard } from '../shared/AIInsightCard';

type Priority   = 'low' | 'medium' | 'high' | 'urgent';
type Stage      = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  title: string;
  customer: string;
  value: number;
  expectedClose: string;
  assignedTo: string;
  priority: Priority;
  stage: Stage;
}

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'new',         label: 'New',         color: '#737373' },
  { key: 'qualified',   label: 'Qualified',   color: '#0A7AFF' },
  { key: 'proposal',    label: 'Proposal',    color: '#7C3AED' },
  { key: 'negotiation', label: 'Negotiation', color: '#FF8B00' },
  { key: 'won',         label: 'Won',         color: '#36B37E' },
  { key: 'lost',        label: 'Lost',        color: '#EF4444' },
];

const PRIORITY_CONFIG: Record<Priority, { bg: string; text: string; label: string }> = {
  urgent: { bg: 'bg-[#EF4444]', text: 'text-white',     label: 'Urgent' },
  high:   { bg: 'bg-[#FF8B00]', text: 'text-white',     label: 'High' },
  medium: { bg: 'bg-[#FFCF4B]', text: 'text-[#2C2C2C]', label: 'Medium' },
  low:    { bg: 'bg-[#36B37E]', text: 'text-white',     label: 'Low' },
};

// Mock customer data (would come from CRM API in production)
const MOCK_CUSTOMER: Record<string, { contact: string; phone: string; email: string; address: string }> = {
  'TechCorp Industries': { contact: 'James Hartley',     phone: '+61 2 9001 2345', email: 'james@techcorp.com.au',   address: '12 Tech Park Dr, Macquarie Park NSW' },
  'BHP Contractors':     { contact: 'Anika Patel',       phone: '+61 7 3100 0982', email: 'anika.p@bhp.com.au',     address: '1 BHP Way, Brisbane QLD' },
  'Pacific Fab':         { contact: 'Dale Nguyen',       phone: '+61 3 9422 1100', email: 'dale@pacificfab.com.au', address: '44 Fabrication Rd, Dandenong VIC' },
  'Sydney Rail Corp':    { contact: 'Rebecca O\'Brien',  phone: '+61 2 8000 4400', email: 'robrien@sydneyrail.gov.au', address: '130 Elizabeth St, Sydney NSW' },
  'Kemppi Australia':    { contact: 'Lars Knutsen',      phone: '+61 2 9765 4321', email: 'lars@kemppi.com.au',     address: '22 Welding Ln, Seven Hills NSW' },
  'Hunter Steel Co':     { contact: 'Mark Thompson',     phone: '+61 2 4000 1234', email: 'mark@huntersteel.com.au', address: '88 Steel St, Newcastle NSW' },
};

const MOCK_ACTIVITIES = [
  { type: 'Email',       text: 'Sent revised quote v2 — updated material costs', user: 'SC', time: '2h ago',  done: true },
  { type: 'Phone call',  text: 'Discussed lead time concerns re: steel delivery', user: 'SC', time: '1d ago',  done: true },
  { type: 'Meeting',     text: 'Site visit to review installation requirements',  user: 'MT', time: '3d ago',  done: true },
  { type: 'Follow-up',   text: 'Follow up on quote acceptance',                  user: 'SC', time: 'Tomorrow',done: false },
];

interface Props {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
  onStageChange?: (id: string, stage: Stage) => void;
}

export function SellOpportunityDetail({ opportunity, open, onClose, onStageChange }: Props) {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'notes'>('overview');

  if (!opportunity) return null;

  const customer = MOCK_CUSTOMER[opportunity.customer] ?? {
    contact: 'Contact unknown',
    phone: '—',
    email: '—',
    address: '—',
  };

  const stageIdx    = STAGES.findIndex(s => s.key === opportunity.stage);
  const priorityCfg = PRIORITY_CONFIG[opportunity.priority];
  const stageCfg    = STAGES[stageIdx];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className="w-[560px] sm:max-w-[560px] p-0 overflow-hidden flex flex-col border-l border-[#E5E5E5]"
        style={{ transition: 'transform 400ms cubic-bezier(0.2, 0.0, 0, 1.0)' }}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Opportunity detail</SheetTitle>
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5E5] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#737373] font-['Roboto_Mono',monospace]">OPP-{opportunity.id.padStart(4, '0')}</span>
                <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', priorityCfg.bg, priorityCfg.text)}>
                  {priorityCfg.label}
                </Badge>
              </div>
              <h2 className="text-[18px] font-semibold text-[#0A0A0A] leading-tight">{opportunity.title}</h2>
              <p className="text-sm text-[#737373] mt-0.5">{opportunity.customer}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg transition-colors shrink-0">
              <X className="w-4 h-4 text-[#737373]" />
            </button>
          </div>

          {/* Stage progress bar */}
          <div className="mt-4 flex items-center gap-1">
            {STAGES.filter(s => s.key !== 'lost').map((s, i) => {
              const active = s.key === opportunity.stage;
              const past   = STAGES.findIndex(st => st.key === opportunity.stage) > i && opportunity.stage !== 'lost';
              return (
                <button
                  key={s.key}
                  onClick={() => onStageChange?.(opportunity.id, s.key)}
                  className="flex-1 group relative"
                  title={s.label}
                >
                  <div className={cn(
                    'h-1.5 rounded-full transition-colors duration-200',
                    active  ? 'opacity-100' :
                    past    ? 'opacity-100' :
                    'bg-[#E5E5E5]'
                  )} style={{ backgroundColor: (active || past) ? s.color : undefined }} />
                  {active && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[#0A0A0A] font-medium whitespace-nowrap">
                      {s.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E5E5] px-6 shrink-0">
          {(['overview', 'activities', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-3 mr-6 text-sm capitalize border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-[#0A0A0A] text-[#0A0A0A] font-medium'
                  : 'border-transparent text-[#737373] hover:text-[#0A0A0A]'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-[#36B37E]" />
                    <span className="text-xs text-[#737373] uppercase tracking-wider font-medium">Deal value</span>
                  </div>
                  <p className="text-[22px] font-['Roboto_Mono',monospace] font-semibold text-[#0A0A0A]">
                    ${opportunity.value.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#0A7AFF]" />
                    <span className="text-xs text-[#737373] uppercase tracking-wider font-medium">Expected close</span>
                  </div>
                  <p className="text-[22px] font-['Geist:SemiBold',sans-serif] font-semibold text-[#0A0A0A]">
                    {new Date(opportunity.expectedClose).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>

              {/* Customer contact */}
              <div>
                <h4 className="text-xs text-[#737373] uppercase tracking-wider font-medium mb-3">Customer contact</h4>
                <div className="space-y-3">
                  {[
                    { icon: User,    value: customer.contact },
                    { icon: Phone,   value: customer.phone },
                    { icon: Mail,    value: customer.email },
                    { icon: MapPin,  value: customer.address },
                  ].map(({ icon: Icon, value }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#0A0A0A]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h4 className="text-xs text-[#737373] uppercase tracking-wider font-medium mb-3">Assignment</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#0A0A0A] text-white text-xs">{opportunity.assignedTo}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[#0A0A0A] font-medium">Assigned to {opportunity.assignedTo}</span>
                </div>
              </div>

              {/* AI Insight */}
              <AIInsightCard title="AI insight">
                Similar jobs for this customer closed within 18 days of proposal. Suggest following up by{' '}
                {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}.
                Win probability: <strong className="text-[#0A0A0A]">68%</strong>
              </AIInsightCard>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#0A0A0A]">Activity log</h4>
                <Button size="sm" className="h-8 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Log activity
                </Button>
              </div>
              <div className="space-y-3">
                {MOCK_ACTIVITIES.map((a, i) => (
                  <div key={i} className={cn('flex gap-4 p-4 rounded-lg border', a.done ? 'bg-white border-[#E5E5E5]' : 'bg-[#FFFBF0] border-[#FFCF4B]')}>
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', a.done ? 'bg-[#36B37E]' : 'bg-[#FF8B00]')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#0A0A0A]">{a.type}</span>
                        <span className="text-xs text-[#737373]">{a.time}</span>
                      </div>
                      <p className="text-sm text-[#0A0A0A]">{a.text}</p>
                    </div>
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarFallback className="bg-[#E5E5E5] text-[#737373] text-[9px]">{a.user}</AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6">
              <textarea
                className="w-full h-48 p-4 bg-[#F5F5F5] border-transparent rounded-lg text-sm text-[#0A0A0A] resize-none focus:outline-none focus:bg-white focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-all"
                placeholder="Add notes about this opportunity..."
                defaultValue="Customer requested 6-week lead time max. Discussed powder coat options — they prefer RAL 7035 light grey. Material cost increase of ~8% flagged during last call."
              />
              <div className="mt-3 flex justify-end">
                <Button size="sm" className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] h-9">Save notes</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#E5E5E5] shrink-0 bg-white">
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2 h-10"
              onClick={() => { onClose(); navigate('/sell/quotes/new'); }}
            >
              <FileText className="w-4 h-4" /> Create quote
            </Button>
            <Button variant="outline" className="flex-1 border-[#E5E5E5] gap-2 h-10">
              <MessageSquare className="w-4 h-4" /> Log activity
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}