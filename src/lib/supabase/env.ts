export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

  // Legacy JWT anon (eyJ…) is required for reliable guest (anon) PostgREST reads.
  // Prefer it over sb_publishable_… when both are set.
  const key =
    (anon.startsWith("eyJ") ? anon : "") ||
    (publishable.startsWith("eyJ") ? publishable : "") ||
    publishable ||
    anon;

  return { url, key };
}
