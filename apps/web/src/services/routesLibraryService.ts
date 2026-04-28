/**
 * Routes Library service — named templates of standard operations defined
 * in Control → Routes. A planner can "Apply route" to a part to bulk-insert
 * the route's ops in order, instead of picking one at a time.
 *
 * Each step references a StandardOperation by id (operationsLibraryService).
 */

import { operationsLibraryService, type StandardOperation } from './operationsLibraryService';

export interface RouteStep {
  /** id of a StandardOperation. */
  operationId: string;
  /** Optional override of the standard op's default minutes. */
  minutesOverride?: number;
}

export interface StandardRoute {
  id: string;
  name: string;
  description?: string;
  /** Free-text grouping (e.g. "Sheet metal", "Machined parts"). */
  category?: string;
  steps: RouteStep[];
}

const ROUTES: StandardRoute[] = [
  {
    id: 'route-sheet-standard',
    name: 'Standard sheet-metal',
    category: 'Sheet metal',
    description: 'Laser cut → deburr → bend → powder coat → inspect',
    steps: [
      { operationId: 'std-op-laser' },
      { operationId: 'std-op-deburr' },
      { operationId: 'std-op-bend' },
      { operationId: 'std-op-powder' },
      { operationId: 'std-op-inspect' },
    ],
  },
  {
    id: 'route-sheet-painted',
    name: 'Sheet-metal with paint',
    category: 'Sheet metal',
    description: 'Laser cut → deburr → bend → weld → blast → paint → inspect',
    steps: [
      { operationId: 'std-op-laser' },
      { operationId: 'std-op-deburr' },
      { operationId: 'std-op-bend' },
      { operationId: 'std-op-weld' },
      { operationId: 'std-op-sand' },
      { operationId: 'std-op-paint' },
      { operationId: 'std-op-inspect' },
    ],
  },
  {
    id: 'route-machined-shaft',
    name: 'Machined shaft',
    category: 'Machined parts',
    description: 'Saw → turn → mill → grind → inspect',
    steps: [
      { operationId: 'std-op-saw' },
      { operationId: 'std-op-turn' },
      { operationId: 'std-op-mill' },
      { operationId: 'std-op-grind' },
      { operationId: 'std-op-inspect' },
    ],
  },
  {
    id: 'route-weldment',
    name: 'Weldment',
    category: 'Fabrication',
    description: 'Laser cut → bend → weld → blast → powder coat → CMM',
    steps: [
      { operationId: 'std-op-laser' },
      { operationId: 'std-op-bend' },
      { operationId: 'std-op-weld' },
      { operationId: 'std-op-sand' },
      { operationId: 'std-op-powder' },
      { operationId: 'std-op-cmm' },
    ],
  },
  {
    id: 'route-hardened-gear',
    name: 'Hardened gear',
    category: 'Gears',
    description: 'Saw → rough turn → hob → deburr → heat treat → finish grind → CMM',
    steps: [
      { operationId: 'std-op-saw' },
      { operationId: 'std-op-turn' },
      { operationId: 'std-op-mill' },
      { operationId: 'std-op-deburr' },
      { operationId: 'std-op-heat' },
      { operationId: 'std-op-grind' },
      { operationId: 'std-op-cmm' },
    ],
  },
];

export interface ResolvedRouteStep {
  operation: StandardOperation;
  minutesOverride?: number;
}

export const routesLibraryService = {
  list(): StandardRoute[] {
    return [...ROUTES];
  },
  byId(id: string): StandardRoute | undefined {
    return ROUTES.find((r) => r.id === id);
  },
  resolve(route: StandardRoute): ResolvedRouteStep[] {
    return route.steps.flatMap((step) => {
      const op = operationsLibraryService.byId(step.operationId);
      if (!op) return [];
      const resolved: ResolvedRouteStep = { operation: op };
      if (step.minutesOverride !== undefined) resolved.minutesOverride = step.minutesOverride;
      return [resolved];
    });
  },
};
