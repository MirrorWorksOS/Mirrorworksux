/**
 * Job activity templates — declarative recipes applied to a job in one click.
 *
 * Phase-1 templates cover the two anchor patterns:
 *  - Configurable kit: full lifecycle with planning gates and QC bookends.
 *  - Widget: light-touch setup + first-off only.
 *
 * Templates are surfaced as auto-suggest on a Configurable job entering Planning,
 * or via "Apply template" on the job-scoped Activities tab. Never silent.
 */

import type { JobActivityTemplate } from '@/types/job-activity';

/**
 * Seed registry — loaded into `jobActivityStore.templates` at startup so the
 * recipes survive as the initial state, but every template (including these
 * seeds) becomes user-editable via the Plan Settings ▸ Templates panel.
 *
 * If you need the *live* registry at runtime use the store
 * (`useJobActivityStore.templates` or `selectTemplatesForProductKind`).
 */
export const JOB_ACTIVITY_TEMPLATE_SEEDS: JobActivityTemplate[] = [
  {
    id: 'tpl-configurable-full',
    name: 'Configurable kit — full lifecycle',
    description:
      'Planning gates, material check, setup, first-off and final QC. Use for jobs with multi-stage routing and customer sign-off.',
    productKinds: ['configurable', 'mixed'],
    activities: [
      {
        type: 'approval',
        title: 'Design review & lock',
        description: 'Confirm drawing revision and tolerances with engineering.',
        anchorStage: 'planning',
        estimatedMinutes: 45,
        priority: 'high',
        blocksNext: true,
      },
      {
        type: 'approval',
        title: 'BOM lock',
        description: 'Lock bill of materials. Triggers MRP propagation.',
        anchorStage: 'planning',
        estimatedMinutes: 30,
        priority: 'high',
        blocksNext: true,
      },
      {
        type: 'material_check',
        title: 'Materials staged for first operation',
        description: 'Verify steel + consumables are kitted and at the line.',
        anchorStage: 'materials',
        estimatedMinutes: 20,
        priority: 'med',
      },
      {
        type: 'setup',
        title: 'Laser / first-op machine setup',
        description: 'Tooling, program load, sheet alignment.',
        anchorStage: 'scheduled',
        estimatedMinutes: 45,
        priority: 'med',
      },
      {
        type: 'qc_check',
        title: 'First-off inspection',
        description: 'Verify first piece against drawing before run release.',
        anchorStage: 'in-production',
        estimatedMinutes: 25,
        priority: 'high',
        blocksNext: true,
      },
      {
        type: 'qc_check',
        title: 'Final QC sign-off',
        description: 'Dimensional check, finish inspection, paperwork.',
        anchorStage: 'review-close',
        estimatedMinutes: 30,
        priority: 'high',
      },
    ],
  },
  {
    id: 'tpl-widget-light',
    name: 'Widget — light',
    description:
      'Setup and first-off only. Use for repeatable widgets with established routing.',
    productKinds: ['widget', 'mixed'],
    activities: [
      {
        type: 'setup',
        title: 'Machine setup',
        anchorStage: 'scheduled',
        estimatedMinutes: 15,
        priority: 'med',
      },
      {
        type: 'qc_check',
        title: 'First-off',
        anchorStage: 'in-production',
        estimatedMinutes: 10,
        priority: 'med',
      },
    ],
  },
];

/**
 * @deprecated Reads from the static seed list — won't see admin edits.
 * Use `selectTemplatesForProductKind` from the store instead.
 */
export function templatesForProductKind(kind: 'widget' | 'configurable' | 'mixed' | undefined) {
  if (!kind) return [];
  return JOB_ACTIVITY_TEMPLATE_SEEDS.filter((t) => t.productKinds.includes(kind));
}
