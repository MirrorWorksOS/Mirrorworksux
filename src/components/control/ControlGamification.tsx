/**
 * ControlGamification — Gamification & Targets settings page.
 *
 * Configure achievement badges, team/group targets, and leaderboard settings.
 */

import React, { useState } from 'react';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Trophy,
  Zap,
  Target,
  Flame,
  Star,
  Gem,
  Shield,
  BarChart3,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────

interface TargetRow {
  id: string;
  target: string;
  metric: string;
  period: string;
  value: string;
  status: 'Active' | 'Draft';
  enabled: boolean;
}

const INITIAL_TARGETS: TargetRow[] = [
  { id: '1', target: 'Close deals', metric: 'Deals closed', period: 'Monthly', value: '5', status: 'Active', enabled: true },
  { id: '2', target: 'Revenue target', metric: 'Revenue ($)', period: 'Monthly', value: '$50,000', status: 'Active', enabled: true },
  { id: '3', target: 'QC checks', metric: 'Quality inspections', period: 'Weekly', value: '20', status: 'Active', enabled: true },
  { id: '4', target: 'On-time delivery', metric: '% on-time', period: 'Monthly', value: '95%', status: 'Active', enabled: true },
  { id: '5', target: 'Log activities', metric: 'CRM activities', period: 'Daily', value: '5', status: 'Draft', enabled: false },
];

interface BadgeConfig {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earnedBy: number;
}

const BADGES: BadgeConfig[] = [
  { id: 'b1', emoji: '\u{1F3C6}', name: 'Deal Closer', description: 'Close 10 deals in a month', earnedBy: 3 },
  { id: 'b2', emoji: '\u26A1', name: 'Speed Demon', description: 'Complete 5 jobs ahead of schedule', earnedBy: 1 },
  { id: 'b3', emoji: '\u{1F3AF}', name: 'Perfect Aim', description: 'Hit 100% quota for 3 consecutive months', earnedBy: 2 },
  { id: 'b4', emoji: '\u{1F525}', name: 'Hot Streak', description: 'Log activities 5 days in a row', earnedBy: 7 },
  { id: 'b5', emoji: '\u{1F31F}', name: 'Quality Star', description: 'Zero QC failures for 30 days', earnedBy: 4 },
  { id: 'b6', emoji: '\u{1F48E}', name: 'Revenue King', description: 'Top revenue earner of the quarter', earnedBy: 1 },
  { id: 'b7', emoji: '\u{1F6E1}\uFE0F', name: 'Reliability', description: '95%+ on-time delivery for 3 months', earnedBy: 5 },
  { id: 'b8', emoji: '\u{1F4CA}', name: 'Data Champion', description: 'Most detailed job documentation', earnedBy: 2 },
];

interface GroupConfig {
  id: string;
  name: string;
  targetCount: number;
  targets: string[];
}

const GROUPS: GroupConfig[] = [
  { id: 'g1', name: 'Sales Team', targetCount: 4, targets: ['Close deals', 'Revenue target', 'Log activities', 'Pipeline growth'] },
  { id: 'g2', name: 'Production Team', targetCount: 3, targets: ['QC checks', 'On-time delivery', 'Machine uptime'] },
];

const TIME_RANGES = ['Week', 'Month', 'Quarter', 'Year'];

const targetColumns = (toggleTarget: (id: string) => void): MwColumnDef<TargetRow>[] => [
  {
    key: 'target',
    header: 'Target',
    tooltip: 'Target name',
    cell: (t) => <span className="font-medium text-foreground">{t.target}</span>,
  },
  {
    key: 'metric',
    header: 'Metric',
    tooltip: 'Measured KPI',
    cell: (t) => <span className="text-[var(--neutral-600)]">{t.metric}</span>,
  },
  {
    key: 'period',
    header: 'Period',
    tooltip: 'Measurement frequency',
    cell: (t) => <span className="text-[var(--neutral-600)]">{t.period}</span>,
  },
  {
    key: 'value',
    header: 'Value',
    tooltip: 'Target threshold',
    cell: (t) => <span className="font-medium tabular-nums text-foreground">{t.value}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Active or draft',
    cell: (t) => (
      <StatusBadge status={t.status === 'Active' ? 'active' : 'draft'}>
        {t.status}
      </StatusBadge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    headerClassName: 'text-right',
    cell: (t) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => { e.stopPropagation(); toast(`Edit "${t.target}" — coming soon`); }}
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
        </Button>
        <Switch
          checked={t.enabled}
          onCheckedChange={() => toggleTarget(t.id)}
        />
      </div>
    ),
  },
];

const LEADERBOARD_METRICS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'deals', label: 'Deals closed' },
  { key: 'activities', label: 'Activities logged' },
  { key: 'ontime', label: 'On-time delivery %' },
  { key: 'quality', label: 'QC pass rate' },
];

// ── Component ────────────────────────────────────────────────────────────

export function ControlGamification() {
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [timeRange, setTimeRange] = useState('Month');
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
    revenue: true,
    deals: true,
    activities: true,
    ontime: true,
    quality: false,
  });
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleTarget = (id: string) => {
    setTargets(prev =>
      prev.map(t => (t.id === id ? { ...t, enabled: !t.enabled, status: !t.enabled ? 'Active' : 'Draft' } : t)),
    );
    toast('Target updated');
  };

  const toggleMetric = (key: string) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageShell>
      <PageHeader
        title="Gamification & Targets"
        subtitle="Configure achievement badges, targets, and leaderboard settings"
      />

      <div className="px-8 pb-8 space-y-8">
        {/* ── Section 1: Team Targets ─────────────────────────────────── */}
        <motion.section variants={staggerContainer} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">Team Targets</h2>
              <p className="text-sm text-[var(--neutral-500)]">Set measurable goals for your team to track and achieve</p>
            </div>
            <Button
              size="sm"
              className="bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90"
              onClick={() => toast('Add target form coming soon')}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Target
            </Button>
          </div>

          <ToolbarSummaryBar
            segments={[
              { key: 'active', label: 'Active', value: targets.filter(t => t.status === 'Active').length, color: 'var(--mw-yellow-400)' },
              { key: 'draft', label: 'Draft', value: targets.filter(t => t.status === 'Draft').length, color: 'var(--neutral-400)' },
            ]}
            formatValue={(v) => String(v)}
            className="mb-4"
          />

          <MwDataTable
            columns={targetColumns(toggleTarget)}
            data={targets}
            keyExtractor={(t) => t.id}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </motion.section>

        {/* ── Section 2: Achievement Badges ───────────────────────────── */}
        <motion.section variants={staggerContainer} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">Achievement Badges</h2>
              <p className="text-sm text-[var(--neutral-500)]">Reward milestones and outstanding performance</p>
            </div>
            <Button
              size="sm"
              className="bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90"
              onClick={() => toast('Create badge form coming soon')}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Badge
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BADGES.map(badge => (
              <motion.div key={badge.id} variants={staggerItem}>
                <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-lg)] bg-[var(--neutral-100)] text-xl shrink-0">
                      {badge.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{badge.name}</h3>
                      <p className="text-xs text-[var(--neutral-500)] mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--neutral-400)]">
                      Earned by {badge.earnedBy} user{badge.earnedBy !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toast(`Edit "${badge.name}" — coming soon`)}
                      >
                        <Pencil className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toast(`Delete "${badge.name}" — coming soon`)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 3: Leaderboard Settings ─────────────────────────── */}
        <motion.section variants={staggerContainer} initial="hidden" animate="show">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-foreground">Leaderboard Settings</h2>
            <p className="text-sm text-[var(--neutral-500)]">Control how leaderboards appear across the platform</p>
          </div>

          <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] p-6 space-y-5">
            {/* Toggle: Show leaderboard */}
            <motion.div variants={staggerItem} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Show leaderboard on dashboards</p>
                <p className="text-xs text-[var(--neutral-500)]">Display team rankings on module dashboards</p>
              </div>
              <Switch checked={showLeaderboard} onCheckedChange={setShowLeaderboard} />
            </motion.div>

            <div className="border-t border-[var(--border)]" />

            {/* Toggle: Show badges */}
            <motion.div variants={staggerItem} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Show achievement badges</p>
                <p className="text-xs text-[var(--neutral-500)]">Display earned badges on user profiles and leaderboard</p>
              </div>
              <Switch checked={showBadges} onCheckedChange={setShowBadges} />
            </motion.div>

            <div className="border-t border-[var(--border)]" />

            {/* Toggle: Anonymous mode */}
            <motion.div variants={staggerItem} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Anonymous mode</p>
                <p className="text-xs text-[var(--neutral-500)]">Hide names, show only initials</p>
              </div>
              <Switch checked={anonymousMode} onCheckedChange={setAnonymousMode} />
            </motion.div>

            <div className="border-t border-[var(--border)]" />

            {/* Default time range */}
            <motion.div variants={staggerItem} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Default time range</p>
                <p className="text-xs text-[var(--neutral-500)]">Time period shown by default on leaderboards</p>
              </div>
              <div className="flex items-center gap-1">
                {TIME_RANGES.map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--shape-lg)] transition-colors ${
                      timeRange === range
                        ? 'bg-[var(--mw-mirage)] text-white'
                        : 'bg-[var(--neutral-100)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="border-t border-[var(--border)]" />

            {/* Visible metrics */}
            <motion.div variants={staggerItem}>
              <p className="text-sm font-medium text-foreground mb-1">Visible metrics</p>
              <p className="text-xs text-[var(--neutral-500)] mb-3">Choose which metrics appear on the leaderboard</p>
              <div className="space-y-2.5">
                {LEADERBOARD_METRICS.map(m => (
                  <label key={m.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={visibleMetrics[m.key] ?? false}
                      onChange={() => toggleMetric(m.key)}
                      className="h-4 w-4 rounded border-[var(--border)] text-foreground accent-[var(--mw-mirage)]"
                    />
                    <span className="text-sm text-[var(--neutral-600)] group-hover:text-foreground transition-colors">
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          </Card>
        </motion.section>

        {/* ── Section 4: Group Targets ─────────────────────────────────── */}
        <motion.section variants={staggerContainer} initial="hidden" animate="show">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-foreground">Group Targets</h2>
            <p className="text-sm text-[var(--neutral-500)]">Configure specific targets per team or department</p>
          </div>

          <div className="space-y-3">
            {GROUPS.map(group => {
              const isExpanded = expandedGroup === group.id;
              return (
                <motion.div key={group.id} variants={staggerItem}>
                  <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--neutral-50)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--shape-lg)] bg-[var(--neutral-100)]">
                          <Target className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{group.name}</h3>
                          <p className="text-xs text-[var(--neutral-500)]">{group.targetCount} targets configured</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[var(--neutral-400)]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--neutral-400)]" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[var(--border)] px-5 py-4 bg-[var(--neutral-50)]">
                        <ul className="space-y-2">
                          {group.targets.map(t => (
                            <li key={t} className="flex items-center justify-between text-sm">
                              <span className="text-[var(--neutral-600)]">{t}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toast(`Edit "${t}" for ${group.name} — coming soon`)}
                              >
                                <Pencil className="w-3 h-3 mr-1" /> Edit
                              </Button>
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 border-[var(--border)]"
                          onClick={() => toast(`Add target to ${group.name} — coming soon`)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Add Target
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </PageShell>
  );
}
