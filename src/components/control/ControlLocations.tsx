/**
 * Control Locations — factory sites and warehouses master data
 */
import React, { useState } from 'react';
import { MapPin, Plus, Search, Building2, Warehouse, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

const LOCATIONS = [
  {
    id: '1',
    name: 'Main Factory — Sydney',
    type: 'Factory',
    address: '14 Industrial Rd, Silverwater NSW 2128',
    phone: '+61 2 9748 0001',
    floorArea: '2,400 m²',
    zones: ['Cutting', 'Welding', 'Assembly', 'QC', 'Dispatch'],
    machines: 12,
    staff: 28,
    status: 'active',
  },
  {
    id: '2',
    name: 'Warehouse — Moorebank',
    type: 'Warehouse',
    address: '3 Logistics Dr, Moorebank NSW 2170',
    phone: '+61 2 9602 1100',
    floorArea: '1,800 m²',
    zones: ['Receiving', 'Storage', 'Dispatch'],
    machines: 3,
    staff: 6,
    status: 'active',
  },
  {
    id: '3',
    name: 'Office — Parramatta',
    type: 'Office',
    address: '100 George St, Parramatta NSW 2150',
    phone: '+61 2 9891 5500',
    floorArea: '320 m²',
    zones: ['Sales', 'Admin', 'Management'],
    machines: 0,
    staff: 8,
    status: 'active',
  },
  {
    id: '4',
    name: 'Site Storage — Newcastle',
    type: 'Storage',
    address: '22 Steel Ave, Tomago NSW 2322',
    phone: '+61 2 4964 2200',
    floorArea: '600 m²',
    zones: ['Raw Materials', 'Finished Goods'],
    machines: 1,
    staff: 2,
    status: 'inactive',
  },
];

const TYPE_CONFIG: Record<string, { icon: any; badge: string; text: string }> = {
  Factory:   { icon: Building2, badge: 'bg-[#DBEAFE]',  text: 'text-[#0A7AFF]' },
  Warehouse: { icon: Warehouse, badge: 'bg-[#E3FCEF]',  text: 'text-[#36B37E]' },
  Office:    { icon: MapPin,    badge: 'bg-[#F5F5F5]',  text: 'text-[#737373]' },
  Storage:   { icon: Warehouse, badge: 'bg-[#FFEDD5]',  text: 'text-[#FF8B00]' },
};

export function ControlLocations() {
  const [search, setSearch] = useState('');

  const filtered = LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Locations</h1>
          <p className="text-sm text-[#737373] mt-1">{LOCATIONS.filter(l => l.status === 'active').length} active sites</p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2">
          <Plus className="w-4 h-4" /> New location
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <Input
          placeholder="Search locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm"
        />
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(loc => {
          const cfg  = TYPE_CONFIG[loc.type] ?? TYPE_CONFIG['Office'];
          const Icon = cfg.icon;
          return (
            <motion.div key={loc.id} variants={animationVariants.listItem}>
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#737373]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px] text-[#0A0A0A] group-hover:text-[#0052CC] transition-colors">
                        {loc.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>
                          {loc.type}
                        </Badge>
                        {loc.status === 'inactive' && (
                          <Badge className="bg-[#F5F5F5] text-[#737373] border-0 text-xs rounded-full px-2 py-0.5">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#0A0A0A] transition-colors" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#A3A3A3] mt-0.5 shrink-0" />
                    <span className="text-[#737373]">{loc.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F5F5F5]">
                  <div>
                    <p className="text-xs text-[#737373] mb-0.5">Floor area</p>
                    <p className="text-sm font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{loc.floorArea}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-0.5">Machines</p>
                    <p className="text-sm font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{loc.machines}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-0.5">Staff</p>
                    <p className="text-sm font-['Roboto_Mono',monospace] font-medium text-[#0A0A0A]">{loc.staff}</p>
                  </div>
                </div>

                {/* Zones */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {loc.zones.map(z => (
                    <span key={z} className="text-[11px] bg-[#F5F5F5] text-[#737373] px-2 py-0.5 rounded-full">
                      {z}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
