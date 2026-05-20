/**
 * TemplatesPanel — Plan Settings ▸ Templates. Lists every JobActivityTemplate
 * with edit / duplicate / delete actions, opens TemplateEditor inline. The
 * registry is sourced from `useJobActivityStore.templates` so admin edits
 * flow live into the job-detail Activities tab auto-suggest banner and the
 * Apply template dropdown.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Copy, Trash2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionLabel } from '@/components/shared/settings/ModuleSettingsLayout';

import { useJobActivityStore } from '@/store/jobActivityStore';
import { TemplateEditor } from './TemplateEditor';

export function TemplatesPanel() {
  const templates = useJobActivityStore((s) => s.templates);
  const duplicateTemplate = useJobActivityStore((s) => s.duplicateTemplate);
  const removeTemplate = useJobActivityStore((s) => s.removeTemplate);

  /** Either an existing template id (edit), the literal "new" (create), or null (closed). */
  const [editing, setEditing] = useState<string | 'new' | null>(null);

  const handleDuplicate = (id: string, name: string) => {
    const copy = duplicateTemplate(id);
    if (copy) {
      toast.success('Template duplicated', { description: `"${name}" → "${copy.name}"` });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete template "${name}"? Jobs that already used it keep their activities.`)) {
      removeTemplate(id);
      toast.success('Template removed');
      if (editing === id) setEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Templates</SectionLabel>
        <p className="-mt-3 text-sm text-[var(--neutral-500)]">
          Recipes admins can apply to a job in one click. Auto-suggest on the job Activities tab
          matches by product kind. The two shipped templates are user-editable starting points.
        </p>
      </div>

      {templates.length === 0 ? (
        <Card
          variant="flat"
          className="rounded-[var(--shape-lg)] border-dashed border-[var(--neutral-300)] p-6 text-center"
        >
          <p className="text-sm text-[var(--neutral-500)]">
            No templates defined. Create one to start auto-suggesting recipes for jobs.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => {
            const isEditing = editing === t.id;
            return (
              <div key={t.id} className="space-y-2">
                <div className="flex items-start gap-3 rounded-[var(--shape-md)] border border-[var(--border)] bg-card px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mw-yellow-400)]/15">
                    <Sparkles className="h-4 w-4 text-[var(--mw-yellow-700)] dark:text-yellow-300" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <Badge variant="outline" className="border-[var(--border)] text-[10px] tabular-nums">
                        {t.id}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="mt-1 text-xs text-[var(--neutral-500)] dark:text-neutral-400">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {t.productKinds.map((k) => (
                        <span
                          key={k}
                          className="inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] capitalize text-[var(--neutral-600)] dark:text-neutral-400"
                        >
                          {k}
                        </span>
                      ))}
                      <span className="text-[10px] tabular-nums text-[var(--neutral-500)]">
                        · {t.activities.length} {t.activities.length === 1 ? 'activity' : 'activities'}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(isEditing ? null : t.id)}
                      className={
                        'rounded p-1.5 transition-colors ' +
                        (isEditing
                          ? 'bg-[var(--mw-yellow-400)]/15 text-[var(--mw-yellow-700)]'
                          : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]')
                      }
                      aria-label={isEditing ? 'Close editor' : 'Edit template'}
                      title={isEditing ? 'Close editor' : 'Edit'}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(t.id, t.name)}
                      className="rounded p-1.5 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
                      aria-label="Duplicate template"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id, t.name)}
                      className="rounded p-1.5 text-[var(--mw-error)] hover:bg-[var(--mw-error-light,_#FEE2E2)]"
                      aria-label="Delete template"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <TemplateEditor templateId={t.id} onClose={() => setEditing(null)} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing === 'new' ? (
        <TemplateEditor onClose={() => setEditing(null)} />
      ) : (
        <Button variant="outline" onClick={() => setEditing('new')}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New template
        </Button>
      )}
    </div>
  );
}
