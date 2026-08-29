"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getUnreadCount } from "@/features/chat/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import type { MessagesNavProps } from "./type";

function conversationFilter(conversationIds: string[]): string | null {
  if (conversationIds.length === 0) {
    return null;
  }
  return `conversation_id=in.(${conversationIds.join(",")})`;
}

export function MessagesNav({
  userId,
  conversationIds,
  initialUnread = 0,
}: MessagesNavProps) {
  const [unread, setUnread] = useState(initialUnread);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function refresh() {
      if (!active || document.visibilityState === "hidden") {
        return;
      }
      const next = await getUnreadCount();
      if (active) {
        setUnread(next);
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    const channel = supabase.channel(`unread:${userId}`);
    const messageFilter = conversationFilter(conversationIds);

    if (messageFilter) {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: messageFilter,
        },
        () => {
          void refresh();
        },
      );
    }

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `guest_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `listing_owner_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [conversationIds, userId]);

  return (
    <Link
      href="/messages"
      aria-label={unread > 0 ? `Mesajlar (${unread} oxunmamış)` : "Mesajlar"}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative size-10 sm:h-11 sm:w-auto sm:gap-2 sm:px-4",
      )}
    >
      <MessageCircle className="size-5" aria-hidden />
      <span className="hidden sm:inline">Mesajlar</span>
      {unread > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
