/**
 * OperatorChat — In-context job messages slide-out panel.
 *
 * Uses ShadCN Sheet. Shows messages with timestamp, user name, message text.
 * Compose input at bottom.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { cn } from "@/components/ui/utils";
import { makeService } from "@/services";
import type { OperatorMessage } from "@/types/entities";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface OperatorChatProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function OperatorChat({ jobId, open, onOpenChange }: OperatorChatProps) {
  const [messages, setMessages] = useState<OperatorMessage[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) {
      makeService.getOperatorMessages(jobId).then(setMessages);
    }
  }, [open, jobId]);

  const handleSend = () => {
    if (!draft.trim()) return;

    const newMsg: OperatorMessage = {
      id: `msg-local-${Date.now()}`,
      jobId,
      userId: "emp-current",
      userName: "You",
      message: draft.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    toast.success("Message sent");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[var(--neutral-200)] px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
            Job Chat
            <span className="font-mono text-sm text-muted-foreground">{jobId}</span>
          </SheetTitle>
        </SheetHeader>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet for this job.
            </p>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={staggerItem}
              initial="initial"
              animate="animate"
              className={cn(
                "space-y-1 rounded-[var(--shape-md)] p-3",
                msg.userName === "You"
                  ? "ml-8 bg-[var(--mw-mirage)]/5"
                  : "mr-8 bg-[var(--neutral-100)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {msg.userName}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{msg.message}</p>
            </motion.div>
          ))}
        </div>

        {/* Compose */}
        <div className="border-t border-[var(--neutral-200)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px]"
            />
            <Button
              size="icon"
              className="shrink-0 min-h-[44px] min-w-[44px]"
              disabled={!draft.trim()}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
