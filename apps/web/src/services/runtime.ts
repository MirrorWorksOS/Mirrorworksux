import { bookService } from './bookService';
import { bridgeService } from './bridgeService';
import { buyService } from './buyService';
import type { DataSource, ServiceRegistry } from './contracts';
import { controlService } from './controlService';
import { makeService } from './makeService';
import { planService } from './planService';
import { remoteServices } from './remote';
import { sellService } from './sellService';
import { shipService } from './shipService';

export const mockServices: ServiceRegistry = {
  sell: sellService,
  buy: buyService,
  plan: planService,
  make: makeService,
  ship: shipService,
  book: bookService,
  control: controlService,
  bridge: bridgeService,
};

export const activeDataSource: DataSource =
  import.meta.env.VITE_DATA_SOURCE === 'remote' ? 'remote' : 'mock';

export const services: ServiceRegistry =
  activeDataSource === 'remote' ? remoteServices : mockServices;
