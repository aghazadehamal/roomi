"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markConversationRead, sendMessage } from "@/features/chat/actions";
import type { ChatMessage } from "@/features/chat/model";
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
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    void markConversationRead(conversationId).then(() => {
      router.refresh();
    });
  }, [conversationId, router]);

  useEffect(() => {
    const last = messages.at(-1);
    if (last && last.senderId !== currentUserId) {
      void markConversationRead(conversationId);
    }
  }, [conversationId, currentUserId, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

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

    setPending(true);
    const result = await sendMessage({ conversationId, body });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    form.reset();
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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col">
      <div className="flex flex-col gap-3">
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
      <div className="flex flex-1 flex-col gap-3 px-1 py-6">
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
                className={cn("flex", mine ? "justify-end" : "justify-start")}
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
        <p className="pt-3 text-sm text-muted-foreground">
          Bu istifadəçi ilə mesajlaşmaq olmaz.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex gap-2 pt-3">
          <Input name="body" placeholder="Mesaj yazın…" autoComplete="off" disabled={pending} />
          <Button type="submit" size="lg" disabled={pending}>
            Göndər
          </Button>
        </form>
      )}
    </div>
  );
}
