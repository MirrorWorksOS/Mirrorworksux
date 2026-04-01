/**
 * Control Inventory — stock master data with search, filter, status
 */
import React, { useState } from 'react';
import { Search, Plus, Download, Filter } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';


const INVENTORY = [
  { id: '1',  sku: 'AL-5052-BP',  name: 'Aluminium Base Plate 5052',    category: 'Raw Materials',  unit: 'each',   onHand: 120, minStock: 50,  costPrice: 28.50,  location: 'A-01-03', status: 'ok' },
  { id: '2',  sku: 'AL-5052-SA',  name: 'Aluminium Support Arm 5052',   category: 'Raw Materials',  unit: 'each',   onHand: 85,  minStock: 40,  costPrice: 34.20,  location: 'A-02-01', status: 'ok' },
  { id: '3',  sku: 'RHS-50252',   name: 'RHS 50x25x2.5 Steel Section',  category: 'Raw Materials',  unit: 'length', onHand: 200, minStock: 100, costPrice: 12.80,  location: 'B-02-05', status: 'ok' },
  { id: '4',  sku: 'MS-10-3678',  name: '10mm Mild Steel Plate',        category: 'Raw Materials',  unit: 'sheet',  onHand: 45,  minStock: 20,  costPrice: 185.00, location: 'A-03-02', status: 'ok' },
  { id: '5',  sku: 'HW-KIT-001',  name: 'Hardware Kit M10 SS',          category: 'Consumables',    unit: 'kit',    onHand: 15,  minStock: 30,  costPrice: 8.40,   location: 'C-04-02', status: 'low' },
  { id: '6',  sku: 'WW-ER70S6',   name: 'Welding Wire ER70S-6 15kg',    category: 'Consumables',    unit: 'spool',  onHand: 50,  minStock: 10,  costPrice: 92.00,  location: 'C-01-01', status: 'ok' },
  { id: '7',  sku: 'FST-M10A4',   name: 'SS Fasteners M10 Grade A4',    category: 'Consumables',    unit: 'box',    onHand: 0,   minStock: 20,  costPrice: 24.50,  location: 'D-01-01', status: 'out' },
  { id: '8',  sku: 'PNT-RAL7035', name: 'Powder Coat Paint RAL 7035',   category: 'Consumables',    unit: 'kg',     onHand: 8,   minStock: 15,  costPrice: 11.00,  location: 'Paint-01',status: 'low' },
  { id: '9',  sku: 'PROD-SR-001', name: 'Server Rack Chassis',          category: 'Finished Goods', unit: 'each',   onHand: 3,   minStock: 0,   costPrice: 820.00, location: 'FG-01-01',status: 'ok' },
  { id: '10', sku: 'PROD-BP-002', name: 'Bracket Type A (standard)',    category: 'Finished Goods', unit: 'each',   onHand: 12,  minStock: 5,   costPrice: 145.00, location: 'FG-01-02',status: 'ok' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  ok:  { label: 'OK',       bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', dot: 'var(--mw-mirage)' },
  low: { label: 'Low',      bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', dot: 'var(--mw-amber)' },
  out: { label: 'Out',      bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', dot: 'var(--mw-error)' },
};

const CATEGORIES = ['All', 'Raw Materials', 'Consumables', 'Finished Goods'];

export function ControlInventory() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  const filtered = INVENTORY.filter(item => {
    const matchSearch   = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || item.category === category;
    return matchSearch && matchCategory;
  });

  const totals = {
    items: INVENTORY.length,
    low:   INVENTORY.filter(i => i.status === 'low').length,
    out:   INVENTORY.filter(i => i.status === 'out').length,
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Inventory</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {totals.items} SKUs
            {totals.low > 0 && <span className="text-[var(--mw-amber)] ml-2">· {totals.low} low stock</span>}
            {totals.out > 0 && <span className="text-[var(--mw-error)] ml-2">· {totals.out} out of stock</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[var(--border)] gap-2 h-10" onClick={() => toast.success('Exporting inventory...')}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] gap-2 h-10" onClick={() => toast('New inventory item coming soon')}>
            <Plus className="w-4 h-4" /> New item
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-xl text-sm"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 border-[var(--border)] w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Name</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Category</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">On Hand</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Min Stock</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Cost</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Location</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const cfg = STATUS_CONFIG[item.status];
              return (
                <tr key={item.id} className="border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors">
                  <td className="px-4 text-xs  font-medium text-[var(--neutral-500)]">{item.sku}</td>
                  <td className="px-4 text-sm text-[var(--mw-mirage)] font-medium">{item.name}</td>
                  <td className="px-4">
                    <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs">{item.category}</Badge>
                  </td>
                  <td className="px-4 text-right  text-sm font-medium"
                    style={{ color: item.status === 'out' ? 'var(--mw-error)' : item.status === 'low' ? 'var(--mw-amber)' : 'var(--mw-mirage)' }}>
                    {item.onHand} {item.unit}
                  </td>
                  <td className="px-4 text-right  text-sm text-[var(--neutral-500)]">{item.minStock}</td>
                  <td className="px-4 text-right  text-sm">${item.costPrice.toFixed(2)}</td>
                  <td className="px-4 text-xs  text-[var(--neutral-500)]">{item.location}</td>
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
        {filtered.length === 0 && (
          <EmptyState variant="inline" title="No items match your search." />
        )}
      </Card>
    </motion.div>
  );
}
