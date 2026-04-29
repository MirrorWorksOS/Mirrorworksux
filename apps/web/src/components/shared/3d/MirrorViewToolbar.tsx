/**
 * MirrorViewToolbar — Autodesk-APS-style floating toolbar for the MirrorView 3D viewer.
 *
 * Rendered as a pill at the bottom-center of the viewer canvas. The mouse-mode
 * controls (pointer / pan / orbit) drive the parent's GlbViewerApi imperatively
 * via the `onMode` and `onReset` callbacks; the rest are illustrative entry
 * points (toast or caller-provided handler).
 */

import { useState } from 'react';
import {
  Hand,
  Home,
  MessageCirclePlus,
  MousePointer2,
  Rotate3d,
  Ruler,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MwTooltip,
  MwTooltipContent,
  MwTooltipProvider,
  MwTooltipTrigger,
} from '@/components/shared/layout/MwTooltip';
import { cn } from '@/components/ui/utils';

type Tool = 'select' | 'pan' | 'orbit';

interface MirrorViewToolbarProps {
  className?: string;
  onReset?: () => void;
  onMode?: (mode: 'pan' | 'orbit') => void;
  onComment?: () => void;
}

export function MirrorViewToolbar({
  className,
  onReset,
  onMode,
  onComment,
}: MirrorViewToolbarProps) {
  const [tool, setTool] = useState<Tool>('orbit');

  const pickTool = (next: Tool) => {
    setTool(next);
    if (next === 'select') {
      toast('Selection coming soon');
      return;
    }
    onMode?.(next);
  };

  return (
    <MwTooltipProvider delayDuration={300}>
      <div
        className={cn(
          'absolute bottom-4 left-1/2 z-10 -translate-x-1/2',
          'flex items-center gap-0.5 rounded-full border border-[var(--border)]',
          'bg-card/95 px-1.5 py-1 shadow-[var(--elevation-2,0_2px_8px_rgba(0,0,0,0.08))] backdrop-blur',
          className,
        )}
        role="toolbar"
        aria-label="MirrorView controls"
      >
        <ToolbarIconButton
          label="Reset view"
          icon={<Home className="h-4 w-4" strokeWidth={1.5} />}
          onClick={() => onReset?.()}
        />

        <Separator />

        <ToolbarIconButton
          label="Select"
          icon={<MousePointer2 className="h-4 w-4" strokeWidth={1.5} />}
          active={tool === 'select'}
          onClick={() => pickTool('select')}
        />
        <ToolbarIconButton
          label="Pan"
          icon={<Hand className="h-4 w-4" strokeWidth={1.5} />}
          active={tool === 'pan'}
          onClick={() => pickTool('pan')}
        />
        <ToolbarIconButton
          label="Orbit"
          icon={<Rotate3d className="h-4 w-4" strokeWidth={1.5} />}
          active={tool === 'orbit'}
          onClick={() => pickTool('orbit')}
        />

        <Separator />

        <ToolbarIconButton
          label="Measure"
          icon={<Ruler className="h-4 w-4" strokeWidth={1.5} />}
          onClick={() => toast('Measurement coming soon')}
        />
        <ToolbarIconButton
          label="Comment"
          icon={<MessageCirclePlus className="h-4 w-4" strokeWidth={1.5} />}
          onClick={() => {
            if (onComment) onComment();
            else toast('Commenting coming soon');
          }}
        />
      </div>
    </MwTooltipProvider>
  );
}

function ToolbarIconButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <MwTooltip>
      <MwTooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]',
            active
              ? 'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]'
              : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] hover:text-foreground',
          )}
        >
          {icon}
        </button>
      </MwTooltipTrigger>
      <MwTooltipContent side="top" sideOffset={6}>
        {label}
      </MwTooltipContent>
    </MwTooltip>
  );
}

function Separator() {
  return <div className="mx-1 h-5 w-px bg-[var(--border)]" />;
}
