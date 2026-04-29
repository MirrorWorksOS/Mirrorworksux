/**
 * OperationFormDialog — create or edit a Standard Operation
 * (Control → Operations).
 *
 * Wired to the "New operation" button on `ControlOperations.tsx`.
 * Backend is mocked — onSave hands a plain object back to the parent which
 * just toasts for now. When the API lands, swap the toast for a real call.
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { MwFormField } from '@/components/shared/forms/MwFormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  operationsLibraryService,
  type StandardOperation,
} from '@/services';

interface OperationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing operation to edit. Omit for create mode. */
  operation?: StandardOperation;
  onSave?: (op: StandardOperation) => void;
}

export function OperationFormDialog({
  open,
  onOpenChange,
  operation,
  onSave,
}: OperationFormDialogProps) {
  const isEdit = Boolean(operation);
  const categories = useMemo(() => operationsLibraryService.categories(), []);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [defaultWorkCentre, setDefaultWorkCentre] = useState('');
  const [defaultMinutes, setDefaultMinutes] = useState<string>('30');
  const [isSubcontract, setIsSubcontract] = useState(false);
  const [description, setDescription] = useState('');

  // Reset form whenever the dialog opens with a (new) target.
  useEffect(() => {
    if (!open) return;
    setName(operation?.name ?? '');
    setCategory(operation?.category ?? categories[0] ?? '');
    setDefaultWorkCentre(operation?.defaultWorkCentre ?? '');
    setDefaultMinutes(String(operation?.defaultMinutes ?? 30));
    setIsSubcontract(Boolean(operation?.isSubcontract));
    setDescription(operation?.description ?? '');
  }, [open, operation, categories]);

  const trimmed = name.trim();
  const minutes = Number(defaultMinutes);
  const valid =
    trimmed.length > 0 &&
    defaultWorkCentre.trim().length > 0 &&
    Number.isFinite(minutes) &&
    minutes > 0;

  const handleSubmit = () => {
    if (!valid) {
      toast.error('Fill in name, work centre, and a positive minutes value.');
      return false;
    }
    const op: StandardOperation = {
      id: operation?.id ?? `std-op-${Date.now()}`,
      name: trimmed,
      category: category || undefined,
      defaultWorkCentre: defaultWorkCentre.trim(),
      defaultMinutes: minutes,
      isSubcontract: isSubcontract || undefined,
      description: description.trim() || undefined,
    };
    onSave?.(op);
    toast.success(isEdit ? 'Operation saved' : 'Operation created');
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit operation' : 'New operation'}
      description="Standard operations are the atomic units routings and routes are built from."
      submitLabel={isEdit ? 'Save' : 'Create'}
      onSubmit={handleSubmit}
      submitDisabled={!valid}
    >
      <MwFormField label="Name" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Laser Cut"
          autoFocus
        />
      </MwFormField>

      <MwFormField label="Category">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Choose category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MwFormField>

      <div className="grid grid-cols-2 gap-3">
        <MwFormField label="Default work centre" required>
          <Input
            value={defaultWorkCentre}
            onChange={(e) => setDefaultWorkCentre(e.target.value)}
            placeholder="e.g. Laser Cutter"
          />
        </MwFormField>

        <MwFormField label="Default minutes" required>
          <Input
            type="number"
            min={1}
            value={defaultMinutes}
            onChange={(e) => setDefaultMinutes(e.target.value)}
          />
        </MwFormField>
      </div>

      <MwFormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — shown in the picker hover"
          rows={2}
        />
      </MwFormField>

      <div className="flex items-center justify-between rounded-[var(--shape-md)] border border-[var(--border)] px-3 py-2">
        <div>
          <div className="text-sm font-medium text-foreground">Subcontract</div>
          <div className="text-xs text-[var(--neutral-500)]">
            Mark as outside-processing by default
          </div>
        </div>
        <Switch checked={isSubcontract} onCheckedChange={setIsSubcontract} />
      </div>
    </EntityFormDialog>
  );
}
