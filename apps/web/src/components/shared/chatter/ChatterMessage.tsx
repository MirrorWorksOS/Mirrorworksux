/**
 * ChatterMessage — single message row in the chatter timeline.
 *
 * Agent + system messages re-use the existing AIInsightMessage / system-row
 * styling rather than rendering as a user bubble.
 */

import { useMemo } from 'react';
import { Paperclip, SmilePlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AIInsightMessage } from '@/components/shared/ai/AIInsightCard';
import { cn } from '@/components/ui/utils';
import { chatterService, type ChatterMessage as ChatterMessageType } from '@/services/chatterService';
import { useChatterStore } from '@/store/chatterStore';

const QUICK_REACTIONS = ['👍', '❤️', '🎉', '🙏', '👀', '🔥', '✅', '❓'];

const CURRENT_USER_ID = 'emp-current';

function formatRelative(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const diffMs = now - t;
  const s = Math.round(diffMs / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Render @mentions inside the body as styled tokens. Falls back to plain text
 * when the body contains no `@` characters.
 */
function renderBody(body: string): React.ReactNode {
  if (!body.includes('@')) return body;
  // Greedy enough for first/last name pairs; conservative enough not to gobble sentences.
  const tokens = body.split(/(@[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('@')) {
      return (
        <span
          key={i}
          className="rounded bg-[var(--mw-yellow-50)] px-1 font-medium text-[var(--mw-mirage)] dark:bg-[var(--mw-yellow-400)]/15 dark:text-foreground"
        >
          {tok}
        </span>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

export interface ChatterMessageProps {
  message: ChatterMessageType;
  /** Hide the "posted on X" badge when reader is on the same document. */
  currentDocLabel?: string;
}

export function ChatterMessage({ message, currentDocLabel }: ChatterMessageProps) {
  const isAgent = message.authorId === 'agent';
  const isSystem = message.authorId === 'system';
  const showPostedOn = currentDocLabel !== message.postedOn.label;
  const time = useMemo(() => formatRelative(message.createdAt), [message.createdAt]);
  const bumpMessagesVersion = useChatterStore((s) => s.bumpMessagesVersion);

  const toggleReaction = (emoji: string) => {
    chatterService.react(message.id, emoji, CURRENT_USER_ID);
    bumpMessagesVersion();
  };

  if (isAgent) {
    return (
      <div>
        {showPostedOn && (
          <p className="mb-1 text-[10px] text-[var(--neutral-400)] tabular-nums">
            posted on {message.postedOn.label}
          </p>
        )}
        <AIInsightMessage timestamp={time}>{message.body}</AIInsightMessage>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)]">
        <span className="flex-1 border-t border-dashed border-[var(--border)]" />
        <span>{message.body}</span>
        <span className="tabular-nums text-[var(--neutral-400)]">{time}</span>
        <span className="flex-1 border-t border-dashed border-[var(--border)]" />
      </div>
    );
  }

  return (
    <div className="group relative flex gap-3">
      <Avatar className="h-8 w-8 border border-[var(--border)] flex-shrink-0">
        <AvatarFallback className="bg-[var(--mw-mirage)] text-white text-xs">
          {initialsOf(message.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-foreground">{message.authorName}</span>
          <span className="text-[10px] tabular-nums text-[var(--neutral-400)]">{time}</span>
          {showPostedOn && (
            <Badge
              variant="outline"
              className={cn(
                'border-[var(--border)] bg-[var(--neutral-50)] px-1.5 py-0 text-[10px]',
                'text-[var(--neutral-500)] dark:bg-[var(--neutral-100)]',
              )}
              title={`Posted on ${message.postedOn.label}`}
            >
              {message.postedOn.label}
            </Badge>
          )}
        </div>
        <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
          {renderBody(message.body)}
        </p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.attachments.map((a) => (
              <a
                key={a.id}
                href={a.url}
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--neutral-50)] px-2 py-1 text-[10px] text-foreground hover:bg-[var(--neutral-100)] dark:bg-[var(--neutral-100)]"
              >
                <Paperclip className="h-3 w-3 text-[var(--neutral-500)]" strokeWidth={1.5} />
                <span className="font-medium">{a.name}</span>
                <span className="tabular-nums text-[var(--neutral-400)]">
                  {(a.size / 1024).toFixed(0)} KB
                </span>
              </a>
            ))}
          </div>
        )}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {Object.entries(message.reactions).map(([emoji, users]) => {
              const mine = users.includes(CURRENT_USER_ID);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleReaction(emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] transition-colors',
                    mine
                      ? 'bg-[var(--mw-yellow-50)] text-[var(--mw-mirage)] ring-1 ring-[var(--mw-yellow-400)] dark:bg-[var(--mw-yellow-400)]/15 dark:text-foreground'
                      : 'bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)]',
                  )}
                  aria-label={`${mine ? 'Remove' : 'Add'} ${emoji} reaction`}
                  aria-pressed={mine}
                >
                  <span>{emoji}</span>
                  <span className="tabular-nums text-[var(--neutral-500)]">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add-reaction affordance. Always present in the DOM for keyboard users;
          faintly visible at rest and brightens on row hover or focus. */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'absolute right-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--neutral-400)] shadow-sm transition-opacity',
              'opacity-40 group-hover:opacity-100 focus-visible:opacity-100',
              'hover:bg-[var(--neutral-100)] hover:text-foreground',
            )}
            aria-label="Add reaction"
            title="Add reaction"
          >
            <SmilePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-auto p-1.5">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(emoji)}
                className="rounded p-1 text-base hover:bg-[var(--neutral-100)]"
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
