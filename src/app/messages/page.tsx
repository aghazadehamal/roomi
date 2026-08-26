import { ConversationList } from "@/features/chat/ui";
import { listConversations } from "@/features/chat/queries";

export default async function MessagesPage() {
  const conversations = await listConversations();
  const unreadCount = conversations.filter((item) => item.unread).length;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight">Mesajlar</h1>
        {conversations.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} oxunmamış`
              : `${conversations.length} söhbət`}
          </p>
        ) : null}
      </div>
      <ConversationList conversations={conversations} />
    </div>
  );
}
