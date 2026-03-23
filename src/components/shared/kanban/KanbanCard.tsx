import * as React from "react";
import { useDrag } from "react-dnd";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

import { DRAG_CARD_STYLE } from "./drag-styles";

export interface KanbanCardProps {
  id: string;
  type: string;
  children: React.ReactNode;
  className?: string;
}

export function KanbanCard({ id, type, children, className }: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { id, type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, type],
  );

  return (
    <div ref={drag} style={isDragging ? { ...DRAG_CARD_STYLE } : undefined} className="touch-none">
      <Card
        variant="flat"
        className={cn(
          "p-3 cursor-grab shadow-xs transition-shadow duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:shadow-md",
          className,
        )}
      >
        {children}
      </Card>
    </div>
  );
}
