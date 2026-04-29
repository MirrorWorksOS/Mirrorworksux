import { useState } from 'react';
import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { ModuleKey } from './types';

const MODULE_OPTIONS: { value: ModuleKey; label: string }[] = [
  { value: 'sell',    label: 'Sell' },
  { value: 'plan',    label: 'Plan' },
  { value: 'make',    label: 'Make' },
  { value: 'ship',    label: 'Ship' },
  { value: 'book',    label: 'Book' },
  { value: 'buy',     label: 'Buy' },
  { value: 'control', label: 'Control' },
];

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupFormDialog({ open, onOpenChange }: GroupFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState<ModuleKey | ''>('');

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }
    toast.success(`Group "${name}" created`);
    setName('');
    setDescription('');
    setModule('');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New group"
      description="Create a permission group for a module."
      submitLabel="Create group"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block font-medium">Group name</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Production leads"
            className="h-12 rounded-xl border-[var(--border)]"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Who is in this group and what do they do?"
            className="rounded-xl border-[var(--border)] min-h-[80px]"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Module</Label>
          <Select value={module} onValueChange={v => setModule(v as ModuleKey)}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {MODULE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </EntityFormDialog>
  );
}
