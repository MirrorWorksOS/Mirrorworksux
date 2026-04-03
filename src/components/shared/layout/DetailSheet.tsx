import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/components/ui/utils";

export interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  className,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex h-full w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          className,
        )}
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-[var(--neutral-200)] px-6 pb-4 pt-6 text-left">
          <SheetTitle className="text-foreground">{title}</SheetTitle>
          {subtitle ? (
            <SheetDescription>{subtitle}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 z-10 shrink-0 border-t border-[var(--neutral-200)] bg-background px-6 py-4">
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
