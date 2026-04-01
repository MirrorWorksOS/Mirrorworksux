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
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';


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
  Factory:   { icon: Building2, badge: 'bg-[var(--mw-blue-100)]',  text: 'text-[var(--mw-blue)]' },
  Warehouse: { icon: Warehouse, badge: 'bg-[var(--neutral-100)]',  text: 'text-[var(--mw-mirage)]' },
  Office:    { icon: MapPin,    badge: 'bg-[var(--neutral-100)]',  text: 'text-[var(--neutral-500)]' },
  Storage:   { icon: Warehouse, badge: 'bg-[var(--mw-amber-100)]',  text: 'text-[var(--mw-amber)]' },
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
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Locations</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">{LOCATIONS.filter(l => l.status === 'active').length} active sites</p>
        </div>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] gap-2" onClick={() => toast('New location coming soon')}>
          <Plus className="w-4 h-4" /> New location
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input
          placeholder="Search locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-xl text-sm"
        />
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(loc => {
          const cfg  = TYPE_CONFIG[loc.type] ?? TYPE_CONFIG['Office'];
          const Icon = cfg.icon;
          return (
            <motion.div key={loc.id} variants={staggerItem}>
              <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow duration-[var(--duration-short2)] cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-[var(--shape-md)] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[var(--neutral-500)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-[var(--mw-mirage)] group-hover:text-[var(--mw-yellow-400)] transition-colors">
                        {loc.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>
                          {loc.type}
                        </Badge>
                        {loc.status === 'inactive' && (
                          <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs rounded-full px-2 py-0.5">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--neutral-400)] group-hover:text-[var(--mw-yellow-400)] transition-colors" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--neutral-400)] mt-0.5 shrink-0" />
                    <span className="text-[var(--neutral-500)]">{loc.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--neutral-100)]">
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">Floor area</p>
                    <p className="text-sm  font-medium text-[var(--mw-mirage)]">{loc.floorArea}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">Machines</p>
                    <p className="text-sm  font-medium text-[var(--mw-mirage)]">{loc.machines}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">Staff</p>
                    <p className="text-sm  font-medium text-[var(--mw-mirage)]">{loc.staff}</p>
                  </div>
                </div>

                {/* Zones */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {loc.zones.map(z => (
                    <span key={z} className="text-xs bg-[var(--neutral-100)] text-[var(--neutral-500)] px-2 py-0.5 rounded-full">
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
