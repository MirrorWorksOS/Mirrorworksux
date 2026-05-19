/**
 * ChatterSummaryCard — Overview-tab card showing the latest few chatter messages
 * for the current document, with a link to open the full Sheet.
 */

import { useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatterMessage } from './ChatterMessage';
import { useChatterStore } from '@/store/chatterStore';
import { chatterService, type ChatterEntityType } from '@/services/chatterService';

export interface ChatterSummaryCardProps {
  entity: { type: ChatterEntityType; id: string };
  limit?: number;
  className?: string;
}

export function ChatterSummaryCard({ entity, limit = 3, className }: ChatterSummaryCardProps) {
  const openFor = useChatterStore((s) => s.openFor);
  const messagesVersion = useChatterStore((s) => s.messagesVersion);

  const { messages, currentDoc } = useMemo(() => {
    const thread = chatterService.threadForEntity(entity.type, entity.id);
    const all = chatterService.listMessages(thread.id);
    const cur = thread.chain.find((c) => c.type === entity.type && c.id === entity.id)
      ?? { type: entity.type, id: entity.id, label: entity.id };
    return { messages: all.slice(-limit), currentDoc: cur };
  }, [entity.type, entity.id, limit, messagesVersion]);

  return (
    <Card className={className ? className : 'p-6'}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
          Chatter
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-[var(--neutral-500)] hover:text-foreground"
          onClick={() => openFor(entity)}
        >
          Open chatter
        </Button>
      </div>

      {messages.length === 0 ? (
        <p className="py-4 text-center text-xs text-[var(--neutral-500)]">
          No messages yet — open chatter to start a conversation.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <ChatterMessage key={m.id} message={m} currentDocLabel={currentDoc.label} />
          ))}
        </div>
      )}
    </Card>
  );
}
