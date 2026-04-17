/**
 * Prototype user model for persona-driven home dashboard (no backend).
 * Single source for Welcome dashboard, Agent prompts, and CommandPalette behaviour.
 */

export type MockModuleKey =
  | "sell"
  | "plan"
  | "make"
  | "ship"
  | "book"
  | "buy"
  | "control";

/** Mirrors command palette role keys for suggestions and action filtering */
export type CommandPaletteUserRole =
  | "sales"
  | "production"
  | "purchasing"
  | "finance"
  | "shipping"
  | "admin";

export interface MockUserContext {
  displayName: string;
  org: string;
  role: string;
  groups: string[];
  allowedModules: MockModuleKey[];
  primaryModule: MockModuleKey;
  /** Optional avatar image; when omitted, UI uses initials fallback */
  avatarUrl?: string;
  /** Drives CommandPalette suggestions and quick-action visibility */
  commandPaletteRole: CommandPaletteUserRole;
  /** Module labels for palette prioritisation (e.g. "Plan", "Sell") */
  recentModules?: string[];
  /** Tenant/org owner — can edit billing & subscription */
  isOwner: boolean;
}

export const mockUserContext: MockUserContext = {
  displayName: "Alex Morgan",
  org: "Alliance Metal Fabrication",
  role: "Operations manager",
  groups: ["production", "approvals", "shipments"],
  allowedModules: ["sell", "plan", "make", "ship", "book", "buy", "control"],
  primaryModule: "plan",
  avatarUrl: undefined,
  commandPaletteRole: "admin",
  recentModules: ["Plan", "Make", "Ship", "Sell"],
  isOwner: true,
};

/** Two-letter initials from display name */
export function getUserInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    return w.slice(0, 2).toUpperCase();
  }
  const a = parts[0][0] ?? "";
  const b = parts[parts.length - 1][0] ?? "";
  return (a + b).toUpperCase() || "?";
}

/** First word of display name for greetings */
export function greetingFirstName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0];
  return first || displayName;
}
