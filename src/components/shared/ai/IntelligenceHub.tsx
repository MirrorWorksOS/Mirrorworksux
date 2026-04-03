/**
 * Intelligence Hub — shared AI insights component
 * Used across Sell, Plan, Make modules
 * Props: module context, entity context, insights array
 */
import React, { useState } from 'react';
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Info, ChevronRight, Brain } from 'lucide-react';
import { IconWell } from "@/components/shared/icons/IconWell";
import { EmptyState } from '../feedback/EmptyState';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../ui/utils';
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
  opportunity: { icon: TrendingUp,    bg: 'bg-[var(--mw-mirage)]/10', text: 'text-foreground', label: 'Opportunity' },
  risk:        { icon: AlertTriangle, bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Risk' },
  info:        { icon: Info,          bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-info)]', label: 'Info' },
  action:      { icon: ChevronRight,  bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-warning)]', label: 'Action' },
  trend:       { icon: TrendingUp,    bg: 'bg-[var(--mw-yellow-50)]', text: 'text-[var(--neutral-800)]', label: 'Trend' },
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
          <IconWell icon={Sparkles} surface="key" shape="squircle" size="sm" />
          <div>
            <h3 className="text-sm font-medium text-foreground">AI insights</h3>
            {context && <p className="text-xs text-[var(--neutral-500)]">{context}</p>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 gap-1 text-xs text-[var(--neutral-500)] hover:text-foreground"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {/* Insights */}
      <div className={cn('space-y-3', compact && 'space-y-2')}>
        {insights.length === 0 ? (
          <div className="bg-[var(--neutral-50)] rounded-[var(--shape-lg)] p-6">
            <EmptyState
              variant="compact"
              icon={Brain}
              title="No insights available"
              description="AI will surface patterns as more data is collected."
            />
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
                <Card className={cn('border rounded-[var(--shape-lg)] p-4', insight.type === 'risk' ? 'border-[var(--mw-error-100)] bg-[var(--mw-error-50)]' : 'border-[var(--border)] bg-card hover:shadow-sm transition-shadow')}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('w-4 h-4', cfg.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{insight.title}</span>
                        {insight.confidence !== undefined && (
                          <span className="text-[10px] text-[var(--neutral-500)] bg-[var(--neutral-100)] px-1.5 py-0.5 rounded-full">
                            {insight.confidence}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--neutral-500)] leading-relaxed">{insight.body}</p>
                      {insight.action && (
                        <button className="text-xs text-[var(--mw-blue)] hover:underline mt-1.5 font-medium">
                          {insight.action} →
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--neutral-400)] mt-2 text-right">Updated {insight.updatedAt}</p>
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
