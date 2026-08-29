import { createClient } from "@/lib/supabase/server";

export async function areUsersBlocked(
  userId: string,
  otherUserId: string,
): Promise<boolean> {
  if (userId === otherUserId) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  if (error || !data) {
    return false;
  }

  return data.some(
    (row) =>
      (row.blocker_id === userId && row.blocked_id === otherUserId) ||
      (row.blocker_id === otherUserId && row.blocked_id === userId),
  );
}

export async function isBlockedByCurrentUser(
  currentUserId: string,
  targetUserId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("blocker_id")
    .eq("blocker_id", currentUserId)
    .eq("blocked_id", targetUserId)
    .maybeSingle();

  return Boolean(data);
}
