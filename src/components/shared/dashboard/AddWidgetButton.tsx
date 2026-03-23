import { Plus } from "lucide-react";

import { cn } from "@/components/ui/utils";

export interface AddWidgetButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function AddWidgetButton({
  onClick,
  label = "Add widget",
  className,
}: AddWidgetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-[var(--shape-lg)] border-2 border-dashed border-[var(--neutral-200)] bg-transparent text-center transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
        "hover:border-[var(--neutral-300)] hover:bg-[var(--neutral-50)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]/50 focus-visible:ring-offset-2",
        className,
      )}
    >
      <Plus className="h-6 w-6 text-muted-foreground" aria-hidden />
      <span className="text-sm text-muted-foreground">{label}</span>
    </button>
  );
}
