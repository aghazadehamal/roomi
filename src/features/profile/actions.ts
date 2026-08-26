"use server";

import { revalidatePath } from "next/cache";

import { ensureCurrentProfile } from "@/features/auth/queries";
import { profileFormSchema } from "@/features/profile/schema";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProfile(input: unknown): Promise<UpdateProfileResult> {
  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Formu yoxla.";
    return { ok: false, error: first };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Adı dəyişmək üçün giriş et." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name })
    .eq("id", ensured.user.id);

  if (error) {
    return { ok: false, error: "Ad yadda saxlanılmadı. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/profile");
  revalidatePath(`/profile/${ensured.user.id}`);
  revalidatePath("/messages");
  return { ok: true };
}
