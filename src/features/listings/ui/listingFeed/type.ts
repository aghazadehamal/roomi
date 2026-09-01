import type { FeedTab, ListingFeedFilters } from "@/features/listings/model";
import type { ReactNode } from "react";

export type ListingFeedShellProps = {
  tab: FeedTab;
  filters: ListingFeedFilters;
  children: ReactNode;
  heading?: string;
  intro?: string;
};
