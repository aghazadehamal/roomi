import { ListingCard } from "../../listingCard";
import { ListingFeedPagination } from "../listingFeedPagination";
import type { ListingFeedGridProps } from "./type";

const LCP_PRIORITY_COUNT = 3;

export function ListingFeedGrid({
  tab,
  filters,
  listings,
  hasMore,
  savedListingIds,
  currentUserId,
}: ListingFeedGridProps) {
  const savedSet = new Set(savedListingIds);

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing, index) => (
        <li key={listing.id} className="h-full">
          <ListingCard
            listing={listing}
            saved={savedSet.has(listing.id)}
            showSave={Boolean(currentUserId && currentUserId !== listing.userId)}
            priority={index < LCP_PRIORITY_COUNT}
          />
        </li>
      ))}
      <ListingFeedPagination
        tab={tab}
        filters={filters}
        initialOffset={listings.length}
        initialHasMore={hasMore}
        savedListingIds={savedListingIds}
        currentUserId={currentUserId}
      />
    </ul>
  );
}
