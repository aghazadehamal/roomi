import type { FeedTab } from "@/features/listings/model";
import type { ListingFormValues } from "@/features/listings/schema";

export type ListingFormProps = {
  isAuthenticated: boolean;
  listingId?: string;
  defaultValues?: ListingFormValues;
  tab?: FeedTab;
  loginNext?: string;
};
