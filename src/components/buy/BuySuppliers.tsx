/**
 * Buy Suppliers - Supplier management with Card/List toggle
 * Shows company, contact, category, active POs, on-time %, total spend
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, Grid3x3, List, Mail, Phone, ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus, AnimatedFilter, AnimatedSearch } from '../ui/animated-icons';

const { animationVariants } = designSystem;

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

const mockSuppliers: Supplier[] = [
  { id: '1', company: 'Hunter Steel Co', contact: 'Emma Wilson', email: 'emma@huntersteel.com.au', phone: '+61 2 4567 8901', categories: ['Raw Materials', 'Metals'], activePOs: 3, onTimeRate: 98, totalSpend: 156000 },
  { id: '2', company: 'Pacific Metals', contact: 'Mike Anderson', email: 'mike@pacificmetals.com.au', phone: '+61 3 8765 4321', categories: ['Raw Materials'], activePOs: 2, onTimeRate: 95, totalSpend: 89000 },
  { id: '3', company: 'Sydney Welding Supply', contact: 'Sarah Chen', email: 'sarah@sydneywelding.com', phone: '+61 2 9876 5432', categories: ['Consumables'], activePOs: 1, onTimeRate: 88, totalSpend: 45000 },
  { id: '4', company: 'BHP Suppliers', contact: 'David Lee', email: 'david@bhpsuppliers.com', phone: '+61 8 2345 6789', categories: ['Raw Materials', 'Equipment'], activePOs: 4, onTimeRate: 82, totalSpend: 128000 },
  { id: '5', company: 'Generic Parts Co', contact: 'Jessica Brown', email: 'jess@genericparts.com', phone: '+61 7 3456 7890', categories: ['Components'], activePOs: 0, onTimeRate: 65, totalSpend: 22000 },
];

const getPerformanceBadge = (onTimeRate: number) => {
  if (onTimeRate >= 95) return { bg: 'bg-[#F5F5F5]', text: 'text-[#1A2732]', label: 'Excellent' };
  if (onTimeRate >= 85) return { bg: 'bg-[#FFF4CC]', text: 'text-[#805900]', label: 'Good' };
  if (onTimeRate >= 75) return { bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]', label: 'Fair' };
  return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Poor' };
};

export function BuySuppliers() {
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Suppliers</h1>
          <p className="text-sm text-[#737373] mt-1">{filteredSuppliers.length} total suppliers</p>
        </div>
        <div className="flex gap-3">
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded-xl group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Supplier
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <AnimatedSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <Input placeholder="Search suppliers..." className="pl-10 h-10 border-[var(--border)]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)] group">
          <AnimatedFilter className="w-4 h-4" />
          Filter
        </Button>
        <div className="flex items-center border border-[var(--border)] rounded-lg p-1">
          <button onClick={() => setViewMode('card')} className={cn("p-2 rounded transition-all duration-200", viewMode === 'card' ? "bg-[#FFCF4B] text-[#2C2C2C]" : "text-[#737373] hover:bg-[#F5F5F5]")}>
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={cn("p-2 rounded transition-all duration-200", viewMode === 'list' ? "bg-[#FFCF4B] text-[#2C2C2C]" : "text-[#737373] hover:bg-[#F5F5F5]")}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier, idx) => {
            const perfBadge = getPerformanceBadge(supplier.onTimeRate);
            return (
              <motion.div key={supplier.id} variants={animationVariants.listItem} custom={idx}>
                <Card className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[#7C3AED] text-white text-sm font-medium">{supplier.company.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-[14px] font-semibold text-[#1A2732] group-hover:text-[#FFCF4B] transition-colors">{supplier.company}</h3>
                        <p className="text-[12px] text-[#737373]">{supplier.contact}</p>
                      </div>
                    </div>
                    <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", perfBadge.bg, perfBadge.text)}>{perfBadge.label}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#737373]">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#737373]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{supplier.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {supplier.categories.map(cat => (
                      <Badge key={cat} className="bg-[#F5F5F5] text-[#525252] border-0 text-xs">{cat}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <p className="text-xs text-[#737373] mb-1">Active POs</p>
                      <p className=" text-[14px] font-semibold text-[#1A2732]">{supplier.activePOs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#737373] mb-1">On-Time</p>
                      <p className=" text-[14px] font-semibold text-[#1A2732]">{supplier.onTimeRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#737373] mb-1">Total Spend</p>
                      <p className=" text-[12px] font-semibold text-[#1A2732]">${(supplier.totalSpend / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">SUPPLIER</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">CONTACT</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">CATEGORIES</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">ACTIVE POs</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">ON-TIME %</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">TOTAL SPEND</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">PERFORMANCE</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, idx) => {
                  const perfBadge = getPerformanceBadge(supplier.onTimeRate);
                  return (
                    <tr key={supplier.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[#F5F5F5]")}>
                      <td className="px-4">
                        <a href={`/buy/suppliers/${supplier.id}`} className="text-sm font-medium text-[#1A2732] hover:underline flex items-center gap-1">
                          {supplier.company}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 text-sm text-[#525252]">{supplier.contact}</td>
                      <td className="px-4">
                        <div className="flex flex-wrap gap-1">
                          {supplier.categories.map(cat => (
                            <Badge key={cat} className="bg-[#F5F5F5] text-[#525252] border-0 text-xs">{cat}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 text-center  text-sm font-medium">{supplier.activePOs}</td>
                      <td className="px-4 text-center  text-sm font-medium text-[#1A2732]">{supplier.onTimeRate}%</td>
                      <td className="px-4 text-right  text-sm font-medium">${supplier.totalSpend.toLocaleString()}</td>
                      <td className="px-4">
                        <div className="flex items-center justify-center">
                          <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", perfBadge.bg, perfBadge.text)}>{perfBadge.label}</Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
