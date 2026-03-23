/**
 * Sell CRM - Customer card view
 * Responsive grid with search, filters, and view toggle
 */

import React, { useState } from 'react';
import { Search, Filter, Grid3x3, List, Plus, Phone, Mail, DollarSign, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedSearch, AnimatedFilter, AnimatedPlus } from '../ui/animated-icons';

const { animationVariants } = designSystem;

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

const getStatusBadge = (status: Customer['status']) => {
  switch (status) {
    case 'active':
      return { bg: 'bg-[#F5F5F5]', text: 'text-[#0A0A0A]', label: 'Active' };
    case 'prospect':
      return { bg: 'bg-[#F5F5F5]', text: 'text-[#0A0A0A]', label: 'Prospect' };
    case 'inactive':
      return { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Inactive' };
  }
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
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-8 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Customers</h1>
          <p className="text-sm text-[#737373] mt-1">{filteredCustomers.length} total customers</p>
        </div>
        <div className="flex gap-3">
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#0A0A0A] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <Input
            placeholder="Search customers..."
            className="pl-10 h-10 border-[var(--border)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter */}
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
          <AnimatedFilter className="w-4 h-4" />
          Filter
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "p-2 rounded transition-all duration-200",
              viewMode === 'card'
                ? "bg-[#FFCF4B] text-[#2C2C2C]"
                : "text-[#737373] hover:bg-[#F5F5F5]"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded transition-all duration-200",
              viewMode === 'list'
                ? "bg-[#FFCF4B] text-[#2C2C2C]"
                : "text-[#737373] hover:bg-[#F5F5F5]"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, idx) => {
            const statusBadge = getStatusBadge(customer.status);
            return (
              <motion.div
                key={customer.id}
                variants={animationVariants.listItem}
                custom={idx}
              >
                <Card className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/sell/crm/${customer.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[#1A2732] text-white text-sm font-medium">
                          {customer.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-[14px] font-semibold text-[#0A0A0A] group-hover:text-[#FFCF4B] transition-colors">
                          {customer.company}
                        </h3>
                        <p className="text-[12px] text-[#737373]">
                          {customer.contact}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", statusBadge.bg, statusBadge.text)}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#737373]">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#737373]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#737373]" />
                        <span className="text-xs text-[#737373]">Total Revenue</span>
                      </div>
                      <p className=" text-[14px] font-semibold text-[#0A0A0A]">
                        ${customer.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#737373]" />
                        <span className="text-xs text-[#737373]">Opportunities</span>
                      </div>
                      <p className=" text-[14px] font-semibold text-[#0A0A0A]">
                        {customer.activeOpportunities}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View (placeholder for now - would implement SellCRMList) */}
      {viewMode === 'list' && (
        <Card className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <p className="text-sm text-[#737373] text-center">
            List view - Would render SellCRMList component here
          </p>
        </Card>
      )}

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card className="bg-white border border-[var(--border)] rounded-2xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-[#737373]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-2">
              No customers found
            </h3>
            <p className="text-sm text-[#737373] mb-4">
              Try adjusting your search or create a new customer to get started
            </p>
            <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#0A0A0A]">
              <Plus className="w-4 h-4 mr-2" />
              Create Customer
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
}