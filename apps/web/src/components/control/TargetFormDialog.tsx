import { useState, useEffect } from 'react';
import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export interface TargetFormData {
  id?: string;
  target: string;
  metric: string;
  period: string;
  value: string;
  status: 'Active' | 'Draft';
  enabled: boolean;
}

interface TargetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TargetFormData | null;
  onSave: (data: TargetFormData) => void;
}

export function TargetFormDialog({ open, onOpenChange, initialData, onSave }: TargetFormDialogProps) {
  const [target, setTarget] = useState('');
  const [metric, setMetric] = useState('');
  const [period, setPeriod] = useState('Monthly');
  const [value, setValue] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTarget(initialData.target);
      setMetric(initialData.metric);
      setPeriod(initialData.period);
      setValue(initialData.value);
      setActive(initialData.status === 'Active');
    } else {
      setTarget('');
      setMetric('');
      setPeriod('Monthly');
      setValue('');
      setActive(true);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!target.trim()) { toast.error('Target name is required'); return; }
    if (!metric.trim()) { toast.error('Metric is required'); return; }
    if (!value.trim()) { toast.error('Value is required'); return; }

    onSave({
      id: initialData?.id,
      target,
      metric,
      period,
      value,
      status: active ? 'Active' : 'Draft',
      enabled: active,
    });
    toast.success(initialData ? 'Target updated' : 'Target created');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Edit target' : 'Add target'}
      description="Define a measurable goal for your team."
      submitLabel={initialData ? 'Update target' : 'Add target'}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block font-medium">Target name</Label>
          <Input value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. Close deals" className="h-12 rounded-xl border-[var(--border)]" />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Metric (KPI)</Label>
          <Input value={metric} onChange={e => setMetric(e.target.value)} placeholder="e.g. Deals closed" className="h-12 rounded-xl border-[var(--border)]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block font-medium">Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Target value</Label>
            <Input value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 5 or 95%" className="h-12 rounded-xl border-[var(--border)]" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Active</p>
            <p className="text-xs text-[var(--neutral-500)]">Inactive targets are saved as Draft</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>
    </EntityFormDialog>
  );
}
