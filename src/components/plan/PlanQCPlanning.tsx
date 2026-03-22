/**
 * Plan QC Planning — define and manage quality control checkpoints per work centre
 */
import React, { useState } from 'react';
import { Plus, CheckCircle2, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

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
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">QC checkpoints</h1>
          <p className="text-sm text-[#737373] mt-1">
            {CHECKPOINTS.filter(c => c.mandatory).length} mandatory · {CHECKPOINTS.filter(c => !c.mandatory).length} optional
          </p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2">
          <Plus className="w-4 h-4" /> New checkpoint
        </Button>
      </div>

      {/* Stage filter tabs */}
      <div className="flex gap-1 bg-[#F5F5F5] rounded-lg p-1 w-fit flex-wrap">
        {STAGES.map(s => (
          <button key={s} onClick={() => setStageTab(s)}
            className={cn('px-3 py-1.5 rounded-md text-sm transition-colors font-medium',
              stageTab === s ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#737373] hover:text-[#0A0A0A]'
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <Input placeholder="Search checkpoints…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cp => (
          <motion.div key={cp.id} variants={animationVariants.listItem}>
            <Card className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:shadow-md transition-shadow duration-150 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn('w-5 h-5 shrink-0', cp.mandatory ? 'text-[#36B37E]' : 'text-[#A3A3A3]')} />
                  <h3 className="text-[14px] font-semibold text-[#0A0A0A] leading-tight group-hover:text-[#0052CC] transition-colors">
                    {cp.name}
                  </h3>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A3A3] shrink-0" />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-[#F5F5F5] text-[#737373] border-0 text-xs">{cp.stage}</Badge>
                {cp.mandatory
                  ? <Badge className="bg-[#DBEAFE] text-[#0A7AFF] border-0 text-xs">Required</Badge>
                  : <Badge className="bg-[#F5F5F5] text-[#737373] border-0 text-xs">Optional</Badge>
                }
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Frequency</span>
                  <span className="text-[#0A0A0A] font-medium">{cp.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Duration</span>
                  <span className="font-['Roboto_Mono',monospace] text-[#0A0A0A]">{cp.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Applies to</span>
                  <span className="text-[#0A0A0A] text-xs">{cp.products}</span>
                </div>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-3">Updated {cp.lastUpdated}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
