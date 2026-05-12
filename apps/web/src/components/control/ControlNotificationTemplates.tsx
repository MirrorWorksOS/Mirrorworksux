/**
 * ControlNotificationTemplates — Email templates that fire on customer
 * events (quote sent, order shipped, invoice issued…). Per-customer
 * notification preferences (which template a specific customer receives)
 * are managed in Sell → CRM, not here.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Send, Mail, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { notificationTemplates as seedTemplates } from '@/services';
import type { NotificationTemplate } from '@/types/entities';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { EditableCard } from '@/components/shared/forms/EditableCard';
import { EditField, EditTextarea, Field } from '@/components/shared/forms/EditField';
import { cn } from '@/components/ui/utils';
import { AccessGate } from '@/components/shared/access/AccessGate';

export function ControlNotificationTemplates() {
  return (
    <AccessGate
      role="admin"
      label="Notification templates"
      asPage
      pageTitle="Notification templates"
    >
      <ControlNotificationTemplatesInner />
    </AccessGate>
  );
}

function ControlNotificationTemplatesInner() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(() => [...seedTemplates]);
  const [selectedId, setSelectedId] = useState<string>(seedTemplates[0]?.id ?? '');

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );

  // Draft state for the edit form
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');

  // Reset draft whenever the selected template changes
  const resetDraft = (t: NotificationTemplate | null) => {
    setDraftSubject(t?.subject ?? '');
    setDraftBody(t?.bodyMd ?? '');
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const t = templates.find((x) => x.id === id) ?? null;
    resetDraft(t);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, enabled } : t)));
    toast.success(`${enabled ? 'Enabled' : 'Disabled'} template`);
  };

  const handleSave = () => {
    if (!selected) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selected.id ? { ...t, subject: draftSubject, bodyMd: draftBody } : t,
      ),
    );
  };

  const handleSendTest = () => {
    toast.info('Resend integration coming soon');
  };

  return (
    <PageShell>
      <PageHeader
        title="Notification templates"
        subtitle={
          <>
            Templates fire when the matching event occurs. Customer notification
            preferences in{' '}
            <Link
              to="/sell/crm"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              CRM
            </Link>{' '}
            control which templates a specific customer receives.
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* ── Left: template list ─────────────────────────────────── */}
        <Card className="p-2">
          <ul className="flex flex-col">
            {templates.map((t) => {
              const isActive = t.id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(t.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[var(--shape-md)] px-3 py-3 text-left transition-colors',
                      isActive
                        ? 'bg-[var(--neutral-100)]'
                        : 'hover:bg-[var(--neutral-50)]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-md)]',
                        t.enabled
                          ? 'bg-[var(--mw-yellow-100)] text-[var(--mw-yellow-900)]'
                          : 'bg-[var(--neutral-100)] text-[var(--neutral-400)]',
                      )}
                    >
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                      <p className="truncate text-xs text-[var(--neutral-500)]">
                        {t.kind.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Switch
                      checked={t.enabled}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={(v) => handleToggle(t.id, Boolean(v))}
                      aria-label={`Toggle ${t.name}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* ── Right: preview / edit panel ─────────────────────────── */}
        {selected ? (
          <div className="space-y-4">
            <EditableCard
              key={selected.id}
              title={selected.name}
              subtitle={`Triggers on event: ${selected.kind}`}
              headerExtra={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 px-3 text-xs"
                  onClick={handleSendTest}
                >
                  <Send className="h-3.5 w-3.5" /> Send test
                </Button>
              }
              onSave={handleSave}
              onCancel={() => resetDraft(selected)}
              successMessage="Template saved"
            >
              {({ mode }) =>
                mode === 'edit' ? (
                  <div className="space-y-4">
                    <EditField
                      label="Subject"
                      value={draftSubject}
                      onChange={setDraftSubject}
                      placeholder="Your quote {{ref}} from Alliance Metal"
                    />
                    <EditTextarea
                      label="Body (markdown supported)"
                      value={draftBody}
                      onChange={setDraftBody}
                      rows={12}
                    />
                    <p className="text-xs text-[var(--neutral-500)]">
                      Placeholders: <code>{`{{customer}}`}</code>, <code>{`{{ref}}`}</code>,{' '}
                      <code>{`{{total}}`}</code>, <code>{`{{dueDate}}`}</code>,{' '}
                      <code>{`{{carrier}}`}</code>, <code>{`{{tracking}}`}</code>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Field label="Subject" value={selected.subject} />
                    <div>
                      <span className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
                        Body preview
                      </span>
                      <div className="rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                          {selected.bodyMd}
                        </pre>
                      </div>
                    </div>
                  </div>
                )
              }
            </EditableCard>

            <Card className="p-4 text-xs text-[var(--neutral-500)]">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>
                  Manage which customers receive this template in{' '}
                  <Link to="/sell/crm" className="font-medium text-foreground underline-offset-2 hover:underline">
                    Sell → CRM → Notifications
                  </Link>
                  .
                </span>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center p-12 text-sm text-[var(--neutral-500)]">
            Select a template on the left.
          </Card>
        )}
      </div>
    </PageShell>
  );
}
