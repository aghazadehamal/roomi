"use server";

import { revalidatePath } from "next/cache";

import { ensureCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { countUnreadMessages } from "@/features/chat/queries";
import {
  NEW_CONVERSATION_DAILY_CAP,
  markConversationReadSchema,
  sendMessageSchema,
  startConversationSchema,
} from "@/features/chat/schema";
import { createClient } from "@/lib/supabase/server";

export type ChatActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function bakuDayStartIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baku",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}T00:00:00+04:00`;
}

function grantError(code: string | undefined): string | null {
  if (code === "42501") {
    return "Cədvələ icazə yoxdur. SQL Editor-də 20260825000002_grants.sql faylını Run et.";
  }
  return null;
}

export async function startConversation(listingId: string): Promise<ChatActionResult> {
  const parsed = startConversationSchema.safeParse({ listingId });
  if (!parsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Mesaj yazmaq üçün giriş et." };
  }
  const user = ensured.user;
  const supabase = await createClient();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  if (listing.user_id === user.id) {
    return { ok: false, error: "Öz elanına mesaj yazmaq olmaz." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("guest_id", user.id)
    .maybeSingle();

  if (existing) {
    return { ok: true, id: existing.id };
  }

  if (listing.status !== "active") {
    return { ok: false, error: "Bu elan artıq aktiv deyil." };
  }

  const { count, error: countError } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("guest_id", user.id)
    .gte("created_at", bakuDayStartIso());

  if (countError) {
    const granted = grantError(countError.code);
    if (granted) {
      return { ok: false, error: granted };
    }
  }

  if ((count ?? 0) >= NEW_CONVERSATION_DAILY_CAP) {
    return {
      ok: false,
      error: "Bu gün 5 yeni söhbət limitin dolub. Mövcud söhbətlərə cavab yaza bilərsən.",
    };
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listing.id,
      listing_owner_id: listing.user_id,
      guest_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: again } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("guest_id", user.id)
        .maybeSingle();
      if (again) {
        return { ok: true, id: again.id };
      }
    }
    const granted = grantError(error.code);
    if (granted) {
      return { ok: false, error: granted };
    }
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Profil tapılmadı. SQL Editor-də profile_trigger faylını Run et.",
      };
    }
    return { ok: false, error: "Söhbət açıla bilmədi. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${created.id}`);
  return { ok: true, id: created.id };
}

export async function sendMessage(input: unknown): Promise<ChatActionResult> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Mesajı yoxla." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Mesaj yazmaq üçün giriş et." };
  }

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, listing_owner_id, guest_id")
    .eq("id", parsed.data.conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.guest_id !== user.id && conversation.listing_owner_id !== user.id)
  ) {
    return { ok: false, error: "Bu söhbətə yazmaq olmaz." };
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      body: parsed.data.body,
    })
    .select("id")
    .single();

  if (error) {
    const granted = grantError(error.code);
    if (granted) {
      return { ok: false, error: granted };
    }
    return { ok: false, error: "Mesaj getmədi. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversation.id}`);
  revalidatePath("/", "layout");
  return { ok: true, id: message.id };
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const parsed = markConversationReadSchema.safeParse({ conversationId });
  if (!parsed.success) {
    return;
  }

  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, guest_id, listing_owner_id")
    .eq("id", parsed.data.conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.guest_id !== user.id && conversation.listing_owner_id !== user.id)
  ) {
    return;
  }

  const now = new Date().toISOString();
  const patch =
    conversation.guest_id === user.id
      ? { guest_last_read_at: now }
      : { owner_last_read_at: now };

  await supabase.from("conversations").update(patch).eq("id", conversation.id);
  revalidatePath("/messages");
  revalidatePath("/", "layout");
}

export async function getUnreadCount(): Promise<number> {
  return countUnreadMessages();
}
