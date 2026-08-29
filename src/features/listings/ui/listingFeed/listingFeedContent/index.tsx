import { listingFeedFiltersActive } from "@/features/listings/helpers/listingFeedFilters";
import { listListings } from "@/features/listings/queries";

import { EmptyState } from "../emptyState";
import { ListingFeedGrid } from "../listingFeedGrid";
import type { ListingFeedContentProps } from "./type";

export async function ListingFeedContent({
  tab,
  filters,
  savedListingIds,
  currentUserId,
}: ListingFeedContentProps) {
  const { listings, hasMore } = await listListings(tab, filters);
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
      initialListings={listings}
      initialHasMore={hasMore}
      savedListingIds={savedListingIds}
      currentUserId={currentUserId}
    />
  );
}
