/**
 * Control BOMs — Bill of Materials management
 * Full list with expandable BOM lines
 */
import React, { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

interface BOMLine {
  sku: string; description: string; qty: number; unit: string; type: 'material' | 'purchased' | 'labour';
}
interface BOM {
  id: string; product: string; sku: string; version: string; componentCount: number; status: 'active' | 'draft' | 'obsolete'; updatedAt: string; lines: BOMLine[];
}

const BOMS: BOM[] = [
  {
    id: '1', product: 'Server Rack Chassis', sku: 'PROD-SR-001', version: 'v1.2',
    componentCount: 6, status: 'active', updatedAt: '15 Mar',
    lines: [
      { sku: 'MS-10-3678',  description: '10mm Mild Steel Plate',       qty: 4,    unit: 'sheet',  type: 'material' },
      { sku: 'RHS-50252',   description: 'RHS 50x25x2.5 — Cut',        qty: 8,    unit: 'length', type: 'material' },
      { sku: 'HW-KIT-001',  description: 'Hardware Kit M10 SS',        qty: 2,    unit: 'kit',    type: 'purchased' },
      { sku: 'PNT-RAL7035', description: 'Powder Coat RAL 7035',       qty: 1.5,  unit: 'kg',     type: 'material' },
      { sku: 'LABOUR-FAB',  description: 'Fabrication — CNC cutting',  qty: 2,    unit: 'hrs',    type: 'labour' },
      { sku: 'LABOUR-WLD',  description: 'Welding — MIG',              qty: 3,    unit: 'hrs',    type: 'labour' },
    ],
  },
  {
    id: '2', product: 'Structural Bracket Type A', sku: 'PROD-BP-002', version: 'v1.0',
    componentCount: 4, status: 'active', updatedAt: '08 Mar',
    lines: [
      { sku: 'MS-10-3678', description: '10mm Mild Steel Plate', qty: 0.5, unit: 'sheet',  type: 'material' },
      { sku: 'FST-M10A4',  description: 'SS Fasteners M10',     qty: 4,   unit: 'each',   type: 'purchased' },
      { sku: 'LABOUR-FAB', description: 'Fabrication — press',  qty: 0.5, unit: 'hrs',    type: 'labour' },
      { sku: 'LABOUR-FIN', description: 'Finishing — grind',    qty: 0.25, unit: 'hrs',   type: 'labour' },
    ],
  },
  {
    id: '3', product: 'Aluminium Enclosure 600x400', sku: 'PROD-AE-003', version: 'v2.1',
    componentCount: 8, status: 'active', updatedAt: '20 Feb',
    lines: [
      { sku: 'AL-5052-BP', description: 'Aluminium Base Plate',   qty: 2,  unit: 'each',  type: 'material' },
      { sku: 'AL-5052-SA', description: 'Aluminium Support Arm',  qty: 4,  unit: 'each',  type: 'material' },
      { sku: 'HW-KIT-001', description: 'Hardware Kit M10',       qty: 1,  unit: 'kit',   type: 'purchased' },
      { sku: 'SEAL-001',   description: 'IP65 Seal Strip',        qty: 2.4, unit: 'm',    type: 'purchased' },
      { sku: 'LABOUR-FAB', description: 'Fabrication — fold',     qty: 1,  unit: 'hrs',   type: 'labour' },
      { sku: 'LABOUR-ASM', description: 'Assembly',               qty: 0.5, unit: 'hrs',  type: 'labour' },
      { sku: 'LABOUR-QC',  description: 'QC inspection',          qty: 0.25, unit: 'hrs', type: 'labour' },
      { sku: 'LABOUR-PKG', description: 'Packing',                qty: 0.25, unit: 'hrs', type: 'labour' },
    ],
  },
  {
    id: '4', product: 'Rail Platform Guard', sku: 'PROD-RPG-004', version: 'v1.0',
    componentCount: 5, status: 'draft', updatedAt: '19 Mar',
    lines: [
      { sku: 'MS-10-3678',  description: '10mm MS Plate',      qty: 6,  unit: 'sheet', type: 'material' },
      { sku: 'RHS-50252',   description: 'RHS 50x25 section',  qty: 12, unit: 'length',type: 'material' },
      { sku: 'HW-KIT-001',  description: 'Hardware Kit M10',   qty: 4,  unit: 'kit',   type: 'purchased' },
      { sku: 'LABOUR-FAB',  description: 'Fabrication',        qty: 8,  unit: 'hrs',   type: 'labour' },
      { sku: 'LABOUR-WLD',  description: 'Welding',            qty: 6,  unit: 'hrs',   type: 'labour' },
    ],
  },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  active:   { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]' },
  draft:    { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]' },
  obsolete: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
};

const LINE_TYPE_CONFIG: Record<string, { bg: string; text: string }> = {
  material:  { bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]' },
  purchased: { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]' },
  labour:    { bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]' },
};

export function ControlBOMs() {
  const [search,    setSearch]   = useState('');
  const [expanded,  setExpanded] = useState<Set<string>>(new Set());

  const filtered = BOMS.filter(b =>
    b.product.toLowerCase().includes(search.toLowerCase()) ||
    b.sku.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Bills of Materials</h1>
          <p className="text-sm text-[#737373] mt-1">{BOMS.filter(b => b.status === 'active').length} active BOMs</p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2">
          <Plus className="w-4 h-4" /> New BOM
        </Button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <Input
          placeholder="Search BOMs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm"
        />
      </div>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium w-8" />
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">Product</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">Version</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] uppercase font-medium">Components</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">Updated</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] uppercase font-medium">Status</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] uppercase font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(bom => {
              const isOpen = expanded.has(bom.id);
              const cfg    = STATUS_CONFIG[bom.status];
              return (
                <React.Fragment key={bom.id}>
                  <tr
                    className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors"
                    onClick={() => toggle(bom.id)}
                  >
                    <td className="px-4">
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-[#737373]" />
                        : <ChevronRight className="w-4 h-4 text-[#737373]" />
                      }
                    </td>
                    <td className="px-4 text-sm text-[#0A0A0A] font-medium">{bom.product}</td>
                    <td className="px-4 text-xs font-['Roboto_Mono',monospace] text-[#737373]">{bom.sku}</td>
                    <td className="px-4 text-sm font-['Roboto_Mono',monospace] text-[#737373]">{bom.version}</td>
                    <td className="px-4 text-right text-sm font-['Roboto_Mono',monospace] font-medium">{bom.componentCount}</td>
                    <td className="px-4 text-sm text-[#737373]">{bom.updatedAt}</td>
                    <td className="px-4">
                      <div className="flex justify-center">
                        <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5 capitalize', cfg.bg, cfg.text)}>
                          {bom.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 text-right" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-[#737373] hover:text-[#0A0A0A]">
                        Edit
                      </Button>
                    </td>
                  </tr>

                  {/* Expanded BOM lines */}
                  {isOpen && (
                    <tr>
                      <td colSpan={8} className="bg-[#FAFAFA] border-b border-[#E5E5E5] p-0">
                        <div className="px-8 py-4">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="pb-2 text-left text-[11px] tracking-wider text-[#737373] uppercase font-medium">SKU</th>
                                <th className="pb-2 text-left text-[11px] tracking-wider text-[#737373] uppercase font-medium">Description</th>
                                <th className="pb-2 text-right text-[11px] tracking-wider text-[#737373] uppercase font-medium">Qty</th>
                                <th className="pb-2 text-left text-[11px] tracking-wider text-[#737373] uppercase font-medium">Unit</th>
                                <th className="pb-2 text-left text-[11px] tracking-wider text-[#737373] uppercase font-medium">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bom.lines.map((line, i) => {
                                const ltcfg = LINE_TYPE_CONFIG[line.type];
                                return (
                                  <tr key={i} className="border-t border-[#E5E5E5] h-10">
                                    <td className="py-2 text-xs font-['Roboto_Mono',monospace] text-[#737373] pr-6">{line.sku}</td>
                                    <td className="py-2 text-sm text-[#0A0A0A] pr-6">{line.description}</td>
                                    <td className="py-2 text-right text-sm font-['Roboto_Mono',monospace] font-medium pr-4">{line.qty}</td>
                                    <td className="py-2 text-sm text-[#737373] pr-6">{line.unit}</td>
                                    <td className="py-2">
                                      <Badge className={cn('border-0 text-[10px] rounded-full px-1.5 py-0.5 capitalize', ltcfg.bg, ltcfg.text)}>
                                        {line.type}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );
}
