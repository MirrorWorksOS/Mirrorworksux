/**
 * BlocklySpike — proof-of-concept Blockly workspace for Product Studio.
 *
 * Goal: prove that
 *   1. Blockly looks/feels like Scratch with our custom blocks,
 *   2. We can emit a JSON shape (the future ProductDefinitionEngine v2),
 *   3. The authoring layer is cleanly decoupled from runtime.
 *
 * Throwaway code — once the spec lands the real editor replaces this.
 *
 * Route: /plan/product-studio/blockly-spike
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Blockly from 'blockly/core';
import { ArrowLeft, Code2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { registerSpikeBlocks } from './blocks';
import { SPIKE_TOOLBOX } from './toolbox';
import { generateSpikeProgram, type SpikeProgram } from './generator';

// Register blocks once at module load.
registerSpikeBlocks();

export function BlocklySpike() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [program, setProgram] = useState<SpikeProgram>({
    schemaVersion: 'spike-1',
    triggers: [],
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = Blockly.inject(containerRef.current, {
      toolbox: SPIKE_TOOLBOX as unknown as Blockly.utils.toolbox.ToolboxDefinition,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 2,
        minScale: 0.5,
        scaleSpeed: 1.1,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#e5e5e5',
        snap: true,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
      renderer: 'zelos', // the Scratch-like rounded renderer
    });

    workspaceRef.current = ws;

    const onChange = () => {
      try {
        setProgram(generateSpikeProgram(ws));
      } catch (err) {
        console.error('[BlocklySpike] generator failed', err);
      }
    };

    ws.addChangeListener(onChange);

    // Initial generation in case the workspace boots with content.
    onChange();

    return () => {
      ws.removeChangeListener(onChange);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col bg-background">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--neutral-200)] bg-card px-4 py-2.5 dark:border-[var(--neutral-800)]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/plan/product-studio')}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--mw-yellow-500)]" />
          <h1 className="text-sm font-semibold">Product Studio — Blockly spike</h1>
          <Badge variant="outline" className="text-[10px]">
            Throwaway
          </Badge>
        </div>
        <div className="flex-1" />
        <p className="hidden text-xs text-muted-foreground md:block">
          Drag blocks from the toolbox on the left. Live JSON on the right.
        </p>
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Workspace */}
        <div className="relative min-w-0 flex-1">
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        {/* Live JSON output */}
        <aside className="flex w-[380px] shrink-0 flex-col border-l border-[var(--neutral-200)] bg-card dark:border-[var(--neutral-800)]">
          <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 py-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
              Generated JSON
            </p>
            <Badge variant="outline" className="ml-auto text-[10px]">
              {program.triggers.length} trigger{program.triggers.length === 1 ? '' : 's'}
            </Badge>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto bg-[var(--neutral-50)] p-3 font-mono text-[10px] leading-relaxed text-[var(--neutral-800)] dark:bg-[var(--neutral-950)] dark:text-[var(--neutral-200)]">
            {JSON.stringify(program, null, 2)}
          </pre>
          <div className="shrink-0 border-t border-[var(--border)] p-3">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              This JSON is the future <code className="rounded bg-[var(--neutral-100)] px-1 dark:bg-[var(--neutral-800)]">ProductDefinitionEngine</code>{' '}
              format. The runtime evaluator reads this; the visual layer is just an authoring tool on top.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
