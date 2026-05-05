import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';

export interface SectionShellProps {
  title: string;
  description?: string;
  /** Optional right-aligned controls (filter switch, helper button etc.). */
  actions?: ReactNode;
  allMapped?: boolean;
  children: ReactNode;
  className?: string;
}

export function SectionShell({
  title,
  description,
  actions,
  allMapped,
  children,
  className,
}: SectionShellProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {allMapped && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--mw-success)]/10 px-3 py-1 text-xs text-[var(--mw-success)]">
          <CheckCircle2 className="size-3.5" /> All mapped
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </Card>
  );
}
