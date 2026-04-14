/**
 * Shared Sell activity types and team mocks — used by SellActivities and opportunity quick-create.
 */

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';

export const TEAM_MEMBERS = ['Sarah Chen', 'James Miller', 'David Park'] as const;

/** Prototype stand-in for the signed-in user until auth is wired */
export const MOCK_CURRENT_USER_NAME: (typeof TEAM_MEMBERS)[number] = 'Sarah Chen';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  task: 'Task',
  note: 'Note',
};
