/**
 * Sell CRM List - DataTable view with pagination
 * Matches table pattern from BookInvoices
 */

import React, { useState } from 'react';
import { Phone, Mail, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

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
}

const mockCustomers: Customer[] = [
  { id: '1', company: 'TechCorp Industries', contact: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+61 2 9876 5432', totalRevenue: 245000, activeOpportunities: 3, status: 'active' },
  { id: '2', company: 'Pacific Fabrication', contact: 'Mike Thompson', email: 'mike@pacificfab.com.au', phone: '+61 3 8765 4321', totalRevenue: 189000, activeOpportunities: 2, status: 'active' },
  { id: '3', company: 'Hunter Steel Co', contact: 'Emma Wilson', email: 'emma@huntersteel.com.au', phone: '+61 2 4567 8901', totalRevenue: 156000, activeOpportunities: 1, status: 'active' },
  { id: '4', company: 'BHP Contractors', contact: 'David Lee', email: 'david@bhpcontractors.com', phone: '+61 8 2345 6789', totalRevenue: 98000, activeOpportunities: 4, status: 'active' },
  { id: '5', company: 'Sydney Rail Corp', contact: 'Jessica Brown', email: 'jbrown@sydneyrail.gov.au', phone: '+61 2 8765 4321', totalRevenue: 67000, activeOpportunities: 1, status: 'prospect' },
];

const getStatusBadge = (status: Customer['status']) => {
  switch (status) {
    case 'active': return { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', label: 'Active' };
    case 'prospect': return { bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', label: 'Prospect' };
    case 'inactive': return { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Inactive' };
  }
};

export function SellCRMList() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger}>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                <th className="px-4 py-3 w-12">
                  <input type="checkbox" className="rounded border-[#E5E5E5]" />
                </th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">COMPANY NAME</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">CONTACT</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">EMAIL</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PHONE</th>
                <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">REVENUE</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">OPPORTUNITIES</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer, idx) => {
                const statusBadge = getStatusBadge(customer.status);
                return (
                  <tr key={customer.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                    <td className="px-4">
                      <input type="checkbox" checked={selectedRows.has(customer.id)} onChange={() => toggleRow(customer.id)} className="rounded border-[#E5E5E5]" />
                    </td>
                    <td className="px-4">
                      <a href={`/sell/customers/${customer.id}`} className="text-[#0052CC] text-sm font-medium hover:underline flex items-center gap-2">
                        {customer.company}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 text-sm text-[#0A0A0A]">{customer.contact}</td>
                    <td className="px-4">
                      <a href={`mailto:${customer.email}`} className="text-sm text-[#0052CC] hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email}
                      </a>
                    </td>
                    <td className="px-4">
                      <a href={`tel:${customer.phone}`} className="text-sm text-[#0052CC] hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </a>
                    </td>
                    <td className="px-4 text-right text-sm font-['Roboto_Mono',monospace] font-medium">${customer.totalRevenue.toLocaleString()}</td>
                    <td className="px-4 text-center text-sm font-['Roboto_Mono',monospace] font-medium">{customer.activeOpportunities}</td>
                    <td className="px-4">
                      <div className="flex items-center justify-center">
                        <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", statusBadge.bg, statusBadge.text)}>{statusBadge.label}</Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#737373]">Showing 1-5 of 5</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-[#E5E5E5] rounded hover:bg-[#F5F5F5] disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-[#E5E5E5] rounded hover:bg-[#F5F5F5] disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
