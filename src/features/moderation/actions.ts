"use server";

import { revalidatePath } from "next/cache";

import { ensureCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { areUsersBlocked } from "@/features/moderation/queries";
import { blockUserSchema, reportSchema } from "@/features/moderation/schema";
import { createClient } from "@/lib/supabase/server";

export type ModerationActionResult =
  | { ok: true }
  | { ok: false; error: string };

function grantError(code: string | undefined): string | null {
  if (code === "42501") {
    return "Cədvələ icazə yoxdur. SQL Editor-də 20260825000002_grants.sql faylını Run et.";
  }
  return null;
}

export async function blockUser(blockedId: string): Promise<ModerationActionResult> {
  const parsed = blockUserSchema.safeParse({ blockedId });
  if (!parsed.success) {
    return { ok: false, error: "İstifadəçi tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Bloklamaq üçün giriş et." };
  }

  if (parsed.data.blockedId === ensured.user.id) {
    return { ok: false, error: "Özünü bloklaya bilməzsən." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blocks").insert({
    blocker_id: ensured.user.id,
    blocked_id: parsed.data.blockedId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    const granted = grantError(error.code);
    if (granted) {
      return { ok: false, error: granted };
    }
    return { ok: false, error: "Bloklanmadı. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath("/messages");
  revalidatePath("/profile");
  return { ok: true };
}

export async function unblockUser(blockedId: string): Promise<ModerationActionResult> {
  const parsed = blockUserSchema.safeParse({ blockedId });
  if (!parsed.success) {
    return { ok: false, error: "İstifadəçi tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Bloku götürmək üçün giriş et." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", ensured.user.id)
    .eq("blocked_id", parsed.data.blockedId);

  if (error) {
    const granted = grantError(error.code);
    if (granted) {
      return { ok: false, error: granted };
    }
    return { ok: false, error: "Blok götürülmədi. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath("/messages");
  revalidatePath("/profile");
  return { ok: true };
}

export async function reportContent(input: unknown): Promise<ModerationActionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Şikayəti yoxla.",
    };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Şikayət göndərmək üçün giriş et." };
  }

  const supabase = await createClient();
  let listingId = parsed.data.listingId ?? null;

  if (parsed.data.conversationId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, listing_id, listing_owner_id, guest_id")
      .eq("id", parsed.data.conversationId)
      .maybeSingle();

    if (
      !conversation ||
      (conversation.guest_id !== ensured.user.id &&
        conversation.listing_owner_id !== ensured.user.id)
    ) {
      return { ok: false, error: "Bu söhbətə şikayət etmək olmaz." };
    }

    listingId = conversation.listing_id;
  } else if (listingId) {
    const { data: listing } = await supabase
      .from("listings")
      .select("id, user_id")
      .eq("id", listingId)
      .maybeSingle();

    if (!listing) {
      return { ok: false, error: "Elan tapılmadı." };
    }

    if (listing.user_id === ensured.user.id) {
      return { ok: false, error: "Öz elanına şikayət etmək olmaz." };
    }
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: ensured.user.id,
    listing_id: listingId,
    conversation_id: parsed.data.conversationId ?? null,
    reason: parsed.data.reason,
    body: parsed.data.body?.trim() || null,
  });

  if (error) {
    const granted = grantError(error.code);
    if (granted) {
      return { ok: false, error: granted };
    }
    return { ok: false, error: "Şikayət göndərilmədi. Bir az sonra yenə yoxla." };
  }

  return { ok: true };
}

export async function assertCanMessage(
  userId: string,
  otherUserId: string,
): Promise<string | null> {
  if (await areUsersBlocked(userId, otherUserId)) {
    return "Bu istifadəçi ilə mesajlaşmaq olmaz.";
  }
  return null;
}

export async function getBlockStatus(
  targetUserId: string,
): Promise<{ blocked: boolean; blockedByMe: boolean }> {
  const user = await getCurrentUser();
  if (!user || user.id === targetUserId) {
    return { blocked: false, blockedByMe: false };
  }

  const [blocked, blockedByMe] = await Promise.all([
    areUsersBlocked(user.id, targetUserId),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("blocks")
        .select("blocker_id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", targetUserId)
        .maybeSingle();
      return Boolean(data);
    })(),
  ]);

  return { blocked, blockedByMe };
}
