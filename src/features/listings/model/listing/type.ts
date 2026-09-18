import { ANY_DISTRICT, isBakuCity } from "../locations";

export enum FeedTab {
  Offer = "offer",
  Seek = "seek",
}

export enum ListingType {
  HomeOffer = "home_offer",
  RoomOffer = "room_offer",
  HomeSeek = "home_seek",
  RoommateSeek = "roommate_seek",
}

export type HousingKind = "apartment" | "house" | "any";

export type BuildingAge = "old" | "new" | "any";

export type ListingSummary = {
  id: string;
  userId: string;
  title: string;
  priceAzn: number;
  city: string;
  district: string;
  rooms: number;
  type: ListingType;
  housingKind: HousingKind;
  buildingAge: BuildingAge;
  floor: number;
  areaSqm: number;
  daysLeft: number;
  photoUrl: string | null;
};

export type ListingDetail = ListingSummary & {
  body: string;
  userId: string;
  genderPref: "any" | "female" | "male";
  photoUrls: string[];
  photos: { id: string; url: string }[];
  status: "active" | "archived" | "closed";
};

export type OwnListing = ListingSummary & {
  status: ListingDetail["status"];
};

export type SavedListing = ListingSummary & {
  status: ListingDetail["status"];
};

export type ListingFeedFilters = {
  city: string | null;
  district: string | null;
  maxPrice: number | null;
  rooms: number | null;
  housingKind: "apartment" | "house" | null;
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  [ListingType.HomeOffer]: "Ev kirayə verirəm",
  [ListingType.RoomOffer]: "Otaq kirayə verirəm",
  [ListingType.HomeSeek]: "Ev axtarıram",
  [ListingType.RoommateSeek]: "Otaq yoldaşı axtarıram",
};

export const GENDER_PREF_LABELS: Record<ListingDetail["genderPref"], string> = {
  any: "Fərqi yoxdur",
  female: "Yalnız qadın",
  male: "Yalnız kişi",
};

export const HOUSING_KIND_LABELS: Record<HousingKind, string> = {
  apartment: "Bina evi",
  house: "Həyət evi",
  any: "Fərqi yoxdur",
};

export const BUILDING_AGE_LABELS: Record<BuildingAge, string> = {
  old: "Köhnə tikili",
  new: "Yeni tikili",
  any: "Fərqi yoxdur",
};

export const OFFER_TYPES: ListingType[] = [
  ListingType.HomeOffer,
  ListingType.RoomOffer,
];

export const SEEK_TYPES: ListingType[] = [
  ListingType.HomeSeek,
  ListingType.RoommateSeek,
];

export function listingShowsRooms(type: ListingType): boolean {
  return type !== ListingType.RoommateSeek;
}

export function listingShowsGender(type: ListingType): boolean {
  return type !== ListingType.HomeSeek;
}

export function listingShowsHousingKind(_type: ListingType): boolean {
  return true;
}

export function listingShowsBuildingDetails(_type: ListingType): boolean {
  return true;
}

export function listingShowsPhotos(type: ListingType): boolean {
  return type === ListingType.HomeOffer || type === ListingType.RoomOffer;
}

export function listingPriceText(priceAzn: number): string {
  return priceAzn <= 0 ? "Fərqi yoxdur" : `${priceAzn} AZN`;
}

export function listingRoomsText(rooms: number): string {
  return rooms <= 0 ? "Fərqi yoxdur" : `${rooms} otaq`;
}

export function listingBuildingAgeText(buildingAge: BuildingAge): string {
  return BUILDING_AGE_LABELS[buildingAge];
}

export function listingFloorText(floor: number, housingKind: HousingKind = "apartment"): string {
  if (floor <= 0) {
    return "Fərqi yoxdur";
  }
  if (housingKind === "house") {
    return `${floor} mərtəbəli`;
  }
  return `${floor}. mərtəbə`;
}

export function listingFloorLabel(housingKind: HousingKind): string {
  return housingKind === "house" ? "Mərtəbə sayı" : "Mərtəbə";
}

export function listingAreaText(areaSqm: number): string {
  return areaSqm <= 0 ? "Fərqi yoxdur" : `${areaSqm} m²`;
}

type ListingProfileMetaInput = {
  type: ListingType;
  city: string;
  district: string;
  priceAzn: number;
  status: ListingDetail["status"];
};

function listingProfileLocation(city: string, district: string): string {
  if (!isBakuCity(city)) {
    return city;
  }
  if (district === ANY_DISTRICT) {
    return city;
  }
  return district;
}

export function listingProfileMeta(listing: ListingProfileMetaInput): string {
  const status = listing.status === "active" ? "Aktiv" : "Arxiv";
  const location = listingProfileLocation(listing.city, listing.district);
  const isSeek = SEEK_TYPES.includes(listing.type);
  const pricePart = isSeek
    ? listing.priceAzn <= 0
      ? "Büdcə: fərqi yoxdur"
      : `Büdcə: ${listing.priceAzn} AZN`
    : listingPriceText(listing.priceAzn);

  return `${status} · ${location} · ${pricePart}`;
}
