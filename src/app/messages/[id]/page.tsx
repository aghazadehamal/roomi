import { notFound } from "next/navigation";

import { getConversationThread } from "@/features/chat/queries";
import { ChatThread } from "@/features/chat/ui";
import { getBlockStatus } from "@/features/moderation/actions";

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

  const blockStatus = await getBlockStatus(thread.peerId);

  return (
    <ChatThread
      conversationId={thread.id}
      currentUserId={thread.currentUserId}
      peerId={thread.peerId}
      peerName={thread.peerName}
      peerHref={`/profile/${thread.peerId}`}
      listingId={thread.listingId}
      listingLabel={thread.listingTitle}
      listingHref={`/listings/${thread.listingId}`}
      listingActive={thread.listingActive}
      initialMessages={thread.messages}
      blocked={blockStatus.blocked}
      blockedByMe={blockStatus.blockedByMe}
    />
  );
}
