/**
 * Plan Product Detail — thin wrapper around shared ProductDetail
 * Passes module="plan" for context-aware breadcrumbs and actions
 */
import { ProductDetail } from '@/components/shared/product/ProductDetail';

export function PlanProductDetail() {
  return <ProductDetail module="plan" />;
}
