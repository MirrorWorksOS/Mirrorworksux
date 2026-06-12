import { bookService } from './bookService';
import { bridgeService } from './bridgeService';
import { buyService } from './buyService';
import type {
  BookService,
  BridgeImportAdapter,
  BuyService,
  ControlService,
  InventoryService,
  MakeService,
  PlanService,
  SellService,
  ServiceRegistry,
  ShipService,
} from './contracts';
import { controlService } from './controlService';
import { inventoryService } from './inventoryService';
import { makeService } from './makeService';
import { planService } from './planService';
import { sellService } from './sellService';
import { shipService } from './shipService';

const warnedMethods = new Set<string>();

/**
 * Remote service shim. Real remote adapters are plugged in per-service via
 * the `remoteImpl` argument; any method that is not implemented remotely
 * yet falls back to the mock service implementation (with a one-time
 * console.warn per service+method) instead of throwing, so production
 * builds shipped with VITE_DATA_SOURCE=remote keep working end to end.
 */
function createRemoteService<T extends object>(
  serviceName: string,
  mockFallback: T,
  remoteImpl: Partial<T> = {},
): T {
  return new Proxy(mockFallback, {
    get(target, property, receiver) {
      const remoteValue = Reflect.get(remoteImpl, property);
      if (remoteValue !== undefined) {
        return remoteValue;
      }
      const mockValue = Reflect.get(target, property, receiver);
      if (typeof mockValue === 'function' && typeof property === 'string') {
        const key = `${serviceName}.${property}`;
        if (!warnedMethods.has(key)) {
          warnedMethods.add(key);
          console.warn(
            `[mw] remote adapter not configured for ${key} — falling back to mock`,
          );
        }
        return mockValue.bind(target);
      }
      return mockValue;
    },
  }) as T;
}

export const remoteServices: ServiceRegistry = {
  sell: createRemoteService<SellService>('sell', sellService),
  buy: createRemoteService<BuyService>('buy', buyService),
  plan: createRemoteService<PlanService>('plan', planService),
  make: createRemoteService<MakeService>('make', makeService),
  ship: createRemoteService<ShipService>('ship', shipService),
  book: createRemoteService<BookService>('book', bookService),
  control: createRemoteService<ControlService>('control', controlService),
  bridge: createRemoteService<BridgeImportAdapter>('bridge', bridgeService),
  inventory: createRemoteService<InventoryService>('inventory', inventoryService),
};
