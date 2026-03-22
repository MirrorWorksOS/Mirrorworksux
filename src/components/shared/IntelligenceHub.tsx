/**
 * Intelligence Hub — shared AI insights component
 * Used across Sell, Plan, Make modules
 * Props: module context, entity context, insights array
 */
import React, { useState } from 'react';
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Info, ChevronRight, Brain } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';

export type InsightType = 'opportunity' | 'risk' | 'info' | 'action' | 'trend';
export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  confidence?: number;
  action?: string;
  updatedAt: string;
}

interface Props {
  module: 'sell' | 'plan' | 'make' | 'buy' | 'book';
  context?: string;
  insights: Insight[];
  onRefresh?: () => void;
  compact?: boolean;
}

const TYPE_CONFIG: Record<InsightType, { icon: any; bg: string; text: string; label: string }> = {
  opportunity: { icon: TrendingUp,    bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', label: 'Opportunity' },
  risk:        { icon: AlertTriangle, bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Risk' },
  info:        { icon: Info,          bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', label: 'Info' },
  action:      { icon: ChevronRight,  bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]', label: 'Action' },
  trend:       { icon: TrendingUp,    bg: 'bg-[#FFFBF0]', text: 'text-[#2C2C2C]', label: 'Trend' },
};

export function IntelligenceHub({ module, context, insights, onRefresh, compact = false }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFCF4B] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#1A2732]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#0A0A0A]">AI insights</h3>
            {context && <p className="text-xs text-[#737373]">{context}</p>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 gap-1 text-xs text-[#737373] hover:text-[#0A0A0A]"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {/* Insights */}
      <div className={cn('space-y-3', compact && 'space-y-2')}>
        {insights.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-lg p-6 text-center">
            <Brain className="w-8 h-8 text-[#A3A3A3] mx-auto mb-2" />
            <p className="text-sm text-[#737373]">No insights available.</p>
            <p className="text-xs text-[#A3A3A3] mt-0.5">AI will surface patterns as more data is collected.</p>
          </div>
        ) : (
          insights.map((insight, i) => {
            const cfg  = TYPE_CONFIG[insight.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
              >
                <Card className={cn('border rounded-lg p-4', insight.type === 'risk' ? 'border-[#FEE2E2] bg-[#FFF5F5]' : 'border-[#E5E5E5] bg-white hover:shadow-sm transition-shadow')}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('w-3.5 h-3.5', cfg.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#0A0A0A]">{insight.title}</span>
                        {insight.confidence !== undefined && (
                          <span className="text-[10px] text-[#737373] bg-[#F5F5F5] px-1.5 py-0.5 rounded-full">
                            {insight.confidence}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#737373] leading-relaxed">{insight.body}</p>
                      {insight.action && (
                        <button className="text-xs text-[#0A7AFF] hover:underline mt-1.5 font-medium">
                          {insight.action} →
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#A3A3A3] mt-2 text-right">Updated {insight.updatedAt}</p>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Pre-built insight sets for each module ─────────────────
export const SELL_INSIGHTS: Insight[] = [
  {
    id: 's1', type: 'opportunity',
    title: 'High-value opportunity stalled',
    body: 'BHP Contractors ($128k) has been in Negotiation for 14 days without activity. Industry avg close time is 8 days at this stage. Schedule a call to re-engage.',
    confidence: 82, action: 'Log a call activity', updatedAt: '2h ago',
  },
  {
    id: 's2', type: 'trend',
    title: 'Q1 pipeline 34% above Q4',
    body: 'Current pipeline value is $284,500 — up 34% vs same period last quarter. Win rate is tracking at 58%, which exceeds the 45% annual target.',
    confidence: 95, updatedAt: '1d ago',
  },
  {
    id: 's3', type: 'risk',
    title: '3 quotes expire this week',
    body: 'Quotes MW-Q-0041, MW-Q-0042, and MW-Q-0043 expire before Friday. Total value at risk: $67,500. Recommend following up with customers today.',
    action: 'View expiring quotes', updatedAt: '5h ago',
  },
  {
    id: 's4', type: 'info',
    title: 'Seasonal demand pattern detected',
    body: 'Historical data shows a 22% increase in structural steel orders during April–May (pre-winter build season). Consider increasing capacity buffer now.',
    updatedAt: '3d ago',
  },
];

export const PLAN_INSIGHTS: Insight[] = [
  {
    id: 'p1', type: 'risk',
    title: 'Welding bottleneck next week',
    body: 'Current scheduling has Welding at 112% utilisation from Mar 25–28. Three MOs are at risk of delay. Recommend shifting MW-088 to next week or authorising overtime.',
    confidence: 88, action: 'Reschedule affected MOs', updatedAt: '1h ago',
  },
  {
    id: 'p2', type: 'opportunity',
    title: 'Material cost optimisation',
    body: '10mm MS Plate current price is $185/sheet. Based on 12-month data, prices typically drop 8% in April. Delaying a non-urgent $42,000 steel purchase by 3 weeks could save $3,360.',
    confidence: 71, updatedAt: '6h ago',
  },
  {
    id: 'p3', type: 'action',
    title: '2 jobs missing lead times',
    body: 'MW-090 and MW-091 have no scheduled start dates. They are due Apr 5 and Apr 8. Recommend scheduling these now to avoid late delivery.',
    action: 'Open job scheduler', updatedAt: '3h ago',
  },
];

export const MAKE_INSIGHTS: Insight[] = [
  {
    id: 'm1', type: 'risk',
    title: 'CNC Mill offline impacts 2 MOs',
    body: 'CNC Mill #1 is in maintenance and not expected back until Mar 22. MO-0050 and MO-0055 assigned to Machining are at risk. Consider subcontracting or rescheduling.',
    confidence: 92, action: 'Review affected MOs', updatedAt: '30m ago',
  },
  {
    id: 'm2', type: 'opportunity',
    title: 'Weld quality improving',
    body: 'NCR rate for Welding has dropped from 4.2% to 1.8% over the past 4 weeks since the new jig fixtures were installed. First-pass yield is now above target.',
    confidence: 89, updatedAt: '2d ago',
  },
  {
    id: 'm3', type: 'trend',
    title: 'Overtime trending up',
    body: 'Overtime hours in the last 4 weeks (avg 18hr/wk) are 35% above the prior period. Main driver is Welding station. Review staffing or consider an additional welder.',
    updatedAt: '1d ago',
  },
];
