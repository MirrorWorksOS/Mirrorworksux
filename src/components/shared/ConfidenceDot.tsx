import { cn } from '@/components/ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConfidenceDotProps {
  /** Confidence score 0–1, or null for unmapped */
  confidence: number | null;
  /** Show tooltip with the numeric score */
  showTooltip?: boolean;
  className?: string;
}

function getColor(confidence: number | null): string {
  if (confidence === null) return 'bg-gray-400';
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function getLabel(confidence: number | null): string {
  if (confidence === null) return 'Not matched';
  if (confidence >= 0.8) return 'High confidence';
  if (confidence >= 0.5) return 'Medium confidence';
  return 'Low confidence';
}

export function ConfidenceDot({
  confidence,
  showTooltip = true,
  className,
}: ConfidenceDotProps) {
  const dot = (
    <span
      className={cn('inline-block w-2.5 h-2.5 rounded-full shrink-0', getColor(confidence), className)}
      aria-label={getLabel(confidence)}
    />
  );

  if (!showTooltip) return dot;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{dot}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {getLabel(confidence)}
          {confidence !== null && (
            <span className="ml-1 text-muted-foreground">
              ({Math.round(confidence * 100)}%)
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
