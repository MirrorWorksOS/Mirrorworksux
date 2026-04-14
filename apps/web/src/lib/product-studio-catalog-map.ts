/**
 * Maps Plan / Control catalogue product ids to Product Studio stable template ids
 * (see product-templates.ts: tpl-shelving, tpl-bracket, tpl-frame).
 */
const CATALOG_TO_STUDIO_PRODUCT_ID: Record<string, string> = {
  '1': 'tpl-shelving',
  '2': 'tpl-bracket',
  '4': 'tpl-frame',
};

export function studioProductIdForCatalogId(
  catalogProductId: string | undefined,
): string | null {
  if (!catalogProductId) return null;
  return CATALOG_TO_STUDIO_PRODUCT_ID[catalogProductId] ?? null;
}
