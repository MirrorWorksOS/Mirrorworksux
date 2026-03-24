/**
 * Multi-stage AI analysis progress indicator.
 */
import { Loader2, CheckCircle } from 'lucide-react';
import type { AnalysisStatus } from '@/types/bridge';

interface Stage {
  label: string;
  status: 'pending' | 'active' | 'done';
  detail?: string;
}

interface ImportProgressBarProps {
  analysisStatus: AnalysisStatus;
  matchedCount?: number;
  totalCount?: number;
}

export function ImportProgressBar({ analysisStatus, matchedCount, totalCount }: ImportProgressBarProps) {
  const stages: Stage[] = [
    {
      label: 'Reading file...',
      status: analysisStatus === 'pending' ? 'active' : 'done',
    },
    {
      label: 'Detecting columns...',
      status: analysisStatus === 'pending' ? 'pending' : analysisStatus === 'analysing' ? 'active' : 'done',
    },
    {
      label: 'Matching fields...',
      status: analysisStatus === 'complete' ? 'done' : analysisStatus === 'analysing' ? 'active' : 'pending',
      detail: analysisStatus === 'complete' && matchedCount != null && totalCount != null
        ? `${matchedCount} of ${totalCount} fields matched`
        : undefined,
    },
  ];

  return (
    <div className="space-y-2">
      {stages.map((stage) => (
        <div key={stage.label} className="flex items-center gap-2 text-sm">
          {stage.status === 'active' && <Loader2 className="w-4 h-4 text-[#FFCF4B] animate-spin" />}
          {stage.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {stage.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
          <span className={stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}>
            {stage.detail || stage.label}
          </span>
        </div>
      ))}
    </div>
  );
}
