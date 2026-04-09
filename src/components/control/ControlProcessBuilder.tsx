/**
 * Process Builder — node-based diagram tool for factory processes and spaghetti diagrams.
 * Figma-style 3-panel layout: Element Library | SVG Canvas | Properties + AI.
 * @see src/lib/design-system.ts
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors, Wrench, Flame, Paintbrush, Package, CheckSquare,
  User, ShieldCheck, Search as SearchIcon, Settings2,
  Cog, PenTool, Anchor, Warehouse,
  Sparkles, Save, Upload, Trash2, X, ZoomIn, ZoomOut,
  Eye, GripVertical, ArrowRight, Factory,
  LayoutGrid, type LucideIcon, Plus,
  Type, Circle, Triangle, RectangleHorizontal,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '../ui/resizable';
import { cn } from '../ui/utils';
import { Blocks as AnimatedBlocks } from '@/components/animate-ui/icons/blocks';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetPortal,
  SheetOverlay,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/animate-ui/primitives/radix/sheet';
import { PanelRight } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type NodeCategory = 'process' | 'people' | 'resource' | 'custom' | 'text-shapes';
export type FlowType = 'material' | 'information' | 'people';

export interface ProcessNode {
  id: string;
  category: NodeCategory;
  label: string;
  icon: LucideIcon;
  x: number;
  y: number;
  /** Properties */
  duration?: string;
  cost?: string;
  assignedTo?: string;
  inputMaterials?: string;
  outputMaterials?: string;
}

export interface ProcessConnection {
  id: string;
  from: string;
  to: string;
  fromPort: 'top' | 'right' | 'bottom' | 'left';
  toPort: 'top' | 'right' | 'bottom' | 'left';
  flowType: FlowType;
}

interface DragItem {
  category: NodeCategory;
  label: string;
  icon: LucideIcon;
}

interface AILeanSuggestion {
  id: string;
  message: string;
  principle: string;
  principleTag: string;
}

// ─── Element Library data ───────────────────────────────────────────────────

const ELEMENT_LIBRARY: Record<string, DragItem[]> = {
  Processes: [
    { category: 'process', label: 'Cutting', icon: Scissors },
    { category: 'process', label: 'Bending', icon: Wrench },
    { category: 'process', label: 'Welding', icon: Flame },
    { category: 'process', label: 'Painting', icon: Paintbrush },
    { category: 'process', label: 'Assembly', icon: Settings2 },
    { category: 'process', label: 'Inspection', icon: CheckSquare },
    { category: 'process', label: 'Packaging', icon: Package },
  ],
  People: [
    { category: 'people', label: 'Operator', icon: User },
    { category: 'people', label: 'Supervisor', icon: ShieldCheck },
    { category: 'people', label: 'Quality Inspector', icon: SearchIcon },
    { category: 'people', label: 'Maintenance Tech', icon: Wrench },
  ],
  Resources: [
    { category: 'resource', label: 'Machine', icon: Cog },
    { category: 'resource', label: 'Tool', icon: PenTool },
    { category: 'resource', label: 'Fixture', icon: Anchor },
    { category: 'resource', label: 'Material Store', icon: Warehouse },
  ],
  Custom: [
    { category: 'custom', label: 'Custom Block', icon: Plus },
  ],
  'Text': [
    { category: 'text-shapes', label: 'Text Label', icon: Type },
    { category: 'text-shapes', label: 'Rectangle', icon: RectangleHorizontal },
    { category: 'text-shapes', label: 'Circle', icon: Circle },
    { category: 'text-shapes', label: 'Triangle', icon: Triangle },
  ],
};

/** Drag payload only serialises category + label — icon is a function and cannot go through JSON. */
function resolveLibraryItem(category: NodeCategory, label: string): DragItem | null {
  for (const group of Object.values(ELEMENT_LIBRARY)) {
    const found = group.find((i) => i.category === category && i.label === label);
    if (found) return found;
  }
  return null;
}

// ─── AI Lean Suggestions ────────────────────────────────────────────────────

const AI_SUGGESTIONS: AILeanSuggestion[] = [
  {
    id: 's1',
    message: 'Bottleneck: Welding receives from 3 upstream processes. Consider parallel stations to balance load.',
    principle: 'Heijunka',
    principleTag: 'TPS: Heijunka',
  },
  {
    id: 's2',
    message: 'Excessive transport: Material travels 45m from cutting to bending. Consider cell layout to reduce waste.',
    principle: 'Muda',
    principleTag: 'TPS: Muda',
  },
  {
    id: 's3',
    message: 'Single quality inspection point at end of line. Add in-process checks for earlier defect detection.',
    principle: 'Jidoka',
    principleTag: 'TPS: Jidoka',
  },
  {
    id: 's4',
    message: 'Implement kanban signals between stations for pull-based material flow instead of push scheduling.',
    principle: 'Just-in-Time',
    principleTag: 'TPS: Just-in-Time',
  },
];

// ─── Colour config ──────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<NodeCategory, { bg: string; border: string; shape: string }> = {
  process:  { bg: 'bg-[var(--mw-yellow-100)] dark:bg-[var(--mw-yellow-50)]',  border: 'border-[var(--mw-yellow-400)]', shape: 'square' },
  people:   { bg: 'bg-[var(--mw-blue-100)] dark:bg-[var(--mw-blue-50)]',      border: 'border-[var(--mw-blue)]',       shape: 'circle' },
  resource: { bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]',      border: 'border-[var(--neutral-400)]',   shape: 'diamond' },
  custom:   { bg: 'bg-[var(--mw-purple-100)] dark:bg-[var(--mw-purple-50)]',  border: 'border-[var(--mw-purple)]',     shape: 'square' },
  'text-shapes': { bg: 'bg-[var(--neutral-50)] dark:bg-[var(--neutral-700)]', border: 'border-[var(--neutral-300)]', shape: 'square' },
};

const FLOW_COLORS: Record<FlowType, string> = {
  material: 'var(--mw-yellow-400)',
  information: 'var(--mw-blue)',
  people: 'var(--mw-success)',
};

const FLOW_LABELS: Record<FlowType, string> = {
  material: 'Material',
  information: 'Information',
  people: 'People',
};

// ─── Geometry constants ─────────────────────────────────────────────────────

const NODE_SIZE = 80;
const PORT_RADIUS = 6;
const GRID_SIZE = 24;

// ─── Demo data ──────────────────────────────────────────────────────────────

const DEMO_NODES: ProcessNode[] = [
  { id: 'n1', category: 'process',  label: 'Cutting',    icon: Scissors,    x: 120, y: 200, duration: '15 min', cost: '$12', assignedTo: 'John', inputMaterials: 'Sheet steel', outputMaterials: 'Cut panels' },
  { id: 'n2', category: 'process',  label: 'Bending',    icon: Wrench,      x: 320, y: 200, duration: '10 min', cost: '$8',  assignedTo: 'Sarah', inputMaterials: 'Cut panels', outputMaterials: 'Bent parts' },
  { id: 'n3', category: 'process',  label: 'Welding',    icon: Flame,       x: 520, y: 200, duration: '25 min', cost: '$22', assignedTo: 'Mike', inputMaterials: 'Bent parts', outputMaterials: 'Welded assembly' },
  { id: 'n4', category: 'process',  label: 'Painting',   icon: Paintbrush,  x: 720, y: 200, duration: '20 min', cost: '$15', assignedTo: 'Lisa', inputMaterials: 'Welded assembly', outputMaterials: 'Painted assembly' },
  { id: 'n5', category: 'process',  label: 'Inspection', icon: CheckSquare, x: 520, y: 400, duration: '8 min',  cost: '$6',  assignedTo: 'QC Team' },
  { id: 'n6', category: 'process',  label: 'Assembly',   icon: Settings2,   x: 720, y: 400, duration: '30 min', cost: '$28', assignedTo: 'Assembly Team' },
  { id: 'n7', category: 'people',   label: 'Operator',   icon: User,        x: 120, y: 80,  assignedTo: 'Station 1' },
  { id: 'n8', category: 'people',   label: 'Supervisor', icon: ShieldCheck, x: 320, y: 80,  assignedTo: 'Floor Lead' },
  { id: 'n9', category: 'resource', label: 'CNC Machine', icon: Cog,        x: 120, y: 400, cost: '$2,500/mo' },
  { id: 'n10', category: 'resource', label: 'Weld Station', icon: Cog,      x: 320, y: 400, cost: '$1,800/mo' },
];

const DEMO_CONNECTIONS: ProcessConnection[] = [
  { id: 'c1', from: 'n1', to: 'n2', fromPort: 'right', toPort: 'left', flowType: 'material' },
  { id: 'c2', from: 'n2', to: 'n3', fromPort: 'right', toPort: 'left', flowType: 'material' },
  { id: 'c3', from: 'n3', to: 'n4', fromPort: 'right', toPort: 'left', flowType: 'material' },
  { id: 'c4', from: 'n4', to: 'n6', fromPort: 'bottom', toPort: 'right', flowType: 'material' },
  { id: 'c5', from: 'n3', to: 'n5', fromPort: 'bottom', toPort: 'top', flowType: 'material' },
  { id: 'c6', from: 'n7', to: 'n1', fromPort: 'bottom', toPort: 'top', flowType: 'people' },
  { id: 'c7', from: 'n8', to: 'n2', fromPort: 'bottom', toPort: 'top', flowType: 'information' },
  { id: 'c8', from: 'n8', to: 'n3', fromPort: 'bottom', toPort: 'top', flowType: 'information' },
  { id: 'c9', from: 'n9', to: 'n1', fromPort: 'top', toPort: 'bottom', flowType: 'information' },
  { id: 'c10', from: 'n10', to: 'n3', fromPort: 'top', toPort: 'bottom', flowType: 'information' },
  { id: 'c11', from: 'n5', to: 'n6', fromPort: 'right', toPort: 'left', flowType: 'material' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

let _nodeId = 100;
function nextNodeId() {
  return `n${++_nodeId}`;
}

let _connId = 100;
function nextConnId() {
  return `c${++_connId}`;
}

function getPortPos(node: ProcessNode, port: 'top' | 'right' | 'bottom' | 'left') {
  const half = NODE_SIZE / 2;
  switch (port) {
    case 'top':    return { x: node.x + half, y: node.y };
    case 'right':  return { x: node.x + NODE_SIZE, y: node.y + half };
    case 'bottom': return { x: node.x + half, y: node.y + NODE_SIZE };
    case 'left':   return { x: node.x, y: node.y + half };
  }
}

function snapToGrid(v: number) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

// ─── Draggable library item ─────────────────────────────────────────────────

function LibraryItem({ item, onDragStart }: { item: DragItem; onDragStart: (item: DragItem) => void }) {
  const style = CATEGORY_STYLE[item.category];
  const Icon = item.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-[var(--shape-md)] border cursor-grab active:cursor-grabbing',
        'shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
        style.bg, style.border,
      )}
      draggable
      onDragStart={(e) => {
        // JSON.stringify drops `icon` (functions); only category + label are serialisable.
        e.dataTransfer.setData(
          'application/process-node',
          JSON.stringify({ category: item.category, label: item.label }),
        );
        onDragStart(item);
      }}
    >
      <div className={cn(
        'w-7 h-7 rounded flex items-center justify-center flex-shrink-0 border',
        style.bg, style.border,
      )}>
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <span className="text-xs font-medium text-foreground truncate">{item.label}</span>
      <GripVertical className="w-3 h-3 text-[var(--neutral-400)] ml-auto flex-shrink-0" />
    </div>
  );
}

// ─── SVG Canvas Node ────────────────────────────────────────────────────────

function CanvasNode({
  node,
  selected,
  onMouseDown,
  onPortMouseDown,
}: {
  node: ProcessNode;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortMouseDown: (port: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => void;
}) {
  const style = CATEGORY_STYLE[node.category];
  const Icon = node.icon;
  const ports: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];

  const borderColorMap: Record<NodeCategory, string> = {
    process: 'var(--mw-yellow-400)',
    people: 'var(--mw-blue)',
    resource: 'var(--neutral-400)',
    custom: 'var(--mw-purple)',
    'text-shapes': 'var(--neutral-300)',
  };

  const fillColorMap: Record<NodeCategory, string> = {
    process: 'var(--pb-process-fill)',
    people: 'var(--pb-people-fill)',
    resource: 'var(--pb-resource-fill)',
    custom: 'var(--pb-custom-fill)',
    'text-shapes': 'var(--pb-text-shapes-fill)',
  };

  const half = NODE_SIZE / 2;
  const borderColor = borderColorMap[node.category];

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseDown={onMouseDown}
      className="cursor-move"
      filter={selected ? 'url(#pb-elevation-3)' : 'url(#pb-elevation-1)'}
      style={{ transition: 'filter 250ms ease' }}
    >
      {selected && (
        <rect
          x={-4}
          y={-4}
          width={NODE_SIZE + 8}
          height={NODE_SIZE + 8}
          rx={12}
          fill="none"
          stroke="var(--mw-yellow-400)"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}

      {/* Node shape background */}
      {CATEGORY_STYLE[node.category].shape === 'circle' ? (
        <circle cx={half} cy={half} r={half - 1} fill={fillColorMap[node.category]} stroke={borderColor} strokeWidth={2} />
      ) : CATEGORY_STYLE[node.category].shape === 'diamond' ? (
        <polygon
          points={`${half},1 ${NODE_SIZE - 1},${half} ${half},${NODE_SIZE - 1} 1,${half}`}
          fill={fillColorMap[node.category]}
          stroke={borderColor}
          strokeWidth={2}
        />
      ) : (
        <rect
          x={1}
          y={1}
          width={NODE_SIZE - 2}
          height={NODE_SIZE - 2}
          rx={8}
          fill={fillColorMap[node.category]}
          stroke={borderColor}
          strokeWidth={2}
        />
      )}

      {/* Icon */}
      <foreignObject x={half - 12} y={12} width={24} height={24}>
        <Icon className="w-6 h-6 text-foreground" />
      </foreignObject>

      {/* Label */}
      <text
        x={half}
        y={NODE_SIZE - 10}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-medium select-none pointer-events-none"
        style={{ fontSize: '10px' }}
      >
        {node.label.length > 10 ? node.label.slice(0, 10) + '...' : node.label}
      </text>

      {/* Ports */}
      {ports.map(port => {
        const pos = getPortPos({ ...node, x: 0, y: 0 }, port);
        return (
          <circle
            key={port}
            cx={pos.x}
            cy={pos.y}
            r={PORT_RADIUS}
            fill="var(--background, #fff)"
            stroke={borderColor}
            strokeWidth={1.5}
            className="cursor-crosshair hover:fill-[var(--mw-yellow-400)] transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              onPortMouseDown(port, e);
            }}
          />
        );
      })}
    </g>
  );
}

// ─── SVG Connection ─────────────────────────────────────────────────────────

function ConnectionPath({
  conn,
  nodes,
  animated,
  selected,
  onClick,
}: {
  conn: ProcessConnection;
  nodes: ProcessNode[];
  animated: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const from = nodes.find(n => n.id === conn.from);
  const to = nodes.find(n => n.id === conn.to);
  if (!from || !to) return null;

  const s = getPortPos(from, conn.fromPort);
  const e = getPortPos(to, conn.toPort);

  const dx = e.x - s.x;
  const dy = e.y - s.y;
  const cpOffset = Math.max(Math.abs(dx), Math.abs(dy)) * 0.4;

  // Bezier control points based on port direction
  const cpMap = {
    top: { dx: 0, dy: -cpOffset },
    right: { dx: cpOffset, dy: 0 },
    bottom: { dx: 0, dy: cpOffset },
    left: { dx: -cpOffset, dy: 0 },
  };

  const cp1 = cpMap[conn.fromPort];
  const cp2 = cpMap[conn.toPort];

  const d = `M ${s.x} ${s.y} C ${s.x + cp1.dx} ${s.y + cp1.dy} ${e.x + cp2.dx} ${e.y + cp2.dy} ${e.x} ${e.y}`;

  const color = FLOW_COLORS[conn.flowType];
  const markerId = `arrow-${conn.flowType}`;

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Invisible wide path for easier clicking */}
      <path d={d} stroke="transparent" strokeWidth={12} fill="none" />
      {/* Visible path */}
      <path
        d={d}
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        markerEnd={`url(#${markerId})`}
        strokeDasharray={animated ? '8 4' : 'none'}
        className={animated ? 'animate-flow' : ''}
      />
    </g>
  );
}

// ─── Right Panel: Properties ────────────────────────────────────────────────

function PropertiesPanel({
  node,
  onUpdate,
  onClose,
}: {
  node: ProcessNode;
  onUpdate: (updated: Partial<ProcessNode>) => void;
  onClose: () => void;
}) {
  const style = CATEGORY_STYLE[node.category];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Node properties</span>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] rounded transition-colors"
        >
          <X className="w-4 h-4 text-[var(--neutral-500)]" />
        </button>
      </div>

      {/* Type badge */}
      <div>
        <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-1.5">Type</p>
        <Badge className={cn(
          'capitalize text-xs px-2 py-0.5 border rounded',
          style.bg, style.border, 'text-foreground',
        )}>
          {node.category}
        </Badge>
      </div>

      {/* Name */}
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Name</label>
        <Input
          className="h-8 text-xs"
          defaultValue={node.label}
          onBlur={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {/* Duration */}
      {node.category === 'process' && (
        <div>
          <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Duration</label>
          <Input
            className="h-8 text-xs"
            defaultValue={node.duration || ''}
            placeholder="e.g. 15 min"
            onBlur={(e) => onUpdate({ duration: e.target.value })}
          />
        </div>
      )}

      {/* Cost */}
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Cost</label>
        <Input
          className="h-8 text-xs"
          defaultValue={node.cost || ''}
          placeholder="e.g. $12"
          onBlur={(e) => onUpdate({ cost: e.target.value })}
        />
      </div>

      {/* Assigned To */}
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Assigned to</label>
        <Input
          className="h-8 text-xs"
          defaultValue={node.assignedTo || ''}
          placeholder="e.g. John Smith"
          onBlur={(e) => onUpdate({ assignedTo: e.target.value })}
        />
      </div>

      {/* Input / Output Materials */}
      {node.category === 'process' && (
        <>
          <div>
            <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Input materials</label>
            <Input
              className="h-8 text-xs"
              defaultValue={node.inputMaterials || ''}
              placeholder="e.g. Sheet steel"
              onBlur={(e) => onUpdate({ inputMaterials: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Output materials</label>
            <Input
              className="h-8 text-xs"
              defaultValue={node.outputMaterials || ''}
              placeholder="e.g. Cut panels"
              onBlur={(e) => onUpdate({ outputMaterials: e.target.value })}
            />
          </div>
        </>
      )}

      {/* Delete */}
      <div className="pt-2 border-t border-[var(--border)]">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-10 border-destructive text-destructive hover:bg-[var(--mw-error-light)] dark:hover:bg-red-900/20 text-xs"
          onClick={() => {
            onClose();
            toast.success(`Deleted ${node.label}`);
          }}
        >
          <Trash2 className="w-4 h-4 mr-1.5" /> Delete node
        </Button>
      </div>
    </div>
  );
}

// ─── Right Panel: AI Lean Suggestions ───────────────────────────────────────

function AILeanPanel({
  suggestions,
  onDismiss,
  onApply,
}: {
  suggestions: AILeanSuggestion[];
  onDismiss: (id: string) => void;
  onApply: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--mw-purple)] flex-shrink-0" />
        <span className="text-xs font-medium text-[var(--mw-purple)]">AI Lean Suggestions</span>
      </div>

      <AnimatePresence>
        {suggestions.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-[var(--mw-purple)]/20 bg-[var(--mw-purple-50)] rounded-[var(--shape-md)] p-3 space-y-2"
          >
            <p className="text-xs text-foreground leading-relaxed">{s.message}</p>
            <div className="flex items-center justify-between">
              <Badge className="text-[10px] px-1.5 py-0.5 bg-[var(--mw-purple-100)] text-[var(--mw-purple)] border border-[var(--mw-purple)]/25 rounded">
                {s.principleTag}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-[var(--mw-purple)] hover:bg-[var(--mw-purple-50)]"
                  onClick={() => onApply(s.id)}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
                  onClick={() => onDismiss(s.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {suggestions.length === 0 && (
        <p className="text-xs text-[var(--neutral-500)] text-center py-4">
          No suggestions yet. Add more nodes and connections, then click "Analyze with AI".
        </p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface FactoryRefElement {
  id: string;
  type: string;
  category: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export function ControlProcessBuilder() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [nodes, setNodes] = useState<ProcessNode[]>(DEMO_NODES);
  const [connections, setConnections] = useState<ProcessConnection[]>(DEMO_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [spaghettiMode, setSpaghettiMode] = useState(false);
  const [flowFilters, setFlowFilters] = useState<Record<FlowType, boolean>>({ material: true, information: true, people: true });
  const [suggestions, setSuggestions] = useState<AILeanSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('Processes');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [factoryLayer, setFactoryLayer] = useState<FactoryRefElement[] | null>(null);
  const [showFactoryLayer, setShowFactoryLayer] = useState(true);

  useEffect(() => {
    if (searchParams.get('from') === 'factory') {
      try {
        const raw = sessionStorage.getItem('mw-factory-to-process');
        if (raw) {
          const parsed = JSON.parse(raw) as FactoryRefElement[];
          setFactoryLayer(parsed);
          sessionStorage.removeItem('mw-factory-to-process');
          searchParams.delete('from');
          setSearchParams(searchParams, { replace: true });
          toast.success('Factory layout imported as reference layer');
        }
      } catch {
        toast.error('Failed to import factory layout');
      }
    }
  }, []);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const drawingConnRef = useRef<{ fromId: string; fromPort: 'top' | 'right' | 'bottom' | 'left'; mouseX: number; mouseY: number } | null>(null);
  const panningRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);
  const [drawingLine, setDrawingLine] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  // ─── Canvas coordinate helpers ──────────────────────────────────────────

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // ─── Node drag ──────────────────────────────────────────────────────────

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const canvas = screenToCanvas(e.clientX, e.clientY);
    draggingRef.current = {
      nodeId,
      offsetX: canvas.x - node.x,
      offsetY: canvas.y - node.y,
    };
    setSelectedNodeId(nodeId);
    setSelectedConnId(null);
  }, [nodes, screenToCanvas]);

  // ─── Port drag (connection drawing) ─────────────────────────────────────

  const handlePortMouseDown = useCallback((nodeId: string, port: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pos = getPortPos(node, port);
    drawingConnRef.current = { fromId: nodeId, fromPort: port, mouseX: e.clientX, mouseY: e.clientY };
    setDrawingLine({ fromX: pos.x, fromY: pos.y, toX: pos.x, toY: pos.y });
  }, [nodes]);

  // ─── Canvas pan ─────────────────────────────────────────────────────────

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).classList?.contains('canvas-bg')) {
      setSelectedNodeId(null);
      setSelectedConnId(null);
      panningRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
    }
  }, [pan]);

  // ─── Mouse move (drag + draw + pan) ────────────────────────────────────

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Node drag
    if (draggingRef.current) {
      const canvas = screenToCanvas(e.clientX, e.clientY);
      const { nodeId, offsetX, offsetY } = draggingRef.current;
      setNodes(prev => prev.map(n =>
        n.id === nodeId
          ? { ...n, x: snapToGrid(canvas.x - offsetX), y: snapToGrid(canvas.y - offsetY) }
          : n
      ));
      return;
    }

    // Connection drawing
    if (drawingConnRef.current) {
      const canvas = screenToCanvas(e.clientX, e.clientY);
      setDrawingLine(prev => prev ? { ...prev, toX: canvas.x, toY: canvas.y } : null);
      return;
    }

    // Canvas pan
    if (panningRef.current) {
      const dx = e.clientX - panningRef.current.startX;
      const dy = e.clientY - panningRef.current.startY;
      setPan({
        x: panningRef.current.startPanX + dx,
        y: panningRef.current.startPanY + dy,
      });
    }
  }, [screenToCanvas]);

  // ─── Mouse up ──────────────────────────────────────────────────────────

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Complete connection drawing
    if (drawingConnRef.current) {
      const canvas = screenToCanvas(e.clientX, e.clientY);
      // Find target node by proximity
      const target = nodes.find(n => {
        const cx = n.x + NODE_SIZE / 2;
        const cy = n.y + NODE_SIZE / 2;
        return Math.hypot(canvas.x - cx, canvas.y - cy) < NODE_SIZE;
      });

      if (target && target.id !== drawingConnRef.current.fromId) {
        // Determine closest port on target
        const ports: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
        let bestPort: 'top' | 'right' | 'bottom' | 'left' = 'left';
        let bestDist = Infinity;
        for (const p of ports) {
          const pos = getPortPos(target, p);
          const d = Math.hypot(canvas.x - pos.x, canvas.y - pos.y);
          if (d < bestDist) { bestDist = d; bestPort = p; }
        }

        const newConn: ProcessConnection = {
          id: nextConnId(),
          from: drawingConnRef.current.fromId,
          to: target.id,
          fromPort: drawingConnRef.current.fromPort,
          toPort: bestPort,
          flowType: 'material', // default
        };
        setConnections(prev => [...prev, newConn]);
        toast.success('Connection created');
      }

      drawingConnRef.current = null;
      setDrawingLine(null);
    }

    draggingRef.current = null;
    panningRef.current = null;
  }, [nodes, screenToCanvas]);

  // ─── Drop handler (from library) ────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/process-node');
    if (!data) return;

    let parsed: { category: NodeCategory; label: string };
    try {
      parsed = JSON.parse(data) as { category: NodeCategory; label: string };
    } catch {
      return;
    }

    const item = resolveLibraryItem(parsed.category, parsed.label);
    if (!item) {
      toast.error('Could not add that element — unknown type');
      return;
    }

    const canvas = screenToCanvas(e.clientX, e.clientY);

    const newNode: ProcessNode = {
      id: nextNodeId(),
      category: item.category,
      label: item.label,
      icon: item.icon,
      x: snapToGrid(canvas.x - NODE_SIZE / 2),
      y: snapToGrid(canvas.y - NODE_SIZE / 2),
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    toast.success(`Added ${item.label}`);
  }, [screenToCanvas]);

  // ─── Zoom ───────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
  }, []);

  // ─── Keyboard ───────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
          setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
          setSelectedNodeId(null);
          toast.success('Node deleted');
        }
        if (selectedConnId) {
          setConnections(prev => prev.filter(c => c.id !== selectedConnId));
          setSelectedConnId(null);
          toast.success('Connection deleted');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, selectedConnId]);

  // ─── Filter connections ─────────────────────────────────────────────────

  const visibleConnections = useMemo(() =>
    connections.filter(c => flowFilters[c.flowType]),
    [connections, flowFilters],
  );

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleUpdateNode = useCallback((updates: Partial<ProcessNode>) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n));
  }, [selectedNodeId]);

  const handleAnalyzeAI = useCallback(() => {
    toast.loading('Analyzing process flow...', { duration: 1500 });
    setTimeout(() => {
      setSuggestions(AI_SUGGESTIONS);
      toast.success('AI analysis complete — 4 suggestions found');
    }, 1600);
  }, []);

  const handleDismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    toast('Suggestion dismissed');
  }, []);

  const handleApplySuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    toast.success('Suggestion applied');
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top Toolbar ────────────────────────────────────────────────── */}
      <div className="h-12 border-b border-[var(--border)] bg-card flex items-center px-4 gap-3 flex-shrink-0">
        {/* Title */}
        <AnimatedBlocks className="w-4 h-4 text-[var(--mw-yellow-600)]" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Process builder</span>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', !spaghettiMode ? 'text-foreground' : 'text-[var(--neutral-400)]')}>Design</span>
          <Switch
            checked={spaghettiMode}
            onCheckedChange={setSpaghettiMode}
          />
          <span className={cn('text-xs font-medium', spaghettiMode ? 'text-foreground' : 'text-[var(--neutral-400)]')}>Spaghetti</span>
        </div>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Flow type filters */}
        <div className="flex items-center gap-3">
          {(Object.keys(flowFilters) as FlowType[]).map(ft => (
            <label key={ft} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flowFilters[ft]}
                onChange={() => setFlowFilters(prev => ({ ...prev, [ft]: !prev[ft] }))}
                className="w-3 h-3 rounded accent-[var(--mw-yellow-400)]"
              />
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: FLOW_COLORS[ft] }}
                />
                <span className="text-xs text-[var(--neutral-500)]">{FLOW_LABELS[ft]}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-[var(--neutral-500)] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs border-[var(--border)]"
          onClick={() => toast.success('Process saved')}
        >
          <Save className="w-3.5 h-3.5" /> Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs border-[var(--border)]"
          onClick={() => toast('Load dialog coming soon')}
        >
          <Upload className="w-3.5 h-3.5" /> Load
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs bg-[var(--mw-purple)] hover:bg-[var(--mw-purple-600)] text-white"
          onClick={handleAnalyzeAI}
        >
          <Sparkles className="w-3.5 h-3.5" /> Analyze with AI
        </Button>
      </div>

      {/* ── 3-Panel Layout ────────────────────────────────────────────── */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">

        {/* ── Left Sidebar: Element Library ───────────────────────────── */}
        <ResizablePanel defaultSize={18} minSize={14} maxSize={28}>
          <div className="h-full flex flex-col bg-card overflow-hidden">
            <div className="p-3 border-b border-[var(--border)] flex-shrink-0">
              <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-2">Element library</p>
              <ToggleGroup
                type="single"
                value={activeTab}
                onValueChange={(val) => val && setActiveTab(val)}
                className="w-full"
                variant="outline"
              >
                {Object.keys(ELEMENT_LIBRARY).map(tab => (
                  <ToggleGroupItem key={tab} value={tab} className="flex-1 text-[10px] px-1 h-7 data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-primary-foreground">
                    {tab.slice(0, 4)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {ELEMENT_LIBRARY[activeTab]?.map((item) => (
                <LibraryItem key={item.label} item={item} onDragStart={() => {}} />
              ))}
            </div>

            {/* Legend */}
            <div className="border-t border-[var(--border)] p-3 flex-shrink-0 space-y-1.5">
              <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-1">Flow legend</p>
              {(Object.keys(FLOW_COLORS) as FlowType[]).map(ft => (
                <div key={ft} className="flex items-center gap-2">
                  <span className="w-6 h-0.5 rounded-full" style={{ backgroundColor: FLOW_COLORS[ft] }} />
                  <span className="text-xs text-[var(--neutral-500)] capitalize">{ft}</span>
                </div>
              ))}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">Shapes</p>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded border border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-100)]" />
                  <span className="text-xs text-[var(--neutral-500)]">Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-[var(--mw-blue)] bg-[var(--mw-blue-100)]" />
                  <span className="text-xs text-[var(--neutral-500)]">People</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rotate-45 border border-[var(--neutral-400)] bg-[var(--neutral-100)]" style={{ borderRadius: 2 }} />
                  <span className="text-xs text-[var(--neutral-500)]">Resource</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded border border-[var(--mw-purple)] bg-[var(--mw-purple-100)]" />
                  <span className="text-xs text-[var(--neutral-500)]">Custom</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded border border-[var(--neutral-300)] bg-[var(--neutral-50)]" />
                  <span className="text-xs text-[var(--neutral-500)]">Text</span>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Center: SVG Canvas ──────────────────────────────────────── */}
        <ResizablePanel defaultSize={56}>
          <div
            className="h-full overflow-hidden relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* CSS for flow animation */}
            <style>{`
              @keyframes flowDash {
                to { stroke-dashoffset: -24; }
              }
              .animate-flow {
                animation: flowDash 0.8s linear infinite;
              }
            `}</style>

            <svg
              ref={svgRef}
              className="w-full h-full"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ cursor: panningRef.current ? 'grabbing' : 'default' }}
            >
              {/* Grid background */}
              <defs>
                <pattern id="pb-grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % (GRID_SIZE * zoom)}, ${pan.y % (GRID_SIZE * zoom)}) scale(${zoom})`}>
                  <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={0.8} fill="var(--neutral-300)" />
                </pattern>

                {/* Arrow markers per flow type */}
                {(Object.keys(FLOW_COLORS) as FlowType[]).map(ft => (
                  <marker
                    key={ft}
                    id={`arrow-${ft}`}
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M 0 0.5 L 6 3 L 0 5.5 Z" fill={FLOW_COLORS[ft]} />
                  </marker>
                ))}

                {/* Generic drawing arrow */}
                <marker id="arrow-drawing" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M 0 0.5 L 6 3 L 0 5.5 Z" fill="var(--neutral-400)" />
                </marker>

                {/* MD3 Elevation filters */}
                <filter id="pb-elevation-1" x="-10%" y="-10%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.08" />
                </filter>
                <filter id="pb-elevation-2" x="-10%" y="-10%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
                </filter>
                <filter id="pb-elevation-3" x="-15%" y="-15%" width="140%" height="150%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Background rect for grid */}
              <rect className="canvas-bg" width="100%" height="100%" fill="url(#pb-grid)" />

              {/* Transform group for zoom + pan */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

                {/* Factory reference layer */}
                {factoryLayer && showFactoryLayer && (
                  <g opacity={0.3}>
                    {factoryLayer.map(el => {
                      if (el.category === 'zones') {
                        return (
                          <g key={el.id}>
                            <rect x={el.x} y={el.y} width={el.width} height={el.height} fill={el.color} fillOpacity={0.06} stroke={el.color} strokeWidth={1} strokeDasharray="8 4" rx={6} />
                            <text x={el.x + 8} y={el.y + 16} fontSize={10} fill={el.color} fontWeight={500} opacity={0.7}>{el.name}</text>
                          </g>
                        );
                      }
                      if (el.category === 'people') {
                        const cx = el.x + el.width / 2;
                        const cy = el.y + el.height / 2;
                        return <circle key={el.id} cx={cx} cy={cy} r={el.width / 2} fill={el.color} fillOpacity={0.1} stroke={el.color} strokeWidth={0.5} />;
                      }
                      if (el.category === 'machines') {
                        return (
                          <g key={el.id}>
                            <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="var(--neutral-200)" fillOpacity={0.4} stroke="var(--neutral-400)" strokeWidth={0.5} rx={4} />
                            <text x={el.x + el.width / 2} y={el.y + el.height / 2 + 3} textAnchor="middle" fontSize={8} fill="var(--neutral-500)" fontWeight={500}>{el.name}</text>
                          </g>
                        );
                      }
                      return (
                        <rect key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} fill="var(--neutral-300)" fillOpacity={0.2} stroke="var(--neutral-400)" strokeWidth={0.5} rx={2} />
                      );
                    })}
                  </g>
                )}

                {/* Connections */}
                {visibleConnections.map(conn => (
                  <ConnectionPath
                    key={conn.id}
                    conn={conn}
                    nodes={nodes}
                    animated={spaghettiMode}
                    selected={selectedConnId === conn.id}
                    onClick={() => {
                      setSelectedConnId(conn.id);
                      setSelectedNodeId(null);
                    }}
                  />
                ))}

                {/* Drawing line (in progress) */}
                {drawingLine && (
                  <line
                    x1={drawingLine.fromX}
                    y1={drawingLine.fromY}
                    x2={drawingLine.toX}
                    y2={drawingLine.toY}
                    stroke="var(--neutral-400)"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    markerEnd="url(#arrow-drawing)"
                  />
                )}

                {/* Nodes */}
                {nodes.map(node => (
                  <CanvasNode
                    key={node.id}
                    node={node}
                    selected={selectedNodeId === node.id}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                    onPortMouseDown={(port, e) => handlePortMouseDown(node.id, port, e)}
                  />
                ))}
              </g>
            </svg>

            {/* Factory layer imported banner */}
            <AnimatePresence>
              {factoryLayer && showFactoryLayer && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 shadow-[var(--elevation-2)] dark:bg-neutral-800"
                >
                  <Factory className="h-3.5 w-3.5 text-[var(--mw-yellow-600)]" />
                  <span className="text-xs text-[var(--neutral-600)]">Factory layout imported as reference</span>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1" onClick={() => setShowFactoryLayer(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas empty state hint */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-2">
                  <LayoutGrid className="w-12 h-12 mx-auto text-[var(--neutral-300)]" />
                  <p className="text-sm text-[var(--neutral-400)]">Drag elements from the library to start building</p>
                </div>
              </div>
            )}

            {/* Spaghetti mode indicator */}
            {spaghettiMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 bg-[var(--mw-purple)] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                Spaghetti diagram active
              </motion.div>
            )}

            {/* Floating bottom toolbar for text-shapes */}
            <AnimatePresence>
              {selectedNodeId && (() => {
                const selectedNode = nodes.find(n => n.id === selectedNodeId);
                if (!selectedNode || selectedNode.category !== 'text-shapes') return null;
                const isTextNode = selectedNode.label === 'Text Label';
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 shadow-[var(--elevation-3)] dark:bg-neutral-800"
                  >
                    {isTextNode ? (
                      <>
                        <span className="text-[10px] font-medium text-[var(--neutral-500)]">Size</span>
                        <ToggleGroup type="single" defaultValue="14" className="gap-0.5">
                          <ToggleGroupItem value="11" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">S</ToggleGroupItem>
                          <ToggleGroupItem value="14" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">M</ToggleGroupItem>
                          <ToggleGroupItem value="18" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">L</ToggleGroupItem>
                          <ToggleGroupItem value="24" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">XL</ToggleGroupItem>
                        </ToggleGroup>
                        <div className="h-4 w-px bg-[var(--border)]" />
                        <span className="text-[10px] font-medium text-[var(--neutral-500)]">Weight</span>
                        <ToggleGroup type="single" defaultValue="400" className="gap-0.5">
                          <ToggleGroupItem value="300" className="h-7 px-2 text-[10px] rounded-full font-light data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Light</ToggleGroupItem>
                          <ToggleGroupItem value="400" className="h-7 px-2 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Regular</ToggleGroupItem>
                          <ToggleGroupItem value="700" className="h-7 px-2 text-[10px] rounded-full font-bold data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Bold</ToggleGroupItem>
                        </ToggleGroup>
                        <div className="h-4 w-px bg-[var(--border)]" />
                        <span className="text-[10px] font-medium text-[var(--neutral-500)]">Align</span>
                        <ToggleGroup type="single" defaultValue="left" className="gap-0.5">
                          <ToggleGroupItem value="left" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">L</ToggleGroupItem>
                          <ToggleGroupItem value="center" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">C</ToggleGroupItem>
                          <ToggleGroupItem value="right" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">R</ToggleGroupItem>
                        </ToggleGroup>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-medium text-[var(--neutral-500)]">Fill</span>
                        <ToggleGroup type="single" defaultValue="25" className="gap-0.5">
                          <ToggleGroupItem value="0" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">0%</ToggleGroupItem>
                          <ToggleGroupItem value="25" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">25%</ToggleGroupItem>
                          <ToggleGroupItem value="50" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">50%</ToggleGroupItem>
                          <ToggleGroupItem value="100" className="h-7 w-9 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">100%</ToggleGroupItem>
                        </ToggleGroup>
                        <div className="h-4 w-px bg-[var(--border)]" />
                        <span className="text-[10px] font-medium text-[var(--neutral-500)]">Stroke</span>
                        <ToggleGroup type="single" defaultValue="1" className="gap-0.5">
                          <ToggleGroupItem value="0" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">None</ToggleGroupItem>
                          <ToggleGroupItem value="1" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">1</ToggleGroupItem>
                          <ToggleGroupItem value="2" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">2</ToggleGroupItem>
                          <ToggleGroupItem value="4" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">4</ToggleGroupItem>
                        </ToggleGroup>
                      </>
                    )}
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Right Sidebar: Properties + AI ──────────────────────────── */}
        <ResizablePanel defaultSize={26} minSize={20} maxSize={36}>
          <div className="h-full flex flex-col bg-card overflow-hidden">
            {/* Top section: Properties */}
            <div className="flex-1 overflow-y-auto p-4 border-b border-[var(--border)]">
              {selectedNode ? (
                <PropertiesPanel
                  key={selectedNodeId}
                  node={selectedNode}
                  onUpdate={handleUpdateNode}
                  onClose={() => setSelectedNodeId(null)}
                />
              ) : selectedConnId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Connection properties</span>
                    <button
                      onClick={() => setSelectedConnId(null)}
                      className="p-1.5 hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-[var(--neutral-500)]" />
                    </button>
                  </div>

                  {/* Flow type selector */}
                  <div>
                    <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-1.5">Flow type</p>
                    <ToggleGroup
                      type="single"
                      value={connections.find(c => c.id === selectedConnId)?.flowType ?? 'material'}
                      onValueChange={(val) => {
                        if (!val) return;
                        setConnections(prev => prev.map(c =>
                          c.id === selectedConnId ? { ...c, flowType: val as FlowType } : c
                        ));
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      {(Object.keys(FLOW_COLORS) as FlowType[]).map(ft => (
                        <ToggleGroupItem key={ft} value={ft} className="flex-1 text-xs h-8 gap-1 capitalize data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-primary-foreground">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FLOW_COLORS[ft] }} />
                          {ft}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  {/* Connection info */}
                  {(() => {
                    const conn = connections.find(c => c.id === selectedConnId);
                    if (!conn) return null;
                    const fromNode = nodes.find(n => n.id === conn.from);
                    const toNode = nodes.find(n => n.id === conn.to);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                          <span className="font-medium text-foreground">{fromNode?.label ?? 'Unknown'}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium text-foreground">{toNode?.label ?? 'Unknown'}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Delete connection */}
                  <div className="pt-2 border-t border-[var(--border)]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-10 border-destructive text-destructive hover:bg-[var(--mw-error-light)] dark:hover:bg-red-900/20 text-xs"
                      onClick={() => {
                        setConnections(prev => prev.filter(c => c.id !== selectedConnId));
                        setSelectedConnId(null);
                        toast.success('Connection deleted');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" /> Delete connection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                  <div className="w-12 h-12 rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[var(--neutral-400)]" />
                  </div>
                  <p className="text-xs text-[var(--neutral-500)]">Select a node or connection to view properties</p>
                  <p className="text-xs text-[var(--neutral-400)]">Click on nodes to select. Drag ports to connect.</p>
                </div>
              )}
            </div>

            {/* Bottom section: AI Lean Suggestions */}
            <div className="flex-shrink-0 max-h-[45%] overflow-y-auto p-4">
              <AILeanPanel
                suggestions={suggestions}
                onDismiss={handleDismissSuggestion}
                onApply={handleApplySuggestion}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
