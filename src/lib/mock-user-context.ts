/**
 * Prototype user model for persona-driven home dashboard (no backend).
 */

export type MockModuleKey =
  | "sell"
  | "plan"
  | "make"
  | "ship"
  | "book"
  | "buy"
  | "control";

export interface MockUserContext {
  displayName: string;
  org: string;
  role: string;
  groups: string[];
  allowedModules: MockModuleKey[];
  primaryModule: MockModuleKey;
}

export const mockUserContext: MockUserContext = {
  displayName: "Alex Morgan",
  org: "Alliance Metal Fabrication",
  role: "Operations manager",
  groups: ["production", "approvals", "shipments"],
  allowedModules: ["sell", "plan", "make", "ship", "book", "buy", "control"],
  primaryModule: "plan",
};
