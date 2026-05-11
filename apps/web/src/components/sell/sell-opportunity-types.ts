/**
 * Shared Sell opportunity types — pipeline kanban and full-page detail.
 */

export type OpportunityPriority = "low" | "medium" | "high" | "urgent";

export type OpportunityStage =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Opportunity {
  id: string;
  title: string;
  customer: string;
  value: number;
  expectedClose: string;
  /** Display initials for avatar (e.g. "SC"). */
  assignedTo: string;
  /** Employee id for facet filtering (e.g. "emp-001"). */
  ownerId?: string;
  priority: OpportunityPriority;
  stage: OpportunityStage;
  /** Win probability 0–100 (editable in overview). */
  probabilityPercent?: number;
  /** Multi-select tags (filterable). */
  tags?: string[];
}
