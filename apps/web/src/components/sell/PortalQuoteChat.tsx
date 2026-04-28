/**
 * PortalQuoteChat — Two-party message thread between shop and customer.
 */

import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import type { QuoteMessage } from '@/types/entities';

interface PortalQuoteChatProps {
  messages?: QuoteMessage[];
  quoteId: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

export function PortalQuoteChat({ messages = [], quoteId }: PortalQuoteChatProps) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState(messages);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: QuoteMessage = {
      id: `msg-local-${Date.now()}`,
      quoteId,
      sender: 'customer',
      senderName: 'You',
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setInput('');
    toast.success('Message sent');
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-[var(--border)]">
        <h4 className="text-sm font-medium text-foreground">Messages</h4>
        <p className="text-xs text-[var(--neutral-500)] mt-0.5">{localMessages.length} message{localMessages.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Message list */}
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
        {localMessages.length === 0 && (
          <p className="text-xs text-[var(--neutral-400)] text-center py-4">No messages yet. Start a conversation.</p>
        )}
        {localMessages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              'flex flex-col max-w-[80%]',
              msg.sender === 'customer' ? 'ml-auto items-end' : 'mr-auto items-start',
            )}
          >
            <div
              className={cn(
                'rounded-xl px-3 py-2 text-sm',
                msg.sender === 'customer'
                  ? 'bg-[var(--mw-blue,#3b82f6)] text-white rounded-br-sm'
                  : 'bg-[var(--neutral-100)] text-foreground rounded-bl-sm',
              )}
            >
              {msg.message}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[var(--neutral-400)]">{msg.senderName}</span>
              <span className="text-[10px] text-[var(--neutral-400)]">{formatTime(msg.timestamp)}</span>
            </div>
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex gap-1 mt-1">
                {msg.attachments.map((a, i) => (
                  <span key={i} className="text-[10px] text-[var(--neutral-500)] bg-[var(--neutral-100)] px-1.5 py-0.5 rounded">
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => {
            // TODO(backend): portal.attachments.upload(quoteId, file)
            toast.success('Attachment uploaded');
          }}
        >
          <Paperclip className="w-4 h-4 text-[var(--neutral-400)]" />
        </Button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-[var(--neutral-400)]"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim()}
          className="h-8 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
