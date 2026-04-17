/**
 * Pure helpers for group lifecycle / analysis.
 *
 * Kept resolver-adjacent so any surface (ControlGroups, module Settings,
 * future Admin tooling) can share the same rules.
 */
import { peopleGroups, peopleUsers, type PeopleGroupView } from './people-data';

export interface DeleteGroupDecision {
  canDelete: boolean;
  /** One-line human-readable explanation (shown in a confirm / blocked state) */
  reason: string;
  /** Number of members that would lose the group reference */
  memberCount: number;
  /** True when this is the only group in its module (last-group protection) */
  isLastInModule: boolean;
  /** True when the group is marked as an ARCH 00 default seed */
  isDefault: boolean;
}

/**
 * Decide whether a given group may be deleted.
 *
 * Blocks:
 *   - ARCH 00 default groups (seed identity stays put — create a custom group instead).
 *   - The only group in a module (users would be stranded with no permission source).
 *   - Groups with members still assigned (force-remove members first to make intent explicit).
 */
export function canDeleteGroup(groupId: string): DeleteGroupDecision {
  const group = peopleGroups.find((g) => g.id === groupId);
  if (!group) {
    return { canDelete: false, reason: 'Group not found.', memberCount: 0, isLastInModule: false, isDefault: false };
  }

  const siblings = peopleGroups.filter((g) => g.module === group.module);
  const isLastInModule = siblings.length <= 1;
  const memberCount = group.memberCount;

  if (group.isDefault) {
    return {
      canDelete: false,
      reason: 'ARCH 00 default groups cannot be deleted — disable them or create a custom group instead.',
      memberCount,
      isLastInModule,
      isDefault: true,
    };
  }

  if (isLastInModule) {
    return {
      canDelete: false,
      reason: `This is the only group in ${group.module}. Deleting it would strand every team member — create a replacement first.`,
      memberCount,
      isLastInModule,
      isDefault: false,
    };
  }

  if (memberCount > 0) {
    return {
      canDelete: false,
      reason: `${memberCount} member${memberCount === 1 ? '' : 's'} still belong to this group. Move or remove them first.`,
      memberCount,
      isLastInModule,
      isDefault: false,
    };
  }

  return { canDelete: true, reason: 'Safe to delete — no members, not a default, not the last group in the module.', memberCount, isLastInModule, isDefault: false };
}

export interface GroupOverlap {
  otherGroup: PeopleGroupView;
  sharedMemberIds: string[];
  sharedRatio: number;
}

/**
 * For a given group, return its same-module siblings that share >= threshold
 * of its members. Used to surface "these two groups are basically the same"
 * hints on the Groups directory, where high overlap usually means you meant
 * to merge them (or one is misconfigured).
 *
 * @param threshold 0..1, default 0.5
 */
export function findGroupOverlaps(groupId: string, threshold = 0.5): GroupOverlap[] {
  const group = peopleGroups.find((g) => g.id === groupId);
  if (!group || group.memberIds.length === 0) return [];

  const activeMemberIds = new Set(
    group.memberIds.filter((id) => {
      const user = peopleUsers.find((u) => u.id === id);
      return user?.status !== 'inactive';
    }),
  );

  if (activeMemberIds.size === 0) return [];

  const siblings = peopleGroups.filter((g) => g.module === group.module && g.id !== group.id);

  return siblings
    .map((other) => {
      const shared = other.memberIds.filter((id) => activeMemberIds.has(id));
      const ratio = shared.length / activeMemberIds.size;
      return { otherGroup: other, sharedMemberIds: shared, sharedRatio: ratio };
    })
    .filter((overlap) => overlap.sharedRatio >= threshold && overlap.sharedMemberIds.length > 1)
    .sort((a, b) => b.sharedRatio - a.sharedRatio);
}
