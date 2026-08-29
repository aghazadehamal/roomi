import { countUnreadMessages, listConversations } from "@/features/chat/queries";
import { ConversationList } from "@/features/chat/ui";

export function MessagesSummaryFallback() {
  return <div className="h-5 w-24 animate-pulse rounded bg-muted" />;
}

export function MessagesListFallback() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl bg-muted ring-1 ring-border">
      <div className="h-20 border-b border-border/70 bg-secondary/40" />
      <div className="h-20 border-b border-border/70 bg-secondary/40" />
      <div className="h-20 bg-secondary/40" />
    </div>
  );
}

export async function MessagesSummary() {
  const [conversations, unreadTotal] = await Promise.all([
    listConversations(),
    countUnreadMessages(),
  ]);

  if (conversations.length === 0) {
    return null;
  }

  const unreadInList = conversations.filter((item) => item.unread).length;
  const unreadCount = unreadTotal > 0 ? unreadTotal : unreadInList;

  return (
    <p className="text-sm text-muted-foreground">
      {unreadCount > 0 ? `${unreadCount} oxunmamış` : `${conversations.length} söhbət`}
    </p>
  );
}

export async function MessagesList() {
  const conversations = await listConversations();
  return <ConversationList conversations={conversations} />;
}
