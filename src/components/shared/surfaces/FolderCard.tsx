/**
 * FolderCard — 3D interactive folder that opens on click/hover.
 * Inspired by ReactBits Folder. CSS 3D transforms, GPU-composited.
 */

import { useState, useCallback, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/components/ui/utils";
import { useReducedMotion } from "@/components/shared/motion/use-reduced-motion";

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) - Math.round(((num >> 16) * percent) / 100)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) - Math.round((((num >> 8) & 0xff) * percent) / 100)));
  const b = Math.max(0, Math.min(255, (num & 0xff) - Math.round(((num & 0xff) * percent) / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export interface FolderCardProps {
  /** Folder color — default neutral grey */
  color?: string;
  /** Scale multiplier — default 1 */
  size?: number;
  /** Up to 3 items shown as paper sheets */
  items?: ReactNode[];
  className?: string;
}

export function FolderCard({
  color = "#a3a3a3",
  size = 1,
  items = [],
  className,
}: FolderCardProps) {
  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const prefersReduced = useReducedMotion();

  const papers = [...items.slice(0, 3)];
  while (papers.length < 3) papers.push(null);

  const handleClick = useCallback(() => {
    setOpen((prev) => {
      if (prev) setPaperOffsets([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
      return !prev;
    });
  }, []);

  const handlePaperMove = useCallback(
    (e: MouseEvent<HTMLDivElement>, index: number) => {
      if (!open || prefersReduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setPaperOffsets((prev) => {
        const next = [...prev];
        next[index] = {
          x: (e.clientX - centerX) * 0.15,
          y: (e.clientY - centerY) * 0.15,
        };
        return next;
      });
    },
    [open, prefersReduced],
  );

  const handlePaperLeave = useCallback((index: number) => {
    setPaperOffsets((prev) => {
      const next = [...prev];
      next[index] = { x: 0, y: 0 };
      return next;
    });
  }, []);

  const backColor = darkenColor(color, 8);
  const paperShades = ["#ffffff", "#f5f5f5", "#ebebeb"];

  return (
    <div
      className={cn(
        "folder-card group relative cursor-pointer select-none",
        className,
      )}
      style={
        {
          transform: `scale(${size})`,
          "--folder-color": color,
          "--folder-back-color": backColor,
        } as React.CSSProperties
      }
      onClick={handleClick}
    >
      {/* Back */}
      <div
        className="relative mx-auto h-[70px] w-[90px] rounded-t-[3px] rounded-b-[8px]"
        style={{ backgroundColor: backColor }}
      >
        {/* Tab */}
        <div
          className="absolute -top-[8px] left-0 h-[10px] w-[35px] rounded-t-[5px]"
          style={{ backgroundColor: backColor }}
        />

        {/* Papers */}
        {papers.map((item, i) => {
          const transforms = [
            "translate(-120%, -70%) rotateZ(-15deg)",
            "translate(10%, -70%) rotateZ(15deg)",
            "translate(-50%, -100%) rotateZ(5deg)",
          ];
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-[50px] w-[60px] rounded-[3px] shadow-sm"
              style={{
                backgroundColor: paperShades[i],
                transform: open ? transforms[i] : "translate(-50%, -50%)",
                transition: prefersReduced ? "none" : "transform 0.3s ease-in-out",
                ...(open
                  ? {
                      ["--magnet-x" as string]: `${paperOffsets[i].x}px`,
                      ["--magnet-y" as string]: `${paperOffsets[i].y}px`,
                      transform: `${transforms[i]} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px)`,
                    }
                  : {}),
                zIndex: 3 - i,
              }}
              onMouseMove={(e) => handlePaperMove(e, i)}
              onMouseLeave={() => handlePaperLeave(i)}
            >
              {item && (
                <div className="flex h-full items-center justify-center p-1 text-[8px] text-neutral-500">
                  {item}
                </div>
              )}
            </div>
          );
        })}

        {/* Front flap */}
        <div
          className="absolute inset-x-0 bottom-0 h-[40px] rounded-b-[8px]"
          style={{
            backgroundColor: color,
            transformOrigin: "bottom",
            transform: open ? "rotateX(-30deg)" : "rotateX(0deg)",
            transition: prefersReduced ? "none" : "transform 0.3s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}
