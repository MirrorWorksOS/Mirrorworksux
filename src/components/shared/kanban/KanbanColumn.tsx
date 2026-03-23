import * as React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useDrop } from "react-dnd";

import { cn } from "@/components/ui/utils";

import { DROP_ZONE_STYLE } from "./drag-styles";

export interface KanbanDragItem {
  id: string;
  type: string;
}

export interface KanbanColumnProps {
  id: string;
  title: string;
  count?: number;
  accept: string | string[];
  onDrop: (item: KanbanDragItem, columnId: string) => void;
  headerColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumn({
  id,
  title,
  count,
  accept,
  onDrop,
  headerColor = "var(--mw-yellow-400)",
  children,
  className,
}: KanbanColumnProps) {
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept,
      drop: (item: KanbanDragItem) => {
        onDrop(item, id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [accept, id, onDrop],
  );

  const showActive = isOver && canDrop;

  return (
    <div
      className={cn(
        "flex min-w-[280px] w-[280px] flex-col overflow-hidden rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card",
        className,
      )}
    >
      <div
        className="border-b border-[var(--neutral-200)] border-t-[3px] px-3 py-2"
        style={{ borderTopColor: headerColor }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--neutral-900)]">{title}</h3>
          {count !== undefined && (
            <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-xs font-medium tabular-nums text-[var(--neutral-600)]">
              {count}
            </span>
          )}
        </div>
      </div>
      <div
        ref={drop}
        className={cn(
          "flex-1 rounded-b-[var(--shape-md)] border-2 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
          showActive ? DROP_ZONE_STYLE.active : DROP_ZONE_STYLE.inactive,
        )}
      >
        <div ref={listRef} className="space-y-2 min-h-[200px] p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
