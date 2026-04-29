import React, { useState, useEffect } from 'react';
import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import UilTrophy from '@iconscout/react-unicons/icons/uil-trophy';
import UilBolt from '@iconscout/react-unicons/icons/uil-bolt';
import UilCrosshair from '@iconscout/react-unicons/icons/uil-crosshair';
import UilFire from '@iconscout/react-unicons/icons/uil-fire';
import UilStar from '@iconscout/react-unicons/icons/uil-star';
import UilDiamond from '@iconscout/react-unicons/icons/uil-diamond';
import UilShield from '@iconscout/react-unicons/icons/uil-shield';
import UilChartBar from '@iconscout/react-unicons/icons/uil-chart-bar';
import UilMedal from '@iconscout/react-unicons/icons/uil-medal';
import UilAward from '@iconscout/react-unicons/icons/uil-award';
import UilRocket from '@iconscout/react-unicons/icons/uil-rocket';
import UilMountain from '@iconscout/react-unicons/icons/uil-mountains';
import UilTarget from '@iconscout/react-unicons/icons/uil-meeting-board';
import UilFlag from '@iconscout/react-unicons/icons/uil-flag';

type UniconIcon = React.ComponentType<{ color?: string; size?: string | number; className?: string }>;

const ICON_OPTIONS: { value: string; label: string; Icon: UniconIcon }[] = [
  { value: 'trophy',    label: 'Trophy',    Icon: UilTrophy },
  { value: 'bolt',      label: 'Bolt',      Icon: UilBolt },
  { value: 'crosshair', label: 'Crosshair', Icon: UilCrosshair },
  { value: 'fire',      label: 'Fire',      Icon: UilFire },
  { value: 'star',      label: 'Star',      Icon: UilStar },
  { value: 'diamond',   label: 'Diamond',   Icon: UilDiamond },
  { value: 'shield',    label: 'Shield',    Icon: UilShield },
  { value: 'chart-bar', label: 'Chart Bar', Icon: UilChartBar },
  { value: 'medal',     label: 'Medal',     Icon: UilMedal },
  { value: 'award',     label: 'Award',     Icon: UilAward },
  { value: 'rocket',    label: 'Rocket',    Icon: UilRocket },
  { value: 'mountain',  label: 'Mountain',  Icon: UilMountain },
  { value: 'target',    label: 'Target',    Icon: UilTarget },
  { value: 'flag',      label: 'Flag',      Icon: UilFlag },
];

const BADGE_GOLD = '#ffcf4b';
const BADGE_GOLD_SOFT = 'rgba(255, 207, 75, 0.2)';

export interface BadgeFormData {
  id?: string;
  name: string;
  description: string;
  iconKey: string;
  criteria: string;
}

interface BadgeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BadgeFormData | null;
  onSave: (data: BadgeFormData) => void;
}

export function BadgeFormDialog({ open, onOpenChange, initialData, onSave }: BadgeFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconKey, setIconKey] = useState('trophy');
  const [criteria, setCriteria] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setIconKey(initialData.iconKey);
      setCriteria(initialData.criteria);
    } else {
      setName('');
      setDescription('');
      setIconKey('trophy');
      setCriteria('');
    }
  }, [initialData, open]);

  const selectedIcon = ICON_OPTIONS.find(o => o.value === iconKey) ?? ICON_OPTIONS[0];
  const PreviewIcon = selectedIcon.Icon;

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Badge name is required'); return; }

    onSave({ id: initialData?.id, name, description, iconKey, criteria });
    toast.success(initialData ? 'Badge updated' : 'Badge created');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Edit badge' : 'Create badge'}
      description="Design an achievement badge to reward outstanding performance."
      submitLabel={initialData ? 'Update badge' : 'Create badge'}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* Icon preview */}
        <div className="flex justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[var(--shape-lg)]"
            style={{ backgroundColor: BADGE_GOLD_SOFT }}
          >
            <PreviewIcon size={36} color={BADGE_GOLD} />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Icon</Label>
          <Select value={iconKey} onValueChange={setIconKey}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Badge name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Deal Closer" className="h-12 rounded-xl border-[var(--border)]" />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Description</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description shown on the badge card" className="h-12 rounded-xl border-[var(--border)]" />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Criteria <span className="text-[var(--neutral-400)] font-normal">(optional)</span></Label>
          <Textarea
            value={criteria}
            onChange={e => setCriteria(e.target.value)}
            placeholder="Describe what a user must do to earn this badge"
            className="rounded-xl border-[var(--border)] min-h-[80px]"
          />
        </div>
      </div>
    </EntityFormDialog>
  );
}
