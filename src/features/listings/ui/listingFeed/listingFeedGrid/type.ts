import type { FeedTab, ListingFeedFilters, ListingSummary } from "@/features/listings/model";

export type ListingFeedGridProps = {
  tab: FeedTab;
  filters: ListingFeedFilters;
  initialListings: ListingSummary[];
  initialHasMore: boolean;
  savedListingIds: string[];
  currentUserId: string | null;
};
