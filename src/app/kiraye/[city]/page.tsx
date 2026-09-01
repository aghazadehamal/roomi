import { Suspense } from "react";
import { notFound } from "next/navigation";

import { FeedTab } from "@/features/listings/model";
import { emptyListingFeedFilters } from "@/features/listings/helpers/listingFeedFilters";
import {
  azLocationSlug,
  cityFromSlug,
  locationFeedMetadata,
  locationJsonLd,
} from "@/features/listings/helpers/listingLocationSeo";
import { AZ_CITIES } from "@/features/listings/model/locations";
import { JsonLd } from "@/features/listings/ui";
import {
  ListingFeedContent,
  ListingFeedGridSkeleton,
  ListingFeedShell,
} from "@/features/listings/ui/listingFeed";

import type { Metadata } from "next";

type CityKirayePageProps = {
  params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
  return AZ_CITIES.map((city) => ({ city: azLocationSlug(city) }));
}

export async function generateMetadata({ params }: CityKirayePageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = cityFromSlug(citySlug);
  if (!city) {
    return { title: "Səhifə tapılmadı" };
  }
  return locationFeedMetadata(city, null);
}

export default async function CityKirayePage({ params }: CityKirayePageProps) {
  const { city: citySlug } = await params;
  const city = cityFromSlug(citySlug);
  if (!city) {
    notFound();
  }

  const filters = { ...emptyListingFeedFilters(), city };

  return (
    <>
      <JsonLd data={locationJsonLd(city, null)} />
      <ListingFeedShell
        tab={FeedTab.Offer}
        filters={filters}
        heading={`${city} kirayə ev və otaq elanları`}
        intro={`${city} şəhərində kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.`}
      >
        <Suspense fallback={<ListingFeedGridSkeleton />}>
          <ListingFeedContent tab={FeedTab.Offer} filters={filters} />
        </Suspense>
      </ListingFeedShell>
    </>
  );
}
