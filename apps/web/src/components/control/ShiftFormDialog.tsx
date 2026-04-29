import { useState, useEffect } from 'react';
import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import type { EmployeeShift } from '@/types/entities';

const WEEKDAYS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
] as const;

type ShiftType = 'day' | 'afternoon' | 'night';

interface EmployeeOption {
  id: string;
  name: string;
}

interface ShiftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeOption[];
  /** When editing an existing shift */
  initialShift?: EmployeeShift | null;
  onSave: (shift: Omit<EmployeeShift, 'id'> & { id?: string }) => void;
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  employees,
  initialShift,
  onSave,
}: ShiftFormDialogProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [shiftType, setShiftType] = useState<ShiftType>('day');
  const [workCentre, setWorkCentre] = useState('');

  useEffect(() => {
    if (initialShift) {
      setEmployeeId(initialShift.employeeId);
      setDays([initialShift.dayOfWeek]);
      setStartTime(initialShift.startTime);
      setEndTime(initialShift.endTime);
      setShiftType(initialShift.shift);
      setWorkCentre(initialShift.workCentreName ?? '');
    } else {
      setEmployeeId('');
      setDays([]);
      setStartTime('09:00');
      setEndTime('17:00');
      setShiftType('day');
      setWorkCentre('');
    }
  }, [initialShift, open]);

  const toggleDay = (day: number) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = () => {
    if (!employeeId) { toast.error('Select an employee'); return; }
    if (days.length === 0) { toast.error('Select at least one day'); return; }

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    for (const day of days) {
      onSave({
        id: initialShift?.id,
        employeeId,
        employeeName: employee.name,
        employeeInitials: employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        department: '',
        role: '',
        dayOfWeek: day,
        shift: shiftType,
        startTime,
        endTime,
        workCentreName: workCentre || undefined,
      });
    }

    toast.success(initialShift ? 'Shift updated' : 'Shift added');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialShift ? 'Edit shift' : 'New shift'}
      description="Assign an employee to a shift for one or more days."
      submitLabel={initialShift ? 'Update shift' : 'Add shift'}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block font-medium">Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Days</Label>
          <div className="flex gap-1.5 flex-wrap">
            {WEEKDAYS.map(({ day, label }) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  days.includes(day)
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)] text-primary-foreground'
                    : 'border-[var(--border)] bg-card text-[var(--neutral-600)] hover:border-[var(--neutral-400)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block font-medium">Start time</Label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-12 rounded-xl border-[var(--border)]" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">End time</Label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-12 rounded-xl border-[var(--border)]" />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Shift type</Label>
          <Select value={shiftType} onValueChange={v => setShiftType(v as ShiftType)}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Work centre <span className="text-[var(--neutral-400)] font-normal">(optional)</span></Label>
          <Input value={workCentre} onChange={e => setWorkCentre(e.target.value)} placeholder="e.g. Laser Bay A" className="h-12 rounded-xl border-[var(--border)]" />
        </div>
      </div>
    </EntityFormDialog>
  );
}
