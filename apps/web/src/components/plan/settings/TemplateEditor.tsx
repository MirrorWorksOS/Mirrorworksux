/**
 * TemplateEditor — inline card for creating/editing a JobActivityTemplate.
 * Sits inside TemplatesPanel. Local draft state until the user clicks Save.
 *
 * Activities are rendered as a vertical list of expandable rows: collapsed
 * shows a one-line summary, expanded reveals all fields (type, title,
 * description, anchor (stage|offset), estimate, priority, blocksNext).
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  ChevronUp as ArrowUp,
  ChevronDown as ArrowDown,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionLabel } from '@/components/shared/settings/ModuleSettingsLayout';
import { cn } from '@/components/ui/utils';

import { useJobActivityStore } from '@/store/jobActivityStore';
import {
  CANONICAL_JOB_ACTIVITY_TYPES,
  CANONICAL_TYPE_LABELS,
  iconForName,
  resolveActivityType,
} from '../plan-activity-shared';
import type {
  CanonicalJobActivityType,
  JobActivityPriority,
  JobActivityTemplate,
  JobActivityType,
  ProductKind,
  TemplateActivity,
} from '@/types/job-activity';

const PRODUCT_KIND_OPTIONS: ProductKind[] = ['widget', 'configurable', 'mixed'];

const STAGE_OPTIONS: Array<NonNullable<TemplateActivity['anchorStage']>> = [
  'planning',
  'materials',
  'scheduled',
  'in-production',
  'review-close',
];

const STAGE_LABELS: Record<NonNullable<TemplateActivity['anchorStage']>, string> = {
  planning: 'Planning',
  materials: 'Materials',
  scheduled: 'Scheduled',
  'in-production': 'In production',
  'review-close': 'Review & close',
};

const PRIORITY_OPTIONS: JobActivityPriority[] = ['low', 'med', 'high'];
const PRIORITY_LABELS: Record<JobActivityPriority, string> = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
};

interface TemplateEditorProps {
  /** Existing template id for edit mode. Omit for new-template mode. */
  templateId?: string;
  onClose: () => void;
}

interface Draft {
  name: string;
  description: string;
  productKinds: ProductKind[];
  activities: TemplateActivity[];
}

const blankActivity: TemplateActivity = {
  type: 'task',
  title: 'New activity',
  description: '',
  anchorStage: 'planning',
  estimatedMinutes: 30,
  priority: 'med',
  blocksNext: false,
};

export function TemplateEditor({ templateId, onClose }: TemplateEditorProps) {
  const templates = useJobActivityStore((s) => s.templates);
  const customTypes = useJobActivityStore((s) => s.customActivityTypes);
  const addTemplate = useJobActivityStore((s) => s.addTemplate);
  const updateTemplate = useJobActivityStore((s) => s.updateTemplate);

  const existing = templateId
    ? templates.find((t) => t.id === templateId)
    : undefined;

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? {
          name: existing.name,
          description: existing.description,
          productKinds: [...existing.productKinds],
          activities: existing.activities.map((a) => ({ ...a })),
        }
      : {
          name: '',
          description: '',
          productKinds: ['configurable'],
          activities: [],
        },
  );

  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const toggleProductKind = (k: ProductKind) => {
    setDraft((d) =>
      d.productKinds.includes(k)
        ? { ...d, productKinds: d.productKinds.filter((x) => x !== k) }
        : { ...d, productKinds: [...d.productKinds, k] },
    );
  };

  const updateActivity = (idx: number, patch: Partial<TemplateActivity>) => {
    setDraft((d) => ({
      ...d,
      activities: d.activities.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));
  };

  const moveActivity = (idx: number, dir: -1 | 1) => {
    setDraft((d) => {
      const target = idx + dir;
      if (target < 0 || target >= d.activities.length) return d;
      const next = [...d.activities];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...d, activities: next };
    });
    if (expandedIdx === idx) setExpandedIdx(idx + dir);
  };

  const removeActivity = (idx: number) => {
    setDraft((d) => ({ ...d, activities: d.activities.filter((_, i) => i !== idx) }));
    if (expandedIdx === idx) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
  };

  const addActivity = () => {
    setDraft((d) => ({ ...d, activities: [...d.activities, { ...blankActivity }] }));
    setExpandedIdx(draft.activities.length);
  };

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error('Add a template name');
      return;
    }
    if (draft.productKinds.length === 0) {
      toast.error('Pick at least one product kind');
      return;
    }
    if (draft.activities.length === 0) {
      toast.error('Add at least one activity');
      return;
    }
    if (templateId) {
      updateTemplate(templateId, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        productKinds: draft.productKinds,
        activities: draft.activities,
      });
      toast.success('Template updated');
    } else {
      addTemplate({
        name: draft.name.trim(),
        description: draft.description.trim(),
        productKinds: draft.productKinds,
        activities: draft.activities,
      });
      toast.success('Template created');
    }
    onClose();
  };

  const typeOptions: JobActivityType[] = [
    ...CANONICAL_JOB_ACTIVITY_TYPES,
    ...customTypes.map((t) => t.id),
  ];
  const customIconRegistry = Object.fromEntries(
    customTypes.map((t) => [t.iconName, iconForName(t.iconName)]),
  );

  return (
    <Card
      variant="flat"
      className="space-y-5 rounded-[var(--shape-lg)] border-[var(--mw-yellow-400)]/40 p-4"
    >
      <SectionLabel>{templateId ? 'Edit template' : 'New template'}</SectionLabel>

      <div className="grid gap-1.5">
        <Label htmlFor="tpl-name">
          Name <span className="text-[var(--mw-error)]">*</span>
        </Label>
        <Input
          id="tpl-name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="e.g. Configurable kit — full lifecycle"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tpl-desc">Description</Label>
        <Textarea
          id="tpl-desc"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={2}
          placeholder="When to use this template…"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>
          Product kinds <span className="text-[var(--mw-error)]">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_KIND_OPTIONS.map((k) => {
            const active = draft.productKinds.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleProductKind(k)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  active
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground'
                    : 'border-[var(--border)] bg-card text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] dark:text-neutral-400 dark:hover:bg-neutral-800',
                )}
                aria-pressed={active}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Activities</SectionLabel>
        <p className="mt-1 text-xs text-[var(--neutral-500)]">
          Ordered list of activities applied to the job. &ldquo;Blocks next&rdquo; chains the
          next activity behind this one via <code className="font-mono">blockedBy</code>.
        </p>

        <div className="mt-3 space-y-2">
          {draft.activities.length === 0 && (
            <p className="rounded-[var(--shape-md)] border border-dashed border-[var(--neutral-300)] py-6 text-center text-xs italic text-[var(--neutral-500)]">
              No activities yet. Add one to get started.
            </p>
          )}

          {draft.activities.map((a, idx) => {
            const meta = resolveActivityType(a.type, customTypes, customIconRegistry);
            const Icon = meta.icon;
            const expanded = expandedIdx === idx;
            const anchorSummary = a.anchorStage
              ? `stage ${STAGE_LABELS[a.anchorStage]}`
              : typeof a.offsetDaysFromStart === 'number'
                ? `+${a.offsetDaysFromStart}d from start`
                : 'no anchor';
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-[var(--shape-md)] border border-[var(--border)] bg-card"
              >
                <button
                  type="button"
                  onClick={() => setExpandedIdx(expanded ? null : idx)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--neutral-50)] dark:hover:bg-neutral-900/30"
                >
                  <span className="text-xs font-medium tabular-nums text-[var(--neutral-500)]">
                    {idx + 1}.
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${meta.colour} 22%, transparent)`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: meta.colour }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                    <p className="truncate text-[10px] text-[var(--neutral-500)]">
                      {meta.label} · {anchorSummary}
                      {a.estimatedMinutes ? ` · ${a.estimatedMinutes}m` : ''}
                      {a.priority ? ` · ${PRIORITY_LABELS[a.priority]}` : ''}
                      {a.blocksNext ? ' · blocks next' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => moveActivity(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveActivity(idx, 1)}
                      disabled={idx === draft.activities.length - 1}
                      className="rounded p-1 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeActivity(idx)}
                      className="rounded p-1 text-[var(--mw-error)] hover:bg-[var(--mw-error-light,_#FEE2E2)]"
                      aria-label="Delete activity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 text-[var(--neutral-500)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--neutral-500)]" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="space-y-3 border-t border-[var(--neutral-100)] bg-[var(--neutral-50)]/40 px-3 py-3 dark:bg-neutral-900/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={a.type}
                          onValueChange={(v) => updateActivity(idx, { type: v as JobActivityType })}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((t) => {
                              const m = resolveActivityType(t, customTypes, customIconRegistry);
                              const I = m.icon;
                              return (
                                <SelectItem key={t} value={t}>
                                  <span className="inline-flex items-center gap-2">
                                    <I className="h-3.5 w-3.5" style={{ color: m.colour }} />
                                    {m.label}
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-xs">Priority</Label>
                        <Select
                          value={a.priority ?? 'med'}
                          onValueChange={(v) =>
                            updateActivity(idx, { priority: v as JobActivityPriority })
                          }
                        >
                          <SelectTrigger size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {PRIORITY_LABELS[p]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={a.title}
                        onChange={(e) => updateActivity(idx, { title: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={a.description ?? ''}
                        onChange={(e) => updateActivity(idx, { description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">Anchor</Label>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs">
                          <input
                            type="radio"
                            name={`anchor-${idx}`}
                            checked={a.anchorStage !== undefined}
                            onChange={() =>
                              updateActivity(idx, {
                                anchorStage: a.anchorStage ?? 'planning',
                                offsetDaysFromStart: undefined,
                              })
                            }
                          />
                          By stage
                        </label>
                        <Select
                          value={a.anchorStage ?? 'planning'}
                          onValueChange={(v) =>
                            updateActivity(idx, {
                              anchorStage: v as TemplateActivity['anchorStage'],
                              offsetDaysFromStart: undefined,
                            })
                          }
                          disabled={a.anchorStage === undefined}
                        >
                          <SelectTrigger size="sm" className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGE_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {STAGE_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="mx-1 text-[10px] text-[var(--neutral-400)]">or</span>

                        <label className="inline-flex items-center gap-1.5 text-xs">
                          <input
                            type="radio"
                            name={`anchor-${idx}`}
                            checked={a.offsetDaysFromStart !== undefined}
                            onChange={() =>
                              updateActivity(idx, {
                                offsetDaysFromStart: a.offsetDaysFromStart ?? 0,
                                anchorStage: undefined,
                              })
                            }
                          />
                          Offset
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={a.offsetDaysFromStart ?? ''}
                          disabled={a.offsetDaysFromStart === undefined}
                          onChange={(e) =>
                            updateActivity(idx, {
                              offsetDaysFromStart: Number(e.target.value),
                              anchorStage: undefined,
                            })
                          }
                          className="h-8 w-20"
                        />
                        <span className="text-xs text-[var(--neutral-500)]">days from start</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Estimated minutes</Label>
                        <Input
                          type="number"
                          min={0}
                          value={a.estimatedMinutes ?? ''}
                          onChange={(e) =>
                            updateActivity(idx, {
                              estimatedMinutes: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Switch
                          id={`blocks-${idx}`}
                          checked={!!a.blocksNext}
                          onCheckedChange={(v) => updateActivity(idx, { blocksNext: v })}
                        />
                        <Label htmlFor={`blocks-${idx}`} className="text-xs">
                          Blocks the next activity (sets <code className="font-mono">blockedBy</code> chain)
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={addActivity}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add activity
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--neutral-100)] pt-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]"
          onClick={handleSave}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {templateId ? 'Save changes' : 'Create template'}
        </Button>
      </div>
    </Card>
  );
}
