/**
 * Control Products — product master data catalogue
 */
import React, { useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';
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


const PRODUCTS = [
  { id: '1',  name: 'Server Rack Chassis',          sku: 'PROD-SR-001', category: 'Finished Goods', type: 'Manufactured', sellPrice: 1280.00, costPrice: 820.00, hasBOM: true,  status: 'active' },
  { id: '2',  name: 'Structural Bracket Type A',     sku: 'PROD-BP-002', category: 'Finished Goods', type: 'Manufactured', sellPrice: 210.00,  costPrice: 145.00, hasBOM: true,  status: 'active' },
  { id: '3',  name: 'Aluminium Enclosure 600x400',   sku: 'PROD-AE-003', category: 'Finished Goods', type: 'Manufactured', sellPrice: 680.00,  costPrice: 420.00, hasBOM: true,  status: 'active' },
  { id: '4',  name: 'Rail Platform Guard',           sku: 'PROD-RPG-004',category: 'Finished Goods', type: 'Manufactured', sellPrice: 3200.00, costPrice: 2100.00,hasBOM: true,  status: 'active' },
  { id: '5',  name: 'Mild Steel Sheet 10mm',         sku: 'MAT-MS-001',  category: 'Raw Materials',  type: 'Purchased',    sellPrice: 0,       costPrice: 185.00, hasBOM: false, status: 'active' },
  { id: '6',  name: 'RHS 50x25x2.5 Section',        sku: 'MAT-RHS-001', category: 'Raw Materials',  type: 'Purchased',    sellPrice: 0,       costPrice: 12.80,  hasBOM: false, status: 'active' },
  { id: '7',  name: 'Aluminium Plate 5052',          sku: 'MAT-AL-001',  category: 'Raw Materials',  type: 'Purchased',    sellPrice: 0,       costPrice: 34.20,  hasBOM: false, status: 'active' },
  { id: '8',  name: 'Welding Wire ER70S-6',          sku: 'CONS-WR-001', category: 'Consumables',    type: 'Purchased',    sellPrice: 0,       costPrice: 92.00,  hasBOM: false, status: 'active' },
  { id: '9',  name: 'Hardware Kit M10 SS',           sku: 'CONS-HW-001', category: 'Consumables',    type: 'Purchased',    sellPrice: 0,       costPrice: 8.40,   hasBOM: false, status: 'active' },
  { id: '10', name: 'Powder Coat Paint RAL 7035',    sku: 'CONS-PC-001', category: 'Consumables',    type: 'Purchased',    sellPrice: 0,       costPrice: 11.00,  hasBOM: false, status: 'active' },
  { id: '11', name: 'Machine Guard — Discontinued',  sku: 'PROD-MG-OLD', category: 'Finished Goods', type: 'Manufactured', sellPrice: 480.00,  costPrice: 310.00, hasBOM: false, status: 'inactive' },
];

const CATEGORIES = ['All', 'Finished Goods', 'Raw Materials', 'Consumables'];
const TYPES      = ['All', 'Manufactured', 'Purchased'];

export function ControlProducts() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [type,     setType]     = useState('All');

  const filtered = PRODUCTS.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    const matchType     = type === 'All'     || p.type === type;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Product master</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {PRODUCTS.filter(p => p.status === 'active').length} active products
          </p>
        </div>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] gap-2" onClick={() => toast('New product coming soon')}>
          <Plus className="w-4 h-4" /> New product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
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
          <SelectTrigger className="h-10 border-[var(--border)] w-44 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-10 border-[var(--border)] w-40 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Product</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Category</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Type</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Cost</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">Sell</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] uppercase font-medium">BOM</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={cn('border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors', p.status === 'inactive' && 'opacity-60')}>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
                    <span className="text-sm text-[var(--mw-mirage)] font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 text-xs  text-[var(--neutral-500)]">{p.sku}</td>
                <td className="px-4">
                  <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs">{p.category}</Badge>
                </td>
                <td className="px-4">
                  <div className="flex justify-center">
                    <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5',
                      p.type === 'Manufactured' ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]' : 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]'
                    )}>
                      {p.type}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 text-right text-sm  font-medium text-[var(--mw-mirage)]">
                  {p.costPrice > 0 ? `$${p.costPrice.toFixed(2)}` : '—'}
                </td>
                <td className="px-4 text-right text-sm  font-medium text-[var(--mw-mirage)]">
                  {p.sellPrice > 0 ? `$${p.sellPrice.toFixed(2)}` : '—'}
                </td>
                <td className="px-4">
                  <div className="flex justify-center">
                    {p.hasBOM
                      ? <Badge className="bg-[var(--neutral-100)] text-[var(--mw-mirage)] border-0 text-xs rounded-full px-2 py-0.5">Yes</Badge>
                      : <span className="text-xs text-[var(--neutral-400)]">—</span>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState variant="inline" title="No products match your filters." />
        )}
      </Card>
    </motion.div>
  );
}
