/**
 * Plan Products — product catalogue with production context
 * Lead time, routing steps, work centres, BOM status
 */
import React, { useState } from 'react';
import { Search, ExternalLink, Package } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';


const PRODUCTS = [
  { id: '1', name: 'Server Rack Chassis',            sku: 'PROD-SR-001', category: 'Finished Goods',  leadTime: 12, routingSteps: 6, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Welding', 'Finishing'],  cycleHrs: 12,  lastProduced: 'Mar 18' },
  { id: '2', name: 'Structural Bracket Type A',       sku: 'PROD-BP-002', category: 'Finished Goods',  leadTime: 5,  routingSteps: 4, hasBOM: true,  workCenters: ['Cutting', 'Forming', 'Finishing'],             cycleHrs: 2.25,lastProduced: 'Mar 12' },
  { id: '3', name: 'Aluminium Enclosure 600x400',     sku: 'PROD-AE-003', category: 'Finished Goods',  leadTime: 8,  routingSteps: 8, hasBOM: true,  workCenters: ['Machining', 'Forming', 'Assembly'],            cycleHrs: 8,   lastProduced: 'Mar 10' },
  { id: '4', name: 'Rail Platform Guard',             sku: 'PROD-RPG-004',category: 'Finished Goods',  leadTime: 18, routingSteps: 5, hasBOM: true,  workCenters: ['Cutting', 'Welding', 'Finishing'],             cycleHrs: 16,  lastProduced: 'Feb 28' },
  { id: '5', name: 'Machine Guard Panel',             sku: 'PROD-MG-005', category: 'Finished Goods',  leadTime: 7,  routingSteps: 4, hasBOM: false, workCenters: ['Cutting', 'Forming', 'Finishing'],             cycleHrs: 3.5, lastProduced: 'Feb 20' },
  { id: '6', name: 'Custom Electrical Cabinet',       sku: 'PROD-EC-006', category: 'Finished Goods',  leadTime: 25, routingSteps: 9, hasBOM: false, workCenters: ['Cutting', 'Forming', 'Welding', 'Assembly'],   cycleHrs: 22,  lastProduced: '—' },
];

export function PlanProducts() {
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Products</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {PRODUCTS.length} products · {PRODUCTS.filter(p => p.hasBOM).length} with BOMs
            {PRODUCTS.filter(p => !p.hasBOM).length > 0 && <span className="text-[var(--mw-amber)] ml-1">· {PRODUCTS.filter(p => !p.hasBOM).length} missing BOM</span>}
          </p>
        </div>
        <p className="text-xs text-[var(--neutral-500)] bg-[var(--neutral-100)] px-3 py-2 rounded-[var(--shape-lg)]">
          Product master managed in <span className="font-medium">Control → Products</span>
        </p>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] text-sm" />
      </div>

      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              {['Product', 'SKU', 'Lead time', 'Cycle hrs', 'Routing steps', 'Work centres', 'BOM', 'Last produced'].map(h => (
                <th key={h} className={cn('px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium',
                  ['Lead time', 'Cycle hrs', 'Routing steps'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                    <span className="text-sm text-[var(--mw-mirage)] font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 text-xs  text-[var(--neutral-500)]">{p.sku}</td>
                <td className="px-4 text-right text-sm ">{p.leadTime}d</td>
                <td className="px-4 text-right text-sm ">{p.cycleHrs}h</td>
                <td className="px-4 text-right text-sm ">{p.routingSteps}</td>
                <td className="px-4">
                  <div className="flex flex-wrap gap-1">
                    {p.workCenters.slice(0, 3).map(wc => (
                      <span key={wc} className="text-[10px] bg-[var(--neutral-100)] text-[var(--neutral-500)] px-1.5 py-0.5 rounded">{wc}</span>
                    ))}
                    {p.workCenters.length > 3 && <span className="text-[10px] text-[var(--neutral-500)]">+{p.workCenters.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4">
                  {p.hasBOM
                    ? <Badge className="bg-[var(--neutral-100)] text-[var(--mw-mirage)] border-0 text-xs rounded-full px-2">Yes</Badge>
                    : <Badge className="bg-[var(--mw-amber-100)] text-[var(--mw-amber)] border-0 text-xs rounded-full px-2">Missing</Badge>
                  }
                </td>
                <td className="px-4 text-sm text-[var(--neutral-500)]">{p.lastProduced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );
}
