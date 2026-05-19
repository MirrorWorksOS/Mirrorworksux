/**
 * Sell Opportunities — pipeline with kanban / list / card views.
 *
 * Uses the schema-driven `ModuleFilterBar` (replaces the old generic
 * `ToolbarFilterButton`). Facets: stage, owner, priority, value range,
 * customer, tags. Persistent expected-close date chip. Seeded system
 * presets: "Closing this month", "At risk", "High-value urgent".
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Calendar,
  Columns3,
  DollarSign,
  Flag,
  Grid3x3,
  List as ListIcon,
  Plus,
  Tag,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

import { InlineEmpty } from '@/components/shared/feedback/EmptyState';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { staggerItem } from '@/components/shared/motion/motion-variants';

import {
  ModuleFilterBar,
  applyFilters,
  getViewer,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

import { opportunities as centralOpportunities, customers as centralCustomers, employees as centralEmployees } from '@/services';
import type { Opportunity } from './sell-opportunity-types';

const KANBAN_ITEM_TYPE = 'sell-opportunity';

type OpportunityStage = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

const mockOpportunities: Opportunity[] = centralOpportunities.map((o) => ({
  id: o.id,
  title: o.title,
  customer: o.customerName,
  value: o.value,
  expectedClose: o.expectedClose,
  assignedTo: o.assignedToInitials,
  ownerId: o.assignedTo,
  priority: o.priority,
  stage: o.stage,
  probabilityPercent: o.probabilityPercent,
  tags: o.tags,
}));

const stages: { key: OpportunityStage; label: string; summaryColor: string }[] = [
  { key: 'new', label: 'New', summaryColor: 'var(--neutral-300)' },
  { key: 'qualified', label: 'Qualified', summaryColor: 'var(--neutral-500)' },
  { key: 'proposal', label: 'Proposal', summaryColor: 'var(--mw-yellow-400)' },
  { key: 'negotiation', label: 'Negotiation', summaryColor: 'var(--mw-yellow-600)' },
  { key: 'won', label: 'Won', summaryColor: 'var(--mw-mirage)' },
  { key: 'lost', label: 'Lost', summaryColor: 'var(--neutral-200)' },
];

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'urgent': return { bg: 'bg-[var(--mw-mirage)]', text: 'text-white', label: 'Urgent' };
    case 'high': return { bg: 'bg-[var(--badge-soft-accent-bg)]', text: 'text-[var(--badge-soft-accent-text)]', label: 'High' };
    case 'medium': return { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Medium' };
    case 'low': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Low' };
  }
};

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

const MODULE_ID = 'sell.opportunities';

const ownerOptions = centralEmployees.map((e) => ({ value: e.id, label: e.name }));
const customerOptions = centralCustomers.map((c) => ({ value: c.company, label: c.company }));
const tagOptions = Array.from(
  new Set(centralOpportunities.flatMap((o) => o.tags ?? [])),
).map((t) => ({ value: t, label: t }));

const opportunitiesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Opportunities',
  facets: [
    {
      id: 'stage',
      label: 'Stage',
      kind: 'multi',
      icon: Target,
      pinned: true,
      options: stages.map((s) => ({ value: s.key, label: s.label, color: s.summaryColor })),
    },
    {
      id: 'priority',
      label: 'Priority',
      kind: 'multi',
      icon: Flag,
      pinned: true,
      options: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
    {
      id: 'owner',
      label: 'Owner',
      kind: 'select',
      icon: User,
      options: ownerOptions,
    },
    {
      id: 'customer',
      label: 'Customer',
      kind: 'select',
      icon: User,
      options: customerOptions,
    },
    {
      id: 'tags',
      label: 'Tags',
      kind: 'tag',
      icon: Tag,
      options: tagOptions,
    },
    {
      id: 'value',
      label: 'Value',
      kind: 'range',
      icon: DollarSign,
    },
    {
      id: 'atRisk',
      label: 'At risk',
      kind: 'boolean',
      icon: AlertTriangle,
    },
    {
      id: 'expectedClose',
      label: 'Closing',
      kind: 'date',
      icon: Calendar,
      placeholder: 'Any date',
    },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: Columns3, groupBy: 'stage' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'card', label: 'Card grid', icon: Grid3x3 },
  ],
  defaultView: 'kanban',
  dateFacetId: 'expectedClose',
};

// Seed system presets once at module load (idempotent).
registerSystemPresets(MODULE_ID, [
  {
    name: 'My pipeline',
    icon: User,
    iconTone: 'yellow',
    state: {
      values: { owner: '__me__', stage: ['new', 'qualified', 'proposal', 'negotiation'] },
      search: '',
      view: 'kanban',
    },
  },
  {
    name: 'Closing this month',
    icon: Target,
    iconTone: 'yellow',
    state: {
      values: {
        expectedClose: thisMonthRange(),
        stage: ['new', 'qualified', 'proposal', 'negotiation'],
      },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'At risk',
    icon: AlertTriangle,
    iconTone: 'warning',
    state: {
      values: {
        atRisk: true,
        stage: ['proposal', 'negotiation'],
      },
      search: '',
      view: 'kanban',
    },
  },
  {
    name: 'High-value urgent',
    icon: Zap,
    iconTone: 'error',
    state: {
      values: {
        priority: ['urgent'],
        value: { from: 100000 },
      },
      search: '',
      view: 'list',
    },
  },
]);

function thisMonthRange(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from: start, to: end };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SellOpportunities() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>(mockOpportunities);
  const filters = useModuleFilters(opportunitiesFilterSchema);
  const { state } = filters;

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: opportunitiesFilterSchema,
        state,
        rows: opportunities,
        resolveMe: getViewer().userId,
        getSearchText: (o) => `${o.title} ${o.customer}`,
        getFacetValue: (o, id) => {
          switch (id) {
            case 'stage': return o.stage;
            case 'priority': return o.priority;
            case 'owner': return o.ownerId;
            case 'customer': return o.customer;
            case 'tags': return o.tags;
            case 'value': return o.value;
            case 'expectedClose': return o.expectedClose;
            case 'atRisk':
              // "At risk" = stage in proposal/negotiation AND (probability < 40 OR close date in the past).
              return (
                (o.stage === 'proposal' || o.stage === 'negotiation') &&
                ((o.probabilityPercent ?? 100) < 40 ||
                  new Date(o.expectedClose).getTime() < Date.now())
              );
            default: return undefined;
          }
        },
      }),
    [opportunities, state],
  );

  const getOpportunitiesByStage = (stage: OpportunityStage) =>
    filtered.filter((opp) => opp.stage === stage);

  const handleStageChange = (id: string, stage: OpportunityStage) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
  };

  const handleKanbanDrop = (item: KanbanDragItem, columnId: string) => {
    handleStageChange(item.id, columnId as OpportunityStage);
  };

  const pipelineValue = filtered.reduce((sum, o) => sum + o.value, 0);

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Opportunities"
        subtitle={`${filtered.length} of ${opportunities.length} • $${pipelineValue.toLocaleString()} pipeline value`}
      />

      <ToolbarSummaryBar
        segments={stages.filter((s) => s.key !== 'lost').map((s) => ({
          key: s.key,
          label: s.label,
          value: getOpportunitiesByStage(s.key).reduce((sum, o) => sum + o.value, 0),
          color: s.summaryColor,
        }))}
      />

      <ModuleFilterBar
        schema={opportunitiesFilterSchema}
        filters={filters}
        searchPlaceholder="Search opportunities…"
        actions={
          <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/opportunities/new')}>
            New Opportunity
          </ToolbarPrimaryButton>
        }
      />

      {/* Kanban */}
      {state.view === 'kanban' && (
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
                    <button
                      type="button"
                      className="p-1 hover:bg-[var(--border)] rounded transition-colors"
                      aria-label="Add opportunity"
                      onClick={() => navigate(`/sell/opportunities/new?stage=${stage.key}`)}
                    >
                      <Plus className="w-4 h-4 text-[var(--neutral-500)]" />
                    </button>
                  </div>

                  {stageOpps.map((opp) => (
                    <KanbanCard key={opp.id} id={opp.id} type={KANBAN_ITEM_TYPE} className="p-0">
                      <OpportunityCardBody opp={opp} onClick={() => navigate(`/sell/opportunities/${opp.id}`)} />
                    </KanbanCard>
                  ))}

                  {stageOpps.length === 0 && <InlineEmpty message="No opportunities" />}
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
        </motion.div>
      )}

      {/* Card grid */}
      {state.view === 'card' && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opp) => (
            <motion.div key={opp.id} variants={staggerItem} className="h-full min-h-0">
              <SpotlightCard radius="rounded-lg" className="h-full min-h-0">
                <Card
                  variant="interactive"
                  className="group h-full border-[var(--border)] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                  onClick={() => navigate(`/sell/opportunities/${opp.id}`)}
                >
                  <OpportunityCardBody opp={opp} />
                </Card>
              </SpotlightCard>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <Card variant="flat" className="col-span-full p-6 text-center text-sm text-[var(--neutral-500)]">
              No opportunities match the current filters.
            </Card>
          )}
        </div>
      )}

      {/* List */}
      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable<Opportunity>
            columns={listColumns}
            data={filtered}
            keyExtractor={(o) => o.id}
            onRowClick={(o) => navigate(`/sell/opportunities/${o.id}`)}
            striped
          />
        </motion.div>
      )}
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function OpportunityCardBody({ opp, onClick }: { opp: Opportunity; onClick?: () => void }) {
  const priorityBadge = getPriorityBadge(opp.priority);
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      className="p-4 cursor-pointer group"
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">{opp.title}</h4>
        <Badge className={cn('rounded-full text-xs px-2.5 py-0.5 border-0 flex-shrink-0 ml-2', priorityBadge.bg, priorityBadge.text)}>
          {priorityBadge.label}
        </Badge>
      </div>
      <p className="text-xs text-[var(--neutral-500)] mb-4">{opp.customer}</p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-xs text-foreground">
          <DollarSign className="w-4 h-4 text-foreground" />
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
        <span className="text-xs tabular-nums text-[var(--neutral-500)]">{opp.probabilityPercent}%</span>
      </div>
    </div>
  );
}

const listColumns: MwColumnDef<Opportunity>[] = [
  { key: 'title', header: 'Title', cell: (o) => <span className="font-medium text-foreground">{o.title}</span> },
  { key: 'customer', header: 'Customer', cell: (o) => o.customer },
  {
    key: 'stage',
    header: 'Stage',
    cell: (o) => {
      const stage = stages.find((s) => s.key === o.stage);
      return (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: stage?.summaryColor ?? 'var(--neutral-300)' }}
            aria-hidden
          />
          {stage?.label ?? o.stage}
        </span>
      );
    },
  },
  {
    key: 'value',
    header: 'Value',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums font-medium',
    cell: (o) => `$${o.value.toLocaleString()}`,
  },
  {
    key: 'prob',
    header: 'Prob.',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums',
    cell: (o) => `${o.probabilityPercent}%`,
  },
  {
    key: 'priority',
    header: 'Priority',
    cell: (o) => {
      const p = getPriorityBadge(o.priority);
      return <Badge className={cn('rounded-full text-xs px-2.5 py-0.5 border-0', p.bg, p.text)}>{p.label}</Badge>;
    },
  },
  { key: 'owner', header: 'Owner', cell: (o) => o.assignedTo },
  {
    key: 'close',
    header: 'Expected close',
    className: 'tabular-nums text-[var(--neutral-600)]',
    cell: (o) => new Date(o.expectedClose).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
  },
];
