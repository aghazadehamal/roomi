import type { ChatMessage } from "@/features/chat/model";

export type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  peerId: string;
  peerName: string;
  peerHref: string;
  listingId: string;
  initialMessages: ChatMessage[];
  blocked?: boolean;
  blockedByMe?: boolean;
};
