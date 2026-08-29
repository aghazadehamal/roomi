import { NextResponse } from "next/server";

import { setPendingProfileName } from "@/features/auth/helpers/pendingName";
import { ensureCurrentProfile } from "@/features/auth/queries";
import { profileFormSchema } from "@/features/profile/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as { email?: unknown }).email !== "string" ||
      typeof (body as { password?: unknown }).password !== "string" ||
      typeof (body as { name?: unknown }).name !== "string"
    ) {
      return NextResponse.json({ error: "Ad, email və şifrə lazımdır." }, { status: 400 });
    }

    const { email, password, name } = body as {
      email: string;
      password: string;
      name: string;
    };

    const nameParsed = profileFormSchema.safeParse({ name });
    if (!nameParsed.success) {
      return NextResponse.json(
        { error: nameParsed.error.issues[0]?.message ?? "Adı yoxla." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: nameParsed.data.name } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const trimmedName = nameParsed.data.name;
    await setPendingProfileName(trimmedName);

    if (!data.session) {
      return NextResponse.json({ needsEmailConfirm: true });
    }

    if (data.user) {
      await supabase.auth.updateUser({ data: { name: trimmedName } });
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: trimmedName,
      });
    }
    await ensureCurrentProfile();
    return NextResponse.json({ ok: true });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Əməliyyat alınmadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
