import type { ChatMessage } from "@/features/chat/model";

export type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  peerId: string;
  peerName: string;
  peerHref: string;
  listingId: string;
  initialMessages: ChatMessage[];
  initialHasOlderMessages?: boolean;
  blocked?: boolean;
  blockedByMe?: boolean;
};
