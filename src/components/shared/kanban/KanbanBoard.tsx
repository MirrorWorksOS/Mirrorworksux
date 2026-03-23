import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { cn } from "@/components/ui/utils";

export interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>{children}</div>
    </DndProvider>
  );
}
