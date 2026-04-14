/**
 * Buy Product Detail — thin wrapper around shared ProductDetail
 * Passes module="buy" for context-aware breadcrumbs and actions
 */
import { ProductDetail } from '@/components/shared/product/ProductDetail';

export function BuyProductDetail() {
  return <ProductDetail module="buy" />;
}
