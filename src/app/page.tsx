import type { Metadata } from "next";

import { getCurrentUser } from "@/features/auth/queries";
import { parseListingFeedFilters } from "@/features/listings/helpers/listingFeedFilters";
import { homeFeedMetadata } from "@/features/listings/helpers/listingSeo";
import { feedTabFromParam } from "@/features/listings/helpers/newListing";
import { listListings, listSavedListingIds } from "@/features/listings/queries";
import { ListingFeed } from "@/features/listings/ui";

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
  const [listingsResult, user, savedListingIds] = await Promise.all([
    listListings(tab, filters),
    getCurrentUser(),
    listSavedListingIds(),
  ]);

  return (
    <ListingFeed
      tab={tab}
      listings={listingsResult.listings}
      hasMore={listingsResult.hasMore}
      filters={filters}
      savedListingIds={[...savedListingIds]}
      currentUserId={user?.id ?? null}
    />
  );
}
