import { useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  Maximize2,
  Ruler,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/components/ui/utils';
import type {
  ExecutionReference,
  ReferenceView,
  WorkOrderExecutionSnapshot,
} from './types';

interface ReferenceWorkspaceProps {
  snapshot: WorkOrderExecutionSnapshot;
  referenceView: ReferenceView;
  checkedRequiredItemIds: string[];
  requiredChecklistSignoff?: { signedBy: string; signedAt: number } | null;
  onReferenceViewChange: (view: ReferenceView) => void;
  onRequiredChecklistChange: (view: ReferenceView, checkedItemIds: string[]) => void;
}

const REFERENCE_TABS: Array<{
  value: ReferenceView;
  label: string;
  icon: typeof Ruler;
}> = [
  { value: 'drawing', label: 'Drawing', icon: Ruler },
  { value: 'instructions', label: 'Instructions', icon: FileText },
  { value: 'checklist', label: 'Checklist', icon: ClipboardList },
  { value: 'camera', label: 'Camera', icon: Camera },
];

export function ReferenceWorkspace({
  snapshot,
  referenceView,
  checkedRequiredItemIds,
  requiredChecklistSignoff,
  onReferenceViewChange,
  onRequiredChecklistChange,
}: ReferenceWorkspaceProps) {
  const [focusReferenceView, setFocusReferenceView] =
    useState<ReferenceView | null>(null);

  const focusReference =
    focusReferenceView != null ? snapshot.references[focusReferenceView] : null;
  const focusRequiredChecks = useMemo(
    () => (focusReferenceView ? snapshot.references[focusReferenceView].items ?? [] : []),
    [focusReferenceView, snapshot.references]
  );
  const focusReferenceRules = useMemo(
    () =>
      focusReference
        ? getReferenceRules(focusReference)
        : [],
    [focusReference]
  );

  return (
    <>
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card shadow-xs">
        <Tabs
          value={referenceView}
          onValueChange={(value) => onReferenceViewChange(value as ReferenceView)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-[var(--neutral-200)] p-6">
            <TabsList className="grid min-h-14 w-full grid-cols-4 rounded-[var(--shape-lg)] bg-[var(--neutral-100)] p-1">
              {REFERENCE_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-14 min-h-14 flex-1 text-base font-medium text-[var(--neutral-700)]"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {REFERENCE_TABS.map((tab) => {
            const reference = snapshot.references[tab.value];
            const requiredChecks = reference.items ?? [];
            const referenceRules = getReferenceRules(reference);

            return (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="mt-0 flex min-h-0 flex-1 flex-col"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--neutral-200)] px-6 py-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                      <span>{reference.documentLabel}</span>
                      <span className="text-[var(--neutral-300)]">•</span>
                      <span>{reference.revision}</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--neutral-900)]">
                      {reference.title}
                    </h2>
                    <p className="mt-2 max-w-[820px] text-base text-[var(--neutral-600)]">
                      {reference.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-[var(--neutral-200)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-700)]"
                    >
                      {tab.label}-first
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                      onClick={() => setFocusReferenceView(tab.value)}
                    >
                      <Maximize2 className="h-5 w-5" />
                      Open full reference
                    </Button>
                  </div>
                </div>

                <ReferencePanelBody
                  mode="inline"
                  snapshot={snapshot}
                  view={tab.value}
                  reference={reference}
                  requiredChecks={requiredChecks}
                  checkedRequiredItemIds={checkedRequiredItemIds}
                  requiredChecklistSignoff={requiredChecklistSignoff ?? null}
                  referenceRules={referenceRules}
                  onToggleCheck={(index, checked) => {
                    const id = `${tab.value}-check-${index + 1}`;
                    const nextIds = checked
                      ? Array.from(new Set([...checkedRequiredItemIds, id]))
                      : checkedRequiredItemIds.filter((itemId) => itemId !== id);

                    onRequiredChecklistChange(tab.value, nextIds);
                  }}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>

      <Dialog
        open={focusReferenceView != null}
        onOpenChange={(open) => {
          if (!open) setFocusReferenceView(null);
        }}
      >
        {focusReferenceView && focusReference ? (
          <DialogContent className="h-[88vh] max-w-[min(1600px,calc(100%-2rem))] overflow-hidden p-0">
            <div className="flex h-full min-h-0 flex-col bg-card">
              <DialogHeader className="border-b border-[var(--neutral-200)] px-6 py-6 pr-20 text-left">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  <span>{focusReference.documentLabel}</span>
                  <span className="text-[var(--neutral-300)]">•</span>
                  <span>{focusReference.revision}</span>
                </div>
                <DialogTitle className="text-3xl font-bold text-[var(--neutral-900)]">
                  {focusReference.title}
                </DialogTitle>
                <DialogDescription className="max-w-[70ch] text-base text-[var(--neutral-600)]">
                  {focusReference.summary}
                </DialogDescription>
              </DialogHeader>

              <ReferencePanelBody
                mode="dialog"
                snapshot={snapshot}
                view={focusReferenceView}
                reference={focusReference}
                requiredChecks={focusRequiredChecks}
                checkedRequiredItemIds={checkedRequiredItemIds}
                requiredChecklistSignoff={requiredChecklistSignoff ?? null}
                referenceRules={focusReferenceRules}
                onToggleCheck={(index, checked) => {
                  const id = `${focusReferenceView}-check-${index + 1}`;
                  const nextIds = checked
                    ? Array.from(new Set([...checkedRequiredItemIds, id]))
                    : checkedRequiredItemIds.filter((itemId) => itemId !== id);

                  onRequiredChecklistChange(focusReferenceView, nextIds);
                }}
              />
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

function ReferencePanelBody({
  mode,
  snapshot,
  view,
  reference,
  requiredChecks,
  checkedRequiredItemIds,
  requiredChecklistSignoff,
  referenceRules,
  onToggleCheck,
}: {
  mode: 'inline' | 'dialog';
  snapshot: WorkOrderExecutionSnapshot;
  view: ReferenceView;
  reference: ExecutionReference;
  requiredChecks: string[];
  checkedRequiredItemIds: string[];
  requiredChecklistSignoff: { signedBy: string; signedAt: number } | null;
  referenceRules: string[];
  onToggleCheck: (index: number, checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        'grid min-h-0 flex-1 gap-6 p-6',
        mode === 'dialog'
          ? 'h-full lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.8fr)]'
          : 'lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]'
      )}
    >
      <div
        className={cn(
          'min-h-0 overflow-hidden rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-100)]',
          mode === 'dialog' ? 'h-full' : ''
        )}
      >
        {view === 'checklist' ? (
          <ExecutionFlowBoard snapshot={snapshot} />
        ) : (
          <ReferenceDetailPanel
            title={reference.title}
            helperText={reference.helperText}
            previewSrc={reference.previewSrc}
            items={reference.items ?? []}
            rules={referenceRules}
            mode={mode}
          />
        )}
      </div>

      <ChecklistSidebar
        view={view}
        requiredChecks={requiredChecks}
        checkedRequiredItemIds={checkedRequiredItemIds}
        requiredChecklistSignoff={requiredChecklistSignoff}
        referenceRules={referenceRules}
        onToggleCheck={onToggleCheck}
      />
    </div>
  );
}

function ReferenceDetailPanel({
  title,
  helperText,
  previewSrc,
  items,
  rules,
  mode,
}: {
  title: string;
  helperText?: string;
  previewSrc?: string;
  items: string[];
  rules: string[];
  mode: 'inline' | 'dialog';
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--neutral-200)] px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
          Active reference
        </span>
        {helperText ? (
          <span className="text-sm text-[var(--neutral-500)]">{helperText}</span>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 p-6">
          {previewSrc ? (
            <div
              className={cn(
                'flex items-center justify-center rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-card p-6',
                mode === 'dialog'
                  ? 'min-h-[620px]'
                  : 'min-h-[460px] xl:min-h-[540px]'
              )}
            >
              <img
                src={previewSrc}
                alt={title}
                className="max-h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-card px-6 py-10 text-center text-base text-[var(--neutral-600)]">
              Open the traveler or the machine-side document set for this reference.
            </div>
          )}

          {mode === 'dialog' && (items.length > 0 || rules.length > 0) ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-[var(--shape-md)] border-[var(--neutral-200)] bg-card p-5 shadow-none">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Reference sequence
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={`${title}-item-${index + 1}`}
                      className="flex items-start gap-3 rounded-[var(--shape-sm)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 py-3"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--neutral-200)] bg-card text-xs font-medium text-[var(--neutral-700)]">
                        {index + 1}
                      </div>
                      <span className="text-sm text-[var(--neutral-800)]">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[var(--shape-md)] border-[var(--neutral-200)] bg-card p-5 shadow-none">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Traveler notes
                </div>
                <div className="mt-4 space-y-3">
                  {rules.map((rule, index) => (
                    <div
                      key={`${title}-rule-${index + 1}`}
                      className="rounded-[var(--shape-sm)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 py-3 text-sm text-[var(--neutral-700)]"
                    >
                      {rule}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}

function ExecutionFlowBoard({
  snapshot,
}: {
  snapshot: WorkOrderExecutionSnapshot;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            Execution flow
          </div>
          <p className="mt-2 text-base text-[var(--neutral-600)]">
            Follow the traveler in sequence. The highlighted step is the one to act on now.
          </p>
        </div>

        {snapshot.routing.map((step) => (
          <div
            key={step.id}
            className={cn(
              'rounded-[var(--shape-md)] border p-5',
              step.status === 'current'
                ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                : step.status === 'previous'
                  ? 'border-[var(--neutral-200)] bg-card'
                  : 'border-[var(--neutral-200)] bg-[var(--neutral-100)]'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--neutral-200)] bg-card text-sm font-medium text-[var(--neutral-900)] tabular-nums">
                {step.stepNumber}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg font-medium text-[var(--neutral-900)]">
                    {step.title}
                  </div>
                  <StepStatusChip status={step.status} />
                  <Badge
                    variant="outline"
                    className="border-[var(--neutral-200)] text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-700)]"
                  >
                    {formatReferenceLabel(step.requiredReference)}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-[var(--neutral-600)]">
                  {step.description}
                </p>

                <div className="mt-4 space-y-2">
                  {step.checklist.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-3 rounded-[var(--shape-sm)] border px-4 py-3 text-sm',
                        item.completed
                          ? 'border-[var(--mw-success)]/30 bg-[var(--mw-success)]/5 text-[var(--neutral-800)]'
                          : 'border-[var(--neutral-200)] bg-card text-[var(--neutral-700)]'
                      )}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-success)]" />
                      ) : (
                        <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-[var(--neutral-300)] bg-card" />
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function ChecklistSidebar({
  view,
  requiredChecks,
  checkedRequiredItemIds,
  requiredChecklistSignoff,
  referenceRules,
  onToggleCheck,
}: {
  view: ReferenceView;
  requiredChecks: string[];
  checkedRequiredItemIds: string[];
  requiredChecklistSignoff: { signedBy: string; signedAt: number } | null;
  referenceRules: string[];
  onToggleCheck: (index: number, checked: boolean) => void;
}) {
  return (
    <ScrollArea className="min-h-0 rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card">
      <div className="space-y-5 p-6">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            What to check now
          </h3>
          <div className="mt-4 space-y-3">
            {requiredChecks.map((item, index) => {
              const id = `${view}-check-${index + 1}`;
              const checked = checkedRequiredItemIds.includes(id);

              return (
                <label
                  key={id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-[var(--shape-md)] border px-4 py-4 transition',
                    checked
                      ? 'border-[var(--mw-success)] bg-[var(--mw-success)]/5'
                      : 'border-[var(--neutral-200)] bg-[var(--neutral-100)]'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => onToggleCheck(index, value === true)}
                    className="mt-0.5 border-[var(--neutral-300)] data-[state=checked]:border-[var(--mw-success)] data-[state=checked]:bg-[var(--mw-success)]"
                  />
                  <span className="flex-1 text-base text-[var(--neutral-800)]">
                    {item}
                  </span>
                  {checked ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--mw-success)]" />
                  ) : null}
                </label>
              );
            })}
          </div>

          {requiredChecklistSignoff ? (
            <div className="mt-3 rounded-[var(--shape-sm)] border border-[var(--mw-success)]/40 bg-[var(--mw-success)]/5 px-3 py-2 text-xs text-[var(--neutral-700)]">
              Sign-off captured by <span className="font-medium">{requiredChecklistSignoff.signedBy}</span>{' '}
              at{' '}
              <span className="font-medium">
                {new Date(requiredChecklistSignoff.signedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ) : null}
        </div>

        {referenceRules.length > 0 ? (
          <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Traveler reminders
            </div>
            <div className="mt-4 space-y-3">
              {referenceRules.map((rule, index) => (
                <div
                  key={`traveler-reminder-${index + 1}`}
                  className="rounded-[var(--shape-sm)] border border-[var(--neutral-200)] bg-card px-4 py-3 text-sm text-[var(--neutral-700)]"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ScrollArea>
  );
}

function StepStatusChip({
  status,
}: {
  status: 'previous' | 'current' | 'next';
}) {
  const label =
    status === 'previous' ? 'Done' : status === 'current' ? 'Now' : 'Next';

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]',
        status === 'current'
          ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--neutral-900)]'
          : status === 'previous'
            ? 'border-[var(--mw-success)]/30 bg-[var(--mw-success)]/5 text-[var(--mw-success)]'
            : 'border-[var(--neutral-200)] bg-card text-[var(--neutral-600)]'
      )}
    >
      {label}
    </span>
  );
}

function formatReferenceLabel(reference: ReferenceView) {
  if (reference === 'drawing') return 'Drawing';
  if (reference === 'instructions') return 'Instructions';
  if (reference === 'checklist') return 'Checklist';
  return 'Camera';
}

function getReferenceRules(reference: ExecutionReference) {
  if (reference.referenceRules && reference.referenceRules.length > 0) {
    return reference.referenceRules;
  }

  return reference.helperText ? [reference.helperText] : [];
}
