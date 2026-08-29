import { getCurrentUser } from "@/features/auth/queries";
import type {
  ChatMessage,
  ConversationSummary,
  ConversationThread,
} from "@/features/chat/model";
import { createClient } from "@/lib/supabase/server";

function displayName(name: string | null | undefined): string {
  const trimmed = name?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : "İstifadəçi";
}

function lastReadAt(
  conversation: {
    guest_id: string;
    listing_owner_id: string;
    guest_last_read_at: string | null;
    owner_last_read_at: string | null;
  },
  userId: string,
): string | null {
  return conversation.guest_id === userId
    ? conversation.guest_last_read_at
    : conversation.owner_last_read_at;
}

function isIncomingUnread(
  createdAt: string,
  senderId: string,
  userId: string,
  readAt: string | null,
): boolean {
  if (senderId === userId) {
    return false;
  }
  if (!readAt) {
    return true;
  }
  return new Date(createdAt).getTime() > new Date(readAt).getTime();
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      "id, listing_id, listing_owner_id, guest_id, created_at, guest_last_read_at, owner_last_read_at",
    )
    .or(`listing_owner_id.eq.${user.id},guest_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error || !conversations || conversations.length === 0) {
    return [];
  }

  const listingIds = [...new Set(conversations.map((row) => row.listing_id))];
  const profileIds = [
    ...new Set(
      conversations.flatMap((row) => [row.listing_owner_id, row.guest_id]),
    ),
  ];
  const conversationIds = conversations.map((row) => row.id);

  const [{ data: listings }, { data: profiles }, { data: messages }] = await Promise.all([
    supabase.from("listings").select("id, title, status").in("id", listingIds),
    supabase.from("profiles").select("id, name").in("id", profileIds),
    supabase
      .from("messages")
      .select("conversation_id, sender_id, body, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const listingById = new Map((listings ?? []).map((row) => [row.id, row]));
  const profileById = new Map((profiles ?? []).map((row) => [row.id, row]));
  const lastByConversation = new Map<
    string,
    { body: string; createdAt: string }
  >();
  for (const message of messages ?? []) {
    if (!lastByConversation.has(message.conversation_id)) {
      lastByConversation.set(message.conversation_id, {
        body: message.body,
        createdAt: message.created_at,
      });
    }
  }

  return conversations
    .map((conversation) => {
      const listing = listingById.get(conversation.listing_id);
      const peerId =
        conversation.guest_id === user.id
          ? conversation.listing_owner_id
          : conversation.guest_id;
      const readAt = lastReadAt(conversation, user.id);
      const unread = (messages ?? []).some(
        (message) =>
          message.conversation_id === conversation.id &&
          isIncomingUnread(message.created_at, message.sender_id, user.id, readAt),
      );
      const last = lastByConversation.get(conversation.id);

      return {
        id: conversation.id,
        peerId,
        peerName: displayName(profileById.get(peerId)?.name),
        listingTitle: listing?.title ?? "Elan",
        lastMessage: last?.body ?? "Hələ mesaj yoxdur",
        lastMessageAt: last?.createdAt ?? conversation.created_at,
        listingActive: listing?.status === "active",
        unread,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
}

export async function getConversationThread(
  conversationId: string,
): Promise<ConversationThread | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id, listing_id, listing_owner_id, guest_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !conversation) {
    return null;
  }

  if (conversation.guest_id !== user.id && conversation.listing_owner_id !== user.id) {
    return null;
  }

  const peerId =
    conversation.guest_id === user.id
      ? conversation.listing_owner_id
      : conversation.guest_id;

  const [{ data: listing }, { data: peer }, { data: messageRows }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, status")
      .eq("id", conversation.listing_id)
      .maybeSingle(),
    supabase.from("profiles").select("id, name").eq("id", peerId).maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  const messages: ChatMessage[] = (messageRows ?? []).map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  }));

  return {
    id: conversation.id,
    currentUserId: user.id,
    peerId,
    peerName: displayName(peer?.name),
    listingId: conversation.listing_id,
    listingTitle: listing?.title ?? "Elan",
    listingActive: listing?.status === "active",
    messages,
  };
}

export async function countUnreadMessages(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) {
    return 0;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("count_unread_messages");

  if (!error && typeof data === "number") {
    return data;
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("id, guest_id, listing_owner_id, guest_last_read_at, owner_last_read_at")
    .or(`listing_owner_id.eq.${user.id},guest_id.eq.${user.id}`);

  if (conversationsError || !conversations || conversations.length === 0) {
    return 0;
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in(
      "conversation_id",
      conversations.map((row) => row.id),
    )
    .neq("sender_id", user.id);

  if (!messages) {
    return 0;
  }

  const readByConversation = new Map(
    conversations.map((row) => [row.id, lastReadAt(row, user.id)]),
  );

  return messages.filter((message) =>
    isIncomingUnread(
      message.created_at,
      message.sender_id,
      user.id,
      readByConversation.get(message.conversation_id) ?? null,
    ),
  ).length;
}
