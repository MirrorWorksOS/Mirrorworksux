/**
 * Make Product Detail — thin wrapper around shared ProductDetail
 * Passes module="make" for context-aware breadcrumbs and actions
 */
import { ProductDetail } from '@/components/shared/product/ProductDetail';

export function MakeProductDetail() {
  return <ProductDetail module="make" />;
}
