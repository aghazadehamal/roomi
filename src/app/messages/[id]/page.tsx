import { notFound } from "next/navigation";

import { getConversationThread } from "@/features/chat/queries";
import { ChatThread } from "@/features/chat/ui";

type MessageThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MessageThreadPage({
  params,
}: MessageThreadPageProps) {
  const { id } = await params;
  const thread = await getConversationThread(id);

  if (!thread) {
    notFound();
  }

  return (
    <ChatThread
      conversationId={thread.id}
      currentUserId={thread.currentUserId}
      peerName={thread.peerName}
      peerHref={`/profile/${thread.peerId}`}
      listingLabel={thread.listingTitle}
      listingHref={`/listings/${thread.listingId}`}
      listingActive={thread.listingActive}
      initialMessages={thread.messages}
    />
  );
}
