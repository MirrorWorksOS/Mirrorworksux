/**
 * Sell CRM - Customer card view
 * Responsive grid with search, filters, and view toggle
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Grid3x3, List, Plus, Phone, Mail, DollarSign, Briefcase } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { useNavigate } from 'react-router';
import { Card } from '../ui/card';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { customers } from '@/services';
import type { Customer } from '@/types/entities';

const mockCustomers = customers;

const renderStatusBadge = (status: Customer['status']) => {
  if (status === 'prospect') return <StatusBadge variant="info">Prospect</StatusBadge>;
  return <StatusBadge status={status} />;
};

export function SellCRM() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${filteredCustomers.length} total customers`}
      />

      <PageToolbar>
        <ToolbarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search customers…" />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <IconViewToggle
          value={viewMode}
          onChange={(k) => setViewMode(k as 'card' | 'list')}
          options={[
            { key: 'card', icon: Grid3x3, label: 'Card view' },
            { key: 'list', icon: List, label: 'List view' },
          ]}
        />
        <ToolbarPrimaryButton icon={Plus} onClick={() => toast('New customer form coming soon')}>
          New Customer
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* Customer Cards Grid */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer, idx) => (
            <motion.div
              key={customer.id}
              variants={staggerItem}
              custom={idx}
              className="h-full min-h-0"
            >
              <SpotlightCard
                radius="rounded-[var(--shape-lg)]"
                className="h-full min-h-0"
              >
                <Card
                  variant="flat"
                  className="group h-full cursor-pointer border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
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
                      <h3 className="text-sm font-medium text-foreground transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
                        {customer.company}
                      </h3>
                      <p className="text-xs text-[var(--neutral-500)]">
                        {customer.contact}
                      </p>
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

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <p className="text-sm text-[var(--neutral-500)] text-center">
            List view - Would render SellCRMList component here
          </p>
        </Card>
      )}

      {filteredCustomers.length === 0 && (
        <Card variant="flat" className="p-0">
          <EmptyState
            icon={Briefcase}
            title="No customers found"
            description="Try adjusting your search or create a new customer to get started"
            action={{ label: "Create Customer", onClick: () => toast('New customer form coming soon'), icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
