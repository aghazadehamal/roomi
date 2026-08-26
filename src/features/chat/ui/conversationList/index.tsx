import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";

import { profileInitials } from "@/features/profile/model";
import { cn } from "@/lib/utils";

import type { ConversationListProps } from "./type";

function messageTimeLabel(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("az-AZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return "Dünən";
  }

  return date.toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "short",
  });
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-card px-8 py-16 text-center shadow-sm ring-1 ring-border">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="size-7" aria-hidden />
        </span>
        <div>
          <p className="font-heading text-2xl tracking-tight">Hələ söhbət yoxdur</p>
          <p className="mt-2 text-muted-foreground">
            Elana girib <span className="font-medium text-foreground">Mesaj yaz</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
      {conversations.map((conversation) => (
        <li key={conversation.id} className="border-b border-border/80 last:border-b-0">
          <Link
            href={`/messages/${conversation.id}`}
            className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary/50 sm:px-6 sm:py-5"
          >
            <span
              className={cn(
                "relative flex size-12 shrink-0 items-center justify-center rounded-2xl font-heading text-lg",
                conversation.unread
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {profileInitials(conversation.peerName)}
              {conversation.unread ? (
                <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-card ring-2 ring-card">
                  <span className="block size-full rounded-full bg-primary" />
                </span>
              ) : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "truncate text-base",
                    conversation.unread ? "font-semibold" : "font-medium",
                  )}
                >
                  {conversation.peerName}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {messageTimeLabel(conversation.lastMessageAt)}
                </span>
              </span>

              <span className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Home className="size-3.5 shrink-0 text-primary/80" aria-hidden />
                <span className="truncate">{conversation.listingTitle}</span>
              </span>

              <span
                className={cn(
                  "mt-1 block truncate text-sm",
                  conversation.unread
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {conversation.lastMessage}
              </span>

              {conversation.listingActive ? null : (
                <span className="mt-2 inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  Elan aktiv deyil
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
