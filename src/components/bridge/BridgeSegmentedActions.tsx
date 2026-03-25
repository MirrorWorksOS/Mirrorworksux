/**
 * Bridge wizard footer: paired primary + secondary actions as one segmented control.
 * Tooltips use `@/components/ui/tooltip` (Radix + Tailwind `animate-in` — same motion family as Animate UI primitives).
 */
import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, PenLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/utils';

export type BridgeSegmentOrder = 'skip-first' | 'primary-first';

const shell =
  'inline-flex items-stretch overflow-hidden rounded-[var(--shape-lg)] border border-[var(--mw-yellow-400)] shadow-xs';

const segmentBase =
  'inline-flex items-center justify-center gap-2 h-12 min-h-[48px] px-6 text-sm font-medium transition-[background-color,color,opacity] duration-[var(--duration-medium1)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const primaryEnabled =
  'bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-400)]';

const primaryDisabled =
  'bg-[var(--mw-yellow-100)] text-[var(--neutral-500)] cursor-not-allowed';

const secondarySegment =
  'bg-white text-[#2C2C2C] hover:bg-[var(--neutral-50)] active:bg-[var(--neutral-100)]';

const divider = 'w-px shrink-0 bg-[var(--mw-yellow-400)]';

function SegmentWithTooltip({
  tooltip,
  side = 'top',
  trigger,
}: {
  tooltip: string;
  side?: 'top' | 'bottom';
  trigger: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={8} className="max-w-xs text-pretty">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** Skip / secondary + primary (Next, Continue, …) in one control, both with tooltips */
export function BridgeSegmentedSkipPrimary({
  order = 'skip-first',
  skipLabel,
  primaryLabel,
  onSkip,
  onPrimary,
  primaryDisabled = false,
  skipDisabled = false,
  isLoading = false,
  skipTooltip,
  primaryTooltip,
  primaryDisabledTooltip,
  skipIcon: SkipIcon = PenLine,
  primaryIcon: PrimaryIcon = ArrowRight,
  className,
}: {
  order?: BridgeSegmentOrder;
  skipLabel: string;
  primaryLabel: string;
  onSkip: () => void;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  skipDisabled?: boolean;
  isLoading?: boolean;
  skipTooltip: string;
  primaryTooltip: string;
  primaryDisabledTooltip?: string;
  skipIcon?: LucideIcon;
  primaryIcon?: LucideIcon;
  className?: string;
}) {
  const primaryTip =
    primaryDisabled && primaryDisabledTooltip ? primaryDisabledTooltip : primaryTooltip;

  const skipButton = (
    <button
      type="button"
      onClick={onSkip}
      disabled={skipDisabled || isLoading}
      className={cn(segmentBase, secondarySegment, (skipDisabled || isLoading) && 'opacity-50 pointer-events-none')}
    >
      <SkipIcon className="w-4 h-4 shrink-0" aria-hidden />
      {skipLabel}
    </button>
  );

  const primaryInner = (
    <button
      type="button"
      onClick={primaryDisabled || isLoading ? undefined : onPrimary}
      disabled={primaryDisabled || isLoading}
      className={cn(segmentBase, primaryDisabled || isLoading ? primaryDisabled : primaryEnabled)}
    >
      <PrimaryIcon className="w-4 h-4 shrink-0" aria-hidden />
      {primaryLabel}
    </button>
  );

  const primaryWithTooltip =
    primaryDisabled || isLoading ? (
      <SegmentWithTooltip
        tooltip={primaryTip}
        side="top"
        trigger={<span className="inline-flex">{primaryInner}</span>}
      />
    ) : (
      <SegmentWithTooltip tooltip={primaryTip} side="top" trigger={primaryInner} />
    );

  const skipWithTooltip = (
    <SegmentWithTooltip tooltip={skipTooltip} side="top" trigger={skipButton} />
  );

  const segments =
    order === 'primary-first' ? (
      <>
        {primaryWithTooltip}
        <div className={divider} aria-hidden />
        {skipWithTooltip}
      </>
    ) : (
      <>
        {skipWithTooltip}
        <div className={divider} aria-hidden />
        {primaryWithTooltip}
      </>
    );

  return <div className={cn(shell, className)}>{segments}</div>;
}

/** Single primary CTA with tooltip (steps without a skip pair) */
export function BridgePrimaryWithTooltip({
  label,
  onClick,
  disabled = false,
  isLoading = false,
  tooltip,
  disabledTooltip,
  icon: Icon = ArrowRight,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  tooltip: string;
  disabledTooltip?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const tip = disabled && disabledTooltip ? disabledTooltip : tooltip;

  const inner = (
    <button
      type="button"
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 h-12 min-h-[48px] px-6 text-sm font-medium rounded-[var(--shape-lg)] border border-[var(--mw-yellow-400)] shadow-xs transition-[background-color,color,opacity] duration-[var(--duration-medium1)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled || isLoading ? primaryDisabled : primaryEnabled,
        className,
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      {label}
    </button>
  );

  if (disabled || isLoading) {
    return (
      <SegmentWithTooltip
        tooltip={tip}
        side="top"
        trigger={<span className="inline-flex">{inner}</span>}
      />
    );
  }

  return <SegmentWithTooltip tooltip={tip} side="top" trigger={inner} />;
}
