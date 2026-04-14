/**
 * LeadScoreIndicator — AI-driven lead score displayed as a circular progress ring.
 * Green >70, Yellow 40-70, Red <40. Tooltip reveals scoring factors.
 */

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function scoreColour(score: number): string {
  if (score > 70) return "var(--mw-success)";
  if (score >= 40) return "var(--mw-warning)";
  return "var(--mw-error)";
}

function scoreLabel(score: number): string {
  if (score > 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

const SCORING_FACTORS = [
  { factor: "Engagement recency", weight: "30%" },
  { factor: "Deal value fit", weight: "25%" },
  { factor: "Company size match", weight: "20%" },
  { factor: "Past win history", weight: "15%" },
  { factor: "Response time", weight: "10%" },
];

interface LeadScoreIndicatorProps {
  score: number;
}

export function LeadScoreIndicator({ score }: LeadScoreIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const size = 44;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const colour = scoreColour(clamped);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="relative inline-flex cursor-default items-center justify-center"
          style={{ width: size, height: size }}
          aria-label={`Lead score: ${clamped} — ${scoreLabel(clamped)}`}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--neutral-200)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colour}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span
            className="absolute text-xs font-semibold tabular-nums font-mono"
            style={{ color: colour }}
          >
            {clamped}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <div className="space-y-2">
          <p className="text-xs font-medium">
            AI Lead Score: {clamped}/100 ({scoreLabel(clamped)})
          </p>
          <div className="space-y-1">
            {SCORING_FACTORS.map((f) => (
              <div key={f.factor} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{f.factor}</span>
                <span className="font-mono tabular-nums text-foreground">{f.weight}</span>
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
