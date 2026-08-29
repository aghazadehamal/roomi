import type { FeedTab } from "@/features/listings/model";
import type { OwnActiveListing } from "@/features/listings/helpers/activeListingLimit";
import type { ListingFormValues } from "@/features/listings/schema";

export type ListingFormPhoto = {
  id: string;
  url: string;
};

export type ListingFormProps = {
  isAuthenticated: boolean;
  listingId?: string;
  defaultValues?: ListingFormValues;
  existingPhotos?: ListingFormPhoto[];
  tab?: FeedTab;
  loginNext?: string;
  activeListing?: OwnActiveListing | null;
};
