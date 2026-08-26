import type { FeedTab, ListingFeedFilters, ListingSummary } from "@/features/listings/model";

export type ListingFeedProps = {
  tab: FeedTab;
  listings: ListingSummary[];
  filters: ListingFeedFilters;
};
