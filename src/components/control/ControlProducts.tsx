/**
 * Control Products — product master data catalogue
 */
import React, { useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

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
      variants={animationVariants.stagger}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Product master</h1>
          <p className="text-sm text-[#737373] mt-1">
            {PRODUCTS.filter(p => p.status === 'active').length} active products
          </p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2">
          <Plus className="w-4 h-4" /> New product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-xl text-sm"
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

      <Card className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">Product</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">Category</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] uppercase font-medium">Type</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] uppercase font-medium">Cost</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] uppercase font-medium">Sell</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] uppercase font-medium">BOM</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={cn('border-b border-[#F5F5F5] h-14 hover:bg-[var(--accent)] cursor-pointer transition-colors', p.status === 'inactive' && 'opacity-60')}>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#A3A3A3] shrink-0" />
                    <span className="text-sm text-[#1A2732] font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 text-xs  text-[#737373]">{p.sku}</td>
                <td className="px-4">
                  <Badge className="bg-[#F5F5F5] text-[#737373] border-0 text-xs">{p.category}</Badge>
                </td>
                <td className="px-4">
                  <div className="flex justify-center">
                    <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5',
                      p.type === 'Manufactured' ? 'bg-[var(--warm-200)] text-[#1A2732]' : 'bg-[var(--warm-200)] text-[#1A2732]'
                    )}>
                      {p.type}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 text-right text-sm  font-medium text-[#1A2732]">
                  {p.costPrice > 0 ? `$${p.costPrice.toFixed(2)}` : '—'}
                </td>
                <td className="px-4 text-right text-sm  font-medium text-[#1A2732]">
                  {p.sellPrice > 0 ? `$${p.sellPrice.toFixed(2)}` : '—'}
                </td>
                <td className="px-4">
                  <div className="flex justify-center">
                    {p.hasBOM
                      ? <Badge className="bg-[var(--warm-200)] text-[#1A2732] border-0 text-xs rounded-full px-2 py-0.5">Yes</Badge>
                      : <span className="text-xs text-[#A3A3A3]">—</span>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#737373] text-sm">No products match your filters.</div>
        )}
      </Card>
    </motion.div>
  );
}
