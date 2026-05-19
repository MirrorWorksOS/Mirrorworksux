/**
 * ActivityTypesPanel — Plan Settings section for managing user-defined
 * job-activity types. Custom types extend the canonical baseline (task,
 * setup, qc_check, etc.) with admin-defined label, icon, and colour.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionLabel } from '@/components/shared/settings/ModuleSettingsLayout';

import { useJobActivityStore } from '@/store/jobActivityStore';
import {
  CANONICAL_JOB_ACTIVITY_TYPES,
  CANONICAL_TYPE_COLOUR,
  CANONICAL_TYPE_ICON,
  CANONICAL_TYPE_LABELS,
  CUSTOM_TYPE_COLOUR_CHOICES,
  CUSTOM_TYPE_ICON_CHOICES,
  iconForName,
} from '../plan-activity-shared';
import type { CustomActivityType } from '@/types/job-activity';

interface DraftCustomType {
  id?: string;
  label: string;
  iconName: string;
  colour: string;
  description?: string;
}

export function ActivityTypesPanel() {
  const customTypes = useJobActivityStore((s) => s.customActivityTypes);
  const addCustom = useJobActivityStore((s) => s.addCustomActivityType);
  const updateCustom = useJobActivityStore((s) => s.updateCustomActivityType);
  const removeCustom = useJobActivityStore((s) => s.removeCustomActivityType);

  const [draft, setDraft] = useState<DraftCustomType | null>(null);

  const startNew = () =>
    setDraft({ label: '', iconName: 'Tag', colour: 'var(--mw-info)', description: '' });

  const startEdit = (t: CustomActivityType) =>
    setDraft({
      id: t.id,
      label: t.label,
      iconName: t.iconName,
      colour: t.colour,
      description: t.description ?? '',
    });

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.label.trim()) {
      toast.error('Add a label');
      return;
    }
    if (draft.id) {
      updateCustom(draft.id, {
        label: draft.label.trim(),
        iconName: draft.iconName,
        colour: draft.colour,
        description: draft.description?.trim() || undefined,
      });
      toast.success('Activity type updated');
    } else {
      addCustom({
        label: draft.label.trim(),
        iconName: draft.iconName,
        colour: draft.colour,
        description: draft.description?.trim() || undefined,
      });
      toast.success('Activity type created');
    }
    setDraft(null);
  };

  return (
    <div className="space-y-6">
      <SectionLabel>Canonical types</SectionLabel>
      <p className="-mt-3 text-sm text-[var(--neutral-500)]">
        Built-in activity types shipped with the product. Always available; not editable.
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {CANONICAL_JOB_ACTIVITY_TYPES.map((t) => {
          const Icon = CANONICAL_TYPE_ICON[t];
          return (
            <div
              key={t}
              className="flex items-center gap-2 rounded-[var(--shape-md)] border border-[var(--border)] bg-card px-3 py-2"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${CANONICAL_TYPE_COLOUR[t]} 22%, transparent)` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: CANONICAL_TYPE_COLOUR[t] }} />
              </span>
              <span className="truncate text-sm text-foreground">{CANONICAL_TYPE_LABELS[t]}</span>
            </div>
          );
        })}
      </div>

      <SectionLabel>Custom types</SectionLabel>
      <p className="-mt-3 text-sm text-[var(--neutral-500)]">
        Add types that match the way your workshop plans work. They flow through every activity
        surface — inbox, kanban, calendar, Gantt, and the "New activity" sheet.
      </p>

      {customTypes.length === 0 ? (
        <Card variant="flat" className="rounded-[var(--shape-lg)] border-dashed border-[var(--neutral-300)] p-6 text-center">
          <p className="text-sm text-[var(--neutral-500)]">
            No custom types yet. Add one to extend the canonical set.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {customTypes.map((t) => {
            const Icon = iconForName(t.iconName);
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-[var(--shape-md)] border border-[var(--border)] bg-card px-3 py-2"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${t.colour} 22%, transparent)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: t.colour }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{t.label}</p>
                    <Badge variant="outline" className="border-[var(--border)] text-[10px] tabular-nums">
                      {t.id}
                    </Badge>
                  </div>
                  {t.description && (
                    <p className="truncate text-xs text-[var(--neutral-500)]">{t.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="rounded p-1.5 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
                  aria-label="Edit type"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete custom type "${t.label}"?`)) {
                      removeCustom(t.id);
                      toast.success('Activity type removed');
                    }
                  }}
                  className="rounded p-1.5 text-[var(--mw-error)] hover:bg-[var(--mw-error-light,_#FEE2E2)]"
                  aria-label="Delete type"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {draft ? (
        <Card variant="flat" className="space-y-4 rounded-[var(--shape-lg)] border-[var(--mw-yellow-400)]/40 p-4">
          <SectionLabel>{draft.id ? 'Edit custom type' : 'New custom type'}</SectionLabel>

          <div className="grid gap-1.5">
            <Label htmlFor="cat-label">
              Label <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <Input
              id="cat-label"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. Tool change"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {CUSTOM_TYPE_ICON_CHOICES.map((opt) => {
                const Icon = opt.icon;
                const active = opt.name === draft.iconName;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setDraft({ ...draft, iconName: opt.name })}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                      active
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15'
                        : 'border-[var(--border)] hover:bg-[var(--neutral-50)] dark:hover:bg-neutral-800'
                    }`}
                    aria-pressed={active}
                    aria-label={opt.name}
                  >
                    <Icon className="h-4 w-4 text-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {CUSTOM_TYPE_COLOUR_CHOICES.map((opt) => {
                const active = opt.value === draft.colour;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setDraft({ ...draft, colour: opt.value })}
                    className={`flex h-9 items-center gap-2 rounded-full border px-3 transition-colors ${
                      active
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/10'
                        : 'border-[var(--border)] hover:bg-[var(--neutral-50)] dark:hover:bg-neutral-800'
                    }`}
                    aria-pressed={active}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: opt.value }} />
                    <span className="text-xs text-foreground">{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Input
              id="cat-desc"
              value={draft.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Optional context for this type"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]"
              onClick={saveDraft}
              disabled={!draft.label.trim()}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {draft.id ? 'Save changes' : 'Create type'}
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="outline" onClick={startNew}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add custom type
        </Button>
      )}
    </div>
  );
}
