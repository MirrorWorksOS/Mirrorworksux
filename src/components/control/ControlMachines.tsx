/**
 * Control Machines — work centre master data with status, utilisation, next maintenance
 */
import React, { useState } from 'react';
import { Plus, Search, Wrench, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';


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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active:      { label: 'Active',      bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]' },
  maintenance: { label: 'Maintenance', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
  idle:        { label: 'Idle',        bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]' },
};

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

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input
          placeholder="Search machines or work centres..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-xl text-sm"
        />
      </div>

      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Machine</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Manufacturer / Model</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Work Centre</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Capacity</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium w-36">Utilisation</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Next Maint.</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const cfg = STATUS_CONFIG[m.status];
              const utilColour = m.utilisation > 85 ? 'var(--mw-success)' : m.utilisation > 60 ? 'var(--mw-yellow-400)' : 'var(--neutral-200)';
              return (
                <tr key={m.id} className={cn('border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors', m.status === 'maintenance' && 'bg-[var(--accent)]')}>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                      <span className="text-sm text-[var(--mw-mirage)] font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 text-xs text-[var(--neutral-500)]">{m.manufacturer} {m.model}</td>
                  <td className="px-4 text-sm text-[var(--neutral-500)]">{m.workCenter}</td>
                  <td className="px-4 text-right text-sm  font-medium">{m.capacity}h/day</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.utilisation}%`, backgroundColor: utilColour }} />
                      </div>
                      <span className="text-xs  text-[var(--neutral-500)] w-8 text-right">{m.utilisation}%</span>
                    </div>
                  </td>
                  <td className="px-4 text-sm text-[var(--neutral-500)]">{m.nextMaint}</td>
                  <td className="px-4">
                    <div className="flex justify-center">
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );
}
