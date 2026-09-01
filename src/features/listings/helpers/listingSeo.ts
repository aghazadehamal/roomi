import type { Metadata } from "next";

import { listingFeedHref } from "@/features/listings/helpers/listingFeedFilters";
import {
  FeedTab,
  LISTING_TYPE_LABELS,
  type ListingDetail,
  type ListingFeedFilters,
  listingLocationDetailText,
  listingPriceText,
} from "@/features/listings/model";
import { getSiteUrl } from "@/lib/siteUrl";

function feedCanonicalUrl(tab: FeedTab, filters: ListingFeedFilters): string {
  const path = listingFeedHref(tab, filters);
  return path === "/" ? getSiteUrl() : `${getSiteUrl()}${path}`;
}

export function siteJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "kirayesin.az",
        description:
          "Azərbaycanda kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.",
        inLanguage: "az",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "kirayesin.az",
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
      },
    ],
  };
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

export function homeFeedMetadata(tab: FeedTab, filters: ListingFeedFilters): Metadata {
  const locationParts = [filters.city, filters.district].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Azərbaycan";

  const isDefaultLocation = locationParts.length === 0;

  const title =
    tab === FeedTab.Seek
      ? `Ev və otaq axtarışı — ${location}`
      : isDefaultLocation
        ? "Azərbaycanda kirayə ev və otaq platforması"
        : `Kirayə ev və otaq elanları — ${location}`;

  const description =
    tab === FeedTab.Seek
      ? `${location} üzrə ev, otaq və otaq yoldaşı axtarış elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.`
      : isDefaultLocation
        ? "Bakı və Azərbaycanın bütün şəhərlərində kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla."
        : `${location} üzrə kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.`;

  const canonical = feedCanonicalUrl(tab, filters);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "az_AZ",
    },
    alternates: {
      canonical,
    },
  };
}

export function listingMetadata(listing: ListingDetail): Metadata {
  const location = listingLocationDetailText(listing.city, listing.district);
  const typeLabel = LISTING_TYPE_LABELS[listing.type];
  const pricePart = listing.priceAzn > 0 ? ` — ${listingPriceText(listing.priceAzn)}` : "";
  const title = `${listing.title}${pricePart}`;
  const description = truncate(
    `${typeLabel}. ${location}. ${listing.body}`,
    160,
  );
  const url = `${getSiteUrl()}/listings/${listing.id}`;
  const indexed = listing.status === "active";

  return {
    title,
    description,
    robots: indexed ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "az_AZ",
      images: listing.photoUrl
        ? [{ url: listing.photoUrl, alt: listing.title }]
        : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function listingJsonLd(listing: ListingDetail): Record<string, unknown> | null {
  if (listing.status !== "active") {
    return null;
  }

  const url = `${getSiteUrl()}/listings/${listing.id}`;
  const location = listingLocationDetailText(listing.city, listing.district);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: truncate(listing.body, 500),
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressRegion: listing.district,
      addressCountry: "AZ",
    },
  };

  if (listing.photoUrl) {
    data.image = listing.photoUrl;
  }

  if (listing.priceAzn > 0) {
    data.offers = {
      "@type": "Offer",
      price: listing.priceAzn,
      priceCurrency: "AZN",
      availability: "https://schema.org/InStock",
    };
  }

  data.contentLocation = {
    "@type": "Place",
    name: location,
  };

  return data;
}
