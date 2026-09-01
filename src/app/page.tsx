import { Suspense } from "react";

import { parseListingFeedFilters } from "@/features/listings/helpers/listingFeedFilters";
import { homeFeedMetadata, siteJsonLd } from "@/features/listings/helpers/listingSeo";
import { feedTabFromParam } from "@/features/listings/helpers/newListing";
import { JsonLd } from "@/features/listings/ui";
import {
  ListingFeedContent,
  ListingFeedGridSkeleton,
  ListingFeedShell,
} from "@/features/listings/ui/listingFeed";

import type { Metadata } from "next";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string;
    city?: string;
    district?: string;
    maxPrice?: string;
    rooms?: string;
    housingKind?: string;
  }>;
};

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const tab = feedTabFromParam(params.tab);
  const filters = parseListingFeedFilters(params);
  return homeFeedMetadata(tab, filters);
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const tab = feedTabFromParam(params.tab);
  const filters = parseListingFeedFilters(params);

  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <ListingFeedShell tab={tab} filters={filters}>
        <Suspense fallback={<ListingFeedGridSkeleton />}>
          <ListingFeedContent tab={tab} filters={filters} />
        </Suspense>
      </ListingFeedShell>
    </>
  );
}
