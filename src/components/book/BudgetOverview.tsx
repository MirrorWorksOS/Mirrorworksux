/**
 * Budget Overview - Enhanced with status filters, donut charts, and table view
 * Matches BOOK 04 specification from Confluence
 */

import React, { useState } from 'react';
import { ChevronDown, Plus, Filter, Download, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { AnimatedPlus, AnimatedFilter, AnimatedDownload } from '../ui/animated-icons';


type BudgetStatus = 'active' | 'draft' | 'closed';
type BudgetType = 'job' | 'department' | 'annual';
type TrafficLightStatus = 'on_track' | 'monitor' | 'over_budget' | 'draft';

interface Budget {
  id: string;
  name: string;
  type: BudgetType;
  period: string;
  budgeted: number;
  actual: number;
  variance: number;
  utilisation: number;
  status: TrafficLightStatus;
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

const getActualColor = (actual: number, budget: number) => {
  const pct = actual / budget;
  if (pct > 0.95) return 'var(--mw-error)';
  if (pct > 0.80) return 'var(--mw-warning)';
  return 'var(--mw-success)';
};

// Donut chart data
const typeData = [
  { name: 'Job', value: 65, color: 'var(--mw-info)' },
  { name: 'Department', value: 25, color: 'var(--mw-success)' },
  { name: 'Annual', value: 10, color: 'var(--mw-warning)' },
];

const categoryData = [
  { name: 'Materials', value: 45, color: 'var(--mw-info)' },
  { name: 'Labour', value: 30, color: 'var(--mw-success)' },
  { name: 'Overhead', value: 15, color: 'var(--mw-warning)' },
  { name: 'Subcontract', value: 10, color: '#7C3AED' },
];

const utilisationData = [
  { name: 'On track', value: 60, color: 'var(--mw-success)' },
  { name: 'Monitor', value: 25, color: 'var(--mw-warning)' },
  { name: 'Over budget', value: 15, color: 'var(--mw-error)' },
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

const getStatusBadgeColors = (status: TrafficLightStatus) => {
  switch (status) {
    case 'on_track':
      return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--mw-mirage)', label: 'On track' };
    case 'monitor':
      return { bg: 'bg-[var(--mw-amber-50)]', text: 'text-[var(--mw-yellow-900)]', dot: 'var(--mw-warning)', label: 'Monitor' };
    case 'over_budget':
      return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', dot: 'var(--mw-error)', label: 'Over budget' };
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
      return { bg: 'bg-[var(--mw-amber-50)]', text: 'text-[var(--mw-yellow-900)]', label: 'Annual' };
  }
};

export function BudgetOverview() {
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

  const handleSort = (column: keyof Budget) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Budgets</h1>
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 mt-3">
            {(['active', 'draft', 'closed'] as BudgetStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-[var(--shape-lg)] text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)]",
                  statusFilter === status
                    ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                    : "bg-white border border-[var(--border)] text-[var(--neutral-500)] hover:border-[var(--mw-yellow-400)]"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
            <AnimatedFilter className="w-4 h-4" />
            Type: All
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* KPI Cards - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Budgets */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
            <div className="text-xs tracking-wider text-[var(--neutral-500)] mb-2 font-medium">ACTIVE BUDGETS</div>
            <div className="text-2xl tracking-tight text-[var(--mw-mirage)]  font-medium">
              {activeBudgets.length}
            </div>
            <p className="text-xs text-[var(--mw-error)] mt-1 font-medium">
              {atRiskBudgets.length} at risk (&gt;80% utilised)
            </p>
          </Card>
        </motion.div>

        {/* Total Budgeted */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
            <div className="text-xs tracking-wider text-[var(--neutral-500)] mb-2 font-medium">TOTAL BUDGETED</div>
            <div className="text-2xl tracking-tight text-[var(--mw-mirage)]  font-medium">
              ${totalBudgeted.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-1">Current quarter</p>
          </Card>
        </motion.div>

        {/* Total Spent */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
            <div className="text-xs tracking-wider text-[var(--neutral-500)] mb-2 font-medium">TOTAL SPENT</div>
            <div className="text-2xl tracking-tight text-[var(--mw-mirage)]  font-medium">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="mt-3 h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--mw-yellow-400)] rounded-full transition-all duration-300"
                style={{ width: `${((totalSpent / totalBudgeted) * 100).toFixed(0)}%` }}
              />
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-1">
              {((totalSpent / totalBudgeted) * 100).toFixed(0)}% utilised
            </p>
          </Card>
        </motion.div>

        {/* Projected Overrun */}
        <motion.div variants={staggerItem}>
          <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
            <div className="text-xs tracking-wider text-[var(--neutral-500)] mb-2 font-medium">PROJECTED OVERRUN</div>
            <div className="text-2xl tracking-tight text-[var(--mw-error)]  font-medium">
              ${projectedOverrun.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-1">
              {overBudgetBudgets.length} flagged jobs
            </p>
          </Card>
        </motion.div>
      </div>

      {/* 3 Donut Charts Row */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white rounded-[var(--shape-lg)] border border-[var(--border)] p-6">
          <h3 className="font-semibold text-base font-semibold text-[var(--mw-mirage)] mb-4">
            Budget Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Type */}
            <div>
              <h4 className="text-xs text-[var(--neutral-500)] mb-3 font-medium tracking-wider">BY TYPE</h4>
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
                <div className="space-y-1 mt-2 w-full">
                  {typeData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[var(--neutral-600)]">{d.name}</span>
                      </div>
                      <span className="">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By Category */}
            <div>
              <h4 className="text-xs text-[var(--neutral-500)] mb-3 font-medium tracking-wider">BY CATEGORY</h4>
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
                <div className="space-y-1 mt-2 w-full">
                  {categoryData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[var(--neutral-600)]">{d.name}</span>
                      </div>
                      <span className="">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Utilisation */}
            <div>
              <h4 className="text-xs text-[var(--neutral-500)] mb-3 font-medium tracking-wider">UTILISATION</h4>
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
                <div className="space-y-1 mt-2 w-full">
                  {utilisationData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[var(--neutral-600)]">{d.name}</span>
                      </div>
                      <span className="">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Monthly Budget vs Actual Chart */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] p-6">
          <h3 className="text-[var(--mw-mirage)] mb-4 font-medium">Monthly Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--neutral-500)' }}
              />
              <YAxis
                tickFormatter={v => `$${v / 1000}k`}
                tick={{ fontSize: 11, fill: 'var(--neutral-500)' }}
              />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar
                dataKey="budget"
                fill="none"
                stroke="var(--border)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
              <Bar dataKey="actual" radius={[4, 4, 0, 0]} barSize={16}>
                {monthlyData.map((e, i) => (
                  <Cell key={`budget-${i}`} fill={getActualColor(e.actual, e.budget)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Budget List Table */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                  <th
                    className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium cursor-pointer hover:text-[var(--mw-mirage)]"
                    onClick={() => handleSort('name')}
                  >
                    BUDGET NAME
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium cursor-pointer hover:text-[var(--mw-mirage)]"
                    onClick={() => handleSort('type')}
                  >
                    TYPE
                  </th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    PERIOD
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium cursor-pointer hover:text-[var(--mw-mirage)]"
                    onClick={() => handleSort('budgeted')}
                  >
                    BUDGETED
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium cursor-pointer hover:text-[var(--mw-mirage)]"
                    onClick={() => handleSort('actual')}
                  >
                    ACTUAL
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium cursor-pointer hover:text-[var(--mw-mirage)]"
                    onClick={() => handleSort('variance')}
                  >
                    VARIANCE
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium cursor-pointer hover:text-[var(--mw-mirage)]"
                    onClick={() => handleSort('utilisation')}
                  >
                    UTILISATION
                  </th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedBudgets.map((budget, idx) => {
                  const statusColors = getStatusBadgeColors(budget.status);
                  const typeColors = getTypeBadgeColors(budget.type);
                  
                  return (
                    <tr
                      key={budget.id}
                      className={cn(
                        "border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors",
                        idx % 2 === 1 && "bg-[var(--neutral-100)]"
                      )}
                      onClick={() => {
                        // Navigate to detail view
                        if (budget.type === 'job') {
                          window.location.href = `/book/job-costs/${budget.id}`;
                        }
                      }}
                    >
                      <td className="px-4">
                        <a
                          href={`/book/job-costs/${budget.id}`}
                          className="text-[var(--mw-mirage)]  text-sm hover:underline"
                        >
                          {budget.name}
                        </a>
                      </td>
                      <td className="px-4">
                        <Badge className={cn("rounded text-xs px-2 py-0.5 border-0", typeColors.bg, typeColors.text)}>
                          {typeColors.label}
                        </Badge>
                      </td>
                      <td className="px-4 text-sm text-[var(--neutral-600)]">{budget.period}</td>
                      <td className="px-4 text-right text-sm  font-medium">
                        ${budget.budgeted.toLocaleString()}
                      </td>
                      <td className="px-4 text-right text-sm  font-medium">
                        ${budget.actual.toLocaleString()}
                      </td>
                      <td
                        className="px-4 text-right text-sm  font-medium"
                        style={{ color: budget.variance < 0 ? 'var(--mw-success)' : 'var(--mw-error)' }}
                      >
                        {budget.variance < 0 ? '-' : '+'}${Math.abs(budget.variance).toLocaleString()}
                      </td>
                      <td className="px-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full h-1.5 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(budget.utilisation, 100)}%`,
                                backgroundColor:
                                  budget.utilisation > 95 ? 'var(--mw-error)' :
                                  budget.utilisation > 80 ? 'var(--mw-warning)' : 'var(--mw-success)'
                              }}
                            />
                          </div>
                          <span className="text-xs text-[var(--neutral-500)] ">
                            {budget.utilisation}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <Badge
                            className={cn(
                              "rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5",
                              statusColors.bg,
                              statusColors.text
                            )}
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: statusColors.dot }}
                            />
                            {statusColors.label}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}