/**
 * AgentMessage — Individual message bubble for the Agent chat.
 *
 * User messages: right-aligned, neutral styling.
 * Agent messages: left-aligned, purple-accented with gradient border,
 *   distinctive avatar, and simple markdown rendering.
 */

import React from 'react';
import { AgentLogomark } from './AgentLogomark';
import { AgentLogomarkAnimated } from './AgentLogomarkAnimated';
import { motion } from 'motion/react';
import { cn } from '@/components/ui/utils';
import type { AgentMessage as AgentMessageType } from './agent-types';

// ---------------------------------------------------------------------------
// Simple Markdown Renderer
// ---------------------------------------------------------------------------

/**
 * Renders a subset of markdown: **bold**, *italic*, `code`,
 * tables (|...|), and ordered/unordered lists.
 */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection: line starts with |
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={`table-${i}`} lines={tableLines} />);
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Heading: lines starting with ##
    if (line.trim().startsWith('## ')) {
      elements.push(
        <p key={`h-${i}`} className="text-sm font-semibold text-foreground mt-2 mb-1">
          {renderInlineMarkdown(line.trim().replace(/^##\s+/, ''))}
        </p>
      );
      i++;
      continue;
    }

    // Ordered list item: 1. or 2. etc.
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1.5 my-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[13px] leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Unordered list item: - or *
    if (/^[-*]\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1.5 my-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[13px] leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-[13px] leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split on **bold**, *italic*, and `code` patterns
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return (
        <em key={i}>{part.slice(1, -1)}</em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1 py-0.5 rounded bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[12px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/** Render a markdown table from pipe-delimited lines. */
function MarkdownTable({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] =>
    line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);

  const headers = parseRow(lines[0]);

  // Skip separator row (|---|---|)
  const startIdx = lines[1].includes('---') ? 2 : 1;
  const rows = lines.slice(startIdx).map(parseRow);

  return (
    <div className="my-2 overflow-x-auto rounded-lg border border-[var(--neutral-200)] dark:border-[var(--neutral-300)]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[var(--neutral-50)] dark:bg-[var(--neutral-100)]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-2.5 py-1.5 text-left font-medium text-[var(--neutral-600)] dark:text-[var(--neutral-500)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-t border-[var(--neutral-100)] dark:border-[var(--neutral-200)]"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-2.5 py-1.5 text-[var(--neutral-600)] dark:text-[var(--neutral-500)]">
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typing Indicator
// ---------------------------------------------------------------------------

export function AgentTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-start gap-2.5 px-4"
      role="status"
      aria-live="polite"
      aria-label="Agent is responding"
    >
      <div className="shrink-0 mt-0.5">
        <AgentLogomarkAnimated size={20} animating />
      </div>
      <div className="bg-[var(--mw-agent-50)] dark:bg-[var(--mw-agent)]/10 border border-[var(--mw-agent-100)] dark:border-[var(--mw-agent)]/20 rounded-2xl rounded-tl-sm px-4 py-3">
        <p className="text-[13px] text-[var(--neutral-500)] dark:text-[var(--neutral-400)]">
          Thinking…
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface AgentMessageProps {
  message: AgentMessageType;
  index?: number;
}

export function AgentMessageBubble({ message, index = 0 }: AgentMessageProps) {
  const isAgent = message.role === 'agent';

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.25,
        ease: [0.2, 0, 0, 1],
      }}
      className={cn(
        'flex gap-2.5 px-4',
        isAgent ? 'items-start' : 'items-start flex-row-reverse',
      )}
    >
      {/* Avatar */}
      {isAgent ? (
        <div className="shrink-0 mt-0.5">
          <AgentLogomark size={20} />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-xl bg-[var(--mw-mirage)] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[10px] font-medium text-white">You</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] min-w-0',
          isAgent
            ? 'agent-message-bubble'
            : 'user-message-bubble',
        )}
      >
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl',
            isAgent
              ? 'bg-[var(--mw-agent-50)] dark:bg-[var(--mw-agent)]/10 border border-[var(--mw-agent-100)] dark:border-[var(--mw-agent)]/20 rounded-tl-sm text-[var(--neutral-700)] dark:text-[var(--neutral-600)]'
              : 'bg-[var(--mw-mirage)] text-white rounded-tr-sm',
          )}
        >
          {isAgent ? (
            <div className="agent-markdown-content">
              {renderMarkdown(message.content)}
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>
        <p
          className={cn(
            'text-[10px] mt-1 px-1',
            isAgent
              ? 'text-[var(--neutral-400)]'
              : 'text-[var(--neutral-400)] text-right',
          )}
        >
          {timeStr}
        </p>
      </div>
    </motion.div>
  );
}
