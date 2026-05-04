import { AlertCircle, Check, ClipboardList, Play, Plus } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type PrimaryActionIcon = 'check' | 'plus' | 'play' | 'list' | 'alert';

interface PrimaryActionCardProps {
  eyebrow: string;
  title: string;
  supportingText: string;
  actionLabel: string;
  actionIcon: PrimaryActionIcon;
  onAction: () => void;
  disabled?: boolean;
}

const ICON: Record<PrimaryActionIcon, typeof Check> = {
  check: Check,
  plus: Plus,
  play: Play,
  list: ClipboardList,
  alert: AlertCircle,
};

export function PrimaryActionCard({
  eyebrow,
  title,
  supportingText,
  actionLabel,
  actionIcon,
  onAction,
  disabled,
}: PrimaryActionCardProps) {
  const Icon = ICON[actionIcon];
  return (
    <Card className="rounded-[var(--shape-lg)] border border-[var(--mw-mirage)] bg-[var(--mw-mirage)] p-6 shadow-md">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--mw-yellow-400)]">
        {eyebrow}
      </div>
      <h3 className="mt-2 text-[22px] font-medium leading-tight text-white">
        {title}
      </h3>
      <Button
        type="button"
        size="lg"
        className="mt-5 h-16 w-full bg-[var(--mw-yellow-400)] text-lg font-medium text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
        onClick={onAction}
        disabled={disabled}
      >
        <Icon className="h-5 w-5" />
        <span>{actionLabel}</span>
      </Button>
      <p className="mt-3 text-sm leading-relaxed text-[var(--neutral-300)]">
        {supportingText}
      </p>
    </Card>
  );
}
