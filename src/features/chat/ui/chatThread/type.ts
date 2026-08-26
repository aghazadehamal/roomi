import type { ChatMessage } from "@/features/chat/model";

export type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  peerName: string;
  peerHref: string;
  listingLabel: string;
  listingHref: string;
  listingActive: boolean;
  initialMessages: ChatMessage[];
};
