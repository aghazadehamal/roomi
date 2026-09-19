import { FeedTab, type ListingFeedFilters } from "@/features/listings/model";
import {
  BAKU_DISTRICTS,
  BAKU_METRO_STATIONS,
  isAzCity,
  isBakuCity,
} from "@/features/listings/model/locations";

export const PRICE_FILTER_OPTIONS = [300, 500, 800, 1000, 1500, 2000] as const;

export const GENDER_FILTER_OPTIONS = ["female", "male", "family"] as const;

export type GenderFilterOption = (typeof GENDER_FILTER_OPTIONS)[number];

export function emptyListingFeedFilters(): ListingFeedFilters {
  return {
    city: null,
    district: null,
    metro: null,
    maxPrice: null,
    rooms: null,
    housingKind: null,
    genderPref: null,
    rentalTerm: null,
  };
}

export function listingFeedFiltersActive(filters: ListingFeedFilters): boolean {
  return (
    filters.city !== null ||
    filters.district !== null ||
    filters.metro !== null ||
    filters.maxPrice !== null ||
    filters.rooms !== null ||
    filters.housingKind !== null ||
    filters.genderPref !== null ||
    filters.rentalTerm !== null
  );
}

export function parseListingFeedFilters(params: {
  city?: string | string[];
  district?: string | string[];
  metro?: string | string[];
  maxPrice?: string | string[];
  rooms?: string | string[];
  housingKind?: string | string[];
  genderPref?: string | string[];
  rentalTerm?: string | string[];
}): ListingFeedFilters {
  const cityValue = firstParam(params.city);
  const city = cityValue && isAzCity(cityValue) ? cityValue : null;

  const districtValue = firstParam(params.district);
  const district =
    districtValue &&
    (BAKU_DISTRICTS as readonly string[]).includes(districtValue) &&
    (!city || isBakuCity(city))
      ? districtValue
      : null;

  const metroValue = firstParam(params.metro);
  const metro =
    metroValue &&
    (BAKU_METRO_STATIONS as readonly string[]).includes(metroValue) &&
    (!city || isBakuCity(city))
      ? metroValue
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

  const genderPrefValue = firstParam(params.genderPref);
  const genderPref =
    genderPrefValue === "female" ||
    genderPrefValue === "male" ||
    genderPrefValue === "family"
      ? genderPrefValue
      : null;

  const rentalTermValue = firstParam(params.rentalTerm);
  const rentalTerm =
    rentalTermValue === "daily" || rentalTermValue === "long_term"
      ? rentalTermValue
      : null;

  return {
    city,
    district,
    metro,
    maxPrice,
    rooms,
    housingKind,
    genderPref,
    rentalTerm,
  };
}

export function listingFeedHref(tab: FeedTab, filters: ListingFeedFilters): string {
  const params = new URLSearchParams();
  if (tab === FeedTab.Seek) {
    params.set("tab", FeedTab.Seek);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  if (filters.district && (!filters.city || isBakuCity(filters.city))) {
    params.set("district", filters.district);
  }
  if (filters.metro && (!filters.city || isBakuCity(filters.city))) {
    params.set("metro", filters.metro);
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
  if (filters.genderPref) {
    params.set("genderPref", filters.genderPref);
  }
  if (filters.rentalTerm) {
    params.set("rentalTerm", filters.rentalTerm);
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
