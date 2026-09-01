import type { MetadataRoute } from "next";

import {
  allCityKirayePaths,
  allDistrictKirayePaths,
} from "@/features/listings/helpers/listingLocationSeo";
import { getSiteUrl } from "@/lib/siteUrl";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...allCityKirayePaths().map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...allDistrictKirayePaths().map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  ];

  try {
    const supabase = createPublicClient();
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, published_at")
      .eq("status", "active")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("sitemap listings failed", error.message);
      return staticRoutes;
    }

    const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((listing) => ({
      url: `${siteUrl}/listings/${listing.id}`,
      lastModified: new Date(listing.published_at),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch (caught) {
    console.error("sitemap failed", caught);
    return staticRoutes;
  }
}
