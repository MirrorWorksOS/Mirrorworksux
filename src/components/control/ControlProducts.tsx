/**
 * Control Products — product master data catalogue
 */
import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FilterBar } from '@/components/shared/layout/FilterBar';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';


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

type Product = (typeof PRODUCTS)[number];

const CATEGORIES = ['All', 'Finished Goods', 'Raw Materials', 'Consumables'];
const TYPES      = ['All', 'Manufactured', 'Purchased'];

const productColumns: MwColumnDef<Product>[] = [
  {
    key: 'product', header: 'Product', tooltip: 'Product name',
    cell: (p) => (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
        <span className="text-sm text-foreground font-medium">{p.name}</span>
      </div>
    ),
  },
  { key: 'sku', header: 'SKU', tooltip: 'Stock-keeping unit code', cell: (p) => <span className="text-xs font-medium text-[var(--neutral-500)]">{p.sku}</span> },
  { key: 'category', header: 'Category', tooltip: 'Product category', cell: (p) => <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs">{p.category}</Badge> },
  {
    key: 'type', header: 'Type', headerClassName: 'text-center', tooltip: 'Manufactured or purchased',
    cell: (p) => (
      <div className="flex justify-center">
        <StatusBadge variant={p.type === 'Manufactured' ? 'accent' : 'neutral'}>
          {p.type}
        </StatusBadge>
      </div>
    ),
  },
  {
    key: 'cost', header: 'Cost', headerClassName: 'text-right', className: 'text-right tabular-nums', tooltip: 'Unit cost price',
    cell: (p) => <span className="text-sm font-medium text-foreground">{p.costPrice > 0 ? `$${p.costPrice.toFixed(2)}` : '\u2014'}</span>,
  },
  {
    key: 'sell', header: 'Sell', headerClassName: 'text-right', className: 'text-right tabular-nums', tooltip: 'Unit sell price',
    cell: (p) => <span className="text-sm font-medium text-foreground">{p.sellPrice > 0 ? `$${p.sellPrice.toFixed(2)}` : '\u2014'}</span>,
  },
  {
    key: 'bom', header: 'BOM', headerClassName: 'text-center', tooltip: 'Has a Bill of Materials',
    cell: (p) => (
      <div className="flex justify-center">
        {p.hasBOM
          ? <Badge className="bg-[var(--neutral-100)] text-foreground border-0 text-xs rounded-full px-2 py-0.5">Yes</Badge>
          : <span className="text-xs text-[var(--neutral-400)]">{'\u2014'}</span>
        }
      </div>
    ),
  },
];

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

  const activeCount = PRODUCTS.filter(p => p.status === 'active').length;
  const inactiveCount = PRODUCTS.filter(p => p.status === 'inactive').length;
  const manufacturedCount = PRODUCTS.filter(p => p.type === 'Manufactured').length;
  const purchasedCount = PRODUCTS.filter(p => p.type === 'Purchased').length;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-foreground">Product master</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">
            {activeCount} active products
          </p>
        </div>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2" onClick={() => toast('New product coming soon')}>
          <Plus className="w-4 h-4" /> New product
        </Button>
      </div>

      <ToolbarSummaryBar
        segments={[
          { key: 'active', label: 'Active', value: activeCount, color: 'var(--mw-yellow-400)' },
          { key: 'inactive', label: 'Inactive', value: inactiveCount, color: 'var(--neutral-400)' },
          { key: 'manufactured', label: 'Manufactured', value: manufacturedCount, color: 'var(--mw-mirage)' },
          { key: 'purchased', label: 'Purchased', value: purchasedCount, color: 'var(--neutral-200)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <MwDataTable<Product>
        columns={productColumns}
        data={filtered}
        keyExtractor={(p) => p.id}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        filterBar={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or SKU..."
            filters={
              <>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-44 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-40 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            }
          />
        }
        emptyState={<EmptyState variant="inline" title="No products match your filters." />}
      />
    </motion.div>
  );
}
