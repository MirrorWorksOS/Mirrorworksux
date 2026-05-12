/**
 * ControlLegalTemplates — Legal / finance text templates (T&Cs, payment
 * details, customer-visible notes). Default templates are auto-attached
 * to new quotes and orders of the matching kind.
 */

import { useMemo, useState } from 'react';
import { FileText, Star } from 'lucide-react';
import { toast } from 'sonner';

import { legalTemplates as seedTemplates } from '@/services';
import type { LegalTemplate } from '@/types/entities';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EditableCard } from '@/components/shared/forms/EditableCard';
import { EditField, EditTextarea, Field } from '@/components/shared/forms/EditField';
import { cn } from '@/components/ui/utils';
import { AccessGate } from '@/components/shared/access/AccessGate';

const KIND_GROUPS: { kind: LegalTemplate['kind']; label: string }[] = [
  { kind: 'terms_and_conditions', label: 'Terms & Conditions' },
  { kind: 'payment_details', label: 'Payment details' },
  { kind: 'quote_notes', label: 'Quote notes' },
  { kind: 'order_notes', label: 'Order notes' },
];

export function ControlLegalTemplates() {
  return (
    <AccessGate
      role="admin"
      label="Legal templates"
      asPage
      pageTitle="Legal templates"
    >
      <ControlLegalTemplatesInner />
    </AccessGate>
  );
}

function ControlLegalTemplatesInner() {
  const [templates, setTemplates] = useState<LegalTemplate[]>(() => [...seedTemplates]);
  const [selectedId, setSelectedId] = useState<string>(seedTemplates[0]?.id ?? '');

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );

  const [draftName, setDraftName] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftIsDefault, setDraftIsDefault] = useState(false);

  const resetDraft = (t: LegalTemplate | null) => {
    setDraftName(t?.name ?? '');
    setDraftBody(t?.body ?? '');
    setDraftIsDefault(t?.isDefault ?? false);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const t = templates.find((x) => x.id === id) ?? null;
    resetDraft(t);
  };

  const handleSave = () => {
    if (!selected) return;
    setTemplates((prev) => {
      const next = prev.map((t) =>
        t.id === selected.id
          ? { ...t, name: draftName, body: draftBody, isDefault: draftIsDefault }
          : t,
      );
      // Ensure at most one default per kind
      if (draftIsDefault) {
        return next.map((t) =>
          t.kind === selected.kind && t.id !== selected.id
            ? { ...t, isDefault: false }
            : t,
        );
      }
      return next;
    });
  };

  const grouped = useMemo(() => {
    return KIND_GROUPS.map((g) => ({
      ...g,
      items: templates.filter((t) => t.kind === g.kind),
    }));
  }, [templates]);

  return (
    <PageShell>
      <PageHeader
        title="Legal templates"
        subtitle="Default templates are auto-attached to new quotes and orders of the matching kind."
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* ── Left: grouped template list ─────────────────────────── */}
        <Card className="p-2">
          <ul className="flex flex-col gap-1">
            {grouped.map((group) => (
              <li key={group.kind}>
                <div className="px-2 pb-1 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--neutral-500)]">
                    {group.label}
                  </span>
                </div>
                {group.items.length === 0 && (
                  <p className="px-3 py-1 text-xs text-[var(--neutral-400)]">No templates.</p>
                )}
                <ul className="flex flex-col">
                  {group.items.map((t) => {
                    const isActive = t.id === selectedId;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(t.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-[var(--shape-md)] px-3 py-2.5 text-left transition-colors',
                            isActive
                              ? 'bg-[var(--neutral-100)]'
                              : 'hover:bg-[var(--neutral-50)]',
                          )}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--shape-sm)] bg-[var(--neutral-100)] text-[var(--neutral-500)]">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                            {t.name}
                          </span>
                          {t.isDefault && (
                            <Star
                              className="h-3.5 w-3.5 fill-[var(--mw-yellow-400)] text-[var(--mw-yellow-500)]"
                              aria-label="Default"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </Card>

        {/* ── Right: edit panel ───────────────────────────────────── */}
        {selected ? (
          <EditableCard
            key={selected.id}
            title={selected.name}
            subtitle={KIND_GROUPS.find((g) => g.kind === selected.kind)?.label}
            onSave={handleSave}
            onCancel={() => resetDraft(selected)}
            successMessage="Template saved"
          >
            {({ mode }) =>
              mode === 'edit' ? (
                <div className="space-y-4">
                  <EditField label="Name" value={draftName} onChange={setDraftName} required />
                  <EditTextarea
                    label="Body"
                    value={draftBody}
                    onChange={setDraftBody}
                    rows={12}
                  />
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={draftIsDefault}
                      onCheckedChange={(v) => setDraftIsDefault(Boolean(v))}
                    />
                    Default for new {selected.kind.replace(/_/g, ' ')}
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Name" value={selected.name} />
                    <Field
                      label="Default"
                      value={selected.isDefault ? 'Yes' : 'No'}
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
                      Body
                    </span>
                    <div className="rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-4">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                        {selected.body}
                      </pre>
                    </div>
                  </div>
                </div>
              )
            }
          </EditableCard>
        ) : (
          <Card className="flex items-center justify-center p-12 text-sm text-[var(--neutral-500)]">
            Select a template on the left.
          </Card>
        )}
      </div>
    </PageShell>
  );
}
