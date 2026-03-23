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
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';


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
    case 'active': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-900)]', label: 'Active' };
    case 'prospect': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-900)]', label: 'Prospect' };
    case 'inactive': return { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Inactive' };
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
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                <th className="px-4 py-3 w-12">
                  <input type="checkbox" className="rounded border-[var(--border)]" />
                </th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">COMPANY NAME</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">CONTACT</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">EMAIL</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">PHONE</th>
                <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">REVENUE</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">OPPORTUNITIES</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer, idx) => {
                const statusBadge = getStatusBadge(customer.status);
                return (
                  <tr key={customer.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--mw-yellow-50)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[var(--neutral-100)]")}>
                    <td className="px-4">
                      <input type="checkbox" checked={selectedRows.has(customer.id)} onChange={() => toggleRow(customer.id)} className="rounded border-[var(--border)]" />
                    </td>
                    <td className="px-4">
                      <a href={`/sell/customers/${customer.id}`} className="text-[var(--neutral-900)] text-sm font-medium hover:underline flex items-center gap-2">
                        {customer.company}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-4 text-sm text-[var(--neutral-900)]">{customer.contact}</td>
                    <td className="px-4">
                      <a href={`mailto:${customer.email}`} className="text-sm text-[var(--neutral-900)] hover:underline flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </a>
                    </td>
                    <td className="px-4">
                      <a href={`tel:${customer.phone}`} className="text-sm text-[var(--neutral-900)] hover:underline flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </a>
                    </td>
                    <td className="px-4 text-right text-sm  font-medium">${customer.totalRevenue.toLocaleString()}</td>
                    <td className="px-4 text-center text-sm  font-medium">{customer.activeOpportunities}</td>
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--neutral-500)]">Showing 1-5 of 5</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--neutral-100)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]" disabled>Next</button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
