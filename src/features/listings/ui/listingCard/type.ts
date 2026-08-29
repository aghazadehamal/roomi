import type { ListingSummary } from "@/features/listings/model";

export type ListingCardProps = {
  listing: ListingSummary;
  saved?: boolean;
  showSave?: boolean;
};
