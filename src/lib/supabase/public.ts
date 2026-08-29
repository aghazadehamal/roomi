import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/** Cookie-free client for public reads (e.g. sitemap). */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();

  if (!url || !key) {
    throw new Error("Supabase mühiti təyin olunmayıb");
  }

  return createSupabaseClient<Database>(url, key);
}
