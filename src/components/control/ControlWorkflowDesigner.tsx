/**
 * ControlWorkflowDesigner — AI Agent Workflow Designer
 * Visual node-canvas workflow builder with AI generation.
 * Lives in Control module alongside Role Designer.
 */

import React, { useState } from 'react';
import {
  Sparkles, Plus, Play, Save, Edit2, Copy, Trash2, X,
  RefreshCw, Zap, Bell, GitBranch, ShoppingCart, Mail,
  Settings2, Calendar, Pause, ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { WorkflowCanvas, type WFNode } from './WorkflowCanvas';
import { AIInsightCard } from '../shared/AIInsightCard';

// ─── Workflow list data ───────────────────────────────────────────────────────

const WORKFLOWS = [
  { id: 'job-arrival',   name: 'Job arrival automation',   status: 'active', runs: 142, lastRun: '2 hours ago', trigger: 'New job created'         },
  { id: 'qc-fail',       name: 'QC failure response',       status: 'active',  runs: 28,  lastRun: 'Yesterday',   trigger: 'QC check failed'          },
  { id: 'low-stock',     name: 'Low stock alert',           status: 'paused',  runs: 0,   lastRun: 'Mar 15',      trigger: 'Stock below minimum'      },
  { id: 'po-approval',   name: 'PO approval chain',         status: 'active',  runs: 67,  lastRun: '4 hours ago', trigger: 'PO submitted for approval' },
  { id: 'job-complete',  name: 'Job completion notify',     status: 'draft',   runs: 0,   lastRun: 'Never',       trigger: 'Job status → Done'        },
];

type WFStatus = 'active' | 'paused' | 'draft';

const STATUS_CFG: Record<WFStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]' },
  paused: { bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]' },
  draft:  { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]' },
};

// ─── Node palette ─────────────────────────────────────────────────────────────

const NODE_PALETTE = [
  { kind: 'trigger',      label: 'Trigger',        bg: 'bg-[#FF8B00]', icon: Zap         },
  { kind: 'ai',           label: 'AI action',      bg: 'bg-[#7C3AED]', icon: Sparkles    },
  { kind: 'action',       label: 'Update record',  bg: 'bg-[#36B37E]', icon: RefreshCw   },
  { kind: 'notification', label: 'Notification',   bg: 'bg-[#0A7AFF]', icon: Bell        },
  { kind: 'condition',    label: 'Condition',      bg: 'bg-[#0052CC]', icon: GitBranch   },
  { kind: 'email',        label: 'Send email',     bg: 'bg-[#0A7AFF]', icon: Mail        },
  { kind: 'purchase',     label: 'Create PO',      bg: 'bg-[#36B37E]', icon: ShoppingCart},
  { kind: 'schedule',     label: 'Schedule',       bg: 'bg-[#36B37E]', icon: Calendar    },
  { kind: 'machine',      label: 'Assign machine', bg: 'bg-[#525252]', icon: Settings2   },
  { kind: 'hold',         label: 'Hold job',       bg: 'bg-[#EF4444]', icon: Pause       },
];

// ─── Node detail panel ────────────────────────────────────────────────────────

function NodeDetailPanel({
  node,
  onClose,
}: {
  node: WFNode;
  onClose: () => void;
}) {
  return (
    <div className="w-[272px] flex-shrink-0 border-l border-[#E5E5E5] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-[#E5E5E5] px-4 flex items-center justify-between flex-shrink-0">
        <span className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
          Node properties
        </span>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#F5F5F5] rounded transition-colors"
        >
          <X className="w-4 h-4 text-[#737373]" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Kind badge */}
        <div>
          <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1.5">Node type</p>
          <span className="inline-flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-1 rounded text-[12px] text-[#0A0A0A] capitalize font-medium">
            {node.kind}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block mb-1.5">
            Title
          </label>
          <input
            className="w-full bg-[#F5F5F5] border border-transparent rounded-md px-3 py-2 text-[13px] text-[#0A0A0A] focus:bg-white focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] outline-none transition-colors"
            defaultValue={node.title}
          />
        </div>

        {/* Props */}
        {node.props.map(([label, value]) => (
          <div key={label}>
            <label className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block mb-1.5">
              {label}
            </label>
            <input
              className="w-full bg-[#F5F5F5] border border-transparent rounded-md px-3 py-2 text-[13px] text-[#0A0A0A] focus:bg-white focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] outline-none transition-colors"
              defaultValue={value}
            />
          </div>
        ))}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button size="sm" className="w-full h-9 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] text-[12px] font-medium">
            Apply changes
          </Button>
          <Button size="sm" variant="outline" className="w-full h-9 border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2] text-[12px]">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove node
          </Button>
        </div>
      </div>

      {/* AI tip */}
      <div className="p-4 border-t border-[#E5E5E5] flex-shrink-0">
        <AIInsightCard title="AI suggestion" className="text-[11px]">
          {node.kind === 'condition'
            ? 'Condition nodes work best with a 2–3 branch limit. Add an "Else" branch to catch unmatched cases.'
            : node.kind === 'ai'
            ? 'This AI node can read job history to auto-classify priority. Connect it before a condition node.'
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
    }, 2200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <div className="w-[268px] flex-shrink-0 border-r border-[#E5E5E5] bg-white flex flex-col overflow-hidden">

        {/* Panel header */}
        <div className="p-4 border-b border-[#E5E5E5] space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
              Workflows
            </h2>
            <Button size="sm" className="h-7 w-7 p-0 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C]">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* AI generator */}
          <div className="bg-[#F5F3FF] border border-[#7C3AED]/25 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="text-[12px] font-semibold text-[#7C3AED]">Generate with AI</span>
            </div>
            <textarea
              className="w-full bg-white border border-[#E5E5E5] rounded-md text-[12px] px-2.5 py-2 text-[#0A0A0A] resize-none focus:outline-none focus:border-[#7C3AED] transition-colors leading-relaxed"
              rows={2}
              placeholder="e.g. When a job is overdue, notify the manager and reschedule the machine…"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="sm"
              className={cn(
                'w-full h-7 mt-2 text-[11px] font-medium gap-1.5',
                isGenerating || !aiPrompt.trim()
                  ? 'bg-[#7C3AED]/50 text-white cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white',
              )}
              disabled={!aiPrompt.trim() || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating
                ? <><RefreshCw className="w-3 h-3 animate-spin" /> Generating…</>
                : <><Sparkles className="w-3 h-3" /> Generate workflow</>}
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
                  'w-full text-left px-3 py-2.5 rounded-lg transition-colors',
                  isSelected ? 'bg-[#F5F5F5] border border-[#E5E5E5]' : 'hover:bg-[#F5F5F5]',
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] font-medium text-[#0A0A0A] truncate pr-2 leading-tight">{wf.name}</span>
                  <Badge className={cn('text-[10px] px-1.5 py-0 h-4 border-0 flex-shrink-0 rounded', sc.bg, sc.text)}>
                    {wf.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#737373]">{wf.trigger}</p>
                <p className="text-[11px] text-[#A3A3A3]">{wf.runs} runs · {wf.lastRun}</p>
              </button>
            );
          })}
        </div>

        {/* Node palette */}
        <div className="border-t border-[#E5E5E5] p-3 flex-shrink-0">
          <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-2">
            Node palette
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {NODE_PALETTE.map(nt => {
              const Icon = nt.icon;
              return (
                <div
                  key={nt.kind}
                  className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] cursor-grab active:cursor-grabbing hover:bg-[#F5F5F5] transition-colors"
                  draggable
                >
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', nt.bg)}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] text-[#0A0A0A] truncate leading-tight">{nt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Center: canvas ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="h-14 border-b border-[#E5E5E5] bg-white flex items-center px-4 gap-3 flex-shrink-0">
          {/* Identity */}
          <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A] truncate leading-tight">
              {selectedWF.name}
            </p>
            <p className="text-[11px] text-[#737373]">Trigger: {selectedWF.trigger}</p>
          </div>

          {/* Stats */}
          <span className="text-[12px] text-[#737373] hidden lg:block whitespace-nowrap">
            {selectedWF.runs} runs · {selectedWF.lastRun}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-[#E5E5E5] text-[#0A0A0A] text-[12px] hidden sm:flex">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-[#E5E5E5] text-[#0A0A0A] text-[12px] hidden md:flex">
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </Button>
            <Button size="sm" className="h-8 gap-1.5 bg-[#36B37E] hover:bg-[#2D9E6D] text-white text-[12px]">
              <Play className="w-3.5 h-3.5" /> Run
            </Button>
            <Button size="sm" className="h-8 gap-1.5 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] text-[12px] font-medium">
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <WorkflowCanvas onSelectNode={setSelectedNode} />
      </div>

      {/* ── Right panel: node detail ──────────────────────────────────────── */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
