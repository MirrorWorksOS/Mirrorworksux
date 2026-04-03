/**
 * Sell Product Detail — thin wrapper around shared ProductDetail
 * Passes module="sell" for context-aware breadcrumbs and actions
 */
import { ProductDetail } from '@/components/shared/product/ProductDetail';

export function SellProductDetail() {
  return <ProductDetail module="sell" />;
}
