import { NextResponse } from "next/server";

import { AUTO_ARCHIVE_EXPIRED_LISTINGS } from "@/features/listings/schema";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!AUTO_ARCHIVE_EXPIRED_LISTINGS) {
    return NextResponse.json({
      archived: 0,
      skipped: true,
      reason: "AUTO_ARCHIVE_EXPIRED_LISTINGS is false",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("archive_expired_listings");

  if (error) {
    return NextResponse.json(
      {
        error:
          "Arxiv funksiyası yoxdur. SQL Editor-də 20260825000006_archive_expired.sql faylını Run et.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ archived: data ?? 0 });
}
