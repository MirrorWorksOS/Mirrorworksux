import type {
  BookService,
  BridgeImportAdapter,
  BuyService,
  ControlService,
  MakeService,
  PlanService,
  SellService,
  ServiceRegistry,
  ShipService,
} from './contracts';

function createRemotePlaceholder<T extends object>(serviceName: string): T {
  return new Proxy(
    {},
    {
      get(_target, property) {
        return async () => {
          throw new Error(
            `Remote adapter "${serviceName}.${String(property)}" is not configured yet.`,
          );
        };
      },
    },
  ) as T;
}

export const remoteServices: ServiceRegistry = {
  sell: createRemotePlaceholder<SellService>('sell'),
  buy: createRemotePlaceholder<BuyService>('buy'),
  plan: createRemotePlaceholder<PlanService>('plan'),
  make: createRemotePlaceholder<MakeService>('make'),
  ship: createRemotePlaceholder<ShipService>('ship'),
  book: createRemotePlaceholder<BookService>('book'),
  control: createRemotePlaceholder<ControlService>('control'),
  bridge: createRemotePlaceholder<BridgeImportAdapter>('bridge'),
};
