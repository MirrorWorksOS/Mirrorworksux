/**
 * QuoteHeuristicPanel — AI analysis tab for quote detail.
 * Win probability, price competitiveness, margin suggestions, risk flags, customer insights.
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Shield, DollarSign, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { AgentLogomark } from '@/components/shared/agent/AgentLogomark';
import { quoteHeuristics } from '@/services/mock';
import type { QuoteHeuristics } from '@/types/entities';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';

interface QuoteHeuristicPanelProps {
  quoteId: string;
}

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ── Confidence Ring ─────────────────────────────────────────────────

function ConfidenceRing({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? 'var(--mw-green)' : value >= 50 ? 'var(--mw-yellow-500)' : 'var(--mw-error)';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--neutral-200)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-foreground">{value}%</span>
        <span className="text-[10px] text-[var(--neutral-500)]">Win probability</span>
      </div>
    </div>
  );
}

// ── Price Competitiveness Bar ────────────────────────────────────────

function CompetitivenessBar({ data }: { data: QuoteHeuristics['priceCompetitiveness'] }) {
  const [low, high] = data.historicalWinRange;
  const range = high - low;
  const position = range > 0 ? ((data.thisQuote - low) / range) * 100 : 50;
  const verdictColor = { competitive: 'var(--mw-green)', high: 'var(--mw-error)', low: 'var(--mw-yellow-500)' };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--neutral-500)]">{fmtCurrency(low)}</span>
        <Badge
          className="border-0 text-[10px] px-1.5 py-0"
          style={{ backgroundColor: `${verdictColor[data.verdict]}20`, color: verdictColor[data.verdict] }}
        >
          {data.verdict}
        </Badge>
        <span className="text-[var(--neutral-500)]">{fmtCurrency(high)}</span>
      </div>
      <div className="relative h-2 bg-[var(--neutral-100)] rounded-full overflow-visible">
        <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-[var(--mw-green)] via-[var(--mw-yellow-400)] to-[var(--mw-error)] rounded-full opacity-20" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-500"
          style={{ left: `${Math.min(100, Math.max(0, position))}%`, backgroundColor: verdictColor[data.verdict] }}
        />
      </div>
      <p className="text-xs text-[var(--neutral-500)] text-center">
        This quote: {fmtCurrency(data.thisQuote)} vs historical win range
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────

export function QuoteHeuristicPanel({ quoteId }: QuoteHeuristicPanelProps) {
  const heuristics = useMemo(() => quoteHeuristics[quoteId], [quoteId]);

  if (!heuristics) {
    return (
      <Card className="p-6 text-center">
        <AgentLogomark size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm text-[var(--neutral-500)]">No analysis available for this quote yet.</p>
      </Card>
    );
  }

  const impactIcons = { positive: TrendingUp, negative: TrendingDown, neutral: Minus };
  const impactColors = { positive: 'text-[var(--mw-green)]', negative: 'text-[var(--mw-error)]', neutral: 'text-[var(--neutral-400)]' };
  const severityColors = { high: 'var(--mw-error)', medium: 'var(--mw-yellow-500)', low: 'var(--mw-blue)' };
  const severityBg = { high: 'var(--mw-error)', medium: 'var(--mw-yellow-500)', low: 'var(--mw-blue)' };

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <AgentLogomark size={20} />
        <h3 className="text-sm font-medium text-foreground">AI-Powered Quote Analysis</h3>
        <Badge className="bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-600)] border-0 text-[10px] px-1.5 py-0">AI</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Probability */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Win Probability</h4>
            <div className="flex items-start gap-6">
              <ConfidenceRing value={heuristics.winProbability} />
              <div className="flex-1 space-y-2">
                {heuristics.factors.map((f, i) => {
                  const Icon = impactIcons[f.impact];
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', impactColors[f.impact])} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{f.label}</p>
                        <p className="text-[10px] text-[var(--neutral-500)]">{f.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Price Competitiveness */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Price Competitiveness</h4>
            <CompetitivenessBar data={heuristics.priceCompetitiveness} />
          </Card>
        </motion.div>

        {/* Margin Optimization */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Margin Optimization</h4>
            {heuristics.marginSuggestions.length === 0 ? (
              <p className="text-xs text-[var(--neutral-500)]">All margins look optimal.</p>
            ) : (
              <div className="space-y-3">
                {heuristics.marginSuggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--neutral-50)]">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--mw-yellow-500)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Line {s.lineItemIndex + 1}: {s.currentMargin}% → {s.suggestedMargin}%
                      </p>
                      <p className="text-[10px] text-[var(--neutral-500)]">{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Risk Flags */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Risk Flags</h4>
            {heuristics.riskFlags.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-[var(--mw-green)]">
                <Shield className="w-3.5 h-3.5" /> No risks identified
              </div>
            ) : (
              <div className="space-y-3">
                {heuristics.riskFlags.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: `${severityBg[r.severity]}08` }}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: severityColors[r.severity] }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-foreground">{r.title}</p>
                        <Badge className="border-0 text-[9px] px-1 py-0" style={{ backgroundColor: `${severityColors[r.severity]}20`, color: severityColors[r.severity] }}>
                          {r.severity}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[var(--neutral-500)]">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Customer Insights */}
      <motion.div variants={staggerItem}>
        <Card className="p-6 space-y-4">
          <h4 className="text-sm font-medium text-foreground">Customer Insights</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { icon: DollarSign, label: 'Avg Order', value: fmtCurrency(heuristics.customerInsights.avgOrderValue) },
              { icon: Users, label: 'Lifetime Value', value: fmtCurrency(heuristics.customerInsights.totalLifetimeValue) },
              { icon: Clock, label: 'Avg Days to Accept', value: `${heuristics.customerInsights.avgDaysToAccept}d` },
              { icon: CheckCircle, label: 'Accepted', value: String(heuristics.customerInsights.quotesAccepted) },
              { icon: XCircle, label: 'Declined', value: String(heuristics.customerInsights.quotesDeclined) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon className="w-4 h-4 mx-auto text-[var(--neutral-400)] mb-1" />
                <p className="text-sm font-medium tabular-nums text-foreground">{value}</p>
                <p className="text-[10px] text-[var(--neutral-500)]">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
