import { FeedTab, type ListingFeedFilters } from "@/features/listings/model";
import { BAKU_DISTRICTS } from "@/features/listings/schema";

export const PRICE_FILTER_OPTIONS = [300, 500, 800, 1000, 1500, 2000] as const;

export function emptyListingFeedFilters(): ListingFeedFilters {
  return { district: null, maxPrice: null, rooms: null, housingKind: null };
}

export function listingFeedFiltersActive(filters: ListingFeedFilters): boolean {
  return (
    filters.district !== null ||
    filters.maxPrice !== null ||
    filters.rooms !== null ||
    filters.housingKind !== null
  );
}

export function parseListingFeedFilters(params: {
  district?: string | string[];
  maxPrice?: string | string[];
  rooms?: string | string[];
  housingKind?: string | string[];
}): ListingFeedFilters {
  const districtValue = firstParam(params.district);
  const district =
    districtValue && (BAKU_DISTRICTS as readonly string[]).includes(districtValue)
      ? districtValue
      : null;

  const maxPriceValue = Number(firstParam(params.maxPrice));
  const maxPrice =
    PRICE_FILTER_OPTIONS.includes(maxPriceValue as (typeof PRICE_FILTER_OPTIONS)[number])
      ? maxPriceValue
      : null;

  const roomsValue = Number(firstParam(params.rooms));
  const rooms = roomsValue >= 1 && roomsValue <= 4 ? roomsValue : null;

  const housingKindValue = firstParam(params.housingKind);
  const housingKind =
    housingKindValue === "apartment" || housingKindValue === "house"
      ? housingKindValue
      : null;

  return { district, maxPrice, rooms, housingKind };
}

export function listingFeedHref(tab: FeedTab, filters: ListingFeedFilters): string {
  const params = new URLSearchParams();
  if (tab === FeedTab.Seek) {
    params.set("tab", FeedTab.Seek);
  }
  if (filters.district) {
    params.set("district", filters.district);
  }
  if (filters.maxPrice !== null) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.rooms !== null) {
    params.set("rooms", String(filters.rooms));
  }
  if (filters.housingKind) {
    params.set("housingKind", filters.housingKind);
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
