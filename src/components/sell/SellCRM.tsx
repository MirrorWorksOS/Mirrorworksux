/**
 * Sell CRM - Customer card view
 * Responsive grid with search, filters, and view toggle
 */

import React, { useState } from 'react';
import { Search, Filter, Grid3x3, List, Plus, Phone, Mail, DollarSign, Briefcase } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { AnimatedSearch, AnimatedFilter, AnimatedPlus } from '../ui/animated-icons';


interface Customer {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  totalRevenue: number;
  activeOpportunities: number;
  status: 'active' | 'prospect' | 'inactive';
  avatar?: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    company: 'TechCorp Industries',
    contact: 'Sarah Chen',
    email: 'sarah@techcorp.com',
    phone: '+61 2 9876 5432',
    totalRevenue: 245000,
    activeOpportunities: 3,
    status: 'active'
  },
  {
    id: '2',
    company: 'Pacific Fabrication',
    contact: 'Mike Thompson',
    email: 'mike@pacificfab.com.au',
    phone: '+61 3 8765 4321',
    totalRevenue: 189000,
    activeOpportunities: 2,
    status: 'active'
  },
  {
    id: '3',
    company: 'Hunter Steel Co',
    contact: 'Emma Wilson',
    email: 'emma@huntersteel.com.au',
    phone: '+61 2 4567 8901',
    totalRevenue: 156000,
    activeOpportunities: 1,
    status: 'active'
  },
  {
    id: '4',
    company: 'BHP Contractors',
    contact: 'David Lee',
    email: 'david@bhpcontractors.com',
    phone: '+61 8 2345 6789',
    totalRevenue: 98000,
    activeOpportunities: 4,
    status: 'active'
  },
  {
    id: '5',
    company: 'Sydney Rail Corp',
    contact: 'Jessica Brown',
    email: 'jbrown@sydneyrail.gov.au',
    phone: '+61 2 8765 4321',
    totalRevenue: 67000,
    activeOpportunities: 1,
    status: 'prospect'
  },
  {
    id: '6',
    company: 'Kemppi Australia',
    contact: 'Tom Anderson',
    email: 'tom@kemppi.com.au',
    phone: '+61 3 5678 9012',
    totalRevenue: 52000,
    activeOpportunities: 0,
    status: 'active'
  },
];

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
    <PageShell>
      <PageHeader
        title="Customers"
        subtitle={`${filteredCustomers.length} total customers`}
        actions={
          <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--neutral-900)] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-500)]" />
          <Input
            placeholder="Search customers..."
            className="pl-10 h-10 border-[var(--border)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
          <AnimatedFilter className="w-4 h-4" />
          Filter
        </Button>

        <div className="flex items-center border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "p-2 rounded transition-all duration-200",
              viewMode === 'card'
                ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded transition-all duration-200",
              viewMode === 'list'
                ? "bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, idx) => (
            <motion.div
              key={customer.id}
              variants={staggerItem}
              custom={idx}
            >
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
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
                      <h3 className="text-sm font-medium text-[var(--neutral-900)] group-hover:text-[var(--mw-yellow-400)] transition-colors">
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
                    <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                      ${customer.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase className="w-4 h-4 text-[var(--neutral-500)]" />
                      <span className="text-xs text-[var(--neutral-500)]">Opportunities</span>
                    </div>
                    <p className="text-sm font-medium tabular-nums text-[var(--neutral-900)]">
                      {customer.activeOpportunities}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
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
            action={{ label: "Create Customer", onClick: () => {}, icon: Plus }}
          />
        </Card>
      )}
    </PageShell>
  );
}
