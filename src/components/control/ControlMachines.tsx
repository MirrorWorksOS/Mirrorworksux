/**
 * Control Machines — work centre master data with status, utilisation, next maintenance
 */
import React, { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FilterBar } from '@/components/shared/layout/FilterBar';


const MACHINES = [
  { id: '1',  name: 'Laser Cutter #1',       workCenter: 'Cutting',     capacity: 8,  utilisation: 85, status: 'active',      nextMaint: '12 Apr', manufacturer: 'Trumpf', model: 'TruLaser 3030' },
  { id: '2',  name: 'Laser Cutter #2',       workCenter: 'Cutting',     capacity: 8,  utilisation: 72, status: 'active',      nextMaint: '18 Apr', manufacturer: 'Trumpf', model: 'TruLaser 3030' },
  { id: '3',  name: 'Press Brake #1',        workCenter: 'Forming',     capacity: 8,  utilisation: 68, status: 'active',      nextMaint: '20 Apr', manufacturer: 'Amada',  model: 'HFE3 220' },
  { id: '4',  name: 'Press Brake #2',        workCenter: 'Forming',     capacity: 8,  utilisation: 55, status: 'active',      nextMaint: '25 Apr', manufacturer: 'Amada',  model: 'HFE3 175' },
  { id: '5',  name: 'MIG Welding Station A', workCenter: 'Welding',     capacity: 8,  utilisation: 91, status: 'active',      nextMaint: '30 Apr', manufacturer: 'Lincoln', model: 'PowerMIG 256' },
  { id: '6',  name: 'MIG Welding Station B', workCenter: 'Welding',     capacity: 8,  utilisation: 78, status: 'active',      nextMaint: '05 May', manufacturer: 'Lincoln', model: 'PowerMIG 256' },
  { id: '7',  name: 'TIG Welding Station',   workCenter: 'Welding',     capacity: 8,  utilisation: 60, status: 'active',      nextMaint: '10 May', manufacturer: 'Kemppi',  model: 'MasterTig 335' },
  { id: '8',  name: 'CNC Mill #1',           workCenter: 'Machining',   capacity: 8,  utilisation: 0,  status: 'maintenance', nextMaint: '22 Mar', manufacturer: 'Haas',   model: 'VF-2SS' },
  { id: '9',  name: 'Drill Press #1',        workCenter: 'Machining',   capacity: 8,  utilisation: 45, status: 'active',      nextMaint: '15 May', manufacturer: 'GMC',    model: 'DP-1650' },
  { id: '10', name: 'Powder Coat Booth',     workCenter: 'Finishing',   capacity: 6,  utilisation: 70, status: 'active',      nextMaint: '01 May', manufacturer: 'Nordson',model: 'Prodigy 2' },
  { id: '11', name: 'Overhead Crane 5T',     workCenter: 'Material Handling', capacity: 16, utilisation: 30, status: 'active', nextMaint: '15 Jun', manufacturer: 'Demag', model: 'EKKE 5t' },
];

type Machine = (typeof MACHINES)[number];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active:      { label: 'Active',      bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]' },
  maintenance: { label: 'Maintenance', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
  idle:        { label: 'Idle',        bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]' },
};

const machineColumns: MwColumnDef<Machine>[] = [
  {
    key: 'machine', header: 'Machine',
    cell: (m) => (
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
        <span className="text-sm text-[var(--mw-mirage)] font-medium">{m.name}</span>
      </div>
    ),
  },
  { key: 'manufacturer', header: 'Manufacturer / Model', cell: (m) => <span className="text-xs text-[var(--neutral-500)]">{m.manufacturer} {m.model}</span> },
  { key: 'workCenter',   header: 'Work Centre',          cell: (m) => <span className="text-sm text-[var(--neutral-500)]">{m.workCenter}</span> },
  { key: 'capacity',     header: 'Capacity', headerClassName: 'text-right', className: 'text-right', cell: (m) => <span className="text-sm font-medium">{m.capacity}h/day</span> },
  {
    key: 'utilisation', header: 'Utilisation', headerClassName: 'w-36',
    cell: (m) => {
      const utilColour = m.utilisation > 85 ? 'var(--mw-success)' : m.utilisation > 60 ? 'var(--mw-yellow-400)' : 'var(--neutral-200)';
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${m.utilisation}%`, backgroundColor: utilColour }} />
          </div>
          <span className="text-xs text-[var(--neutral-500)] w-8 text-right">{m.utilisation}%</span>
        </div>
      );
    },
  },
  { key: 'nextMaint', header: 'Next Maint.', cell: (m) => <span className="text-sm text-[var(--neutral-500)]">{m.nextMaint}</span> },
  {
    key: 'status', header: 'Status', headerClassName: 'text-center',
    cell: (m) => {
      const cfg = STATUS_CONFIG[m.status];
      return (
        <div className="flex justify-center">
          <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>
            {cfg.label}
          </Badge>
        </div>
      );
    },
  },
];

export function ControlMachines() {
  const [search, setSearch] = useState('');

  const filtered = MACHINES.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.workCenter.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Machines</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {MACHINES.filter(m => m.status === 'active').length} active · {MACHINES.filter(m => m.status === 'maintenance').length} in maintenance
          </p>
        </div>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] gap-2" onClick={() => toast('New machine coming soon')}>
          <Plus className="w-4 h-4" /> New machine
        </Button>
      </div>

      <MwDataTable<Machine>
        columns={machineColumns}
        data={filtered}
        keyExtractor={(m) => m.id}
        filterBar={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search machines or work centres..."
          />
        }
      />
    </motion.div>
  );
}
