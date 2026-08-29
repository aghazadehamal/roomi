export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  peerId: string;
  peerName: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: string | null;
  listingActive: boolean;
  unread: boolean;
};

export type ConversationThread = {
  id: string;
  currentUserId: string;
  peerId: string;
  peerName: string;
  listingId: string;
  listingTitle: string;
  listingActive: boolean;
  messages: ChatMessage[];
  hasOlderMessages: boolean;
};
