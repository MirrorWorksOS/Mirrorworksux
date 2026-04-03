/**
 * ControlWorkflowDesigner — AI Agent Workflow Designer
 * Visual node-canvas workflow builder with AI generation.
 * Lives in Control module alongside Role Designer.
 * v2: Enhanced node detail panel, more workflow templates, visual canvas.
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Sparkles, Plus, Play, Save, Edit2, Copy, Trash2, X,
  RefreshCw, Zap, Bell, GitBranch, ShoppingCart, Mail,
  Settings2, Calendar, Pause, Timer,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';
import { WorkflowCanvas, WORKFLOW_DATA, type WFNode } from './WorkflowCanvas';
import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';
import { IconWell } from '@/components/shared/icons/IconWell';

// ─── Workflow list data ───────────────────────────────────────────────────────

const WORKFLOWS = [
  { id: 'job-arrival',   name: 'Job arrival automation',       status: 'active', runs: 142, lastRun: '2 hours ago', trigger: 'New job created'           },
  { id: 'qc-fail',       name: 'QC failure response',          status: 'active',  runs: 28,  lastRun: 'Yesterday',   trigger: 'QC check failed'           },
  { id: 'low-stock',     name: 'Low stock alert',              status: 'paused',  runs: 0,   lastRun: 'Mar 15',      trigger: 'Stock below minimum'       },
  { id: 'po-approval',   name: 'Purchase order approval',      status: 'active',  runs: 67,  lastRun: '4 hours ago', trigger: 'PO submitted for approval' },
  { id: 'job-complete',  name: 'Job completion notify',        status: 'draft',   runs: 0,   lastRun: 'Never',       trigger: 'Job status -> Done'        },
];

type WFStatus = 'active' | 'paused' | 'draft';

const STATUS_CFG: Record<WFStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]' },
  paused: { bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
  draft:  { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]' },
};

// ─── Node palette ─────────────────────────────────────────────────────────────

const NODE_PALETTE = [
  { kind: 'trigger',      label: 'Trigger',        bg: 'bg-[var(--mw-success)]',          icon: Zap         },
  { kind: 'ai',           label: 'AI action',      bg: 'bg-[var(--mw-purple)]',   icon: Sparkles    },
  { kind: 'action',       label: 'Update record',  bg: 'bg-[var(--mw-info)]',     icon: RefreshCw   },
  { kind: 'notification', label: 'Notification',   bg: 'bg-[var(--mw-yellow-400)]', icon: Bell      },
  { kind: 'condition',    label: 'Condition',       bg: 'bg-[var(--mw-warning)]',  icon: GitBranch   },
  { kind: 'email',        label: 'Send email',     bg: 'bg-[var(--mw-purple)]',   icon: Mail        },
  { kind: 'purchase',     label: 'Create PO',      bg: 'bg-[var(--mw-error)]',    icon: ShoppingCart },
  { kind: 'schedule',     label: 'Schedule',       bg: 'bg-[var(--mw-purple)]',            icon: Calendar    },
  { kind: 'machine',      label: 'Assign machine', bg: 'bg-[var(--neutral-600)]', icon: Settings2   },
  { kind: 'hold',         label: 'Hold job',       bg: 'bg-[var(--mw-warning)]',  icon: Pause       },
  { kind: 'delay',        label: 'Delay / Wait',   bg: 'bg-[var(--neutral-500)]',            icon: Timer       },
];

// ─── Type-specific config fields ─────────────────────────────────────────────

function TriggerFields() {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Event type</label>
        <Select defaultValue="record_created">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="record_created">Record created</SelectItem>
            <SelectItem value="record_updated">Record updated</SelectItem>
            <SelectItem value="field_changed">Field changed</SelectItem>
            <SelectItem value="scheduled">Scheduled (cron)</SelectItem>
            <SelectItem value="webhook">Webhook received</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Filter conditions</label>
        <Input className="h-8 text-xs" defaultValue="status = 'New'" />
      </div>
    </>
  );
}

function ConditionFields() {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Field</label>
        <Select defaultValue="total_value">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="total_value">Total value</SelectItem>
            <SelectItem value="qty_on_hand">Qty on hand</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="severity">Severity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Operator</label>
        <Select defaultValue=">">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="=">Equals (=)</SelectItem>
            <SelectItem value="!=">Not equals (!=)</SelectItem>
            <SelectItem value=">">Greater than (&gt;)</SelectItem>
            <SelectItem value="<">Less than (&lt;)</SelectItem>
            <SelectItem value=">=">Greater or equal (&gt;=)</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Value</label>
        <Input className="h-8 text-xs" defaultValue="5000" />
      </div>
    </>
  );
}

function EmailFields() {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">To</label>
        <Input className="h-8 text-xs" defaultValue="{{record.contact_email}}" />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Subject</label>
        <Input className="h-8 text-xs" defaultValue="Order Confirmation - {{record.id}}" />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Template</label>
        <Select defaultValue="order_confirm">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="order_confirm">Order Confirmation</SelectItem>
            <SelectItem value="po_confirm">PO Confirmation</SelectItem>
            <SelectItem value="qc_report">QC Report</SelectItem>
            <SelectItem value="custom">Custom template</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function NotificationFields() {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Channel</label>
        <Select defaultValue="slack">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="slack">Slack</SelectItem>
            <SelectItem value="teams">Microsoft Teams</SelectItem>
            <SelectItem value="in_app">In-app notification</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Message</label>
        <Textarea className="text-xs" rows={2} defaultValue="New event triggered: {{record.title}}" />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Priority</label>
        <Select defaultValue="normal">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function AIFields() {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Prompt</label>
        <Textarea className="text-xs" rows={3} defaultValue="Analyse the incoming record and classify its priority based on value, urgency, and customer tier." />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Model</label>
        <Select defaultValue="claude-sonnet">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
            <SelectItem value="claude-haiku">Claude Haiku</SelectItem>
            <SelectItem value="claude-opus">Claude Opus</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function ActionFields() {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Action type</label>
        <Select defaultValue="update">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="update">Update record</SelectItem>
            <SelectItem value="create">Create record</SelectItem>
            <SelectItem value="delete">Delete record</SelectItem>
            <SelectItem value="link">Link records</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Target record</label>
        <Select defaultValue="job">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="po">Purchase Order</SelectItem>
            <SelectItem value="inventory">Inventory</SelectItem>
            <SelectItem value="qc">QC Record</SelectItem>
            <SelectItem value="ncr">NCR</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

// ─── Node detail panel ────────────────────────────────────────────────────────

function NodeDetailPanel({
  node,
  onClose,
}: {
  node: WFNode;
  onClose: () => void;
}) {
  return (
    <div className="w-[300px] flex-shrink-0 border-l border-[var(--border)] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-[var(--border)] px-4 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-medium text-[var(--mw-mirage)]">
          Node properties
        </span>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[var(--neutral-100)] rounded transition-colors"
        >
          <X className="w-4 h-4 text-[var(--neutral-500)]" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Kind badge + icon */}
        <div>
          <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-1.5">Node type</p>
          <span className="inline-flex items-center gap-1.5 bg-[var(--neutral-100)] border border-[var(--border)] px-2 py-1 rounded text-xs text-[var(--mw-mirage)] capitalize font-medium">
            <node.icon className="w-3.5 h-3.5" />
            {node.kind}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">
            Name
          </label>
          <Input
            className="h-8 text-xs"
            defaultValue={node.title}
          />
        </div>

        {/* Existing props */}
        {node.props.map(([label, value]) => (
          <div key={label}>
            <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">
              {label}
            </label>
            <Input
              className="h-8 text-xs"
              defaultValue={value}
            />
          </div>
        ))}

        {/* Type-specific configuration fields */}
        <div className="border-t border-[var(--border)] pt-4 space-y-4">
          <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">Configuration</p>
          {node.kind === 'trigger' && <TriggerFields />}
          {node.kind === 'condition' && <ConditionFields />}
          {(node.kind === 'action' || node.kind === 'purchase' || node.kind === 'machine' || node.kind === 'schedule') && <ActionFields />}
          {node.kind === 'email' && <EmailFields />}
          {node.kind === 'notification' && <NotificationFields />}
          {node.kind === 'ai' && <AIFields />}
          {node.kind === 'delay' && (
            <div>
              <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Duration</label>
              <Input className="h-8 text-xs" defaultValue="24 hours" />
            </div>
          )}
          {node.kind === 'hold' && (
            <div>
              <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block mb-1.5">Hold reason</label>
              <Input className="h-8 text-xs" defaultValue="Awaiting materials" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2 border-t border-[var(--border)]">
          <Button
            size="sm"
            className="w-full h-12 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] text-xs font-medium"
            onClick={() => toast.success('Changes applied')}
          >
            Apply changes
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full h-12 border-[var(--border)] text-xs"
            onClick={() => toast.success('Node duplicated')}
          >
            <Copy className="w-4 h-4 mr-1.5" /> Duplicate node
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="outline" className="w-full h-12 border-destructive text-destructive hover:bg-[var(--mw-error-light)] text-xs">
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete node
              </Button>
            }
            title="Delete this node?"
            description="This will remove the node and all its connections from the workflow. This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={() => toast.success('Node deleted')}
          />
        </div>
      </div>

      {/* AI tip */}
      <div className="p-4 border-t border-[var(--border)] flex-shrink-0">
        <AIInsightCard title="AI suggestion" className="text-xs">
          {node.kind === 'condition'
            ? 'Condition nodes work best with a 2-3 branch limit. Add an "Else" branch to catch unmatched cases.'
            : node.kind === 'ai'
            ? 'This AI node can read job history to auto-classify priority. Connect it before a condition node.'
            : node.kind === 'delay'
            ? 'Consider adding a timeout action to handle cases where the wait exceeds the expected duration.'
            : node.kind === 'email'
            ? 'Add a condition node after this email to handle bounce-backs and delivery failures.'
            : 'Consider adding a notification node after this step to keep operators in the loop.'}
        </AIInsightCard>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ControlWorkflowDesigner() {
  const [selectedWF, setSelectedWF]       = useState(WORKFLOWS[0]);
  const [aiPrompt, setAiPrompt]           = useState('');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [selectedNode, setSelectedNode]   = useState<WFNode | null>(null);

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setAiPrompt('');
      toast.success('Workflow generated from AI prompt');
    }, 2200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const hasCanvasData = !!WORKFLOW_DATA[selectedWF.id];

  return (
    <div className="flex h-full overflow-hidden">

      {/* -- Left panel ---------------------------------------------------- */}
      <div className="w-[268px] flex-shrink-0 border-r border-[var(--border)] bg-white flex flex-col overflow-hidden">

        {/* Panel header */}
        <div className="p-4 border-b border-[var(--border)] space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--mw-mirage)]">
              Workflows
            </h2>
            <Button size="sm" className="h-10 w-10 p-0 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)]">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* AI generator */}
          <div className="bg-[var(--mw-purple-50)] border border-[var(--mw-purple)]/25 rounded-[var(--shape-lg)] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-[var(--neutral-500)]" />
              <span className="text-xs font-medium text-[var(--mw-purple)]">Generate with AI</span>
            </div>
            <Textarea
              className="w-full bg-white border border-[var(--border)] rounded-md text-xs px-2.5 py-2 text-[var(--mw-mirage)] resize-none focus:outline-none focus:border-[var(--mw-purple)] transition-colors leading-relaxed"
              rows={2}
              placeholder="e.g. When a job is overdue, notify the manager and reschedule the machine..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="sm"
              className={cn(
                'w-full h-10 mt-2 text-xs font-medium gap-1.5',
                isGenerating || !aiPrompt.trim()
                  ? 'bg-[var(--mw-purple)]/50 text-white cursor-not-allowed'
                  : 'bg-[var(--mw-purple)] hover:bg-[var(--mw-purple-600)] text-white',
              )}
              disabled={!aiPrompt.trim() || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate workflow</>}
            </Button>
          </div>
        </div>

        {/* Workflow list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {WORKFLOWS.map(wf => {
            const sc = STATUS_CFG[wf.status as WFStatus];
            const isSelected = selectedWF.id === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => { setSelectedWF(wf); setSelectedNode(null); }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-[var(--shape-lg)] transition-colors',
                  isSelected ? 'bg-[var(--neutral-100)] border border-[var(--border)]' : 'hover:bg-[var(--neutral-100)]',
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-[var(--mw-mirage)] truncate pr-2 leading-tight">{wf.name}</span>
                  <Badge className={cn('text-[10px] px-1.5 py-0 h-4 border-0 flex-shrink-0 rounded', sc.bg, sc.text)}>
                    {wf.status}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--neutral-500)]">{wf.trigger}</p>
                <p className="text-xs text-[var(--neutral-400)]">{wf.runs} runs &middot; {wf.lastRun}</p>
              </button>
            );
          })}
        </div>

        {/* Node palette */}
        <div className="border-t border-[var(--border)] p-3 flex-shrink-0">
          <p className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-2">
            Node palette
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {NODE_PALETTE.map(nt => {
              const Icon = nt.icon;
              return (
                <div
                  key={nt.kind}
                  className="flex items-center gap-1.5 p-1.5 rounded-md bg-[var(--neutral-100)] border border-[var(--border)] cursor-grab active:cursor-grabbing hover:bg-[var(--neutral-100)] transition-colors"
                  draggable
                >
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', nt.bg)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-[var(--mw-mirage)] truncate leading-tight">{nt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* -- Center: canvas ------------------------------------------------ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="h-14 border-b border-[var(--border)] bg-white flex items-center px-4 gap-3 flex-shrink-0">
          {/* Identity */}
          <IconWell icon={Sparkles} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--mw-mirage)] truncate leading-tight">
              {selectedWF.name}
            </p>
            <p className="text-xs text-[var(--neutral-500)]">Trigger: {selectedWF.trigger}</p>
          </div>

          {/* Stats */}
          <span className="text-xs text-[var(--neutral-500)] hidden lg:block whitespace-nowrap">
            {selectedWF.runs} runs &middot; {selectedWF.lastRun}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="h-10 gap-1.5 border-[var(--border)] text-[var(--mw-mirage)] text-xs hidden sm:flex"
              onClick={() => toast('Edit mode coming soon')}>
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="h-10 gap-1.5 border-[var(--border)] text-[var(--mw-mirage)] text-xs hidden md:flex"
              onClick={() => toast.success('Workflow duplicated')}>
              <Copy className="w-4 h-4" /> Duplicate
            </Button>
            <Button size="sm" className="h-10 gap-1.5 bg-[var(--mw-mirage)] hover:bg-[var(--mw-success)] text-white text-xs"
              onClick={() => toast.success('Workflow run started')}>
              <Play className="w-4 h-4" /> Run
            </Button>
            <Button size="sm" className="h-10 gap-1.5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] text-xs font-medium"
              onClick={() => toast.success('Workflow saved')}>
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        {hasCanvasData ? (
          <WorkflowCanvas onSelectNode={setSelectedNode} workflowId={selectedWF.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[var(--neutral-100)]">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--neutral-200)] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[var(--neutral-400)]" />
              </div>
              <p className="text-sm font-medium text-[var(--neutral-600)]">No canvas data yet</p>
              <p className="text-xs text-[var(--neutral-500)]">Use the AI generator or drag nodes from the palette to build this workflow.</p>
            </div>
          </div>
        )}
      </div>

      {/* -- Right panel: node detail -------------------------------------- */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
