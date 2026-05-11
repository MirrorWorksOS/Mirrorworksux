/**
 * Sell CRM — customer card / list grid.
 *
 * Wired to `ModuleFilterBar` with CRM-specific facets:
 *   • Status — real lifecycle: active / prospect / inactive
 *   • State (AU region)
 *   • Revenue band
 *   • Has open opportunities (boolean)
 *
 * Replaces the generic `ToolbarFilterButton` that previously offered the
 * nonsensical "Active / Draft / Completed" pills on customer rows.
 */

import { useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Flame,
  Gem,
  Grid3x3,
  List as ListIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
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

import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';

import { customers, employees as centralEmployees } from '@/services';
import type { Customer } from '@/types/entities';

const MODULE_ID = 'sell.crm';

const stateOptions = Array.from(new Set(customers.map((c) => c.state).filter(Boolean))).map((s) => ({
  value: s,
  label: s,
}));
const accountManagerOptions = centralEmployees.map((e) => ({ value: e.id, label: e.name }));

const customersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Customers',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'active', label: 'Active', color: 'var(--mw-yellow-400)' },
        { value: 'prospect', label: 'Prospect', color: 'var(--mw-mirage)' },
        { value: 'inactive', label: 'Inactive', color: 'var(--neutral-400)' },
      ],
    },
    {
      id: 'state',
      label: 'State',
      kind: 'multi',
      icon: MapPin,
      options: stateOptions,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      kind: 'range',
      icon: DollarSign,
    },
    {
      id: 'hasOpenOpportunities',
      label: 'Open opportunities',
      kind: 'boolean',
      icon: TrendingUp,
    },
    {
      id: 'accountManager',
      label: 'Account manager',
      kind: 'user',
      icon: UserIcon,
      pinned: true,
      options: accountManagerOptions,
    },
  ],
  viewModes: [
    { id: 'card', label: 'Card view', icon: Grid3x3 },
    { id: 'list', label: 'List view', icon: ListIcon },
  ],
  defaultView: 'card',
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'My accounts',
    icon: UserIcon,
    iconTone: 'yellow',
    state: { values: { accountManager: '__me__' }, search: '', view: 'card' },
  },
  {
    name: 'Active accounts',
    icon: CheckCircle2,
    iconTone: 'success',
    state: { values: { status: ['active'] }, search: '', view: 'card' },
  },
  {
    name: 'Hot prospects',
    icon: Flame,
    iconTone: 'error',
    state: { values: { status: ['prospect'], hasOpenOpportunities: true }, search: '', view: 'card' },
  },
  {
    name: 'Top revenue tier ($250k+)',
    icon: Gem,
    iconTone: 'info',
    state: { values: { revenue: { from: 250000 } }, search: '', view: 'list' },
  },
]);

const renderStatusBadge = (status: Customer['status']) => {
  if (status === 'prospect') return <StatusBadge variant="info">Prospect</StatusBadge>;
  return <StatusBadge status={status} />;
};

const listColumns: MwColumnDef<Customer>[] = [
  {
    key: 'company',
    header: 'Company',
    cell: (c) => <span className="font-medium text-foreground">{c.company}</span>,
  },
  { key: 'contact', header: 'Contact', cell: (c) => c.contact },
  { key: 'state', header: 'State', cell: (c) => c.state },
  {
    key: 'revenue',
    header: 'Total revenue',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums font-medium',
    cell: (c) => `$${c.totalRevenue.toLocaleString()}`,
  },
  {
    key: 'opps',
    header: 'Open opps',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums',
    cell: (c) => c.activeOpportunities,
  },
  {
    key: 'status',
    header: 'Status',
    headerClassName: 'text-center',
    className: 'text-center',
    cell: (c) => <div className="flex items-center justify-center">{renderStatusBadge(c.status)}</div>,
  },
];

export function SellCRM() {
  const navigate = useNavigate();
  const filters = useModuleFilters(customersFilterSchema);
  const { state } = filters;

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: customersFilterSchema,
        state,
        rows: customers,
        resolveMe: getViewer().userId,
        getSearchText: (c) => `${c.company} ${c.contact} ${c.email}`,
        getFacetValue: (c, id) => {
          switch (id) {
            case 'status': return c.status;
            case 'state': return c.state;
            case 'revenue': return c.totalRevenue;
            case 'hasOpenOpportunities': return c.activeOpportunities > 0;
            case 'accountManager': return c.accountManagerId ?? '';
            default: return undefined;
          }
        },
      }),
    [state],
  );

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${filtered.length} of ${customers.length} customers`}
      />

      <ModuleFilterBar
        schema={customersFilterSchema}
        filters={filters}
        searchPlaceholder="Search customers…"
        actions={
          <ToolbarPrimaryButton icon={Plus} onClick={() => navigate('/sell/crm/new')}>
            New Customer
          </ToolbarPrimaryButton>
        }
      />

      {state.view === 'card' && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((customer, idx) => (
            <motion.div key={customer.id} variants={staggerItem} custom={idx} className="h-full min-h-0">
              <SpotlightCard radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
                <Card
                  variant="interactive"
                  className="group h-full border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                  onClick={() => navigate(`/sell/crm/${customer.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[var(--mw-mirage)] text-white text-sm font-medium">
                          {customer.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{customer.company}</h3>
                        <p className="text-xs text-[var(--neutral-500)]">{customer.contact}</p>
                      </div>
                    </div>
                    {renderStatusBadge(customer.status)}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="w-4 h-4 text-[var(--neutral-500)]" />
                        <span className="text-xs text-[var(--neutral-500)]">Total Revenue</span>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-foreground">
                        ${customer.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="w-4 h-4 text-[var(--neutral-500)]" />
                        <span className="text-xs text-[var(--neutral-500)]">Opportunities</span>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-foreground">
                        {customer.activeOpportunities}
                      </p>
                    </div>
                  </div>
                </Card>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      )}

      {state.view === 'list' && (
        <motion.div variants={staggerItem}>
          <MwDataTable<Customer>
            columns={listColumns}
            data={filtered}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => navigate(`/sell/crm/${c.id}`)}
            striped
          />
        </motion.div>
      )}

      {filtered.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Sparkles}
            title="No customers match"
            description="Try clearing a filter or saving a different preset."
            action={{ label: 'Create Customer', onClick: () => navigate('/sell/crm/new'), icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
