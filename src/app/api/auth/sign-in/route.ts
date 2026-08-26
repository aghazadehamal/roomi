import { NextResponse } from "next/server";

import { ensureCurrentProfile } from "@/features/auth/queries";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as { email?: unknown }).email !== "string" ||
      typeof (body as { password?: unknown }).password !== "string"
    ) {
      return NextResponse.json({ error: "Email və şifrə lazımdır." }, { status: 400 });
    }

    const { email, password } = body as { email: string; password: string };
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await ensureCurrentProfile();
    return NextResponse.json({ ok: true });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Əməliyyat alınmadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
