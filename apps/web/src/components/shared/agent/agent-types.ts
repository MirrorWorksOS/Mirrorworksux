/**
 * Agent Types — TypeScript definitions for the Agent AI chat system.
 *
 * Agent is MirrorWorks' AI assistant, providing context-aware help
 * across all 7 modules (Sell, Buy, Plan, Make, Ship, Book, Control).
 */

export type AgentModule =
  | 'dashboard'
  | 'sell'
  | 'buy'
  | 'plan'
  | 'make'
  | 'ship'
  | 'book'
  | 'control';

export type MessageRole = 'user' | 'agent';

export type MessageContentType = 'text' | 'table' | 'list' | 'suggestion' | 'email-draft';

/** A single email draft attached to an agent message */
export interface AgentEmailDraft {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** Multi-paragraph email body (mock content) */
  body: string;
  /** PO number this email is following up on */
  relatedPo: string;
  /** Vendor display name for toast + UI */
  vendor: string;
  /** How many days the PO is late, for the chip */
  lateByDays: number;
}

export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /** Optional structured content for richer rendering */
  contentType?: MessageContentType;
  /** Module context at the time the message was sent */
  module?: AgentModule;
  /** Email drafts when contentType === 'email-draft' */
  emailDrafts?: AgentEmailDraft[];
}

export interface AgentConversation {
  id: string;
  title: string;
  messages: AgentMessage[];
  module: AgentModule;
  createdAt: number;
  updatedAt: number;
}

export type AgentPanelSize = 'compact' | 'expanded';

export interface QuickAction {
  label: string;
  prompt: string;
}

/** Module-specific configuration for Agent context */
export interface ModuleContext {
  module: AgentModule;
  label: string;
  description: string;
  quickActions: QuickAction[];
}
