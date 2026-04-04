/**
 * AI Feed Types — Shared type definitions for the AI Insight Feed component.
 *
 * Used by AIFeed, AIFeedCard, and module-level mock data.
 */

export type AIFeedModule = 'sell' | 'buy' | 'plan' | 'make' | 'control';

export type AIFeedInsightType =
  | 'call'
  | 'email'
  | 'stock'
  | 'job-risk'
  | 'quote'
  | 'capacity'
  | 'quality'
  | 'machine'
  | 'supplier'
  | 'price';

export type AIFeedPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface AIFeedAction {
  label: string;
  onClick?: () => void;
}

export interface AIFeedInsight {
  id: string;
  module: AIFeedModule;
  type: AIFeedInsightType;
  priority: AIFeedPriority;
  /** Plain text with **bold** markers around entity names/IDs for highlight rendering. */
  message: string;
  timestamp: string;
  actions: AIFeedAction[];
  dismissed?: boolean;
}
