import * as React from "react";
import {
  Check,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { Card } from "@/components/ui/card";

import {
  WIDGET_TEMPLATES,
  type WidgetConfig,
  type WidgetTemplate,
} from "./WidgetRegistry";
import { resolveIcon } from "./DashboardWidgetGrid";

/* ------------------------------------------------------------------ */
/*  Category filter                                                    */
/* ------------------------------------------------------------------ */

type CategoryFilter = "all" | "kpi" | "chart" | "list" | "ai";

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "kpi", label: "KPIs" },
  { value: "chart", label: "Charts" },
  { value: "list", label: "Actions" },
  { value: "ai", label: "AI" },
];

/* ------------------------------------------------------------------ */
/*  AI Builder mock data                                               */
/* ------------------------------------------------------------------ */

interface AiMessage {
  role: "user" | "assistant";
  text: string;
  suggestedWidget?: WidgetTemplate;
}

const SUGGESTED_PROMPTS = [
  "What's my pipeline health?",
  "Show revenue trends",
  "Compare this month vs last",
  "Which products are top sellers?",
];

const AI_RESPONSES: Record<string, { text: string; widgetType?: string }> = {
  "what's my pipeline health?": {
    text: "I'll create a Pipeline Health widget for you. It shows weighted pipeline value, stalled deals, and top deals at risk.",
    widgetType: "pipeline-health",
  },
  "show revenue trends": {
    text: "I'll create a Revenue Trends chart showing actual vs target revenue over the last 6 months.",
    widgetType: "revenue-trend",
  },
  "compare this month vs last": {
    text: "I'll create a Win/Loss Analysis chart so you can compare performance month-over-month.",
    widgetType: "win-loss",
  },
  "which products are top sellers?": {
    text: "I'll create a Customer Segmentation chart showing revenue breakdown by segment.",
    widgetType: "customer-segmentation",
  },
};

function getAiResponse(input: string): { text: string; widgetType?: string } {
  const lower = input.toLowerCase().trim();
  // Check for known prompts
  for (const [key, resp] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return resp;
    }
  }
  // Fallback: try keyword matching
  if (lower.includes("pipeline") || lower.includes("deal")) {
    return AI_RESPONSES["what's my pipeline health?"];
  }
  if (lower.includes("revenue") || lower.includes("sales")) {
    return AI_RESPONSES["show revenue trends"];
  }
  if (lower.includes("compare") || lower.includes("month")) {
    return AI_RESPONSES["compare this month vs last"];
  }
  return {
    text: "I'd recommend starting with an AI Insights widget to surface key trends across your data.",
    widgetType: "ai-insights",
  };
}

/* ------------------------------------------------------------------ */
/*  WidgetDrawer                                                       */
/* ------------------------------------------------------------------ */

export interface WidgetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: string;
  currentWidgets: WidgetConfig[];
  onAddWidget: (widget: WidgetConfig) => void;
}

let widgetIdCounter = 100;
function nextWidgetId(): string {
  return `w-drawer-${widgetIdCounter++}`;
}

export function WidgetDrawer({
  open,
  onOpenChange,
  module,
  currentWidgets,
  onAddWidget,
}: WidgetDrawerProps) {
  const [category, setCategory] = React.useState<CategoryFilter>("all");
  const [aiMessages, setAiMessages] = React.useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = React.useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Filter templates by module relevance and category
  const filteredTemplates = WIDGET_TEMPLATES.filter((tpl) => {
    const moduleMatch =
      tpl.modules.includes("all") || tpl.modules.includes(module);
    const categoryMatch = category === "all" || tpl.category === category;
    return moduleMatch && categoryMatch;
  });

  const addedTypes = new Set(currentWidgets.map((w) => w.type));

  const handleAddTemplate = (tpl: WidgetTemplate) => {
    const widget: WidgetConfig = {
      id: nextWidgetId(),
      type: tpl.type,
      title: tpl.label,
      size: tpl.defaultSize,
      module,
    };
    onAddWidget(widget);
    toast.success(`Added "${tpl.label}" to dashboard`);
  };

  const handleAiSend = () => {
    const text = aiInput.trim();
    if (!text) return;

    const userMsg: AiMessage = { role: "user", text };
    const response = getAiResponse(text);
    const suggestedWidget = response.widgetType
      ? WIDGET_TEMPLATES.find((t) => t.type === response.widgetType)
      : undefined;

    const assistantMsg: AiMessage = {
      role: "assistant",
      text: response.text,
      suggestedWidget,
    };

    setAiMessages((prev) => [...prev, userMsg, assistantMsg]);
    setAiInput("");

    // Scroll to bottom after state update
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleAiKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  };

  const handlePromptChip = (prompt: string) => {
    setAiInput(prompt);
    // Auto-send after a brief moment
    const text = prompt.trim();
    const response = getAiResponse(text);
    const suggestedWidget = response.widgetType
      ? WIDGET_TEMPLATES.find((t) => t.type === response.widgetType)
      : undefined;

    setAiMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: response.text, suggestedWidget },
    ]);
    setAiInput("");
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="border-b border-[var(--border)]">
          <DrawerTitle className="text-lg">Customize Dashboard</DrawerTitle>
          <DrawerDescription>
            Add widgets or ask AI to build one for you.
          </DrawerDescription>
        </DrawerHeader>

        <Tabs defaultValue="widgets" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 w-auto justify-start gap-4 bg-transparent p-0">
            <TabsTrigger
              value="widgets"
              className="rounded-none border-b-2 border-transparent px-0 pb-2 text-sm data-[state=active]:border-[var(--mw-yellow-400)] data-[state=active]:bg-transparent data-[state=active]:shadow-none [&>[data-slot=tab-indicator]]:hidden"
            >
              Widgets
            </TabsTrigger>
            <TabsTrigger
              value="ai-builder"
              className="rounded-none border-b-2 border-transparent px-0 pb-2 text-sm data-[state=active]:border-[var(--mw-yellow-400)] data-[state=active]:bg-transparent data-[state=active]:shadow-none [&>[data-slot=tab-indicator]]:hidden"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Builder
            </TabsTrigger>
          </TabsList>

          {/* ---- Widgets tab ---- */}
          <TabsContent value="widgets" className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Category filters */}
            <div className="sticky top-0 z-10 flex gap-2 bg-background pb-3 pt-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={category === opt.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    category === opt.value &&
                      "bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90",
                  )}
                  onClick={() => setCategory(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {/* Widget template grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map((tpl) => {
                const Icon = resolveIcon(tpl.icon);
                const isAdded = addedTypes.has(tpl.type);

                return (
                  <Card
                    key={tpl.type}
                    variant="flat"
                    className={cn(
                      "flex flex-col gap-2 p-3",
                      isAdded && "bg-[var(--neutral-50)]",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {Icon ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-lg)] bg-[var(--neutral-100)]">
                          <Icon className="h-4 w-4 text-[var(--neutral-600)]" strokeWidth={1.5} />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {tpl.label}
                        </p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-tight text-[var(--neutral-500)]">
                      {tpl.description}
                    </p>
                    <div className="mt-auto pt-1">
                      {isAdded ? (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--neutral-400)]">
                          <Check className="h-3 w-3" />
                          Added
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px]"
                          onClick={() => handleAddTemplate(tpl)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ---- AI Builder tab ---- */}
          <TabsContent value="ai-builder" className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
            {/* Chat area */}
            <div className="flex-1 overflow-y-auto pt-3">
              {aiMessages.length === 0 ? (
                <div className="space-y-4 pt-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mw-yellow-400)]/10">
                      <Sparkles className="h-5 w-5 text-[var(--mw-yellow-400)]" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      AI Widget Builder
                    </p>
                    <p className="text-xs text-[var(--neutral-500)]">
                      Describe what you want to see and I'll build a widget for
                      you.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePromptChip(prompt)}
                        className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--neutral-600)] transition-colors hover:border-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-400)]/5"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiMessages.map((msg, i) => (
                    <div key={i}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-[var(--shape-lg)] px-3 py-2 text-sm",
                          msg.role === "user"
                            ? "ml-auto bg-[var(--mw-mirage)] text-white"
                            : "bg-[var(--neutral-50)] text-[var(--neutral-800)]",
                        )}
                      >
                        {msg.text}
                      </div>

                      {/* Suggested widget card from AI */}
                      {msg.suggestedWidget ? (
                        <div className="mt-2 max-w-[85%]">
                          <Card variant="flat" className="p-3">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const Icon = resolveIcon(
                                  msg.suggestedWidget.icon,
                                );
                                return Icon ? (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-lg)] bg-[var(--mw-yellow-400)]/10">
                                    <Icon className="h-4 w-4 text-[var(--mw-yellow-400)]" strokeWidth={1.5} />
                                  </div>
                                ) : null;
                              })()}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground">
                                  {msg.suggestedWidget.label}
                                </p>
                                <p className="text-[11px] text-[var(--neutral-500)]">
                                  {msg.suggestedWidget.defaultSize} size \u00b7{" "}
                                  {msg.suggestedWidget.category}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 h-7 w-full text-xs"
                              onClick={() => {
                                if (msg.suggestedWidget) {
                                  handleAddTemplate(msg.suggestedWidget);
                                }
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add to dashboard
                            </Button>
                          </Card>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="flex items-center gap-2 border-t border-[var(--border)] pt-3">
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={handleAiKeyDown}
                placeholder="Describe a widget..."
                className="flex-1 text-sm"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90"
                onClick={handleAiSend}
                disabled={!aiInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
