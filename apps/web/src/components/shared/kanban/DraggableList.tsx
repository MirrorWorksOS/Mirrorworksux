import * as React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

import { cn } from "@/components/ui/utils";

import { DRAG_HANDLE_STYLE } from "./drag-styles";

const DEFAULT_LIST_TYPE = "shared-draggable-list-item";

interface ListDragItem {
  index: number;
}

interface DraggableRowProps<T> {
  item: T;
  index: number;
  dndType: string;
  moveItem: (from: number, to: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function DraggableRow<T>({
  item,
  index,
  dndType,
  moveItem,
  renderItem,
}: DraggableRowProps<T>) {
  const [, drop] = useDrop<ListDragItem>(
    () => ({
      accept: dndType,
      hover(dragged) {
        if (dragged.index === index) return;
        moveItem(dragged.index, index);
        dragged.index = index;
      },
    }),
    [index, moveItem, dndType],
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: dndType,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index, dndType],
  );

  return (
    <div
      ref={drop}
      className={cn(
        "flex min-h-[48px] items-stretch gap-2 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-card",
        isDragging && "opacity-60",
      )}
    >
      <div ref={drag} className={cn("flex shrink-0 items-center px-2", DRAG_HANDLE_STYLE)} aria-hidden>
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 py-2 pr-3">{renderItem(item, index)}</div>
    </div>
  );
}

export interface DraggableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (items: T[]) => void;
  className?: string;
  dndType?: string;
}

export function DraggableList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  className,
  dndType = DEFAULT_LIST_TYPE,
}: DraggableListProps<T>) {
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const moveItem = React.useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...items];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      onReorder(next);
    },
    [items, onReorder],
  );

  return (
    <div ref={listRef} className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => (
        <DraggableRow
          key={keyExtractor(item)}
          item={item}
          index={index}
          dndType={dndType}
          moveItem={moveItem}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}
