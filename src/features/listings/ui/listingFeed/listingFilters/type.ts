import type { ReactNode } from "react";

import type { FeedTab, ListingFeedFilters } from "@/features/listings/model";

export type ListingFiltersProps = {
  tab: FeedTab;
  filters: ListingFeedFilters;
  action?: ReactNode;
};
