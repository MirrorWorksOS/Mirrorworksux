/**
 * Budget Overview - Enhanced with status filters, donut charts, and table view
 * Matches BOOK 04 specification from Confluence
 */

import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, Layers, Wallet, CreditCard, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { AnimatedPlus, AnimatedFilter } from '../ui/animated-icons';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  getChartScaleColour,
} from '@/components/shared/charts/chart-theme';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { toast } from 'sonner';


type BudgetStatus = 'active' | 'draft' | 'closed';
type BudgetType = 'job' | 'department' | 'annual';
type BudgetHealthStatus = 'on_track' | 'monitor' | 'over_budget' | 'draft';

interface Budget {
  id: string;
  name: string;
  type: BudgetType;
  period: string;
  budgeted: number;
  actual: number;
  variance: number;
  utilisation: number;
  status: BudgetHealthStatus;
}

const monthlyData = [
  { month: 'Mar', budget: 74000, actual: 58000 },
  { month: 'Apr', budget: 74000, actual: 62000 },
  { month: 'May', budget: 74000, actual: 71000 },
  { month: 'Jun', budget: 74000, actual: 68000 },
  { month: 'Jul', budget: 74000, actual: 55000 },
  { month: 'Aug', budget: 74000, actual: 72000 },
  { month: 'Sep', budget: 74000, actual: 69000 },
  { month: 'Oct', budget: 74000, actual: 78000 },
  { month: 'Nov', budget: 74000, actual: 65000 },
  { month: 'Dec', budget: 74000, actual: 60000 },
  { month: 'Jan', budget: 74000, actual: 73000 },
  { month: 'Feb', budget: 74000, actual: 68400 },
];

// Donut chart data — categorical slices use shared chart scale (see BuyReports, chart-theme)
const typeData = [
  { name: 'Job', value: 65, color: MW_CHART_COLOURS[0] },
  { name: 'Department', value: 25, color: MW_CHART_COLOURS[1] },
  { name: 'Annual', value: 10, color: MW_CHART_COLOURS[2] },
];

const categoryData = [
  { name: 'Materials', value: 45, color: MW_CHART_COLOURS[0] },
  { name: 'Labour', value: 30, color: MW_CHART_COLOURS[1] },
  { name: 'Overhead', value: 15, color: MW_CHART_COLOURS[2] },
  { name: 'Subcontract', value: 10, color: MW_CHART_COLOURS[3] },
];

const utilisationData = [
  { name: 'On track', value: 60, color: MW_CHART_COLOURS[0] },
  { name: 'Monitor', value: 25, color: MW_CHART_COLOURS[1] },
  { name: 'Over budget', value: 15, color: MW_CHART_COLOURS[2] },
];

// Mock budget data
const mockBudgets: Budget[] = [
  {
    id: 'JOB-2026-0012',
    name: 'JOB-2026-0012',
    type: 'job',
    period: 'Q1 2026',
    budgeted: 18500,
    actual: 14230,
    variance: -4270,
    utilisation: 77,
    status: 'on_track'
  },
  {
    id: 'JOB-2026-0010',
    name: 'JOB-2026-0010',
    type: 'job',
    period: 'Q1 2026',
    budgeted: 45000,
    actual: 38200,
    variance: -6800,
    utilisation: 85,
    status: 'monitor'
  },
  {
    id: 'DEPT-FAB-2026',
    name: 'Fabrication Department',
    type: 'department',
    period: 'FY 2025-26',
    budgeted: 120000,
    actual: 89000,
    variance: -31000,
    utilisation: 74,
    status: 'on_track'
  },
  {
    id: 'JOB-2026-0008',
    name: 'JOB-2026-0008',
    type: 'job',
    period: 'Q4 2025',
    budgeted: 28000,
    actual: 22848,
    variance: -5152,
    utilisation: 82,
    status: 'monitor'
  },
  {
    id: 'JOB-2026-0009',
    name: 'JOB-2026-0009',
    type: 'job',
    period: 'Q1 2026',
    budgeted: 3200,
    actual: 3450,
    variance: 250,
    utilisation: 108,
    status: 'over_budget'
  },
  {
    id: 'DEPT-WELD-2026',
    name: 'Welding Department',
    type: 'department',
    period: 'FY 2025-26',
    budgeted: 95000,
    actual: 72000,
    variance: -23000,
    utilisation: 76,
    status: 'on_track'
  },
];

const getStatusBadgeColors = (status: BudgetHealthStatus) => {
  switch (status) {
    case 'on_track':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--neutral-500)', label: 'On track' };
    case 'monitor':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--neutral-500)', label: 'Monitor' };
    case 'over_budget':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--neutral-500)', label: 'Over budget' };
    case 'draft':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', dot: 'var(--neutral-500)', label: 'Draft' };
  }
};

const getTypeBadgeColors = (type: BudgetType) => {
  switch (type) {
    case 'job':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Job' };
    case 'department':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Department' };
    case 'annual':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Annual' };
  }
};

function SortableHead({
  label,
  active,
  direction,
  onSort,
}: {
  label: string;
  active: boolean;
  direction: 'asc' | 'desc';
  onSort: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 font-medium uppercase tracking-wider',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onSort}
    >
      {label}
      {active ? <span className="tabular-nums text-[10px]">{direction === 'asc' ? '↑' : '↓'}</span> : null}
    </button>
  );
}

export function BudgetOverview() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<BudgetStatus>('active');
  const [sortColumn, setSortColumn] = useState<keyof Budget | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate summary stats
  const activeBudgets = mockBudgets.filter(b => b.status !== 'draft');
  const atRiskBudgets = activeBudgets.filter(b => b.utilisation > 80);
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.actual, 0);
  const overBudgetBudgets = activeBudgets.filter(b => b.variance > 0);
  const projectedOverrun = overBudgetBudgets.reduce((sum, b) => sum + b.variance, 0);
  const utilisationPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleSort = useCallback((column: keyof Budget) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('asc');
      return column;
    });
  }, []);

  let sortedBudgets = [...mockBudgets];
  if (sortColumn) {
    sortedBudgets.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  // Compute summary totals by status
  const onTrackTotal = mockBudgets.filter(b => b.status === 'on_track').reduce((s, b) => s + b.budgeted, 0);
  const monitorTotal = mockBudgets.filter(b => b.status === 'monitor').reduce((s, b) => s + b.budgeted, 0);
  const overBudgetTotal = mockBudgets.filter(b => b.status === 'over_budget').reduce((s, b) => s + b.budgeted, 0);
  const draftBudgetTotal = mockBudgets.filter(b => b.status === 'draft').reduce((s, b) => s + b.budgeted, 0);

  const budgetColumns: MwColumnDef<Budget>[] = useMemo(
    () => [
      {
        key: 'name',
        header: (
          <SortableHead
            label="Budget name"
            active={sortColumn === 'name'}
            direction={sortDirection}
            onSort={() => handleSort('name')}
          />
        ),
        tooltip: 'Budget or job identifier',
        cell: (budget) => (
          <Link
            to={`/book/job-costs/${budget.id}`}
            className="text-sm font-medium text-[var(--neutral-900)] hover:underline"
          >
            {budget.name}
          </Link>
        ),
      },
      {
        key: 'type',
        header: (
          <SortableHead
            label="Type"
            active={sortColumn === 'type'}
            direction={sortDirection}
            onSort={() => handleSort('type')}
          />
        ),
        cell: (budget) => {
          const typeColors = getTypeBadgeColors(budget.type);
          return (
            <Badge className={cn('rounded border-0 px-2 py-0.5 text-xs', typeColors.bg, typeColors.text)}>
              {typeColors.label}
            </Badge>
          );
        },
      },
      {
        key: 'period',
        header: 'Period',
        cell: (budget) => <span className="text-[var(--neutral-600)] tabular-nums">{budget.period}</span>,
      },
      {
        key: 'budgeted',
        header: (
          <SortableHead
            label="Budgeted"
            active={sortColumn === 'budgeted'}
            direction={sortDirection}
            onSort={() => handleSort('budgeted')}
          />
        ),
        className: 'text-right',
        headerClassName: 'text-right',
        cell: (budget) => (
          <span className="tabular-nums text-sm font-medium">${budget.budgeted.toLocaleString()}</span>
        ),
      },
      {
        key: 'actual',
        header: (
          <SortableHead
            label="Actual"
            active={sortColumn === 'actual'}
            direction={sortDirection}
            onSort={() => handleSort('actual')}
          />
        ),
        className: 'text-right',
        headerClassName: 'text-right',
        cell: (budget) => (
          <span className="tabular-nums text-sm font-medium">${budget.actual.toLocaleString()}</span>
        ),
      },
      {
        key: 'variance',
        header: (
          <SortableHead
            label="Variance"
            active={sortColumn === 'variance'}
            direction={sortDirection}
            onSort={() => handleSort('variance')}
          />
        ),
        tooltip: 'Difference between budgeted and actual spend',
        className: 'text-right',
        headerClassName: 'text-right',
        cell: (budget) => (
          <span className="tabular-nums text-sm font-medium text-[var(--neutral-900)]">
            {budget.variance < 0 ? '-' : '+'}${Math.abs(budget.variance).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'utilisation',
        header: (
          <div className="text-center">
            <SortableHead
              label="Utilisation"
              active={sortColumn === 'utilisation'}
              direction={sortDirection}
              onSort={() => handleSort('utilisation')}
            />
          </div>
        ),
        className: 'text-center',
        headerClassName: 'text-center',
        cell: (budget) => (
          <div className="flex flex-col items-center gap-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--neutral-200)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(budget.utilisation, 100)}%`,
                  backgroundColor: getChartScaleColour(Math.min(100, budget.utilisation)),
                }}
              />
            </div>
            <span className="tabular-nums text-xs text-[var(--neutral-500)]">{budget.utilisation}%</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: <span className="text-center">Status</span>,
        className: 'text-center',
        headerClassName: 'text-center',
        cell: (budget) => {
          const statusColors = getStatusBadgeColors(budget.status);
          return (
            <div className="flex justify-center">
              <Badge
                className={cn(
                  'flex items-center gap-1.5 rounded-full border-0 px-2 py-0.5 text-xs',
                  statusColors.bg,
                  statusColors.text
                )}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColors.dot }}
                />
                {statusColors.label}
              </Badge>
            </div>
          );
        },
      },
    ],
    [sortColumn, sortDirection, handleSort],
  );

  return (
    <PageShell className="mx-auto max-w-[1200px] overflow-y-auto">
      <PageHeader
        title="Budgets"
        subtitle={`Showing ${statusFilter} budgets`}
        actions={
          <>
            <Button variant="outline" size="sm" className="group h-10 gap-2 border-[var(--border)]">
              <AnimatedFilter className="h-4 w-4" />
              Type: All
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button className="group h-10 rounded bg-[var(--mw-yellow-400)] px-5 text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-600)]">
              <AnimatedPlus className="mr-2 h-4 w-4" />
              New Budget
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(['active', 'draft', 'closed'] as BudgetStatus[]).map(status => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'rounded-[var(--shape-lg)] px-4 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)]',
              statusFilter === status
                ? 'bg-[var(--mw-yellow-400)] text-[#2C2C2C]'
                : 'border border-[var(--neutral-200)] bg-white text-[var(--neutral-500)] hover:border-[var(--mw-yellow-400)]',
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Active budgets"
            value={activeBudgets.length}
            icon={Layers}
            iconSurface="key"
            footer={
              atRiskBudgets.length > 0 ? (
                <p className="mt-2 text-xs font-medium text-[var(--neutral-600)]">
                  {`${atRiskBudgets.length} at risk (>80% utilised)`}
                </p>
              ) : null
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Total budgeted"
            value={`$${totalBudgeted.toLocaleString()}`}
            icon={Wallet}
            hint="Current quarter"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Total spent"
            value={`$${totalSpent.toLocaleString()}`}
            icon={CreditCard}
            footer={
              <div className="mt-3">
                <ProgressBar value={utilisationPct} />
                <p className="mt-1 text-xs text-[var(--neutral-500)]">{utilisationPct.toFixed(0)}% utilised</p>
              </div>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Projected overrun"
            value={`$${projectedOverrun.toLocaleString()}`}
            icon={AlertTriangle}
            hint={`${overBudgetBudgets.length} flagged jobs`}
          />
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
        <Card variant="flat" className="border border-[var(--neutral-200)] p-6 shadow-xs">
          <h3 className="mb-4 text-base font-medium text-[var(--mw-mirage)]">Budget breakdown</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-3 text-xs font-medium tracking-wider text-[var(--neutral-500)]">BY TYPE</h4>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {typeData.map((entry, i) => (
                        <Cell key={`type-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 w-full space-y-1">
                  {typeData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[var(--neutral-600)]">{d.name}</span>
                      </div>
                      <span className="tabular-nums">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-medium tracking-wider text-[var(--neutral-500)]">BY CATEGORY</h4>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={`cat-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 w-full space-y-1">
                  {categoryData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[var(--neutral-600)]">{d.name}</span>
                      </div>
                      <span className="tabular-nums">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-medium tracking-wider text-[var(--neutral-500)]">UTILISATION</h4>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={utilisationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {utilisationData.map((entry, i) => (
                        <Cell key={`util-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 w-full space-y-1">
                  {utilisationData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[var(--neutral-600)]">{d.name}</span>
                      </div>
                      <span className="tabular-nums">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ChartCard title="Monthly budget vs actual">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="month" tick={MW_AXIS_TICK} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={MW_AXIS_TICK} />
              <Tooltip contentStyle={MW_TOOLTIP_STYLE} cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar
                dataKey="budget"
                fill="none"
                stroke="var(--neutral-200)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={16}
                {...MW_RECHARTS_ANIMATION_BAR}
              />
              <Bar dataKey="actual" radius={[4, 4, 0, 0]} barSize={16} {...MW_RECHARTS_ANIMATION_BAR}>
                {monthlyData.map((e, i) => (
                  <Cell
                    key={`budget-${i}`}
                    fill={getChartScaleColour(
                      e.budget > 0 ? Math.min(100, (e.actual / e.budget) * 100) : 0,
                    )}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <ToolbarSummaryBar
        segments={[
          { key: 'on_track', label: 'On Track', value: onTrackTotal, color: 'var(--mw-yellow-400)' },
          { key: 'monitor', label: 'Monitor', value: monitorTotal, color: 'var(--mw-mirage)' },
          { key: 'over_budget', label: 'Over Budget', value: overBudgetTotal, color: 'var(--neutral-400)' },
          { key: 'draft', label: 'Draft', value: draftBudgetTotal, color: 'var(--neutral-200)' },
        ]}
      />

      <motion.div variants={staggerItem}>
        <MwDataTable
          columns={budgetColumns}
          data={sortedBudgets}
          keyExtractor={(row) => row.id}
          striped
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          onRowClick={(budget) => {
            if (budget.type === 'job') {
              navigate(`/book/job-costs/${budget.id}`);
            }
          }}
        />
      </motion.div>
    </PageShell>
  );
}
