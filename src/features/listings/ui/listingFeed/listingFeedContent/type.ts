import type { FeedTab, ListingFeedFilters } from "@/features/listings/model";

export type ListingFeedContentProps = {
  tab: FeedTab;
  filters: ListingFeedFilters;
  savedListingIds: string[];
  currentUserId: string | null;
};
