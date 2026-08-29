"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markConversationRead, sendMessage } from "@/features/chat/actions";
import type { ChatMessage } from "@/features/chat/model";
import {
  CONTACT_INFO_CHAT_WARNING,
  containsContactInfo,
} from "@/features/moderation/helpers/contactInfo";
import { ModerationActions } from "@/features/moderation/ui";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import type { ChatThreadProps } from "./type";

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.senderId === "string" &&
    typeof row.body === "string" &&
    typeof row.createdAt === "string"
  );
}

function fromRealtime(value: unknown): ChatMessage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const mapped = {
    id: row.id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
  return isChatMessage(mapped) ? mapped : null;
}

export function ChatThread({
  conversationId,
  currentUserId,
  peerId,
  peerName,
  peerHref,
  listingId,
  initialMessages,
  blocked = false,
  blockedByMe = false,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    void markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const last = messages.at(-1);
    if (last && last.senderId !== currentUserId) {
      void markConversationRead(conversationId);
    }
  }, [conversationId, currentUserId, messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const el = container;

    function onScroll() {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distanceFromBottom < 96;
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!stickToBottomRef.current) {
      return;
    }

    bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [messages, conversationId]);

  useEffect(() => {
    stickToBottomRef.current = true;
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const next = fromRealtime(payload.new);
          if (!next) {
            return;
          }
          setMessages((current) => {
            if (current.some((message) => message.id === next.id)) {
              return current;
            }
            return [...current, next];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    if (!body) {
      return;
    }

    if (containsContactInfo(body) && !window.confirm(CONTACT_INFO_CHAT_WARNING)) {
      return;
    }

    setPending(true);
    const result = await sendMessage({ conversationId, body });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    form.reset();
    stickToBottomRef.current = true;
    setMessages((current) => {
      if (current.some((message) => message.id === result.id)) {
        return current;
      }
      return [
        ...current,
        {
          id: result.id,
          senderId: currentUserId,
          body,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] w-full max-w-2xl flex-col overflow-hidden md:h-[calc(100dvh-9rem)]">
      <div className="shrink-0 flex flex-col gap-3">
        <Link href={peerHref} className="py-3 font-heading text-2xl">
          {peerName}
        </Link>
        <ModerationActions
          targetUserId={peerId}
          listingId={listingId}
          conversationId={conversationId}
          blockedByMe={blockedByMe}
        />
      </div>
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-1 py-6"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            İlk mesajı yaz. Razılaşanda nömrə və ya Instagram paylaşa bilərsən.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn("mb-3 flex", mine ? "justify-end" : "justify-start")}
              >
                <p
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-base",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-card shadow-sm ring-1 ring-border",
                  )}
                >
                  {message.body}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {blocked ? (
        <p className="shrink-0 pt-3 text-sm text-muted-foreground">
          Bu istifadəçi ilə mesajlaşmaq olmaz.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="shrink-0 flex gap-2 border-t border-border/70 bg-background pt-3">
          <Input name="body" placeholder="Mesaj yazın…" autoComplete="off" disabled={pending} />
          <Button type="submit" size="lg" disabled={pending}>
            Göndər
          </Button>
        </form>
      )}
    </div>
  );
}
