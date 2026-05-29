/**
 * Compact badge showing the fulfilment route (MTO / ETO / Catalogue / MTS).
 * Colour-coded to match the Figma workflow board.
 */
import { Badge } from '@/components/ui/badge';
import type { ProductRoute } from '@/types/entities';

const ROUTE_META: Record<
  ProductRoute,
  { label: string; className: string; description: string }
> = {
  mto: {
    label: 'MTO',
    className: 'bg-blue-100 text-blue-900 hover:bg-blue-100',
    description: 'Make-to-Order — full Plan → Make path',
  },
  eto: {
    label: 'ETO',
    className: 'bg-purple-100 text-purple-900 hover:bg-purple-100',
    description: 'Engineer-to-Order — engineering Job first',
  },
  catalogue_sale: {
    label: 'Catalogue',
    className: 'bg-green-100 text-green-900 hover:bg-green-100',
    description: 'Catalogue Sale — stocked pick, fast path',
  },
  make_to_stock: {
    label: 'MTS',
    className: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
    description: 'Make-to-Stock — replenishment item',
  },
};

export interface RouteChipProps {
  route: ProductRoute;
  size?: 'sm' | 'md';
}

export function RouteChip({ route, size = 'md' }: RouteChipProps) {
  const meta = ROUTE_META[route];
  return (
    <Badge
      variant="secondary"
      title={meta.description}
      className={`${meta.className} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}`}
    >
      {meta.label}
    </Badge>
  );
}
