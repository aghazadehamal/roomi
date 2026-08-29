import type { OwnListing, SavedListing } from "@/features/listings/model";

export type ProfileListingCardProps = {
  listing: OwnListing | SavedListing;
  sideAction?: "manage" | "view";
};
