/**
 * PresetMenu — load / save / share saved views.
 *
 * Three scopes shown in sections:
 *   • Personal — owned by the current user
 *   • Team   — shared by a Lead with the user's group
 *   • System — built-in MirrorWorks presets
 *
 * Lead/Admin users can choose "Share with team" when saving. Saving from a
 * loaded preset offers "Update preset" vs "Save as new".
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { Bookmark, Check, MoreVertical, Pin, Plus, Star, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/components/ui/utils";

import type { LucideIcon } from "lucide-react";

import {
  type FilterSchema,
  type FilterState,
  type PresetIconTone,
  type SavedView,
  type SavedViewScope,
} from "./schema";
import {
  canShareWithGroup,
  deletePreset,
  getViewer,
  savePreset,
  setDefaultPreset,
  updatePreset,
  useSavedViews,
} from "./savedViews";

export interface PresetMenuProps {
  schema: FilterSchema;
  state: FilterState;
  onLoad: (preset: SavedView) => void;
  className?: string;
}

export function PresetMenu({ schema, state, onLoad, className }: PresetMenuProps) {
  const views = useSavedViews(schema.module);
  const viewer = getViewer();
  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [editing, setEditing] = useState<SavedView | null>(null);

  const personal = useMemo(() => views.filter((v) => v.scope === "personal" && v.ownerId === viewer.userId), [views, viewer.userId]);
  const team = useMemo(() => views.filter((v) => v.scope === "group"), [views]);
  const system = useMemo(() => views.filter((v) => v.scope === "system"), [views]);

  const active = state.presetId
    ? views.find((v) => v.id === state.presetId)
    : undefined;
  const ActiveIcon = active?.icon;
  const label = active ? active.name : "All";

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--neutral-50)]",
              className,
            )}
          >
            {ActiveIcon ? (
              <PresetIconTile icon={ActiveIcon} tone={active?.iconTone} compact />
            ) : (
              <Bookmark className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            )}
            <span>{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-80 rounded-lg border border-[var(--border)] bg-popover p-0 shadow-lg"
        >
          <div className="max-h-96 overflow-y-auto py-1">
            <SectionHeader>Default</SectionHeader>
            <PresetRow
              name="All"
              icon={Bookmark}
              iconTone="neutral"
              isActive={!state.presetId}
              onClick={() => {
                onLoad({
                  id: "",
                  module: schema.module,
                  name: "All",
                  scope: "personal",
                  ownerId: viewer.userId,
                  state: { values: {}, search: "", view: schema.defaultView },
                  createdAt: "",
                  updatedAt: "",
                });
                setOpen(false);
              }}
            />

            {personal.length > 0 && <SectionHeader>Personal</SectionHeader>}
            {personal.map((v) => (
              <PresetRow
                key={v.id}
                name={v.name}
                icon={v.icon}
                iconTone={v.iconTone}
                emoji={v.emoji}
                isActive={state.presetId === v.id}
                isDefault={v.isDefault}
                onClick={() => {
                  onLoad(v);
                  setOpen(false);
                }}
                onAction={(action) => handlePresetAction(action, v)}
              />
            ))}

            {team.length > 0 && <SectionHeader icon={Users}>Team</SectionHeader>}
            {team.map((v) => (
              <PresetRow
                key={v.id}
                name={v.name}
                icon={v.icon}
                iconTone={v.iconTone}
                emoji={v.emoji}
                isActive={state.presetId === v.id}
                isDefault={v.isDefault}
                subtitle={v.groupName ? `Shared with ${v.groupName}` : undefined}
                onClick={() => {
                  onLoad(v);
                  setOpen(false);
                }}
                onAction={canShareWithGroup(viewer) || v.ownerId === viewer.userId ? (action) => handlePresetAction(action, v) : undefined}
              />
            ))}

            {system.length > 0 && <SectionHeader>System</SectionHeader>}
            {system.map((v) => (
              <PresetRow
                key={v.id}
                name={v.name}
                icon={v.icon}
                iconTone={v.iconTone}
                isActive={state.presetId === v.id}
                onClick={() => {
                  onLoad(v);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <div className="border-t border-[var(--border)] p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => {
                setEditing(null);
                setSaveOpen(true);
                setOpen(false);
              }}
            >
              <Plus className="h-4 w-4" /> Save current view as preset…
            </Button>
            {active && active.scope !== "system" ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => {
                  updatePreset(schema.module, active.id, { state });
                  toast.success(`Updated preset "${active.name}"`);
                  setOpen(false);
                }}
              >
                <Check className="h-4 w-4" /> Update "{active.name}"
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>

      <SavePresetDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        schema={schema}
        state={state}
        editing={editing}
        onSaved={(saved) => onLoad(saved)}
      />
    </>
  );

  function handlePresetAction(action: "default" | "delete" | "edit", v: SavedView) {
    if (action === "default") {
      setDefaultPreset(schema.module, v.id);
      toast.success(`"${v.name}" is now your default`);
    } else if (action === "delete") {
      deletePreset(schema.module, v.id);
      toast.success(`Deleted "${v.name}"`);
      if (state.presetId === v.id) {
        onLoad({
          id: "",
          module: schema.module,
          name: "All",
          scope: "personal",
          ownerId: viewer.userId,
          state: { values: {}, search: "", view: schema.defaultView },
          createdAt: "",
          updatedAt: "",
        });
      }
    } else if (action === "edit") {
      setEditing(v);
      setSaveOpen(true);
    }
  }
}

/* ------------------------------------------------------------------ */

const TONE_CLASSES: Record<PresetIconTone, string> = {
  // Yellow tile = dark text/icon (project memory: yellow bg = dark text)
  yellow: "bg-[var(--mw-yellow-400)] text-foreground",
  info: "bg-[var(--mw-info-light)] text-[var(--mw-info)]",
  success: "bg-[var(--mw-success-light)] text-[var(--mw-success)]",
  warning: "bg-[var(--mw-warning-light)] text-[var(--mw-yellow-800)]",
  error: "bg-[var(--mw-error-light)] text-[var(--mw-error)]",
  neutral: "bg-[var(--neutral-100)] text-[var(--neutral-600)]",
};

function PresetIconTile({
  icon: Icon,
  tone = "neutral",
  compact,
}: {
  icon: LucideIcon;
  tone?: PresetIconTone;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        compact ? "h-5 w-5" : "h-6 w-6",
        TONE_CLASSES[tone],
      )}
      aria-hidden
    >
      <Icon className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={1.75} />
    </span>
  );
}

function SectionHeader({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </div>
  );
}

interface PresetRowProps {
  name: string;
  icon?: LucideIcon;
  iconTone?: PresetIconTone;
  emoji?: string;
  isActive?: boolean;
  isDefault?: boolean;
  subtitle?: string;
  onClick: () => void;
  onAction?: (action: "default" | "delete" | "edit") => void;
}

function PresetRow({ name, icon, iconTone, emoji, isActive, isDefault, subtitle, onClick, onAction }: PresetRowProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-1 px-2 py-1 text-sm transition-colors",
        isActive && "bg-[var(--neutral-50)]",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-[var(--neutral-50)]"
      >
        {icon ? (
          <PresetIconTile icon={icon} tone={iconTone} />
        ) : emoji ? (
          <span className="text-base leading-none">{emoji}</span>
        ) : null}
        <span className="flex-1 truncate">{name}</span>
        {isDefault ? (
          <Star className="h-3.5 w-3.5 fill-[var(--mw-yellow-400)] text-[var(--mw-yellow-500)]" />
        ) : null}
        {isActive ? <Check className="h-4 w-4 text-[var(--mw-yellow-500)]" /> : null}
      </button>
      {onAction ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded p-1 text-[var(--neutral-400)] opacity-0 hover:bg-[var(--neutral-100)] hover:text-foreground group-hover:opacity-100"
              aria-label={`Actions for ${name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction("default")}>
              <Star className="mr-2 h-4 w-4" /> Set as default
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction("delete")} className="text-[var(--mw-error)]">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {subtitle ? (
        <span className="sr-only">{subtitle}</span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface SavePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: FilterSchema;
  state: FilterState;
  editing: SavedView | null;
  onSaved: (saved: SavedView) => void;
}

function SavePresetDialog({ open, onOpenChange, schema, state, onSaved }: SavePresetDialogProps) {
  const viewer = getViewer();
  const canShare = canShareWithGroup(viewer);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<SavedViewScope>("personal");
  const [isDefault, setIsDefault] = useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setScope("personal");
      setIsDefault(false);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give your preset a name");
      return;
    }
    const saved = savePreset({
      module: schema.module,
      name: trimmed,
      state,
      scope,
      isDefault,
    });
    toast.success(scope === "group" ? `Shared "${trimmed}" with ${viewer.groupName ?? "your team"}` : `Saved "${trimmed}"`);
    onSaved(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save view</DialogTitle>
          <DialogDescription>
            Save the current filters and view mode as a preset you can re-load with one click.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="preset-name">Name</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My open opportunities this week"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as SavedViewScope)}
              className="space-y-2"
            >
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--neutral-50)]">
                <RadioGroupItem value="personal" className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Just me</div>
                  <div className="text-xs text-[var(--neutral-500)]">Visible only to you.</div>
                </div>
              </label>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-lg border p-3",
                  canShare ? "border-[var(--border)] hover:bg-[var(--neutral-50)]" : "cursor-not-allowed border-dashed border-[var(--border)] opacity-60",
                )}
              >
                <RadioGroupItem value="group" disabled={!canShare} className="mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Users className="h-3.5 w-3.5" />
                    Share with {viewer.groupName ?? "team"}
                  </div>
                  <div className="text-xs text-[var(--neutral-500)]">
                    {canShare
                      ? "Everyone on your team can load this preset."
                      : "Only Leads and Admins can share presets with a team."}
                  </div>
                </div>
              </label>
            </RadioGroup>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--neutral-300)] accent-[var(--mw-yellow-400)]"
            />
            <Pin className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
            Set as my default for this screen
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={handleSave}
          >
            Save preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
