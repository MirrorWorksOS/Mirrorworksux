/**
 * ProductStudioV2 — Mirrorworks Product Studio (Blockly-based visual editor).
 *
 * Layout: toolbar (top), Blockly workspace (centre), live outputs panel (right)
 * with tabs for BOM, Costs, Work order, Warnings, and the raw engine JSON.
 *
 * The workspace XML is the source of truth for the visual layer; the generator
 * derives a `ProductDefinitionEngine + StudioV2Extras` pair on every change,
 * persists them to the product builder store, and feeds them through the
 * Studio v2 evaluator to render live rollups.
 *
 * Routes (canonical, post-consolidation):
 *   /plan/product-studio                 — pick a product
 *   /plan/product-studio/:productId      — edit a specific product
 *
 * Older `/v2/...` and `/blockly-spike` routes redirect here (see routes.tsx).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as Blockly from 'blockly/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- side-effect import enables Zelos renderer
import 'blockly/blocks';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Boxes,
  Coins,
  Code2,
  Hammer,
  Clock,
  Zap,
  Briefcase,
  Bell,
  ShoppingCart,
  CalendarClock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Plus,
  Package,
  SlidersHorizontal,
  RotateCcw,
  // Action-card icons (Phase 3b expanded vocabulary)
  FileText,
  Receipt,
  FileCheck2,
  CalendarCheck,
  Upload,
  Factory,
  ClipboardCheck,
  UserCheck,
  FileSpreadsheet,
  Boxes as BoxesReserve,
  Warehouse,
  ListTodo,
  MessageSquare,
  Webhook,
  Landmark,
  Play,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { IconWell } from '@/components/shared/icons/IconWell';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { useMaterialLibraryStore } from '@/store/materialLibraryStore';
import { useFinishLibraryStore } from '@/store/finishLibraryStore';
import { registerStudioV2Blocks } from './blocks';
import { buildStudioV2Toolbox } from './toolbox';
import {
  generateEngine,
  extractInputs,
  type InputDecl,
  type StudioV2Extras,
} from './generator';
import { evaluateStudioV2, type EvaluationResultV2 } from './evaluator';
import './blockly-theme.css';

// One-time block registration (safe to call repeatedly).
registerStudioV2Blocks();

// ── Helpers ──────────────────────────────────────────────────────────────────
const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});

function formatMins(min: number): string {
  if (min < 60) return `${min.toFixed(0)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  return m === 0 ? `${h} h` : `${h} h ${m} m`;
}

/** "5 s ago" / "12 m ago" — short relative timestamp for the autosave pill. */
function formatRelative(d: Date | null, now: number): string {
  if (!d) return '';
  const sec = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function ProductStudioV2() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const products = useProductBuilderStore((s) => s.products);
  const activeProductId = useProductBuilderStore((s) => s.activeProductId);
  const setActiveProduct = useProductBuilderStore((s) => s.setActiveProduct);
  const setDefinitionEngine = useProductBuilderStore((s) => s.setDefinitionEngine);
  const setBlocklyState = useProductBuilderStore((s) => s.setBlocklyState);
  const setScenarioInputs = useProductBuilderStore((s) => s.setScenarioInputs);
  const createProduct = useProductBuilderStore((s) => s.createProduct);
  const deleteProduct = useProductBuilderStore((s) => s.deleteProduct);

  const materials = useMaterialLibraryStore((s) => s.materials);
  const finishes = useFinishLibraryStore((s) => s.finishes);

  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const extrasRef = useRef<StudioV2Extras | null>(null);
  /** Tracks which product is currently mounted in the workspace so we only
   *  reset / restore on actual product changes (not on every render). */
  const loadedProductIdRef = useRef<string | null>(null);
  /** Suppresses the change-listener while we programmatically replay XML.
   *  Starts `true` so the bootstrap effect's initial reEvaluate (which fires
   *  on an empty workspace) doesn't clobber the saved XML before the restore
   *  effect has a chance to run. The restore effect flips it to `false` once
   *  the workspace has been hydrated. */
  const restoringRef = useRef<boolean>(true);
  /** Tracks the last XML we wrote to the store, so re-emits of identical XML
   *  (e.g. the synthetic change events that fire after `domToWorkspace`) don't
   *  flash a spurious "Saved · just now" pill on a freshly loaded product. */
  const lastPersistedXmlRef = useRef<string>('');

  const [evaluation, setEvaluation] = useState<EvaluationResultV2 | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<
    'formula' | 'bom' | 'costs' | 'ops' | 'time' | 'actions' | 'warnings' | 'json'
  >('formula');
  /** Toolbox collapse state — toggled by the toolbar button. The CSS in
   *  blockly-theme.css listens for `.mw-blockly-collapsed` on the shell and
   *  shrinks the toolbox rail to zero width. */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  /** Live outputs panel (BOM / Cost / …) — hide to widen the canvas. */
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
  /** Inputs panel state — declarations come from extractInputs(workspace) on
   *  every change; live values are mixed into the evaluator's initialVars. */
  const [inputDecls, setInputDecls] = useState<InputDecl[]>([]);
  const [scenarioInputs, setScenarioInputsState] = useState<
    Record<string, string | number | boolean>
  >({});
  const [inputsPanelOpen, setInputsPanelOpen] = useState<boolean>(true);
  /** Dry-run state — populated by the Run toolbar button. Captures the subset
   *  of the recipe that fires on the synthetic `manual.run` event (just the
   *  `mw_when_manual` hat's body) evaluated against the current scenario
   *  inputs. Shown in the DryRunDialog as a "would create…" preview, with a
   *  Commit toggle that (in v1) simply flips the cards' visual tone — wiring
   *  Commit to the real Plan / Make / Buy endpoints is a Phase 4 task. */
  const [dryRunResult, setDryRunResult] = useState<EvaluationResultV2 | null>(
    null,
  );
  const [dryRunOpen, setDryRunOpen] = useState<boolean>(false);
  const [dryRunCommit, setDryRunCommit] = useState<boolean>(false);
  /** Stable handle so the React effect that watches `scenarioInputs` can ask
   *  the Blockly bootstrap closure to re-run evaluation without re-mounting
   *  Blockly. The bootstrap effect assigns this; the watcher effect calls it. */
  const reEvaluateRef = useRef<() => void>(() => {});
  /** Latest scenarioInputs surfaced to the bootstrap closure via a ref so the
   *  Blockly change listener can read fresh values without being re-created. */
  const scenarioInputsRef = useRef(scenarioInputs);
  useEffect(() => {
    scenarioInputsRef.current = scenarioInputs;
  }, [scenarioInputs]);

  // Notify Blockly of the layout change so the workspace SVG resizes after the
  // CSS transition completes — otherwise the canvas keeps a phantom gutter /
  // misplaced scrollbars.
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    const t = window.setTimeout(() => Blockly.svgResize(ws), 220);
    return () => window.clearTimeout(t);
  }, [sidebarCollapsed, rightPanelOpen, inputsPanelOpen]);

  // 1 Hz tick so the "saved Xs ago" pill stays accurate without re-render churn.
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Sync route → store
  useEffect(() => {
    if (productId && productId !== activeProductId) {
      const exists = products.find((p) => p.id === productId);
      if (exists) setActiveProduct(productId);
    } else if (!productId && activeProductId) {
      setActiveProduct(null);
    }
  }, [productId, activeProductId, products, setActiveProduct]);

  const product = products.find((p) => p.id === activeProductId) ?? null;

  // Build toolbox JSON whenever the libraries change.
  const toolbox = useMemo(
    () => buildStudioV2Toolbox({ materials, finishes }),
    [materials, finishes],
  );

  // ── Blockly bootstrap (mount once) ────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const ws = Blockly.inject(container, {
      toolbox: toolbox as unknown as Blockly.utils.toolbox.ToolboxDefinition,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.95,
        maxScale: 2,
        minScale: 0.4,
        scaleSpeed: 1.1,
      },
      // Subtle dot grid sized to the design system 8px base grid (3 × 8 = 24).
      grid: { spacing: 24, length: 1, colour: '#E5E5E5', snap: true },
      // Horizontal scrollbar only. Blockly's *paired* vertical+horizontal bars
      // never auto-hide the vertical track (full-height "thumb") when there's no
      // vertical overflow — so after the toolbox flyout closes and main
      // scrollbars are shown again, a grey bar sticks to the right edge. Pan
      // vertically by dragging the workspace background; scroll horizontally
      // with the bar when needed.
      move: {
        scrollbars: { horizontal: true, vertical: false },
        drag: true,
        wheel: false,
      },
      renderer: 'zelos',
    });

    workspaceRef.current = ws;

    // ResizeObserver must attach in the same effect as `inject`, after `ws`
    // exists — a separate effect with `[] deps` can run when `workspaceRef` is
    // still null (e.g. Strict Mode timing), leaving scrollbars stuck at the
    // wrong size/position in the SVG.
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        Blockly.svgResize(ws);
      });
      ro.observe(container);
    }
    const syncSvgSize = () => {
      Blockly.svgResize(ws);
    };
    syncSvgSize();
    requestAnimationFrame(() => {
      syncSvgSize();
      requestAnimationFrame(syncSvgSize);
    });

    const reEvaluate = () => {
      try {
        // Build initialVars from scenario overrides ONLY. The canvas defaults
        // are emitted as `set_variable` ops at runtime by the input
        // declaration blocks themselves; the evaluator now skips those for any
        // var name that came in via initialVars (see RunCtx.overriddenVars),
        // so a sidebar override always wins over its canvas default.
        const initialVars: Record<string, string | number | boolean> = {
          ...scenarioInputsRef.current,
        };

        // Hand the live scenario to the generator so loop blocks whose count
        // is bound to a var (e.g. `repeat rungs times`) can unroll at
        // generation time using the user's current sidebar value, instead of
        // falling back to a single iteration + warning.
        const { engine, extras } = generateEngine(ws, initialVars);
        extrasRef.current = extras;

        // Surface declared inputs to the React layer so the Inputs sidebar can
        // render them. We walk the live workspace, not the engine, so the
        // unit / option metadata isn't lost during the lossy collapse to
        // set_variable engine ops.
        const decls = extractInputs(ws);
        setInputDecls(decls);

        // Seed the cycle-detection stack with the *active* product id so a
        // direct self-reference (`tpl-frame` dropping `tpl-frame`) is caught
        // on the first recursive hop instead of after one wasted full eval.
        const activeId = useProductBuilderStore.getState().activeProductId;
        const result = evaluateStudioV2({
          engine,
          extras,
          materials: useMaterialLibraryStore.getState().materials,
          finishes: useFinishLibraryStore.getState().finishes,
          // Hand the product library in so `product_ref` sub-assembly ops can
          // resolve referenced products recursively. Read fresh from the store
          // so the bootstrap closure stays stable across renders.
          products: useProductBuilderStore.getState().products,
          initialVars,
          parentStack: activeId ? new Set([activeId]) : undefined,
        });
        setEvaluation(result);

        // Persist engine + Blockly XML + extras under the active product.
        // Skip while we're replaying restored XML so we don't churn the store.
        if (
          !restoringRef.current &&
          useProductBuilderStore.getState().activeProductId
        ) {
          const dom = Blockly.Xml.workspaceToDom(ws);
          const xml = Blockly.Xml.domToText(dom);
          // No-op save guard: identical XML means a synthetic re-emit, not an
          // actual edit, so skip persistence + the "Saved" pill flash.
          if (xml !== lastPersistedXmlRef.current) {
            lastPersistedXmlRef.current = xml;
            setDefinitionEngine(engine);
            setBlocklyState(xml, extras);
            setSavedAt(new Date());
          }
        }
      } catch (err) {
        console.error('[ProductStudioV2] generator/evaluator failed', err);
      }
    };

    // Expose to the scenarioInputs watcher effect so it can re-run evaluation
    // without re-mounting Blockly when the user edits a value in the sidebar.
    reEvaluateRef.current = reEvaluate;

    ws.addChangeListener(reEvaluate);
    reEvaluate();

    return () => {
      ro?.disconnect();
      ws.removeChangeListener(reEvaluate);
      ws.dispose();
      workspaceRef.current = null;
      loadedProductIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // bootstrap once; product loading + toolbox updates handled below

  // ── Re-evaluate when scenario inputs change ───────────────────────────────
  // Decoupled from the Blockly bootstrap so editing a sidebar value doesn't
  // re-create the workspace. The bootstrap closure reads the latest values
  // from `scenarioInputsRef`, which we keep in sync above.
  useEffect(() => {
    reEvaluateRef.current?.();
  }, [scenarioInputs]);

  // ── Run (dry-run) handler ─────────────────────────────────────────────────
  // Fires the synthetic `manual.run` event: generates a second engine that
  // includes ONLY the `mw_when_manual` hat's body, evaluates it against the
  // current scenario inputs, and parks the result in `dryRunResult` for the
  // DryRunDialog to render. If the canvas has no manual hat, the dry-run
  // falls back to running every hat (so a user with a `When pricing this`
  // recipe can still scratch-test it without first dragging a manual hat).
  const handleDryRun = () => {
    const ws = workspaceRef.current;
    if (!ws) return;
    try {
      const initialVars: Record<string, string | number | boolean> = {
        ...scenarioInputsRef.current,
      };

      // Does the canvas have a manual.run hat? If yes, filter the run to
      // that hat only. If not, run everything (treats the whole recipe as
      // the dry-run body — useful for the common case where the author is
      // still composing and hasn't added a manual hat yet).
      const hasManualHat = ws
        .getTopBlocks(true)
        .some((b) => b.type === 'mw_when_manual');

      const { engine, extras } = generateEngine(
        ws,
        initialVars,
        hasManualHat ? { eventFilter: 'manual.run' } : undefined,
      );

      const activeId = useProductBuilderStore.getState().activeProductId;
      const result = evaluateStudioV2({
        engine,
        extras,
        materials: useMaterialLibraryStore.getState().materials,
        finishes: useFinishLibraryStore.getState().finishes,
        products: useProductBuilderStore.getState().products,
        initialVars,
        parentStack: activeId ? new Set([activeId]) : undefined,
      });
      setDryRunResult(result);
      setDryRunCommit(false);
      setDryRunOpen(true);
    } catch (err) {
      console.error('[ProductStudioV2] dry-run failed', err);
    }
  };

  // ── Reset + restore Blockly when the active product changes ───────────────
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    if (loadedProductIdRef.current === activeProductId) return;

    restoringRef.current = true;
    try {
      ws.clear();
      if (product?.blocklyXml) {
        try {
          const dom = Blockly.utils.xml.textToDom(product.blocklyXml);
          Blockly.Xml.domToWorkspace(dom, ws);
        } catch (err) {
          console.warn('[ProductStudioV2] failed to restore workspace xml', err);
        }
      }
      // Seed the dedupe baseline so synthetic post-load change events that
      // re-emit the same XML are recognised as no-ops and don't flash "Saved".
      const dom = Blockly.Xml.workspaceToDom(ws);
      lastPersistedXmlRef.current = Blockly.Xml.domToText(dom);
      loadedProductIdRef.current = activeProductId;
      // Restore scenario inputs from the persisted product so the user lands
      // back where they left off (width=1500, etc).
      setScenarioInputsState(product?.scenarioInputs ?? {});
    } finally {
      // Defer the flag flip so the burst of change events from domToWorkspace
      // (which fire synchronously) all get suppressed.
      setTimeout(() => {
        restoringRef.current = false;
      }, 0);
    }

    // Reset the saved-at indicator on each load so the user gets a clean slate.
    setSavedAt(null);
  }, [activeProductId, product?.blocklyXml, product?.scenarioInputs]);

  // ── Scenario input mutators (sidebar → state + persistence) ───────────────
  const updateScenarioInput = (
    name: string,
    value: string | number | boolean,
  ) => {
    setScenarioInputsState((prev) => {
      const next = { ...prev, [name]: value };
      // Persist to the store so the user comes back to the same scenario after
      // a reload. The store write is synchronous and per-product so this is
      // cheap; we don't debounce because the input panel doesn't keystroke
      // (numbers commit on blur, switches/sliders on commit).
      setScenarioInputs(next);
      return next;
    });
  };

  const resetScenarioInputs = () => {
    setScenarioInputsState({});
    setScenarioInputs({});
  };

  // Hot-swap the toolbox when the libraries change.
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    ws.updateToolbox(toolbox as unknown as Blockly.utils.toolbox.ToolboxDefinition);
  }, [toolbox]);

  // ── New product helper (toolbar dropdown) ─────────────────────────────────
  const handleCreateProduct = () => {
    const name = window.prompt('New product name');
    if (!name || !name.trim()) return;
    const created = createProduct(name.trim(), '');
    navigate(`/plan/product-studio/${created.id}`);
  };

  return (
    <div
      className={cn(
        'mw-blockly-shell flex h-[calc(100vh-0px)] flex-col bg-[var(--app-canvas)]',
        sidebarCollapsed && 'mw-blockly-collapsed',
      )}
    >
      {/* Toolbar — matches design-system chrome (h-16, p-6, mirage icon well, title-small) */}
      <div className="flex h-16 shrink-0 items-center gap-4 border-b border-[var(--neutral-200)] bg-card px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed((c) => !c)}
          className="size-10 rounded-[var(--shape-md)]"
          aria-label={sidebarCollapsed ? 'Show block sidebar' : 'Hide block sidebar'}
          title={sidebarCollapsed ? 'Show block sidebar' : 'Hide block sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="size-4" strokeWidth={1.5} />
          )}
        </Button>

        <IconWell icon={Sparkles} surface="onLight" size="sm" shape="squircle" />

        {/* Product switcher — clickable title that opens a dropdown of all products */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex min-w-0 items-center gap-2 rounded-[var(--shape-md)] px-2 py-1 text-left transition-colors hover:bg-[var(--neutral-100)]"
            >
              <div className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[14px] font-medium leading-tight tracking-[0.1px] text-[var(--neutral-900)]">
                    {product ? product.name : 'Choose a product'}
                  </span>
                  <ChevronDown
                    className="size-3.5 text-[var(--neutral-500)] transition-transform group-data-[state=open]:rotate-180"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="text-[11px] text-[var(--neutral-500)]">
                  Product Studio
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
              Products
            </DropdownMenuLabel>
            {products.length === 0 && (
              <div className="px-2 py-3 text-center text-[11px] text-[var(--neutral-500)]">
                No products yet
              </div>
            )}
            {products.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => navigate(`/plan/product-studio/${p.id}`)}
                className={cn(
                  'gap-2 text-[12px]',
                  p.id === activeProductId &&
                    'bg-[var(--mw-yellow-50)] font-semibold',
                )}
              >
                <Package className="size-3.5" strokeWidth={1.5} />
                <span className="flex-1 truncate">{p.name}</span>
                {p.id !== activeProductId && (
                  <button
                    type="button"
                    className="ml-auto rounded p-0.5 text-[var(--neutral-400)] opacity-0 transition-opacity hover:text-[var(--error)] group-hover:opacity-100 [div:hover>&]:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(p.id);
                    }}
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className="size-3" strokeWidth={1.5} />
                  </button>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCreateProduct}
              className="gap-2 text-[12px] text-[var(--neutral-900)]"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
              New product…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Run button — dispatches the synthetic `manual.run` event against
            the current scenario inputs and opens the dry-run dialog with a
            preview of every action the recipe would queue. Sits leftmost so
            the control cluster reads as: "[Run] [Inputs] [Outputs]" — the
            author's triggering verb first, the two data panes after. */}
        <Button
          variant="default"
          size="sm"
          onClick={handleDryRun}
          disabled={!product}
          className="h-9 gap-1.5 rounded-full bg-[var(--mw-yellow-400)] px-3.5 text-[12px] font-semibold text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-300)] disabled:opacity-40"
          title="Dry-run this recipe against the current scenario inputs"
        >
          <Play className="size-4" strokeWidth={2} fill="currentColor" />
          Run
        </Button>

        {/* Inputs + Outputs toggles — labelled pills at top-right so the two
            scenario panels are obviously discoverable rather than hidden
            behind cryptic icon buttons. Matching shape/size means they read
            as a paired "configure inputs / view outputs" control cluster. */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInputsPanelOpen((o) => !o)}
          className={cn(
            'h-9 gap-1.5 rounded-full px-3 text-[12px] font-medium text-[var(--neutral-700)]',
            inputsPanelOpen &&
              'bg-[var(--mw-yellow-50)] text-[var(--neutral-900)]',
          )}
          aria-label={inputsPanelOpen ? 'Hide inputs panel' : 'Show inputs panel'}
          title={inputsPanelOpen ? 'Hide inputs panel' : 'Show inputs panel'}
          aria-pressed={inputsPanelOpen}
        >
          <SlidersHorizontal className="size-4" strokeWidth={1.5} />
          Inputs
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightPanelOpen((o) => !o)}
          className={cn(
            'h-9 gap-1.5 rounded-full px-3 text-[12px] font-medium text-[var(--neutral-700)]',
            rightPanelOpen &&
              'bg-[var(--mw-yellow-50)] text-[var(--neutral-900)]',
          )}
          aria-label={
            rightPanelOpen ? 'Hide outputs panel' : 'Show outputs panel'
          }
          title={rightPanelOpen ? 'Hide outputs panel' : 'Show outputs panel'}
          aria-pressed={rightPanelOpen}
        >
          {rightPanelOpen ? (
            <PanelRightClose className="size-4" strokeWidth={1.5} />
          ) : (
            <PanelRightOpen className="size-4" strokeWidth={1.5} />
          )}
          Outputs
        </Button>

        {/* Saved-status pill — shows "Saved · 5s ago" when persisting */}
        {product && savedAt && (
          <span className="hidden items-center gap-1.5 rounded-full bg-[var(--mw-success-light)] px-3 py-1 text-[11px] font-medium tabular-nums text-[var(--mw-success)] md:flex">
            <CheckCircle2 className="size-3" strokeWidth={1.75} />
            Saved · {formatRelative(savedAt, now)}
          </span>
        )}
        {product && !savedAt && (
          <span className="hidden items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-3 py-1 text-[11px] text-[var(--neutral-500)] md:flex">
            Autosave on
          </span>
        )}
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Workspace — overflow hidden so browser/chrome scrollbars never sit on top of Blockly’s SVG scrollbars */}
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[var(--app-canvas)]">
          <div ref={containerRef} className="absolute inset-0 overflow-hidden" />

          {/* No-product overlay — Blockly stays mounted underneath so the
              workspace shows the moment a product is picked. */}
          {!product && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--app-canvas)]/85 backdrop-blur-sm">
              <div className="pointer-events-auto flex max-w-md flex-col items-center gap-4 rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-8 text-center shadow-[var(--elevation-2)]">
                <IconWell icon={Package} surface="onLight" size="md" shape="squircle" />
                <div className="space-y-1">
                  <h2 className="text-[16px] font-semibold text-[var(--neutral-900)]">
                    Pick a product to start
                  </h2>
                  <p className="text-[12px] text-[var(--neutral-600)]">
                    Open an existing product or create a new one. Your blocks
                    autosave to that product as you build.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]"
                      >
                        <Package className="size-3.5" strokeWidth={1.5} />
                        Open product
                        <ChevronDown className="size-3" strokeWidth={1.5} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64">
                      {products.length === 0 && (
                        <div className="px-2 py-3 text-center text-[11px] text-[var(--neutral-500)]">
                          No products yet
                        </div>
                      )}
                      {products.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() =>
                            navigate(`/plan/product-studio/${p.id}`)
                          }
                          className="gap-2 text-[12px]"
                        >
                          <Package className="size-3.5" strokeWidth={1.5} />
                          <span className="flex-1 truncate">{p.name}</span>
                          <button
                            type="button"
                            className="ml-auto rounded p-0.5 text-[var(--neutral-400)] opacity-0 transition-opacity hover:text-[var(--error)] group-hover:opacity-100 [div:hover>&]:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProduct(p.id);
                            }}
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="size-3" strokeWidth={1.5} />
                          </button>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateProduct}
                    className="h-9 gap-1.5"
                  >
                    <Plus className="size-3.5" strokeWidth={1.5} />
                    New product
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inputs panel — sits between the canvas and the outputs panel.
            Hidden when no inputs have been declared so empty studios don't
            waste canvas width. The panel itself shows the live scenario
            controls that drive `evaluator.initialVars`. */}
        <aside
          className={cn(
            'flex min-h-0 shrink-0 flex-col border-l border-[var(--neutral-200)] bg-card transition-[width,opacity,border-color] duration-200 ease-[var(--ease-standard)] dark:border-[var(--neutral-800)]',
            inputsPanelOpen && inputDecls.length > 0
              ? 'w-[min(100%,280px)] opacity-100'
              : 'pointer-events-none w-0 min-w-0 overflow-hidden border-l-0 opacity-0',
          )}
          aria-hidden={!inputsPanelOpen || inputDecls.length === 0}
        >
          <InputsPanel
            inputs={inputDecls}
            values={scenarioInputs}
            onChange={updateScenarioInput}
            onReset={resetScenarioInputs}
          />
        </aside>

        {/* Output panel — collapsible so the canvas can use full width */}
        <aside
          className={cn(
            'flex min-h-0 shrink-0 flex-col border-l border-[var(--neutral-200)] bg-card transition-[width,opacity,border-color] duration-200 ease-[var(--ease-standard)] dark:border-[var(--neutral-800)]',
            rightPanelOpen
              ? 'w-[min(100%,440px)] opacity-100'
              : 'pointer-events-none w-0 min-w-0 overflow-hidden border-l-0 opacity-0',
          )}
          aria-hidden={!rightPanelOpen}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="mx-2 mt-2 mb-1 flex w-[calc(100%-1rem)] max-w-none min-w-0 justify-start px-0.5">
              <TabsTrigger
                value="formula"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
              >
                <Sparkles className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                Formula
              </TabsTrigger>
              <TabsTrigger
                value="bom"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
              >
                <Boxes className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                BOM
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
              >
                <Coins className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                Cost
              </TabsTrigger>
              <TabsTrigger
                value="ops"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
              >
                <Hammer className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                Work
              </TabsTrigger>
              <TabsTrigger
                value="time"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
              >
                <Clock className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                Time
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
                title="Actions from rules"
              >
                <Zap className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                {evaluation && evaluation.actions.length > 0
                  ? evaluation.actions.length
                  : 'Actions'}
              </TabsTrigger>
              <TabsTrigger
                value="warnings"
                className="h-8 min-w-8 shrink-0 px-2 py-0 text-[11px] leading-none"
                title="Warnings"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                {evaluation && evaluation.warnings.length > 0 ? (
                  <span className="tabular-nums">{evaluation.warnings.length}</span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger
                value="json"
                className="h-8 shrink-0 px-2.5 py-0 text-[11px] leading-none"
              >
                <Code2 className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                JSON
              </TabsTrigger>
            </TabsList>

            <div className="min-h-0 flex-1 overflow-auto">
              <TabsContent value="formula" className="m-0 px-3 pb-3">
                <FormulaPanel
                  evaluation={evaluation}
                  product={product}
                  inputs={inputDecls}
                  scenario={scenarioInputs}
                />
              </TabsContent>
              <TabsContent value="bom" className="m-0 px-3 pb-3">
                <BomPanel evaluation={evaluation} />
              </TabsContent>
              <TabsContent value="costs" className="m-0 px-3 pb-3">
                <CostPanel evaluation={evaluation} />
              </TabsContent>
              <TabsContent value="ops" className="m-0 px-3 pb-3">
                <OpsPanel evaluation={evaluation} />
              </TabsContent>
              <TabsContent value="time" className="m-0 px-3 pb-3">
                <TimePanel evaluation={evaluation} />
              </TabsContent>
              <TabsContent value="actions" className="m-0 px-3 pb-3">
                <ActionsPanel evaluation={evaluation} />
              </TabsContent>
              <TabsContent value="warnings" className="m-0 px-3 pb-3">
                <WarningsPanel evaluation={evaluation} />
              </TabsContent>
              <TabsContent value="json" className="m-0 px-3 pb-3">
                <JsonPanel
                  product={product?.definitionEngine}
                  extras={extrasRef.current}
                />
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>

      {/* Dry-run dialog — previews the actions that `manual.run` (the Run
          button) would queue, against the current scenario inputs. The
          Commit toggle is a visual switch for v1; in Phase 4 it will gate
          the real Plan / Make / Buy endpoint calls. */}
      <DryRunDialog
        open={dryRunOpen}
        onOpenChange={setDryRunOpen}
        result={dryRunResult}
        scenarioInputs={scenarioInputs}
        commit={dryRunCommit}
        onCommitChange={setDryRunCommit}
        productName={product?.name ?? 'this product'}
      />
    </div>
  );
}

// ── Panels ───────────────────────────────────────────────────────────────────

function EmptyPanel({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
      <Icon className="h-6 w-6 opacity-60" />
      <p className="text-xs">{title}</p>
      <p className="text-[11px] opacity-70">
        Drag blocks under the{' '}
        <strong>When manufacturing this product</strong> hat to define the
        recipe.
      </p>
    </div>
  );
}

/**
 * DryRunDialog — the Run button's output surface.
 *
 * Renders the filtered evaluation (only the `mw_when_manual` hat's body, or
 * the whole recipe if the author hasn't added a manual hat) as a "would
 * create…" preview. Three sections:
 *   1. Scenario snapshot — the live input values the recipe was tested
 *      against, so the author can see at a glance what inputs drove the run.
 *   2. Actions — the side-effects the recipe queued, reusing ActionsPanel
 *      so the card design stays consistent with the outputs panel's tab.
 *   3. Commit toggle — dry-run (default) vs commit. In v1 the toggle is
 *      cosmetic; flipping it tints the dialog header yellow and swaps the
 *      banner copy so the author *sees* the difference between preview and
 *      commit mode. Phase 4 wires Commit to the real endpoint calls.
 */
function DryRunDialog({
  open,
  onOpenChange,
  result,
  scenarioInputs,
  commit,
  onCommitChange,
  productName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: EvaluationResultV2 | null;
  scenarioInputs: Record<string, string | number | boolean>;
  commit: boolean;
  onCommitChange: (v: boolean) => void;
  productName: string;
}) {
  const actionCount = result?.actions.length ?? 0;
  const warningCount = result?.warnings.length ?? 0;
  const inputRows = Object.entries(scenarioInputs);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-4 w-4" fill="currentColor" />
            Dry-run · {productName}
            <Badge
              variant="outline"
              className={cn(
                'ml-2 text-[10px] uppercase tracking-wide',
                commit
                  ? 'border-[var(--mw-success)] bg-[var(--mw-success-light)] text-[var(--mw-success)]'
                  : 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-mirage)]',
              )}
            >
              {commit ? 'Commit · live' : 'Preview only'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {commit ? (
              <>
                Committed runs <strong>will fire</strong> the Plan / Make /
                Buy endpoints against the current scenario inputs.
              </>
            ) : (
              <>
                Previewing the <code>manual.run</code> event against the
                current scenario inputs. Nothing has been committed — flip
                the toggle to commit for real.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scenario snapshot */}
          <section>
            <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Scenario inputs
            </h4>
            {inputRows.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                No scenario inputs — add <code>Input</code> blocks to the
                canvas to parameterise the run.
              </p>
            ) : (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
                {inputRows.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono text-[var(--neutral-900)] dark:text-white">
                      {String(v)}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
          </section>

          {/* Actions — reuse ActionsPanel for visual consistency */}
          <section>
            <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Would {commit ? 'fire' : 'create'} · {actionCount}{' '}
              {actionCount === 1 ? 'action' : 'actions'}
            </h4>
            <div
              className={cn(
                'max-h-[360px] overflow-y-auto rounded-md border p-2',
                commit
                  ? 'border-[var(--mw-success-light)]'
                  : 'border-[var(--neutral-200)]',
              )}
            >
              <ActionsPanel evaluation={result} />
            </div>
          </section>

          {/* Warnings, only if any — same style as the outputs tab */}
          {warningCount > 0 && (
            <section>
              <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                {warningCount} warning{warningCount === 1 ? '' : 's'}
              </h4>
              <WarningsPanel evaluation={result} />
            </section>
          )}

          {/* Commit toggle — prominent, so the mode switch is visible */}
          <section className="flex items-center justify-between rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-3 dark:border-[var(--neutral-800)] dark:bg-[var(--neutral-900)]">
            <div className="flex-1">
              <Label
                htmlFor="dry-run-commit"
                className="cursor-pointer text-[12px] font-semibold"
              >
                Commit mode
              </Label>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Off: preview only. On: dispatches the above actions to the
                real Plan / Make / Buy systems when you click Run.
              </p>
            </div>
            <Switch
              id="dry-run-commit"
              checked={commit}
              onCheckedChange={onCommitChange}
            />
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={!commit || actionCount === 0}
            className="gap-1.5 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-300)]"
          >
            <Play className="size-3.5" fill="currentColor" />
            {commit
              ? `Commit · ${actionCount} action${actionCount === 1 ? '' : 's'}`
              : 'Flip toggle to commit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * InputsPanel — live scenario controls.
 *
 * Renders one editor per declared input (`extractInputs(workspace)`), with the
 * editor type chosen by the input's `kind`. Edits are pushed back through
 * `onChange`, which both updates local state (triggering a re-eval via the
 * scenario watcher effect) and persists to the product builder store, so
 * scenarios survive a reload.
 *
 * Empty state: when nothing has been declared yet, we explain how to add an
 * input — this is the user's onramp into "real" configurator behaviour.
 */
function InputsPanel({
  inputs,
  values,
  onChange,
  onReset,
}: {
  inputs: InputDecl[];
  values: Record<string, string | number | boolean>;
  onChange: (name: string, value: string | number | boolean) => void;
  onReset: () => void;
}) {
  const hasOverrides = Object.keys(values).length > 0;

  if (inputs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center text-muted-foreground">
        <SlidersHorizontal className="h-6 w-6 opacity-60" strokeWidth={1.5} />
        <p className="text-xs font-medium">No inputs yet</p>
        <p className="text-[11px] leading-relaxed opacity-80">
          Drag an <strong>Input dimension</strong>, <strong>quantity</strong>,
          or <strong>choice</strong> block under the recipe hat to expose a
          parameter for this product here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--neutral-200)] px-3 py-2.5 dark:border-[var(--neutral-800)]">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
            Inputs
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {inputs.length} parameter{inputs.length === 1 ? '' : 's'}
          </p>
        </div>
        {hasOverrides && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1 px-2 text-[10px]"
            title="Reset all inputs to canvas defaults"
          >
            <RotateCcw className="size-3" strokeWidth={1.75} />
            Reset
          </Button>
        )}
      </div>

      {/* Editors */}
      <div className="flex-1 space-y-3 overflow-auto px-3 py-3">
        {inputs.map((decl) => {
          const live = values[decl.name] ?? decl.defaultValue;
          const overridden = decl.name in values;
          return (
            <div key={decl.name} className="space-y-1">
              <label className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                <span className="truncate normal-case text-[11px] font-medium tracking-normal text-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
                  {decl.name}
                </span>
                {overridden && (
                  <Badge variant="outline" className="h-4 px-1 text-[9px]">
                    edited
                  </Badge>
                )}
              </label>
              <InputEditor decl={decl} value={live} onChange={onChange} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InputEditor({
  decl,
  value,
  onChange,
}: {
  decl: InputDecl;
  value: string | number | boolean;
  onChange: (name: string, value: string | number | boolean) => void;
}) {
  switch (decl.kind) {
    case 'dimension':
      return (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={typeof value === 'number' ? value : Number(value) || 0}
            onChange={(e) => onChange(decl.name, Number(e.target.value))}
            className="h-8 flex-1 text-[12px] tabular-nums"
          />
          <span className="rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)] dark:bg-[var(--neutral-900)]">
            {decl.unit ?? 'mm'}
          </span>
        </div>
      );
    case 'quantity':
      return (
        <Input
          type="number"
          step={1}
          min={0}
          value={typeof value === 'number' ? value : Number(value) || 0}
          onChange={(e) => onChange(decl.name, Math.round(Number(e.target.value)))}
          className="h-8 text-[12px] tabular-nums"
        />
      );
    case 'choice': {
      const opts = decl.options ?? [];
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={(v) => onChange(decl.name, v)}
        >
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opts.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-[12px]">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    case 'toggle':
      return (
        <div className="flex h-8 items-center justify-between rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-2.5 dark:bg-[var(--neutral-900)]">
          <span className="text-[11px] text-muted-foreground">
            {value ? 'On' : 'Off'}
          </span>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(decl.name, v)}
          />
        </div>
      );
    case 'percent': {
      const num = typeof value === 'number' ? value : Number(value) || 0;
      return (
        <div className="flex items-center gap-2">
          <Slider
            value={[num]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => onChange(decl.name, v[0] ?? 0)}
            className="flex-1"
          />
          <span className="w-9 text-right font-mono text-[11px] tabular-nums text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
            {num.toFixed(0)}%
          </span>
        </div>
      );
    }
    case 'text':
      return (
        <Input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(decl.name, e.target.value)}
          className="h-8 text-[12px]"
        />
      );
    case 'angle':
      // Plain numeric input + degrees suffix. We deliberately *don't* render a
      // mini dial here — the canvas FieldAngle is the natural place to scrub
      // the default; the sidebar is for quick numeric overrides.
      return (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={typeof value === 'number' ? value : Number(value) || 0}
            onChange={(e) => onChange(decl.name, Number(e.target.value))}
            className="h-8 flex-1 text-[12px] tabular-nums"
            min={-360}
            max={360}
          />
          <span className="rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)] dark:bg-[var(--neutral-900)]">
            °
          </span>
        </div>
      );
    case 'material':
      return <MaterialPicker value={String(value ?? '')} onChange={(v) => onChange(decl.name, v)} />;
    case 'finish':
      return <FinishPicker value={String(value ?? '')} onChange={(v) => onChange(decl.name, v)} />;
  }
}

/**
 * MaterialPicker — Inputs sidebar dropdown bound to the live Material Library.
 *
 * Reads from `useMaterialLibraryStore` so it stays in sync as the user adds /
 * renames materials in another tab. The stored value is the material id (so the
 * scenario survives renames); the visible label is `code · type`.
 */
function MaterialPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const materials = useMaterialLibraryStore((s) => s.materials);
  if (materials.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--neutral-300)] px-2 py-1.5 text-[10px] italic text-muted-foreground">
        No materials in library
      </p>
    );
  }
  return (
    <Select value={value || materials[0]?.id} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-[12px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {materials.map((m) => (
          <SelectItem key={m.id} value={m.id} className="text-[12px]">
            {m.code} · {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** FinishPicker — twin of MaterialPicker, bound to the Finish Library. */
function FinishPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const finishes = useFinishLibraryStore((s) => s.finishes);
  if (finishes.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--neutral-300)] px-2 py-1.5 text-[10px] italic text-muted-foreground">
        No finishes in library
      </p>
    );
  }
  return (
    <Select value={value || finishes[0]?.id} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-[12px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {finishes.map((f) => (
          <SelectItem key={f.id} value={f.id} className="text-[12px]">
            {f.code} · {f.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * FormulaPanel — readable, plain-English breakdown of how the price was reached.
 *
 * Reads from the same `EvaluationResultV2` that drives every other tab, so we
 * never re-run the evaluator from here. The panel is grouped by *intent* —
 * which is also how the toolbox is now organised:
 *
 *   ① This product   — header card with the product name + grand total
 *   ② Inputs         — every declared input + its current scenario value
 *   ③ Materials      — BOM lines, qty × unit cost = line cost
 *   ④ Operations     — setup + run minutes + work-centre rate = op cost
 *   ⑤ Costs          — adjustments, overhead %, margin %
 *
 * The whole panel is keyed off the active product (passed in as `product`) so
 * the studio reads as "how *this product* is manufactured" rather than as a
 * generic spreadsheet of numbers.
 */
function FormulaPanel({
  evaluation,
  product,
  inputs,
  scenario,
}: {
  evaluation: EvaluationResultV2 | null;
  product: { id: string; name: string; description?: string } | null;
  inputs: InputDecl[];
  scenario: Record<string, string | number | boolean>;
}) {
  if (!evaluation) {
    return <EmptyPanel icon={Sparkles} title="Drop blocks to see the formula" />;
  }
  const total = evaluation.rollup.total;
  return (
    <div className="space-y-4">
      {/* Product header — anchors the entire breakdown so the user can see at
          a glance which product they're pricing. */}
      <div className="rounded-md border border-[var(--mw-yellow-200)] bg-[var(--mw-yellow-50)] px-3 py-2.5 dark:border-[var(--mw-yellow-900)] dark:bg-[var(--mw-yellow-950)]">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-[var(--mw-yellow-700)] dark:text-[var(--mw-yellow-300)]" strokeWidth={1.75} />
          <p className="flex-1 truncate text-xs font-semibold uppercase tracking-wider text-[var(--mw-yellow-800)] dark:text-[var(--mw-yellow-200)]">
            {product?.name ?? 'This product'}
          </p>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">Total to manufacture</span>
          <span className="font-mono text-base font-bold tabular-nums">
            {AUD.format(total)}
          </span>
        </div>
      </div>

      {/* Inputs — what the configurator was told to build. */}
      {inputs.length > 0 && (
        <FormulaSection title="Inputs">
          {inputs.map((decl) => {
            const live = scenario[decl.name] ?? decl.defaultValue;
            return (
              <FormulaRow
                key={decl.name}
                label={decl.name}
                expression={`= ${formatScenarioValue(live, decl.unit)}`}
              />
            );
          })}
        </FormulaSection>
      )}

      {/* Materials — every BOM line spelled out as qty × unit = line. */}
      {evaluation.bom.length > 0 && (
        <FormulaSection title="Materials">
          {evaluation.bom.map((line) => (
            <FormulaRow
              key={line.id}
              label={line.name}
              expression={
                line.unitCost > 0
                  ? `${line.quantity} ${line.unit} × ${AUD.format(line.unitCost)} = `
                  : `${line.quantity} ${line.unit} = `
              }
              total={line.lineCost}
            />
          ))}
        </FormulaSection>
      )}

      {/* Operations — setup + run × rate. */}
      {evaluation.operations.length > 0 && (
        <FormulaSection title="Operations">
          {evaluation.operations.map((op) => (
            <FormulaRow
              key={op.id}
              label={`${op.name} @ ${op.workCentre || 'shop'}`}
              expression={`${op.setupMinutes.toFixed(0)} m setup + ${op.runMinutesPerUnit.toFixed(1)} m/unit = ${formatMins(op.totalMinutes)} → `}
              total={op.cost}
            />
          ))}
        </FormulaSection>
      )}

      {/* Cost adjustments — flat fees + overhead/margin percentages. */}
      {evaluation.costs.length > 0 && (
        <FormulaSection title="Adjustments">
          {evaluation.costs.map((c) => (
            <FormulaRow
              key={c.id}
              label={c.label}
              expression={`(${c.category}) `}
              total={c.amount}
            />
          ))}
        </FormulaSection>
      )}

      {/* Grand total reprise — repeats the header so the eye can scan top→
          bottom and bottom→top and land on the same number both ways. */}
      <div className="rounded-md border border-[var(--mw-yellow-200)] bg-[var(--mw-yellow-50)] px-3 py-2.5 text-xs dark:border-[var(--mw-yellow-900)] dark:bg-[var(--mw-yellow-950)]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold uppercase tracking-wider text-[var(--mw-yellow-800)] dark:text-[var(--mw-yellow-200)]">
            {product?.name ?? 'This product'}
          </span>
          <span className="font-mono text-sm font-bold tabular-nums">
            {AUD.format(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FormulaSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FormulaRow({
  label,
  expression,
  total,
}: {
  label: string;
  expression: string;
  total?: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[11px]">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{label}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {expression}
          {total !== undefined && <span className="text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">{AUD.format(total)}</span>}
        </p>
      </div>
      {total !== undefined && (
        <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums">
          {AUD.format(total)}
        </span>
      )}
    </div>
  );
}

/** Formats a scenario value for the Formula tab — `1500 mm`, `4`, `Black`, etc. */
function formatScenarioValue(
  value: string | number | boolean,
  unit?: string,
): string {
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  if (typeof value === 'number') return unit ? `${value} ${unit}` : String(value);
  return String(value || '—');
}

function BomPanel({ evaluation }: { evaluation: EvaluationResultV2 | null }) {
  if (!evaluation || evaluation.bom.length === 0) {
    return <EmptyPanel icon={Boxes} title="No BOM lines yet" />;
  }
  return (
    <div className="space-y-2">
      {evaluation.bom.map((line) => (
        <div
          key={line.id}
          className="rounded-md border border-[var(--border)] bg-[var(--neutral-50)] p-2.5 dark:bg-[var(--neutral-900)]"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold">{line.name}</p>
            <Badge
              variant="outline"
              className={cn(
                'text-[9px] uppercase',
                line.source === 'material' &&
                  'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
              )}
            >
              {line.source}
            </Badge>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{line.sku}</p>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {line.quantity} {line.unit}
              {line.unitCost > 0 && ` × ${AUD.format(line.unitCost)}`}
            </span>
            <span className="font-mono font-semibold">{AUD.format(line.lineCost)}</span>
          </div>
        </div>
      ))}
      <div className="mt-3 flex items-center justify-between rounded-md bg-[var(--neutral-100)] px-2.5 py-2 text-[11px] dark:bg-[var(--neutral-800)]">
        <span className="font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          Material total
        </span>
        <span className="font-mono font-bold">
          {AUD.format(evaluation.rollup.material)}
        </span>
      </div>
    </div>
  );
}

function CostPanel({ evaluation }: { evaluation: EvaluationResultV2 | null }) {
  if (!evaluation) return <EmptyPanel icon={Coins} title="No cost data" />;
  const r = evaluation.rollup;
  const rows: Array<{ label: string; value: number; tone?: string }> = [
    { label: 'Material', value: r.material },
    { label: 'Labour', value: r.labour },
    { label: 'Machine', value: r.machine },
    { label: 'Overhead', value: r.overhead },
    { label: 'Margin', value: r.margin },
  ];
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between rounded-md border border-[var(--border)] px-2.5 py-2 text-[11px]"
        >
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-mono font-semibold">{AUD.format(row.value)}</span>
        </div>
      ))}
      <div className="mt-3 flex items-center justify-between rounded-md bg-[var(--mw-yellow-50)] px-2.5 py-2.5 text-xs dark:bg-[var(--mw-yellow-950)]">
        <span className="font-semibold uppercase tracking-wider">Total</span>
        <span className="font-mono text-sm font-bold">{AUD.format(r.total)}</span>
      </div>

      {evaluation.costs.length > 0 && (
        <>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
            Adjustments
          </p>
          {evaluation.costs.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[11px]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{c.label}</p>
                <p className="text-[9px] uppercase text-muted-foreground">{c.category}</p>
              </div>
              <span className="font-mono">{AUD.format(c.amount)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function OpsPanel({ evaluation }: { evaluation: EvaluationResultV2 | null }) {
  if (!evaluation || evaluation.operations.length === 0) {
    return <EmptyPanel icon={Hammer} title="No operations yet" />;
  }
  const totalMins = evaluation.operations.reduce((s, o) => s + o.totalMinutes, 0);
  return (
    <div className="space-y-2">
      {evaluation.operations.map((op) => (
        <div
          key={op.id}
          className="rounded-md border border-[var(--border)] bg-[var(--neutral-50)] p-2.5 dark:bg-[var(--neutral-900)]"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold">{op.name}</p>
            <Badge variant="outline" className="text-[9px] uppercase">
              {op.workCentre}
            </Badge>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              setup {op.setupMinutes}m · run {op.runMinutesPerUnit}m/u
            </span>
            <span className="font-mono font-semibold text-foreground">
              {AUD.format(op.cost)}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Total {formatMins(op.totalMinutes)}
          </p>
        </div>
      ))}
      <div className="mt-3 flex items-center justify-between rounded-md bg-[var(--neutral-100)] px-2.5 py-2 text-[11px] dark:bg-[var(--neutral-800)]">
        <span className="font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          Total time
        </span>
        <span className="font-mono font-bold">{formatMins(totalMins)}</span>
      </div>
    </div>
  );
}

/**
 * TimePanel — cycle-time deep-dive.
 *
 * The Work tab is operation-centric (one card per op). The Time tab is
 * time-centric: it answers "where does the cycle time live?" by aggregating the
 * same operations into a per-work-centre rollup with proportional bars, plus a
 * setup-vs-run split for the whole product. This is what a planner stares at
 * when sequencing the schedule, so it deserves its own first-class tab rather
 * than living buried under Work.
 */
function TimePanel({ evaluation }: { evaluation: EvaluationResultV2 | null }) {
  if (!evaluation || evaluation.operations.length === 0) {
    return <EmptyPanel icon={Clock} title="No cycle time yet" />;
  }

  const ops = evaluation.operations;
  const totalSetup = ops.reduce((s, o) => s + o.setupMinutes, 0);
  const totalRun = ops.reduce((s, o) => s + o.runMinutesPerUnit, 0);
  const totalMins = ops.reduce((s, o) => s + o.totalMinutes, 0);

  // Group by work centre so the planner can see where time is concentrated.
  const byCentre = new Map<string, { minutes: number; ops: number; cost: number }>();
  for (const op of ops) {
    const wc = op.workCentre || 'OTHER';
    const cur = byCentre.get(wc) ?? { minutes: 0, ops: 0, cost: 0 };
    cur.minutes += op.totalMinutes;
    cur.ops += 1;
    cur.cost += op.cost;
    byCentre.set(wc, cur);
  }
  const centres = Array.from(byCentre.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.minutes - a.minutes);
  const maxMinutes = centres[0]?.minutes ?? 0;

  // Setup / run percentage split for the headline bar.
  const setupPct = totalMins > 0 ? (totalSetup / totalMins) * 100 : 0;
  const runPct = totalMins > 0 ? (totalRun / totalMins) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Headline — total cycle time per unit */}
      <div className="rounded-md bg-[var(--mw-yellow-50)] px-3 py-3 dark:bg-[var(--mw-yellow-950)]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          Total cycle time / unit
        </p>
        <p className="mt-0.5 font-mono text-[20px] font-bold leading-none text-[var(--neutral-900)] dark:text-white">
          {formatMins(totalMins)}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {ops.length} operation{ops.length === 1 ? '' : 's'} ·{' '}
          {centres.length} work centre{centres.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Setup vs run split — single stacked bar with a small legend */}
      <div className="rounded-md border border-[var(--border)] px-3 py-2.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--neutral-500)]">
          <span className="font-semibold">Setup vs run</span>
          <span className="font-mono">
            {formatMins(totalSetup)} + {formatMins(totalRun)}
          </span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]">
          <div
            className="h-full bg-[var(--neutral-400)]"
            style={{ width: `${setupPct}%` }}
            aria-label={`Setup ${setupPct.toFixed(0)}%`}
          />
          <div
            className="h-full bg-[var(--mw-yellow-400)]"
            style={{ width: `${runPct}%` }}
            aria-label={`Run ${runPct.toFixed(0)}%`}
          />
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-[var(--neutral-400)]" />
            Setup {setupPct.toFixed(0)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-[var(--mw-yellow-400)]" />
            Run {runPct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Per-work-centre breakdown — proportional bars sized to longest centre */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          By work centre
        </p>
        <div className="space-y-1.5">
          {centres.map((c) => {
            const widthPct =
              maxMinutes > 0 ? Math.max(2, (c.minutes / maxMinutes) * 100) : 0;
            return (
              <div
                key={c.name}
                className="rounded-md border border-[var(--border)] bg-[var(--neutral-50)] px-2.5 py-2 dark:bg-[var(--neutral-900)]"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] uppercase">
                      {c.name}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {c.ops} op{c.ops === 1 ? '' : 's'}
                    </span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatMins(c.minutes)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]">
                  <div
                    className="h-full bg-[var(--mw-mirage)] dark:bg-[var(--mw-yellow-400)]"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>{((c.minutes / totalMins) * 100).toFixed(0)}% of total</span>
                  <span className="font-mono">{AUD.format(c.cost)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * ActionsPanel — preview of ERP side effects the recipe would fire.
 *
 * Each `mw_action_*` block in the workspace becomes a card here. The cards
 * are read-only previews — actually wiring them to the live Plan / Make / Buy
 * endpoints is a Phase 4 task. The point of the panel is to make the action
 * blocks *concrete* during authoring: the user adds an `mw_action_send_alert`
 * inside an If branch, runs a scenario, and immediately sees a yellow card
 * appear in this tab confirming the alert would fire.
 */
function ActionsPanel({ evaluation }: { evaluation: EvaluationResultV2 | null }) {
  if (!evaluation || evaluation.actions.length === 0) {
    return <EmptyPanel icon={Zap} title="No ERP actions queued" />;
  }

  // Map action kind → presentation. Keeps the JSX below tight.
  //
  // Tones follow business-function colour families so a glance at the panel
  // reveals the mix of side-effects:
  //   Sell        → sky blue    (customer-facing)
  //   Plan        → sky blue    (scheduling)
  //   Production  → neutral     (shop-floor / mirage)
  //   Buy + Stock → emerald     (inventory / money out)
  //   People      → amber       (humans / comms)
  //   Integrate   → violet      (wire to external systems)
  const meta: Record<
    EvaluationResultV2['actions'][number]['kind'],
    { icon: React.ElementType; tone: string; tint: string; label: string }
  > = {
    // ── Sell ─────────────────────────────────────────────────────────
    create_quote: {
      icon: FileText,
      tone: 'text-sky-700 dark:text-sky-300',
      tint: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
      label: 'Quote',
    },
    create_sales_order: {
      icon: FileCheck2,
      tone: 'text-sky-700 dark:text-sky-300',
      tint: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
      label: 'Sales order',
    },
    create_invoice: {
      icon: Receipt,
      tone: 'text-sky-700 dark:text-sky-300',
      tint: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
      label: 'Invoice',
    },
    // ── Plan ─────────────────────────────────────────────────────────
    create_plan_activity: {
      icon: CalendarClock,
      tone: 'text-sky-700 dark:text-sky-300',
      tint: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
      label: 'Plan activity',
    },
    reserve_capacity: {
      icon: CalendarCheck,
      tone: 'text-sky-700 dark:text-sky-300',
      tint: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
      label: 'Reserve capacity',
    },
    push_nc_program: {
      icon: Upload,
      tone: 'text-sky-700 dark:text-sky-300',
      tint: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
      label: 'NC program',
    },
    // ── Production / Make ────────────────────────────────────────────
    create_mo: {
      icon: Factory,
      tone: 'text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]',
      tint: 'border-[var(--neutral-300)] bg-[var(--neutral-50)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-900)]',
      label: 'Manufacturing order',
    },
    create_work_order: {
      icon: Briefcase,
      tone: 'text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]',
      tint: 'border-[var(--neutral-300)] bg-[var(--neutral-50)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-900)]',
      label: 'Work order',
    },
    record_qc: {
      icon: ClipboardCheck,
      tone: 'text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]',
      tint: 'border-[var(--neutral-300)] bg-[var(--neutral-50)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-900)]',
      label: 'QC check',
    },
    clock_on: {
      icon: UserCheck,
      tone: 'text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]',
      tint: 'border-[var(--neutral-300)] bg-[var(--neutral-50)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-900)]',
      label: 'Clock on',
    },
    // ── Buy ──────────────────────────────────────────────────────────
    create_purchase_request: {
      icon: ShoppingCart,
      tone: 'text-emerald-800 dark:text-emerald-300',
      tint: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950',
      label: 'Purchase request',
    },
    create_po: {
      icon: FileSpreadsheet,
      tone: 'text-emerald-800 dark:text-emerald-300',
      tint: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950',
      label: 'Purchase order',
    },
    reserve_stock: {
      icon: BoxesReserve,
      tone: 'text-emerald-800 dark:text-emerald-300',
      tint: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950',
      label: 'Stock reservation',
    },
    // ── Stock ────────────────────────────────────────────────────────
    stock_adjust: {
      icon: Warehouse,
      tone: 'text-emerald-800 dark:text-emerald-300',
      tint: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950',
      label: 'Stock adjustment',
    },
    // ── People ───────────────────────────────────────────────────────
    send_alert: {
      icon: Bell,
      tone: 'text-amber-800 dark:text-amber-300',
      tint: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
      label: 'Team alert',
    },
    create_task: {
      icon: ListTodo,
      tone: 'text-amber-800 dark:text-amber-300',
      tint: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
      label: 'Task',
    },
    send_sms: {
      icon: MessageSquare,
      tone: 'text-amber-800 dark:text-amber-300',
      tint: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
      label: 'SMS',
    },
    // ── Integrate ────────────────────────────────────────────────────
    webhook: {
      icon: Webhook,
      tone: 'text-violet-700 dark:text-violet-300',
      tint: 'border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950',
      label: 'Webhook',
    },
    push_accounting: {
      icon: Landmark,
      tone: 'text-violet-700 dark:text-violet-300',
      tint: 'border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950',
      label: 'Accounting',
    },
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        Preview only — these will fire when the recipe runs against a real
        customer order.
      </p>
      {evaluation.actions.map((a) => {
        const m = meta[a.kind];
        const Icon = m.icon;
        // Render payload entries that have a meaningful value (filter out
        // empty strings / zeros from optional sockets so the card stays tight).
        const rows = Object.entries(a.payload).filter(([, v]) => {
          if (v === '' || v === 0 || v === false) return false;
          return true;
        });
        return (
          <div key={a.id} className={cn('rounded-md border p-2.5', m.tint)}>
            <div className="flex items-start gap-2">
              <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', m.tone)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-[11px] font-semibold leading-tight', m.tone)}>
                    {a.title}
                  </p>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[9px] uppercase tracking-wide"
                  >
                    {m.label}
                  </Badge>
                </div>
                {rows.length > 0 && (
                  <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[10px]">
                    {rows.map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="truncate font-mono text-[var(--neutral-900)] dark:text-white">
                          {String(v)}
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WarningsPanel({ evaluation }: { evaluation: EvaluationResultV2 | null }) {
  if (!evaluation || evaluation.warnings.length === 0) {
    return <EmptyPanel icon={AlertTriangle} title="No warnings" />;
  }
  return (
    <div className="space-y-2">
      {evaluation.warnings.map((w, i) => (
        <div
          key={i}
          className="rounded-md border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <AlertTriangle className="mr-1 inline h-3 w-3" />
          {w}
        </div>
      ))}
    </div>
  );
}

function JsonPanel({
  product,
  extras,
}: {
  product: unknown;
  extras: StudioV2Extras | null;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          Engine
        </p>
        <pre className="overflow-x-auto rounded-md bg-[var(--neutral-50)] p-2 font-mono text-[10px] leading-relaxed dark:bg-[var(--neutral-950)]">
          {JSON.stringify(product ?? {}, null, 2)}
        </pre>
      </div>
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          Extras
        </p>
        <pre className="overflow-x-auto rounded-md bg-[var(--neutral-50)] p-2 font-mono text-[10px] leading-relaxed dark:bg-[var(--neutral-950)]">
          {JSON.stringify(extras ?? {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}
