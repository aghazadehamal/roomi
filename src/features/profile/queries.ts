import { getCurrentUser, nameFromAuthUser } from "@/features/auth/queries";
import { type Profile } from "@/features/profile/model";
import { profileIdSchema } from "@/features/profile/schema";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

function toProfile(row: {
  id: string;
  name: string;
  city: string;
  created_at: string;
}): Profile {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    createdAt: row.created_at,
  };
}

export const getProfile = cache(async (id: string): Promise<Profile | null> => {
  const parsed = profileIdSchema.safeParse(id);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, city, created_at")
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toProfile(data);
});

export async function getOwnProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return null;
  }

  const name = profile.name.trim() || nameFromAuthUser(user);
  return { ...profile, name };
}
