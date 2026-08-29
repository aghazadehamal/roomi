import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/siteUrl";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, published_at")
    .eq("status", "active")
    .order("published_at", { ascending: false });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((listing) => ({
    url: `${siteUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.published_at),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...listingRoutes];
}
