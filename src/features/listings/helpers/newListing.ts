import { FeedTab, ListingType, SEEK_TYPES } from "@/features/listings/model";

export function newListingHref(tab: FeedTab): string {
  return tab === FeedTab.Seek ? `/listings/new?tab=${FeedTab.Seek}` : "/listings/new";
}

export function listingTypeForFeedTab(tab: FeedTab): ListingType {
  return tab === FeedTab.Seek ? ListingType.HomeSeek : ListingType.HomeOffer;
}

export function feedTabFromParam(tab: string | string[] | undefined): FeedTab {
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value === FeedTab.Seek ? FeedTab.Seek : FeedTab.Offer;
}

export function feedTabForListingType(type: ListingType): FeedTab {
  return SEEK_TYPES.includes(type) ? FeedTab.Seek : FeedTab.Offer;
}
