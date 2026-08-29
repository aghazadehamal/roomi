import { Suspense } from "react";

import { getCurrentUser } from "@/features/auth/queries";
import { parseListingFeedFilters } from "@/features/listings/helpers/listingFeedFilters";
import { homeFeedMetadata } from "@/features/listings/helpers/listingSeo";
import { feedTabFromParam } from "@/features/listings/helpers/newListing";
import { listSavedListingIds } from "@/features/listings/queries";
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
  const [user, savedListingIds] = await Promise.all([
    getCurrentUser(),
    listSavedListingIds(),
  ]);
  const currentUserId = user?.id ?? null;
  const savedIds = [...savedListingIds];

  return (
    <ListingFeedShell tab={tab} filters={filters}>
      <Suspense fallback={<ListingFeedGridSkeleton />}>
        <ListingFeedContent
          tab={tab}
          filters={filters}
          savedListingIds={savedIds}
          currentUserId={currentUserId}
        />
      </Suspense>
    </ListingFeedShell>
  );
}
