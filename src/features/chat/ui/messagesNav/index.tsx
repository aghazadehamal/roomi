"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getUnreadCount } from "@/features/chat/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import type { MessagesNavProps } from "./type";

export function MessagesNav({ initialUnread }: MessagesNavProps) {
  const [unread, setUnread] = useState(initialUnread);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    const supabase = createClient();

    async function refresh() {
      const next = await getUnreadCount();
      setUnread(next);
    }

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link href="/messages" className={cn(buttonVariants({ variant: "ghost" }), "relative")}>
      <MessageCircle className="size-5" aria-hidden />
      Mesajlar
      {unread > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
