/**
 * MakeShopFloor — Machine-first shop-floor landing page.
 *
 * This route is now the operator entry surface inside the main app shell:
 * one grid of machines, one tap to open the machine execution detail.
 */

import { ShopFloorPage } from './shop-floor/ShopFloorPage';

export function MakeShopFloor() {
  return <ShopFloorPage />;
}
