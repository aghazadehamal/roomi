import { getCurrentUser } from "@/features/auth/queries";
import {
  FeedTab,
  ListingType,
  OFFER_TYPES,
  SEEK_TYPES,
  type ListingDetail,
  type ListingSummary,
  type OwnListing,
  type SavedListing,
  type ListingFeedFilters,
} from "@/features/listings/model";
import { LISTING_FEED_PAGE_SIZE } from "@/features/listings/helpers/listingFeedPagination";
import {
  LISTING_DETAIL_SELECT,
  LISTING_OWN_SELECT,
  LISTING_SUMMARY_SELECT,
  coverPhotoUrl,
  normalizeNestedPhotos,
  sortedListingPhotos,
  type NestedListingPhoto,
} from "@/features/listings/helpers/listingPhotoRows";
import { ANY_DISTRICT, BAKU_CITY } from "@/features/listings/model/locations";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export type ListListingsResult = {
  listings: ListingSummary[];
  hasMore: boolean;
};

const MS_PER_DAY = 86_400_000;

type ListingSummaryRow = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  city: string;
  district: string;
  rooms: number;
  type: string;
  housing_kind: string;
  expires_at: string;
  listing_photos: NestedListingPhoto | NestedListingPhoto[] | null;
};

function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / MS_PER_DAY));
}

function isListingType(value: string): value is ListingType {
  return (Object.values(ListingType) as string[]).includes(value);
}

function isListingStatus(value: string): value is ListingDetail["status"] {
  return value === "active" || value === "archived" || value === "closed";
}

function isGenderPref(value: string): value is ListingDetail["genderPref"] {
  return value === "any" || value === "female" || value === "male";
}

function isHousingKind(value: string): value is ListingDetail["housingKind"] {
  return value === "apartment" || value === "house" || value === "any";
}

function mapSummaryRow(row: ListingSummaryRow): ListingSummary | null {
  if (!isListingType(row.type) || !isHousingKind(row.housing_kind)) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    priceAzn: row.price,
    city: row.city,
    district: row.district,
    rooms: row.rooms,
    type: row.type,
    housingKind: row.housing_kind,
    daysLeft: daysLeft(row.expires_at),
    photoUrl: coverPhotoUrl(row.listing_photos),
  };
}

function mapSummaryRowFromData(row: Omit<ListingSummaryRow, "listing_photos"> & {
  listing_photos: NestedListingPhoto | NestedListingPhoto[] | null;
}): ListingSummary | null {
  return mapSummaryRow({
    ...row,
    listing_photos: normalizeNestedPhotos(row.listing_photos),
  });
}

export async function listListings(
  tab: FeedTab,
  filters: ListingFeedFilters,
  options?: { offset?: number; limit?: number },
): Promise<ListListingsResult> {
  const pageSize = options?.limit ?? LISTING_FEED_PAGE_SIZE;
  const offset = options?.offset ?? 0;
  const types = tab === FeedTab.Seek ? SEEK_TYPES : OFFER_TYPES;
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(LISTING_SUMMARY_SELECT)
    .eq("status", "active")
    .in("type", types);

  if (filters.city) {
    query = query.eq("city", filters.city);
  }

  if (filters.district) {
    query = query.eq("city", BAKU_CITY);
    query = query.in("district", [filters.district, ANY_DISTRICT]);
  }

  if (filters.maxPrice !== null) {
    query = query.or(`price.lte.${filters.maxPrice},price.eq.0`);
  }

  if (filters.rooms !== null) {
    query = query.neq("type", ListingType.RoommateSeek);
    const roomMatch =
      filters.rooms >= 4 ? "rooms.gte.4" : `rooms.eq.${filters.rooms}`;
    query = query.or(
      `${roomMatch},and(type.eq.${ListingType.HomeSeek},rooms.eq.0)`,
    );
  }

  if (filters.housingKind) {
    query = query.in("housing_kind", [filters.housingKind, "any"]);
  }

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .range(offset, offset + pageSize);

  if (error) {
    console.error("listListings failed", error.message);
    return { listings: [], hasMore: false };
  }

  if (!data) {
    return { listings: [], hasMore: false };
  }

  const hasMore = data.length > pageSize;
  const rows = hasMore ? data.slice(0, pageSize) : data;
  const listings = rows.flatMap((row) => {
    const summary = mapSummaryRowFromData(row);
    return summary ? [summary] : [];
  });

  return { listings, hasMore };
}

export const getListing = cache(async (id: string): Promise<ListingDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data;

  if (
    !isListingType(row.type) ||
    !isGenderPref(row.gender_pref) ||
    !isHousingKind(row.housing_kind) ||
    !isListingStatus(row.status)
  ) {
    return null;
  }

  const listingPhotos = sortedListingPhotos(row.listing_photos);
  const photoUrls = listingPhotos.map((photo) => photo.url);

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    priceAzn: row.price,
    city: row.city,
    district: row.district,
    rooms: row.rooms,
    type: row.type,
    housingKind: row.housing_kind,
    genderPref: row.gender_pref,
    daysLeft: row.status === "active" ? daysLeft(row.expires_at) : 0,
    photoUrl: photoUrls[0] ?? null,
    photoUrls,
    photos: listingPhotos,
    status: row.status,
  };
});

export async function listActiveListingsByUser(
  userId: string,
): Promise<ListingSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SUMMARY_SELECT)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.flatMap((row) => {
    const summary = mapSummaryRowFromData(row);
    return summary ? [summary] : [];
  });
}

export async function getOwnActiveListing(): Promise<{ id: string; title: string } | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return { id: data.id, title: data.title };
}

export async function listOwnListings(): Promise<OwnListing[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_OWN_SELECT)
    .eq("user_id", user.id)
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.flatMap((row) => {
    if (
      !isListingType(row.type) ||
      !isListingStatus(row.status) ||
      !isHousingKind(row.housing_kind)
    ) {
      return [];
    }

    return [
      {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
        housingKind: row.housing_kind,
        daysLeft: row.status === "active" ? daysLeft(row.expires_at) : 0,
        photoUrl: coverPhotoUrl(row.listing_photos),
        status: row.status,
      },
    ];
  });
}

export async function listSavedListingIds(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) {
    return new Set();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((row) => row.listing_id));
}

export async function isListingSaved(listingId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  return Boolean(data);
}

export async function listSavedListings(): Promise<SavedListing[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data: savedRows, error: savedError } = await supabase
    .from("saved_listings")
    .select("listing_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (savedError || !savedRows || savedRows.length === 0) {
    return [];
  }

  const listingIds = savedRows.map((row) => row.listing_id);
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_OWN_SELECT)
    .in("id", listingIds);

  if (error || !data) {
    return [];
  }

  const order = new Map(listingIds.map((id, index) => [id, index]));

  return data
    .flatMap((row) => {
      if (
        !isListingType(row.type) ||
        !isListingStatus(row.status) ||
        !isHousingKind(row.housing_kind)
      ) {
        return [];
      }

      return [
        {
          id: row.id,
          userId: row.user_id,
          title: row.title,
          priceAzn: row.price,
          city: row.city,
          district: row.district,
          rooms: row.rooms,
          type: row.type,
          housingKind: row.housing_kind,
          daysLeft: row.status === "active" ? daysLeft(row.expires_at) : 0,
          photoUrl: coverPhotoUrl(row.listing_photos),
          status: row.status,
        },
      ];
    })
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
