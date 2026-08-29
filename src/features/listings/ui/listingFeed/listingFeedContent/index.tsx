import { getCurrentUser } from "@/features/auth/queries";
import { listingFeedFiltersActive } from "@/features/listings/helpers/listingFeedFilters";
import { listListings, listSavedListingIds } from "@/features/listings/queries";

import { EmptyState } from "../emptyState";
import { ListingFeedGrid } from "../listingFeedGrid";
import type { ListingFeedContentProps } from "./type";

export async function ListingFeedContent({ tab, filters }: ListingFeedContentProps) {
  const [{ listings, hasMore }, user, savedListingIds] = await Promise.all([
    listListings(tab, filters),
    getCurrentUser(),
    listSavedListingIds(),
  ]);
  const currentUserId = user?.id ?? null;
  const savedIds = [...savedListingIds];
  const hasListings = listings.length > 0;
  const filteredEmpty = !hasListings && listingFeedFiltersActive(filters);

  if (!hasListings) {
    return <EmptyState tab={tab} filtered={filteredEmpty} />;
  }

  return (
    <ListingFeedGrid
      key={`${tab}:${filters.city ?? ""}:${filters.district ?? ""}:${filters.maxPrice ?? ""}:${filters.rooms ?? ""}:${filters.housingKind ?? ""}`}
      tab={tab}
      filters={filters}
      listings={listings}
      hasMore={hasMore}
      savedListingIds={savedIds}
      currentUserId={currentUserId}
    />
  );
}
