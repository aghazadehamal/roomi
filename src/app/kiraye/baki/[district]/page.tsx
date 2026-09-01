import { Suspense } from "react";
import { notFound } from "next/navigation";

import { FeedTab } from "@/features/listings/model";
import { emptyListingFeedFilters } from "@/features/listings/helpers/listingFeedFilters";
import {
  azLocationSlug,
  districtFromSlug,
  locationFeedMetadata,
  locationJsonLd,
} from "@/features/listings/helpers/listingLocationSeo";
import { BAKU_CITY, BAKU_DISTRICTS } from "@/features/listings/model/locations";
import { JsonLd } from "@/features/listings/ui";
import {
  ListingFeedContent,
  ListingFeedGridSkeleton,
  ListingFeedShell,
} from "@/features/listings/ui/listingFeed";

import type { Metadata } from "next";

type DistrictKirayePageProps = {
  params: Promise<{ district: string }>;
};

export async function generateStaticParams() {
  return BAKU_DISTRICTS.map((district) => ({ district: azLocationSlug(district) }));
}

export async function generateMetadata({
  params,
}: DistrictKirayePageProps): Promise<Metadata> {
  const { district: districtSlug } = await params;
  const district = districtFromSlug(districtSlug);
  if (!district) {
    return { title: "Səhifə tapılmadı" };
  }
  return locationFeedMetadata(BAKU_CITY, district);
}

export default async function DistrictKirayePage({ params }: DistrictKirayePageProps) {
  const { district: districtSlug } = await params;
  const district = districtFromSlug(districtSlug);
  if (!district) {
    notFound();
  }

  const filters = {
    ...emptyListingFeedFilters(),
    city: BAKU_CITY,
    district,
  };

  return (
    <>
      <JsonLd data={locationJsonLd(BAKU_CITY, district)} />
      <ListingFeedShell
        tab={FeedTab.Offer}
        filters={filters}
        heading={`Bakı, ${district} kirayə ev və otaq elanları`}
        intro={`Bakının ${district} rayonunda kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.`}
      >
        <Suspense fallback={<ListingFeedGridSkeleton />}>
          <ListingFeedContent tab={FeedTab.Offer} filters={filters} />
        </Suspense>
      </ListingFeedShell>
    </>
  );
}
