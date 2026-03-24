/**
 * Step 8 — Team group review and AI-assisted assignment.
 */
import { useEffect, useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { bridgeService } from '@/services/bridgeService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfidenceDot } from '@/components/shared/ConfidenceDot';
import { cn } from '@/components/ui/utils';
import {
  ChevronDown,
  Users,
  CheckCircle,
  Loader2,
  BarChart3,
  Wrench,
  Truck,
  Calculator,
  Settings,
  ClipboardList,
  ShoppingCart,
} from 'lucide-react';

const MODULE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  sell: { icon: <BarChart3 className="w-4 h-4" />, color: 'text-blue-600' },
  plan: { icon: <ClipboardList className="w-4 h-4" />, color: 'text-purple-600' },
  make: { icon: <Wrench className="w-4 h-4" />, color: 'text-orange-600' },
  ship: { icon: <Truck className="w-4 h-4" />, color: 'text-green-600' },
  book: { icon: <Calculator className="w-4 h-4" />, color: 'text-red-600' },
  buy: { icon: <ShoppingCart className="w-4 h-4" />, color: 'text-teal-600' },
  control: { icon: <Settings className="w-4 h-4" />, color: 'text-gray-600' },
};

export function StepTeamSetup() {
  const { sessionId, moduleGroups, setModuleGroups, teamSuggestions, setTeamSuggestions } = useBridge();
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await bridgeService.suggestGroups(sessionId || '');
      setModuleGroups(result.groups);
      setTeamSuggestions(result.suggestions);
      setLoading(false);
    }
    load();
  }, []);

  const handleAccept = (employeeId: string) => {
    setAccepted((prev) => new Set(prev).add(employeeId));
  };

  const handleAcceptAll = () => {
    setAccepted(new Set(teamSuggestions.map((s) => s.employeeId)));
  };

  const handleFinish = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Setting up your team...</h2>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">AI is analysing roles and suggesting assignments...</span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section A: Team groups */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Your team groups</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review the default groups for each module. You can rename or add groups.
          </p>
        </div>

        <div className="grid gap-3">
          {Object.entries(moduleGroups).map(([module, groups]) => {
            const meta = MODULE_META[module] || MODULE_META.control;
            return (
              <Collapsible key={module}>
                <CollapsibleTrigger className="flex items-center gap-3 w-full rounded-xl border p-4 hover:bg-muted/50 transition-colors text-left">
                  <span className={cn('shrink-0', meta.color)}>{meta.icon}</span>
                  <span className="font-medium text-sm capitalize flex-1">{module}</span>
                  <Badge variant="secondary" className="text-xs">{groups.length} groups</Badge>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-11 pt-2 space-y-1">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between text-sm py-1.5">
                      <span>{group.name}</span>
                      <span className="text-xs text-muted-foreground">{group.description}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      {/* Section B: Team assignments */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Assign your team</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI has suggested module assignments based on imported job titles.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAcceptAll}>
            Accept all
          </Button>
        </div>

        <div className="space-y-2">
          {teamSuggestions.map((suggestion) => {
            const isAccepted = accepted.has(suggestion.employeeId);
            const topSuggestion = suggestion.suggestions[0];
            const meta = MODULE_META[topSuggestion?.module] || MODULE_META.control;

            return (
              <div
                key={suggestion.employeeId}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-colors',
                  isAccepted && 'bg-green-50 border-green-200'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{suggestion.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.importedTitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  {topSuggestion && (
                    <>
                      <Badge variant="outline" className={cn('text-xs gap-1', meta.color)}>
                        {meta.icon}
                        {topSuggestion.module}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{topSuggestion.groupName}</span>
                      <ConfidenceDot confidence={topSuggestion.confidence} />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAccepted ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accepted
                    </span>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleAccept(suggestion.employeeId)}
                      >
                        Accept
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        Edit
                      </Button>
                    </>
                  )}
                </div>

                {topSuggestion && (
                  <p className="hidden xl:block text-xs text-muted-foreground max-w-[200px]">
                    {topSuggestion.reasoning}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Team setup summary</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(moduleGroups).map(([module, groups]) => {
            const meta = MODULE_META[module] || MODULE_META.control;
            const assigned = teamSuggestions.filter(
              (s) => accepted.has(s.employeeId) && s.suggestions.some((sg) => sg.module === module)
            ).length;
            return (
              <Card key={module} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={meta.color}>{meta.icon}</span>
                  <span className="font-medium text-sm capitalize">{module}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {groups.length} groups, {assigned} members assigned
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          I'll do this later
        </button>
        <Button
          onClick={handleFinish}
          className="bg-[#FFCF4B] text-[#191406] hover:bg-[#FFCF4B]/90 font-medium px-8"
        >
          Confirm & finish
        </Button>
      </div>
    </div>
  );
}
