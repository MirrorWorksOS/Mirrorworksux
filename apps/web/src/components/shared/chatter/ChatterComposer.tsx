/**
 * ChatterComposer — message composer with @mention autocomplete + emoji popover.
 *
 * Intentionally lightweight:
 *  - <textarea> with auto-grow (no rich-text dep)
 *  - mention popover appears after `@` and filters as user types
 *  - emoji popover uses a curated 64-emoji palette (no new dep)
 *  - Enter sends, Shift+Enter newline
 */

import { useLayoutEffect, useRef, useState } from 'react';
import { Paperclip, Send, Smile, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { chatterService } from '@/services/chatterService';

const EMOJI_PALETTE = [
  '👍', '👎', '✅', '❌', '🎉', '🔥', '✨', '🚀',
  '👀', '💯', '🙏', '🙌', '👏', '💡', '⚠️', '🔧',
  '🛠️', '⚙️', '🔩', '⛔', '🛑', '⏱️', '⏰', '📅',
  '📦', '📋', '📝', '📎', '📞', '✉️', '📤', '📥',
  '💪', '🤝', '🤔', '🧐', '😀', '😅', '😎', '😊',
  '😬', '🥲', '🥹', '🤷', '👋', '💬', '💭', '❓',
  '❗', '➡️', '⬅️', '⬆️', '⬇️', '🔄', '🆕', '🆗',
  '🟢', '🟡', '🔴', '⚪', '⚫', '🟦', '🟨', '🟧',
];

interface MentionMatch {
  startIndex: number;
  query: string;
}

function detectMention(value: string, caret: number): MentionMatch | null {
  // Look backwards from caret for an unclosed `@token`.
  let i = caret - 1;
  while (i >= 0) {
    const ch = value[i];
    if (ch === '@') {
      const before = i === 0 ? ' ' : value[i - 1];
      if (/\s/.test(before)) {
        return { startIndex: i, query: value.slice(i + 1, caret) };
      }
      return null;
    }
    if (/\s/.test(ch) || ch === '@') return null;
    i--;
  }
  return null;
}

export interface ChatterComposerProps {
  initialBody?: string;
  onChangeBody?: (body: string) => void;
  onSend: (draft: { body: string; mentions: string[] }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatterComposer({
  initialBody = '',
  onChangeBody,
  onSend,
  placeholder = 'Write a message — @mention to notify someone',
  disabled,
}: ChatterComposerProps) {
  const [body, setBody] = useState(initialBody);
  const [mentions, setMentions] = useState<string[]>([]);
  const [mention, setMention] = useState<MentionMatch | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a cap.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [body]);

  const updateBody = (next: string, caret?: number) => {
    setBody(next);
    setMention(detectMention(next, caret ?? next.length));
    // Notify parent synchronously — no effect-mirror to avoid render loops.
    onChangeBody?.(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBody(e.target.value, e.target.selectionStart ?? undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape' && mention) {
      setMention(null);
    }
  };

  const insertAtCaret = (text: string) => {
    const el = textareaRef.current;
    if (!el) {
      updateBody(body + text);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? start;
    const next = body.slice(0, start) + text + body.slice(end);
    updateBody(next, start + text.length);
    // Reset caret after React re-render.
    requestAnimationFrame(() => {
      const pos = start + text.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const pickMention = (emp: { id: string; name: string }) => {
    if (!mention) return;
    const before = body.slice(0, mention.startIndex);
    const after = body.slice(mention.startIndex + 1 + mention.query.length);
    const next = `${before}@${emp.name} ${after}`;
    updateBody(next, before.length + emp.name.length + 2);
    setMentions((m) => Array.from(new Set([...m, emp.id])));
    setMention(null);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      const pos = before.length + emp.name.length + 2;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const pickEmoji = (emoji: string) => {
    insertAtCaret(emoji);
    setEmojiOpen(false);
  };

  const handleSend = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSend({ body: trimmed, mentions });
    setBody('');
    setMentions([]);
    setMention(null);
    onChangeBody?.('');
  };

  const mentionCandidates = mention ? chatterService.searchMentionables(mention.query, 6) : [];

  return (
    <div className="border-t border-[var(--border)] bg-[var(--card)] p-3">
      {/* Mention popover */}
      {mention && mentionCandidates.length > 0 && (
        <div
          className="mb-2 max-h-48 overflow-y-auto rounded-md border border-[var(--border)] bg-popover shadow-lg"
          role="listbox"
          aria-label="Mention suggestions"
        >
          {mentionCandidates.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => pickMention(emp)}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-[var(--neutral-100)]"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-[10px] font-medium text-white">
                {emp.initials}
              </span>
              <span className="font-medium text-foreground">{emp.name}</span>
              <span className="text-[var(--neutral-500)]">· {emp.role}</span>
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={body}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'w-full resize-none rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground placeholder:text-[var(--neutral-400)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--mw-yellow-400)]/40 focus:border-[var(--mw-yellow-400)]',
          'min-h-[44px] max-h-[160px]',
        )}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertAtCaret('@')}
            aria-label="Mention someone"
            title="Mention"
            disabled={disabled}
          >
            <AtSign className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
          </Button>
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Emoji"
                title="Emoji"
                disabled={disabled}
              >
                <Smile className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              className="w-64 p-2"
              aria-label="Pick an emoji"
            >
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_PALETTE.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => pickEmoji(e)}
                    className="rounded p-1 text-base hover:bg-[var(--neutral-100)]"
                    aria-label={`Insert ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Attach file"
            title="Attach (coming soon)"
            disabled
          >
            <Paperclip className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || !body.trim()}
          className={cn(
            'h-9 gap-1.5 px-3',
            'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]',
            'disabled:bg-[var(--neutral-100)] disabled:text-[var(--neutral-400)]',
          )}
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
          Send
        </Button>
      </div>
    </div>
  );
}
