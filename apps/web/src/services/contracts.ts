import type { bookService } from './bookService';
import type { bridgeService } from './bridgeService';
import type { buyService } from './buyService';
import type { controlService } from './controlService';
import type { makeService } from './makeService';
import type { planService } from './planService';
import type { sellService } from './sellService';
import type { shipService } from './shipService';

export type DataSource = 'mock' | 'remote';

export type SellService = typeof sellService;
export type BuyService = typeof buyService;
export type PlanService = typeof planService;
export type MakeService = typeof makeService;
export type ShipService = typeof shipService;
export type BookService = typeof bookService;
export type ControlService = typeof controlService;
export type BridgeImportAdapter = typeof bridgeService;

export interface ServiceRegistry {
  sell: SellService;
  buy: BuyService;
  plan: PlanService;
  make: MakeService;
  ship: ShipService;
  book: BookService;
  control: ControlService;
  bridge: BridgeImportAdapter;
}
