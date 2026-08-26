import { takePendingProfileName } from "@/features/auth/helpers/pendingName";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

function nameFromMeta(meta: unknown): string {
  if (typeof meta === "string") {
    try {
      return nameFromMeta(JSON.parse(meta) as unknown);
    } catch {
      return "";
    }
  }
  if (typeof meta !== "object" || meta === null) {
    return "";
  }

  const record = meta as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (
      !["name", "full_name", "fullname", "display_name", "displayname"].includes(
        key.toLowerCase(),
      )
    ) {
      continue;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return "";
}

export function nameFromAuthUser(user: {
  user_metadata?: unknown;
  identities?: { identity_data?: unknown }[] | null;
}): string {
  const fromMetadata = nameFromMeta(user.user_metadata);
  if (fromMetadata) {
    return fromMetadata;
  }
  for (const identity of user.identities ?? []) {
    const fromIdentity = nameFromMeta(identity.identity_data);
    if (fromIdentity) {
      return fromIdentity;
    }
  }
  return "";
}

function nameFromAccessToken(token: string): string {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return "";
    }
    const json = Buffer.from(payloadPart, "base64url").toString("utf8");
    const payload: unknown = JSON.parse(json);
    if (typeof payload !== "object" || payload === null) {
      return "";
    }
    const record = payload as Record<string, unknown>;
    return nameFromMeta(record.user_metadata) || nameFromMeta(record);
  } catch {
    return "";
  }
}

export async function ensureCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user: initialUser },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !initialUser) {
    return { user: null, error: "Giriş et." as const, name: "" };
  }

  let user = initialUser;
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData.session?.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("id", user.id)
    .maybeSingle();

  const profileName = profile?.name?.trim() ?? "";
  let name =
    nameFromAuthUser(user) ||
    (sessionUser ? nameFromAuthUser(sessionUser) : "") ||
    (sessionData.session?.access_token
      ? nameFromAccessToken(sessionData.session.access_token)
      : "") ||
    (await takePendingProfileName());

  const { data: synced } = await supabase.rpc("sync_own_profile_name");
  if (typeof synced === "string" && synced.trim().length > 0) {
    name = synced.trim();
  }

  if (profileName.length === 0 && name.length === 0) {
    await supabase.auth.refreshSession();
    const { data: refreshed } = await supabase.auth.getUser();
    const { data: refreshedSession } = await supabase.auth.getSession();
    if (refreshed.user) {
      user = refreshed.user;
      name =
        nameFromAuthUser(user) ||
        (refreshedSession.session?.access_token
          ? nameFromAccessToken(refreshedSession.session.access_token)
          : "");
    }
  }

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      name,
    });

    if (error) {
      return {
        user: null,
        error:
          "Profil yaradıla bilmədi. SQL Editor-də 20260825000002_grants.sql faylını Run et." as const,
        name: "",
      };
    }

    return { user, error: null, name };
  }

  if (name.length > 0 && profileName.length === 0) {
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);
    if (error) {
      return {
        user,
        error: "Ad profilə yazılmadı. Bir az sonra yenə yoxla." as const,
        name,
      };
    }
  }

  return { user, error: null, name: profileName || name };
}
