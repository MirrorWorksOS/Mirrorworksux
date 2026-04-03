/**
 * Buy Suppliers - Supplier management with Card/List toggle
 * Shows company, contact, category, active POs, on-time %, total spend
 */

import React, { useMemo, useState } from 'react';
import { Grid3x3, List, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedPlus, AnimatedFilter, AnimatedSearch } from '../ui/animated-icons';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  categories: string[];
  activePOs: number;
  onTimeRate: number;
  totalSpend: number;
}

import { suppliers as centralSuppliers, purchaseOrders } from '@/services/mock';

const SPEND_LOOKUP = [156000, 89000, 45000, 128000, 22000];
const mockSuppliers: Supplier[] = centralSuppliers.map((s, i) => ({
  id: s.id,
  company: s.company,
  contact: s.contact,
  email: s.email,
  phone: s.phone,
  categories: [s.category],
  activePOs: purchaseOrders.filter((po) => po.supplierId === s.id && po.status !== 'received' && po.status !== 'cancelled').length,
  onTimeRate: s.onTimePercent,
  totalSpend: SPEND_LOOKUP[i] ?? 0,
}));

const getPerformanceBadge = (onTimeRate: number) => {
  if (onTimeRate >= 95) return { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Excellent' };
  if (onTimeRate >= 85) return { bg: 'bg-[var(--mw-amber-50)]', text: 'text-[var(--mw-yellow-900)]', label: 'Good' };
  if (onTimeRate >= 75) return { bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', label: 'Fair' };
  return { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Poor' };
};

export function BuySuppliers() {
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const countActive = mockSuppliers.filter(s => s.activePOs > 0).length;
  const countInactive = mockSuppliers.filter(s => s.activePOs === 0).length;

  const listColumns: MwColumnDef<Supplier>[] = useMemo(
    () => [
      {
        key: 'supplier',
        header: 'Supplier',
        tooltip: 'Supplier company name',
        cell: (row) => (
          <a href={`/buy/suppliers/${row.id}`} className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
            {row.company}
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          </a>
        ),
      },
      {
        key: 'contact',
        header: 'Contact',
        tooltip: 'Primary contact person',
        cell: (row) => <span className="text-sm text-[var(--neutral-600)]">{row.contact}</span>,
      },
      {
        key: 'categories',
        header: 'Categories',
        tooltip: 'Supply categories',
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.categories.map((cat) => (
              <StatusBadge key={cat} variant="neutral">{cat}</StatusBadge>
            ))}
          </div>
        ),
      },
      {
        key: 'pos',
        header: 'Active POs',
        tooltip: 'Number of active purchase orders',
        className: 'text-center',
        headerClassName: 'text-center',
        cell: (row) => <span className="text-sm font-medium tabular-nums">{row.activePOs}</span>,
      },
      {
        key: 'ontime',
        header: 'On-time %',
        tooltip: 'On-time delivery rate',
        className: 'text-center',
        headerClassName: 'text-center',
        cell: (row) => <span className="text-sm font-medium tabular-nums text-foreground">{row.onTimeRate}%</span>,
      },
      {
        key: 'spend',
        header: 'Total spend',
        tooltip: 'Lifetime spend with supplier',
        className: 'text-right',
        headerClassName: 'text-right',
        cell: (row) => <span className="text-sm font-medium tabular-nums">${row.totalSpend.toLocaleString()}</span>,
      },
      {
        key: 'performance',
        header: 'Performance',
        tooltip: 'Delivery performance rating',
        className: 'text-center',
        headerClassName: 'text-center',
        cell: (row) => {
          const perf = getPerformanceBadge(row.onTimeRate);
          return (
            <StatusBadge variant={row.onTimeRate >= 95 ? 'success' : row.onTimeRate >= 85 ? 'neutral' : row.onTimeRate >= 75 ? 'warning' : 'error'}>
              {perf.label}
            </StatusBadge>
          );
        },
      },
    ],
    [],
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-md flex-1">
        <AnimatedSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-500)]" />
        <Input
          placeholder="Search suppliers..."
          className="h-10 border-[var(--border)] pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]">
        <AnimatedFilter className="h-4 w-4" />
        Filter
      </Button>
      <div className="flex items-center rounded-lg border border-[var(--border)] p-1">
        <button
          type="button"
          onClick={() => setViewMode('card')}
          className={cn(
            'rounded p-2 transition-all duration-200',
            viewMode === 'card' ? 'bg-[var(--mw-yellow-400)] text-primary-foreground' : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]',
          )}
        >
          <Grid3x3 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={cn(
            'rounded p-2 transition-all duration-200',
            viewMode === 'list' ? 'bg-[var(--mw-yellow-400)] text-primary-foreground' : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]',
          )}
        >
          <List className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );

  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
        <PageHeader
          title="Suppliers"
          subtitle={`${filteredSuppliers.length} total suppliers`}
          actions={
            <Button className="group h-12 min-h-[48px] bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-600)]">
              <AnimatedPlus className="mr-2 h-4 w-4" />
              New Supplier
            </Button>
          }
        />

        {toolbar}

        {viewMode === 'card' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier, idx) => {
              const perfBadge = getPerformanceBadge(supplier.onTimeRate);
              return (
                <motion.div key={supplier.id} variants={staggerItem} custom={idx}>
                  <Card className="group cursor-pointer rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-6 transition-all duration-200 hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[var(--mw-mirage)] text-sm font-medium text-white">
                            {supplier.company.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-sm font-medium text-foreground transition-colors group-hover:underline">
                            {supplier.company}
                          </h3>
                          <p className="text-xs text-[var(--neutral-500)]">{supplier.contact}</p>
                        </div>
                      </div>
                      <Badge className={cn('rounded-full border-0 px-2 py-0.5 text-xs', perfBadge.bg, perfBadge.text)}>
                        {perfBadge.label}
                      </Badge>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                        <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                        <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-1">
                      {supplier.categories.map((cat) => (
                        <Badge key={cat} className="border-0 bg-[var(--neutral-100)] text-xs text-[var(--neutral-600)]">
                          {cat}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-4">
                      <div>
                        <p className="mb-1 text-xs text-[var(--neutral-500)]">Active POs</p>
                        <p className="text-sm font-medium tabular-nums text-foreground">{supplier.activePOs}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-[var(--neutral-500)]">On-Time</p>
                        <p className="text-sm font-medium tabular-nums text-foreground">{supplier.onTimeRate}%</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-[var(--neutral-500)]">Total Spend</p>
                        <p className="text-xs font-medium tabular-nums text-foreground">
                          ${(supplier.totalSpend / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            <ToolbarSummaryBar
              segments={[
                { key: 'active', label: 'Active', value: countActive, color: 'var(--mw-yellow-400)' },
                { key: 'inactive', label: 'Inactive', value: countInactive, color: 'var(--neutral-400)' },
              ]}
              formatValue={(v) => String(v)}
            />
            <MwDataTable<Supplier>
              columns={listColumns}
              data={filteredSuppliers}
              keyExtractor={(row) => row.id}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
            />
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
