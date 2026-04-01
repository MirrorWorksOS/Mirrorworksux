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
  assignedTo: string;
  priority: OpportunityPriority;
  stage: OpportunityStage;
  /** Win probability 0–100 (editable in overview). */
  probabilityPercent?: number;
  /** Multi-select tags (filterable). */
  tags?: string[];
}
