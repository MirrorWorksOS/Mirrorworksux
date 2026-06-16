/**
 * Inline route selector for one Sales Order line. Defaults to "Use
 * product default" — overrides land in `SalesOrderLine.routeOverride`
 * via the passed `onChange`. Compact dropdown styled to fit a table cell.
 */
import type { ProductRoute } from '@/types/entities';
import { RouteChip } from './RouteChip';

const OPTIONS: { value: '' | ProductRoute; label: string }[] = [
  { value: '', label: 'Use product default' },
  { value: 'mto', label: 'MTO — Make-to-Order' },
  { value: 'stock_sale', label: 'Stock Sale — pick from stock' },
  { value: 'eto', label: 'ETO — Engineer-to-Order' },
];

export interface RouteOverrideSelectProps {
  defaultRoute: ProductRoute;
  routeOverride?: ProductRoute;
  onChange: (route: ProductRoute | undefined) => void;
  disabled?: boolean;
}

export function RouteOverrideSelect({
  defaultRoute,
  routeOverride,
  onChange,
  disabled,
}: RouteOverrideSelectProps) {
  const effective: ProductRoute = routeOverride ?? defaultRoute;
  return (
    <div className="flex items-center gap-2">
      <RouteChip route={effective} size="sm" />
      <select
        className="rounded border bg-card px-1.5 py-0.5 text-[11px]"
        value={routeOverride ?? ''}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : (v as ProductRoute));
        }}
        aria-label="Override fulfilment route for this line"
      >
        {OPTIONS.map((o) => (
          <option key={o.value || 'default'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
