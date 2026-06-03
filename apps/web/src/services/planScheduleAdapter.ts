/**
 * Schedule Engine service adapter.
 *
 * The Schedule Engine screen (`/plan/schedule`) loads a snapshot at mount and
 * has no `'skip'`-style guard — so when `VITE_DATA_SOURCE=remote` and the
 * Convex adapter for these methods is still a stub, the screen hangs in
 * "Loading schedule…". This adapter mirrors the `REMOTE_MODE ? remote : mock`
 * pattern used by MirrorViewer: try remote, fall back to the mock service
 * (with a console warning) when the remote stub throws.
 *
 * Drop this file once `plan.getScheduleSnapshot`, `runAutoSchedule`,
 * `applySchedule`, and `discardProposal` are wired through to Convex.
 */
import { planService as mockPlanService } from './planService';
import { services } from './runtime';
import type {
  AutoScheduleRequest,
  AutoScheduleResult,
  ScheduleSnapshot,
} from '@/types/entities';

const REMOTE_MODE = import.meta.env.VITE_DATA_SOURCE === 'remote';

function isUnwiredAdapterError(e: unknown): boolean {
  return e instanceof Error && /is not configured yet/.test(e.message);
}

async function withMockFallback<T>(
  label: string,
  remote: () => Promise<T>,
  mock: () => Promise<T>,
): Promise<T> {
  if (!REMOTE_MODE) return mock();
  try {
    return await remote();
  } catch (e) {
    if (isUnwiredAdapterError(e)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[ScheduleEngine] plan.${label} remote adapter not wired yet — falling back to mock.`,
      );
      return mock();
    }
    throw e;
  }
}

export const planScheduleAdapter = {
  getScheduleSnapshot: (): Promise<ScheduleSnapshot> =>
    withMockFallback(
      'getScheduleSnapshot',
      () => services.plan.getScheduleSnapshot(),
      () => mockPlanService.getScheduleSnapshot(),
    ),

  runAutoSchedule: (req: AutoScheduleRequest): Promise<AutoScheduleResult> =>
    withMockFallback(
      'runAutoSchedule',
      () => services.plan.runAutoSchedule(req),
      () => mockPlanService.runAutoSchedule(req),
    ),

  applySchedule: (snapshotId: string): Promise<void> =>
    withMockFallback(
      'applySchedule',
      () => services.plan.applySchedule(snapshotId),
      () => mockPlanService.applySchedule(snapshotId),
    ),

  discardProposal: (): Promise<void> =>
    withMockFallback(
      'discardProposal',
      () => services.plan.discardProposal(),
      () => mockPlanService.discardProposal(),
    ),
};
