/**
 * Buy Products - Product catalog filtered for procurement
 * Shows stock levels, reorder points, preferred suppliers
 */

import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorder: number;
  preferredSupplier: string;
}

import { products as centralProducts, suppliers } from '@/services';

const mockProducts: Product[] = centralProducts.slice(0, 3).map((p, i) => ({
  id: p.id,
  name: p.description,
  sku: p.partNumber,
  stock: [15, 8, 45][i],
  reorder: [20, 15, 50][i],
  preferredSupplier: suppliers[i]?.company ?? 'TBD',
}));

const productColumns: MwColumnDef<Product>[] = [
  {
    key: 'name',
    header: 'PRODUCT',
    cell: (row) => <span className="text-foreground">{row.name}</span>,
  },
  {
    key: 'sku',
    header: 'SKU',
    cell: (row) => <span className="text-[var(--neutral-600)]">{row.sku}</span>,
  },
  {
    key: 'stock',
    header: 'STOCK',
    headerClassName: 'text-right',
    className: 'text-right font-medium',
    cell: (row) => row.stock,
  },
  {
    key: 'reorder',
    header: 'REORDER',
    headerClassName: 'text-right',
    className: 'text-right text-[var(--neutral-500)]',
    cell: (row) => row.reorder,
  },
  {
    key: 'preferredSupplier',
    header: 'PREFERRED SUPPLIER',
    cell: (row) => <span className="text-[var(--neutral-600)]">{row.preferredSupplier}</span>,
  },
  {
    key: 'status',
    header: 'STATUS',
    headerClassName: 'text-center',
    cell: (row) => (
      <div className="flex items-center justify-center">
        {row.stock < row.reorder ? (
          <Badge variant="softAccent" className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Low Stock
          </Badge>
        ) : (
          <Badge className="bg-[var(--neutral-100)] text-foreground border-0">In Stock</Badge>
        )}
      </div>
    ),
  },
];

export function BuyProducts() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <PageHeader title="Products" />
      <MwDataTable<Product>
        columns={productColumns}
        data={mockProducts}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => navigate(`/buy/products/${row.id}`)}
        striped
      />
    </PageShell>
  );
}
