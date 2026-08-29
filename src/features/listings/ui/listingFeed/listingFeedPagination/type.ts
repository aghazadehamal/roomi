import type { FeedTab, ListingFeedFilters } from "@/features/listings/model";

export type ListingFeedPaginationProps = {
  tab: FeedTab;
  filters: ListingFeedFilters;
  initialOffset: number;
  initialHasMore: boolean;
  savedListingIds: string[];
  currentUserId: string | null;
};
