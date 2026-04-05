/**
 * WorkflowCanvas — Visual node-based canvas for AI Agent Workflow Designer.
 * Renders nodes as absolute-positioned cards with SVG bezier connections.
 * v2: Enhanced node types, visual canvas with branching, add-step buttons.
 */

import React, { useState } from 'react';
import {
  Zap, Sparkles, RefreshCw, Bell, GitBranch,
  ShoppingCart, Calendar, Settings2, Mail, Pause,
  Plus, Clock, Timer,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../ui/utils';

const NODE_W = 220;
const CANVAS_W = 940;
const CANVAS_H = 1260;

// ─── Types ───────────────────────────────────────────────────────────────────

export type NodeKind =
  | 'trigger' | 'ai' | 'action' | 'notification' | 'condition'
  | 'hold' | 'email' | 'purchase' | 'schedule' | 'machine' | 'delay';

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

// ─── Workflow data sets ──────────────────────────────────────────────────────

interface WorkflowData {
  nodes: WFNode[];
  edges: WFEdge[];
  branchLabels: { text: string; x: number; y: number; color: string; bg: string }[];
  canvasH: number;
}

// -- Default: Job arrival automation --
const JOB_ARRIVAL_NODES: WFNode[] = [
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
  {
    id: 'schedule-job', kind: 'schedule', title: 'Schedule production', icon: Calendar,
    x: 60, y: 810, h: 88,
    props: [['Run as', 'David Miller'], ['Object', 'Job schedule']],
  },
  {
    id: 'assign-machine', kind: 'machine', title: 'Assign to machine', icon: Settings2,
    x: 60, y: 938, h: 88,
    props: [['Run as', 'David Miller'], ['Object', 'Machine']],
  },
  {
    id: 'notify-operator', kind: 'email', title: 'Send email', icon: Mail,
    x: 60, y: 1066, h: 88,
    props: [['Run as', 'Send as Alliance'], ['Column', 'operator_email']],
  },
  {
    id: 'create-po', kind: 'purchase', title: 'Create purchase order', icon: ShoppingCart,
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

const JOB_ARRIVAL_EDGES: WFEdge[] = [
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

const JOB_ARRIVAL_LABELS = [
  { text: 'Stock available',    x: 170, y: 762, color: 'var(--mw-success)', bg: 'var(--mw-success-light)' },
  { text: 'Stock insufficient', x: 770, y: 762, color: 'var(--mw-error)', bg: 'var(--mw-error-100)' },
];

// -- Purchase Order Approval workflow --
const PO_APPROVAL_NODES: WFNode[] = [
  {
    id: 'po-trigger', kind: 'trigger', title: 'PO submitted', icon: Zap,
    x: 360, y: 0, h: 80,
    props: [['Event', 'PO.submitted'], ['Schedule', 'Real-time']],
  },
  {
    id: 'po-ai-review', kind: 'ai', title: 'AI: Review PO details', icon: Sparkles,
    x: 360, y: 120, h: 72,
    props: [['Model', 'Claude Sonnet'], ['Prompt', 'Check pricing & terms']],
  },
  {
    id: 'po-value-check', kind: 'condition', title: 'PO value > $5,000?', icon: GitBranch,
    x: 360, y: 232, h: 80,
    props: [['Field', 'total_value'], ['Operator', '>'], ['Value', '$5,000']],
  },
  // Left branch: High value
  {
    id: 'po-notify-mgr', kind: 'notification', title: 'Notify finance manager', icon: Bell,
    x: 60, y: 400, h: 80,
    props: [['Channel', '#finance-approvals'], ['Priority', 'High']],
  },
  {
    id: 'po-delay-mgr', kind: 'delay', title: 'Wait 24h for approval', icon: Timer,
    x: 60, y: 520, h: 72,
    props: [['Duration', '24 hours'], ['Timeout action', 'Escalate']],
  },
  {
    id: 'po-approved-check', kind: 'condition', title: 'Manager approved?', icon: GitBranch,
    x: 60, y: 632, h: 80,
    props: [['Field', 'approval_status'], ['Operator', '='], ['Value', 'Approved']],
  },
  {
    id: 'po-send-supplier', kind: 'email', title: 'Send PO to supplier', icon: Mail,
    x: 60, y: 790, h: 80,
    props: [['To', 'supplier.contact'], ['Template', 'PO Confirmation']],
  },
  {
    id: 'po-escalate', kind: 'notification', title: 'Escalate to director', icon: Bell,
    x: 310, y: 790, h: 80,
    props: [['Channel', '#exec-approvals'], ['Priority', 'Urgent']],
  },
  // Right branch: Low value
  {
    id: 'po-auto-approve', kind: 'action', title: 'Auto-approve PO', icon: RefreshCw,
    x: 660, y: 400, h: 80,
    props: [['Object', 'PO'], ['Set', 'status = Approved']],
  },
  {
    id: 'po-auto-email', kind: 'email', title: 'Send PO to supplier', icon: Mail,
    x: 660, y: 520, h: 80,
    props: [['To', 'supplier.contact'], ['Template', 'PO Auto-Confirmed']],
  },
  {
    id: 'po-update-inv', kind: 'action', title: 'Update expected inventory', icon: RefreshCw,
    x: 660, y: 640, h: 80,
    props: [['Object', 'Inventory'], ['Set', 'expected_qty += order_qty']],
  },
];

const PO_APPROVAL_EDGES: WFEdge[] = [
  { from: 'po-trigger', to: 'po-ai-review' },
  { from: 'po-ai-review', to: 'po-value-check' },
  { from: 'po-value-check', to: 'po-notify-mgr', label: 'Yes (>$5k)', labelColor: 'var(--mw-error)', labelBg: 'var(--mw-error-100)' },
  { from: 'po-value-check', to: 'po-auto-approve', label: 'No (<=$5k)', labelColor: 'var(--mw-success)', labelBg: 'var(--mw-success-light)' },
  { from: 'po-notify-mgr', to: 'po-delay-mgr' },
  { from: 'po-delay-mgr', to: 'po-approved-check' },
  { from: 'po-approved-check', to: 'po-send-supplier', label: 'Yes', labelColor: 'var(--mw-success)', labelBg: 'var(--mw-success-light)' },
  { from: 'po-approved-check', to: 'po-escalate', label: 'No', labelColor: 'var(--mw-error)', labelBg: 'var(--mw-error-100)' },
  { from: 'po-auto-approve', to: 'po-auto-email' },
  { from: 'po-auto-email', to: 'po-update-inv' },
];

const PO_APPROVAL_LABELS = [
  { text: 'High value (>$5k)', x: 170, y: 352, color: 'var(--mw-error)', bg: 'var(--mw-error-100)' },
  { text: 'Low value (<=$5k)', x: 770, y: 352, color: 'var(--mw-success)', bg: 'var(--mw-success-light)' },
  { text: 'Approved', x: 60, y: 755, color: 'var(--mw-success)', bg: 'var(--mw-success-light)' },
  { text: 'Rejected / Timeout', x: 340, y: 755, color: 'var(--mw-error)', bg: 'var(--mw-error-100)' },
];

// -- Quality Alert Escalation workflow --
const QC_ALERT_NODES: WFNode[] = [
  {
    id: 'qc-trigger', kind: 'trigger', title: 'QC check failed', icon: Zap,
    x: 360, y: 0, h: 80,
    props: [['Event', 'QC.failed'], ['Schedule', 'Real-time']],
  },
  {
    id: 'qc-ai-classify', kind: 'ai', title: 'AI: Classify defect severity', icon: Sparkles,
    x: 360, y: 120, h: 80,
    props: [['Model', 'Claude Haiku'], ['Input', 'Defect images + measurements']],
  },
  {
    id: 'qc-severity-check', kind: 'condition', title: 'Severity = Critical?', icon: GitBranch,
    x: 360, y: 240, h: 80,
    props: [['Field', 'severity'], ['Operator', '='], ['Value', 'Critical']],
  },
  // Left: Critical path
  {
    id: 'qc-hold-job', kind: 'hold', title: 'Hold production line', icon: Pause,
    x: 60, y: 400, h: 80,
    props: [['Object', 'Production line'], ['Action', 'Immediate stop']],
  },
  {
    id: 'qc-notify-all', kind: 'notification', title: 'Alert all stakeholders', icon: Bell,
    x: 60, y: 520, h: 80,
    props: [['Channel', '#quality-critical'], ['SMS', 'QC Manager, Plant Manager']],
  },
  {
    id: 'qc-create-ncr', kind: 'action', title: 'Create NCR record', icon: RefreshCw,
    x: 60, y: 640, h: 80,
    props: [['Object', 'NCR'], ['Priority', 'P1 - Critical']],
  },
  {
    id: 'qc-schedule-review', kind: 'schedule', title: 'Schedule review meeting', icon: Calendar,
    x: 60, y: 760, h: 80,
    props: [['When', 'Within 2 hours'], ['Invitees', 'QC team + Engineering']],
  },
  // Right: Non-critical path
  {
    id: 'qc-log-defect', kind: 'action', title: 'Log defect in system', icon: RefreshCw,
    x: 660, y: 400, h: 80,
    props: [['Object', 'Defect log'], ['Auto-classify', 'Yes']],
  },
  {
    id: 'qc-notify-lead', kind: 'email', title: 'Email shift lead', icon: Mail,
    x: 660, y: 520, h: 80,
    props: [['To', 'shift.lead'], ['Template', 'QC Minor Defect']],
  },
  {
    id: 'qc-delay-rework', kind: 'delay', title: 'Wait for rework completion', icon: Timer,
    x: 660, y: 640, h: 72,
    props: [['Duration', 'Until status = Reworked'], ['Timeout', '48h']],
  },
  {
    id: 'qc-update-record', kind: 'action', title: 'Update QC record', icon: RefreshCw,
    x: 660, y: 752, h: 80,
    props: [['Object', 'QC Record'], ['Set', 'status = Resolved']],
  },
];

const QC_ALERT_EDGES: WFEdge[] = [
  { from: 'qc-trigger', to: 'qc-ai-classify' },
  { from: 'qc-ai-classify', to: 'qc-severity-check' },
  { from: 'qc-severity-check', to: 'qc-hold-job', label: 'Critical', labelColor: 'var(--mw-error)', labelBg: 'var(--mw-error-100)' },
  { from: 'qc-severity-check', to: 'qc-log-defect', label: 'Non-critical', labelColor: 'var(--mw-success)', labelBg: 'var(--mw-success-light)' },
  { from: 'qc-hold-job', to: 'qc-notify-all' },
  { from: 'qc-notify-all', to: 'qc-create-ncr' },
  { from: 'qc-create-ncr', to: 'qc-schedule-review' },
  { from: 'qc-log-defect', to: 'qc-notify-lead' },
  { from: 'qc-notify-lead', to: 'qc-delay-rework' },
  { from: 'qc-delay-rework', to: 'qc-update-record' },
];

const QC_ALERT_LABELS = [
  { text: 'Critical', x: 170, y: 352, color: 'var(--mw-error)', bg: 'var(--mw-error-100)' },
  { text: 'Non-critical', x: 770, y: 352, color: 'var(--mw-success)', bg: 'var(--mw-success-light)' },
];

// -- Map workflow IDs to data sets --
export const WORKFLOW_DATA: Record<string, WorkflowData> = {
  'job-arrival': { nodes: JOB_ARRIVAL_NODES, edges: JOB_ARRIVAL_EDGES, branchLabels: JOB_ARRIVAL_LABELS, canvasH: 1260 },
  'po-approval': { nodes: PO_APPROVAL_NODES, edges: PO_APPROVAL_EDGES, branchLabels: PO_APPROVAL_LABELS, canvasH: 940 },
  'qc-fail':     { nodes: QC_ALERT_NODES, edges: QC_ALERT_EDGES, branchLabels: QC_ALERT_LABELS, canvasH: 920 },
};

// ─── Visual styles per kind ───────────────────────────────────────────────────

const kindStyle: Record<NodeKind, { card: string; iconBg: string; borderLeft: string }> = {
  trigger:      { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-success)]',    borderLeft: 'border-l-[var(--mw-success)]' },
  ai:           { card: 'bg-[var(--mw-purple-50)] border-[var(--mw-purple)]/30', iconBg: 'bg-[var(--mw-mirage)]',    borderLeft: 'border-l-[var(--mw-purple)]' },
  action:       { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-info)]',      borderLeft: 'border-l-[var(--mw-info)]' },
  notification: { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-yellow-400)]', borderLeft: 'border-l-[var(--mw-yellow-400)]' },
  condition:    { card: 'bg-[var(--mw-mirage)] border-[var(--mw-info)]',         iconBg: 'bg-[var(--mw-warning)]',   borderLeft: 'border-l-[var(--mw-warning)]' },
  hold:         { card: 'bg-card border-[var(--mw-error)]/30',                   iconBg: 'bg-[var(--mw-warning)]',   borderLeft: 'border-l-[var(--mw-warning)]' },
  email:        { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-purple)]',    borderLeft: 'border-l-[var(--mw-purple)]' },
  purchase:     { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-error)]',     borderLeft: 'border-l-[var(--mw-error)]' },
  schedule:     { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-info)]',      borderLeft: 'border-l-[var(--mw-info)]' },
  machine:      { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--mw-mirage)]',    borderLeft: 'border-l-[var(--mw-mirage)]' },
  delay:        { card: 'bg-card border-[var(--border)]',                        iconBg: 'bg-[var(--neutral-500)]',  borderLeft: 'border-l-[var(--neutral-500)]' },
};

// ─── SVG Connection layer ────────────────────────────────────────────────────

function Connections({ edges, nodes, canvasW, canvasH }: { edges: WFEdge[]; nodes: WFNode[]; canvasW: number; canvasH: number }) {
  const nodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasW}
      height={canvasH}
      overflow="visible"
    >
      <defs>
        <marker id="wf-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M 0 0.5 L 5 3 L 0 5.5 Z" fill="var(--neutral-400)" />
        </marker>
      </defs>

      {edges.map(edge => {
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

// ─── Add Step Button ─────────────────────────────────────────────────────────

function AddStepButton({ x, y }: { x: number; y: number }) {
  return (
    <button
      className="absolute z-10 flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[var(--neutral-300)] bg-card text-[var(--neutral-400)] transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:border-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-400)]/10 hover:text-[var(--mw-yellow-600)] hover:shadow-[var(--elevation-2)] hover:scale-110"
      style={{ left: x - 12, top: y - 12 }}
      title="Add step"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  );
}

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
        'absolute border border-l-[3px] rounded-[var(--shape-lg)] p-3 cursor-pointer select-none',
        'transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
        'shadow-[var(--elevation-1)]',
        s.card,
        s.borderLeft,
        selected
          ? 'ring-2 ring-[var(--mw-yellow-400)] shadow-[var(--elevation-3)] scale-[1.02]'
          : 'hover:shadow-[var(--elevation-2)] hover:scale-[1.01]',
      )}
      style={{ left: node.x, top: node.y, width: NODE_W, minHeight: node.h }}
      onClick={onClick}
    >
      {/* Connection dot top */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[var(--neutral-300)] bg-card" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', s.iconBg)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={cn('text-xs font-medium leading-tight truncate', isDark ? 'text-white' : 'text-foreground')}>
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

      {/* Connection dot bottom */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[var(--neutral-300)] bg-card" />

      {/* Condition branch indicators */}
      {node.kind === 'condition' && (
        <div className="absolute -bottom-0.5 left-0 right-0 flex justify-between px-6">
          <span className="text-[9px] font-medium text-[var(--mw-success)] bg-[var(--mw-mirage)] px-1 rounded">Yes</span>
          <span className="text-[9px] font-medium text-[var(--mw-error)] bg-[var(--mw-mirage)] px-1 rounded">No</span>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkflowCanvas({
  onSelectNode,
  workflowId = 'job-arrival',
}: {
  onSelectNode: (node: WFNode | null) => void;
  workflowId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const data = WORKFLOW_DATA[workflowId] ?? WORKFLOW_DATA['job-arrival'];
  const { nodes, edges, branchLabels, canvasH } = data;

  const handleClick = (node: WFNode) => {
    const next = selectedId === node.id ? null : node;
    setSelectedId(next?.id ?? null);
    onSelectNode(next);
  };

  // Compute add-step button positions (midpoints of edges between vertically-aligned nodes)
  const addStepPositions = edges
    .filter(e => {
      const from = nodes.find(n => n.id === e.from);
      const to = nodes.find(n => n.id === e.to);
      if (!from || !to) return false;
      // Only show between same-column nodes (within 50px x delta)
      return Math.abs(from.x - to.x) < 50;
    })
    .map(e => {
      const from = nodes.find(n => n.id === e.from)!;
      const to = nodes.find(n => n.id === e.to)!;
      return {
        key: `${e.from}-${e.to}`,
        x: from.x + NODE_W / 2,
        y: from.y + from.h + (to.y - from.y - from.h) / 2,
      };
    });

  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        backgroundColor: 'var(--neutral-100)',
        backgroundImage: 'radial-gradient(circle, var(--neutral-200) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Inner canvas */}
      <div style={{ minWidth: CANVAS_W + 48, minHeight: canvasH + 48, padding: 24 }}>
        <div className="relative mx-auto" style={{ width: CANVAS_W, height: canvasH }}>

          {/* SVG connection layer */}
          <Connections edges={edges} nodes={nodes} canvasW={CANVAS_W} canvasH={canvasH} />

          {/* Branch labels */}
          {branchLabels.map(bl => (
            <div
              key={bl.text}
              className="absolute text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
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

          {/* Add-step buttons */}
          {addStepPositions.map(pos => (
            <AddStepButton key={pos.key} x={pos.x} y={pos.y} />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
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
