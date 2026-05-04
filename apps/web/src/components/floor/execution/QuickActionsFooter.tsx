import { LifeBuoy, Printer, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuickActionsFooterProps {
  onPrintLabel: () => void;
  onReportScrap: () => void;
  onRequestHelp: () => void;
}

export function QuickActionsFooter({
  onPrintLabel,
  onReportScrap,
  onRequestHelp,
}: QuickActionsFooterProps) {
  return (
    <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-4 shadow-xs">
      <div className="grid grid-cols-3 gap-2">
        <ActionButton icon={Printer} label="Print label" onClick={onPrintLabel} />
        <ActionButton icon={Trash2} label="Report scrap" onClick={onReportScrap} />
        <ActionButton icon={LifeBuoy} label="Request help" onClick={onRequestHelp} />
      </div>
    </Card>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Printer;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="flex h-auto flex-col items-center justify-center gap-1.5 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-card py-3 text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-700)]">
        {label}
      </span>
    </Button>
  );
}
