/**
 * Home dashboard Agent — command surface wired to CommandPalette (card + yellow chips).
 */

import * as React from "react";
import { Send } from "lucide-react";
import { AgentLogomark } from "@/components/shared/agent/AgentLogomark";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";
import {
  type MockUserContext,
  type MockModuleKey,
} from "@/lib/mock-user-context";
import {
  dashboardSectionSubtitleClass,
  dashboardSectionTitleClass,
  mwAgentChipClass,
  mwHairlineBorder,
  mwSubtleHoverTransition,
  mwSuggestionLabelClass,
} from "@/lib/dashboard-ui";
import { BorderGlow } from "@/components/shared/surfaces/BorderGlow";

export interface AgentBarProps {
  user: MockUserContext;
  className?: string;
}

type PromptGroup = { heading: string; prompts: string[] };

function moduleLabel(m: MockModuleKey): string {
  const map: Record<MockModuleKey, string> = {
    sell: "Sell",
    plan: "Plan",
    make: "Make",
    ship: "Ship",
    book: "Book",
    buy: "Buy",
    control: "Control",
  };
  return map[m];
}

function buildPromptGroups(user: MockUserContext): PromptGroup[] {
  const groups: PromptGroup[] = [
    {
      heading: "My work",
      prompts: [
        "Show my open approvals",
        "What needs my sign-off today?",
        "Summarise exceptions for my team",
      ],
    },
  ];

  const primary = moduleLabel(user.primaryModule);
  groups.push({
    heading: `Primary · ${primary}`,
    prompts: [
      `Open ${primary} dashboard`,
      user.primaryModule === "plan"
        ? "Which jobs are at risk this week?"
        : user.primaryModule === "ship"
          ? "List carrier delays and SLA breaches"
          : `Show recent activity in ${primary}`,
    ],
  });

  if (user.groups.includes("shipments") || user.allowedModules.includes("ship")) {
    groups.push({
      heading: "Shipments",
      prompts: [
        "Track SP270226001",
        "Show warehouse picks due today",
      ],
    });
  }

  if (user.groups.includes("production")) {
    groups.push({
      heading: "Production",
      prompts: [
        "Shop floor status and Andon",
        "Laser capacity for the next 7 days",
      ],
    });
  }

  return groups;
}

export function AgentBar({ user, className }: AgentBarProps) {
  const [query, setQuery] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const setPaletteOpen = useCommandPaletteStore((s) => s.setOpen);
  const promptGroups = React.useMemo(() => buildPromptGroups(user), [user]);

  const submitToPalette = React.useCallback(
    (q: string) => {
      setPaletteOpen(true, q.trim());
      textareaRef.current?.blur();
    },
    [setPaletteOpen],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitToPalette(query);
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-2 pb-4 text-left">
        <div className="flex flex-wrap items-center gap-3">
          <AgentLogomark size={32} />
          <span className={dashboardSectionTitleClass}>Agent</span>
        </div>
        <p className={dashboardSectionSubtitleClass}>
          Search modules, run actions, or jump to a record. Results open in the command palette
          (⌘K).
        </p>
      </div>

      <BorderGlow
        borderRadius={24}
        animated
        edgeSensitivity={10}
        glowRadius={36}
        glowIntensity={0.192}
        coneSpread={30}
        fillOpacity={0.132}
        className={cn(
          "shadow-[var(--elevation-2)]",
          "transition-[box-shadow,transform] duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)]",
          "hover:-translate-y-px",
          "focus-within:shadow-[0_0_0_2px_var(--mw-yellow-400-20)] focus-within:translate-y-0",
        )}
      >
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-[var(--shape-2xl)]"
        role="search"
        aria-label="Agent — search MirrorWorks"
      >
        <div className="flex gap-3 p-4 md:p-6">
          <div className="flex min-h-[56px] flex-1 flex-col justify-center pt-0.5">
            <label htmlFor="agent-query" className="sr-only">
              Ask Agent
            </label>
            <textarea
              ref={textareaRef}
              id="agent-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitToPalette(query);
                }
              }}
              rows={2}
              placeholder="Ask Agent anything — jobs, inventory, orders, exceptions…"
              className={cn(
                "w-full min-h-[56px] max-h-[140px] resize-y bg-transparent font-light leading-snug",
                "text-lg text-foreground placeholder:text-muted-foreground sm:text-xl",
                "outline-none",
              )}
            />
          </div>
          <Button
            type="submit"
            className="h-14 min-h-[56px] w-14 shrink-0 self-end rounded-full bg-[var(--mw-yellow-400)] p-0 text-[#2C2C2C] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-500)]"
            aria-label="Open search with this query"
          >
            <Send className="mx-auto h-5 w-5" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>

        <div
          className={cn(
            "border-t border-border px-4 py-4",
            "bg-[var(--neutral-50)] text-foreground",
            "dark:bg-[var(--secondary)]",
          )}
        >
          <p className={cn("mb-3 inline-flex", mwSuggestionLabelClass)}>Suggestions</p>
          <div className="flex flex-col gap-5">
            {promptGroups.map((g) => (
              <div key={g.heading}>
                <p className="mb-2 text-sm font-bold text-foreground">
                  {g.heading}
                </p>
                <div className="flex flex-wrap gap-2">
                  {g.prompts.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => {
                        setQuery(text);
                        submitToPalette(text);
                      }}
                      className={cn(mwAgentChipClass, mwSubtleHoverTransition)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
      </BorderGlow>
    </div>
  );
}
