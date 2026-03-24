/**
 * WorkflowCanvas — Visual node-based canvas for AI Agent Workflow Designer.
 * Renders nodes as absolute-positioned cards with SVG bezier connections.
 */

import React, { useState } from 'react';
import {
  Zap, Sparkles, RefreshCw, Bell, GitBranch,
  ShoppingCart, Calendar, Settings2, Mail, Pause,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../ui/utils';

const NODE_W = 220;
const CANVAS_W = 940;
const CANVAS_H = 1260;

// ─── Types ───────────────────────────────────────────────────────────────────

export type NodeKind = 'trigger' | 'ai' | 'action' | 'notification' | 'condition' | 'hold';

export interface WFNode {
  id: string;
  kind: NodeKind;
  title: string;
  icon: LucideIcon;
  x: number;
  y: number;
  h: number;
  props: [string, string][];
}

interface WFEdge {
  from: string;
  to: string;
  label?: string;
  labelColor?: string;
  labelBg?: string;
}

// ─── Visual styles per kind ───────────────────────────────────────────────────

const kindStyle: Record<NodeKind, { card: string; iconBg: string }> = {
  trigger:      { card: 'bg-white border-[var(--border)]',          iconBg: 'bg-[var(--mw-amber)]' },
  ai:           { card: 'bg-[var(--mw-purple-50)] border-[var(--mw-purple)]/30',   iconBg: 'bg-[var(--mw-purple)]' },
  action:       { card: 'bg-white border-[var(--border)]',          iconBg: 'bg-[var(--mw-mirage)]' },
  notification: { card: 'bg-white border-[var(--border)]',          iconBg: 'bg-[var(--mw-blue)]' },
  condition:    { card: 'bg-[var(--mw-mirage)] border-[var(--mw-info)]',      iconBg: 'bg-white/25'  },
  hold:         { card: 'bg-white border-[var(--mw-error)]/30',       iconBg: 'bg-[var(--mw-error)]' },
};

// ─── Workflow data ────────────────────────────────────────────────────────────

const NODES: WFNode[] = [
  // ── Center column ─────────────────────────────────────────────────────────
  {
    id: 'trigger', kind: 'trigger', title: 'Trigger', icon: Zap,
    x: 360, y: 0, h: 100,
    props: [['Evaluates', 'New rows only'], ['Schedule', 'Real-time'], ['Limit', 'Unlimited']],
  },
  {
    id: 'ai-analyse', kind: 'ai', title: 'AI: Analyse & prioritise', icon: Sparkles,
    x: 360, y: 140, h: 72,
    props: [['Type', 'Priority & materials']],
  },
  {
    id: 'update-status', kind: 'action', title: 'Update job status', icon: RefreshCw,
    x: 360, y: 252, h: 88,
    props: [['Run as', 'David Miller'], ['Object', 'Job']],
  },
  {
    id: 'notify-manager', kind: 'notification', title: 'Notify manager', icon: Bell,
    x: 360, y: 380, h: 88,
    props: [['Channel', 'bot_alliance'], ['Message', 'New job ready for floor']],
  },
  {
    id: 'check-material', kind: 'condition', title: 'Match: Material stock', icon: GitBranch,
    x: 360, y: 508, h: 100,
    props: [['Object', 'Inventory'], ['Field', 'qty_on_hand'], ['Compare to', 'min_reorder']],
  },
  {
    id: 'match-supplier', kind: 'condition', title: 'Match: Supplier', icon: GitBranch,
    x: 360, y: 648, h: 72,
    props: [['Object', 'Supplier']],
  },

  // ── Left branch: Stock available ──────────────────────────────────────────
  {
    id: 'schedule-job', kind: 'action', title: 'Schedule production', icon: Calendar,
    x: 60, y: 810, h: 88,
    props: [['Run as', 'David Miller'], ['Object', 'Job schedule']],
  },
  {
    id: 'assign-machine', kind: 'action', title: 'Assign to machine', icon: Settings2,
    x: 60, y: 938, h: 88,
    props: [['Run as', 'David Miller'], ['Object', 'Machine']],
  },
  {
    id: 'notify-operator', kind: 'notification', title: 'Send email', icon: Mail,
    x: 60, y: 1066, h: 88,
    props: [['Run as', 'Send as Alliance'], ['Column', 'operator_email']],
  },

  // ── Right branch: Stock insufficient ──────────────────────────────────────
  {
    id: 'create-po', kind: 'action', title: 'Create purchase order', icon: ShoppingCart,
    x: 660, y: 810, h: 88,
    props: [['Run as', 'David Miller'], ['Object', 'PO']],
  },
  {
    id: 'alert-buyer', kind: 'notification', title: 'Alert buyer', icon: Bell,
    x: 660, y: 938, h: 68,
    props: [['Channel', 'Highlight-new-sessions']],
  },
  {
    id: 'hold-job', kind: 'hold', title: 'Hold job', icon: Pause,
    x: 660, y: 1046, h: 88,
    props: [['Run as', 'Send as Alliance'], ['Column', 'buyer_holdback_email']],
  },
];

const EDGES: WFEdge[] = [
  { from: 'trigger',       to: 'ai-analyse'    },
  { from: 'ai-analyse',    to: 'update-status' },
  { from: 'update-status', to: 'notify-manager' },
  { from: 'notify-manager',to: 'check-material' },
  { from: 'check-material',to: 'match-supplier' },
  {
    from: 'match-supplier', to: 'schedule-job',
    label: 'Stock available', labelColor: 'var(--mw-success)', labelBg: 'var(--mw-success-light)',
  },
  {
    from: 'match-supplier', to: 'create-po',
    label: 'Stock insufficient', labelColor: 'var(--mw-error)', labelBg: 'var(--mw-error-100)',
  },
  { from: 'schedule-job',  to: 'assign-machine'   },
  { from: 'assign-machine',to: 'notify-operator'  },
  { from: 'create-po',     to: 'alert-buyer'      },
  { from: 'alert-buyer',   to: 'hold-job'         },
];

// ─── SVG Connection layer ────────────────────────────────────────────────────

function nodeById(id: string) {
  return NODES.find(n => n.id === id)!;
}

function Connections() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={CANVAS_W}
      height={CANVAS_H}
      overflow="visible"
    >
      <defs>
        <marker id="wf-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M 0 0.5 L 5 3 L 0 5.5 Z" fill="#C4C4C4" />
        </marker>
      </defs>

      {EDGES.map(edge => {
        const from = nodeById(edge.from);
        const to   = nodeById(edge.to);
        if (!from || !to) return null;

        const sx = from.x + NODE_W / 2;
        const sy = from.y + from.h;
        const tx = to.x   + NODE_W / 2;
        const ty = to.y;

        const dy = Math.max(Math.abs(ty - sy), 1);
        const cp = Math.min(dy * 0.55, 70);

        const d = `M ${sx} ${sy} C ${sx} ${sy + cp} ${tx} ${ty - cp} ${tx} ${ty - 6}`;

        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={d}
            stroke="var(--neutral-300)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#wf-arrow)"
          />
        );
      })}
    </svg>
  );
}

// ─── Branch labels ────────────────────────────────────────────────────────────

const BRANCH_LABELS = [
  { text: 'Stock available',    x: 170, y: 762, color: 'var(--mw-success)', bg: 'var(--mw-success-light)' },
  { text: 'Stock insufficient', x: 770, y: 762, color: 'var(--mw-error)', bg: 'var(--mw-error-100)' },
];

// ─── Node card ────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  selected,
  onClick,
}: {
  node: WFNode;
  selected: boolean;
  onClick: () => void;
}) {
  const s  = kindStyle[node.kind];
  const Icon = node.icon;
  const isDark = node.kind === 'condition';

  return (
    <div
      className={cn(
        'absolute border rounded-[var(--shape-lg)] p-3 cursor-pointer shadow-sm select-none',
        'transition-all duration-[var(--duration-short2)]',
        s.card,
        selected ? 'ring-2 ring-[var(--mw-yellow-400)] shadow-md' : 'hover:shadow-md',
      )}
      style={{ left: node.x, top: node.y, width: NODE_W, minHeight: node.h }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', s.iconBg)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={cn('text-xs font-semibold leading-tight truncate', isDark ? 'text-white' : 'text-[var(--mw-mirage)]')}>
          {node.title}
        </span>
      </div>

      {/* Properties */}
      <div className="space-y-1 pl-0.5">
        {node.props.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <span className={cn('text-xs flex-shrink-0', isDark ? 'text-white/55' : 'text-[var(--neutral-500)]')}>
              {label}:
            </span>
            <span className={cn('text-xs font-medium truncate', isDark ? 'text-white' : 'text-[var(--mw-blue)]')}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkflowCanvas({
  onSelectNode,
}: {
  onSelectNode: (node: WFNode | null) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (node: WFNode) => {
    const next = selectedId === node.id ? null : node;
    setSelectedId(next?.id ?? null);
    onSelectNode(next);
  };

  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        backgroundColor: 'var(--neutral-100)',
        backgroundImage: 'radial-gradient(circle, var(--neutral-200) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Inner canvas — extra padding so nodes aren't clipped */}
      <div style={{ minWidth: CANVAS_W + 48, minHeight: CANVAS_H + 48, padding: 24 }}>
        <div className="relative mx-auto" style={{ width: CANVAS_W, height: CANVAS_H }}>

          {/* SVG connection layer */}
          <Connections />

          {/* Branch labels */}
          {BRANCH_LABELS.map(bl => (
            <div
              key={bl.text}
              className="absolute text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
              style={{
                left: bl.x,
                top: bl.y,
                transform: 'translateX(-50%)',
                backgroundColor: bl.bg,
                color: bl.color,
              }}
            >
              {bl.text}
            </div>
          ))}

          {/* Nodes */}
          {NODES.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              onClick={() => handleClick(node)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
