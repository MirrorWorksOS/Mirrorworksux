/**
 * useChatterFollow — convenience hook for any detail page that needs a Chatter trigger.
 *
 * Returns the thread id, current unread count, and an opener bound to the
 * given entity. Re-renders when messages arrive (via store subscription).
 */

import { useMemo } from 'react';
import { useChatterStore } from '@/store/chatterStore';
import { chatterService, type ChatterEntityType } from '@/services/chatterService';

export interface UseChatterFollowResult {
  threadId: string;
  unreadCount: number;
  open: () => void;
}

export function useChatterFollow(entity: {
  type: ChatterEntityType;
  id: string;
}): UseChatterFollowResult {
  const openFor = useChatterStore((s) => s.openFor);
  const lastReadAt = useChatterStore((s) => s.lastReadAt);
  const messagesVersion = useChatterStore((s) => s.messagesVersion);

  return useMemo(() => {
    const thread = chatterService.threadForEntity(entity.type, entity.id);
    const cursor = lastReadAt[thread.id];
    const msgs = chatterService.listMessages(thread.id);
    const unreadCount = cursor
      ? msgs.filter((m) => m.createdAt > cursor).length
      : msgs.length;
    return {
      threadId: thread.id,
      unreadCount,
      open: () => openFor(entity),
    };
    // messagesVersion bumps when new messages are posted.
  }, [entity.type, entity.id, openFor, lastReadAt, messagesVersion]);
}
