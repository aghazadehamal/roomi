import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/messages/", "/profile", "/listings/new", "/login"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
