/**
 * Plan QC Planning — define and manage quality control checkpoints per work centre
 */
import React, { useState } from 'react';
import { Plus, CheckCircle2, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


const CHECKPOINTS = [
  { id: '1', name: 'Incoming Material Inspection',     stage: 'Receiving',     frequency: 'Every delivery', duration: 15, mandatory: true,  lastUpdated: 'Mar 01', products: 'All' },
  { id: '2', name: 'Weld Quality Visual Check',        stage: 'Welding',       frequency: 'Per job',        duration: 30, mandatory: true,  lastUpdated: 'Feb 15', products: 'Welded assemblies' },
  { id: '3', name: 'Weld Penetration UT Test',         stage: 'Welding',       frequency: 'Structural only', duration: 60, mandatory: false, lastUpdated: 'Feb 15', products: 'Structural' },
  { id: '4', name: 'Dimensional Verification',         stage: 'In-Process',    frequency: 'Per part',       duration: 20, mandatory: true,  lastUpdated: 'Mar 05', products: 'All' },
  { id: '5', name: 'Surface Preparation Check',        stage: 'Finishing',     frequency: 'Before coating', duration: 10, mandatory: true,  lastUpdated: 'Feb 20', products: 'All coated' },
  { id: '6', name: 'Powder Coat Thickness Test',       stage: 'Finishing',     frequency: 'Per batch',      duration: 15, mandatory: true,  lastUpdated: 'Mar 10', products: 'Powder-coated' },
  { id: '7', name: 'Final Visual Inspection',          stage: 'Assembly',      frequency: 'Per job',        duration: 45, mandatory: true,  lastUpdated: 'Mar 15', products: 'All' },
  { id: '8', name: 'Dimensional Report (Customer)',    stage: 'Assembly',      frequency: 'As required',    duration: 90, mandatory: false, lastUpdated: 'Jan 10', products: 'Customer-specified' },
  { id: '9', name: 'IP Rating Ingress Test',           stage: 'Assembly',      frequency: 'Per batch',      duration: 30, mandatory: false, lastUpdated: 'Feb 01', products: 'Enclosures' },
  { id: '10',name: 'Packing Check',                   stage: 'Dispatch',      frequency: 'Per shipment',   duration: 5,  mandatory: true,  lastUpdated: 'Mar 18', products: 'All' },
];

const STAGES = ['All', 'Receiving', 'In-Process', 'Welding', 'Finishing', 'Assembly', 'Dispatch'];

export function PlanQCPlanning() {
  const [search,    setSearch]    = useState('');
  const [stageTab,  setStageTab]  = useState('All');

  const filtered = CHECKPOINTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStage  = stageTab === 'All' || c.stage === stageTab;
    return matchSearch && matchStage;
  });

  return (
    <PageShell>
      <PageHeader
        title="QC checkpoints"
        subtitle={`${CHECKPOINTS.filter(c => c.mandatory).length} mandatory · ${CHECKPOINTS.filter(c => !c.mandatory).length} optional`}
        actions={
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> New checkpoint
          </Button>
        }
      />

      {/* Stage filter tabs */}
      <div className="flex gap-1 bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-1 w-fit flex-wrap">
        {STAGES.map(s => (
          <button key={s} onClick={() => setStageTab(s)}
            className={cn('px-3 py-1.5 rounded-md text-sm transition-colors font-medium',
              stageTab === s ? 'bg-card text-foreground shadow-sm' : 'text-[var(--neutral-500)] hover:text-[var(--mw-yellow-400)]'
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input placeholder="Search checkpoints…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] text-sm" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cp => (
          <motion.div key={cp.id} variants={staggerItem}>
            <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn('w-5 h-5 shrink-0', cp.mandatory ? 'text-foreground' : 'text-[var(--neutral-400)]')} />
                  <h3 className="text-sm font-medium text-foreground leading-tight group-hover:text-[var(--mw-yellow-400)] transition-colors">
                    {cp.name}
                  </h3>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge variant="neutral">{cp.stage}</StatusBadge>
                {cp.mandatory
                  ? <StatusBadge variant="info">Required</StatusBadge>
                  : <StatusBadge variant="neutral">Optional</StatusBadge>
                }
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-500)]">Frequency</span>
                  <span className="text-foreground font-medium">{cp.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-500)]">Duration</span>
                  <span className="tabular-nums text-foreground">{cp.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-500)]">Applies to</span>
                  <span className="text-foreground text-xs">{cp.products}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--neutral-400)] mt-3">Updated {cp.lastUpdated}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
