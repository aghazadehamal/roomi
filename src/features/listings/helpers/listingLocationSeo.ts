import type { Metadata } from "next";

import type { AzCity, BakuDistrict } from "@/features/listings/model/locations";
import { AZ_CITIES, BAKU_CITY, BAKU_DISTRICTS } from "@/features/listings/model/locations";
import { getSiteUrl } from "@/lib/siteUrl";

const AZ_SLUG_CHARS: Record<string, string> = {
  ə: "e",
  Ə: "e",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
  ş: "sh",
  Ş: "sh",
  ç: "ch",
  Ç: "ch",
  ğ: "g",
  Ğ: "g",
};

export function azLocationSlug(value: string): string {
  const transliterated = [...value]
    .map((char) => AZ_SLUG_CHARS[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return transliterated.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function cityFromSlug(slug: string): AzCity | null {
  for (const city of AZ_CITIES) {
    if (azLocationSlug(city) === slug) {
      return city;
    }
  }
  return null;
}

export function districtFromSlug(slug: string): BakuDistrict | null {
  for (const district of BAKU_DISTRICTS) {
    if (azLocationSlug(district) === slug) {
      return district;
    }
  }
  return null;
}

export function cityKirayePath(city: AzCity): string {
  return `/kiraye/${azLocationSlug(city)}`;
}

export function districtKirayePath(district: BakuDistrict): string {
  return `/kiraye/${azLocationSlug(BAKU_CITY)}/${azLocationSlug(district)}`;
}

export function cityKirayeUrl(city: AzCity): string {
  return `${getSiteUrl()}${cityKirayePath(city)}`;
}

export function districtKirayeUrl(district: BakuDistrict): string {
  return `${getSiteUrl()}${districtKirayePath(district)}`;
}

export function allCityKirayePaths(): string[] {
  return AZ_CITIES.map((city) => cityKirayePath(city));
}

export function allDistrictKirayePaths(): string[] {
  return BAKU_DISTRICTS.map((district) => districtKirayePath(district));
}

export function locationFeedMetadata(
  city: AzCity,
  district: BakuDistrict | null,
): Metadata {
  const location = district ? `${city}, ${district}` : city;
  const title = `Kirayə ev və otaq — ${location}`;
  const description = `${location} üzrə kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.`;
  const url = district ? districtKirayeUrl(district) : cityKirayeUrl(city);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "az_AZ",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function locationJsonLd(
  city: AzCity,
  district: BakuDistrict | null,
): Record<string, unknown> {
  const location = district ? `${city}, ${district}` : city;
  const url = district ? districtKirayeUrl(district) : cityKirayeUrl(city);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Kirayə ev və otaq — ${location}`,
    description: `${location} üzrə kirayə ev, otaq və otaq yoldaşı elanları.`,
    url,
    inLanguage: "az",
    about: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: district ?? city,
        addressCountry: "AZ",
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: "kirayesin.az",
      url: getSiteUrl(),
    },
  };
}
