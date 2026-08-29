import type { FeedTab, ListingFeedFilters, ListingSummary } from "@/features/listings/model";

export type ListingFeedGridProps = {
  tab: FeedTab;
  filters: ListingFeedFilters;
  listings: ListingSummary[];
  hasMore: boolean;
  savedListingIds: string[];
  currentUserId: string | null;
};
