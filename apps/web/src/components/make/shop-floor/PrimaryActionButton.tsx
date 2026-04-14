import { AlertTriangle, Play, Wrench } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import type { PrimaryActionLabel } from './types';

interface PrimaryActionButtonProps {
  label: PrimaryActionLabel;
  className?: string;
}

export function PrimaryActionButton({
  label,
  className,
}: PrimaryActionButtonProps) {
  const Icon =
    label === 'Resolve Issue'
      ? AlertTriangle
      : label === 'Resume Setup'
        ? Wrench
        : Play;

  return (
    <div
      className={cn(
        'pointer-events-none flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--mw-yellow-400)] px-5 text-base font-medium text-[var(--neutral-900)]',
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
      <span>{label}</span>
    </div>
  );
}
