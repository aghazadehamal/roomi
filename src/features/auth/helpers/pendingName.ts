import { cookies } from "next/headers";

const COOKIE = "roomi_pending_name";

export async function setPendingProfileName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return;
  }

  const store = await cookies();
  store.set(COOKIE, trimmed, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function takePendingProfileName(): Promise<string> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value?.trim() ?? "";
  if (value.length === 0) {
    return "";
  }
  try {
    store.delete(COOKIE);
  } catch {
    return value;
  }
  return value;
}
