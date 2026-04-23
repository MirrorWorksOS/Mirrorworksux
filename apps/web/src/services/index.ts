export * from './contracts';
export * from './runtime';
export * from './mock';
export { runBridgeFileIngestPipeline } from './bridgeService';

// Portal + document services (added 2026-04-23 for P1 portal work)
export { portalAccessService } from './portalAccessService';
export {
  attachmentService,
  getQuotePdf,
  getSignedQuotePdf,
  getInvoicePdf,
  getDeliveryNotePdf,
} from './attachmentService';
export {
  subscriptionService,
  TIER_CATALOGUE,
  describeTier,
  type TierDescriptor,
} from './subscriptionService';
export { markupService, type ListMarkupOptions } from './markupService';
export { auditService } from './auditService';
export {
  operationsLibraryService,
  type StandardOperation,
} from './operationsLibraryService';
export {
  routesLibraryService,
  type StandardRoute,
  type RouteStep,
  type ResolvedRouteStep,
} from './routesLibraryService';

import { services } from './runtime';

export const sellService = services.sell;
export const buyService = services.buy;
export const planService = services.plan;
export const makeService = services.make;
export const shipService = services.ship;
export const bookService = services.book;
export const controlService = services.control;
export const bridgeService = services.bridge;
