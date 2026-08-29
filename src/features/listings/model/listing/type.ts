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

export function listingShowsHousingKind(type: ListingType): boolean {
  return type !== ListingType.RoommateSeek;
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
